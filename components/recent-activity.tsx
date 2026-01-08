import { Card } from "@/components/ui/card"
import { FileText, CheckCircle2, AlertTriangle, MessageSquare } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "document",
      icon: FileText,
      title: "Blueprint updated",
      description: "Downtown Office Complex - Floor 3",
      user: "Sarah Chen",
      time: "2 hours ago",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      id: 2,
      type: "completion",
      icon: CheckCircle2,
      title: "Milestone completed",
      description: "Foundation work finished",
      user: "Mike Ross",
      time: "4 hours ago",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600",
    },
    {
      id: 3,
      type: "alert",
      icon: AlertTriangle,
      title: "Issue reported",
      description: "Material delivery delayed",
      user: "Alex Johnson",
      time: "6 hours ago",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600",
    },
    {
      id: 4,
      type: "comment",
      icon: MessageSquare,
      title: "New comment",
      description: "Response on safety inspection",
      user: "Emma Davis",
      time: "8 hours ago",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
  ]

  return (
    <Card className="p-6">
      <h3 className="mb-6 text-xl font-semibold text-foreground">Recent Activity</h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${activity.iconBg}`}>
              <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{activity.user}</span>
                <span>•</span>
                <span>{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
