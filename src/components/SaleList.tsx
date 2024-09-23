'use client'

import React from 'react'
import { Sale, Product } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { Card } from './ui/Card'

interface SaleListProps {
  sales: Sale[]
  products?: Product[]  // Hacemos que products sea opcional
  onDelete: (saleId: string) => void
  onEdit: (sale: Sale) => void
  isLoading: boolean
  totalCount: number
  page: number
  onPageChange: (newPage: number) => void
}

export const SaleList: React.FC<SaleListProps> = ({ sales, products = [], onDelete, onEdit, isLoading, totalCount, page, onPageChange }) => {
  const { showToast } = useToast()

  const handleDelete = async (saleId: string) => {
    try {
      await onDelete(saleId)
      showToast('Venta eliminada con éxito', 'success')
    } catch (error) {
      showToast('Error al eliminar la venta', 'error')
    }
  }

  const getProductName = (productId: string | undefined ) => {
    if (!productId) return 'Producto desconocido'
    if (!products || products.length === 0) return 'Producto desconocido'
    const product = products.find(p => p.id === productId)
    return product ? product.name : 'Producto desconocido'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sales.map(sale => (
        <Card key={sale.id} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-2">Venta #{sale.id}</h3>
          <div className="mb-2">
            <span className="font-medium">Producto:</span> {getProductName(sale.product_id)}
          </div>
          <div className="mb-2">
            <span className="font-medium">Cantidad vendida:</span> {sale.quantity_sold}
          </div>
          <div className="mb-2">
            <span className="font-medium">Precio de venta:</span> ${sale.sale_price?.toFixed(2) ?? '0.00'}
          </div>
          <div className="mb-2">
            <span className="font-medium">Ingresos totales:</span> ${sale.total_revenue?.toFixed(2) ?? '0.00'}
          </div>
          <div className="mb-4">
            <span className="font-medium">Fecha:</span> {new Date(sale.created_at ?? new Date()).toLocaleDateString()}
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => onEdit(sale)} variant="outline" className="flex items-center">
              <PencilIcon className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button onClick={() => handleDelete(sale.id)} variant="outline" className="flex items-center">
              <TrashIcon className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}