import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

export function TeamMembers() {
  const members = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Project Manager",
      initials: "SC",
      status: "active",
      projects: 4,
    },
    {
      id: 2,
      name: "Mike Ross",
      role: "Site Supervisor",
      initials: "MR",
      status: "active",
      projects: 3,
    },
    {
      id: 3,
      name: "Alex Johnson",
      role: "Safety Officer",
      initials: "AJ",
      status: "active",
      projects: 8,
    },
    {
      id: 4,
      name: "Emma Davis",
      role: "Lead Engineer",
      initials: "ED",
      status: "active",
      projects: 5,
    },
  ]

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Team Members</h3>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {member.projects} projects
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
