'use client'

import React, { createContext, useContext, useState, useRef } from 'react'
import { Toast } from '@/components/ui/toast'

type ToastType = 'success' | 'error' | 'info'

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([])
  const toastIdCounter = useRef(0)

  const showToast = (message: string, type: ToastType) => {
    const id = `toast-${Date.now()}-${toastIdCounter.current++}`
    setToasts(prevToasts => [...prevToasts, { id, message, type }])
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      ))}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}