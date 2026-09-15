import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Link2, Plus, X, AlertTriangle, Search } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { getSeverityColor, getStatusColor, formatDateTime } from '../../utils/helpers'

export default function RelatedIncidentsSection({ incidentId }) {
  const { incidents, getIncident, linkIncidents, unlinkIncidents } = useIncidents()
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const incident = getIncident(incidentId)
  const relatedIds = incident?.relatedIncidents || []
  const relatedIncidents = relatedIds.map(id => getIncident(id)).filter(Boolean)

  // Available incidents to link (not already related and not self)
  const availableIncidents = incidents.filter(i =>
    i.id !== incidentId && !relatedIds.includes(i.id)
  )

  const filteredAvailable = availableIncidents.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLink = (relatedId) => {
    linkIncidents(incidentId, relatedId)
    setShowLinkModal(false)
    setSearchQuery('')
  }

  const handleUnlink = (relatedId) => {
    if (window.confirm('Unlink this incident?')) {
      unlinkIncidents(incidentId, relatedId)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800">Related Incidents</h4>
        <button
          onClick={() => setShowLinkModal(true)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Link Incident
        </button>
      </div>

      {/* Related Incidents List */}
      {relatedIncidents.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <Link2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No related incidents linked</p>
          <p className="text-xs text-gray-400">Link related incidents to track connections</p>
        </div>
      ) : (
        <div className="space-y-2">
          {relatedIncidents.map(related => (
            <div
              key={related.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Link
                to={`/incidents/${related.id}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {related.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityColor(related.severity)}`}>
                    {related.severity}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(related.status)}`}>
                    {related.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(related.createdAt)}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => handleUnlink(related.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors ml-2"
                title="Unlink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Link Related Incident</h3>
                <button
                  onClick={() => {
                    setShowLinkModal(false)
                    setSearchQuery('')
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-4">
              {filteredAvailable.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No incidents available to link</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailable.map(inc => (
                    <button
                      key={inc.id}
                      onClick={() => handleLink(inc.id)}
                      className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-800 truncate">{inc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityColor(inc.severity)}`}>
                          {inc.severity}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(inc.status)}`}>
                          {inc.status.replace('_', ' ')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
