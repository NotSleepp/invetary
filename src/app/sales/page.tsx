'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { SaleForm } from '@/components/SaleForm'
import { SaleList } from '@/components/SaleList'
import { Sale } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import { useSalesStore } from '@/stores/salesStore'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@heroicons/react/24/solid'
import { Input } from '@/components/ui/Input'
import { SearchIcon } from 'lucide-react'

export default function SalesPage() {
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { showToast } = useToast()

  const { 
    sales, 
    totalCount, 
    page, 
    isLoading, 
    error, 
    fetchSales, 
    createSale, 
    updateSale,
    deleteSale, 
    setPage, 
    setSearchTerm: setStoreSearchTerm
  } = useSalesStore()

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const handleSubmit = async (data: Partial<Sale>) => {
    try {
      if (editingSale) {
        await updateSale(editingSale.id, data)
        showToast('Venta actualizada con éxito', 'success')
      } else {
        await createSale(data)
        showToast('Venta creada con éxito', 'success')
      }
      setEditingSale(null)
      setIsModalOpen(false)
    } catch (error) {
      showToast('Error al guardar la venta', 'error')
    }
  }

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale)
    setIsModalOpen(true)
  }

  const handleDelete = (saleId: string) => {
    setDeletingSaleId(saleId)
  }

  const confirmDelete = async () => {
    if (deletingSaleId) {
      try {
        await deleteSale(deletingSaleId)
        showToast('Venta eliminada con éxito', 'success')
        setDeletingSaleId(null)
      } catch (error) {
        showToast('Error al eliminar la venta', 'error')
      }
    }
  }

  const cancelDelete = () => {
    setDeletingSaleId(null)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setStoreSearchTerm(e.target.value)
  }

  const memoizedSaleList = useMemo(() => (
    <SaleList
      sales={sales}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isLoading={isLoading}
      totalCount={totalCount}
      page={page}
      onPageChange={handlePageChange}
    />
  ), [sales, handleEdit, handleDelete, isLoading, totalCount, page, handlePageChange])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <AuthGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-80 mb-4 md:mb-0">
            <Input
              type="text"
              placeholder="Buscar ventas..."
              label="Búsqueda"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ease-in-out"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          </div>
          <Button
            onClick={() => {
              setEditingSale(null)
              setIsModalOpen(true)
            }}
            className="w-full md:w-auto bg-gradient-to-r from-[#1e2837] to-[#101826] hover:from-[#080d14] hover:to-[#1e2837] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Crear Nueva Venta
          </Button>
        </div>

        {memoizedSaleList}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSale ? 'Editar Venta' : 'Crear Nueva Venta'}
        >
          <SaleForm
            sale={editingSale || undefined}
            onSubmit={handleSubmit}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!deletingSaleId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Confirmar eliminación"
          message="¿Está seguro de que desea eliminar esta venta?"
        />
      </div>
    </AuthGuard>
  )
}

interface SaleListProps {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (saleId: string) => void;
  isLoading: boolean;
  totalCount: number;
  page: number;
  onPageChange: (newPage: number) => void;
}