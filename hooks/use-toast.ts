// FILE: hooks/use-toast.ts
// LOCATION: /hooks/use-toast.ts
// PURPOSE: Toast notification system
// ============================================
'use client'
import { useState, useCallback } from 'react'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({
    title,
    description,
    variant = 'default',
    duration = 5000,
  }: Omit<Toast, 'id'>) => {
    const id = `toast-${toastId++}`
    
    const newToast: Toast = {
      id,
      title,
      description,
      variant,
      duration,
    }

    setToasts(prev => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    toast,
    dismiss,
    dismissAll,
  }
}