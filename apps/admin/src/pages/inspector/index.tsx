import { useState, useEffect } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScheduleList } from '@/components/inspector/schedule-list'
import { SyncStatus } from '@/components/inspector/sync-status'
import { useOffline } from '@/hooks/use-offline'
import { useInspectorUpcoming } from '@/hooks/use-inspector-schedule'
import { useInspectorRealtimeSync } from '@/hooks/use-realtime-sync'
import { registerPWA, updateServiceWorker } from '@/lib/pwa'
import { useAuthStore } from '@/stores/auth-store'

export default function InspectorDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading: authLoading } = useAuthStore()
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  )
  useOffline() // Initialize offline detection
  const { data: upcoming } = useInspectorUpcoming()

  // Enable real-time sync for inspector data
  useInspectorRealtimeSync()

  // PWA update state
  const [needsUpdate, setNeedsUpdate] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: location }, replace: true })
    }
  }, [user, authLoading, navigate, location])

  useEffect(() => {
    registerPWA(
      () => setNeedsUpdate(true),
      () => console.log('App ready for offline use')
    )
  }, [])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rb-green" />
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  const handlePrevDay = () => {
    setSelectedDate(format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd'))
  }

  const handleNextDay = () => {
    setSelectedDate(format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd'))
  }

  const handleToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
  }

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* PWA Update Banner */}
      {needsUpdate && (
        <div className="bg-rb-green text-white p-3 flex items-center justify-between">
          <span className="text-sm">A new version is available!</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateServiceWorker(true)}
          >
            Update
          </Button>
        </div>
      )}

      {/* Header */}
      <header className="bg-rb-green text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Inspector</h1>
            <p className="text-sm text-white/80">Ross Built Home Care</p>
          </div>
          <SyncStatus compact />
        </div>
      </header>

      {/* Date Navigation */}
      <div className="border-b bg-muted/30">
        <div className="flex items-center justify-between p-3">
          <Button variant="ghost" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <button
            onClick={handleToday}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted"
          >
            <Calendar className="h-4 w-4" />
            <span className="font-medium">
              {isToday
                ? 'Today'
                : format(new Date(selectedDate), 'EEE, MMM d')}
            </span>
          </button>

          <Button variant="ghost" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Schedule List */}
      <div className="flex-1 overflow-y-auto">
        <ScheduleList date={selectedDate} />
      </div>

      {/* Bottom Sync Status */}
      <div className="border-t p-4">
        <SyncStatus />

        {/* Upcoming count */}
        {upcoming && upcoming.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {upcoming.length} inspection{upcoming.length > 1 ? 's' : ''} in the
            next 7 days
          </p>
        )}
      </div>
    </div>
  )
}
