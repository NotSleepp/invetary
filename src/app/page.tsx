'use client'
import { AuthGuard } from '@/components/AuthGuard'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { FaBox, FaCubes, FaDollarSign, FaExclamationTriangle, FaClipboardList } from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '@/utils/formatters'
import { useEffect } from 'react'
// Tipos
type DashboardData = {
  totalProducts: number
  totalMaterials: number
  totalSales: number
  lowStockItems: number
  totalProduction: number
}

// Función para obtener datos del dashboard
const fetchDashboardData = async (): Promise<DashboardData> => {
  const { data, error } = await supabase.rpc('get_dashboard_data')
  
  if (error) throw new Error('Error al obtener datos del dashboard')
  
  return {
    totalProducts: data.total_products,
    totalMaterials: data.total_materials,
    totalSales: data.total_sales,
    lowStockItems: data.low_stock_items,
    totalProduction: data.total_production
  }
}

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  useEffect(() => {
    // Elimina el atributo bis_skin_checked de todos los elementos div
    document.querySelectorAll('div').forEach(div => {
      div.removeAttribute('bis_skin_checked')
    })
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen" aria-live="polite">Cargando datos...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500" role="alert">Error al cargar los datos del dashboard</div>
  }

  return (
    <AuthGuard>
      <div className="space-y-8 p-6">
        <h1 className="text-4xl font-extrabold text-gray-800">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={FaBox} title="Total Productos" value={stats?.totalProducts ?? 0} color="blue" />
          <StatCard icon={FaCubes} title="Total Materiales" value={stats?.totalMaterials ?? 0} color="green" />
          <StatCard icon={FaDollarSign} title="Total Ventas" value={formatCurrency(stats?.totalSales ?? 0)} color="yellow" />
          <StatCard icon={FaExclamationTriangle} title="Productos con Bajo Stock" value={stats?.lowStockItems ?? 0} color="red" />
          <StatCard icon={FaClipboardList} title="Total Producción" value={stats?.totalProduction ?? 0} color="purple" />
        </div>
      </div>
    </AuthGuard>
  )
}

type StatCardProps = {
  icon: React.ElementType
  title: string
  value: number | string
  color: string
}

function StatCard({ icon: Icon, title, value, color }: StatCardProps) {
  return (
    <Card className="p-6 flex items-center space-x-4">
      <div className={`p-3 rounded-full text-${color}-500`}>
        <Icon className="w-8 h-8" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  )
}
