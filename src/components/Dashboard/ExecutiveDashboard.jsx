import React from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Shield
} from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import {
  formatCurrency,
  formatDate,
  getSeverityColor,
  getStatusColor,
  checkSLAStatus,
  calculateTTD,
  calculateTTR,
  formatDuration
} from '../../utils/helpers'
import StatsCards from './StatsCards'
import Charts from './Charts'
import TrendAnalysis from './TrendAnalysis'

export default function ExecutiveDashboard() {
  const { incidents, actions, legalItems, getStats } = useIncidents()
  const stats = getStats()

  // Get recent incidents (last 5)
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Get overdue actions
  const overdueActions = actions.filter(action => {
    if (action.status === 'completed') return false
    if (!action.dueDate) return false
    return new Date(action.dueDate) < new Date()
  })

  // Get pending legal items
  const pendingLegalItems = legalItems.filter(item => item.status !== 'completed')

  // Calculate FedRAMP SLA compliance metrics
  const incidentsWithSLA = incidents.map(incident => ({
    ...incident,
    slaStatus: checkSLAStatus(incident.detectionTime, incident.notificationTime, 60),
    ttd: calculateTTD(incident.incidentStartTime, incident.detectionTime),
    ttr: calculateTTR(incident.detectionTime, incident.resolutionTime)
  }))

  const slaMetrics = {
    total: incidentsWithSLA.filter(i => i.detectionTime && i.notificationTime).length,
    met: incidentsWithSLA.filter(i => i.slaStatus.status === 'met').length,
    breached: incidentsWithSLA.filter(i => i.slaStatus.status === 'breached').length,
    pending: incidentsWithSLA.filter(i => i.slaStatus.status === 'pending' && i.status !== 'closed').length
  }

  // Calculate average TTD and TTR
  const incidentsWithTTD = incidentsWithSLA.filter(i => i.ttd !== null)
  const incidentsWithTTR = incidentsWithSLA.filter(i => i.ttr !== null)

  const avgTTD = incidentsWithTTD.length > 0
    ? incidentsWithTTD.reduce((sum, i) => sum + i.ttd, 0) / incidentsWithTTD.length
    : null

  const avgTTR = incidentsWithTTR.length > 0
    ? incidentsWithTTR.reduce((sum, i) => sum + i.ttr, 0) / incidentsWithTTR.length
    : null

  const complianceRate = slaMetrics.total > 0
    ? Math.round((slaMetrics.met / slaMetrics.total) * 100)
    : 100

  return (
    <div className="p-6 space-y-6">
      {/* FedRAMP Compliance Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">FedRAMP SLA Compliance</h2>
              <p className="text-blue-100">1-Hour Notification Requirement</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{complianceRate}%</div>
            <p className="text-blue-100">Compliance Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm">SLA Met</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              {slaMetrics.met}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm">SLA Breached</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-300" />
              {slaMetrics.breached}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Pending Notification</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-300" />
              {slaMetrics.pending}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Avg. Time to Detect</p>
            <p className="text-2xl font-bold">
              {avgTTD !== null ? formatDuration(avgTTD) : '-'}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-blue-100 text-sm">Avg. Time to Resolve</p>
            <p className="text-2xl font-bold">
              {avgTTR !== null ? formatDuration(avgTTR) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts */}
      <Charts stats={stats} incidents={incidents} />

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Incidents with SLA Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Incidents</h3>
            <Link to="/incidents" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentIncidents.length === 0 ? (
            <p className="text-gray-500 text-sm">No incidents recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentIncidents.map(incident => {
                const slaStatus = checkSLAStatus(incident.detectionTime, incident.notificationTime, 60)
                return (
                  <Link
                    key={incident.id}
                    to={`/incidents/${incident.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{incident.title}</p>
                        <p className="text-sm text-gray-500">{formatDate(incident.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        {slaStatus.status === 'met' && (
                          <CheckCircle className="w-4 h-4 text-green-500" title="SLA Met" />
                        )}
                        {slaStatus.status === 'breached' && (
                          <XCircle className="w-4 h-4 text-red-500" title="SLA Breached" />
                        )}
                        {slaStatus.status === 'pending' && incident.status !== 'closed' && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" title="Awaiting Notification" />
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Overdue Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Overdue Actions
            </h3>
            <Link to="/actions" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {overdueActions.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">No overdue actions</span>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueActions.slice(0, 5).map(action => (
                <div key={action.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="font-medium text-gray-800">{action.title}</p>
                  <p className="text-sm text-red-600">
                    Due: {formatDate(action.dueDate)}
                  </p>
                  <p className="text-sm text-gray-500">{action.assignee}</p>
                </div>
              ))}
              {overdueActions.length > 5 && (
                <p className="text-sm text-gray-500">
                  +{overdueActions.length - 5} more overdue
                </p>
              )}
            </div>
          )}
        </div>

        {/* SLA Breaches */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              SLA Breaches
            </h3>
            <Link to="/incidents" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {slaMetrics.breached === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">No SLA breaches</span>
            </div>
          ) : (
            <div className="space-y-3">
              {incidentsWithSLA
                .filter(i => i.slaStatus.status === 'breached')
                .slice(0, 5)
                .map(incident => (
                  <Link
                    key={incident.id}
                    to={`/incidents/${incident.id}`}
                    className="block p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                  >
                    <p className="font-medium text-gray-800">{incident.title}</p>
                    <p className="text-sm text-red-600">
                      {incident.slaStatus.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Notified: {formatDuration(incident.slaStatus.timeToNotify)} after detection
                    </p>
                  </Link>
                ))}
              {slaMetrics.breached > 5 && (
                <p className="text-sm text-gray-500">
                  +{slaMetrics.breached - 5} more breaches
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
