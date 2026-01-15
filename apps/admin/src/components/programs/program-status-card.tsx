import { useState } from 'react'
import { format } from 'date-fns'
import {
  usePropertyProgram,
  usePauseProgram,
  useResumeProgram,
  useCancelProgram,
} from '@/hooks/use-programs'
import {
  INSPECTION_FREQUENCIES,
  INSPECTION_TIERS,
  PROGRAM_ADDONS,
} from '@/lib/constants/pricing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreHorizontal,
  Pause,
  Play,
  X,
  Settings,
  Calendar,
  DollarSign,
  CheckCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ProgramStatusCardProps {
  propertyId: string
  onEdit?: () => void
}

export function ProgramStatusCard({
  propertyId,
  onEdit,
}: ProgramStatusCardProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const { toast } = useToast()

  const { data: program, isLoading } = usePropertyProgram(propertyId)
  const pauseProgram = usePauseProgram()
  const resumeProgram = useResumeProgram()
  const cancelProgram = useCancelProgram()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    )
  }

  if (!program) {
    return null // No program, parent will show builder
  }

  const frequency = INSPECTION_FREQUENCIES.find(
    (f) => f.value === program.inspection_frequency
  )
  const tier = INSPECTION_TIERS.find(
    (t) => t.value === program.inspection_tier
  )

  const activeAddons = PROGRAM_ADDONS.filter(
    (addon) =>
      program[`addon_${addon.value}` as keyof typeof program] === true
  )

  const handlePause = async () => {
    try {
      await pauseProgram.mutateAsync(program.id)
      toast({
        title: 'Program paused',
        description: 'The home care program has been paused.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to pause program',
        variant: 'destructive',
      })
    }
  }

  const handleResume = async () => {
    try {
      await resumeProgram.mutateAsync(program.id)
      toast({
        title: 'Program resumed',
        description: 'The home care program has been resumed.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to resume program',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = async () => {
    try {
      await cancelProgram.mutateAsync(program.id)
      setShowCancelDialog(false)
      toast({
        title: 'Program cancelled',
        description: 'The home care program has been cancelled.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to cancel program',
        variant: 'destructive',
      })
    }
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    pending: 'bg-blue-500',
    cancelled: 'bg-gray-500',
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold">
            Home Care Program
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              className={`${program.status ? statusColors[program.status] : 'bg-gray-500'} text-white`}
            >
              {program.status || 'unknown'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Program
                </DropdownMenuItem>
                {program.status === 'active' && (
                  <DropdownMenuItem onClick={handlePause}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Program
                  </DropdownMenuItem>
                )}
                {program.status === 'paused' && (
                  <DropdownMenuItem onClick={handleResume}>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Program
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Program
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Program Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{frequency?.label}</p>
                <p className="text-xs text-muted-foreground">
                  {frequency?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{tier?.label}</p>
                <p className="text-xs text-muted-foreground">Inspection Tier</p>
              </div>
            </div>
          </div>

          {/* Active Add-ons */}
          {activeAddons.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Active Add-Ons</p>
                <div className="flex flex-wrap gap-2">
                  {activeAddons.map((addon) => (
                    <Badge key={addon.value} variant="secondary">
                      {addon.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Pricing */}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Monthly Fee</span>
            </div>
            <span className="text-lg font-semibold">
              ${program.monthly_total?.toFixed(2) || '0.00'}
            </span>
          </div>

          {/* Dates */}
          {program.activated_at && (
            <p className="text-xs text-muted-foreground">
              Active since {format(new Date(program.activated_at), 'MMM d, yyyy')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this home care program? This will
              stop all scheduled inspections and billing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Program</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Program
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
