'use client'
import React, { useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ReportChart } from '@/components/ReportChart'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import { useReportStore } from '@/stores/reportStore'
import Spinner from '@/components/ui/Spinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { Button } from '@/components/ui/Button'
import { RefreshCcw } from 'lucide-react'

export default function ReportsPage() {
  const { showToast } = useToast()
  const { 
    revenue, 
    cost, 
    profit, 
    monthlySales, 
    topProducts, 
    isLoading, 
    error, 
    fetchReportData 
  } = useReportStore()

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  useEffect(() => {
    if (error) {
      showToast('Error al obtener datos de informes', 'error')
      console.error('Error en la consulta:', error)
    }
  }, [error, showToast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message="Error al cargar los datos de los informes. Por favor, intente de nuevo más tarde." />
  }

  return (
    <AuthGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800">Informes</h1>
          <Button
            onClick={fetchReportData}
            className="bg-gradient-to-r from-[#1e2837] to-[#101826] hover:from-[#080d14] hover:to-[#1e2837] text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <RefreshCcw className="mr-2 h-5 w-5" />
            Actualizar Datos
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Ingresos Totales</h2>
            <p className="text-3xl font-bold">${revenue.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Costos Totales</h2>
            <p className="text-3xl font-bold">${cost.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Beneficios</h2>
            <p className="text-3xl font-bold">${profit.toFixed(2)}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Ventas Mensuales</h2>
            <ReportChart data={monthlySales} title="Ventas Mensuales" dataKey="value" />
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Productos Más Vendidos</h2>
            <ReportChart data={topProducts} title="Productos Más Vendidos" dataKey="value" />
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}