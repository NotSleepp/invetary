'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ProductForm } from '@/components/ProductForm'
import { useToast } from '@/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useProductStore } from '@/stores/productStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { Product } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { ProductList } from '@/components/ProductList'

export default function ProductsPage() {
  const { showToast } = useToast()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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

  // Wrap the fetchProducts and fetchCategories in useCallback
  const loadInitialData = useCallback(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const handleSubmit = async (data: Partial<Product>) => {
    try {
      if (editingProduct) {
        const { id, ...updateData } = data;
        await updateProduct(editingProduct.id, updateData);
        showToast('Producto actualizado con éxito', 'success');
      } else {
        await addProduct(data);
        showToast('Producto añadido con éxito', 'success');
      }
      setEditingProduct(null);
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      showToast('Error al guardar el producto', 'error');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (productId: string) => {
    setDeletingProductId(productId);
  };

  const confirmDelete = async () => {
    if (deletingProductId) {
      try {
        await deleteProduct(deletingProductId);
        showToast('Producto eliminado con éxito', 'success');
        setDeletingProductId(null);
        fetchProducts();
      } catch {
        showToast('Error al eliminar el producto', 'error');
      }
    }
  };

  const cancelDelete = () => {
    setDeletingProductId(null);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (productsError || categoriesError) {
    return <ErrorMessage message="Error al cargar los datos. Por favor, intente de nuevo más tarde." />
  }

  return (
    <AuthGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-80 mb-4 md:mb-0">
            <Input
              type="text"
              placeholder="Buscar productos..."
              label="Búsqueda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ease-in-out"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null)
              setIsModalOpen(true)
            }}
            className="w-full md:w-auto bg-gradient-to-r from-[#1e2837] to-[#101826] hover:from-[#080d14] hover:to-[#1e2837] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Crear Nuevo Producto
          </Button>
        </div>

        <ProductList
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
        >
          <ProductForm
            product={editingProduct || undefined}
            categories={categories}
            onSubmit={handleSubmit}
          />
        </Modal>

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
