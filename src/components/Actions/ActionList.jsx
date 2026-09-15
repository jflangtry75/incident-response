import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { formatDate, getStatusColor, isOverdue, getDaysUntilDue } from '../../utils/helpers'
import ActionForm from './ActionForm'

export default function ActionList() {
  const { actions, incidents, deleteAction, updateAction } = useIncidents()
  const [showForm, setShowForm] = useState(false)
  const [editingAction, setEditingAction] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterIncident, setFilterIncident] = useState('')

  const filteredActions = actions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.assignee?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || action.status === filterStatus
    const matchesIncident = !filterIncident || action.incidentId === filterIncident
    return matchesSearch && matchesStatus && matchesIncident
  }).sort((a, b) => {
    // Sort by overdue first, then by due date
    const aOverdue = isOverdue(a.dueDate) && a.status !== 'completed'
    const bOverdue = isOverdue(b.dueDate) && b.status !== 'completed'
    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1
    return new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
  })

  const handleEdit = (action) => {
    setEditingAction(action)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this action?')) {
      deleteAction(id)
    }
  }

  const handleToggleStatus = (action) => {
    const newStatus = action.status === 'completed' ? 'pending' : 'completed'
    updateAction({ ...action, status: newStatus })
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAction(null)
  }

  const getIncidentTitle = (incidentId) => {
    const incident = incidents.find(i => i.id === incidentId)
    return incident?.title || 'Unknown Incident'
  }

  const overdueCount = actions.filter(a => isOverdue(a.dueDate) && a.status !== 'completed').length

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Action Items</h2>
          <p className="text-sm text-gray-500">
            {filteredActions.length} actions found
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
          New Action
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
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

      {/* Actions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredActions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No action items found.
                </td>
              </tr>
            ) : (
              filteredActions.map(action => {
                const overdue = isOverdue(action.dueDate) && action.status !== 'completed'
                const daysUntil = getDaysUntilDue(action.dueDate)

                return (
                  <tr key={action.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleStatus(action)}
                          className={`p-1 rounded ${
                            action.status === 'completed'
                              ? 'text-green-600 hover:bg-green-100'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <div>
                          <p className={`font-medium ${action.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {action.title}
                          </p>
                          {action.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {action.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/incidents/${action.incidentId}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {getIncidentTitle(action.incidentId)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {action.assignee || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {overdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {formatDate(action.dueDate)}
                        </span>
                        {daysUntil !== null && action.status !== 'completed' && (
                          <span className={`text-xs ${
                            daysUntil < 0 ? 'text-red-500' : daysUntil <= 3 ? 'text-orange-500' : 'text-gray-400'
                          }`}>
                            ({daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Today' : `${daysUntil}d left`})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(action.status)}`}>
                        {action.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(action)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(action.id)}
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
        <ActionForm
          action={editingAction}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
