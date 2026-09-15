import React, { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function TrendAnalysis() {
  const { getTrendData, incidents } = useIncidents()
  const [timeRange, setTimeRange] = useState(30)
  const [chartType, setChartType] = useState('line')

  const trendData = getTrendData(timeRange)

  // Incident creation trend
  const creationData = {
    labels: trendData.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Created',
        data: trendData.map(d => d.created),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Resolved',
        data: trendData.map(d => d.resolved),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  // Severity distribution over time
  const severityData = {
    labels: trendData.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Critical',
        data: trendData.map(d => d.critical),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        stack: 'stack0'
      },
      {
        label: 'High',
        data: trendData.map(d => d.high),
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        stack: 'stack0'
      },
      {
        label: 'Medium',
        data: trendData.map(d => d.medium),
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
        stack: 'stack0'
      },
      {
        label: 'Low',
        data: trendData.map(d => d.low),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        stack: 'stack0'
      }
    ]
  }

  // Category breakdown
  const categoryCount = {}
  incidents.forEach(inc => {
    const cat = inc.category || 'Other'
    categoryCount[cat] = (categoryCount[cat] || 0) + 1
  })

  const categoryData = {
    labels: Object.keys(categoryCount),
    datasets: [{
      data: Object.values(categoryCount),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ]
    }]
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  // Calculate summary stats
  const totalCreated = trendData.reduce((sum, d) => sum + d.created, 0)
  const totalResolved = trendData.reduce((sum, d) => sum + d.resolved, 0)
  const avgDaily = (totalCreated / timeRange).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Trend Analysis
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                chartType === 'line' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                chartType === 'bar' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Created ({timeRange}d)</p>
          <p className="text-2xl font-bold text-blue-800">{totalCreated}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Resolved ({timeRange}d)</p>
          <p className="text-2xl font-bold text-green-800">{totalResolved}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Avg Daily</p>
          <p className="text-2xl font-bold text-purple-800">{avgDaily}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-600 font-medium">Net Change</p>
          <p className={`text-2xl font-bold ${totalCreated - totalResolved > 0 ? 'text-red-800' : 'text-green-800'}`}>
            {totalCreated - totalResolved > 0 ? '+' : ''}{totalCreated - totalResolved}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Creation/Resolution Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Incident Volume</h4>
          <div className="h-64">
            {chartType === 'line' ? (
              <Line data={creationData} options={lineOptions} />
            ) : (
              <Bar data={creationData} options={barOptions} />
            )}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Severity Distribution Over Time</h4>
          <div className="h-64">
            <Bar data={severityData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}
