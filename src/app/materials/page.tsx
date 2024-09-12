'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { MaterialForm } from '@/components/MaterialForm'
import { MaterialList } from '@/components/MaterialList'
import { Material, Category, Supplier } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import  Spinner  from '@/components/ui/Spinner'

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const { showToast } = useToast()

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [materialsData, categoriesData, suppliersData] = await Promise.all([
          supabase.from('materials').select('*'),
          supabase.from('categories').select('*'),
          supabase.from('suppliers').select('*'),
        ])

        if (materialsData.error || categoriesData.error || suppliersData.error) {
          throw new Error('Error fetching data')
        }

        setMaterials(materialsData.data || [])
        setCategories(categoriesData.data || [])
        setSuppliers(suppliersData.data || [])
      } catch (error) {
        showToast('Error fetching data', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [showToast])

  const fetchMaterials = async () => {
    const { data, error } = await supabase.from('materials').select('*')
    if (error) {
      showToast('Error fetching materials', 'error')
    } else {
      setMaterials(data || [])
    }
  }

  const handleSubmit = async (data: Partial<Material>) => {
    try {
      setLoading(true)
      if (editingMaterial) {
        const { error } = await supabase
          .from('materials')
          .update(data)
          .eq('id', editingMaterial.id)
        if (error) throw error
        setEditingMaterial(null)
        showToast('Material updated successfully', 'success')
      } else {
        const { error } = await supabase.from('materials').insert(data)
        if (error) throw error
        showToast('Material added successfully', 'success')
      }
      await fetchMaterials() // Fetch materials after adding or updating
    } catch (error) {
      showToast('Error saving material', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    window.scrollTo({ top: 0, behavior: 'smooth' })  // Llevar al usuario al formulario al editar
  }

  const handleDelete = async (materialId: string) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)
      if (error) throw error
      showToast('Material deleted successfully', 'success')
      await fetchMaterials() // Fetch materials after deleting
    } catch (error) {
      showToast('Error deleting material', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />  {/* Indicador de carga */}
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Materiales</h1>
        <MaterialForm
          material={editingMaterial || undefined}
          categories={categories}
          suppliers={suppliers}
          onSubmit={handleSubmit}
        />
        <MaterialList
          materials={materials}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}
