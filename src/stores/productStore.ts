import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'

interface ProductState {
  products: Product[]
  isLoading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  addProduct: (data: Partial<Product>) => Promise<void>
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true })
        .range(0, 49) // Implementación básica de paginación
      if (error) throw error
      set({ products: data, isLoading: false })
    } catch (error) {
      set({ error: 'Error fetching products', isLoading: false })
    }
  },

  addProduct: async (data) => {
    try {
      const { error, data: insertedData } = await supabase
        .from('products')
        .insert(data)
        .select()
      if (error) throw error
      set(state => ({
        products: [...state.products, insertedData[0]]
      }))
    } catch (error) {
      set({ error: 'Error adding product' })
    }
  },

  updateProduct: async (id, data) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
      if (error) throw error
      set(state => ({
        products: state.products.map(product => product.id === id ? { ...product, ...data } : product)
      }))
    } catch (error) {
      set({ error: 'Error updating product' })
    }
  },

  deleteProduct: async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      if (error) throw error
      set(state => ({
        products: state.products.filter(product => product.id !== id)
      }))
    } catch (error) {
      set({ error: 'Error deleting product' })
    }
  }
}))
