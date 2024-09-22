// stores/reportStore.ts
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface SalesData {
  name: string;
  value: number;
}

interface ReportData {
  revenue: number;
  cost: number;
  profit: number;
  monthlySales: SalesData[];
  topProducts: SalesData[];
}

interface ReportState extends ReportData {
  isLoading: boolean;
  error: string | null;
  fetchReportData: () => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  revenue: 0,
  cost: 0,
  profit: 0,
  monthlySales: [],
  topProducts: [],
  isLoading: false,
  error: null,

  fetchReportData: async () => {
    set({ isLoading: true, error: null })
    try {
      const [{ data: sales, error: salesError }, { data: productionLogs, error: productionError }] = await Promise.all([
        supabase
          .from('sales')
          .select('total_revenue, created_at, product_id, quantity_sold')
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('production_logs')
          .select('total_cost')
          .limit(1000)
      ])

      if (salesError || productionError) throw new Error('Error al obtener datos')

      const revenue = sales.reduce((sum, sale) => sum + sale.total_revenue, 0)
      const cost = productionLogs.reduce((sum, log) => sum + log.total_cost, 0)
      const profit = revenue - cost

      const { monthlyData, productSales } = sales.reduce((acc, sale) => {
        const date = new Date(sale.created_at)
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        acc.monthlyData[month] = (acc.monthlyData[month] || 0) + sale.total_revenue
        acc.productSales[sale.product_id] = (acc.productSales[sale.product_id] || 0) + sale.quantity_sold
        return acc
      }, { monthlyData: {}, productSales: {} } as { monthlyData: Record<string, number>, productSales: Record<string, number> })

      const monthlySales = Object.entries(monthlyData)
        .map(([name, value]) => ({ name, value: Number(value) }))
        .slice(-12)

      const topProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name: `Producto ${name}`, value }))

      set({ revenue, cost, profit, monthlySales, topProducts, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
}))