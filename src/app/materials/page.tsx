'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { MaterialForm } from '@/components/MaterialForm'
import { MaterialList } from '@/components/MaterialList'
import { Material, Category, Supplier } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Fetch functions
const fetchMaterials = async () => {
  const { data, error } = await supabase.from('materials').select('*')
  if (error) throw new Error('Error fetching materials')
  return data
}

const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) throw new Error('Error fetching categories')
  return data
}

const fetchSuppliers = async () => {
  const { data, error } = await supabase.from('suppliers').select('*')
  if (error) throw new Error('Error fetching suppliers')
  return data
}

export default function MaterialsPage() {
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // Queries
  const { data: materials, isLoading: loadingMaterials } = useQuery({
    queryKey: ['materials'], 
    queryFn: fetchMaterials,
    staleTime: 1000 * 60 * 5 
  })
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'], 
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5 
  })
  const { data: suppliers, isLoading: loadingSuppliers } = useQuery({
    queryKey: ['suppliers'], 
    queryFn: fetchSuppliers,
    staleTime: 1000 * 60 * 5 
  })

  // Mutations
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
 // Refetch materials after mutation
      showToast(editingMaterial ? 'Material updated successfully' : 'Material added successfully', 'success')
      setEditingMaterial(null)
    },
    onError: () => {
      showToast('Error saving material', 'error')
    }
  })

  const deleteMaterialMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase.from('materials').delete().eq('id', materialId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
 // Refetch materials after deletion
      showToast('Material deleted successfully', 'success')
    },
    onError: () => {
      showToast('Error deleting material', 'error')
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
    deleteMaterialMutation.mutate(materialId)
  }

  if (loadingMaterials || loadingCategories || loadingSuppliers) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner /> {/* Indicador de carga */}
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Materiales</h1>
        <MaterialForm
          material={editingMaterial || undefined}
          categories={categories || []}
          suppliers={suppliers || []}
          onSubmit={handleSubmit}
        />
        <MaterialList
          materials={materials || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}
