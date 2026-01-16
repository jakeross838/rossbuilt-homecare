import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Settings, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { NotificationBadge } from './notification-badge'
import { NotificationItem } from './notification-item'
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAllNotificationsRead,
  useNotificationSubscription,
} from '@/hooks/use-notifications'
import { groupNotificationsByDate } from '@/lib/helpers/notifications'
import { useToast } from '@/hooks/use-toast'

export function NotificationDropdown() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const { data: notifications = [], isLoading } = useNotifications({ limit: 20 })
  const { data: unreadCount = 0 } = useUnreadNotificationCount()
  const markAllRead = useMarkAllNotificationsRead()

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(notifications)

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = useNotificationSubscription((notification) => {
      toast({
        title: notification.title,
        description: notification.message,
      })
    })

    return unsubscribe
  }, [toast])

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync()
  }

  const handleViewAll = () => {
    setOpen(false)
    navigate('/notifications')
  }

  const handleSettings = () => {
    setOpen(false)
    navigate('/settings/notifications')
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <NotificationBadge />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
              >
                {markAllRead.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSettings}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notification list */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedNotifications).map(([group, items]) => (
                <div key={group}>
                  <p className="text-xs font-medium text-muted-foreground px-2 py-2">
                    {group}
                  </p>
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClose={() => setOpen(false)}
                      compact
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={handleViewAll}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
