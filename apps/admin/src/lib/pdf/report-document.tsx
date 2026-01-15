import { Document, Page, StyleSheet, View, Text } from '@react-pdf/renderer'
import { REPORT_DIMENSIONS, REPORT_FONTS, REPORT_COLORS } from '@/lib/constants/report'
import type { InspectionReport, ReportGenerationOptions } from '@/lib/types/report'
import {
  CoverPage,
  ExecutiveSummary,
  FindingsOverview,
  SectionDetails,
  RecommendationsSection,
  PhotoGallery,
  WeatherSection,
} from './report-components'

// Register fonts (using built-in Helvetica family)
// For custom fonts, would use Font.register()

const styles = StyleSheet.create({
  page: {
    padding: REPORT_DIMENSIONS.margin.top,
    paddingLeft: REPORT_DIMENSIONS.margin.left,
    paddingRight: REPORT_DIMENSIONS.margin.right,
    paddingBottom: REPORT_DIMENSIONS.margin.bottom + 20, // Extra space for footer
    fontFamily: REPORT_FONTS.body,
    fontSize: 10,
    color: REPORT_COLORS.primary,
    backgroundColor: REPORT_COLORS.background,
  },
  coverPage: {
    padding: REPORT_DIMENSIONS.margin.top,
    paddingLeft: REPORT_DIMENSIONS.margin.left,
    paddingRight: REPORT_DIMENSIONS.margin.right,
    justifyContent: 'center',
    backgroundColor: REPORT_COLORS.background,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: REPORT_FONTS.heading,
    marginBottom: 16,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: REPORT_COLORS.accent,
  },
  passedSection: {
    fontFamily: REPORT_FONTS.heading,
    fontSize: 12,
    marginBottom: 8,
    color: REPORT_COLORS.success,
  },
  passedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: REPORT_COLORS.border,
  },
  passedCount: {
    color: REPORT_COLORS.success,
  },
})

interface ReportDocumentProps {
  report: InspectionReport
  options?: Partial<ReportGenerationOptions>
  aiSummary?: {
    executive_summary: string
    key_findings: string[]
    priority_actions: string[]
    closing_statement: string
  }
}

export function ReportDocument({ report, options, aiSummary }: ReportDocumentProps) {
  const pageSize = options?.page_size === 'a4' ? 'A4' : 'LETTER'

  // Filter sections with issues for detailed display
  const sectionsWithIssues = report.sections.filter((s) => s.summary.issues > 0)
  const sectionsAllPassed = report.sections.filter((s) => s.summary.issues === 0)

  return (
    <Document
      title={`Inspection Report - ${report.property.name}`}
      author="Ross Built Home Care"
      subject={`Property Inspection Report for ${report.property.name}`}
      creator="Home Care OS"
    >
      {/* Cover Page */}
      <Page size={pageSize} style={styles.coverPage}>
        <CoverPage report={report} />
      </Page>

      {/* Executive Summary */}
      <Page size={pageSize} style={styles.page}>
        <ExecutiveSummary report={report} aiSummary={aiSummary} />

        {/* Weather if included */}
        {options?.include_weather !== false && report.weather && (
          <WeatherSection weather={report.weather} />
        )}

        {/* Findings Overview */}
        <FindingsOverview summary={report.findings_summary} />
      </Page>

      {/* Detailed Findings - Sections with Issues */}
      {sectionsWithIssues.length > 0 && (
        <Page size={pageSize} style={styles.page}>
          <View>
            <Text style={styles.sectionTitle}>Detailed Findings</Text>

            {sectionsWithIssues.map((section, i) => (
              <SectionDetails key={i} section={section} />
            ))}
          </View>

          {/* Sections that passed (summary) */}
          {sectionsAllPassed.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.passedSection}>Areas with All Items Passing</Text>
              {sectionsAllPassed.map((section, i) => (
                <View key={i} style={styles.passedRow}>
                  <Text>{section.section_name}</Text>
                  <Text style={styles.passedCount}>
                    {section.summary.total} items passed
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Page>
      )}

      {/* Recommendations */}
      {options?.include_recommendations !== false && report.recommendations.length > 0 && (
        <Page size={pageSize} style={styles.page}>
          <RecommendationsSection recommendations={report.recommendations} />
        </Page>
      )}

      {/* Photo Gallery */}
      {options?.include_photos !== false && report.all_photos.length > 0 && (
        <Page size={pageSize} style={styles.page}>
          <PhotoGallery photos={report.all_photos} />
        </Page>
      )}
    </Document>
  )
}
