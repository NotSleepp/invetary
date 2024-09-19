'use client'

import React, { useState, useMemo } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { CategoryForm } from '@/components/CategoryForm'
import { CategoryList } from '@/components/CategoryList'
import { Category } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// Función para obtener las categorías desde Supabase
const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })
    .range(0, 49) // Implementación básica de paginación
  if (error) throw new Error('Error fetching categories')
  return data
}

export default function CategoriesPage() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // Consulta de categorías con Tanstack Query
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'], // Clave única para la consulta
    queryFn: fetchCategories,  // Función que ejecuta la consulta
    staleTime: 1000 * 60 * 5,  // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10,    // Tiempo antes de que los datos inactivos sean eliminados del cache
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
      showToast(editingCategory ? 'Categoría actualizada con éxito' : 'Categoría añadida con éxito', 'success')
      setEditingCategory(null)
    },
    onError: () => {
      showToast('Error al guardar la categoría', 'error')
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
      showToast('Categoría eliminada con éxito', 'success')
      setDeletingCategoryId(null)
    },
    onError: () => {
      showToast('Error al eliminar la categoría', 'error')
    }
  })

  const handleSubmit = (data: Partial<Category>) => {
    categoryMutation.mutate(data)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
  }

  const handleDelete = (categoryId: string) => {
    setDeletingCategoryId(categoryId)
  }

  const confirmDelete = () => {
    if (deletingCategoryId) {
      deleteCategoryMutation.mutate(deletingCategoryId)
    }
  }

  const cancelDelete = () => {
    setDeletingCategoryId(null)
  }

  const memoizedCategories = useMemo(() => categories || [], [categories])

  // Manejo de estado de carga
  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message="Error al cargar las categorías" />

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Categorías</h1>
        <CategoryForm
          category={editingCategory || undefined}
          onSubmit={handleSubmit}
        />
        <CategoryList
          categories={memoizedCategories}
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
