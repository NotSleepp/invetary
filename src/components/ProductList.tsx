'use client'

import React from 'react'
import { Product } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

export const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => {
  const { showToast } = useToast()

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await onDelete(productId)
        showToast('Product deleted successfully', 'success')
      } catch (error) {
        showToast('Error deleting product', 'error')
      }
    }
  }

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Nombre</th>
          <th className="py-2 px-4 border-b">Stock</th>
          <th className="py-2 px-4 border-b">Precio de costo</th>
          <th className="py-2 px-4 border-b">Precio de venta</th>
          <th className="py-2 px-4 border-b"></th>
        </tr>
      </thead>
      <tbody>
        {products.map(product => (
          <tr key={product.id}>
            <td className="py-2 px-4 border-b">{product.name}</td>
            <td className="py-2 px-4 border-b">{product.stock_quantity}</td>
            <td className="py-2 px-4 border-b">${product.cost_price.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">${product.sale_price.toFixed(2)}</td>
            <td className="py-2 px-4 border-b">
              <Button onClick={() => onEdit(product)} variant="secondary">Editar</Button>
              <Button onClick={() => handleDelete(product.id)} variant="danger">Eliminar</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}