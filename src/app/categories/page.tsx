'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { CategoryForm } from '@/components/CategoryForm'
import { CategoryList } from '@/components/CategoryList'
import { Category } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import { useQueryClient } from '@tanstack/react-query'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useCategoryStore } from '@/stores/categoryStore'

export default function CategoriesPage() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const { 
    categories, 
    isLoading, 
    error, 
    fetchCategories, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategoryStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSubmit = async (data: Partial<Category>) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data)
        showToast('Categoría actualizada con éxito', 'success')
      } else {
        await addCategory(data)
        showToast('Categoría añadida con éxito', 'success')
      }
      setEditingCategory(null)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error')
      } else {
        showToast('Error al guardar la categoría', 'error')
      }
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
  }

  const handleDelete = (categoryId: string) => {
    setDeletingCategoryId(categoryId)
  }

  const confirmDelete = async () => {
    if (deletingCategoryId) {
      try {
        await deleteCategory(deletingCategoryId)
        showToast('Categoría eliminada con éxito', 'success')
        setDeletingCategoryId(null)
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      } catch (error) {
        showToast('Error al eliminar la categoría', 'error')
      }
    }
  }

  const cancelDelete = () => {
    setDeletingCategoryId(null)
  }

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Categorías</h1>
        <CategoryForm
          category={editingCategory || undefined}
          onSubmit={handleSubmit}
        />
        <CategoryList
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <ConfirmDialog
          isOpen={!!deletingCategoryId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Confirmar eliminación"
          message="¿Estás seguro de que quieres eliminar esta categoría?"
        />
      </div>
    </AuthGuard>
  )
}