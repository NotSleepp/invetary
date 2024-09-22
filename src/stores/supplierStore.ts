import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Supplier, PartialSupplier } from '@/types'

interface SupplierState {
  suppliers: PartialSupplier[]
  isLoading: boolean
  error: string | null
  fetchSuppliers: () => Promise<void>
  addSupplier: (supplier: Partial<PartialSupplier>) => Promise<void>
  updateSupplier: (id: string, supplier: Partial<PartialSupplier>) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  suppliers: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name', { ascending: true })
      if (error) throw error
      set({ suppliers: data as PartialSupplier[], isLoading: false })
    } catch (error) {
      set({ error: 'Error fetching suppliers', isLoading: false })
    }
  },

  addSupplier: async (supplier) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
      if (error) throw error
      set(state => ({ suppliers: [...state.suppliers, data[0] as PartialSupplier] }))
    } catch (error) {
      set({ error: 'Error adding supplier' })
    }
  },

  updateSupplier: async (id, supplier) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(supplier)
        .eq('id', id)
        .select()
      if (error) throw error
      set(state => ({
        suppliers: state.suppliers.map(s => s.id === id ? data[0] as PartialSupplier : s)
      }))
    } catch (error) {
      set({ error: 'Error updating supplier' })
    }
  },

  deleteSupplier: async (id) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)
      if (error) throw error
      set(state => ({
        suppliers: state.suppliers.filter(s => s.id !== id)
      }))
    } catch (error) {
      set({ error: 'Error deleting supplier' })
    }
  },
}))