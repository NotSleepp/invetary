'use client'
import { AuthGuard } from '@/components/AuthGuard'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { FaBox, FaCubes, FaDollarSign, FaExclamationTriangle, FaClipboardList } from 'react-icons/fa'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

async function fetchDashboardData() {
  const { data: products } = await supabase.from('products').select('*')
  const { data: materials } = await supabase.from('materials').select('*')
  const { data: sales } = await supabase.from('sales').select('*')
  const { data: productionLogs } = await supabase.from('production_logs').select('*')

  const totalProducts = products?.length || 0
  const totalMaterials = materials?.length || 0
  const totalSales = sales?.reduce((acc, sale) => acc + sale.total_revenue, 0) || 0
  const lowStockItems = products?.filter(product => product.stock_quantity < 10).length || 0
  const totalProduction = productionLogs?.reduce((acc, log) => acc + log.quantity_produced, 0) || 0

  const salesData = sales?.reduce((acc, sale) => {
    const date = new Date(sale.created_at).toLocaleDateString()
    acc[date] = (acc[date] || 0) + sale.total_revenue
    return acc
  }, {})

  const chartData = Object.keys(salesData || {}).map(date => ({
    date,
    sales: salesData[date]
  })).slice(-7) // Last 7 days

  return { totalProducts, totalMaterials, totalSales, lowStockItems, totalProduction, chartData }
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalMaterials: 0,
    totalSales: 0,
    lowStockItems: 0,
    totalProduction: 0,
    chartData: []
  })

  useEffect(() => {
    async function loadData() {
      const data = await fetchDashboardData()
      setStats(data)
    }
    loadData()
  }, [])

  return (
    <AuthGuard>
      <div className="space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={FaBox} title="Total Productos" value={stats.totalProducts} color="blue" />
          <StatCard icon={FaCubes} title="Total Materiales" value={stats.totalMaterials} color="green" />
          <StatCard icon={FaDollarSign} title="Total Ventas" value={`$${stats.totalSales.toFixed(2)}`} color="yellow" />
          <StatCard icon={FaExclamationTriangle} title="Productos con Bajo Stock" value={stats.lowStockItems} color="red" />
          <StatCard icon={FaClipboardList} title="Total Producción" value={stats.totalProduction} color="purple" />
        </div>
        
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tendencia de Ventas (Últimos 7 Días)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </AuthGuard>
  )
}

function StatCard({ icon: Icon, title, value, color }) {
  return (
    <Card className="p-6 flex items-center space-x-4">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-500`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  )
}