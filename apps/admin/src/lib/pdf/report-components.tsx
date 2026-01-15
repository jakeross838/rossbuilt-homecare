import { Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import {
  REPORT_COLORS,
  REPORT_FONTS,
  FINDING_STATUS_COLORS,
  PRIORITY_COLORS,
  CONDITION_LABELS,
  INSPECTION_TYPE_LABELS,
} from '@/lib/constants/report'
import type {
  InspectionReport,
  ReportSectionFindings,
  ReportRecommendation,
  ReportFindingSummary,
} from '@/lib/types/report'

// Shared styles
const styles = StyleSheet.create({
  page: {
    padding: 54,
    fontFamily: REPORT_FONTS.body,
    fontSize: 10,
    color: REPORT_COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: REPORT_COLORS.border,
  },
  logo: {
    width: 120,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: REPORT_FONTS.heading,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: REPORT_COLORS.secondary,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: REPORT_FONTS.heading,
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: REPORT_COLORS.accent,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    color: REPORT_COLORS.secondary,
  },
  value: {
    flex: 1,
    fontFamily: REPORT_FONTS.heading,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 1.5,
  },
  box: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 4,
    backgroundColor: REPORT_COLORS.backgroundAlt,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  gridItem: {
    width: '50%',
    marginBottom: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photo: {
    width: 150,
    height: 112,
    objectFit: 'cover',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 54,
    right: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: REPORT_COLORS.muted,
  },
})

// Cover Page Component
export function CoverPage({ report }: { report: InspectionReport }) {
  const conditionInfo = report.overall_condition
    ? CONDITION_LABELS[report.overall_condition]
    : null

  return (
    <View>
      {/* Header with logo */}
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Text style={{ fontSize: 28, fontFamily: REPORT_FONTS.heading }}>
          ROSS BUILT
        </Text>
        <Text style={{ fontSize: 12, color: REPORT_COLORS.secondary, letterSpacing: 3 }}>
          HOME CARE
        </Text>
      </View>

      {/* Property Photo */}
      {report.cover_photo && (
        <View style={{ marginBottom: 30, alignItems: 'center' }}>
          <Image
            src={report.cover_photo}
            style={{ width: 400, height: 250, objectFit: 'cover', borderRadius: 8 }}
          />
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>Property Inspection Report</Text>
      <Text style={styles.subtitle}>
        {INSPECTION_TYPE_LABELS[report.inspection_type] || report.inspection_type}
      </Text>

      {/* Property Info */}
      <View style={{ marginTop: 30 }}>
        <View style={styles.row}>
          <Text style={styles.label}>Property:</Text>
          <Text style={styles.value}>{report.property.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>
            {report.property.address}, {report.property.city}, {report.property.state}{' '}
            {report.property.zip}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Client:</Text>
          <Text style={styles.value}>{report.client.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Inspection Date:</Text>
          <Text style={styles.value}>{formatDate(report.inspection_date)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Inspector:</Text>
          <Text style={styles.value}>{report.inspector.name}</Text>
        </View>
      </View>

      {/* Overall Condition Badge */}
      {conditionInfo && (
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: conditionInfo.color + '20',
                borderWidth: 1,
                borderColor: conditionInfo.color,
              },
            ]}
          >
            <Text style={{ color: conditionInfo.color, fontSize: 14, fontFamily: REPORT_FONTS.heading }}>
              Overall Condition: {conditionInfo.label}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

// Executive Summary Component
export function ExecutiveSummary({
  report,
  aiSummary,
}: {
  report: InspectionReport
  aiSummary?: {
    executive_summary: string
    key_findings: string[]
    priority_actions: string[]
    closing_statement: string
  }
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Executive Summary</Text>

      {/* AI Summary or Inspector Summary */}
      <Text style={styles.paragraph}>
        {aiSummary?.executive_summary || report.summary}
      </Text>

      {/* Key Findings */}
      {aiSummary?.key_findings && aiSummary.key_findings.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontFamily: REPORT_FONTS.heading, marginBottom: 8 }}>
            Key Findings:
          </Text>
          {aiSummary.key_findings.map((finding, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ marginRight: 8 }}>•</Text>
              <Text style={{ flex: 1 }}>{finding}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Priority Actions */}
      {aiSummary?.priority_actions && aiSummary.priority_actions.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontFamily: REPORT_FONTS.heading, marginBottom: 8 }}>
            Recommended Actions:
          </Text>
          {aiSummary.priority_actions.map((action, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ marginRight: 8, fontFamily: REPORT_FONTS.heading }}>
                {i + 1}.
              </Text>
              <Text style={{ flex: 1 }}>{action}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

// Findings Overview Component
export function FindingsOverview({ summary }: { summary: ReportFindingSummary }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Findings Overview</Text>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Total Items Inspected</Text>
          <Text style={{ fontSize: 24, fontFamily: REPORT_FONTS.heading }}>
            {summary.total_items}
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Completion Rate</Text>
          <Text style={{ fontSize: 24, fontFamily: REPORT_FONTS.heading }}>
            {summary.completion_percentage}%
          </Text>
        </View>
      </View>

      {/* Status breakdown */}
      <View style={[styles.box, { flexDirection: 'row', justifyContent: 'space-around' }]}>
        <StatusBox label="Passed" count={summary.passed} color={REPORT_COLORS.success} />
        <StatusBox label="Failed" count={summary.failed} color={REPORT_COLORS.danger} />
        <StatusBox
          label="Needs Attention"
          count={summary.needs_attention}
          color={REPORT_COLORS.warning}
        />
        <StatusBox label="Urgent" count={summary.urgent} color={REPORT_COLORS.urgent} />
        <StatusBox label="N/A" count={summary.not_applicable} color={REPORT_COLORS.muted} />
      </View>
    </View>
  )
}

function StatusBox({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontFamily: REPORT_FONTS.heading, color }}>{count}</Text>
      <Text style={{ fontSize: 8, color: REPORT_COLORS.secondary }}>{label}</Text>
    </View>
  )
}

// Section Details Component
export function SectionDetails({ section }: { section: ReportSectionFindings }) {
  const hasIssues = section.summary.issues > 0

  return (
    <View style={{ marginBottom: 16 }} wrap={false}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          paddingBottom: 4,
          borderBottomWidth: 1,
          borderBottomColor: REPORT_COLORS.border,
        }}
      >
        <Text style={{ fontFamily: REPORT_FONTS.heading, fontSize: 12 }}>
          {section.section_name}
        </Text>
        <Text style={{ fontSize: 9, color: REPORT_COLORS.secondary }}>
          {section.summary.passed}/{section.summary.total} passed
        </Text>
      </View>

      {/* Show all items or just issues based on section status */}
      {section.items
        .filter((item) => hasIssues ? ['fail', 'needs_attention', 'urgent'].includes(item.status) : true)
        .map((item, i) => {
          const statusInfo = FINDING_STATUS_COLORS[item.status]
          return (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 6,
                paddingLeft: 8,
              }}
            >
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: statusInfo.bg,
                    marginRight: 8,
                    minWidth: 60,
                  },
                ]}
              >
                <Text style={{ color: statusInfo.text, fontSize: 8 }}>
                  {statusInfo.label}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text>{item.label}</Text>
                {item.notes && (
                  <Text style={{ fontSize: 9, color: REPORT_COLORS.secondary, marginTop: 2 }}>
                    {item.notes}
                  </Text>
                )}
              </View>
            </View>
          )
        })}

      {/* If no issues in section */}
      {!hasIssues && section.items.length > 3 && (
        <Text style={{ fontSize: 9, color: REPORT_COLORS.muted, fontStyle: 'italic', paddingLeft: 8 }}>
          All {section.summary.total} items passed inspection
        </Text>
      )}
    </View>
  )
}

// Recommendations Component
export function RecommendationsSection({
  recommendations,
}: {
  recommendations: ReportRecommendation[]
}) {
  if (recommendations.length === 0) return null

  return (
    <View>
      <Text style={styles.sectionTitle}>Recommendations</Text>

      {recommendations.map((rec, i) => {
        const priorityInfo = PRIORITY_COLORS[rec.priority]
        return (
          <View key={i} style={[styles.box, { marginBottom: 12 }]} wrap={false}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontFamily: REPORT_FONTS.heading, fontSize: 12, flex: 1 }}>
                {rec.title}
              </Text>
              <View style={[styles.badge, { backgroundColor: priorityInfo.bg }]}>
                <Text style={{ color: priorityInfo.text, fontSize: 8 }}>
                  {priorityInfo.label}
                </Text>
              </View>
            </View>

            <Text style={styles.paragraph}>{rec.description}</Text>

            {rec.ai_why_it_matters && (
              <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: REPORT_COLORS.border }}>
                <Text style={{ fontSize: 9, fontFamily: REPORT_FONTS.heading, marginBottom: 4 }}>
                  Why This Matters:
                </Text>
                <Text style={{ fontSize: 9, color: REPORT_COLORS.secondary }}>
                  {rec.ai_why_it_matters}
                </Text>
              </View>
            )}

            {(rec.estimated_cost_low || rec.estimated_cost_high) && (
              <View style={{ marginTop: 8, flexDirection: 'row' }}>
                <Text style={{ fontSize: 9, color: REPORT_COLORS.secondary }}>
                  Estimated Cost:{' '}
                </Text>
                <Text style={{ fontSize: 9, fontFamily: REPORT_FONTS.heading }}>
                  ${rec.estimated_cost_low?.toLocaleString() || '?'} -{' '}
                  ${rec.estimated_cost_high?.toLocaleString() || '?'}
                </Text>
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}

// Photo Gallery Component
export function PhotoGallery({ photos }: { photos: InspectionReport['all_photos'] }) {
  if (photos.length === 0) return null

  return (
    <View>
      <Text style={styles.sectionTitle}>Photo Documentation</Text>

      <View style={styles.photoGrid}>
        {photos.slice(0, 12).map((photo, i) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <Image src={photo.url} style={styles.photo} />
            {(photo.caption || photo.item_label) && (
              <Text style={{ fontSize: 8, color: REPORT_COLORS.secondary, marginTop: 4 }}>
                {photo.caption || photo.item_label}
              </Text>
            )}
          </View>
        ))}
      </View>

      {photos.length > 12 && (
        <Text style={{ fontSize: 9, color: REPORT_COLORS.muted, textAlign: 'center' }}>
          + {photos.length - 12} additional photos available in digital archive
        </Text>
      )}
    </View>
  )
}

// Weather Section Component
export function WeatherSection({ weather }: { weather: InspectionReport['weather'] }) {
  if (!weather) return null

  return (
    <View style={styles.box}>
      <Text style={{ fontFamily: REPORT_FONTS.heading, marginBottom: 8 }}>
        Weather Conditions at Time of Inspection
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {weather.temperature !== undefined && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontFamily: REPORT_FONTS.heading }}>
              {weather.temperature}°F
            </Text>
            <Text style={{ fontSize: 8, color: REPORT_COLORS.secondary }}>Temperature</Text>
          </View>
        )}
        {weather.humidity !== undefined && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontFamily: REPORT_FONTS.heading }}>
              {weather.humidity}%
            </Text>
            <Text style={{ fontSize: 8, color: REPORT_COLORS.secondary }}>Humidity</Text>
          </View>
        )}
        {weather.conditions && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontFamily: REPORT_FONTS.heading }}>
              {weather.conditions}
            </Text>
            <Text style={{ fontSize: 8, color: REPORT_COLORS.secondary }}>Conditions</Text>
          </View>
        )}
      </View>
    </View>
  )
}

// Footer Component
export function PageFooter({ pageNumber }: { pageNumber: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text>Ross Built Home Care - Confidential</Text>
      <Text>Page {pageNumber}</Text>
    </View>
  )
}

// Helper
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
