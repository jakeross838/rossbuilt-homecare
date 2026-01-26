import { z } from 'zod'

/**
 * Validation schema for creating a new user
 */
export const createUserSchema = z
  .object({
    // Account credentials
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .max(255, 'Email must be less than 255 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be less than 72 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),

    // Profile information
    first_name: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must be less than 100 characters'),
    last_name: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must be less than 100 characters'),
    phone: z
      .string()
      .max(20, 'Phone must be less than 20 characters')
      .optional()
      .or(z.literal('')),

    // Role and access
    role: z.enum(['admin', 'manager', 'inspector', 'client'], {
      required_error: 'Please select a role',
    }),

    // For client role - link to existing client record
    client_id: z.string().uuid().optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

export type CreateUserFormData = z.infer<typeof createUserSchema>

/**
 * Validation schema for editing an existing user
 * Password is not included - use separate password reset flow
 */
export const editUserSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'manager', 'inspector', 'client'], {
    required_error: 'Please select a role',
  }),
  is_active: z.boolean(),
})

export type EditUserFormData = z.infer<typeof editUserSchema>

/**
 * Transform form data for creating a user via edge function
 */
export function transformCreateUserData(data: CreateUserFormData) {
  return {
    email: data.email,
    password: data.password,
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone || undefined,
    role: data.role,
    client_id: data.client_id || undefined,
  }
}

/**
 * Transform form data for updating a user
 */
export function transformEditUserData(data: EditUserFormData) {
  return {
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone || null,
    role: data.role,
    is_active: data.is_active,
  }
}

/**
 * Default values for create user form
 */
export const defaultCreateUserValues: Partial<CreateUserFormData> = {
  email: '',
  password: '',
  confirm_password: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: 'inspector',
  client_id: '',
}

/**
 * Role display labels
 */
export const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  inspector: 'Tech / Inspector',
  client: 'Client',
}

/**
 * Role descriptions
 */
export const roleDescriptions: Record<string, string> = {
  admin: 'Full access to all features and settings',
  manager: 'Can manage clients, properties, and staff',
  inspector: 'Can view assigned properties and perform inspections',
  client: 'Can view their own properties, billing, and work orders',
}
