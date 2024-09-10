'use client'

import React from 'react'
import { Sale } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'

interface SaleListProps {
  sales: Sale[]
  onDelete: (saleId: string) => void
}

export const SaleList: React.FC<SaleListProps> = ({ sales, onDelete }) => {
  const { showToast } = useToast()

  const handleDelete = async (saleId: string) => {
    if (window.confirm('Are you sure you want to delete this sale record?')) {
      try {
        await onDelete(saleId)
        showToast('Sale record deleted successfully', 'success')
      } catch (error) {
        showToast('Error deleting sale record', 'error')
      }
    }
  }

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Product</th>
          <th className="py-2 px-4 border-b">Quantity Sold</th>
          <th className="py-2 px-4 border-b">Sale Price</th>
          <th className="py-2 px-4 border-b">Total Revenue</th>
          <th className="py-2 px-4 border-b">Date</th>
          <th className="py-2 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sales.map(sale => (
          <tr key={sale.id}>
            <td className="py-2 px-4 border-b">{sale.product_id}</td>
            <td className="py-2 px-4 border-b">{sale.quantity_sold}</td>
            <td className="py-2 px-4 border-b">${sale.sale_price.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">${sale.total_revenue.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">{new Date(sale.created_at).toLocaleDateString()}</td>
            <td className="py-2 px-4 border-b">
              <Button onClick={() => handleDelete(sale.id)} variant="danger">Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}