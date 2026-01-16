import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationPreferences } from '@/components/notifications'

export default function NotificationSettingsPage() {
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
        </Button>

        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage how and when you receive notifications
        </p>
      </div>

      <NotificationPreferences />
    </div>
  )
}
