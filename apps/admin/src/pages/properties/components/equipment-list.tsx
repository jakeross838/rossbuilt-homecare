import { useState } from 'react'
import { Plus, Sparkles, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  usePropertyEquipment,
  useGenerateEquipmentAI,
} from '@/hooks/use-equipment'
import { EQUIPMENT_CATEGORIES, type EquipmentCategory } from '@/lib/constants/equipment'
import { useToast } from '@/hooks/use-toast'
import { EquipmentForm } from './equipment-form'
import { EquipmentDetailSheet } from './equipment-detail-sheet'
import type { Tables } from '@/lib/supabase'

type Equipment = Tables<'equipment'>

interface EquipmentListProps {
  propertyId: string
}

/**
 * Equipment list component displaying grouped equipment with AI generation capability
 */
export function EquipmentList({ propertyId }: EquipmentListProps) {
  const [showForm, setShowForm] = useState(false)
  const [viewing, setViewing] = useState<Equipment | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const { toast } = useToast()

  const { data: equipment, isLoading } = usePropertyEquipment(propertyId)
  const generateAI = useGenerateEquipmentAI()

  const handleGenerateAI = async (id: string) => {
    setGeneratingId(id)
    try {
      await generateAI.mutateAsync(id)
      toast({
        title: 'Success',
        description: 'Maintenance schedule generated successfully!',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate maintenance schedule',
        variant: 'destructive',
      })
    } finally {
      setGeneratingId(null)
    }
  }

  // Group equipment by category
  const grouped = equipment?.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, Equipment[]>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Equipment Registry</h3>
          <p className="text-sm text-muted-foreground">
            {equipment?.length || 0} items
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !equipment?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No equipment registered</p>
            <Button onClick={() => setShowForm(true)}>
              Add First Equipment
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped || {}).map(([category, items]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {EQUIPMENT_CATEGORIES[category as EquipmentCategory]?.label ||
                  category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setViewing(item)}
                  >
                    <div>
                      <p className="font-medium">
                        {item.custom_name || item.equipment_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.manufacturer} {item.model_number}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.ai_generated_at ? (
                        <Badge variant="secondary">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Ready
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerateAI(item.id)
                          }}
                          disabled={generatingId === item.id}
                        >
                          {generatingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-1" />
                              Generate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Equipment Form Dialog */}
      <EquipmentForm
        open={showForm}
        onOpenChange={setShowForm}
        propertyId={propertyId}
      />

      {/* Equipment Detail Sheet */}
      {viewing && (
        <EquipmentDetailSheet
          equipment={viewing}
          open={!!viewing}
          onOpenChange={(open) => !open && setViewing(null)}
          onGenerateAI={() => handleGenerateAI(viewing.id)}
          isGenerating={generatingId === viewing?.id}
        />
      )}
    </div>
  )
}

export default EquipmentList
