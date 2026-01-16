import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnreadNotificationCount } from '@/hooks/use-notifications'

interface NotificationBadgeProps {
  className?: string
  showCount?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function NotificationBadge({
  className,
  showCount = true,
  size = 'md',
}: NotificationBadgeProps) {
  const { data: count = 0 } = useUnreadNotificationCount()

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const badgeSizeClasses = {
    sm: 'h-3.5 w-3.5 text-[9px] -top-0.5 -right-0.5',
    md: 'h-4 w-4 text-[10px] -top-1 -right-1',
    lg: 'h-5 w-5 text-xs -top-1 -right-1',
  }

  return (
    <div className={cn('relative', className)}>
      <Bell className={cn('text-muted-foreground', sizeClasses[size])} />
      {showCount && count > 0 && (
        <span
          className={cn(
            'absolute flex items-center justify-center rounded-full bg-red-500 text-white font-medium',
            badgeSizeClasses[size]
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  )
}
