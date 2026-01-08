import { Card } from "@/components/ui/card"
import { Building, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export function StatsCards() {
  const stats = [
    {
      label: "Active Projects",
      value: "12",
      change: "+2 this month",
      icon: Building,
      trend: "up",
    },
    {
      label: "In Progress",
      value: "8",
      change: "67% completion",
      icon: Clock,
      trend: "neutral",
    },
    {
      label: "Completed",
      value: "24",
      change: "+4 this month",
      icon: CheckCircle2,
      trend: "up",
    },
    {
      label: "Issues",
      value: "3",
      change: "Needs attention",
      icon: AlertCircle,
      trend: "down",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
