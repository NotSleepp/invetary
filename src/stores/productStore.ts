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
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
      if (error) throw error
      set({ products: data || [] })
    } catch (error) {
      set({ error: 'Error fetching products' })
    } finally {
      set({ isLoading: false })
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
      // Excluimos el campo 'id' de los datos a actualizar
      const { id: _, ...updateData } = data;

      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }

      const updatedProduct = await response.json();
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? updatedProduct : product
        ),
      }));
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      throw error;
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
