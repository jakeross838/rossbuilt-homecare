import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRecentActivity, useActivityLogInfinite } from '@/hooks/use-activity-log'
import { ACTIVITY_ACTION_LABELS, ENTITY_TYPE_LABELS, ENTITY_TYPE_ROUTES } from '@/lib/constants/notifications'
import { formatNotificationTime } from '@/lib/helpers/notifications'
import type { ActivityLogEntry, ActivityEntityType } from '@/lib/types/notification'

interface ActivityFeedProps {
  limit?: number
  entityType?: ActivityEntityType
  showLoadMore?: boolean
  maxHeight?: string
}

function ActivityItem({ entry }: { entry: ActivityLogEntry }) {
  const navigate = useNavigate()

  const handleClick = () => {
    const route = ENTITY_TYPE_ROUTES[entry.entity_type]
    if (route && entry.entity_id) {
      navigate(`${route}/${entry.entity_id}`)
    }
  }

  const actionLabel = ACTIVITY_ACTION_LABELS[entry.action] ?? entry.action
  const entityLabel = ENTITY_TYPE_LABELS[entry.entity_type] ?? entry.entity_type

  return (
    <div
      onClick={handleClick}
      className="flex items-start gap-3 py-3 px-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/30 mt-2" />
        <div className="w-px flex-1 bg-muted-foreground/20" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{entry.user_name}</span>{' '}
          <span className="text-muted-foreground">{actionLabel}</span>{' '}
          <span className="font-medium">{entityLabel.toLowerCase()}</span>
          {entry.entity_name && (
            <>
              {' '}
              <span className="text-muted-foreground">&quot;</span>
              <span className="font-medium">{entry.entity_name}</span>
              <span className="text-muted-foreground">&quot;</span>
            </>
          )}
        </p>

        {/* Show changes if any */}
        {entry.changes && Object.keys(entry.changes).length > 0 && (
          <div className="mt-1 text-xs text-muted-foreground">
            Changed:{' '}
            {Object.keys(entry.changes)
              .slice(0, 3)
              .join(', ')}
            {Object.keys(entry.changes).length > 3 && '...'}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-1">
          {formatNotificationTime(entry.created_at)}
        </p>
      </div>
    </div>
  )
}

export function ActivityFeed({
  limit = 20,
  entityType,
  showLoadMore = false,
  maxHeight = '400px',
}: ActivityFeedProps) {
  const { data: simpleData, isLoading: simpleLoading } = useRecentActivity(limit)

  const {
    data: infiniteData,
    isLoading: infiniteLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useActivityLogInfinite({
    entity_type: entityType,
    pageSize: limit,
  })

  const isLoading = showLoadMore ? infiniteLoading : simpleLoading
  const entries = showLoadMore
    ? infiniteData?.pages.flat() ?? []
    : simpleData ?? []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    )
  }

  return (
    <div>
      <ScrollArea style={{ maxHeight }}>
        <div className="space-y-1 pr-4">
          {entries.map((entry) => (
            <ActivityItem key={entry.id} entry={entry} />
          ))}
        </div>
      </ScrollArea>

      {showLoadMore && hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Compact activity feed for cards/sidebars
 */
export function CompactActivityFeed({ limit = 5 }: { limit?: number }) {
  const navigate = useNavigate()
  const { data: entries = [], isLoading } = useRecentActivity(limit)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No recent activity
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const actionLabel = ACTIVITY_ACTION_LABELS[entry.action] ?? entry.action
        const entityLabel = ENTITY_TYPE_LABELS[entry.entity_type] ?? entry.entity_type

        return (
          <div
            key={entry.id}
            className="text-sm py-1"
          >
            <span className="font-medium">{entry.user_name}</span>{' '}
            <span className="text-muted-foreground">{actionLabel}</span>{' '}
            <span>{entityLabel.toLowerCase()}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {formatNotificationTime(entry.created_at)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
