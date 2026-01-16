import { Button } from '@/components/ui/button'
import { useCreatePaymentLink, openPaymentLink } from '@/hooks/use-stripe'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, Loader2, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface PaymentLinkButtonProps {
  invoiceId: string
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}

export function PaymentLinkButton({
  invoiceId,
  variant = 'default',
  size = 'default',
}: PaymentLinkButtonProps) {
  const { toast } = useToast()
  const createPaymentLink = useCreatePaymentLink()
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)

  const handleCreate = async () => {
    try {
      const result = await createPaymentLink.mutateAsync({ invoiceId })
      setPaymentUrl(result.url)
      openPaymentLink(result.url)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create payment link',
        variant: 'destructive',
      })
    }
  }

  const handleCopy = async () => {
    if (paymentUrl) {
      await navigator.clipboard.writeText(paymentUrl)
      toast({
        title: 'Copied',
        description: 'Payment link copied to clipboard',
      })
    }
  }

  if (paymentUrl) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size={size} onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-1" />
          Copy Link
        </Button>
        <Button variant={variant} size={size} onClick={() => openPaymentLink(paymentUrl)}>
          <ExternalLink className="h-4 w-4 mr-1" />
          Open
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCreate}
      disabled={createPaymentLink.isPending}
    >
      {createPaymentLink.isPending ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-1" />
      )}
      Pay Online
    </Button>
  )
}
