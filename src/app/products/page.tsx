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
import { useCategoryStore } from '@/stores/categoryStore'
import { Product } from '@/types'
import { Modal } from '@/components/ui/Modal' // Modal importado

export default function ProductsPage() {
  const { showToast } = useToast()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false) // Estado del modal

  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore()

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
  } = useCategoryStore()

  // Efecto para cargar productos
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
    }
  }, [fetchProducts, products.length])

  // Efecto para cargar categorías
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
      setIsModalOpen(false) // Cerrar el modal después de guardar
    } catch (error) {
      showToast('Error al guardar el producto', 'error')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true) // Abrir modal para edición
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
  if (productsError || categoriesError)
    return <ErrorMessage message="Error al cargar los datos. Por favor, intente de nuevo más tarde." />

  return (
    <AuthGuard>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Productos</h1>
        <button
          className="mb-4 p-2 bg-blue-500 text-white rounded"
          onClick={() => {
            setEditingProduct(null) // Para un nuevo producto
            setIsModalOpen(true) // Abrir el modal
          }}
        >
          Crear Nuevo Producto
        </button>

        <ProductList
          products={products} // Ya obtenidos desde el store
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Modal para crear o editar productos */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)} // Cerrar el modal
          title={editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
        >
          <ProductForm
            product={editingProduct || undefined} // Pasar producto si está en edición
            categories={categories} // Categorías obtenidas del store
            onSubmit={handleSubmit} // Enviar datos
          />
        </Modal>

        {/* Confirmación de eliminación */}
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
