import { pdf } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { ReportDocument } from './report-document'
import type { InspectionReport, ReportGenerationOptions } from '@/lib/types/report'
import { supabase } from '@/lib/supabase'

interface AISummary {
  executive_summary: string
  key_findings: string[]
  priority_actions: string[]
  closing_statement: string
}

interface GeneratePDFOptions {
  report: InspectionReport
  options?: Partial<ReportGenerationOptions>
  aiSummary?: AISummary
}

/**
 * Generate PDF blob from report data
 */
export async function generatePDFBlob({
  report,
  options,
  aiSummary,
}: GeneratePDFOptions): Promise<Blob> {
  const doc = createElement(ReportDocument, { report, options, aiSummary }) as unknown as ReactElement
  const blob = await pdf(doc).toBlob()
  return blob
}

/**
 * Generate PDF and trigger download
 */
export async function downloadPDF({
  report,
  options,
  aiSummary,
}: GeneratePDFOptions): Promise<void> {
  const blob = await generatePDFBlob({ report, options, aiSummary })

  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${report.property.name.replace(/\s+/g, '-')}-Inspection-${report.inspection_date}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate PDF and upload to Supabase Storage
 */
export async function uploadPDFToStorage({
  report,
  options,
  aiSummary,
}: GeneratePDFOptions): Promise<string> {
  const blob = await generatePDFBlob({ report, options, aiSummary })

  // Generate unique file path
  const fileName = `${report.inspection_id}-${Date.now()}.pdf`
  const filePath = `reports/${report.property.id}/${fileName}`

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from('inspection-reports')
    .upload(filePath, blob, {
      contentType: 'application/pdf',
      cacheControl: '3600',
    })

  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('inspection-reports')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

/**
 * Generate AI summary for report
 */
export async function generateAISummary(report: InspectionReport): Promise<AISummary> {
  const response = await supabase.functions.invoke('generate-report-summary', {
    body: {
      property_name: report.property.name,
      property_address: `${report.property.address}, ${report.property.city}, ${report.property.state} ${report.property.zip}`,
      client_name: report.client.name,
      inspection_date: report.inspection_date,
      inspection_type: report.inspection_type,
      overall_condition: report.overall_condition,
      inspector_summary: report.summary,
      findings_summary: report.findings_summary,
      sections: report.sections.map((s) => ({
        section_name: s.section_name,
        items: s.items.map((item) => ({
          label: item.label,
          status: item.status,
          notes: item.notes,
        })),
      })),
      recommendations: report.recommendations.map((r) => ({
        title: r.title,
        description: r.description,
        priority: r.priority,
        category: r.category,
      })),
      weather: report.weather,
    },
  })

  if (response.error) {
    throw new Error(`Failed to generate AI summary: ${response.error.message}`)
  }

  return response.data as AISummary
}

/**
 * Full report generation flow
 */
export async function generateAndSaveReport(
  report: InspectionReport,
  options?: Partial<ReportGenerationOptions>
): Promise<{ reportUrl: string; aiSummary?: AISummary }> {
  let aiSummary: AISummary | undefined

  // Generate AI summary if requested
  if (options?.include_ai_summary !== false) {
    try {
      aiSummary = await generateAISummary(report)
    } catch (error) {
      console.warn('Failed to generate AI summary, continuing without it:', error)
    }
  }

  // Upload PDF to storage
  const reportUrl = await uploadPDFToStorage({ report, options, aiSummary })

  // Update inspection with report URL
  await supabase
    .from('inspections')
    .update({
      report_url: reportUrl,
      report_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', report.inspection_id)

  return { reportUrl, aiSummary }
}
