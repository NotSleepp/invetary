'use client'

import React, { useState, useMemo } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { MaterialForm } from '@/components/MaterialForm'
import { MaterialList } from '@/components/MaterialList'
import { Material, Category, Supplier } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Funciones de consulta
const fetchMaterials = async () => {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('name', { ascending: true })
    .range(0, 49) // Implementación básica de paginación
  if (error) throw new Error('Error al obtener materiales')
  return data
}

const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) throw new Error('Error al obtener categorías')
  return data
}

const fetchSuppliers = async () => {
  const { data, error } = await supabase.from('suppliers').select('*')
  if (error) throw new Error('Error al obtener proveedores')
  return data
}

export default function MaterialsPage() {
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // Consultas
  const { data: materials, isLoading: loadingMaterials, error: materialsError } = useQuery({
    queryKey: ['materials'], 
    queryFn: fetchMaterials,
    staleTime: 1000 * 60 * 5 
  })
  const { data: categories, isLoading: loadingCategories, error: categoriesError } = useQuery({
    queryKey: ['categories'], 
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5 
  })
  const { data: suppliers, isLoading: loadingSuppliers, error: suppliersError } = useQuery({
    queryKey: ['suppliers'], 
    queryFn: fetchSuppliers,
    staleTime: 1000 * 60 * 5 
  })

  // Mutaciones
  const materialMutation = useMutation({
    mutationFn: async (material: Partial<Material>) => {
      if (editingMaterial) {
        const { error } = await supabase
          .from('materials')
          .update(material)
          .eq('id', editingMaterial.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('materials').insert(material)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      showToast(editingMaterial ? 'Material actualizado con éxito' : 'Material añadido con éxito', 'success')
      setEditingMaterial(null)
    },
    onError: () => {
      showToast('Error al guardar el material', 'error')
    }
  })

  const deleteMaterialMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase.from('materials').delete().eq('id', materialId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      showToast('Material eliminado con éxito', 'success')
      setDeletingMaterialId(null)
    },
    onError: () => {
      showToast('Error al eliminar el material', 'error')
    }
  })

  const handleSubmit = (data: Partial<Material>) => {
    materialMutation.mutate(data)
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (materialId: string) => {
    setDeletingMaterialId(materialId)
  }

  const confirmDelete = () => {
    if (deletingMaterialId) {
      deleteMaterialMutation.mutate(deletingMaterialId)
    }
  }

  const cancelDelete = () => {
    setDeletingMaterialId(null)
  }

  const memoizedMaterials = useMemo(() => materials || [], [materials])
  const memoizedCategories = useMemo(() => categories || [], [categories])
  const memoizedSuppliers = useMemo(() => suppliers || [], [suppliers])

  if (loadingMaterials || loadingCategories || loadingSuppliers) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (materialsError || categoriesError || suppliersError) {
    return <ErrorMessage message="Error al cargar los datos. Por favor, intente de nuevo más tarde." />
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Materiales</h1>
        <MaterialForm
          material={editingMaterial || undefined}
          categories={memoizedCategories}
          suppliers={memoizedSuppliers}
          onSubmit={handleSubmit}
        />
        <MaterialList
          materials={memoizedMaterials}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <ConfirmDialog
          isOpen={!!deletingMaterialId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Confirmar eliminación"
          message="¿Está seguro de que desea eliminar este material?"
        />
      </div>
    </AuthGuard>
  )
}
