'use client'
import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { ReportChart } from '@/components/ReportChart'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { RoleGuard } from '@/components/RoleGuard'

interface SalesData {
    name: string;
    value: number;
}

export default function ReportsPage() {
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [totalCost, setTotalCost] = useState(0)
    const [profit, setProfit] = useState(0)
    const [monthlySales, setMonthlySales] = useState<SalesData[]>([])
    const [topProducts, setTopProducts] = useState<SalesData[]>([])
    const { showToast } = useToast()

    useEffect(() => {
        fetchReportData()
    }, [])

    const fetchReportData = async () => {
        try {
            const { data: sales, error: salesError } = await supabase.from('sales').select('*')
            const { data: productionLogs, error: productionError } = await supabase.from('production_logs').select('*')

            if (salesError || productionError) throw new Error('Error al obtener datos')

            // Calcular ingresos totales, costos y beneficios
            const revenue = sales.reduce((sum, sale) => sum + sale.total_revenue, 0)
            const cost = productionLogs.reduce((sum, log) => sum + log.total_cost, 0)
            setTotalRevenue(revenue)
            setTotalCost(cost)
            setProfit(revenue - cost)

            // Calcular ventas mensuales
            const monthlyData = sales.reduce((acc, sale) => {
                const date = new Date(sale.created_at)
                const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                acc[month] = (acc[month] || 0) + sale.total_revenue
                return acc
            }, {} as Record<string, number>)

            setMonthlySales(
                Object.entries(monthlyData).map(([name, value]) => ({
                    name,
                    value: Number(value),
                }))
            )

            // Calcular productos más vendidos
            const productSales = sales.reduce((acc, sale) => {
                acc[sale.product_id] = (acc[sale.product_id] || 0) + sale.quantity_sold
                return acc
            }, {} as Record<string, number>)

            setTopProducts(
                Object.entries(productSales)
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .slice(0, 5)
                    .map(([name, value]) => ({
                        name,
                        value: Number(value),
                    }))
            )
        } catch (error) {
            showToast('Error al obtener datos de informes', 'error')
        }
    }

    return (
        <AuthGuard>
            <div className="space-y-8">
                <h1 className="text-4xl font-extrabold text-gray-800">Informes</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-2">Ingresos Totales</h2>
                        <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
                    </Card>
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-2">Costos Totales</h2>
                        <p className="text-3xl font-bold">${totalCost.toFixed(2)}</p>
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