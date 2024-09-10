'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ProductionForm } from '@/components/ProductionForm'
import { ProductionList } from '@/components/ProductionList'
import { ProductionLog } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'

export default function ProductionPage() {
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    fetchProductionLogs()
  }, [])

  const fetchProductionLogs = async () => {
    const { data, error } = await supabase.from('production_logs').select('*')
    if (error) {
      showToast('Error fetching production logs', 'error')
    } else {
      setProductionLogs(data || [])
    }
  }

  const handleSubmit = async (data: Partial<ProductionLog>) => {
    const { error } = await supabase
      .from('production_logs')
      .insert(data)
    if (error) {
      showToast('Error creating production log', 'error')
    } else {
      fetchProductionLogs()
      showToast('Production log created successfully', 'success')
    }
  }

  const handleDelete = async (productionLogId: string) => {
    const { error } = await supabase
      .from('production_logs')
      .delete()
      .eq('id', productionLogId)
    if (error) {
      showToast('Error deleting production log', 'error')
    } else {
      fetchProductionLogs()
      showToast('Production log deleted successfully', 'success')
    }
  }

  return (
    <AuthGuard>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Encabezado */}
          <header className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800">Production Management</h1>
          </header>

          {/* Formulario de producción */}
          <section className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add New Production Log</h2>
            <ProductionForm onSubmit={handleSubmit} />
          </section>

          {/* Lista de logs de producción */}
          <section className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Production Logs</h2>
            {productionLogs.length > 0 ? (
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
