'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { SupplierForm } from '@/components/SupplierForm'
import { SupplierList } from '@/components/SupplierList'
import { Supplier } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Función para obtener proveedores
const fetchSuppliers = async () => {
  const { data, error } = await supabase.from('suppliers').select('*')
  if (error) throw new Error('Error fetching suppliers')
  return data || []
}

// Función para crear un proveedor
const createSupplier = async (supplier: Partial<Supplier>) => {
  const { error } = await supabase.from('suppliers').insert(supplier)
  if (error) throw new Error('Error creating supplier')
}

// Función para actualizar un proveedor
const updateSupplier = async (supplier: Supplier) => {
  const { error } = await supabase
    .from('suppliers')
    .update(supplier)
    .eq('id', supplier.id)
  if (error) throw new Error('Error updating supplier')
}

// Función para eliminar un proveedor
const deleteSupplier = async (supplierId: string) => {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', supplierId)
  if (error) throw new Error('Error deleting supplier')
}

export default function SuppliersPage() {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // Consultar proveedores
  const { data: suppliers, refetch } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
    onError: () => {
      showToast('Error fetching suppliers', 'error')
    },
  })

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers'])
      showToast('Supplier created successfully', 'success')
    },
    onError: () => {
      showToast('Error creating supplier', 'error')
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers'])
      setEditingSupplier(null)
      showToast('Supplier updated successfully', 'success')
    },
    onError: () => {
      showToast('Error updating supplier', 'error')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers'])
      showToast('Supplier deleted successfully', 'success')
    },
    onError: () => {
      showToast('Error deleting supplier', 'error')
    }
  })

  const handleSubmit = (data: Partial<Supplier>) => {
    if (editingSupplier) {
      updateMutation.mutate({ ...editingSupplier, ...data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
  }

  const handleDelete = (supplierId: string) => {
    deleteMutation.mutate(supplierId)
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Proveedores</h1>
        <SupplierForm
          supplier={editingSupplier || undefined}
          onSubmit={handleSubmit}
        />
        <SupplierList
          suppliers={suppliers || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}
