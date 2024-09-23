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
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@heroicons/react/24/solid'
import { Input } from '@/components/ui/Input'
import { SearchIcon } from 'lucide-react'

export default function CategoriesPage() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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
      setIsModalOpen(false)
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
    setIsModalOpen(true)
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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }
  
  if (error) return <ErrorMessage message={error} />

  return (
    <AuthGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-80 mb-4 md:mb-0">
            <Input
              type="text"
              placeholder="Buscar categorías..."
              label="Búsqueda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ease-in-out"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          </div>
          <Button
            onClick={() => {
              setEditingCategory(null)
              setIsModalOpen(true)
            }}
            className="w-full md:w-auto bg-gradient-to-r from-[#1e2837] to-[#101826] hover:from-[#080d14] hover:to-[#1e2837] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Crear Nueva Categoría
          </Button>
        </div>

        <CategoryList
          categories={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
        >
          <CategoryForm
            category={editingCategory || undefined}
            onSubmit={handleSubmit}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!deletingCategoryId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Confirmar eliminación"
          message="¿Está seguro de que desea eliminar esta categoría?"
        />
      </div>
    </AuthGuard>
  )
}