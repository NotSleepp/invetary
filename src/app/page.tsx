'use client'
import { AuthGuard } from '@/components/AuthGuard'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { FaBox, FaCubes, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa'

async function fetchDashboardData() {
  const { data: products } = await supabase.from('products').select('*')
  const { data: materials } = await supabase.from('materials').select('*')
  const { data: sales } = await supabase.from('sales').select('*')

  const totalProducts = products?.length || 0
  const totalMaterials = materials?.length || 0
  const totalSales = sales?.reduce((acc, sale) => acc + sale.total_revenue, 0) || 0
  const lowStockItems = products?.filter(product => product.stock_quantity < 10).length || 0

  return { totalProducts, totalMaterials, totalSales, lowStockItems }
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalMaterials: 0,
    totalSales: 0,
    lowStockItems: 0
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
      <div className="p-6">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <FaBox className="text-3xl text-blue-500 mr-4" />
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Total Products</h2>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </Card>
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <FaCubes className="text-3xl text-green-500 mr-4" />
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Total Materials</h2>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMaterials}</p>
              </div>
            </div>
          </Card>
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <FaDollarSign className="text-3xl text-yellow-500 mr-4" />
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Total Sales</h2>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSales.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-3xl text-red-500 mr-4" />
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Low Stock Items</h2>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
