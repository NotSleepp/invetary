import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { ProductionLog } from '@/types'

interface ProductionState {
  productionLogs: ProductionLog[]
  isLoading: boolean
  error: string | null
  fetchProductionLogs: () => Promise<void>
  addProductionLog: (data: Partial<ProductionLog>) => Promise<void>
  updateProductionLog: (id: string, data: Partial<ProductionLog>) => Promise<void>
  deleteProductionLog: (id: string) => Promise<void>
}

export const useProductionStore = create<ProductionState>((set, get) => ({
  productionLogs: [],
  isLoading: false,
  error: null,

  fetchProductionLogs: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('production_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, 49)
      if (error) throw error
      set({ productionLogs: data, isLoading: false })
    } catch (error) {
      set({ error: 'Error fetching production logs', isLoading: false })
    }
  },

  addProductionLog: async (data) => {
    try {
      const { error, data: insertedData } = await supabase
        .from('production_logs')
        .insert(data)
        .select()
      if (error) throw error
      set(state => ({
        productionLogs: [...state.productionLogs, insertedData[0]]
      }))
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message })
      } else {
        set({ error: 'Unexpected error while adding the production log' })
      }
    }
  },

  updateProductionLog: async (id, data) => {
    try {
      const { error, data: updatedData } = await supabase
        .from('production_logs')
        .update(data)
        .eq('id', id)
        .select()
      if (error) throw error
      set(state => ({
        productionLogs: state.productionLogs.map(log => 
          log.id === id ? { ...log, ...updatedData[0] } : log
        )
      }))
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message })
      } else {
        set({ error: 'Error inesperado al actualizar el registro de producción' })
      }
    }
  },

  deleteProductionLog: async (id) => {
    try {
      const { error } = await supabase
        .from('production_logs')
        .delete()
        .eq('id', id)
      if (error) throw error
      set(state => ({
        productionLogs: state.productionLogs.filter(log => log.id !== id)
      }))
    } catch (error) {
      set({ error: 'Error deleting production log' })
    }
  }
}))
