'use client'

import React from 'react'
import { Product } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Edit2Icon, Trash2Icon } from 'lucide-react'

// Tipo extendido para el producto en la lista
type ProductListItem = Product & {
  price?: number;
  stock?: number;
  category?: {
    name: string;
  };
}

interface ProductListProps {
  products: ProductListItem[]
  onEdit: (product: ProductListItem) => void
  onDelete: (productId: string) => void
}

export const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
          <div>
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-4">{product.description}</p>
            {'price' in product && (
              <p className="text-lg font-bold mb-2">Precio: ${(product as any).price.toFixed(2)}</p>
            )}
            {'category' in product && 'name' in (product as any).category && (
              <p className="text-sm text-gray-500 mb-2">Categoría: {(product as any).category.name}</p>
            )}
            {'stock' in product && (
              <p className="text-sm text-gray-500 mb-4">Stock: {(product as any).stock}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => onEdit(product)} variant="outline" className="flex items-center">
              <Edit2Icon className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button onClick={() => onDelete(product.id)} variant="outline" className="flex items-center">
              <Trash2Icon className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}