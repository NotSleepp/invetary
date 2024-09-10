import React from 'react'

interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string // Añadimos className como una propiedad opcional
}

export const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  )
}
