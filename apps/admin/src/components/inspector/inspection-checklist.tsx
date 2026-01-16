import { useState } from 'react'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { FindingForm } from './finding-form'
import type { InspectorInspection, ChecklistItem } from '@/lib/types/inspector'
import { cn } from '@/lib/utils'
import { ITEM_STATUS_OPTIONS } from '@/lib/constants/inspector'

interface InspectionChecklistProps {
  inspection: InspectorInspection
}

export function InspectionChecklist({ inspection }: InspectionChecklistProps) {
  const [activeSection, setActiveSection] = useState<number>(0)
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null)

  const sections = inspection.checklist?.sections || []
  const findings = inspection.findings || {}

  if (!sections.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No checklist items found for this inspection.</p>
      </div>
    )
  }

  const currentSection = sections[activeSection]

  return (
    <div className="flex flex-col h-full">
      {/* Section tabs - horizontal scroll */}
      <div className="border-b bg-muted/30">
        <div className="flex overflow-x-auto py-2 px-4 gap-2 scrollbar-hide">
          {sections.map((section, index) => {
            const sectionFindings = section.items.filter((item) => findings[item.id])
            const isComplete = sectionFindings.length === section.items.length

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(index)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                  activeSection === index
                    ? 'bg-rb-green text-white'
                    : 'bg-background hover:bg-muted'
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs">
                    {sectionFindings.length}/{section.items.length}
                  </span>
                )}
                {section.title}
              </button>
            )
          })}
        </div>
      </div>

      {/* Section items */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {currentSection.items.map((item) => {
            const finding = findings[item.id]
            const statusOption = finding
              ? ITEM_STATUS_OPTIONS.find((s) => s.value === finding.status)
              : null

            return (
              <Card
                key={item.id}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted',
                  finding && 'border-l-4',
                  finding?.status === 'pass' && 'border-l-green-500',
                  finding?.status === 'fail' && 'border-l-red-500',
                  finding?.status === 'needs_attention' && 'border-l-yellow-500',
                  finding?.status === 'urgent' && 'border-l-red-600',
                  finding?.status === 'na' && 'border-l-gray-400'
                )}
                onClick={() => setSelectedItem(item)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {finding ? (
                      <div
                        className={cn(
                          'h-6 w-6 rounded-full flex items-center justify-center',
                          finding.status === 'pass' && 'bg-green-100 text-green-600',
                          finding.status === 'fail' && 'bg-red-100 text-red-600',
                          finding.status === 'needs_attention' && 'bg-yellow-100 text-yellow-600',
                          finding.status === 'urgent' && 'bg-red-100 text-red-600',
                          finding.status === 'na' && 'bg-gray-100 text-gray-500'
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}

                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      {finding?.notes && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {finding.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {finding && statusOption && (
                      <span className={cn('text-xs', statusOption.color)}>
                        {statusOption.label}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="border-t p-4 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          disabled={activeSection === 0}
          onClick={() => setActiveSection(activeSection - 1)}
        >
          Previous
        </Button>
        <Button
          className="flex-1 bg-rb-green hover:bg-rb-green/90"
          disabled={activeSection === sections.length - 1}
          onClick={() => setActiveSection(activeSection + 1)}
        >
          Next Section
        </Button>
      </div>

      {/* Finding form sheet */}
      <Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Record Finding</SheetTitle>
          </SheetHeader>
          {selectedItem && (
            <FindingForm
              inspectionId={inspection.id}
              item={selectedItem}
              existingFinding={findings[selectedItem.id]}
              onSaved={() => setSelectedItem(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
