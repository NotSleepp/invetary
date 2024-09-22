import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { FinancialRecord } from '@/types'

interface FinancialRecordState {
  financialRecords: FinancialRecord[]
  isLoading: boolean
  error: string | null
  fetchFinancialRecords: () => Promise<void>
  addFinancialRecord: (record: Partial<FinancialRecord>) => Promise<void>
  updateFinancialRecord: (id: string, record: Partial<FinancialRecord>) => Promise<void>
  deleteFinancialRecord: (id: string) => Promise<void>
}

export const useFinancialRecordStore = create<FinancialRecordState>((set, get) => ({
  financialRecords: [],
  isLoading: false,
  error: null,

  fetchFinancialRecords: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, 49)
      if (error) throw error
      set({ financialRecords: data, isLoading: false })
    } catch (error) {
      set({ error: 'Error fetching financial records', isLoading: false })
    }
  },

  addFinancialRecord: async (record) => {
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .insert(record)
        .select()
      if (error) throw error
      set(state => ({
        financialRecords: [...state.financialRecords, data[0]]
      }))
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message })
      } else {
        set({ error: 'An unexpected error occurred while adding the financial record' })
      }
    }
  },

  updateFinancialRecord: async (id, record) => {
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .update(record)
        .eq('id', id)
        .select()
      if (error) throw error
      set(state => ({
        financialRecords: state.financialRecords.map(r => r.id === id ? data[0] : r)
      }))
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message })
      } else {
        set({ error: 'An unexpected error occurred while updating the financial record' })
      }
    }
  },

  deleteFinancialRecord: async (id) => {
    try {
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', id)
      if (error) throw error
      set(state => ({
        financialRecords: state.financialRecords.filter(r => r.id !== id)
      }))
    } catch (error) {
      set({ error: 'Error deleting financial record' })
    }
  },
}))
