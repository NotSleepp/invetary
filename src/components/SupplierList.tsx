'use client'

import React from 'react'
import { Supplier, PartialSupplier } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'

interface SupplierListProps {
  suppliers: PartialSupplier[];
  onEdit: (supplier: PartialSupplier) => void; // Cambiado de Supplier a PartialSupplier
  onDelete: (supplierId: string) => void;
  isDeleting: boolean;
}

export const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onEdit, onDelete, isDeleting }) => {
  const { showToast } = useToast()

  const handleDelete = async (supplierId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      try {
        await onDelete(supplierId)
        showToast('Proveedor eliminado con éxito', 'success')
      } catch (error) {
        showToast('Error al eliminar el proveedor', 'error')
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
              <Button onClick={() => handleDelete(supplier.id)} variant="danger" disabled={isDeleting}>Eliminar</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}