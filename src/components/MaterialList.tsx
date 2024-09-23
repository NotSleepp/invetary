'use client'

import React from 'react'
import { Material, Supplier } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { Card } from './ui/Card'

interface MaterialListProps {
  materials: Material[]
  suppliers: Supplier[]
  onEdit: (material: Material) => void
  onDelete: (materialId: string) => void
}

export const MaterialList: React.FC<MaterialListProps> = ({ materials, suppliers, onEdit, onDelete }) => {
  const { showToast } = useToast()

  const handleDelete = async (materialId: string) => {
    try {
      await onDelete(materialId)
      showToast('Material eliminado con éxito', 'success')
    } catch (error) {
      showToast('Error al eliminar el material', 'error')
    }
  }

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    return supplier ? supplier.name : 'Proveedor desconocido'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {materials.map(material => (
        <Card key={material.id} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-2">{material.name}</h3>
          <div className="mb-2">
            <span className="font-medium">Stock:</span> {material.stock_quantity}
          </div>
          <div className="mb-2">
            <span className="font-medium">Costo por unidad:</span> ${material.cost_per_unit.toFixed(2)}
          </div>
          <div className="mb-4">
            <span className="font-medium">Proveedor:</span> {getSupplierName(material.supplier_id)}
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => onEdit(material)} variant="outline" className="flex items-center">
              <PencilIcon className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button onClick={() => handleDelete(material.id)} variant="outline" className="flex items-center">
              <TrashIcon className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}