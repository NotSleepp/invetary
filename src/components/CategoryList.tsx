'use client'

import React from 'react'
import { Category } from '@/types'
import { Button } from './ui/Button'
import { useToast } from '@/contexts/ToastContext'

interface CategoryListProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onEdit, onDelete }) => {
  const { showToast } = useToast()

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await onDelete(categoryId)
        showToast('Category deleted successfully', 'success')
      } catch (error) {
        showToast('Error deleting category', 'error')
      }
    }
  }

  return (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Nombre</th>
          <th className="py-2 px-4 border-b">Descripción</th>
          <th className="py-2 px-4 border-b"></th>
        </tr>
      </thead>
      <tbody>
        {categories.map(category => (
          <tr key={category.id}>
            <td className="py-2 px-4 border-b">{category.name}</td>
            <td className="py-2 px-4 border-b">{category.description}</td>
            <td className="py-2 px-4 border-b">
              <Button onClick={() => onEdit(category)} variant="secondary" className="mr-2">Editar</Button>
              <Button onClick={() => handleDelete(category.id)} variant="danger">Eliminar</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}