import { z } from 'zod'
import { WORK_ORDER_CATEGORIES } from '@/lib/constants/work-order'
import { VENDOR_MARKUP } from '@/config/app-config'

/**
 * Schema for creating a new work order
 */
export const createWorkOrderSchema = z.object({
  property_id: z.string().uuid('Invalid property'),
  client_id: z.string().uuid('Invalid client'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  category: z
    .enum(WORK_ORDER_CATEGORIES.map((c) => c.value) as [string, ...string[]])
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  vendor_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  scheduled_date: z.string().optional().nullable(),
  scheduled_time_start: z.string().optional().nullable(),
  scheduled_time_end: z.string().optional().nullable(),
  estimated_cost: z.coerce.number().min(0).optional().nullable(),
  recommendation_id: z.string().uuid().optional().nullable(),
  internal_notes: z.string().max(2000).optional().nullable(),
})

export type CreateWorkOrderFormData = z.infer<typeof createWorkOrderSchema>

/**
 * Schema for updating a work order
 */
export const updateWorkOrderSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  category: z
    .enum(WORK_ORDER_CATEGORIES.map((c) => c.value) as [string, ...string[]])
    .optional()
    .nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().nullable(),
  status: z
    .enum([
      'pending',
      'vendor_assigned',
      'scheduled',
      'in_progress',
      'completed',
      'on_hold',
      'cancelled',
      'invoiced',
    ])
    .optional(),
  vendor_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  scheduled_date: z.string().optional().nullable(),
  scheduled_time_start: z.string().optional().nullable(),
  scheduled_time_end: z.string().optional().nullable(),
  estimated_cost: z.coerce.number().min(0).optional().nullable(),
  actual_cost: z.coerce.number().min(0).optional().nullable(),
  markup_percent: z.coerce.number().min(0).max(100).optional().nullable(),
  completion_notes: z.string().max(2000).optional().nullable(),
  internal_notes: z.string().max(2000).optional().nullable(),
  client_visible_notes: z.string().max(2000).optional().nullable(),
})

export type UpdateWorkOrderFormData = z.infer<typeof updateWorkOrderSchema>

/**
 * Schema for completing a work order
 */
export const completeWorkOrderSchema = z.object({
  actual_cost: z.coerce.number().min(0, 'Actual cost is required'),
  markup_percent: z.coerce.number().min(0).max(100).default(VENDOR_MARKUP * 100),
  completion_notes: z.string().max(2000).optional(),
})

export type CompleteWorkOrderFormData = z.infer<typeof completeWorkOrderSchema>

/**
 * Schema for assigning a vendor to a work order
 */
export const assignVendorSchema = z.object({
  vendor_id: z.string().uuid('Please select a vendor'),
  scheduled_date: z.string().optional(),
  scheduled_time_start: z.string().optional(),
  scheduled_time_end: z.string().optional(),
  estimated_cost: z.coerce.number().min(0).optional(),
  internal_notes: z.string().max(2000).optional(),
})

export type AssignVendorFormData = z.infer<typeof assignVendorSchema>

/**
 * Schema for scheduling a work order
 */
export const scheduleWorkOrderSchema = z.object({
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  scheduled_time_start: z.string().optional(),
  scheduled_time_end: z.string().optional(),
})

export type ScheduleWorkOrderFormData = z.infer<typeof scheduleWorkOrderSchema>
