import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Scale, AlertTriangle } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { formatDate, getStatusColor, isOverdue } from '../../utils/helpers'
import LegalForm from './LegalForm'

const legalTypes = [
  { value: 'notification', label: 'Regulatory Notification' },
  { value: 'consultation', label: 'Legal Consultation' },
  { value: 'compliance', label: 'Compliance Requirement' },
  { value: 'investigation', label: 'Investigation' },
  { value: 'litigation', label: 'Litigation' },
  { value: 'other', label: 'Other' }
]

export default function LegalItems() {
  const { legalItems, incidents, deleteLegalItem, updateLegalItem } = useIncidents()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterIncident, setFilterIncident] = useState('')

  const filteredItems = legalItems.filter(item => {
    const matchesSearch = item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || item.type === filterType
    const matchesStatus = !filterStatus || item.status === filterStatus
    const matchesIncident = !filterIncident || item.incidentId === filterIncident
    return matchesSearch && matchesType && matchesStatus && matchesIncident
  }).sort((a, b) => {
    // Sort by overdue first, then by due date
    const aOverdue = isOverdue(a.dueDate) && a.status !== 'completed'
    const bOverdue = isOverdue(b.dueDate) && b.status !== 'completed'
    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1
    return new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
  })

  const handleEdit = (item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this legal item?')) {
      deleteLegalItem(id)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const handleToggleStatus = (item) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed'
    updateLegalItem({ ...item, status: newStatus })
  }

  const getIncidentTitle = (incidentId) => {
    const incident = incidents.find(i => i.id === incidentId)
    return incident?.title || 'Unknown Incident'
  }

  const getTypeLabel = (type) => {
    return legalTypes.find(t => t.value === type)?.label || type
  }

  // Statistics
  const pendingCount = legalItems.filter(i => i.status !== 'completed').length
  const overdueCount = legalItems.filter(i => isOverdue(i.dueDate) && i.status !== 'completed').length
  const notificationCount = legalItems.filter(i => i.type === 'notification' && i.status !== 'completed').length

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Legal Items</h2>
          <p className="text-sm text-gray-500">
            {filteredItems.length} items - {pendingCount} pending
            {overdueCount > 0 && (
              <span className="text-red-600 ml-2">({overdueCount} overdue)</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Legal Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Items</p>
              <p className="text-xl font-bold text-gray-800">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-xl font-bold text-gray-800">{overdueCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Scale className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Notifications</p>
              <p className="text-xl font-bold text-gray-800">{notificationCount}</p>
            </div>
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
                placeholder="Search legal items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {legalTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterIncident}
            onChange={(e) => setFilterIncident(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Incidents</option>
            {incidents.map(incident => (
              <option key={incident.id} value={incident.id}>
                {incident.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legal Items Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No legal items found.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => {
                const overdue = isOverdue(item.dueDate) && item.status !== 'completed'

                return (
                  <tr key={item.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium ${item.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {item.description}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/incidents/${item.incidentId}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {getIncidentTitle(item.incidentId)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getTypeLabel(item.type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {overdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {formatDate(item.dueDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}
                      >
                        {item.status.replace('_', ' ')}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <LegalForm
          item={editingItem}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
