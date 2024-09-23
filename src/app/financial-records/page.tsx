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
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@heroicons/react/24/solid'
import { Input } from '@/components/ui/Input'
import { SearchIcon } from 'lucide-react'

export default function FinancialRecordsPage() {
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null)
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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
      setIsModalOpen(false)
    } catch (error) {
      showToast('Error al guardar el registro financiero', 'error')
    }
  }

  const handleEdit = (record: FinancialRecord) => {
    setEditingRecord(record)
    setIsModalOpen(true)
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

  const filteredRecords = financialRecords.filter(record =>
    record.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }
  
  if (error) return <ErrorMessage message="Error al cargar los registros financieros" />

  return (
    <AuthGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-80 mb-4 md:mb-0">
            <Input
              type="text"
              placeholder="Buscar registros financieros..."
              label="Búsqueda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ease-in-out"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          </div>
          <Button
            onClick={() => {
              setEditingRecord(null)
              setIsModalOpen(true)
            }}
            className="w-full md:w-auto bg-gradient-to-r from-[#1e2837] to-[#101826] hover:from-[#080d14] hover:to-[#1e2837] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Crear Nuevo Registro Financiero
          </Button>
        </div>

        <FinancialRecordList
          records={filteredRecords}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRecord ? 'Editar Registro Financiero' : 'Crear Nuevo Registro Financiero'}
        >
          <FinancialRecordForm
            record={editingRecord || undefined}
            onSubmit={handleSubmit}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!deletingRecordId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Confirmar eliminación"
          message="¿Está seguro de que desea eliminar este registro financiero?"
        />
      </div>
    </AuthGuard>
  )
}
