/**
 * Client portal constants
 */

// Service request types
export const SERVICE_REQUEST_TYPES = [
  { value: 'maintenance', label: 'Maintenance Request', description: 'General home maintenance needs' },
  { value: 'emergency', label: 'Emergency', description: 'Urgent issues requiring immediate attention' },
  { value: 'storm_prep', label: 'Storm Preparation', description: 'Pre-storm preparation services' },
  { value: 'arrival', label: 'Arrival Preparation', description: 'Prepare home for your arrival' },
  { value: 'departure', label: 'Departure Services', description: 'Services when leaving the property' },
  { value: 'question', label: 'Question', description: 'General questions about your property' },
  { value: 'other', label: 'Other', description: 'Other requests' },
] as const

export type ServiceRequestType = typeof SERVICE_REQUEST_TYPES[number]['value']

// Service request status display config
export const SERVICE_REQUEST_STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800', description: 'Request submitted' },
  acknowledged: { label: 'Acknowledged', color: 'bg-purple-100 text-purple-800', description: 'We\'ve received your request' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', description: 'Being worked on' },
  scheduled: { label: 'Scheduled', color: 'bg-cyan-100 text-cyan-800', description: 'Work has been scheduled' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', description: 'Request completed' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600', description: 'Request cancelled' },
} as const

// Recommendation response options for client
export const RECOMMENDATION_RESPONSES = [
  { value: 'approved', label: 'Approve', description: 'Proceed with this recommendation' },
  { value: 'declined', label: 'Decline', description: 'Do not proceed at this time' },
] as const

// Portal navigation items
export const PORTAL_NAV_ITEMS = [
  { label: 'Dashboard', href: '/portal', icon: 'LayoutDashboard' },
  { label: 'Properties', href: '/portal/properties', icon: 'Home' },
  { label: 'Inspections', href: '/portal/inspections', icon: 'ClipboardCheck' },
  { label: 'Service Requests', href: '/portal/requests', icon: 'MessageSquare' },
  { label: 'Invoices', href: '/portal/invoices', icon: 'Receipt' },
] as const

// Condition rating display for client-friendly language
export const CONDITION_DISPLAY = {
  excellent: { label: 'Excellent', description: 'No issues found', color: 'text-green-600' },
  good: { label: 'Good', description: 'Minor items noted', color: 'text-green-500' },
  fair: { label: 'Fair', description: 'Some attention needed', color: 'text-yellow-600' },
  needs_attention: { label: 'Needs Attention', description: 'Issues requiring action', color: 'text-orange-500' },
  poor: { label: 'Poor', description: 'Significant issues present', color: 'text-red-600' },
} as const

// Priority display for clients
export const PRIORITY_DISPLAY = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
} as const
