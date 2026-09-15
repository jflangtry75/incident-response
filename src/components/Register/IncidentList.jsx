import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, LayoutTemplate, ChevronDown } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { formatDate, getSeverityColor, getStatusColor } from '../../utils/helpers'
import { incidentCategories, verdictOptions } from '../../data/playbooks'
import IncidentForm from './IncidentForm'
import BulkActionsBar from '../BulkOperations/BulkActionsBar'
import TemplateSelector from '../Templates/TemplateSelector'
import ReportBuilder from '../Reports/ReportBuilder'

export default function IncidentList() {
  const { incidents, deleteIncident, createFromTemplate } = useIncidents()
  const [showForm, setShowForm] = useState(false)
  const [editingIncident, setEditingIncident] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [templateData, setTemplateData] = useState(null)
  const [showReportBuilder, setShowReportBuilder] = useState(false)
  const [showNewMenu, setShowNewMenu] = useState(false)

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = !filterSeverity || incident.severity === filterSeverity
    const matchesStatus = !filterStatus || incident.status === filterStatus
    return matchesSearch && matchesSeverity && matchesStatus
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const handleEdit = (incident) => {
    setEditingIncident(incident)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this incident? This will also delete all associated actions, costs, and legal items.')) {
      deleteIncident(id)
      setSelectedIds(prev => prev.filter(sid => sid !== id))
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingIncident(null)
    setTemplateData(null)
  }

  const handleSelectIncident = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredIncidents.map(i => i.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleTemplateSelect = (template) => {
    const data = createFromTemplate(template.id)
    setTemplateData(data)
    setShowTemplateSelector(false)
    setShowForm(true)
  }

  const getCategoryName = (categoryId) => {
    const cat = incidentCategories.find(c => c.id === categoryId)
    return cat?.name || categoryId || '-'
  }

  const getVerdictBadge = (verdict) => {
    if (!verdict || verdict === 'undefined') return null
    const v = verdictOptions.find(vo => vo.id === verdict)
    if (!v) return null

    return (
      <span className={`px-1.5 py-0.5 text-xs rounded ${
        verdict === 'true_positive' ? 'bg-red-100 text-red-700' :
        verdict === 'false_positive' ? 'bg-green-100 text-green-700' :
        'bg-gray-100 text-gray-600'
      }`}>
        {v.name}
      </span>
    )
  }

  return (
    <div className="p-6">
      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onSelectionChange={setSelectedIds}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Active Incidents</h2>
          <p className="text-sm text-gray-500">{filteredIncidents.length} incidents found</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReportBuilder(true)}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Reports
          </button>

          {/* New Incident Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Incident
              <ChevronDown className="w-4 h-4" />
            </button>
            {showNewMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNewMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <button
                    onClick={() => {
                      setShowNewMenu(false)
                      setShowForm(true)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Blank Incident
                  </button>
                  <button
                    onClick={() => {
                      setShowNewMenu(false)
                      setShowTemplateSelector(true)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                  >
                    <LayoutTemplate className="w-4 h-4" />
                    From Template
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Incident Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredIncidents.length && filteredIncidents.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verdict</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                  No incidents found. Create your first incident to get started.
                </td>
              </tr>
            ) : (
              filteredIncidents.map(incident => (
                <tr key={incident.id} className={`hover:bg-gray-50 ${selectedIds.includes(incident.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(incident.id)}
                      onChange={() => handleSelectIncident(incident.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <Link
                        to={`/incidents/${incident.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {incident.title}
                      </Link>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {incident.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {getCategoryName(incident.category)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {getVerdictBadge(incident.verdict)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {incident.assignedTo || '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {formatDate(incident.dateReported)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/incidents/${incident.id}`}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleEdit(incident)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(incident.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <IncidentForm
          incident={editingIncident || templateData}
          onClose={handleFormClose}
        />
      )}

      {/* Template Selector */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {/* Report Builder */}
      {showReportBuilder && (
        <ReportBuilder onClose={() => setShowReportBuilder(false)} />
      )}
    </div>
  )
}
