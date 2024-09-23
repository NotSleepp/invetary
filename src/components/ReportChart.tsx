// ReportChart.tsx
'use client'

import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ChartData {
  name: string
  value: number
}

interface ReportChartProps {
  data: ChartData[]
  title: string
  dataKey: string
}

export const ReportChart: React.FC<ReportChartProps> = ({ data, title, dataKey }) => {
  const chartData = {
    labels: data.map(d => d.name),
    datasets: [
      {
        label: title,
        data: data.map(d => d.value),
        borderColor: '#8884d8',
        backgroundColor: 'rgba(136, 132, 216, 0.2)',
        pointBackgroundColor: '#8884d8',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#8884d8',
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Name',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  }

  return (
    <div className="w-full h-64">
      <Line data={chartData} options={options} />
    </div>
  )
}
