import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  /** Error title */
  title?: string
  /** Error message or Error object */
  error?: string | Error | null
  /** Retry handler - if provided, shows retry button */
  onRetry?: () => void
  /** Additional CSS classes */
  className?: string
  /** Full page height vs inline */
  fullPage?: boolean
}

/**
 * Standard error state component with retry button
 *
 * Usage:
 *   if (error) return <ErrorState error={error} onRetry={refetch} />
 *
 * With custom title:
 *   <ErrorState title="Failed to load data" error={error} onRetry={refetch} />
 */
export function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
  className,
  fullPage = true,
}: ErrorStateProps) {
  // Extract error message from Error object or string
  const errorMessage = error
    ? typeof error === 'string'
      ? error
      : error.message
    : 'An unexpected error occurred. Please try again.'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        fullPage ? 'min-h-[400px] p-6' : 'py-8',
        className
      )}
      role="alert"
    >
      <div className="mb-4 rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {errorMessage}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="mt-4"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}
