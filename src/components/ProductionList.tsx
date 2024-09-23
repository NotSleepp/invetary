'use client'

import React from 'react'
import { ProductionLog } from '@/types'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Edit2Icon, Trash2Icon } from 'lucide-react'

interface ProductionListProps {
  productionLogs: ProductionLog[]
  onEdit: (productionLog: ProductionLog) => void
  onDelete: (productionLogId: string) => void
}

export const ProductionList: React.FC<ProductionListProps> = ({ productionLogs, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {productionLogs.map((log) => (
        <Card key={log.id} className="flex flex-col justify-between p-6 hover:shadow-lg transition-shadow duration-300">
          <div>
            <h3 className="text-xl font-semibold mb-2">{log.product_id || 'Producto desconocido'}</h3>
            <p className="text-gray-600 mb-2">Cantidad: {log.quantity_produced}</p>
            <p className="text-lg font-bold mb-2">Costo Total: ${log.total_cost?.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mb-4">Fecha: {new Date(log.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => onEdit(log)} variant="outline" size="sm" className="text-blue-500 hover:bg-blue-50">
              <Edit2Icon className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button onClick={() => onDelete(log.id)} variant="outline" size="sm" className="text-red-500 hover:bg-red-50">
              <Trash2Icon className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}