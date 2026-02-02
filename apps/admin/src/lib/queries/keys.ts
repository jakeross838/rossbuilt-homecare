/**
 * Centralized Query Key Registry
 *
 * All React Query keys should be defined here for:
 * - Consistent naming conventions (kebab-case roots)
 * - Type-safe autocomplete
 * - Predictable cache invalidation
 * - Alignment with realtime sync patterns
 *
 * Key structure: ['entity-root', 'qualifier', ...params] as const
 */

// ============================================================================
// CORE ENTITIES
// ============================================================================

/**
 * Client query keys
 * Used by: use-clients.ts
 */
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: { search?: string; active?: boolean }) =>
    [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
}

/**
 * Property query keys
 * Used by: use-properties.ts
 */
export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (filters: { search?: string; clientId?: string; active?: boolean }) =>
    [...propertyKeys.lists(), filters] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
}

/**
 * Equipment query keys
 * Used by: use-equipment.ts
 */
export const equipmentKeys = {
  all: ['equipment'] as const,
  lists: () => [...equipmentKeys.all, 'list'] as const,
  property: (propertyId: string) =>
    [...equipmentKeys.all, 'property', propertyId] as const,
  details: () => [...equipmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...equipmentKeys.details(), id] as const,
}

/**
 * User query keys
 * Used by: use-users.ts, use-profile.ts
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: { search?: string; role?: string; active?: boolean }) =>
    [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
}

// ============================================================================
// INSPECTIONS
// ============================================================================

/**
 * Inspection query keys
 * Used by: use-inspections.ts
 */
export const inspectionKeys = {
  all: ['inspections'] as const,
  calendar: (startDate: string, endDate: string) =>
    ['calendar-inspections', startDate, endDate] as const,
  details: () => [...inspectionKeys.all, 'detail'] as const,
  detail: (id: string) => ['inspection', id] as const,
  property: (propertyId: string) => ['property-inspections', propertyId] as const,
  inspectorWorkload: () => ['inspector-workload'] as const,
}

/**
 * Inspector query keys
 * Used by: use-inspectors.ts
 */
export const inspectorKeys = {
  all: ['inspectors'] as const,
  lists: () => [...inspectorKeys.all, 'list'] as const,
  workload: (startDate: string, endDate: string) =>
    [...inspectorKeys.all, 'workload', startDate, endDate] as const,
  schedule: (inspectorId: string | null, date: string) =>
    [...inspectorKeys.all, 'schedule', inspectorId, date] as const,
}

/**
 * Inspector schedule query keys (mobile PWA)
 * Used by: use-inspector-schedule.ts
 */
export const inspectorScheduleKeys = {
  all: ['inspector-schedule'] as const,
  day: (inspectorId: string, date: string) =>
    [...inspectorScheduleKeys.all, inspectorId, date] as const,
  inspection: (inspectionId: string) =>
    ['inspector-inspection', inspectionId] as const,
  upcoming: (inspectorId: string) =>
    ['inspector-upcoming', inspectorId] as const,
}

/**
 * Inspection template query keys
 * Used by: use-templates.ts
 */
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters?: { tier?: string; active?: boolean }) =>
    [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
}

/**
 * Checklist query keys
 * Used by: use-checklist.ts
 */
export const checklistKeys = {
  all: ['checklists'] as const,
  generated: () => [...checklistKeys.all, 'generated'] as const,
  forProperty: (propertyId: string, programId: string) =>
    [...checklistKeys.generated(), 'property', propertyId, 'program', programId] as const,
}

// ============================================================================
// REPORTS & METRICS
// ============================================================================

/**
 * Report query keys
 * Used by: use-reports.ts
 */
export const reportKeys = {
  all: ['reports'] as const,
  inspectionData: (inspectionId: string) =>
    ['inspection-report-data', inspectionId] as const,
}

/**
 * Recommendation query keys
 * Used by: use-recommendations.ts
 */
export const recommendationKeys = {
  all: ['recommendations'] as const,
  inspection: (inspectionId: string) =>
    [...recommendationKeys.all, 'inspection', inspectionId] as const,
  property: (propertyId: string) =>
    [...recommendationKeys.all, 'property', propertyId] as const,
  detail: (id: string) => ['recommendation', id] as const,
}

/**
 * Inspection metrics query keys
 * Used by: use-inspection-metrics.ts
 */
export const inspectionMetricKeys = {
  all: ['inspection-metrics'] as const,
  summary: (period: string) => [...inspectionMetricKeys.all, 'summary', period] as const,
  timeline: (period: string) => [...inspectionMetricKeys.all, 'timeline', period] as const,
  byStatus: (period: string) => [...inspectionMetricKeys.all, 'by-status', period] as const,
  byTier: (period: string) => [...inspectionMetricKeys.all, 'by-tier', period] as const,
}

/**
 * Work order metrics query keys
 * Used by: use-work-order-metrics.ts
 */
export const workOrderMetricKeys = {
  all: ['work-order-metrics'] as const,
  summary: (period: string) => [...workOrderMetricKeys.all, 'summary', period] as const,
  timeline: (period: string) => [...workOrderMetricKeys.all, 'timeline', period] as const,
  byStatus: (period: string) => [...workOrderMetricKeys.all, 'by-status', period] as const,
  byCategory: (period: string) => [...workOrderMetricKeys.all, 'by-category', period] as const,
}

/**
 * Revenue metrics query keys
 * Used by: use-revenue-metrics.ts
 */
export const revenueMetricKeys = {
  all: ['revenue-metrics'] as const,
  summary: (period: string) => [...revenueMetricKeys.all, 'summary', period] as const,
  timeline: (period: string) => [...revenueMetricKeys.all, 'timeline', period] as const,
  bySource: (period: string) => [...revenueMetricKeys.all, 'by-source', period] as const,
  byStatus: (period: string) => [...revenueMetricKeys.all, 'by-status', period] as const,
}

/**
 * Dashboard query keys
 * Used by: use-dashboard-overview.ts
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (period: string) => [...dashboardKeys.all, 'overview', period] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  upcoming: () => [...dashboardKeys.all, 'upcoming'] as const,
  overdue: () => [...dashboardKeys.all, 'overdue'] as const,
}

// ============================================================================
// WORK ORDERS & VENDORS
// ============================================================================

/**
 * Work order query keys
 * Used by: use-work-orders.ts
 */
export const workOrderKeys = {
  all: ['work-orders'] as const,
  lists: () => [...workOrderKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...workOrderKeys.lists(), filters] as const,
  details: () => [...workOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...workOrderKeys.details(), id] as const,
  property: (propertyId: string) => [...workOrderKeys.all, 'property', propertyId] as const,
  client: (clientId: string) => [...workOrderKeys.all, 'client', clientId] as const,
  vendor: (vendorId: string) => [...workOrderKeys.all, 'vendor', vendorId] as const,
  counts: () => [...workOrderKeys.all, 'counts'] as const,
}

/**
 * Vendor query keys
 * Used by: use-vendors.ts
 */
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...vendorKeys.lists(), filters] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
  search: (query: string, category?: string) =>
    [...vendorKeys.all, 'search', query, category] as const,
  byTrade: (category: string) => [...vendorKeys.all, 'trade', category] as const,
  complianceCounts: () => [...vendorKeys.all, 'compliance-counts'] as const,
}

// ============================================================================
// BILLING
// ============================================================================

/**
 * Invoice query keys
 * Used by: use-invoices.ts
 */
export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...invoiceKeys.lists(), filters] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  client: (clientId: string) => [...invoiceKeys.all, 'client', clientId] as const,
  summary: () => [...invoiceKeys.all, 'summary'] as const,
  clientBillableItems: (clientId: string) =>
    ['client-billable-items', clientId] as const,
}

/**
 * Payment query keys
 * Used by: use-payments.ts
 */
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...paymentKeys.lists(), filters] as const,
  invoice: (invoiceId: string) => [...paymentKeys.all, 'invoice', invoiceId] as const,
  client: (clientId: string) => [...paymentKeys.all, 'client', clientId] as const,
  summary: (period: string) => [...paymentKeys.all, 'summary', period] as const,
}

// ============================================================================
// PROGRAMS & PRICING
// ============================================================================

/**
 * Program query keys
 * Used by: use-programs.ts
 */
export const programKeys = {
  all: ['programs'] as const,
  lists: () => [...programKeys.all, 'list'] as const,
  property: (propertyId: string) =>
    [...programKeys.all, 'property', propertyId] as const,
  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
}

/**
 * Pricing query keys
 * Used by: use-pricing.ts
 */
export const pricingKeys = {
  all: ['pricing'] as const,
  config: () => [...pricingKeys.all, 'config'] as const,
}

// ============================================================================
// NOTIFICATIONS & ACTIVITY
// ============================================================================

/**
 * Notification query keys
 * Used by: use-notifications.ts
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: { unread?: boolean; type?: string }) =>
    [...notificationKeys.lists(), filters] as const,
  detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  summary: () => [...notificationKeys.all, 'summary'] as const,
}

/**
 * Notification preferences query keys
 * Used by: use-notification-preferences.ts
 */
export const preferencesKeys = {
  all: ['notification-preferences'] as const,
  user: (userId: string) => [...preferencesKeys.all, userId] as const,
}

/**
 * Activity log query keys
 * Used by: use-activity-log.ts
 */
export const activityKeys = {
  all: ['activity-log'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters: { entity_type?: string; user_id?: string }) =>
    [...activityKeys.lists(), filters] as const,
  entity: (entityType: string, entityId: string) =>
    [...activityKeys.all, 'entity', entityType, entityId] as const,
  recent: (limit?: number) => [...activityKeys.all, 'recent', limit] as const,
}

// ============================================================================
// PORTAL
// ============================================================================

/**
 * Client portal query keys
 * Used by: use-portal-dashboard.ts, use-portal-*.ts
 */
export const portalKeys = {
  all: ['portal'] as const,
  dashboard: () => [...portalKeys.all, 'dashboard'] as const,
  properties: () => [...portalKeys.all, 'properties'] as const,
  propertySummaries: () => [...portalKeys.all, 'property-summaries'] as const,
  property: (id: string) => [...portalKeys.properties(), id] as const,
  inspections: (filters?: { propertyId?: string }) =>
    [...portalKeys.all, 'inspections', filters] as const,
  inspection: (id: string) => [...portalKeys.all, 'inspection', id] as const,
  requests: (filters?: { status?: string }) =>
    [...portalKeys.all, 'requests', filters] as const,
  request: (id: string) => [...portalKeys.all, 'request', id] as const,
  invoices: () => [...portalKeys.all, 'invoices'] as const,
  invoice: (id: string) => [...portalKeys.all, 'invoice', id] as const,
}

// ============================================================================
// SERVICE REQUESTS
// ============================================================================

/**
 * Service request query keys
 * Used by: use-service-requests.ts
 * NOTE: Uses kebab-case 'service-requests' as root (not camelCase)
 */
export const serviceRequestKeys = {
  all: ['service-requests'] as const,
  lists: () => [...serviceRequestKeys.all, 'list'] as const,
  list: (filters: { status?: string; propertyId?: string }) =>
    [...serviceRequestKeys.lists(), filters] as const,
  details: () => [...serviceRequestKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceRequestKeys.details(), id] as const,
  comments: (requestId: string) =>
    [...serviceRequestKeys.detail(requestId), 'comments'] as const,
}

// ============================================================================
// MISC
// ============================================================================

/**
 * Organization query keys
 * Used by: use-organization.ts
 */
export const organizationKeys = {
  all: ['organizations'] as const,
  detail: (id: string) => [...organizationKeys.all, id] as const,
  current: () => [...organizationKeys.all, 'current'] as const,
}

/**
 * Profile query keys
 * Used by: use-profile.ts
 */
export const profileKeys = {
  all: ['profile'] as const,
  current: () => [...profileKeys.all, 'current'] as const,
}

/**
 * Property assignment query keys
 * Used by: use-property-assignments.ts
 */
export const assignmentKeys = {
  all: ['property-assignments'] as const,
  user: (userId: string) => [...assignmentKeys.all, 'user', userId] as const,
  property: (propertyId: string) => [...assignmentKeys.all, 'property', propertyId] as const,
}

/**
 * Photo query keys (local/offline)
 * Used by: use-photo-capture.ts
 */
export const photoKeys = {
  all: ['photos'] as const,
  local: (inspectionId: string, itemId?: string) =>
    [...photoKeys.all, 'local', inspectionId, itemId] as const,
}

// ============================================================================
// COMBINED EXPORT
// ============================================================================

/**
 * Combined queryKeys object for convenience
 * Enables `queryKeys.clients.list({})` pattern
 */
export const queryKeys = {
  // Core entities
  clients: clientKeys,
  properties: propertyKeys,
  equipment: equipmentKeys,
  users: userKeys,

  // Inspections
  inspections: inspectionKeys,
  inspectors: inspectorKeys,
  inspectorSchedule: inspectorScheduleKeys,
  templates: templateKeys,
  checklists: checklistKeys,

  // Reports & Metrics
  reports: reportKeys,
  recommendations: recommendationKeys,
  inspectionMetrics: inspectionMetricKeys,
  workOrderMetrics: workOrderMetricKeys,
  revenueMetrics: revenueMetricKeys,
  dashboard: dashboardKeys,

  // Work Orders & Vendors
  workOrders: workOrderKeys,
  vendors: vendorKeys,

  // Billing
  invoices: invoiceKeys,
  payments: paymentKeys,

  // Programs & Pricing
  programs: programKeys,
  pricing: pricingKeys,

  // Notifications & Activity
  notifications: notificationKeys,
  preferences: preferencesKeys,
  activity: activityKeys,

  // Portal
  portal: portalKeys,
  serviceRequests: serviceRequestKeys,

  // Misc
  organizations: organizationKeys,
  profile: profileKeys,
  assignments: assignmentKeys,
  photos: photoKeys,
} as const

/**
 * Type for the combined queryKeys object
 * Enables typed autocomplete when using queryKeys
 */
export type QueryKeys = typeof queryKeys
