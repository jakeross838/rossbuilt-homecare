import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ActionButtonProps extends ButtonProps {
  /** Whether the action is in progress */
  isPending?: boolean
  /** Text to show while loading (defaults to "Loading...") */
  loadingText?: string
}

/**
 * Button component with built-in loading state for mutations
 *
 * Usage:
 *   <ActionButton
 *     isPending={mutation.isPending}
 *     loadingText="Saving..."
 *     onClick={() => mutation.mutate(data)}
 *   >
 *     Save Changes
 *   </ActionButton>
 *
 * Implements SYNC-07:
 * - SYNC-07.1: ActionButton component with isPending prop
 * - SYNC-07.2: disabled={isPending} when loading
 * - SYNC-07.3: Shows loading text while pending
 */
const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ isPending, loadingText = 'Loading...', children, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isPending}
        className={cn(className)}
        {...props}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </Button>
    )
  }
)

ActionButton.displayName = 'ActionButton'

export { ActionButton }
