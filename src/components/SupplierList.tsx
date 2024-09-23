'use client'

import React from 'react'
import { Supplier, PartialSupplier } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { Card } from './ui/Card'

interface SupplierListProps {
  suppliers: PartialSupplier[];
  onEdit: (supplier: PartialSupplier) => void;
  onDelete: (supplierId: string) => void;
}

export const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onEdit, onDelete }) => {
  const { showToast } = useToast()

  const handleDelete = async (supplierId: string) => {
    try {
      await onDelete(supplierId)
      showToast('Proveedor eliminado con éxito', 'success')
    } catch (error) {
      showToast('Error al eliminar el proveedor', 'error')
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {suppliers.map(supplier => (
        <Card key={supplier.id} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-2">{supplier.name ?? 'N/A'}</h3>
          <div className="mb-2">
            <span className="font-medium">Email:</span> {supplier.email ?? 'N/A'}
          </div>
          <div className="mb-2">
            <span className="font-medium">Teléfono:</span> {supplier.phone ?? 'N/A'}
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => onEdit(supplier)} variant="outline" className="flex items-center">
              <PencilIcon className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button onClick={() => handleDelete(supplier.id!)} variant="outline" className="flex items-center">
              <TrashIcon className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}