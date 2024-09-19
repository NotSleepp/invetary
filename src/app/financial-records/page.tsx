'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { FinancialRecordForm } from '@/components/FinancialRecordForm'
import { FinancialRecordList } from '@/components/FinancialRecordList'
import { FinancialRecord } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Spinner from '@/components/ui/Spinner'

// Función para obtener registros financieros
const fetchFinancialRecords = async () => {
  const { data, error } = await supabase.from('financial_records').select('*')
  if (error) throw new Error('Error fetching FinancialRecords')
  return data
}

export default function FinancialRecordsPage() {
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // Query para obtener registros financieros
  const { data: financialRecords, isLoading, error } = useQuery({
    queryKey: ['financial_records'], // Clave para identificar la query
    queryFn: fetchFinancialRecords,  // Función que ejecuta la query
    staleTime: 1000 * 60 * 5,        // Cache válido por 5 minutos
    cacheTime: 1000 * 60 * 10,       // Cache presente durante 10 minutos
  })

  // Mutación para agregar o actualizar un registro financiero
  const financialRecordMutation = useMutation({
    mutationFn: async (data: Partial<FinancialRecord>) => {
      if (editingRecord) {
        const { error } = await supabase
          .from('financial_records')
          .update(data)
          .eq('id', editingRecord.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('financial_records').insert(data)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_records'] }) // Invalidar cache para refrescar
      showToast(editingRecord ? 'Financial record updated successfully' : 'Financial record added successfully', 'success')
      setEditingRecord(null)
    },
    onError: () => {
      showToast('Error saving financial record', 'error')
    }
  })

  // Mutación para eliminar un registro financiero
  const deleteFinancialRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', recordId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_records'] }) // Invalidar cache para refrescar
      showToast('Financial record deleted successfully', 'success')
    },
    onError: () => {
      showToast('Error deleting financial record', 'error')
    }
  })

  // Manejo del envío del formulario
  const handleSubmit = (data: Partial<FinancialRecord>) => {
    financialRecordMutation.mutate(data)
  }

  // Manejo de edición del registro
  const handleEdit = (record: FinancialRecord) => {
    setEditingRecord(record)
  }

  // Manejo de eliminación del registro
  const handleDelete = (recordId: string) => {
    deleteFinancialRecordMutation.mutate(recordId)
  }

  // Estado de carga
  if (isLoading) return <Spinner />
  if (error) showToast('Error fetching FinancialRecords', 'error')

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Registros financieros</h1>
        <FinancialRecordForm
          record={editingRecord || undefined}
          onSubmit={handleSubmit}
        />
        <FinancialRecordList
          records={financialRecords || []} // Asegurarse de que sea un array vacío si no hay datos
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}
