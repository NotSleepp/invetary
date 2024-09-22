'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { MaterialForm } from '@/components/MaterialForm'
import { MaterialList } from '@/components/MaterialList'
import { Material } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useMaterialStore } from '@/stores/materialStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useSupplierStore } from '@/stores/supplierStore'
import { Supplier } from '@/types'; // Ajusta la ruta de importación según sea necesario

export default function MaterialsPage() {
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null)
  const { showToast } = useToast()

  const { 
    materials, 
    isLoading: loadingMaterials, 
    error: materialsError, 
    fetchMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial
  } = useMaterialStore()

  const {
    categories,
    isLoading: loadingCategories,
    error: categoriesError,
    fetchCategories
  } = useCategoryStore()

  const {
    suppliers,
    isLoading: loadingSuppliers,
    error: suppliersError,
    fetchSuppliers
  } = useSupplierStore()

  useEffect(() => {
    fetchMaterials()
    fetchCategories()
    fetchSuppliers()
  }, [fetchMaterials, fetchCategories, fetchSuppliers])

  const handleSubmit = async (data: Partial<Material>) => {
    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, data)
        showToast('Material actualizado con éxito', 'success')
      } else {
        await addMaterial(data)
        showToast('Material añadido con éxito', 'success')
      }
      setEditingMaterial(null)
    } catch (error) {
      showToast('Error al guardar el material', 'error')
    }
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (materialId: string) => {
    setDeletingMaterialId(materialId)
  }

  const confirmDelete = async () => {
    if (deletingMaterialId) {
      try {
        await deleteMaterial(deletingMaterialId)
        showToast('Material eliminado con éxito', 'success')
        setDeletingMaterialId(null)
      } catch (error) {
        showToast('Error al eliminar el material', 'error')
      }
    }
  }

  const cancelDelete = () => {
    setDeletingMaterialId(null)
  }

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
          categories={categories}
          suppliers={suppliers as Supplier[]}
          onSubmit={handleSubmit}
        />
        <MaterialList
          materials={materials}
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