'use client'

import React from 'react'
import { Supplier } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'

interface SupplierListProps {
  suppliers: Supplier[]
  onEdit: (supplier: Supplier) => void
  onDelete: (supplierId: string) => void
}

export const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onEdit, onDelete }) => {
  const { showToast } = useToast()

  const handleDelete = async (supplierId: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await onDelete(supplierId)
        showToast('Supplier deleted successfully', 'success')
      } catch (error) {
        showToast('Error deleting supplier', 'error')
      }
    }
  }

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Nombre</th>
          <th className="py-2 px-4 border-b">Información de contacto</th>
          <th className="py-2 px-4 border-b"></th>
        </tr>
      </thead>
      <tbody>
        {suppliers.map(supplier => (
          <tr key={supplier.id}>
            <td className="py-2 px-4 border-b">{supplier.name}</td>
            <td className="py-2 px-4 border-b">{supplier.contact_info}</td>
            <td className="py-2 px-4 border-b">
              <Button onClick={() => onEdit(supplier)} variant="secondary">Editar</Button>
              <Button onClick={() => handleDelete(supplier.id)} variant="danger">Eliminar</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}