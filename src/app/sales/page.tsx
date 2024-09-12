'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { SaleForm } from '@/components/SaleForm'
import { SaleList } from '@/components/SaleList'
import { Sale } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    const { data, error } = await supabase.from('sales').select('*')
    if (error) {
      showToast('Error fetching sales', 'error')
    } else {
      setSales(data || [])
    }
  }

  const handleSubmit = async (data: Partial<Sale>) => {
    const { error } = await supabase
      .from('sales')
      .insert(data)
    if (error) {
      showToast('Error creating sale record', 'error')
    } else {
      fetchSales()
    }
  }

  const handleDelete = async (saleId: string) => {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', saleId)
    if (error) {
      showToast('Error deleting sale record', 'error')
    } else {
      fetchSales()
    }
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Ventas</h1>
        <SaleForm onSubmit={handleSubmit} />
        <SaleList
          sales={sales}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}