import { Star } from 'lucide-react'
import { getRatingLabel } from '@/lib/constants/vendor'
import { cn } from '@/lib/utils'

interface VendorRatingProps {
  rating: number | null
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function VendorRating({
  rating,
  showLabel = false,
  size = 'md',
  className,
}: VendorRatingProps) {
  if (rating === null) {
    return (
      <span className={cn('text-muted-foreground', className)}>
        No rating yet
      </span>
    )
  }

  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizes[size],
              star <= fullStars
                ? 'fill-yellow-400 text-yellow-400'
                : star === fullStars + 1 && hasHalfStar
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'text-gray-300'
            )}
          />
        ))}
      </div>
      <span className={cn('font-medium', textSizes[size])}>
        {rating.toFixed(1)}
      </span>
      {showLabel && (
        <span className={cn('text-muted-foreground', textSizes[size])}>
          ({getRatingLabel(rating)})
        </span>
      )}
    </div>
  )
}
