import { z } from 'zod'

/**
 * Service request validation schemas for client portal
 */

// Create service request (from client)
export const createServiceRequestSchema = z.object({
  property_id: z.string().uuid('Please select a property'),
  request_type: z.enum([
    'maintenance',
    'emergency',
    'storm_prep',
    'arrival',
    'departure',
    'question',
    'other',
  ], { message: 'Please select a request type' }),
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(2000, 'Description must be less than 2000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  photos: z.array(z.string().url()).max(10, 'Maximum 10 photos allowed').optional(),
})

export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>

// Add comment to service request
export const addServiceRequestCommentSchema = z.object({
  service_request_id: z.string().uuid(),
  comment: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters'),
})

export type AddServiceRequestCommentInput = z.infer<typeof addServiceRequestCommentSchema>

// Recommendation response from client
export const recommendationResponseSchema = z.object({
  recommendation_id: z.string().uuid(),
  status: z.enum(['approved', 'declined']),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
})

export type RecommendationResponseInput = z.infer<typeof recommendationResponseSchema>
