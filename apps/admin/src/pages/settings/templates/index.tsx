import { useState } from 'react'
import { Plus, Edit } from 'lucide-react'
import { useInspectionTemplates } from '@/hooks/use-inspection-templates'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { TemplateEditor } from './components/template-editor'
import type { Tables } from '@/lib/supabase'

type InspectionTemplate = Tables<'inspection_templates'>

// Type for the sections JSON structure
interface TemplateSection {
  id: string
  name: string
  order: number
  items: Array<{
    id: string
    text: string
    type?: string
    photo_required?: boolean
    photo_recommended?: boolean
    help_text?: string
  }>
}

export function TemplatesPage() {
  const [editing, setEditing] = useState<InspectionTemplate | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const { data: templates, isLoading } = useInspectionTemplates()

  // Group templates by tier using reduce
  const grouped = templates?.reduce(
    (acc, template) => {
      const tier = template.tier
      if (!acc[tier]) acc[tier] = []
      acc[tier].push(template)
      return acc
    },
    {} as Record<string, InspectionTemplate[]>
  )

  // Calculate item count from sections
  const getItemCount = (template: InspectionTemplate): number => {
    const sections = template.sections as TemplateSection[] | null
    if (!sections || !Array.isArray(sections)) return 0
    return sections.reduce((sum, section) => sum + (section.items?.length || 0), 0)
  }

  // Handle opening editor for new template
  const handleNewTemplate = () => {
    setEditing(null)
    setIsEditorOpen(true)
  }

  // Handle opening editor for existing template
  const handleEditTemplate = (template: InspectionTemplate) => {
    setEditing(template)
    setIsEditorOpen(true)
  }

  // Handle closing editor
  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditing(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspection Templates"
        description="Manage checklist templates for each inspection tier"
      >
        <Button onClick={handleNewTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </PageHeader>

      {['visual', 'functional', 'comprehensive', 'preventative'].map((tier) => (
        <Card key={tier}>
          <CardHeader>
            <CardTitle className="capitalize">{tier}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {grouped?.[tier]?.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {template.category && (
                        <Badge variant="outline">{template.category}</Badge>
                      )}
                      {template.feature_type && (
                        <Badge variant="secondary">{template.feature_type}</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {getItemCount(template)} items
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">
                  No templates for this tier
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <TemplateEditor
        template={editing}
        open={isEditorOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseEditor()
        }}
        onSave={handleCloseEditor}
      />
    </div>
  )
}

export default TemplatesPage
