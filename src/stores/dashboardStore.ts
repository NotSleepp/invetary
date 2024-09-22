// stores/dashboardStore.ts
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

type DashboardData = {
  totalProducts: number
  totalMaterials: number
  totalSales: number
  lowStockItems: number
  totalProduction: number
}

interface DashboardState {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  lastFetched: number | null
  fetchDashboardData: () => Promise<void>
}

const STALE_TIME = 5 * 60 * 1000 // 5 minutos

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchDashboardData: async () => {
    const state = get()
    const now = Date.now()

    // Si los datos existen y no están obsoletos, no hacemos una nueva llamada
    if (state.data && state.lastFetched && now - state.lastFetched < STALE_TIME) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.rpc('get_dashboard_data')
      
      if (error) throw new Error('Error al obtener datos del dashboard')
      
      set({ 
        data: {
          totalProducts: data.total_products,
          totalMaterials: data.total_materials,
          totalSales: data.total_sales,
          lowStockItems: data.low_stock_items,
          totalProduction: data.total_production
        },
        isLoading: false,
        lastFetched: now
      })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
}))