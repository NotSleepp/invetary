'use client'
import React, { useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ReportChart } from '@/components/ReportChart'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import { useReportStore } from '@/stores/reportStore'

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

  if (isLoading) return <p>Cargando informes...</p>
  if (error) return <p>Error al cargar los datos de los informes.</p>

  return (
    <AuthGuard>
      <div className="space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Informes</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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