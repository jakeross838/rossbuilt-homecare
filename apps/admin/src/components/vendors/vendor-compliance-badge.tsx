import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import type { VendorCompliance } from '@/lib/types/vendor'

interface VendorComplianceBadgeProps {
  compliance: VendorCompliance
  showDetails?: boolean
}

export function VendorComplianceBadge({
  compliance,
}: VendorComplianceBadgeProps) {
  const { is_compliant, issues, license_expires_soon, insurance_expires_soon } =
    compliance

  if (is_compliant && !license_expires_soon && !insurance_expires_soon) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="mr-1 h-3 w-3" />
        Compliant
      </Badge>
    )
  }

  if (is_compliant && (license_expires_soon || insurance_expires_soon)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 cursor-help"
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              Expiring Soon
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <ul className="text-xs space-y-1">
              {license_expires_soon && <li>License expires within 30 days</li>}
              {insurance_expires_soon && <li>Insurance expires within 30 days</li>}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="destructive" className="cursor-help">
            <XCircle className="mr-1 h-3 w-3" />
            Issues
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <ul className="text-xs space-y-1">
            {issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
