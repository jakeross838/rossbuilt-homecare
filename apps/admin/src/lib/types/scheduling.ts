/**
 * TypeScript types for calendar and scheduling UI
 * Based on Home Care OS inspection scheduling requirements
 */

import type { Enums } from '@/types/database'

/**
 * Inspection with joined relations for calendar display
 * Represents an inspection as displayed on the calendar
 */
export interface CalendarInspection {
  id: string
  property_id: string
  program_id: string | null
  inspector_id: string | null
  inspection_type: string
  status: Enums<'inspection_status'> | null
  scheduled_date: string
  scheduled_time_start: string | null
  scheduled_time_end: string | null
  estimated_duration_minutes: number | null
  // Joined data for display
  property?: {
    id: string
    name: string
    address_line1: string
    city: string
  }
  inspector?: {
    id: string
    full_name: string | null
    email: string
  }
}

/**
 * Calendar view modes for switching between views
 */
export type CalendarViewMode = 'month' | 'week' | 'day'

/**
 * Represents a single day in the calendar
 */
export interface CalendarDay {
  date: Date
  dateString: string // ISO date string (YYYY-MM-DD)
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  inspections: CalendarInspection[]
}

/**
 * Represents a week in the calendar
 */
export interface CalendarWeek {
  weekNumber: number
  days: CalendarDay[]
}

/**
 * Calendar month data structure
 */
export interface CalendarMonth {
  year: number
  month: number // 0-11
  weeks: CalendarWeek[]
}

/**
 * Inspector workload for availability display
 * Used to show how busy an inspector is on a given day
 */
export interface InspectorWorkload {
  inspector_id: string
  inspector_name: string
  date: string
  inspection_count: number
  total_duration_minutes: number
  inspections: CalendarInspection[]
}

/**
 * Time slot for scheduling grid (day view)
 */
export interface TimeSlot {
  time: string // HH:MM format
  label: string // Display label (e.g., "9:00 AM")
  inspections: CalendarInspection[]
}

/**
 * Day view data with time slots
 */
export interface DayViewData {
  date: Date
  dateString: string
  timeSlots: TimeSlot[]
}

/**
 * Filter options for calendar
 */
export interface CalendarFilters {
  inspector_id?: string
  inspection_type?: string
  status?: Enums<'inspection_status'>
  property_id?: string
}

/**
 * Drag and drop context for rescheduling
 */
export interface DragDropContext {
  inspection: CalendarInspection
  sourceDate: string
  targetDate: string
  targetTime?: string
}

/**
 * Calendar navigation state
 */
export interface CalendarNavigation {
  currentDate: Date
  viewMode: CalendarViewMode
  selectedDate?: Date
}

/**
 * Scheduling conflict information
 */
export interface SchedulingConflict {
  type: 'overlap' | 'capacity' | 'availability'
  message: string
  conflictingInspection?: CalendarInspection
}

/**
 * Quick schedule options for common actions
 */
export interface QuickScheduleOption {
  label: string
  date: Date
  time?: string
  description?: string
}
