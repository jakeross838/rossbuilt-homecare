/**
 * Scheduling constants for the calendar and inspection scheduling
 * Based on Home Care OS scheduling requirements
 */

/**
 * Time slots for scheduling grid (7am to 6pm, hourly)
 */
export const TIME_SLOTS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
] as const

/**
 * Time slot labels for display
 */
export const TIME_SLOT_LABELS: Record<(typeof TIME_SLOTS)[number], string> = {
  '07:00': '7:00 AM',
  '08:00': '8:00 AM',
  '09:00': '9:00 AM',
  '10:00': '10:00 AM',
  '11:00': '11:00 AM',
  '12:00': '12:00 PM',
  '13:00': '1:00 PM',
  '14:00': '2:00 PM',
  '15:00': '3:00 PM',
  '16:00': '4:00 PM',
  '17:00': '5:00 PM',
  '18:00': '6:00 PM',
}

/**
 * Inspection types matching the database column values
 * inspection_type TEXT: 'scheduled', 'storm_pre', 'storm_post', 'arrival', 'departure', 'special', 'initial'
 */
export const INSPECTION_TYPES = {
  scheduled: {
    value: 'scheduled',
    label: 'Scheduled',
    description: 'Regular scheduled inspection',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
  },
  storm_pre: {
    value: 'storm_pre',
    label: 'Pre-Storm',
    description: 'Pre-storm preparation inspection',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
  },
  storm_post: {
    value: 'storm_post',
    label: 'Post-Storm',
    description: 'Post-storm damage assessment',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
  },
  arrival: {
    value: 'arrival',
    label: 'Arrival',
    description: 'Owner arrival preparation inspection',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
  },
  departure: {
    value: 'departure',
    label: 'Departure',
    description: 'Owner departure close-up inspection',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
  },
  special: {
    value: 'special',
    label: 'Special',
    description: 'Special request or ad-hoc inspection',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
  },
  initial: {
    value: 'initial',
    label: 'Initial',
    description: 'Initial property onboarding inspection',
    color: 'teal',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-300',
  },
} as const

/**
 * Inspection types array for dropdowns and iteration
 */
export const INSPECTION_TYPES_LIST = Object.values(INSPECTION_TYPES)

/**
 * Default inspection durations in minutes by tier
 */
export const INSPECTION_DURATIONS = {
  visual: {
    tier: 'visual',
    label: 'Visual',
    defaultMinutes: 30,
    minMinutes: 15,
    maxMinutes: 60,
  },
  functional: {
    tier: 'functional',
    label: 'Functional',
    defaultMinutes: 60,
    minMinutes: 30,
    maxMinutes: 120,
  },
  comprehensive: {
    tier: 'comprehensive',
    label: 'Comprehensive',
    defaultMinutes: 90,
    minMinutes: 60,
    maxMinutes: 180,
  },
  preventative: {
    tier: 'preventative',
    label: 'Preventative',
    defaultMinutes: 120,
    minMinutes: 90,
    maxMinutes: 240,
  },
} as const

/**
 * Calendar color palette for events and UI elements
 * Uses rb-green variants (brand color) and neutral grays
 */
export const CALENDAR_COLORS = {
  // Brand colors
  primary: {
    bg: 'bg-rb-green-100',
    text: 'text-rb-green-700',
    border: 'border-rb-green-300',
    accent: 'bg-rb-green-500',
  },
  // Status colors
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    accent: 'bg-blue-500',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    accent: 'bg-green-500',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    accent: 'bg-yellow-500',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
    accent: 'bg-orange-500',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
    accent: 'bg-purple-500',
  },
  teal: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-300',
    accent: 'bg-teal-500',
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    accent: 'bg-gray-500',
  },
} as const

/**
 * Inspection status colors matching inspection_status enum
 * 'scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'
 */
export const INSPECTION_STATUS_COLORS = {
  scheduled: {
    status: 'scheduled',
    label: 'Scheduled',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    dotColor: 'bg-blue-500',
  },
  in_progress: {
    status: 'in_progress',
    label: 'In Progress',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    dotColor: 'bg-yellow-500',
  },
  completed: {
    status: 'completed',
    label: 'Completed',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    dotColor: 'bg-green-500',
  },
  cancelled: {
    status: 'cancelled',
    label: 'Cancelled',
    color: 'gray',
    bgColor: 'bg-gray-200',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    dotColor: 'bg-gray-500',
  },
  rescheduled: {
    status: 'rescheduled',
    label: 'Rescheduled',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    dotColor: 'bg-orange-500',
  },
} as const

/**
 * Type exports for type inference
 */
export type TimeSlotValue = (typeof TIME_SLOTS)[number]
export type InspectionTypeKey = keyof typeof INSPECTION_TYPES
export type InspectionStatusKey = keyof typeof INSPECTION_STATUS_COLORS
export type CalendarColorKey = keyof typeof CALENDAR_COLORS
export type InspectionTierKey = keyof typeof INSPECTION_DURATIONS
