'use client'

import React, { useState, useMemo } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { FinancialRecordForm } from '@/components/FinancialRecordForm'
import { FinancialRecordList } from '@/components/FinancialRecordList'
import { FinancialRecord } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// Función para obtener registros financieros
const fetchFinancialRecords = async () => {
  const { data, error } = await supabase
    .from('financial_records')
    .select('*')
    .order('created_at', { ascending: false }) // Cambiado 'date' por 'created_at'
    .range(0, 49)
  if (error) throw new Error('Error al obtener los registros financieros')
  return data
}

export default function FinancialRecordsPage() {
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null)
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // Query para obtener registros financieros
  const { data: financialRecords, isLoading, error } = useQuery({
    queryKey: ['financial_records'],
    queryFn: fetchFinancialRecords,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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
      queryClient.invalidateQueries({ queryKey: ['financial_records'] })
      showToast(editingRecord ? 'Registro financiero actualizado con éxito' : 'Registro financiero añadido con éxito', 'success')
      setEditingRecord(null)
    },
    onError: () => {
      showToast('Error al guardar el registro financiero', 'error')
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
      queryClient.invalidateQueries({ queryKey: ['financial_records'] })
      showToast('Registro financiero eliminado con éxito', 'success')
      setDeletingRecordId(null)
    },
    onError: () => {
      showToast('Error al eliminar el registro financiero', 'error')
    }
  })

  const handleSubmit = (data: Partial<FinancialRecord>) => {
    financialRecordMutation.mutate(data)
  }

  const handleEdit = (record: FinancialRecord) => {
    setEditingRecord(record)
  }

  const handleDelete = (recordId: string) => {
    setDeletingRecordId(recordId)
  }

  const confirmDelete = () => {
    if (deletingRecordId) {
      deleteFinancialRecordMutation.mutate(deletingRecordId)
    }
  }

  const cancelDelete = () => {
    setDeletingRecordId(null)
  }

  const memoizedRecords = useMemo(() => financialRecords || [], [financialRecords])

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message="Error al cargar los registros financieros" />

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Registros financieros</h1>
        <FinancialRecordForm
          record={editingRecord || undefined}
          onSubmit={handleSubmit}
        />
        <FinancialRecordList
          records={memoizedRecords}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <ConfirmDialog
          isOpen={!!deletingRecordId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Confirmar eliminación"
          message="¿Estás seguro de que quieres eliminar este registro financiero?"
        />
      </div>
    </AuthGuard>
  )
}
