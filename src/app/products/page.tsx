'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ProductForm } from '@/components/ProductForm'
import { ProductList } from '@/components/ProductList'
import { useToast } from '@/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useProductStore } from '@/stores/productStore'
import { useCategoryStore } from '@/stores/categoryStore' // Store ya existente
import { Product } from '@/types'; // Ajusta la ruta según sea necesario

export default function ProductsPage() {
  const { showToast } = useToast()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  } = useProductStore()

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    fetchCategories
  } = useCategoryStore()

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
    }
  }, [fetchProducts, products.length])

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [fetchCategories, categories.length])

  const handleSubmit = async (data: Partial<Product>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data)
        showToast('Producto actualizado con éxito', 'success')
      } else {
        await addProduct(data)
        showToast('Producto añadido con éxito', 'success')
      }
      setEditingProduct(null)
    } catch (error) {
      showToast('Error al guardar el producto', 'error')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleDelete = (productId: string) => {
    setDeletingProductId(productId)
  }

  const confirmDelete = async () => {
    if (deletingProductId) {
      try {
        await deleteProduct(deletingProductId)
        showToast('Producto eliminado con éxito', 'success')
        setDeletingProductId(null)
      } catch {
        showToast('Error al eliminar el producto', 'error')
      }
    }
  }

  const cancelDelete = () => {
    setDeletingProductId(null)
  }

  // Manejo de carga y errores
  if (productsLoading || categoriesLoading) return <Spinner />
  if (productsError || categoriesError) return <ErrorMessage message="Error al cargar los datos. Por favor, intente de nuevo más tarde." />

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Productos</h1>
        <ProductForm
          product={editingProduct || undefined}
          categories={categories} // Ya obtenidas desde el store
          onSubmit={handleSubmit}
        />
        <ProductList
          products={products} // Ya obtenidos desde el store
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
