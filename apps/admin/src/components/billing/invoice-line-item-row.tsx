import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LINE_ITEM_TYPES } from '@/lib/constants/billing'
import { calculateLineItemAmount, formatCurrency } from '@/lib/helpers/billing'
import { Trash2 } from 'lucide-react'

interface LineItemData {
  description: string
  quantity: number
  unit_price: number
  line_type?: string
}

interface InvoiceLineItemRowProps {
  item: LineItemData
  index: number
  onChange: (index: number, field: keyof LineItemData, value: string | number) => void
  onRemove: (index: number) => void
  disabled?: boolean
}

export function InvoiceLineItemRow({
  item,
  index,
  onChange,
  onRemove,
  disabled,
}: InvoiceLineItemRowProps) {
  const amount = calculateLineItemAmount(item.quantity, item.unit_price)

  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex-1">
        <Input
          placeholder="Description"
          value={item.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="w-24">
        <Select
          value={item.line_type || 'other'}
          onValueChange={(value) => onChange(index, 'line_type', value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LINE_ITEM_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-20">
        <Input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Qty"
          value={item.quantity}
          onChange={(e) => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
          disabled={disabled}
        />
      </div>
      <div className="w-28">
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          value={item.unit_price}
          onChange={(e) => onChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
          disabled={disabled}
        />
      </div>
      <div className="w-24 text-right font-medium">
        {formatCurrency(amount)}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
