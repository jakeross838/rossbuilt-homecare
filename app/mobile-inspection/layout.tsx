import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Property Inspection - Mobile',
  description: 'Mobile-optimized property inspection interface',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function MobileInspectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  )
}
