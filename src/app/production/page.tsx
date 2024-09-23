'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ProductionForm } from '@/components/ProductionForm'
import { ProductionList } from '@/components/ProductionList'
import { useToast } from '@/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useProductionStore } from '@/stores/productionStore'
import { useProductStore } from '@/stores/productStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useRecipeStore } from '@/stores/recipeStore'
import { ProductionLog, Product, Material, Recipe } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PlusIcon, SearchIcon } from 'lucide-react'

export default function ProductionPage() {
  const { showToast } = useToast()
  const [editingLog, setEditingLog] = useState<ProductionLog | null>(null)
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const {
    productionLogs,
    isLoading: productionLoading,
    error: productionError,
    fetchProductionLogs,
    addProductionLog,
    updateProductionLog,
    deleteProductionLog
  } = useProductionStore()

  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    fetchProducts,
  } = useProductStore()

  const {
    materials,
    isLoading: materialsLoading,
    error: materialsError,
    fetchMaterials,
  } = useMaterialStore()

  const {
    recipes,
    isLoading: recipesLoading,
    error: recipesError,
    fetchRecipes,
  } = useRecipeStore()

  useEffect(() => {
    fetchProductionLogs()
    fetchProducts()
    fetchMaterials()
    fetchRecipes()
  }, [fetchProductionLogs, fetchProducts, fetchMaterials, fetchRecipes])

  const handleSubmit = async (data: Partial<ProductionLog>) => {
    try {
      if (editingLog) {
        await updateProductionLog(editingLog.id, data)
        showToast('Registro de producción actualizado con éxito', 'success')
      } else {
        await addProductionLog(data)
        showToast('Registro de producción creado con éxito', 'success')
      }
      setEditingLog(null)
      setIsModalOpen(false)
      fetchProductionLogs()
    } catch (error) {
      showToast('Error al guardar el registro de producción', 'error')
    }
  }

  const handleEdit = (log: ProductionLog) => {
    setEditingLog(log)
    setIsModalOpen(true)
  }

  const handleDelete = (productionLogId: string) => {
    setDeletingLogId(productionLogId)
  }

  const confirmDelete = async () => {
    if (deletingLogId) {
      try {
        await deleteProductionLog(deletingLogId)
        showToast('Registro de producción eliminado con éxito', 'success')
        setDeletingLogId(null)
        fetchProductionLogs()
      } catch {
        showToast('Error al eliminar el registro de producción', 'error')
      }
    }
  }

  const cancelDelete = () => {
    setDeletingLogId(null)
  }

  const filteredLogs = useMemo(() => {
    return productionLogs.filter((log): log is ProductionLog =>
      'product_name' in log &&
      typeof log.product_name === 'string' &&
      log.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [productionLogs, searchTerm])

  const productsWithRecipes = useMemo(() => {
    return products.map(product => ({
      ...product,
      recipes: recipes.filter(recipe => recipe.product_id === product.id)
    }))
  }, [products, recipes])

  if (productionLoading || productsLoading || materialsLoading || recipesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (productionError || productsError || materialsError || recipesError) {
    return <ErrorMessage message="Error al cargar los datos. Por favor, intente de nuevo más tarde." />
  }

  return (
    <AuthGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-80 mb-4 md:mb-0">
            <Input
              type="text"
              placeholder="Buscar registros..."
              label="Búsqueda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ease-in-out"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          </div>
          <Button
            onClick={() => {
              setEditingLog(null)
              setIsModalOpen(true)
            }}
            className="w-full md:w-auto bg-gradient-to-r from-[#1e2837] to-[#101826] hover:from-[#080d14] hover:to-[#1e2837] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Crear Nuevo Registro de Producción
          </Button>
        </div>

        <ProductionList
          productionLogs={filteredLogs}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingLog ? 'Editar Registro de Producción' : 'Crear Nuevo Registro de Producción'}
        >
          <ProductionForm
            productionLog={editingLog || undefined}
            onSubmit={handleSubmit}
            products={productsWithRecipes}
            materials={materials}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!deletingLogId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Confirmar eliminación"
          message="¿Está seguro de que desea eliminar este registro de producción?"
        />
      </div>
    </AuthGuard>
  )
}