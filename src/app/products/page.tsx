'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ProductForm } from '@/components/ProductForm'
import { ProductList } from '@/components/ProductList'
import { Product, Category } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Spinner from '@/components/ui/Spinner'

// Función para obtener productos
const fetchProducts = async () => {
  const { data, error } = await supabase.from('products').select('*')
  if (error) throw new Error('Error fetching products')
  return data
}

// Función para obtener categorías
const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) throw new Error('Error fetching categories')
  return data
}

export default function ProductsPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Query para obtener los productos
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,  // Cache válido por 5 minutos
    cacheTime: 1000 * 60 * 10, // Cache presente durante 10 minutos
  })

  // Query para obtener las categorías
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,  // Cache válido por 5 minutos
    cacheTime: 1000 * 60 * 10, // Cache presente durante 10 minutos
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
      queryClient.invalidateQueries({ queryKey: ['products'] }) // Refrescar productos
      setEditingProduct(null)
      showToast('Product saved successfully', 'success')
    },
    onError: () => {
      showToast('Error saving product', 'error')
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
      queryClient.invalidateQueries({ queryKey: ['products'] }) // Refrescar productos
      showToast('Product deleted successfully', 'success')
    },
    onError: () => {
      showToast('Error deleting product', 'error')
    }
  })

  const handleSubmit = (data: Partial<Product>) => {
    saveProductMutation.mutate(data)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleDelete = (productId: string) => {
    deleteProductMutation.mutate(productId)
  }

  // Manejo de carga y errores
  if (productsLoading || categoriesLoading) return <Spinner />
  if (productsError) showToast('Error fetching products', 'error')
  if (categoriesError) showToast('Error fetching categories', 'error')

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Productos</h1>
        <ProductForm
          product={editingProduct || undefined}
          categories={categories || []}
          onSubmit={handleSubmit}
        />
        <ProductList
          products={products || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}
