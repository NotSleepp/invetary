'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { SupplierForm } from '@/components/SupplierForm'
import { SupplierList } from '@/components/SupplierList'
import { Supplier, PartialSupplier } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import { useSupplierStore } from '@/stores/supplierStore'

type SupplierWithEmailAndPhone = Supplier & {
  email?: string;
  phone?: string;
}

export default function SuppliersPage() {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
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

  useEffect(() => {
    if (error) {
      showToast('Error al obtener proveedores', 'error')
    }
  }, [error, showToast])

  const handleSubmit = useCallback(async (data: Partial<SupplierWithEmailAndPhone>) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data)
        showToast('Proveedor actualizado exitosamente', 'success')
      } else {
        await addSupplier(data)
        showToast('Proveedor creado exitosamente', 'success')
      }
      setEditingSupplier(null)
    } catch (error) {
      showToast('Error al guardar el proveedor', 'error')
    }
  }, [editingSupplier, updateSupplier, addSupplier, showToast])

  const handleEdit = useCallback((supplier: PartialSupplier) => {
    setEditingSupplier(supplier as Supplier)
  }, [])

  const handleDelete = useCallback(async (supplierId: string) => {
    try {
      await deleteSupplier(supplierId)
      showToast('Proveedor eliminado exitosamente', 'success')
    } catch (error) {
      showToast('Error al eliminar proveedor', 'error')
    }
  }, [deleteSupplier, showToast])

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Proveedores</h1>
        <SupplierForm
          supplier={editingSupplier || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
        {isLoading ? (
          <p>Cargando proveedores...</p>
        ) : error ? (
          <p>Error al cargar proveedores</p>
        ) : (
          <SupplierList
            suppliers={suppliers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={false}
          />
        )}
      </div>
    </AuthGuard>
  )
}