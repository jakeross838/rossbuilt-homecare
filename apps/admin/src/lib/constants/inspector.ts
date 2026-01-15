// Condition rating options with colors
export const CONDITION_RATINGS = [
  { value: 'excellent', label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' },
  { value: 'good', label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' },
  { value: 'fair', label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { value: 'needs_attention', label: 'Needs Attention', color: 'text-orange-600', bg: 'bg-orange-100' },
  { value: 'poor', label: 'Poor', color: 'text-red-600', bg: 'bg-red-100' },
] as const

// Checklist item status options
export const ITEM_STATUS_OPTIONS = [
  { value: 'pass', label: 'Pass', icon: 'check', color: 'text-green-600' },
  { value: 'fail', label: 'Fail', icon: 'x', color: 'text-red-600' },
  { value: 'needs_attention', label: 'Needs Attention', icon: 'alert-triangle', color: 'text-yellow-600' },
  { value: 'urgent', label: 'Urgent', icon: 'alert-circle', color: 'text-red-600' },
  { value: 'na', label: 'N/A', icon: 'minus', color: 'text-gray-400' },
] as const

// Photo upload limits
export const PHOTO_LIMITS = {
  MAX_PHOTOS_PER_ITEM: 5,
  MAX_FILE_SIZE_MB: 10,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  THUMBNAIL_WIDTH: 200,
  THUMBNAIL_HEIGHT: 200,
} as const

// Offline storage keys
export const OFFLINE_STORAGE_KEYS = {
  PENDING_INSPECTIONS: 'pending_inspections',
  PENDING_PHOTOS: 'pending_photos',
  INSPECTION_PROGRESS: 'inspection_progress',
  LAST_SYNC: 'last_sync_timestamp',
} as const
