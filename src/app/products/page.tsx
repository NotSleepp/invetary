'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ProductForm } from '@/components/ProductForm'
import { ProductList } from '@/components/ProductList'
import { Button } from '@/components/ui/Button'
import { Product, Category } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      showToast('Error fetching products', 'error')
    } else {
      setProducts(data || [])
    }
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*')
    if (error) {
      showToast('Error fetching categories', 'error')
    } else {
      setCategories(data || [])
    }
  }

  const handleSubmit = async (data: Partial<Product>) => {
    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', editingProduct.id)
      if (error) throw error
      setEditingProduct(null)
    } else {
      const { error } = await supabase
        .from('products')
        .insert(data)
      if (error) throw error
    }
    fetchProducts()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleDelete = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    if (error) {
      showToast('Error deleting product', 'error')
    } else {
      fetchProducts()
    }
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <ProductForm
          product={editingProduct || undefined}
          categories={categories}
          onSubmit={handleSubmit}
        />
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}