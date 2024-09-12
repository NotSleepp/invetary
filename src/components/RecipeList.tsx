'use client'

import React from 'react'
import { Recipe, Product, Material } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'

interface RecipeListProps {
  recipes: Recipe[]
  products: Product[]
  materials: Material[]
  onEdit: (recipe: Recipe) => void
  onDelete: (recipeId: string) => void
}

export const RecipeList: React.FC<RecipeListProps> = ({ recipes, products, materials, onEdit, onDelete }) => {
  const { showToast } = useToast()

  const handleDelete = async (recipeId: string) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await onDelete(recipeId)
        showToast('Recipe deleted successfully', 'success')
      } catch (error) {
        showToast('Error deleting recipe', 'error')
      }
    }
  }

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product ? product.name : 'Unknown Product'
  }

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId)
    return material ? material.name : 'Unknown Material'
  }

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Producto</th>
          <th className="py-2 px-4 border-b">Material</th>
          <th className="py-2 px-4 border-b">Cantidad por Producto</th>
          <th className="py-2 px-4 border-b">Costo de producción</th>
          <th className="py-2 px-4 border-b"></th>
        </tr>
      </thead>
      <tbody>
        {recipes.map(recipe => (
          <tr key={recipe.id}>
            <td className="py-2 px-4 border-b">{getProductName(recipe.product_id)}</td>
            <td className="py-2 px-4 border-b">{getMaterialName(recipe.material_id)}</td>
            <td className="py-2 px-4 border-b">{recipe.quantity_per_product}</td>
            <td className="py-2 px-4 border-b">${recipe.production_cost?.toFixed(2) || 'N/A'}</td>
            <td className="py-2 px-4 border-b">
              <Button onClick={() => onEdit(recipe)} variant="secondary" className="mr-2">Editar</Button>
              <Button onClick={() => handleDelete(recipe.id)} variant="danger">Eliminar</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}