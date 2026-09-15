import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, DollarSign } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { formatDate, formatCurrency } from '../../utils/helpers'
import CostForm from './CostForm'

const costCategories = [
  'Investigation',
  'Remediation',
  'External Services',
  'Legal Fees',
  'Regulatory Fines',
  'Customer Notification',
  'Credit Monitoring',
  'Public Relations',
  'Hardware/Software',
  'Other'
]

export default function CostTracker() {
  const { costs, incidents, deleteCost } = useIncidents()
  const [showForm, setShowForm] = useState(false)
  const [editingCost, setEditingCost] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterIncident, setFilterIncident] = useState('')

  const filteredCosts = costs.filter(cost => {
    const matchesSearch = cost.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || cost.category === filterCategory
    const matchesIncident = !filterIncident || cost.incidentId === filterIncident
    return matchesSearch && matchesCategory && matchesIncident
  }).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))

  const handleEdit = (cost) => {
    setEditingCost(cost)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this cost entry?')) {
      deleteCost(id)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingCost(null)
  }

  const getIncidentTitle = (incidentId) => {
    const incident = incidents.find(i => i.id === incidentId)
    return incident?.title || 'Unknown Incident'
  }

  // Calculate totals
  const totalCost = filteredCosts.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
  const costsByCategory = costCategories.map(category => ({
    category,
    total: costs.filter(c => c.category === category).reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
  })).filter(c => c.total > 0)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Cost Tracking</h2>
          <p className="text-sm text-gray-500">
            {filteredCosts.length} entries - Total: {formatCurrency(totalCost)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Cost
        </button>
      </div>

      {/* Summary Cards */}
      {costsByCategory.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {costsByCategory.slice(0, 4).map(({ category, total }) => (
            <div key={category} className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-500">{category}</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(total)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search costs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {costCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
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

      {/* Costs Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCosts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No cost entries found.
                </td>
              </tr>
            ) : (
              filteredCosts.map(cost => (
                <tr key={cost.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{cost.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/incidents/${cost.incidentId}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {getIncidentTitle(cost.incidentId)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {cost.category || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(cost.date)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(cost.amount, cost.currency)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cost)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cost.id)}
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
          {filteredCosts.length > 0 && (
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan="4" className="px-6 py-3 text-right font-medium text-gray-700">
                  Total:
                </td>
                <td className="px-6 py-3 text-right font-bold text-gray-900">
                  {formatCurrency(totalCost)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <CostForm
          cost={editingCost}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
