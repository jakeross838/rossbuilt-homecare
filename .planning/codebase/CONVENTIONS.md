# Coding Conventions

**Analysis Date:** 2026-01-19

## Naming Patterns

**Files:**
- Components: PascalCase for directories, kebab-case for files (e.g., `components/ui/button.tsx`, `components/layout/page-header.tsx`)
- Pages: kebab-case directories matching routes (e.g., `pages/clients/index.tsx`, `pages/work-orders/[id].tsx`)
- Hooks: kebab-case with `use-` prefix (e.g., `hooks/use-clients.ts`, `hooks/use-debounce.ts`)
- Validation schemas: kebab-case matching entity (e.g., `lib/validations/client.ts`)
- Constants: kebab-case matching domain (e.g., `lib/constants/vendor.ts`)

**Functions:**
- camelCase for all functions
- React components: PascalCase (e.g., `PageHeader`, `ClientsPage`, `EmptyState`)
- Hooks: camelCase with `use` prefix (e.g., `useClients`, `useDebounce`, `useCreateClient`)
- Event handlers: `handle` prefix (e.g., `handleSubmit`, `handleRowClick`, `handleDeleteClick`)
- Async mutation hooks: verb prefix (e.g., `useCreateClient`, `useUpdateClient`, `useDeleteClient`)

**Variables:**
- camelCase for local variables and state
- UPPER_SNAKE_CASE for constants (e.g., `TOAST_LIMIT`, `TRADE_CATEGORIES`, `COMPLIANCE_WARNING_DAYS`)
- Boolean variables: `is` prefix (e.g., `isLoading`, `isActive`, `isInitialized`)

**Types:**
- PascalCase for types and interfaces
- Suffix patterns:
  - `Props` for component props (e.g., `PageHeaderProps`, `EmptyStateProps`)
  - `State` for state types (e.g., `AuthState`, `ErrorBoundaryState`)
  - `FormData` for form data types (e.g., `ClientFormData`, `CreateVendorFormData`)
- Supabase types use `Tables<'tablename'>` helper

## Code Style

**Formatting:**
- No explicit Prettier config detected
- ESLint v9 with flat config (`eslint.config.js`)
- 2-space indentation
- Single quotes for strings in TypeScript
- Semicolons omitted (most files)
- Trailing commas used

**Linting:**
- ESLint with TypeScript support (`typescript-eslint`)
- React Hooks plugin (`eslint-plugin-react-hooks`)
- React Refresh plugin for Vite HMR (`eslint-plugin-react-refresh`)
- Key rules from `apps/admin/eslint.config.js`:
  - `js.configs.recommended`
  - `tseslint.configs.recommended`
  - `reactHooks.configs.flat.recommended`

**TypeScript:**
- Strict mode enabled
- `strictNullChecks: false` (lenient null checking)
- `noUnusedLocals: false`, `noUnusedParameters: false`
- Path alias: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. React imports (`import { useState } from 'react'`)
2. Third-party libraries (`import { useQuery } from '@tanstack/react-query'`)
3. Path-aliased internal imports (`import { Button } from '@/components/ui/button'`)
4. Relative imports (`import { ClientForm } from './components/client-form'`)

**Path Aliases:**
- `@/*` for all `src/` imports
- Use path alias for cross-directory imports
- Use relative imports for same-directory imports

**Example from `apps/admin/src/pages/clients/index.tsx`:**
```typescript
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Plus, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/layout/page-header'
import { useClients, useDeleteClient } from '@/hooks/use-clients'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from '@/hooks/use-toast'
```

## Error Handling

**Patterns:**
- Try-catch in async handlers with toast notifications
- Error boundaries at app and page level (`components/shared/error-boundary.tsx`)
- Query errors displayed inline with retry option
- Mutation errors shown via toast with `variant: 'destructive'`

**Error Handler Pattern:**
```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await mutation.mutateAsync(data)
    toast({
      title: 'Success',
      description: 'Operation completed successfully.',
    })
  } catch {
    toast({
      title: 'Error',
      description: 'Failed to complete operation. Please try again.',
      variant: 'destructive',
    })
  }
}
```

**Query Error Display:**
```typescript
if (error) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="text-destructive mb-4">Failed to load data</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  )
}
```

## Logging

**Framework:** Console logging only (no external service detected)

**Patterns:**
- `console.error()` for caught errors in production code
- No info/debug logging in components
- Error boundary logs: `console.error('ErrorBoundary caught an error:', error, errorInfo)`

## Comments

**When to Comment:**
- JSDoc for exported functions and hooks
- Inline comments for complex logic sparingly used
- Section comments for visual separation (e.g., `{/* Search */}`, `{/* Loading State */}`)

**JSDoc Pattern:**
```typescript
/**
 * Hook to fetch list of clients with optional search and active filter
 */
export function useClients(options: UseClientsOptions = {}) { ... }

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge
 * to properly handle Tailwind class conflicts
 */
export function cn(...inputs: ClassValue[]) { ... }
```

## Function Design

**Size:**
- Components: 50-150 lines typical
- Hooks: 30-100 lines typical
- Keep render logic separate from business logic

**Parameters:**
- Destructure props in function signature
- Use options objects for hooks with multiple optional params
- Default values in destructuring (e.g., `{ search, active = true } = options`)

**Return Values:**
- Hooks return objects with named properties
- Components return JSX
- Mutations return the created/updated entity

## Module Design

**Exports:**
- Named exports preferred over default exports for utilities and hooks
- Default export for page components (enables lazy loading)
- Re-export pattern for UI components

**Component Export Pattern:**
```typescript
// Named export for import { ClientsPage }
export function ClientsPage() { ... }

// Default export for route lazy loading
export default ClientsPage
```

**Hook Export Pattern:**
```typescript
// All exports named
export const clientKeys = { ... }
export function useClients() { ... }
export function useClient(id) { ... }
export function useCreateClient() { ... }
```

**Barrel Files:**
- UI components individually imported (no barrel)
- Hooks individually imported (no barrel)

## Component Patterns

**Shared Components:**
- Location: `src/components/shared/`
- Include: `EmptyState`, `LoadingSpinner`, `ConfirmDialog`, `DataTable`, `SearchInput`
- All accept `className` prop for styling override

**UI Components (shadcn/ui style):**
- Location: `src/components/ui/`
- Pattern: Wrap Radix primitives with `cn()` for className merging
- Use `forwardRef` for DOM element refs
- Use `cva` (class-variance-authority) for variants

**Button Variant Example:**
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        destructive: "bg-destructive text-destructive-foreground...",
        outline: "border border-input...",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## State Management

**Client State:**
- Zustand for global state (`stores/auth-store.ts`, `stores/ui-store.ts`)
- Persist middleware for auth state
- Pattern: State + Actions in single store

**Server State:**
- TanStack Query for all server data
- Query keys factory pattern (e.g., `clientKeys.list()`, `clientKeys.detail(id)`)
- `useMutation` with `onSuccess` cache invalidation

**Query Keys Pattern:**
```typescript
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: { search?: string }) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
}
```

## Form Patterns

**Libraries:**
- React Hook Form for form state
- Zod for validation schemas
- `@hookform/resolvers` for Zod integration

**Schema Location:** `src/lib/validations/{entity}.ts`

**Form Components:**
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` from `components/ui/form.tsx`

**Validation Pattern:**
```typescript
// lib/validations/client.ts
export const clientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
})

export type ClientFormData = z.input<typeof clientSchema>
export const defaultClientValues: ClientFormData = { ... }
export function transformClientData(data: ClientFormData) { ... }
```

## CSS/Styling

**Framework:** Tailwind CSS v4.1

**Utility Function:**
```typescript
// lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Theme Variables:**
- Defined in `src/index.css` using `@theme` directive
- CSS custom properties for colors (HSL format)
- Brand colors: `rb-green-*`, `rb-sand-*`

**Class Organization:**
1. Layout (flex, grid, positioning)
2. Spacing (margin, padding)
3. Sizing (width, height)
4. Typography (text, font)
5. Colors (bg, text, border)
6. States (hover, focus)

---

*Convention analysis: 2026-01-19*
