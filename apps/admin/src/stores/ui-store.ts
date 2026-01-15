import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  duration?: number
}

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  toasts: Toast[]
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

type UIStore = UIState & UIActions

let toastCount = 0
const generateToastId = () => {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER
  return `toast-${toastCount}-${Date.now()}`
}

/**
 * UI store for managing global UI state
 * Handles sidebar visibility and toast notifications
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // State
      sidebarOpen: true,
      sidebarCollapsed: false,
      toasts: [],

      // Actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },

      toggleSidebarCollapsed: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed })
      },

      addToast: (toast: Omit<Toast, 'id'>) => {
        const id = generateToastId()
        const newToast: Toast = {
          ...toast,
          id,
          duration: toast.duration ?? 5000,
        }

        set((state) => ({
          toasts: [...state.toasts, newToast],
        }))

        // Auto-remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, newToast.duration)
        }

        return id
      },

      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      },

      clearToasts: () => {
        set({ toasts: [] })
      },
    }),
    {
      name: 'home-care-os-ui',
      partialize: (state) => ({
        // Only persist sidebar preferences, not toasts
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
