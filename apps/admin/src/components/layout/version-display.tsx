import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VersionInfo {
  version: string
  build: number
  lastUpdated: string
}

interface VersionDisplayProps {
  collapsed?: boolean
}

export function VersionDisplay({ collapsed = false }: VersionDisplayProps) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)

  useEffect(() => {
    // Fetch version info
    fetch('/version.json')
      .then((res) => res.json())
      .then((data) => setVersionInfo(data))
      .catch((err) => console.error('Failed to load version info:', err))
  }, [])

  if (!versionInfo) {
    return null
  }

  return (
    <div
      className={cn(
        'px-3 py-2 text-xs text-muted-foreground flex items-center gap-2',
        collapsed && 'justify-center'
      )}
      title={
        collapsed
          ? `Version ${versionInfo.version} (Build ${versionInfo.build})`
          : undefined
      }
    >
      <Package className="h-3.5 w-3.5 flex-shrink-0" />
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-medium">v{versionInfo.version}</span>
          <span className="text-[10px] opacity-70">Build {versionInfo.build}</span>
        </div>
      )}
    </div>
  )
}
