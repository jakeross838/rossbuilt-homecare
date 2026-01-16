import { useState } from 'react'
import { FileText, Download, Mail, Loader2, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useBuildReportData } from '@/hooks/use-reports'
import {
  generateAndSaveReport,
  downloadPDF,
  generateAISummary,
} from '@/lib/pdf/generate-pdf'
import { DEFAULT_REPORT_OPTIONS } from '@/lib/constants/report'
import type { ReportGenerationOptions } from '@/lib/types/report'

interface GenerateReportDialogProps {
  inspectionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (reportUrl: string) => void
}

type GenerationStep = 'options' | 'generating' | 'complete'

export function GenerateReportDialog({
  inspectionId,
  open,
  onOpenChange,
  onSuccess,
}: GenerateReportDialogProps) {
  const { toast } = useToast()
  const { data: reportData, isLoading: isLoadingData } = useBuildReportData(inspectionId)

  const [step, setStep] = useState<GenerationStep>('options')
  const [options, setOptions] = useState<ReportGenerationOptions>(DEFAULT_REPORT_OPTIONS)
  const [sendEmail, setSendEmail] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [progress, setProgress] = useState(0)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!reportData) return

    try {
      setStep('generating')
      setProgress(10)

      // Generate AI summary if enabled
      let aiSummary
      if (options.include_ai_summary) {
        setProgress(30)
        try {
          aiSummary = await generateAISummary(reportData)
        } catch (error) {
          console.warn('AI summary failed, continuing without:', error)
        }
      }

      setProgress(50)

      // Generate and upload PDF
      const { reportUrl } = await generateAndSaveReport(reportData, options)
      setProgress(90)

      setGeneratedUrl(reportUrl)
      setStep('complete')
      setProgress(100)

      onSuccess?.(reportUrl)

      toast({
        title: 'Report Generated',
        description: 'Your inspection report has been created successfully.',
      })
    } catch (error) {
      console.error('Report generation failed:', error)
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate report',
        variant: 'destructive',
      })
      setStep('options')
    }
  }

  const handleDownload = async () => {
    if (!reportData) return

    try {
      await downloadPDF({ report: reportData, options })
      toast({
        title: 'Download Started',
        description: 'Your report is being downloaded.',
      })
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download report',
        variant: 'destructive',
      })
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after close animation
    setTimeout(() => {
      setStep('options')
      setProgress(0)
      setGeneratedUrl(null)
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Inspection Report
          </DialogTitle>
          <DialogDescription>
            {step === 'options' && 'Configure your report options before generating.'}
            {step === 'generating' && 'Creating your professional inspection report...'}
            {step === 'complete' && 'Your report is ready!'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : step === 'options' ? (
          <div className="space-y-6 py-4">
            {/* Include options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-summary" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI-Enhanced Summary
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Generate a professional summary using AI
                  </p>
                </div>
                <Switch
                  id="ai-summary"
                  checked={options.include_ai_summary}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, include_ai_summary: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="photos">Include Photos</Label>
                  <p className="text-sm text-muted-foreground">
                    Add photo documentation to report
                  </p>
                </div>
                <Switch
                  id="photos"
                  checked={options.include_photos}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, include_photos: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="recommendations">Include Recommendations</Label>
                  <p className="text-sm text-muted-foreground">
                    Add maintenance recommendations
                  </p>
                </div>
                <Switch
                  id="recommendations"
                  checked={options.include_recommendations}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, include_recommendations: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weather">Include Weather</Label>
                  <p className="text-sm text-muted-foreground">
                    Show weather conditions at inspection time
                  </p>
                </div>
                <Switch
                  id="weather"
                  checked={options.include_weather}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, include_weather: checked }))
                  }
                />
              </div>
            </div>

            {/* Email option */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="space-y-0.5">
                  <Label htmlFor="send-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email to Client
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send report link via email after generation
                  </p>
                </div>
                <Switch
                  id="send-email"
                  checked={sendEmail}
                  onCheckedChange={setSendEmail}
                />
              </div>

              {sendEmail && (
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>
        ) : step === 'generating' ? (
          <div className="py-8">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-rb-green mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                {progress < 30
                  ? 'Preparing report data...'
                  : progress < 50
                  ? 'Generating AI summary...'
                  : progress < 90
                  ? 'Creating PDF document...'
                  : 'Uploading report...'}
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-rb-green h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium mb-2">Report Generated!</p>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Your professional inspection report is ready to download or share.
              </p>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {generatedUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(generatedUrl, '_blank')}
                  >
                    View Online
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'options' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} className="bg-rb-green hover:bg-rb-green/90">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </>
          )}
          {step === 'complete' && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
