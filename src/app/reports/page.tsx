'use client'
import React, { useMemo, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ReportChart } from '@/components/ReportChart'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useQuery } from '@tanstack/react-query'

interface SalesData {
  name: string;
  value: number;
}

// Función para obtener los datos de las ventas y logs de producción
const fetchReportData = async () => {
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

  // Calcular ingresos totales, costos y beneficios
  const revenue = sales.reduce((sum, sale) => sum + sale.total_revenue, 0)
  const cost = productionLogs.reduce((sum, log) => sum + log.total_cost, 0)
  const profit = revenue - cost

  // Calcular ventas mensuales y productos más vendidos
  const { monthlyData, productSales } = sales.reduce((acc, sale) => {
    const date = new Date(sale.created_at)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    acc.monthlyData[month] = (acc.monthlyData[month] || 0) + sale.total_revenue
    acc.productSales[sale.product_id] = (acc.productSales[sale.product_id] || 0) + sale.quantity_sold
    return acc
  }, { monthlyData: {}, productSales: {} } as { monthlyData: Record<string, number>, productSales: Record<string, number> })

  const monthlySales = Object.entries(monthlyData).map(([name, value]) => ({ name, value: Number(value) }))

  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }))

  return { revenue, cost, profit, monthlySales, topProducts }
}

export default function ReportsPage() {
  const { showToast } = useToast()

  // Utilizar useQuery para obtener los datos de los informes
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reportData'],
    queryFn: fetchReportData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  })

  useEffect(() => {
    if (isError) {
      showToast('Error al obtener datos de informes', 'error')
      console.error('Error en la consulta:', error)
    }
  }, [isError, error, showToast])

  // Memoización para cálculos costosos
  const memoizedData = useMemo(() => {
    if (!data) return null
    return {
      ...data,
      monthlySales: data.monthlySales.slice(-12), // Mostrar solo los últimos 12 meses
      topProducts: data.topProducts.map(product => ({
        ...product,
        name: `Producto ${product.name}` // Añadir un prefijo para claridad
      }))
    }
  }, [data])

  if (isLoading) return <p>Cargando informes...</p>
  if (isError) return <p>Error al cargar los datos de los informes.</p>
  if (!memoizedData) return null

  const { revenue, cost, profit, monthlySales, topProducts } = memoizedData

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
