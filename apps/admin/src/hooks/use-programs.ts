import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  supabase,
  type Tables,
  type InsertTables,
  type UpdateTables,
} from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { ProgramFormData } from '@/lib/validations/program'
import { programKeys, invoiceKeys, portalKeys, propertyKeys } from '@/lib/queries'

type Program = Tables<'programs'>
type ProgramInsert = InsertTables<'programs'>
type ProgramUpdate = UpdateTables<'programs'>

/**
 * Hook to fetch program for a specific property
 * Returns active/pending/paused program (most recent)
 */
export function usePropertyProgram(propertyId: string) {
  return useQuery({
    queryKey: programKeys.property(propertyId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('property_id', propertyId)
        .in('status', ['active', 'pending', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // PGRST116 = no rows found - this is expected when property has no program
      if (error && error.code !== 'PGRST116') throw error
      return data as Program | null
    },
    enabled: !!propertyId,
  })
}

/**
 * Hook to create a new program
 */
export function useCreateProgram() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (
      data: ProgramFormData & {
        base_fee: number
        tier_fee: number
        addons_fee: number
        monthly_total: number
      }
    ) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const insertData: ProgramInsert = {
        organization_id: profile.organization_id,
        property_id: data.property_id,
        client_id: data.client_id,
        inspection_frequency: data.inspection_frequency,
        inspection_tier: data.inspection_tier,
        addon_digital_manual: data.addon_digital_manual,
        addon_warranty_tracking: data.addon_warranty_tracking,
        addon_emergency_response: data.addon_emergency_response,
        addon_hurricane_monitoring: data.addon_hurricane_monitoring,
        preferred_day_of_week: data.preferred_day_of_week ?? null,
        preferred_time_slot: data.preferred_time_slot || null,
        preferred_inspector_id: data.preferred_inspector_id || null,
        billing_start_date: data.billing_start_date || null,
        billing_day_of_month: data.billing_day_of_month,
        vendor_markup_percent: data.vendor_markup_percent,
        notes: data.notes || null,
        base_fee: data.base_fee,
        tier_fee: data.tier_fee,
        addons_fee: data.addons_fee,
        monthly_total: data.monthly_total,
        status: 'active',
        activated_at: new Date().toISOString(),
      }

      const { data: program, error } = await supabase
        .from('programs')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      return program as Program
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.property(data.property_id),
      })
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(data.property_id) })
    },
  })
}

/**
 * Hook to update an existing program
 */
export function useUpdateProgram() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async ({
      id,
      data,
      shouldCreateInvoice = false,
    }: {
      id: string
      data: Partial<ProgramFormData>
      shouldCreateInvoice?: boolean
    }) => {
      // Fetch the old program data first
      const { data: oldProgram, error: fetchError } = await supabase
        .from('programs')
        .select('*, properties!inner(name, client_id)')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const updateData: ProgramUpdate = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      const { data: program, error } = await supabase
        .from('programs')
        .update(updateData)
        .eq('id', id)
        .select('*, properties!inner(name, client_id)')
        .single()

      if (error) throw error

      // Create invoice if requested and there's a pricing change
      if (
        shouldCreateInvoice &&
        profile?.organization_id &&
        oldProgram.monthly_total !== program.monthly_total
      ) {
        const today = new Date()
        const dueDate = new Date(today)
        dueDate.setDate(dueDate.getDate() + 30)

        const priceDifference = (program.monthly_total || 0) - (oldProgram.monthly_total || 0)
        const isUpgrade = priceDifference > 0
        const description = isUpgrade
          ? `Plan Upgrade - ${program.properties.name}`
          : `Plan Adjustment - ${program.properties.name}`

        // Generate unique invoice number
        const year = today.getFullYear()
        const random = Math.random().toString(36).substring(2, 8).toUpperCase()
        const invoiceNumber = `INV-${year}-${random}`

        // Create invoice for the plan change
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            organization_id: profile.organization_id,
            client_id: program.properties.client_id,
            invoice_number: invoiceNumber,
            invoice_type: 'standard',
            invoice_date: today.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            period_start: today.toISOString().split('T')[0],
            period_end: dueDate.toISOString().split('T')[0],
            subtotal: Math.abs(priceDifference),
            tax_rate: 0,
            tax_amount: 0,
            discount_amount: 0,
            total: Math.abs(priceDifference),
            balance_due: Math.abs(priceDifference),
            status: 'draft',
            notes: `Automatic invoice for plan change on ${today.toLocaleDateString()}`,
          })
          .select()
          .single()

        if (invoiceError) {
          console.error('Failed to create invoice:', invoiceError)
          // Don't throw - program was updated successfully
        } else if (invoice) {
          // Create line item for the invoice
          await supabase.from('invoice_line_items').insert({
            invoice_id: invoice.id,
            description,
            quantity: 1,
            unit_price: Math.abs(priceDifference),
            amount: Math.abs(priceDifference),
            line_type: 'subscription',
            reference_type: 'program',
            reference_id: program.id,
            property_id: program.property_id,
            display_order: 0,
          })

          // Invalidate invoice queries
          queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
        }
      }

      return program as Program
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.property(data.property_id),
      })
      // Also invalidate portal data to refresh plans page
      queryClient.invalidateQueries({
        queryKey: portalKeys.propertySummaries(),
      })
      queryClient.invalidateQueries({
        queryKey: portalKeys.dashboard(),
      })
    },
  })
}

/**
 * Hook to pause a program
 */
export function usePauseProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('programs')
        .update({
          status: 'paused',
          paused_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Program
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.property(data.property_id),
      })
    },
  })
}

/**
 * Hook to resume a paused program
 */
export function useResumeProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('programs')
        .update({
          status: 'active',
          paused_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Program
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.property(data.property_id),
      })
    },
  })
}

/**
 * Hook to cancel a program
 */
export function useCancelProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('programs')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Program
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.property(data.property_id),
      })
    },
  })
}
