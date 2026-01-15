import { z } from 'zod'

// Report generation options schema
export const reportOptionsSchema = z.object({
  include_photos: z.boolean().default(true),
  include_recommendations: z.boolean().default(true),
  include_ai_summary: z.boolean().default(true),
  include_weather: z.boolean().default(true),
  photo_quality: z.enum(['thumbnail', 'medium', 'full']).default('medium'),
  page_size: z.enum(['letter', 'a4']).default('letter'),
})

export type ReportOptionsInput = z.infer<typeof reportOptionsSchema>

// Report delivery options schema
export const reportDeliverySchema = z.object({
  send_email: z.boolean().default(false),
  email_to: z.array(z.string().email()).default([]),
  email_subject: z.string().optional(),
  email_message: z.string().optional(),
})

export type ReportDeliveryInput = z.infer<typeof reportDeliverySchema>

// Generate report request schema
export const generateReportSchema = z.object({
  inspection_id: z.string().uuid(),
  options: reportOptionsSchema.partial().optional(),
  delivery: reportDeliverySchema.partial().optional(),
})

export type GenerateReportInput = z.infer<typeof generateReportSchema>

// Email report schema
export const emailReportSchema = z.object({
  report_id: z.string().uuid(),
  to: z.array(z.string().email()).min(1, 'At least one email required'),
  subject: z.string().min(1, 'Subject required'),
  message: z.string().optional(),
})

export type EmailReportInput = z.infer<typeof emailReportSchema>
