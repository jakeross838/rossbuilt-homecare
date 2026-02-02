import { LoadingSpinner } from './loading-spinner'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  /** Loading message to display below spinner */
  message?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
  /** Full page height (min-h-[400px]) vs inline */
  fullPage?: boolean
}

/**
 * Standard loading state component
 *
 * Usage:
 *   if (isLoading) return <LoadingState message="Loading clients..." />
 *
 * For inline loading (smaller sections):
 *   <LoadingState size="sm" fullPage={false} />
 */
export function LoadingState({
  message = 'Loading...',
  size = 'md',
  className,
  fullPage = true,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        fullPage ? 'min-h-[400px] p-6' : 'py-8',
        className
      )}
      role="status"
      aria-label={message}
    >
      <LoadingSpinner size={size} className="mb-4" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}
