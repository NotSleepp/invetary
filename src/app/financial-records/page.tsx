'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { FinancialRecordForm } from '@/components/FinancialRecordForm'
import { FinancialRecordList } from '@/components/FinancialRecordList'
import { FinancialRecord } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useFinancialRecordStore } from '@/stores/financialRecordStore'

export default function FinancialRecordsPage() {
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null)
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null)
  const { showToast } = useToast()

  const { 
    financialRecords, 
    isLoading, 
    error, 
    fetchFinancialRecords, 
    addFinancialRecord, 
    updateFinancialRecord, 
    deleteFinancialRecord 
  } = useFinancialRecordStore()

  useEffect(() => {
    fetchFinancialRecords()
  }, [fetchFinancialRecords])

  const handleSubmit = async (data: Partial<FinancialRecord>) => {
    try {
      if (editingRecord) {
        await updateFinancialRecord(editingRecord.id, data)
        showToast('Registro financiero actualizado con éxito', 'success')
      } else {
        await addFinancialRecord(data)
        showToast('Registro financiero añadido con éxito', 'success')
      }
      setEditingRecord(null)
    } catch (error) {
      showToast('Error al guardar el registro financiero', 'error')
    }
  }

  const handleEdit = (record: FinancialRecord) => {
    setEditingRecord(record)
  }

  const handleDelete = (recordId: string) => {
    setDeletingRecordId(recordId)
  }

  const confirmDelete = async () => {
    if (deletingRecordId) {
      try {
        await deleteFinancialRecord(deletingRecordId)
        showToast('Registro financiero eliminado con éxito', 'success')
        setDeletingRecordId(null)
      } catch {
        showToast('Error al eliminar el registro financiero', 'error')
      }
    }
  }

  const cancelDelete = () => {
    setDeletingRecordId(null)
  }

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
          records={financialRecords}
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
