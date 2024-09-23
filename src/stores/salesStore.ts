import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Sale } from '@/types'
import debounce from 'lodash/debounce'

const SALES_PER_PAGE = 20

interface SalesState {
  sales: Sale[];
  totalCount: number;
  page: number;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
  createSale: (newSale: Partial<Sale>) => Promise<void>;
  deleteSale: (saleId: string) => Promise<void>;
  setPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  updateSale: (saleId: string, updatedSale: Partial<Sale>) => Promise<void>;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  totalCount: 0,
  page: 1,
  searchTerm: '',
  isLoading: false,
  error: null,

  fetchSales: async () => {
    const { page, searchTerm } = get()
    set({ isLoading: true, error: null })
    try {
      const from = (page - 1) * SALES_PER_PAGE
      const to = from + SALES_PER_PAGE - 1

      let query = supabase
        .from('sales')
        .select('id, created_at, sale_price, product_id, user_id, quantity_sold', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.ilike('product_id', `%${searchTerm}%`)
      }

      const { data, count, error } = await query

      if (error) throw error

      const salesWithAmount = data?.map(sale => ({
        ...sale,
        amount: sale.sale_price * sale.quantity_sold,
        date: sale.created_at,
        product_name: '', // You might want to fetch product names separately
      })) || []

      set({ sales: salesWithAmount, totalCount: count || 0, isLoading: false })
    } catch (error) {
      set({ error: 'Error fetching sales', isLoading: false })
    }
  },

  createSale: async (newSale: Partial<Sale>) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('sales').insert(newSale).single()
      if (error) throw error
      await get().fetchSales()
    } catch (error) {
      set({ error: 'Error creating sale', isLoading: false })
    }
  },

  deleteSale: async (saleId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('sales').delete().eq('id', saleId)
      if (error) throw error
      await get().fetchSales()
    } catch (error) {
      set({ error: 'Error deleting sale', isLoading: false })
    }
  },

  setPage: (page: number) => {
    set({ page })
    get().fetchSales()
  },

  setSearchTerm: debounce((term: string) => {
    set({ searchTerm: term, page: 1 })
    get().fetchSales()
  }, 300),

  updateSale: async (saleId: string, updatedSale: Partial<Sale>) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('sales')
        .update(updatedSale)
        .eq('id', saleId)
      
      if (error) throw error
      
      await get().fetchSales()
    } catch (error) {
      set({ error: 'Error actualizando la venta', isLoading: false })
    }
  },
}))