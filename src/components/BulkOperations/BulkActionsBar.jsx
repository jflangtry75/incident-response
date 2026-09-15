import React, { useState } from 'react'
import { CheckSquare, X, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'

export default function BulkActionsBar({ selectedIds, onClearSelection, onSelectionChange }) {
  const { bulkUpdateIncidents, deleteIncident, incidents } = useIncidents()
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateField, setUpdateField] = useState('')
  const [updateValue, setUpdateValue] = useState('')

  const selectedCount = selectedIds.length

  const handleBulkUpdate = () => {
    if (!updateField || !updateValue) return

    bulkUpdateIncidents(selectedIds, { [updateField]: updateValue })
    setShowUpdateModal(false)
    setUpdateField('')
    setUpdateValue('')
    onClearSelection()
  }

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} incidents? This cannot be undone.`)) {
      selectedIds.forEach(id => deleteIncident(id))
      onClearSelection()
    }
  }

  const handleSelectAll = () => {
    onSelectionChange(incidents.map(i => i.id))
  }

  if (selectedCount === 0) return null

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="bg-blue-600 text-white rounded-lg p-3 mb-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5" />
          <span className="font-medium">{selectedCount} incident(s) selected</span>
          <button
            onClick={handleSelectAll}
            className="text-blue-200 hover:text-white text-sm underline"
          >
            Select all ({incidents.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpdateModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 rounded-lg hover:bg-blue-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Bulk Update
          </button>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 rounded-lg hover:bg-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={onClearSelection}
            className="p-1.5 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bulk Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Bulk Update {selectedCount} Incidents</h3>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  This will update all {selectedCount} selected incidents. This action is logged in the audit trail.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field to Update</label>
                <select
                  value={updateField}
                  onChange={(e) => {
                    setUpdateField(e.target.value)
                    setUpdateValue('')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select field</option>
                  <option value="status">Status</option>
                  <option value="severity">Severity</option>
                  <option value="assignedTo">Assigned To</option>
                  <option value="verdict">Verdict</option>
                </select>
              </div>

              {updateField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Value</label>
                  {updateField === 'status' && (
                    <select
                      value={updateValue}
                      onChange={(e) => setUpdateValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  )}
                  {updateField === 'severity' && (
                    <select
                      value={updateValue}
                      onChange={(e) => setUpdateValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select severity</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  )}
                  {updateField === 'verdict' && (
                    <select
                      value={updateValue}
                      onChange={(e) => setUpdateValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select verdict</option>
                      <option value="undefined">Undefined</option>
                      <option value="true_positive">True Positive</option>
                      <option value="false_positive">False Positive</option>
                    </select>
                  )}
                  {updateField === 'assignedTo' && (
                    <input
                      type="text"
                      value={updateValue}
                      onChange={(e) => setUpdateValue(e.target.value)}
                      placeholder="Enter assignee name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUpdateModal(false)
                  setUpdateField('')
                  setUpdateValue('')
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={!updateField || !updateValue}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                Update {selectedCount} Incidents
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
