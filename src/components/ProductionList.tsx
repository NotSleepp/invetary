'use client'

import React from 'react'
import { ProductionLog } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'

interface ProductionListProps {
  productionLogs: ProductionLog[]
  onDelete: (productionLogId: string) => void
}

export const ProductionList: React.FC<ProductionListProps> = ({ productionLogs, onDelete }) => {
  const { showToast } = useToast()

  const handleDelete = async (productionLogId: string) => {
    if (window.confirm('Are you sure you want to delete this production log?')) {
      try {
        await onDelete(productionLogId)
        showToast('Production log deleted successfully', 'success')
      } catch (error) {
        showToast('Error deleting production log', 'error')
      }
    }
  }

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Product</th>
          <th className="py-2 px-4 border-b">Quantity Produced</th>
          <th className="py-2 px-4 border-b">Total Cost</th>
          <th className="py-2 px-4 border-b">Date</th>
          <th className="py-2 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {productionLogs.map(log => (
          <tr key={log.id}>
            <td className="py-2 px-4 border-b">{log.product_id}</td>
            <td className="py-2 px-4 border-b">{log.quantity_produced}</td>
            <td className="py-2 px-4 border-b">${log.total_cost?.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">{new Date(log.created_at).toLocaleDateString()}</td>
            <td className="py-2 px-4 border-b">
              <Button onClick={() => handleDelete(log.id)} variant="danger">Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}