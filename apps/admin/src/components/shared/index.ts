/**
 * Shared Components Barrel Export
 *
 * Re-exports all shared components for convenient imports:
 *   import { LoadingState, ErrorState, ActionButton } from '@/components/shared'
 */

// Data state components (SYNC-08)
export { LoadingState } from './loading-state'
export { ErrorState } from './error-state'
export { EmptyState } from './empty-state'

// Loading indicator
export { LoadingSpinner } from './loading-spinner'

// Action components (SYNC-07)
export { ActionButton, type ActionButtonProps } from './action-button'

// Other shared components
export { ConfirmDialog } from './confirm-dialog'
export { DataTable } from './data-table'
export { SearchInput } from './search-input'

// Error handling
export { ErrorBoundary, PageErrorBoundary } from './error-boundary'
