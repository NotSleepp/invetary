'use client'

import React, { useEffect, useMemo } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { SaleForm } from '@/components/SaleForm'
import { SaleList } from '@/components/SaleList'
import { Sale } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import { useSalesStore } from '@/stores/salesStore'
import ErrorMessage from '@/components/ui/ErrorMessage'

export default function SalesPage() {
  const { showToast } = useToast()
  const { 
    sales, 
    totalCount, 
    page, 
    isLoading, 
    error, 
    fetchSales, 
    createSale, 
    deleteSale, 
    setPage, 
    setSearchTerm 
  } = useSalesStore()

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const handleSubmit = async (data: Partial<Sale>) => {
    try {
      await createSale(data)
      showToast('Venta creada con éxito', 'success')
    } catch (error) {
      showToast('Error al crear la venta', 'error')
    }
  }

  const handleDelete = async (saleId: string) => {
    try {
      await deleteSale(saleId)
      showToast('Venta eliminada con éxito', 'success')
    } catch (error) {
      showToast('Error al eliminar la venta', 'error')
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const memoizedSaleForm = useMemo(() => <SaleForm onSubmit={handleSubmit} />, [handleSubmit])
  const memoizedSaleList = useMemo(() => (
    <SaleList
      sales={sales}
      onDelete={handleDelete}
      isLoading={isLoading}
      totalCount={totalCount}
      page={page}
      onPageChange={handlePageChange}
    />
  ), [sales, handleDelete, isLoading, totalCount, page, handlePageChange])

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Ventas</h1>
        <input
          type="text"
          placeholder="Buscar por nombre de producto"
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
        {memoizedSaleForm}
        {memoizedSaleList}
      </div>
    </AuthGuard>
  )
}

interface SaleListProps {
  sales: Sale[];
  onDelete: (saleId: string) => void;
  isLoading: boolean;
  totalCount: number;
  page: number;
  onPageChange: (newPage: number) => void;
}