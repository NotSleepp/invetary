'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ProductionForm } from '@/components/ProductionForm'
import { ProductionList } from '@/components/ProductionList'
import { ProductionLog } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Spinner from '@/components/ui/Spinner'

// Función para obtener logs de producción
const fetchProductionLogs = async () => {
  const { data, error } = await supabase.from('production_logs').select('*')
  if (error) throw new Error('Error fetching production logs')
  return data
}

export default function ProductionPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // Query para obtener los logs de producción
  const { data: productionLogs, isLoading, error } = useQuery({
    queryKey: ['production_logs'],
    queryFn: fetchProductionLogs,
    staleTime: 1000 * 60 * 5,  // Cache válido por 5 minutos
    cacheTime: 1000 * 60 * 10, // Cache presente durante 10 minutos
  })

  // Mutación para agregar un nuevo log de producción
  const addProductionLogMutation = useMutation({
    mutationFn: async (data: Partial<ProductionLog>) => {
      const { error } = await supabase.from('production_logs').insert(data)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production_logs'] }) // Invalidar caché para refrescar
      showToast('Production log created successfully', 'success')
    },
    onError: () => {
      showToast('Error creating production log', 'error')
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
      queryClient.invalidateQueries({ queryKey: ['production_logs'] }) // Invalidar caché para refrescar
      showToast('Production log deleted successfully', 'success')
    },
    onError: () => {
      showToast('Error deleting production log', 'error')
    }
  })

  // Manejo del envío del formulario
  const handleSubmit = (data: Partial<ProductionLog>) => {
    addProductionLogMutation.mutate(data)
  }

  // Manejo de eliminación de un log de producción
  const handleDelete = (productionLogId: string) => {
    deleteProductionLogMutation.mutate(productionLogId)
  }

  // Estado de carga y error
  if (isLoading) return <Spinner />
  if (error) showToast('Error fetching production logs', 'error')

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
            {productionLogs && productionLogs.length > 0 ? (
              <ProductionList
                productionLogs={productionLogs}
                onDelete={handleDelete}
              />
            ) : (
              <p className="text-gray-500">No production logs found.</p>
            )}
          </section>
        </div>
      </div>
    </AuthGuard>
  )
}
