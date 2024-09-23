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
import { Supplier } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@heroicons/react/24/solid'
import { Input } from '@/components/ui/Input'
import { SearchIcon } from 'lucide-react'

export default function MaterialsPage() {
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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
      setIsModalOpen(false)
    } catch (error) {
      showToast('Error al guardar el material', 'error')
    }
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    setIsModalOpen(true)
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

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-80 mb-4 md:mb-0">
            <Input
              type="text"
              placeholder="Buscar materiales..."
              label="Búsqueda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ease-in-out"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          </div>
          <Button
            onClick={() => {
              setEditingMaterial(null)
              setIsModalOpen(true)
            }}
            className="w-full md:w-auto bg-gradient-to-r from-[#1e2837] to-[#101826] hover:from-[#080d14] hover:to-[#1e2837] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Crear Nuevo Ingrediente
          </Button>
        </div>

        <MaterialList
          materials={filteredMaterials}
          onEdit={handleEdit}
          onDelete={handleDelete}
          suppliers={suppliers as Supplier[]}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingMaterial ? 'Editar Material' : 'Crear Nuevo Material'}
        >
          <MaterialForm
            material={editingMaterial || undefined}
            categories={categories}
            suppliers={suppliers as Supplier[]}
            onSubmit={handleSubmit}
          />
        </Modal>

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