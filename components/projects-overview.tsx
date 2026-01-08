import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { MoreVertical, MapPin, Calendar } from "lucide-react"

export function ProjectsOverview() {
  const projects = [
    {
      id: 1,
      name: "Downtown Office Complex",
      location: "Portland, OR",
      progress: 75,
      status: "On Track",
      statusColor: "default",
      deadline: "Dec 15, 2026",
      budget: "$2.4M",
    },
    {
      id: 2,
      name: "Residential Tower - Phase 2",
      location: "Seattle, WA",
      progress: 45,
      status: "In Progress",
      statusColor: "secondary",
      deadline: "Mar 30, 2027",
      budget: "$5.8M",
    },
    {
      id: 3,
      name: "Bridge Renovation",
      location: "Eugene, OR",
      progress: 92,
      status: "Near Completion",
      statusColor: "default",
      deadline: "Jan 20, 2026",
      budget: "$1.2M",
    },
  ]

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Active Projects</h3>
          <p className="mt-1 text-sm text-muted-foreground">Track progress across your construction sites</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-foreground">{project.name}</h4>
                  <Badge variant={project.statusColor as any}>{project.status}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{project.deadline}</span>
                  </div>
                  <div className="font-medium text-foreground">{project.budget}</div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </div>

              <Button variant="ghost" size="icon" className="ml-4">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
