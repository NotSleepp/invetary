'use client'

import React, { useState, useMemo } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ProductionForm } from '@/components/ProductionForm'
import { ProductionList } from '@/components/ProductionList'
import { ProductionLog } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// Función para obtener logs de producción
const fetchProductionLogs = async () => {
  const { data, error } = await supabase
    .from('production_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(0, 49) // Implementación básica de paginación
  if (error) throw new Error('Error al obtener los registros de producción')
  return data
}

export default function ProductionPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null)

  // Query para obtener los logs de producción
  const { data: productionLogs, isLoading, error } = useQuery({
    queryKey: ['production_logs'],
    queryFn: fetchProductionLogs,
    staleTime: 1000 * 60 * 5,  // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Cache presente durante 10 minutos
  })

  // Mutación para agregar un nuevo log de producción
  const addProductionLogMutation = useMutation({
    mutationFn: async (data: Partial<ProductionLog>) => {
      const { error } = await supabase.from('production_logs').insert(data)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production_logs'] })
      showToast('Registro de producción creado con éxito', 'success')
    },
    onError: () => {
      showToast('Error al crear el registro de producción', 'error')
    }
  })

  // Mutación para eliminar un log de producción
  const deleteProductionLogMutation = useMutation({
    mutationFn: async (productionLogId: string) => {
      const { error } = await supabase
        .from('production_logs')
        .delete()
        .eq('id', productionLogId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production_logs'] })
      showToast('Registro de producción eliminado con éxito', 'success')
      setDeletingLogId(null)
    },
    onError: () => {
      showToast('Error al eliminar el registro de producción', 'error')
    }
  })

  // Manejo del envío del formulario
  const handleSubmit = (data: Partial<ProductionLog>) => {
    addProductionLogMutation.mutate(data)
  }

  // Manejo de eliminación de un log de producción
  const handleDelete = (productionLogId: string) => {
    setDeletingLogId(productionLogId)
  }

  const confirmDelete = () => {
    if (deletingLogId) {
      deleteProductionLogMutation.mutate(deletingLogId)
    }
  }

  const cancelDelete = () => {
    setDeletingLogId(null)
  }

  const memoizedProductionLogs = useMemo(() => productionLogs || [], [productionLogs])

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
            {memoizedProductionLogs.length > 0 ? (
              <ProductionList
                productionLogs={memoizedProductionLogs}
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
