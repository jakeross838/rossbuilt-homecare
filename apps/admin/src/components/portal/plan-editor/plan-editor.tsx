/**
 * Self-Service Plan Editor
 *
 * Allows clients to modify their property's service plan with live pricing.
 * Includes 20% builder markup on all pricing.
 */

import { useState, useMemo } from 'react'
import { Check, X, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Badge } from '@/components/ui/badge'
import { usePricingConfig, calculateProgramPrice } from '@/hooks/use-pricing'
import { useUpdateProgram } from '@/hooks/use-programs'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/helpers/billing'
import { supabase, type Tables } from '@/lib/supabase'

type Program = Tables<'programs'>

interface PlanEditorProps {
  program: Program
  propertyName: string
  onClose: () => void
  onSave?: () => void
}

// 20% builder markup
const BUILDER_MARKUP = 0.20

const frequencyOptions = [
  { value: 'annual', label: 'Annual', description: '1 inspection per year' },
  { value: 'semi_annual', label: 'Semi-Annual', description: '2 inspections per year' },
  { value: 'quarterly', label: 'Quarterly', description: '4 inspections per year' },
  { value: 'monthly', label: 'Monthly', description: '12 inspections per year' },
  { value: 'bi_weekly', label: 'Bi-Weekly', description: '26 inspections per year' },
]

const addonOptions = [
  {
    key: 'addon_digital_manual' as const,
    label: 'Digital Home Manual',
    description: 'Comprehensive digital guide to your home systems',
  },
  {
    key: 'addon_warranty_tracking' as const,
    label: 'Warranty Tracking',
    description: 'Track and manage all equipment warranties',
  },
  {
    key: 'addon_emergency_response' as const,
    label: 'Emergency Response',
    description: '24/7 priority emergency support',
  },
  {
    key: 'addon_hurricane_monitoring' as const,
    label: 'Hurricane Monitoring',
    description: 'Storm tracking and property preparation',
  },
]

export function PlanEditor({ program, propertyName, onClose, onSave }: PlanEditorProps) {
  const { data: pricingConfig, isLoading: pricingLoading } = usePricingConfig()
  const updateProgram = useUpdateProgram()
  const { toast } = useToast()

  // Local state for edits
  const [frequency, setFrequency] = useState(program.inspection_frequency)
  const [addons, setAddons] = useState({
    addon_digital_manual: program.addon_digital_manual || false,
    addon_warranty_tracking: program.addon_warranty_tracking || false,
    addon_emergency_response: program.addon_emergency_response || false,
    addon_hurricane_monitoring: program.addon_hurricane_monitoring || false,
  })
  const [showConfirm, setShowConfirm] = useState(false)

  // Calculate current pricing (what client is paying now)
  const currentPricing = useMemo(() => {
    if (!pricingConfig) return null
    const base = calculateProgramPrice(
      pricingConfig,
      program.inspection_frequency,
      program.inspection_tier,
      {
        digital_manual: program.addon_digital_manual || false,
        warranty_tracking: program.addon_warranty_tracking || false,
        emergency_response: program.addon_emergency_response || false,
        hurricane_monitoring: program.addon_hurricane_monitoring || false,
      }
    )
    // Apply 20% markup
    return {
      baseFee: base.baseFee * (1 + BUILDER_MARKUP),
      tierFee: base.tierFee * (1 + BUILDER_MARKUP),
      addonsFee: base.addonsFee * (1 + BUILDER_MARKUP),
      monthlyTotal: base.monthlyTotal * (1 + BUILDER_MARKUP),
    }
  }, [pricingConfig, program])

  // Calculate proposed pricing (what they'll pay after changes)
  const proposedPricing = useMemo(() => {
    if (!pricingConfig) return null
    const base = calculateProgramPrice(
      pricingConfig,
      frequency,
      program.inspection_tier,
      {
        digital_manual: addons.addon_digital_manual,
        warranty_tracking: addons.addon_warranty_tracking,
        emergency_response: addons.addon_emergency_response,
        hurricane_monitoring: addons.addon_hurricane_monitoring,
      }
    )
    // Apply 20% markup
    return {
      baseFee: base.baseFee * (1 + BUILDER_MARKUP),
      tierFee: base.tierFee * (1 + BUILDER_MARKUP),
      addonsFee: base.addonsFee * (1 + BUILDER_MARKUP),
      monthlyTotal: base.monthlyTotal * (1 + BUILDER_MARKUP),
    }
  }, [pricingConfig, frequency, addons, program.inspection_tier])

  // Check if there are changes
  const hasChanges = useMemo(() => {
    return (
      frequency !== program.inspection_frequency ||
      addons.addon_digital_manual !== (program.addon_digital_manual || false) ||
      addons.addon_warranty_tracking !== (program.addon_warranty_tracking || false) ||
      addons.addon_emergency_response !== (program.addon_emergency_response || false) ||
      addons.addon_hurricane_monitoring !== (program.addon_hurricane_monitoring || false)
    )
  }, [frequency, addons, program])

  // Calculate price difference
  const priceDifference = useMemo(() => {
    if (!currentPricing || !proposedPricing) return 0
    return proposedPricing.monthlyTotal - currentPricing.monthlyTotal
  }, [currentPricing, proposedPricing])

  const handleToggleAddon = (key: keyof typeof addons) => {
    setAddons((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    if (!proposedPricing) return

    try {
      // Update the program
      await updateProgram.mutateAsync({
        id: program.id,
        data: {
          inspection_frequency: frequency,
          addon_digital_manual: addons.addon_digital_manual,
          addon_warranty_tracking: addons.addon_warranty_tracking,
          addon_emergency_response: addons.addon_emergency_response,
          addon_hurricane_monitoring: addons.addon_hurricane_monitoring,
          base_fee: proposedPricing.baseFee,
          tier_fee: proposedPricing.tierFee,
          addons_fee: proposedPricing.addonsFee,
          monthly_total: proposedPricing.monthlyTotal,
        },
        shouldCreateInvoice: false, // Cascade function handles invoicing
      })

      // Trigger cascade updates (schedule, billing, notifications)
      const { error: cascadeError } = await supabase.rpc('cascade_program_update', {
        p_program_id: program.id,
        p_old_frequency: program.inspection_frequency,
        p_new_frequency: frequency,
        p_old_addons: {
          digital_manual: program.addon_digital_manual || false,
          warranty_tracking: program.addon_warranty_tracking || false,
          emergency_response: program.addon_emergency_response || false,
          hurricane_monitoring: program.addon_hurricane_monitoring || false,
        },
        p_new_addons: {
          digital_manual: addons.addon_digital_manual,
          warranty_tracking: addons.addon_warranty_tracking,
          emergency_response: addons.addon_emergency_response,
          hurricane_monitoring: addons.addon_hurricane_monitoring,
        },
        p_price_difference: priceDifference > 0 ? priceDifference : 0,
        p_new_monthly_total: proposedPricing.monthlyTotal,
      })

      if (cascadeError) {
        console.error('Cascade update warning:', cascadeError)
        // Continue anyway - primary update succeeded
      }

      setShowConfirm(false)
      toast({
        title: 'Plan Updated',
        description: 'Your service plan has been updated successfully.',
      })
      onSave?.()
      onClose()
    } catch (error) {
      console.error('Failed to update plan:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update your plan. Please try again.',
        variant: 'destructive',
      })
      setShowConfirm(false)
    }
  }

  if (pricingLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Edit Plan</h2>
          <p className="text-muted-foreground">{propertyName}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Inspection Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inspection Frequency</CardTitle>
          <CardDescription>How often should we inspect your property?</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add-on Services</CardTitle>
          <CardDescription>Enhance your plan with additional services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {addonOptions.map((addon) => (
            <div
              key={addon.key}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex-1">
                <Label htmlFor={addon.key} className="font-medium cursor-pointer">
                  {addon.label}
                </Label>
                <p className="text-sm text-muted-foreground">{addon.description}</p>
              </div>
              <Switch
                id={addon.key}
                checked={addons[addon.key]}
                onCheckedChange={() => handleToggleAddon(addon.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Comparison */}
      <Card className={hasChanges ? 'border-blue-200 bg-blue-50/50' : ''}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Price Summary
            {hasChanges && <Badge variant="secondary">Changes pending</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Current */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-2">Current Plan</p>
              <p className="text-2xl font-bold">
                {currentPricing ? formatCurrency(currentPricing.monthlyTotal) : '—'}
              </p>
              <p className="text-xs text-gray-500">per month</p>
            </div>

            {/* Proposed */}
            <div
              className={`p-4 rounded-lg ${
                hasChanges ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'
              }`}
            >
              <p className="text-sm font-medium text-gray-500 mb-2">New Plan</p>
              <p className="text-2xl font-bold">
                {proposedPricing ? formatCurrency(proposedPricing.monthlyTotal) : '—'}
              </p>
              <p className="text-xs text-gray-500">per month</p>
            </div>
          </div>

          {/* Difference */}
          {hasChanges && priceDifference !== 0 && (
            <div
              className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                priceDifference > 0
                  ? 'bg-yellow-50 text-yellow-800'
                  : 'bg-green-50 text-green-800'
              }`}
            >
              <Info className="h-4 w-4" />
              <span className="text-sm">
                {priceDifference > 0 ? (
                  <>Your monthly cost will increase by {formatCurrency(priceDifference)}</>
                ) : (
                  <>Your monthly cost will decrease by {formatCurrency(Math.abs(priceDifference))}</>
                )}
              </span>
            </div>
          )}

          {/* Breakdown */}
          {proposedPricing && hasChanges && (
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Base frequency fee</span>
                <span>{formatCurrency(proposedPricing.baseFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Inspection tier</span>
                <span>{formatCurrency(proposedPricing.tierFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Add-ons</span>
                <span>{formatCurrency(proposedPricing.addonsFee)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={!hasChanges || updateProgram.isPending}
          onClick={() => setShowConfirm(true)}
        >
          {updateProgram.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Plan Changes</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You're about to update your service plan for {propertyName}.</p>
              {priceDifference !== 0 && (
                <p className="font-medium">
                  Your new monthly cost will be{' '}
                  {formatCurrency(proposedPricing?.monthlyTotal || 0)}
                  {priceDifference > 0 && (
                    <span className="text-yellow-600">
                      {' '}
                      (+{formatCurrency(priceDifference)})
                    </span>
                  )}
                </p>
              )}
              <p className="text-sm">Changes take effect immediately.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>Confirm Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
