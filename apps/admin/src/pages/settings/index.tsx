import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Building2,
  User,
  DollarSign,
  FileText,
  Bell,
  Users,
  Shield,
} from 'lucide-react'

interface SettingsLink {
  title: string
  description: string
  href: string
  icon: React.ElementType
}

const settingsLinks: SettingsLink[] = [
  {
    title: 'Organization',
    description: 'Company name, contact info, and address',
    href: '/settings/organization',
    icon: Building2,
  },
  {
    title: 'Profile',
    description: 'Your account settings, password, and preferences',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Users',
    description: 'Manage user accounts, roles, and access',
    href: '/settings/users',
    icon: Users,
  },
  {
    title: 'Permissions',
    description: 'View and manage property assignments',
    href: '/settings/permissions',
    icon: Shield,
  },
  {
    title: 'Pricing',
    description: 'Inspection tiers, frequencies, and addon pricing',
    href: '/settings/pricing',
    icon: DollarSign,
  },
  {
    title: 'Templates',
    description: 'Inspection checklist templates and customization',
    href: '/settings/templates',
    icon: FileText,
  },
  {
    title: 'Notifications',
    description: 'Email and notification preferences',
    href: '/settings/notifications',
    icon: Bell,
  },
]

export default function SettingsPage() {
  return (
    <div className="container py-6">
      <PageHeader
        title="Settings"
        description="Manage your organization and account settings"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {settingsLinks.map((link) => (
          <Link key={link.href} to={link.href}>
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <link.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {link.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
