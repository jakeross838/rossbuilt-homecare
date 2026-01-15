/**
 * Report configuration constants for Home Care OS
 */

// Ross Built brand colors for reports
export const REPORT_COLORS = {
  primary: '#1a1a1a', // Near black
  secondary: '#666666', // Gray
  accent: '#2E7D32', // Ross Built green
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  urgent: '#dc2626',
  muted: '#9ca3af',
  border: '#e5e7eb',
  background: '#ffffff',
  backgroundAlt: '#f9fafb',
} as const

// Report typography
export const REPORT_FONTS = {
  heading: 'Helvetica-Bold',
  body: 'Helvetica',
  mono: 'Courier',
} as const

// Report dimensions (in points, 72 points = 1 inch)
export const REPORT_DIMENSIONS = {
  letter: { width: 612, height: 792 }, // 8.5" x 11"
  a4: { width: 595, height: 842 }, // 210mm x 297mm
  margin: {
    top: 72, // 1"
    bottom: 72,
    left: 54, // 0.75"
    right: 54,
  },
} as const

// Status colors for findings
export const FINDING_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pass: { bg: '#dcfce7', text: '#166534', label: 'Pass' },
  fail: { bg: '#fee2e2', text: '#991b1b', label: 'Fail' },
  needs_attention: { bg: '#fef3c7', text: '#92400e', label: 'Needs Attention' },
  urgent: { bg: '#fecaca', text: '#b91c1c', label: 'Urgent' },
  na: { bg: '#f3f4f6', text: '#6b7280', label: 'N/A' },
} as const

// Priority colors for recommendations
export const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: '#e0f2fe', text: '#0369a1', label: 'Low Priority' },
  medium: { bg: '#fef3c7', text: '#92400e', label: 'Medium Priority' },
  high: { bg: '#fed7aa', text: '#c2410c', label: 'High Priority' },
  urgent: { bg: '#fecaca', text: '#b91c1c', label: 'Urgent' },
} as const

// Condition rating labels
export const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  excellent: { label: 'Excellent', color: '#16a34a' },
  good: { label: 'Good', color: '#22c55e' },
  fair: { label: 'Fair', color: '#f59e0b' },
  poor: { label: 'Poor', color: '#f97316' },
  critical: { label: 'Critical', color: '#ef4444' },
} as const

// Inspection type labels
export const INSPECTION_TYPE_LABELS: Record<string, string> = {
  scheduled: 'Scheduled Inspection',
  storm_pre: 'Pre-Storm Inspection',
  storm_post: 'Post-Storm Inspection',
  arrival: 'Arrival Inspection',
  departure: 'Departure Inspection',
  special: 'Special Inspection',
  initial: 'Initial Inspection',
} as const

// Default report options
export const DEFAULT_REPORT_OPTIONS = {
  include_photos: true,
  include_recommendations: true,
  include_ai_summary: true,
  include_weather: true,
  photo_quality: 'medium' as const,
  page_size: 'letter' as const,
} as const

// Photo size constraints for reports
export const REPORT_PHOTO_SIZES = {
  thumbnail: { width: 80, height: 60 },
  medium: { width: 200, height: 150 },
  full: { width: 400, height: 300 },
  cover: { width: 500, height: 300 },
} as const

// Report sections configuration
export const REPORT_SECTIONS = [
  { id: 'cover', name: 'Cover Page', always_include: true },
  { id: 'summary', name: 'Executive Summary', always_include: true },
  { id: 'findings_overview', name: 'Findings Overview', always_include: true },
  { id: 'section_detail', name: 'Detailed Findings', always_include: true },
  { id: 'recommendations', name: 'Recommendations', always_include: false },
  { id: 'photos', name: 'Photo Gallery', always_include: false },
  { id: 'weather', name: 'Weather Conditions', always_include: false },
] as const

// Email templates
export const REPORT_EMAIL_TEMPLATES = {
  subject: 'Your Home Inspection Report - {property_name} - {date}',
  body: `Dear {client_name},

Your inspection report for {property_name} is ready.

Inspection Date: {date}
Overall Condition: {condition}

You can view your full report by clicking the link below:
{report_url}

Thank you for choosing Ross Built Home Care.

Best regards,
The Ross Built Team`,
} as const
