'use client'
import { AuthGuard } from '@/components/AuthGuard'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { FaBox, FaCubes, FaDollarSign, FaExclamationTriangle, FaChartLine, FaClipboardList } from 'react-icons/fa'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

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

  // Prepare sales data for chart
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
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <Card className="hover:shadow-xl transition-shadow duration-300 bg-white">
            <div className="flex items-center p-6">
              <FaBox className="text-4xl text-blue-500 mr-4" />
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Total Products</h2>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </Card>
          <Card className="hover:shadow-xl transition-shadow duration-300 bg-white">
            <div className="flex items-center p-6">
              <FaCubes className="text-4xl text-green-500 mr-4" />
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Total Materials</h2>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMaterials}</p>
              </div>
            </div>
          </Card>
          <Card className="hover:shadow-xl transition-shadow duration-300 bg-white">
            <div className="flex items-center p-6">
              <FaDollarSign className="text-4xl text-yellow-500 mr-4" />
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Total Sales</h2>
                <p className="text-3xl font-bold text-gray-900">${stats.totalSales.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          <Card className="hover:shadow-xl transition-shadow duration-300 bg-white">
            <div className="flex items-center p-6">
              <FaExclamationTriangle className="text-4xl text-red-500 mr-4" />
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Low Stock Items</h2>
                <p className="text-3xl font-bold text-gray-900">{stats.lowStockItems}</p>
              </div>
            </div>
          </Card>
          <Card className="hover:shadow-xl transition-shadow duration-300 bg-white">
            <div className="flex items-center p-6">
              <FaClipboardList className="text-4xl text-purple-500 mr-4" />
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Total Production</h2>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProduction}</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
          <Card className="bg-white p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sales Trend (Last 7 Days)</h2>
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
        
        <Card className="bg-white p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activities</h2>
          {/* Add a list or table of recent activities here */}
        </Card>
      </div>
    </AuthGuard>
  )
}