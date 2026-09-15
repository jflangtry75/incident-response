import React, { useState } from 'react'
import {
  FileText,
  Download,
  Filter,
  Calendar,
  CheckSquare,
  X,
  FileJson,
  Printer
} from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { exportToPDF, exportToWord, exportToJSON } from '../../utils/exportReport'
import { formatDate, formatDateTime, formatCurrency } from '../../utils/helpers'
import { incidentCategories } from '../../data/playbooks'

export default function ReportBuilder({ onClose }) {
  const { incidents, actions, costs, legalItems, getActionsForIncident, getCostsForIncident, getLegalItemsForIncident } = useIncidents()

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    severities: ['critical', 'high', 'medium', 'low'],
    statuses: ['open', 'in_progress', 'resolved', 'closed'],
    categories: [],
    verdicts: []
  })

  const [includeFields, setIncludeFields] = useState({
    basicInfo: true,
    timeline: true,
    investigation: true,
    actions: true,
    costs: true,
    legal: true,
    mitre: true
  })

  const [reportTitle, setReportTitle] = useState('Incident Response Report')

  // Filter incidents
  const filteredIncidents = incidents.filter(inc => {
    if (filters.dateFrom && new Date(inc.createdAt) < new Date(filters.dateFrom)) return false
    if (filters.dateTo && new Date(inc.createdAt) > new Date(filters.dateTo)) return false
    if (!filters.severities.includes(inc.severity)) return false
    if (!filters.statuses.includes(inc.status)) return false
    if (filters.categories.length > 0 && !filters.categories.includes(inc.category)) return false
    if (filters.verdicts.length > 0 && !filters.verdicts.includes(inc.verdict)) return false
    return true
  })

  const handleSeverityToggle = (severity) => {
    setFilters(prev => ({
      ...prev,
      severities: prev.severities.includes(severity)
        ? prev.severities.filter(s => s !== severity)
        : [...prev.severities, severity]
    }))
  }

  const handleStatusToggle = (status) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }))
  }

  const handleCategoryToggle = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const handleExportPDF = () => {
    // Export each filtered incident
    filteredIncidents.forEach(incident => {
      const incActions = getActionsForIncident(incident.id)
      const incCosts = getCostsForIncident(incident.id)
      const incLegal = getLegalItemsForIncident(incident.id)
      exportToPDF(incident, incActions, incCosts, incLegal)
    })
  }

  const handleExportJSON = () => {
    const reportData = {
      title: reportTitle,
      generatedAt: new Date().toISOString(),
      filters: filters,
      summary: {
        totalIncidents: filteredIncidents.length,
        bySeverity: {
          critical: filteredIncidents.filter(i => i.severity === 'critical').length,
          high: filteredIncidents.filter(i => i.severity === 'high').length,
          medium: filteredIncidents.filter(i => i.severity === 'medium').length,
          low: filteredIncidents.filter(i => i.severity === 'low').length
        },
        byStatus: {
          open: filteredIncidents.filter(i => i.status === 'open').length,
          in_progress: filteredIncidents.filter(i => i.status === 'in_progress').length,
          resolved: filteredIncidents.filter(i => i.status === 'resolved').length,
          closed: filteredIncidents.filter(i => i.status === 'closed').length
        },
        totalCost: filteredIncidents.reduce((sum, inc) => {
          return sum + getCostsForIncident(inc.id).reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
        }, 0)
      },
      incidents: filteredIncidents.map(inc => ({
        ...inc,
        actions: includeFields.actions ? getActionsForIncident(inc.id) : undefined,
        costs: includeFields.costs ? getCostsForIncident(inc.id) : undefined,
        legalItems: includeFields.legal ? getLegalItemsForIncident(inc.id) : undefined
      }))
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  // Summary stats
  const totalCost = filteredIncidents.reduce((sum, inc) => {
    return sum + getCostsForIncident(inc.id).reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
  }, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Custom Report Builder
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Report Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </label>

            {/* Severity */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Severity</p>
              <div className="flex flex-wrap gap-2">
                {['critical', 'high', 'medium', 'low'].map(severity => (
                  <button
                    key={severity}
                    onClick={() => handleSeverityToggle(severity)}
                    className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                      filters.severities.includes(severity)
                        ? severity === 'critical' ? 'bg-red-500 text-white' :
                          severity === 'high' ? 'bg-orange-500 text-white' :
                          severity === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {['open', 'in_progress', 'resolved', 'closed'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusToggle(status)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.statuses.includes(status)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Incident Type (optional)</p>
              <div className="flex flex-wrap gap-2">
                {incidentCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.categories.includes(cat.id)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Include Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Include in Report
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(includeFields).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setIncludeFields(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Report Preview</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">{filteredIncidents.length}</p>
                <p className="text-xs text-gray-500">Incidents</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {filteredIncidents.filter(i => i.severity === 'critical').length}
                </p>
                <p className="text-xs text-gray-500">Critical</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredIncidents.filter(i => i.status === 'resolved' || i.status === 'closed').length}
                </p>
                <p className="text-xs text-gray-500">Resolved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalCost)}</p>
                <p className="text-xs text-gray-500">Total Cost</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <FileJson className="w-4 h-4" />
              Export JSON
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleExportPDF}
              disabled={filteredIncidents.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDFs ({filteredIncidents.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
