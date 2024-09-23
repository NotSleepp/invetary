'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { SupplierForm } from '@/components/SupplierForm'
import { SupplierList } from '@/components/SupplierList'
import { Supplier, PartialSupplier } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useSupplierStore } from '@/stores/supplierStore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@heroicons/react/24/solid'
import { Input } from '@/components/ui/Input'
import { SearchIcon } from 'lucide-react'

type SupplierWithEmailAndPhone = Supplier & {
  email?: string;
  phone?: string;
}

export default function SuppliersPage() {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingSupplierId, setDeletingSupplierId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { showToast } = useToast()

  const { 
    suppliers, 
    isLoading, 
    error, 
    fetchSuppliers, 
    addSupplier, 
    updateSupplier, 
    deleteSupplier 
  } = useSupplierStore()

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const handleSubmit = async (data: Partial<SupplierWithEmailAndPhone>) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data)
        showToast('Proveedor actualizado exitosamente', 'success')
      } else {
        await addSupplier(data)
        showToast('Proveedor creado exitosamente', 'success')
      }
      setEditingSupplier(null)
      setIsModalOpen(false)
    } catch (error) {
      showToast('Error al guardar el proveedor', 'error')
    }
  }

  const handleEdit = (supplier: PartialSupplier) => {
    setEditingSupplier(supplier as Supplier)
    setIsModalOpen(true)
  }

  const handleDelete = (supplierId: string) => {
    setDeletingSupplierId(supplierId)
  }

  const confirmDelete = async () => {
    if (deletingSupplierId) {
      try {
        await deleteSupplier(deletingSupplierId)
        showToast('Proveedor eliminado exitosamente', 'success')
        setDeletingSupplierId(null)
      } catch (error) {
        showToast('Error al eliminar proveedor', 'error')
      }
    }
  }

  const cancelDelete = () => {
    setDeletingSupplierId(null)
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message="Error al cargar los datos. Por favor, intente de nuevo más tarde." />
  }

  return (
    <AuthGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-80 mb-4 md:mb-0">
            <Input
              type="text"
              placeholder="Buscar proveedores..."
              label="Búsqueda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ease-in-out"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          </div>
          <Button
            onClick={() => {
              setEditingSupplier(null)
              setIsModalOpen(true)
            }}
            className="w-full md:w-auto bg-gradient-to-r from-[#1e2837] to-[#101826] hover:from-[#080d14] hover:to-[#1e2837] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Crear Nuevo Proveedor
          </Button>
        </div>

        <SupplierList
          suppliers={filteredSuppliers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSupplier ? 'Editar Proveedor' : 'Crear Nuevo Proveedor'}
        >
          <SupplierForm
            supplier={editingSupplier || undefined}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!deletingSupplierId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Confirmar eliminación"
          message="¿Está seguro de que desea eliminar este proveedor?"
        />
      </div>
    </AuthGuard>
  )
}