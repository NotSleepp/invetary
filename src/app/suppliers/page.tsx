'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { SupplierForm } from '@/components/SupplierForm'
import { SupplierList } from '@/components/SupplierList'
import { Supplier } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query'

// Definimos un tipo que incluye todas las propiedades que estamos usando
type SupplierWithEmailAndPhone = Supplier & {
  email?: string;
  phone?: string;
}

// Definimos nuestro tipo parcial basado en las propiedades que realmente estamos usando
type PartialSupplier = {
  id: string;
  name?: string;
}

// Constantes para las claves de consulta
const SUPPLIERS_QUERY_KEY = 'suppliers'

// Funciones de base de datos optimizadas
const fetchSuppliers = async (): Promise<PartialSupplier[]> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id, name')
    .order('name', { ascending: true })
  if (error) throw new Error('Error al obtener proveedores')
  return data as PartialSupplier[]
}

const createSupplier = async (supplier: Partial<PartialSupplier>): Promise<PartialSupplier> => {
  const { data, error } = await supabase.from('suppliers').insert(supplier).select()
  if (error) throw new Error('Error al crear proveedor')
  return data[0] as PartialSupplier
}

const updateSupplier = async (supplier: Partial<PartialSupplier>): Promise<PartialSupplier> => {
  const { data, error } = await supabase
    .from('suppliers')
    .update(supplier)
    .eq('id', supplier.id)
    .select()
  if (error) throw new Error('Error al actualizar proveedor')
  return data[0] as PartialSupplier
}

const deleteSupplier = async (supplierId: string) => {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', supplierId)
  if (error) throw new Error('Error al eliminar proveedor')
}

export default function SuppliersPage() {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  // Consulta de proveedores optimizada
  const { data: suppliers = [], isLoading, error }: UseQueryResult<PartialSupplier[], Error> = useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY],
    queryFn: fetchSuppliers,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Manejar el error fuera de useQuery
  useEffect(() => {
    if (error) {
      showToast('Error al obtener proveedores', 'error')
    }
  }, [error, showToast])

  // Mutaciones optimizadas
  const createMutation = useMutation<PartialSupplier, Error, Partial<PartialSupplier>>({
    mutationFn: createSupplier,
    onSuccess: (newSupplier) => {
      queryClient.setQueryData<PartialSupplier[]>([SUPPLIERS_QUERY_KEY], (old = []) => [
        ...old,
        {
          id: newSupplier.id,
          name: newSupplier.name,
        },
      ])
      showToast('Proveedor creado exitosamente', 'success')
    },
    onError: () => showToast('Error al crear proveedor', 'error'),
  })

  const updateMutation = useMutation<PartialSupplier, Error, Partial<PartialSupplier>>({
    mutationFn: updateSupplier,
    onSuccess: (updatedSupplier) => {
      queryClient.setQueryData<PartialSupplier[]>([SUPPLIERS_QUERY_KEY], (old = []) =>
        old.map((s) =>
          s.id === updatedSupplier.id
            ? {
              id: updatedSupplier.id,
              name: updatedSupplier.name,
            }
            : s
        )
      )
      setEditingSupplier(null)
      showToast('Proveedor actualizado exitosamente', 'success')
    },
    onError: () => showToast('Error al actualizar proveedor', 'error'),
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteSupplier,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Supplier[]>([SUPPLIERS_QUERY_KEY], (old = []) =>
        old.filter((s) => s.id !== deletedId)
      )
      showToast('Proveedor eliminado exitosamente', 'success')
    },
    onError: () => showToast('Error al eliminar proveedor', 'error'),
  })

  // Manejadores de eventos memoizados
  const handleSubmit = useCallback((data: Partial<SupplierWithEmailAndPhone>) => {
    if (editingSupplier) {
      updateMutation.mutate({ ...editingSupplier, ...data })
    } else {
      createMutation.mutate(data)
    }
  }, [editingSupplier, updateMutation, createMutation])

  const handleEdit = useCallback((supplier: PartialSupplier) => {
    setEditingSupplier(supplier as Supplier)
  }, [])

  const handleDelete = useCallback((supplierId: string) => {
    deleteMutation.mutate(supplierId)
  }, [deleteMutation])

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Proveedores</h1>
        <SupplierForm
          supplier={editingSupplier || undefined}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
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
            isDeleting={deleteMutation.isPending}
          />
        )}
      </div>
    </AuthGuard>
  )
}
