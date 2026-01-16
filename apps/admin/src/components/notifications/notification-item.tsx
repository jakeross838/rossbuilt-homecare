import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ClipboardCheck,
  Wrench,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  Clock,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useMarkNotificationRead, useDeleteNotification } from '@/hooks/use-notifications'
import {
  formatNotificationTime,
  getNotificationColor,
  getPriorityStyles,
} from '@/lib/helpers/notifications'
import type { Notification, NotificationType, PriorityLevel } from '@/lib/types/notification'

interface NotificationItemProps {
  notification: Notification
  onClose?: () => void
  compact?: boolean
}

const iconMap: Record<NotificationType, typeof Bell> = {
  inspection: ClipboardCheck,
  work_order: Wrench,
  payment: CreditCard,
  reminder: Clock,
  alert: AlertTriangle,
  message: MessageSquare,
}

export function NotificationItem({
  notification,
  onClose,
  compact = false,
}: NotificationItemProps) {
  const navigate = useNavigate()
  const markRead = useMarkNotificationRead()
  const deleteNotification = useDeleteNotification()

  const Icon = iconMap[notification.notification_type] || Bell
  const colorClass = getNotificationColor(notification.notification_type)
  const priorityStyles = getPriorityStyles(notification.priority as PriorityLevel ?? 'medium')

  const handleClick = async () => {
    // Mark as read if unread
    if (!notification.is_read) {
      await markRead.mutateAsync(notification.id)
    }

    // Navigate if action URL exists
    if (notification.action_url) {
      navigate(notification.action_url)
      onClose?.()
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteNotification.mutateAsync(notification.id)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex gap-3 p-3 cursor-pointer transition-colors rounded-lg',
        notification.is_read
          ? 'bg-background hover:bg-muted/50'
          : 'bg-muted/50 hover:bg-muted',
        compact && 'p-2'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 flex items-center justify-center rounded-full',
          compact ? 'h-8 w-8' : 'h-10 w-10',
          notification.is_read ? 'bg-muted' : priorityStyles.bgColor
        )}
      >
        <Icon className={cn('h-4 w-4', colorClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm line-clamp-1',
              !notification.is_read && 'font-medium'
            )}
          >
            {notification.title}
          </p>
          {!compact && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatNotificationTime(notification.created_at ?? '')}
          </span>

          {!notification.is_read && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          )}

          {notification.priority === 'urgent' && (
            <span className="text-xs text-red-600 font-medium">Urgent</span>
          )}
        </div>
      </div>
    </div>
  )
}
