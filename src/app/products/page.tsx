'use client'

import React, { useState, useMemo } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ProductForm } from '@/components/ProductForm'
import { ProductList } from '@/components/ProductList'
import { Product, Category } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// Función para obtener productos
const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })
    .range(0, 49) // Implementación básica de paginación
  if (error) throw new Error('Error al obtener productos')
  return data
}

// Función para obtener categorías
const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) throw new Error('Error al obtener categorías')
  return data
}

export default function ProductsPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  // Query para obtener los productos
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,  // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Cache presente durante 10 minutos
  })

  // Query para obtener las categorías
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,  // Cache válido por 5 minutos
    gcTime: 1000 * 60 * 10, // Cache presente durante 10 minutos
  })

  // Mutación para agregar o actualizar un producto
  const saveProductMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert(data)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setEditingProduct(null)
      showToast(editingProduct ? 'Producto actualizado con éxito' : 'Producto añadido con éxito', 'success')
    },
    onError: () => {
      showToast('Error al guardar el producto', 'error')
    }
  })

  // Mutación para eliminar un producto
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      showToast('Producto eliminado con éxito', 'success')
      setDeletingProductId(null)
    },
    onError: () => {
      showToast('Error al eliminar el producto', 'error')
    }
  })

  const handleSubmit = (data: Partial<Product>) => {
    saveProductMutation.mutate(data)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleDelete = (productId: string) => {
    setDeletingProductId(productId)
  }

  const confirmDelete = () => {
    if (deletingProductId) {
      deleteProductMutation.mutate(deletingProductId)
    }
  }

  const cancelDelete = () => {
    setDeletingProductId(null)
  }

  const memoizedProducts = useMemo(() => products || [], [products])
  const memoizedCategories = useMemo(() => categories || [], [categories])

  // Manejo de carga y errores
  if (productsLoading || categoriesLoading) return <Spinner />
  if (productsError || categoriesError) return <ErrorMessage message="Error al cargar los datos. Por favor, intente de nuevo más tarde." />

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Productos</h1>
        <ProductForm
          product={editingProduct || undefined}
          categories={memoizedCategories}
          onSubmit={handleSubmit}
        />
        <ProductList
          products={memoizedProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <ConfirmDialog
          isOpen={!!deletingProductId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          title="Confirmar eliminación"
          message="¿Está seguro de que desea eliminar este producto?"
        />
      </div>
    </AuthGuard>
  )
}
