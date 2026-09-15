import React from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckSquare,
  DollarSign,
  Scale,
  TrendingUp
} from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Total Incidents',
      value: stats.totalIncidents,
      icon: AlertCircle,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Open Incidents',
      value: stats.openIncidents,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Critical Incidents',
      value: stats.criticalIncidents,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Pending Actions',
      value: stats.pendingActions,
      icon: CheckSquare,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Costs',
      value: formatCurrency(stats.totalCosts),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Legal',
      value: stats.pendingLegal,
      icon: Scale,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map(({ title, value, icon: Icon, color, bgColor }) => (
        <div key={title} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{title}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${bgColor}`}>
              <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
