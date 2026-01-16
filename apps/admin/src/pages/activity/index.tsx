import { useState } from 'react'
import { Activity, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityFeed } from '@/components/notifications'
import { ENTITY_TYPE_LABELS } from '@/lib/constants/notifications'
import type { ActivityEntityType } from '@/lib/types/notification'

export default function ActivityPage() {
  const [entityFilter, setEntityFilter] = useState<ActivityEntityType | 'all'>('all')

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground">
            Track all actions and changes in your organization
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={entityFilter}
              onValueChange={(v) => setEntityFilter(v as ActivityEntityType | 'all')}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All activity</SelectItem>
                {Object.entries(ENTITY_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            A timeline of all actions in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed
            entityType={entityFilter === 'all' ? undefined : entityFilter}
            showLoadMore
            maxHeight="600px"
          />
        </CardContent>
      </Card>
    </div>
  )
}
