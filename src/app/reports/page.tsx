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

            if (salesError || productionError) throw new Error('Error fetching data')

            // Calculate total revenue, cost, and profit
            const revenue = sales.reduce((sum, sale) => sum + sale.total_revenue, 0)
            const cost = productionLogs.reduce((sum, log) => sum + log.total_cost, 0)
            setTotalRevenue(revenue)
            setTotalCost(cost)
            setProfit(revenue - cost)

            // Calculate monthly sales
            const monthlyData = sales.reduce((acc, sale) => {
                const date = new Date(sale.created_at)
                const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                acc[month] = (acc[month] || 0) + sale.total_revenue
                return acc
            }, {} as Record<string, number>)

            setMonthlySales(
                Object.entries(monthlyData).map(([name, value]) => ({
                    name,
                    value: Number(value), // <-- Aseguramos que el valor es un número
                }))
            )

            // Calculate top products
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
                        value: Number(value), // <-- Aseguramos que el valor es un número
                    }))
            )
        } catch (error) {
            showToast('Error fetching report data', 'error')
        }
    }

    return (
       // <RoleGuard allowedRoles={['admin']}>
            <AuthGuard>
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-6">Reports</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card title="Total Revenue">
                            {`$${totalRevenue.toFixed(2)}`}
                        </Card>
                        <Card title="Total Cost">
                            {`$${totalCost.toFixed(2)}`}
                        </Card>
                        <Card title="Profit">
                            {`$${profit.toFixed(2)}`}
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ReportChart data={monthlySales} title="Monthly Sales" dataKey="value" />
                        <ReportChart data={topProducts} title="Top Products" dataKey="value" />
                    </div>
                </div>
            </AuthGuard>
       // </RoleGuard>

    )
}
