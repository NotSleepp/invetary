'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { SupplierForm } from '@/components/SupplierForm'
import { SupplierList } from '@/components/SupplierList'
import { Supplier } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    const { data, error } = await supabase.from('suppliers').select('*')
    if (error) {
      showToast('Error fetching suppliers', 'error')
    } else {
      setSuppliers(data || [])
    }
  }

  const handleSubmit = async (data: Partial<Supplier>) => {
    if (editingSupplier) {
      const { error } = await supabase
        .from('suppliers')
        .update(data)
        .eq('id', editingSupplier.id)
      if (error) throw error
      setEditingSupplier(null)
    } else {
      const { error } = await supabase
        .from('suppliers')
        .insert(data)
      if (error) throw error
    }
    fetchSuppliers()
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
  }

  const handleDelete = async (supplierId: string) => {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId)
    if (error) {
      showToast('Error deleting supplier', 'error')
    } else {
      fetchSuppliers()
    }
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Suppliers</h1>
        <SupplierForm
          supplier={editingSupplier || undefined}
          onSubmit={handleSubmit}
        />
        <SupplierList
          suppliers={suppliers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}