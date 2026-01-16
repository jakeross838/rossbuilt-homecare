import { useState } from 'react'
import { Bell, Trash2, Check, Filter, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationItem } from '@/components/notifications'
import {
  useNotifications,
  useMarkAllNotificationsRead,
  useClearReadNotifications,
} from '@/hooks/use-notifications'
import { NOTIFICATION_TYPE_CONFIG } from '@/lib/constants/notifications'
import type { NotificationType } from '@/lib/types/notification'

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationType | 'all'>('all')
  const [tab, setTab] = useState<'all' | 'unread'>('all')

  const { data: notifications = [], isLoading } = useNotifications({
    unread: tab === 'unread',
    type: filter === 'all' ? undefined : filter,
    limit: 100,
  })

  const markAllRead = useMarkAllNotificationsRead()
  const clearRead = useClearReadNotifications()

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutateAsync()}
              disabled={markAllRead.isPending}
            >
              {markAllRead.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Mark all read
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear read
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear read notifications?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all read notifications. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => clearRead.mutateAsync()}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'unread')}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  {unreadCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 ml-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filter}
                onValueChange={(v) => setFilter(v as NotificationType | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.entries(NOTIFICATION_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-muted-foreground mt-1">
                {tab === 'unread'
                  ? "You've read all your notifications"
                  : 'You have no notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification.id} className="px-2">
                  <NotificationItem notification={notification} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
