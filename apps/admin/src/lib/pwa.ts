import { registerSW } from 'virtual:pwa-register'

export interface PWAUpdateState {
  needRefresh: boolean
  offlineReady: boolean
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>
}

let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined

export function registerPWA(
  onNeedRefresh: () => void,
  onOfflineReady: () => void
): () => void {
  updateSW = registerSW({
    onNeedRefresh() {
      onNeedRefresh()
    },
    onOfflineReady() {
      onOfflineReady()
    },
    onRegistered(registration) {
      console.log('SW registered:', registration)
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  return () => {
    // Cleanup function
  }
}

export function updateServiceWorker(reloadPage = true): Promise<void> {
  if (updateSW) {
    return updateSW(reloadPage)
  }
  return Promise.resolve()
}

export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
}

export function canInstallPWA(): boolean {
  // Check if beforeinstallprompt event is available
  return 'BeforeInstallPromptEvent' in window
}
