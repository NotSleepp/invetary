'use client'

import { useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { Card } from '@/components/ui/Card'
import { FaBox, FaCubes, FaDollarSign, FaExclamationTriangle, FaClipboardList } from 'react-icons/fa'
import { formatCurrency } from '@/utils/formatters'
import { useDashboardStore } from '@/stores/dashboardStore'
import { motion } from 'framer-motion'
import Spinner from '@/components/ui/Spinner'

export default function Dashboard() {
  const { data: stats, isLoading, error, fetchDashboardData } = useDashboardStore()

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500" role="alert">Error al cargar los datos del dashboard</div>
  }

  return (
    <AuthGuard>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <motion.h1 
          className="text-3xl sm:text-4xl font-extrabold text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Dashboard
        </motion.h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 hover:shadow-lg transition-shadow duration-300">
        <div className={`p-3 rounded-full text-${color}-500`}>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">{title}</h2>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </Card>
    </motion.div>
  )
}