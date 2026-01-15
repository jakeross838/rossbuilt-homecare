import {
  Users,
  Building2,
  ClipboardCheck,
  Wrench,
  Calendar,
  TrendingUp,
} from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    label: string
  }
}

function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            <TrendingUp className="h-3 w-3 text-rb-green-500" />
            <span className="text-rb-green-600 font-medium">
              +{trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ActivityItem {
  id: string
  type: 'inspection' | 'work_order' | 'client' | 'property'
  title: string
  description: string
  timestamp: string
}

// Placeholder activity data
const recentActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'inspection',
    title: 'Inspection completed',
    description: '1234 Ocean View Dr - Monthly inspection',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    type: 'work_order',
    title: 'Work order created',
    description: 'HVAC maintenance at 567 Mountain Rd',
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    type: 'client',
    title: 'New client added',
    description: 'Johnson Family joined Ross Built',
    timestamp: 'Yesterday',
  },
  {
    id: '4',
    type: 'property',
    title: 'Property enrolled',
    description: '890 Lakeside Estate added to Premium program',
    timestamp: 'Yesterday',
  },
]

function getActivityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'inspection':
      return ClipboardCheck
    case 'work_order':
      return Wrench
    case 'client':
      return Users
    case 'property':
      return Building2
  }
}

export function DashboardPage() {
  const profile = useAuthStore((state) => state.profile)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const displayName = profile?.first_name || 'there'

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${displayName}`}
        description="Here's what's happening with your properties today."
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Clients"
          value="-"
          description="Total enrolled clients"
          icon={Users}
        />
        <StatCard
          title="Properties"
          value="-"
          description="Under management"
          icon={Building2}
        />
        <StatCard
          title="Inspections"
          value="-"
          description="Completed this month"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Work Orders"
          value="-"
          description="Open orders"
          icon={Wrench}
        />
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Schedule
            </CardTitle>
            <CardDescription>
              Your inspections and appointments for this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming inspections scheduled</p>
              <p className="text-sm mt-2">
                Schedule your first inspection to get started
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across your properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="rounded-full bg-muted p-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.timestamp}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
