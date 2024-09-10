import React from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
}

export const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-md`}>
      {message}
    </div>
  )
}