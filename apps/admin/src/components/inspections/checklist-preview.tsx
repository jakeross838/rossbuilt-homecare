import { Camera, HelpCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { GeneratedChecklist } from '@/lib/types/inspection'

interface ChecklistPreviewProps {
  checklist: GeneratedChecklist
}

/**
 * ChecklistPreview component displays a generated inspection checklist
 * with all sections and items in a read-only preview format.
 */
export function ChecklistPreview({ checklist }: ChecklistPreviewProps) {
  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header with totals */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{checklist.total_items} items</span>
          <span>-</span>
          <span>~{checklist.estimated_duration_minutes} minutes</span>
        </div>

        {/* Sections */}
        {checklist.sections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                {section.name}
                <Badge variant="secondary">{section.items.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2 text-sm"
                  >
                    {/* Disabled checkbox for preview */}
                    <Checkbox disabled className="mt-0.5" />

                    {/* Item text */}
                    <span className="flex-1">{item.text}</span>

                    {/* Photo required indicator (filled camera) */}
                    {item.photo_required && (
                      <Camera className="h-4 w-4 text-primary shrink-0" />
                    )}

                    {/* Photo recommended indicator (outline camera) */}
                    {item.photo_recommended && !item.photo_required && (
                      <Camera className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}

                    {/* Help text tooltip */}
                    {item.help_text && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="shrink-0"
                            aria-label={`Help: ${item.help_text}`}
                          >
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{item.help_text}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

        {/* Empty state */}
        {checklist.sections.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No checklist items available
          </p>
        )}
      </div>
    </TooltipProvider>
  )
}
