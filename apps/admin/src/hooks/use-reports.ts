import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  InspectionReport,
  ReportFindingSummary,
  ReportSectionFindings,
  ReportRecommendation,
} from '@/lib/types/report'
import type { ChecklistItemFinding } from '@/lib/types/inspector'
import type { Tables } from '@/lib/supabase'

type Inspection = Tables<'inspections'>
type Recommendation = Tables<'recommendations'>

// Fetch full inspection data for report generation
export function useInspectionForReport(inspectionId: string | undefined) {
  return useQuery({
    queryKey: ['inspection-report-data', inspectionId],
    queryFn: async () => {
      if (!inspectionId) return null

      // Fetch inspection with related data
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .select(`
          *,
          property:properties(
            id, name, address_line1, address_line2, city, state, zip,
            primary_photo_url,
            client:clients(id, first_name, last_name, email, phone)
          ),
          inspector:users(id, first_name, last_name)
        `)
        .eq('id', inspectionId)
        .single()

      if (inspectionError) throw inspectionError

      // Fetch recommendations for this inspection
      const { data: recommendations, error: recError } = await supabase
        .from('recommendations')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('priority', { ascending: false })

      if (recError) throw recError

      // Fetch photos
      const { data: photos, error: photoError } = await supabase
        .from('inspection_photos')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('display_order')

      if (photoError) throw photoError

      return {
        inspection,
        recommendations: recommendations || [],
        photos: photos || [],
      }
    },
    enabled: !!inspectionId,
  })
}

// Build report data from inspection
export function useBuildReportData(inspectionId: string | undefined) {
  const { data, isLoading, error } = useInspectionForReport(inspectionId)

  const reportData = data ? buildReportData(data) : null

  return {
    data: reportData,
    isLoading,
    error,
  }
}

// Helper to build report data structure
function buildReportData(data: {
  inspection: unknown
  recommendations: Recommendation[]
  photos: Tables<'inspection_photos'>[]
}): InspectionReport | null {
  const inspection = data.inspection as Inspection & {
    property: {
      id: string
      name: string
      address_line1: string
      address_line2: string | null
      city: string
      state: string
      zip: string
      primary_photo_url: string | null
      client: {
        id: string
        first_name: string
        last_name: string
        email: string | null
        phone: string | null
      } | null
    } | null
    inspector: { id: string; first_name: string; last_name: string } | null
  }

  // Return null if required relationships are missing
  if (!inspection.property) {
    return null
  }

  const checklist = (inspection.checklist || { sections: [] }) as unknown as {
    sections: Array<{
      id: string
      title: string
      items: Array<{ id: string; label: string }>
    }>
  }
  const findings = (inspection.findings || {}) as Record<string, ChecklistItemFinding>

  // Calculate findings summary
  const findingsSummary = calculateFindingsSummary(checklist, findings)

  // Build section findings
  const sections = buildSectionFindings(checklist, findings)

  // Build recommendations
  const recommendations = buildRecommendations(data.recommendations)

  // Build all photos list
  const allPhotos = buildPhotoList(data.photos, findings)

  return {
    id: crypto.randomUUID(),
    inspection_id: inspection.id,
    generated_at: new Date().toISOString(),
    status: 'pending',

    inspection_date: inspection.scheduled_date,
    inspection_type: inspection.inspection_type || 'scheduled',
    tier: 'comprehensive', // Would come from program
    duration_minutes: inspection.actual_duration_minutes || inspection.estimated_duration_minutes || 0,

    property: {
      id: inspection.property.id,
      name: inspection.property.name,
      address: [inspection.property.address_line1, inspection.property.address_line2]
        .filter(Boolean)
        .join(', '),
      city: inspection.property.city,
      state: inspection.property.state,
      zip: inspection.property.zip,
      photo_url: inspection.property.primary_photo_url || undefined,
    },

    client: inspection.property.client
      ? {
          id: inspection.property.client.id,
          name: `${inspection.property.client.first_name} ${inspection.property.client.last_name}`,
          email: inspection.property.client.email || undefined,
          phone: inspection.property.client.phone || undefined,
        }
      : {
          id: '',
          name: 'No client assigned',
        },

    inspector: inspection.inspector
      ? {
          id: inspection.inspector.id,
          name: `${inspection.inspector.first_name} ${inspection.inspector.last_name}`,
        }
      : {
          id: '',
          name: 'No inspector assigned',
        },

    overall_condition: inspection.overall_condition,
    summary: inspection.summary || 'No summary provided.',
    weather: inspection.weather_conditions as InspectionReport['weather'],

    findings_summary: findingsSummary,
    sections,
    recommendations,

    cover_photo: inspection.property.primary_photo_url || undefined,
    all_photos: allPhotos,
  }
}

function calculateFindingsSummary(
  checklist: { sections: Array<{ items: Array<{ id: string }> }> },
  findings: Record<string, ChecklistItemFinding>
): ReportFindingSummary {
  let total = 0
  let passed = 0
  let failed = 0
  let needsAttention = 0
  let urgent = 0
  let notApplicable = 0

  for (const section of checklist.sections || []) {
    for (const item of section.items || []) {
      total++
      const finding = findings[item.id]
      if (finding) {
        switch (finding.status) {
          case 'pass':
            passed++
            break
          case 'fail':
            failed++
            break
          case 'needs_attention':
            needsAttention++
            break
          case 'urgent':
            urgent++
            break
          case 'na':
            notApplicable++
            break
        }
      }
    }
  }

  return {
    total_items: total,
    passed,
    failed,
    needs_attention: needsAttention,
    urgent,
    not_applicable: notApplicable,
    completion_percentage: total > 0 ? Math.round((Object.keys(findings).length / total) * 100) : 0,
  }
}

function buildSectionFindings(
  checklist: {
    sections: Array<{ id: string; title: string; items: Array<{ id: string; label: string }> }>
  },
  findings: Record<string, ChecklistItemFinding>
): ReportSectionFindings[] {
  return (checklist.sections || []).map((section) => {
    const items = (section.items || []).map((item) => {
      const finding = findings[item.id]
      return {
        item_id: item.id,
        label: item.label,
        status: finding?.status || 'na',
        notes: finding?.notes,
        photos: finding?.photos || [],
        recommendation_added: finding?.recommendation_added || false,
      }
    })

    const issues = items.filter((i) =>
      ['fail', 'needs_attention', 'urgent'].includes(i.status)
    ).length

    return {
      section_id: section.id,
      section_name: section.title,
      items,
      summary: {
        total: items.length,
        passed: items.filter((i) => i.status === 'pass').length,
        issues,
      },
    }
  })
}

function buildRecommendations(recommendations: Recommendation[]): ReportRecommendation[] {
  return recommendations.map((rec) => ({
    id: rec.id,
    title: rec.title,
    description: rec.description,
    priority: rec.priority,
    category: rec.category || undefined,
    photos: (rec.photos as string[]) || [],
    estimated_cost_low: rec.estimated_cost_low
      ? parseFloat(rec.estimated_cost_low as unknown as string)
      : undefined,
    estimated_cost_high: rec.estimated_cost_high
      ? parseFloat(rec.estimated_cost_high as unknown as string)
      : undefined,
    ai_why_it_matters: rec.ai_why_it_matters || undefined,
  }))
}

function buildPhotoList(
  photos: Tables<'inspection_photos'>[],
  findings: Record<string, ChecklistItemFinding>
): InspectionReport['all_photos'] {
  const photoList: InspectionReport['all_photos'] = []

  // Add photos from inspection_photos table
  for (const photo of photos) {
    photoList.push({
      url: photo.url,
      caption: photo.caption || undefined,
      section: photo.section_id || undefined,
      item_label: photo.item_id || undefined,
    })
  }

  // Add photos from findings (embedded in JSONB)
  for (const [itemId, finding] of Object.entries(findings)) {
    for (const photoUrl of finding.photos || []) {
      if (!photoList.some((p) => p.url === photoUrl)) {
        photoList.push({
          url: photoUrl,
          item_label: itemId,
        })
      }
    }
  }

  return photoList
}

// Save report URL to inspection
export function useSaveReportUrl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      inspectionId,
      reportUrl,
    }: {
      inspectionId: string
      reportUrl: string
    }) => {
      const { data, error } = await supabase
        .from('inspections')
        .update({
          report_url: reportUrl,
          report_generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', inspectionId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-report-data', data.id] })
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
    },
  })
}

// Mark report as sent
export function useMarkReportSent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inspectionId: string) => {
      const { data, error } = await supabase
        .from('inspections')
        .update({
          report_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', inspectionId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
    },
  })
}
