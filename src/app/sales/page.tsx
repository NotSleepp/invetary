'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { SaleForm } from '@/components/SaleForm'
import { SaleList } from '@/components/SaleList'
import { Sale } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import { PostgrestError } from '@supabase/supabase-js'

const SALES_PER_PAGE = 20

interface BasicSale {
  id: string;
  date: string;
  amount: number;
  product_name: string;
}


export default function SalesPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // Función para obtener ventas
  const fetchSales = useCallback(async ({ pageParam = 1 }): Promise<SalesData> => {
    const from = (pageParam - 1) * SALES_PER_PAGE
    const to = from + SALES_PER_PAGE - 1

    let query = supabase
      .from('sales')
      .select('id, created_at, sale_price, product_id, user_id, quantity_sold', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (searchTerm) {
      query = query.ilike('product_id', `%${searchTerm}%`)
    }

    const { data, count, error } = await query

    if (error) throw new Error('Error fetching sales')

    return { 
      sales: data?.map(sale => ({
        ...sale,
        amount: sale.sale_price * sale.quantity_sold,
        date: sale.created_at, // Asumiendo que created_at es la fecha
        product_name: '', // Necesitas obtener el nombre del producto de alguna manera
      })) || [], 
      totalCount: count || 0, 
      page: pageParam 
    }
  }, [searchTerm])

  // Query para obtener ventas
  const { data, isLoading, isError } = useQuery<SalesData, Error>({
    queryKey: ['sales', page, searchTerm],
    queryFn: () => fetchSales({ pageParam: page }),
    placeholderData: (previousData) => previousData,
  })

  // Mutación para crear una venta
  const createSaleMutation = useMutation<unknown, PostgrestError, Partial<Sale>>({
    mutationFn: async (newSale: Partial<Sale>) => {
      const { data, error } = await supabase.from('sales').insert(newSale).single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      showToast('Venta creada con éxito', 'success')
    },
    onError: (error: PostgrestError) => {
      console.error('Error al crear la venta:', error)
      showToast('Error al crear la venta', 'error')
    },
  })

  // Mutación para eliminar una venta
  const deleteSaleMutation = useMutation<unknown, PostgrestError, string>({
    mutationFn: async (saleId: string) => {
      const { data, error } = await supabase.from('sales').delete().eq('id', saleId).single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      showToast('Venta eliminada con éxito', 'success')
    },
    onError: (error: PostgrestError) => {
      console.error('Error al eliminar la venta:', error)
      showToast('Error al eliminar la venta', 'error')
    },
  })

  // Manejadores de eventos
  const handleSubmit = useCallback((data: Partial<Sale>) => {
    createSaleMutation.mutate(data)
  }, [createSaleMutation])

  const handleDelete = useCallback((saleId: string) => {
    deleteSaleMutation.mutate(saleId)
  }, [deleteSaleMutation])

  const handleSearch = useMemo(() => debounce((term: string) => {
    setSearchTerm(term)
    setPage(1)
  }, 300), [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  // Memoización de componentes
  const memoizedSaleForm = useMemo(() => <SaleForm onSubmit={handleSubmit} />, [handleSubmit])
  const memoizedSaleList = useMemo(() => (
    <SaleList
      sales={data?.sales ?? []}
      onDelete={handleDelete}
      isLoading={isLoading}
      totalCount={data?.totalCount ?? 0}
      page={page}
      onPageChange={handlePageChange}
    />
  ), [data, handleDelete, isLoading, page, handlePageChange])

  if (isError) {
    return <div>Error al cargar las ventas. Por favor, intente de nuevo.</div>
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Ventas</h1>
        <input
          type="text"
          placeholder="Buscar por nombre de producto"
          onChange={(e) => handleSearch(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
        {memoizedSaleForm}
        {memoizedSaleList}
      </div>
    </AuthGuard>
  )
}

interface SalesData {
  sales: Sale[];
  totalCount: number;
  page: number;
}

interface SaleListProps {
  sales: Sale[];
  onDelete: (saleId: string) => void;
  isLoading: boolean;
  totalCount: number;
  page: number;
  onPageChange: (newPage: number) => void;
}