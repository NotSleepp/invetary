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
    if (window.confirm('¿Está seguro de que desea eliminar esta receta?')) {
      try {
        await onDelete(recipeId)
        showToast('Receta eliminada con éxito', 'success')
      } catch (error) {
        showToast('Error al eliminar la receta', 'error')
      }
    }
  }

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product ? product.name : 'Producto Desconocido'
  }

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId)
    return material ? material.name : 'Material Desconocido'
  }

  const getMaterialCost = (materialId: string) => {
    const material = materials.find(m => m.id === materialId)
    return material ? material.cost_per_unit : 0
  }

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Producto</th>
          <th className="py-2 px-4 border-b">Ingrediente</th>
          <th className="py-2 px-4 border-b">Cantidad</th>
          <th className="py-2 px-4 border-b">Costo por Unidad</th>
          <th className="py-2 px-4 border-b">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {recipes.map(recipe => {
          const materialCost = getMaterialCost(recipe.material_id)
          const totalCost = materialCost * recipe.quantity_per_product
          return (
            <tr key={recipe.id}>
              <td className="py-2 px-4 border-b">{getProductName(recipe.product_id)}</td>
              <td className="py-2 px-4 border-b">{getMaterialName(recipe.material_id)}</td>
              <td className="py-2 px-4 border-b">{recipe.quantity_per_product}</td>
              <td className="py-2 px-4 border-b">${materialCost.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">
                <Button onClick={() => onEdit(recipe)} variant="secondary" className="mr-2">Editar</Button>
                <Button onClick={() => handleDelete(recipe.id)} variant="destructive">Eliminar</Button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}