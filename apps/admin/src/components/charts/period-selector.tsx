import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TIME_PERIODS } from '@/lib/constants/analytics'
import type { TimePeriod } from '@/lib/types/analytics'

interface PeriodSelectorProps {
  value: TimePeriod
  onChange: (value: TimePeriod) => void
  className?: string
}

export function PeriodSelector({ value, onChange, className }: PeriodSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TimePeriod)}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TIME_PERIODS.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
