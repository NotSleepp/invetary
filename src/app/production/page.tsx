'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ProductionForm } from '@/components/ProductionForm'
import { ProductionList } from '@/components/ProductionList'
import { useToast } from '@/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useProductionStore } from '@/stores/productionStore'
import { ProductionLog } from '@/types';

export default function ProductionPage() {
  const { showToast } = useToast()
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null)

  const {
    productionLogs,
    isLoading,
    error,
    fetchProductionLogs,
    addProductionLog,
    deleteProductionLog
  } = useProductionStore()

  useEffect(() => {
    fetchProductionLogs()
  }, [fetchProductionLogs])

  const handleSubmit = async (data: Partial<ProductionLog>) => {
    try {
      await addProductionLog(data)
      showToast('Registro de producción creado con éxito', 'success')
    } catch (error) {
      showToast('Error al crear el registro de producción', 'error')
    }
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
      } catch {
        showToast('Error al eliminar el registro de producción', 'error')
      }
    }
  }

  const cancelDelete = () => {
    setDeletingLogId(null)
  }

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message="Error al cargar los registros de producción" />

  return (
    <AuthGuard>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Encabezado */}
          <header className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800">Gestión de producción</h1>
          </header>

          {/* Formulario de producción */}
          <section className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agregar nuevo registro de producción</h2>
            <ProductionForm onSubmit={handleSubmit} />
          </section>

          {/* Lista de logs de producción */}
          <section className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Registro de producción</h2>
            {productionLogs.length > 0 ? (
              <ProductionList
                productionLogs={productionLogs}
                onDelete={handleDelete}
              />
            ) : (
              <p className="text-gray-500">No se encontraron registros de producción.</p>
            )}
          </section>
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!deletingLogId}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar este registro de producción?"
      />
    </AuthGuard>
  )
}
