import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { savePendingFinding, cacheInspection, getCachedInspection } from '@/lib/offline/db'
import { syncPendingData } from '@/lib/offline/sync'
import type { ChecklistItemFinding, InspectorInspection } from '@/lib/types/inspector'
import type { ChecklistItemFindingInput, CompleteInspectionInput } from '@/lib/validations/inspection-execution'

// Start an inspection (set status to in_progress)
export function useStartInspection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inspectionId: string) => {
      const now = new Date().toISOString()

      // Try online first
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('inspections')
          .update({
            status: 'in_progress',
            actual_start_at: now,
            updated_at: now,
          })
          .eq('id', inspectionId)
          .select()
          .single()

        if (error) throw error

        // Cache the updated inspection
        await cacheInspection(data as unknown as InspectorInspection)

        return data
      } else {
        // Offline: update cached inspection
        const cached = await getCachedInspection(inspectionId)
        if (cached) {
          cached.status = 'in_progress'
          cached.actual_start_at = now
          await cacheInspection(cached)
        }
        return cached
      }
    },
    onSuccess: (_, inspectionId) => {
      queryClient.invalidateQueries({ queryKey: ['inspector-inspection', inspectionId] })
      queryClient.invalidateQueries({ queryKey: ['inspector-schedule'] })
    },
  })
}

// Save a checklist item finding (supports offline)
export function useSaveFinding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      inspectionId,
      itemId,
      finding,
    }: {
      inspectionId: string
      itemId: string
      finding: ChecklistItemFindingInput
    }) => {
      const fullFinding: ChecklistItemFinding = {
        ...finding,
        photos: [], // Photos handled separately
        completed_at: new Date().toISOString(),
      }

      // Always save locally first (offline-first pattern)
      await savePendingFinding(inspectionId, itemId, fullFinding)

      // Try to sync if online
      if (navigator.onLine) {
        try {
          // Get current findings
          const { data, error } = await supabase
            .from('inspections')
            .select('findings')
            .eq('id', inspectionId)
            .single()

          if (error) throw error

          const currentFindings = (data.findings || {}) as Record<string, ChecklistItemFinding>
          currentFindings[itemId] = fullFinding

          // Update inspection
          await supabase
            .from('inspections')
            .update({
              findings: currentFindings,
              updated_at: new Date().toISOString(),
            })
            .eq('id', inspectionId)
        } catch (err) {
          console.warn('Failed to sync finding, will retry later:', err)
        }
      }

      return fullFinding
    },
    onSuccess: (_, { inspectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['inspector-inspection', inspectionId] })
    },
  })
}

// Batch save multiple findings (for bulk operations)
export function useBatchSaveFindings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      inspectionId,
      findings,
    }: {
      inspectionId: string
      findings: Array<{ itemId: string; finding: ChecklistItemFindingInput }>
    }) => {
      const now = new Date().toISOString()

      // Save all locally first
      for (const { itemId, finding } of findings) {
        const fullFinding: ChecklistItemFinding = {
          ...finding,
          photos: [],
          completed_at: now,
        }
        await savePendingFinding(inspectionId, itemId, fullFinding)
      }

      // Try to sync if online
      if (navigator.onLine) {
        await syncPendingData()
      }

      return findings.length
    },
    onSuccess: (_, { inspectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['inspector-inspection', inspectionId] })
    },
  })
}

// Complete an inspection
export function useCompleteInspection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      inspectionId,
      data,
    }: {
      inspectionId: string
      data: CompleteInspectionInput
    }) => {
      const now = new Date().toISOString()

      // Sync any pending findings first
      if (navigator.onLine) {
        await syncPendingData()
      }

      // Try online completion
      if (navigator.onLine) {
        const { data: result, error } = await supabase
          .from('inspections')
          .update({
            status: 'completed',
            overall_condition: data.overall_condition,
            summary: data.summary,
            weather_conditions: data.weather_conditions || {},
            actual_end_at: now,
            updated_at: now,
          })
          .eq('id', inspectionId)
          .select()
          .single()

        if (error) throw error
        return result
      } else {
        // Queue for later sync
        // Note: Full offline completion support would require more complex handling
        throw new Error('Cannot complete inspection while offline. Please connect to sync.')
      }
    },
    onSuccess: (_, { inspectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['inspector-inspection', inspectionId] })
      queryClient.invalidateQueries({ queryKey: ['inspector-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['inspector-upcoming'] })
    },
  })
}

// Add a recommendation from inspection finding
export function useAddRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      inspectionId,
      propertyId,
      itemId,
      title,
      description,
      priority,
      category,
      photos,
    }: {
      inspectionId: string
      propertyId: string
      itemId: string
      title: string
      description: string
      priority: 'low' | 'medium' | 'high' | 'urgent'
      category?: string
      photos?: string[]
    }) => {
      if (!navigator.onLine) {
        throw new Error('Cannot create recommendation while offline')
      }

      // Get user's org
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      // Create recommendation
      const { data, error } = await supabase
        .from('recommendations')
        .insert({
          organization_id: userData?.organization_id,
          property_id: propertyId,
          inspection_id: inspectionId,
          checklist_item_id: itemId,
          title,
          description,
          priority,
          category,
          photos: photos || [],
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}

// Calculate inspection progress
export function calculateInspectionProgress(inspection: InspectorInspection): {
  completed: number
  total: number
  percentage: number
} {
  const findings = inspection.findings || {}
  let total = 0
  let completed = 0

  for (const section of inspection.checklist?.sections || []) {
    for (const item of section.items) {
      total++
      if (findings[item.id]) {
        completed++
      }
    }
  }

  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}
