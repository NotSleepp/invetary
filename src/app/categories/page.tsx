'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { CategoryForm } from '@/components/CategoryForm'
import { CategoryList } from '@/components/CategoryList'
import { Category } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Spinner from '@/components/ui/Spinner'

// Función para obtener las categorías desde Supabase
const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) throw new Error('Error fetching categories')
  return data
}

export default function CategoriesPage() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // Consulta de categorías con Tanstack Query
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'], // Clave única para la consulta
    queryFn: fetchCategories,  // Función que ejecuta la consulta
    staleTime: 1000 * 60 * 5,  // Cache válido por 5 minutos
    cacheTime: 1000 * 60 * 10, // Cache presente durante 10 minutos
  })

  // Mutación para agregar o actualizar categorías
  const categoryMutation = useMutation({
    mutationFn: async (data: Partial<Category>) => {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', editingCategory.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('categories').insert(data)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] }) // Invalidar cache para refrescar
      showToast(editingCategory ? 'Category updated successfully' : 'Category added successfully', 'success')
      setEditingCategory(null)
    },
    onError: () => {
      showToast('Error saving category', 'error')
    }
  })

  // Mutación para eliminar categorías
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] }) // Invalidar cache para refrescar
      showToast('Category deleted successfully', 'success')
    },
    onError: () => {
      showToast('Error deleting category', 'error')
    }
  })

  // Manejo de envío del formulario
  const handleSubmit = (data: Partial<Category>) => {
    categoryMutation.mutate(data)
  }

  // Manejo de edición de categoría
  const handleEdit = (category: Category) => {
    setEditingCategory(category)
  }

  // Manejo de eliminación de categoría
  const handleDelete = (categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId)
  }

  // Manejo de estado de carga
  if (isLoading) return <Spinner />
  if (error) showToast('Error fetching categories', 'error')

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Categorias</h1>
        <CategoryForm
          category={editingCategory || undefined}
          onSubmit={handleSubmit}
        />
        <CategoryList
          categories={categories || []} // Asegurarse de que sea un array vacío si no hay datos
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}
