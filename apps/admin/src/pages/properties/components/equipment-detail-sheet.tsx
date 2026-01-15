import { format } from 'date-fns'
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Tables } from '@/lib/supabase'

type Equipment = Tables<'equipment'>

interface MaintenanceTask {
  task: string
  frequency: string
  performer: string
  estimated_cost_low: number
  estimated_cost_high: number
  notes?: string
  priority: 'low' | 'medium' | 'high'
}

interface TroubleshootingItem {
  symptom: string
  likely_cause: string
  action: string
  urgency: 'low' | 'medium' | 'high'
}

interface InspectionChecklist {
  visual?: string[]
  functional?: string[]
  comprehensive?: string[]
  preventative?: string[]
}

interface EquipmentDetailSheetProps {
  equipment: Equipment
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerateAI: () => void
  isGenerating: boolean
}

/**
 * Equipment detail sheet displaying specifications, maintenance schedules,
 * inspection checklists, and troubleshooting guides
 */
export function EquipmentDetailSheet({
  equipment,
  open,
  onOpenChange,
  onGenerateAI,
  isGenerating,
}: EquipmentDetailSheetProps) {
  const maintenance =
    (equipment.maintenance_schedule as unknown as MaintenanceTask[]) || []
  const checklist =
    (equipment.inspection_checklist as unknown as InspectionChecklist) || {}
  const troubleshooting =
    (equipment.troubleshooting_guide as unknown as TroubleshootingItem[]) || []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {equipment.custom_name || equipment.equipment_type}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {equipment.manufacturer} {equipment.model_number}
          </p>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="maintenance">Maint.</TabsTrigger>
            <TabsTrigger value="checklist">Check</TabsTrigger>
            <TabsTrigger value="troubleshoot">Help</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Serial Number</p>
                <p className="font-medium">{equipment.serial_number || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Install Date</p>
                <p className="font-medium">
                  {equipment.install_date
                    ? format(new Date(equipment.install_date), 'MMM yyyy')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{equipment.location || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Serves</p>
                <p className="font-medium">{equipment.serves || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Warranty</p>
                <p className="font-medium">
                  {equipment.warranty_expiration
                    ? format(new Date(equipment.warranty_expiration), 'MMM yyyy')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Lifespan</p>
                <p className="font-medium">
                  {equipment.expected_lifespan_years
                    ? `${equipment.expected_lifespan_years} years`
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Capacity</p>
                <p className="font-medium">{equipment.capacity || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Filter Size</p>
                <p className="font-medium">{equipment.filter_size || '-'}</p>
              </div>
            </div>
            {equipment.notes && (
              <div className="pt-4 border-t">
                <p className="text-muted-foreground text-sm mb-1">Notes</p>
                <p className="text-sm">{equipment.notes}</p>
              </div>
            )}
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="mt-4">
            {!equipment.ai_generated_at ? (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Generate AI-powered maintenance schedule
                </p>
                <Button onClick={onGenerateAI} disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {maintenance.map((task, i) => (
                  <Card key={i}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{task.task}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.frequency} &bull; {task.performer}
                          </p>
                        </div>
                        <Badge
                          variant={
                            task.priority === 'high' ? 'destructive' : 'secondary'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.estimated_cost_high > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ${task.estimated_cost_low} - ${task.estimated_cost_high}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {maintenance.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No maintenance tasks available
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="mt-4">
            {!equipment.ai_generated_at ? (
              <div className="text-center py-8">
                <Button onClick={onGenerateAI} disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate AI Content
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(checklist).map(([tier, items]) => (
                  <Card key={tier}>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-sm capitalize">{tier}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <ul className="text-sm space-y-1">
                        {(items as string[]).map((item, i) => (
                          <li key={i}>&bull; {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
                {Object.keys(checklist).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No checklists available
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Troubleshoot Tab */}
          <TabsContent value="troubleshoot" className="mt-4">
            {!equipment.ai_generated_at ? (
              <div className="text-center py-8">
                <Button onClick={onGenerateAI} disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate AI Content
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {troubleshooting.map((issue, i) => (
                  <Card key={i}>
                    <CardContent className="p-3">
                      <div className="flex gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            issue.urgency === 'high'
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <div>
                          <p className="font-medium">{issue.symptom}</p>
                          <p className="text-sm text-muted-foreground">
                            Cause: {issue.likely_cause}
                          </p>
                          <p className="text-sm">Action: {issue.action}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {troubleshooting.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No troubleshooting guides available
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

export default EquipmentDetailSheet
