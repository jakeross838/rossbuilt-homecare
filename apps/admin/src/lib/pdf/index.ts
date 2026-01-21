/**
 * Lazy-loaded PDF generation module
 *
 * This module dynamically imports the heavy @react-pdf/renderer library
 * only when PDF functions are actually called, reducing initial bundle size.
 */

import type { InspectionReport, ReportGenerationOptions } from '@/lib/types/report'

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

// Lazy import the actual PDF module
let pdfModule: typeof import('./generate-pdf') | null = null

async function loadPDFModule() {
  if (!pdfModule) {
    pdfModule = await import('./generate-pdf')
  }
  return pdfModule
}

/**
 * Generate PDF blob from report data (lazy-loaded)
 */
export async function generatePDFBlob(options: GeneratePDFOptions): Promise<Blob> {
  const module = await loadPDFModule()
  return module.generatePDFBlob(options)
}

/**
 * Generate PDF and trigger download (lazy-loaded)
 */
export async function downloadPDF(options: GeneratePDFOptions): Promise<void> {
  const module = await loadPDFModule()
  return module.downloadPDF(options)
}

/**
 * Generate PDF and upload to Supabase Storage (lazy-loaded)
 */
export async function uploadPDFToStorage(options: GeneratePDFOptions): Promise<string> {
  const module = await loadPDFModule()
  return module.uploadPDFToStorage(options)
}

/**
 * Generate AI summary for report (lazy-loaded)
 */
export async function generateAISummary(report: InspectionReport): Promise<AISummary> {
  const module = await loadPDFModule()
  return module.generateAISummary(report)
}

/**
 * Full report generation flow (lazy-loaded)
 */
export async function generateAndSaveReport(
  report: InspectionReport,
  options?: Partial<ReportGenerationOptions>
): Promise<{ reportUrl: string; aiSummary?: AISummary }> {
  const module = await loadPDFModule()
  return module.generateAndSaveReport(report, options)
}

// Re-export types
export type { AISummary, GeneratePDFOptions }
