import React from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

export default function Charts({ stats, incidents }) {
  // Severity breakdown chart
  const severityData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          stats.severityBreakdown.critical,
          stats.severityBreakdown.high,
          stats.severityBreakdown.medium,
          stats.severityBreakdown.low
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 1
      }
    ]
  }

  // Status breakdown chart
  const statusData = {
    labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
    datasets: [
      {
        label: 'Incidents by Status',
        data: [
          stats.statusBreakdown.open,
          stats.statusBreakdown.in_progress,
          stats.statusBreakdown.resolved,
          stats.statusBreakdown.closed
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ]
      }
    ]
  }

  // Incidents over time (last 30 days)
  const getIncidentsOverTime = () => {
    const days = 30
    const labels = []
    const data = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

      const count = incidents.filter(incident => {
        const incidentDate = new Date(incident.createdAt).toISOString().split('T')[0]
        return incidentDate === dateStr
      }).length

      data.push(count)
    }

    return { labels, data }
  }

  const timelineData = getIncidentsOverTime()

  const incidentsOverTimeData = {
    labels: timelineData.labels,
    datasets: [
      {
        label: 'New Incidents',
        data: timelineData.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  const hasData = stats.totalIncidents > 0

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Severity Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Incidents by Severity</h3>
        <div className="h-64">
          {hasData ? (
            <Doughnut data={severityData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data to display
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Incidents by Status</h3>
        <div className="h-64">
          {hasData ? (
            <Bar data={statusData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data to display
            </div>
          )}
        </div>
      </div>

      {/* Incidents Over Time */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Incidents Over Time (30 Days)</h3>
        <div className="h-64">
          <Line data={incidentsOverTimeData} options={lineChartOptions} />
        </div>
      </div>
    </div>
  )
}
