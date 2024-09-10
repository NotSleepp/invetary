'use client'

import React from 'react'
import { Material } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'

interface MaterialListProps {
  materials: Material[]
  onEdit: (material: Material) => void
  onDelete: (materialId: string) => void
}

export const MaterialList: React.FC<MaterialListProps> = ({ materials, onEdit, onDelete }) => {
  const { showToast } = useToast()

  const handleDelete = async (materialId: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await onDelete(materialId)
        showToast('Material deleted successfully', 'success')
      } catch (error) {
        showToast('Error deleting material', 'error')
      }
    }
  }

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Name</th>
          <th className="py-2 px-4 border-b">Stock Quantity</th>
          <th className="py-2 px-4 border-b">Cost per Unit</th>
          <th className="py-2 px-4 border-b">Supplier</th>
          <th className="py-2 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {materials.map(material => (
          <tr key={material.id}>
            <td className="py-2 px-4 border-b">{material.name}</td>
            <td className="py-2 px-4 border-b">{material.stock_quantity}</td>
            <td className="py-2 px-4 border-b">${material.cost_per_unit.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">{material.supplier_id}</td>
            <td className="py-2 px-4 border-b">
              <Button onClick={() => onEdit(material)} variant="secondary">Edit</Button>
              <Button onClick={() => handleDelete(material.id)} variant="danger">Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}