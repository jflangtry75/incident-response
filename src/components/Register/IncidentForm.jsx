import React, { useState } from 'react'
import { X, Clock, AlertTriangle, FileText, ChevronDown, ChevronUp, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { getLocalDateTimeString } from '../../utils/helpers'
import { incidentCategories, verdictOptions } from '../../data/playbooks'

const attackVectors = [
  'Phishing Email',
  'Malicious Attachment',
  'Drive-by Download',
  'Exploited Vulnerability',
  'Brute Force',
  'Credential Theft',
  'Insider Threat',
  'Social Engineering',
  'Supply Chain',
  'Physical Access',
  'Unknown',
  'Other'
]

const impactLevels = [
  { value: 'none', label: 'None - No impact' },
  { value: 'minimal', label: 'Minimal - Limited impact, easily recoverable' },
  { value: 'moderate', label: 'Moderate - Some disruption, recovery in progress' },
  { value: 'significant', label: 'Significant - Major disruption, extended recovery' },
  { value: 'severe', label: 'Severe - Critical systems affected, major data loss' }
]

export default function IncidentForm({ incident, onClose }) {
  const { addIncident, updateIncident } = useIncidents()
  const isEditing = !!incident?.id

  const [showInvestigation, setShowInvestigation] = useState(isEditing && incident?.rootCause)

  const [formData, setFormData] = useState({
    title: incident?.title || '',
    description: incident?.description || '',
    severity: incident?.severity || 'medium',
    status: incident?.status || 'open',
    category: incident?.category || '',
    verdict: incident?.verdict || 'undefined',
    dateReported: incident?.dateReported || new Date().toISOString().split('T')[0],
    // FedRAMP datetime fields
    incidentStartTime: incident?.incidentStartTime ? getLocalDateTimeString(incident.incidentStartTime) : '',
    detectionTime: incident?.detectionTime ? getLocalDateTimeString(incident.detectionTime) : '',
    notificationTime: incident?.notificationTime ? getLocalDateTimeString(incident.notificationTime) : '',
    resolutionTime: incident?.resolutionTime ? getLocalDateTimeString(incident.resolutionTime) : '',
    assignedTo: incident?.assignedTo || '',
    reporter: incident?.reporter || '',
    // Investigation/Report Fields
    executiveSummary: incident?.executiveSummary || '',
    impactLevel: incident?.impactLevel || '',
    affectedSystems: incident?.affectedSystems || '',
    affectedUsers: incident?.affectedUsers || '',
    dataInvolved: incident?.dataInvolved || '',
    attackVector: incident?.attackVector || '',
    rootCause: incident?.rootCause || '',
    iocs: incident?.iocs || '',
    containmentActions: incident?.containmentActions || '',
    eradicationSteps: incident?.eradicationSteps || '',
    recoverySteps: incident?.recoverySteps || '',
    lessonsLearned: incident?.lessonsLearned || '',
    evidence: incident?.evidence || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const dataToSave = {
      ...formData,
      incidentStartTime: formData.incidentStartTime ? new Date(formData.incidentStartTime).toISOString() : null,
      detectionTime: formData.detectionTime ? new Date(formData.detectionTime).toISOString() : null,
      notificationTime: formData.notificationTime ? new Date(formData.notificationTime).toISOString() : null,
      resolutionTime: formData.resolutionTime ? new Date(formData.resolutionTime).toISOString() : null,
    }

    if (isEditing) {
      updateIncident({ ...incident, ...dataToSave })
    } else {
      addIncident(dataToSave)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Incident' : 'New Incident'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief incident title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Initial description of what was observed"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select incident type</option>
                {incidentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Analyst Verdict */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Analyst Verdict</label>
            <div className="flex gap-4">
              {verdictOptions.map(option => {
                const isSelected = formData.verdict === option.id
                const bgColor = option.id === 'true_positive' ? 'bg-red-100 border-red-500 text-red-800' :
                               option.id === 'false_positive' ? 'bg-green-100 border-green-500 text-green-800' :
                               'bg-gray-100 border-gray-400 text-gray-700'
                const selectedBg = option.id === 'true_positive' ? 'bg-red-500 text-white' :
                                  option.id === 'false_positive' ? 'bg-green-500 text-white' :
                                  'bg-gray-500 text-white'
                const Icon = option.id === 'true_positive' ? XCircle :
                            option.id === 'false_positive' ? CheckCircle :
                            HelpCircle
                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected ? selectedBg : bgColor
                    }`}
                  >
                    <input
                      type="radio"
                      name="verdict"
                      value={option.id}
                      checked={isSelected}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{option.name}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Lead analyst/responder"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reporter</label>
              <input
                type="text"
                name="reporter"
                value={formData.reporter}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Who reported this"
              />
            </div>
          </div>

          {/* FedRAMP Timeline Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-gray-800">Incident Timeline (FedRAMP)</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">1-hour SLA</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">
                  FedRAMP requires notification within <strong>1 hour</strong> of detection for security incidents.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incident Start Time</label>
                <input
                  type="datetime-local"
                  name="incidentStartTime"
                  value={formData.incidentStartTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">When the incident actually occurred</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detection Time</label>
                <input
                  type="datetime-local"
                  name="detectionTime"
                  value={formData.detectionTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">When detected/discovered</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Time</label>
                <input
                  type="datetime-local"
                  name="notificationTime"
                  value={formData.notificationTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">When stakeholders notified</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Time</label>
                <input
                  type="datetime-local"
                  name="resolutionTime"
                  value={formData.resolutionTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">When fully resolved</p>
              </div>
            </div>
          </div>

          {/* Investigation Report Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              type="button"
              onClick={() => setShowInvestigation(!showInvestigation)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="font-medium text-gray-800">Investigation Report</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Analyst Notes</span>
              </div>
              {showInvestigation ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showInvestigation && (
              <div className="mt-4 space-y-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                {/* Executive Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Executive Summary</label>
                  <textarea
                    name="executiveSummary"
                    value={formData.executiveSummary}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="High-level summary for leadership - what happened, impact, and current status"
                  />
                </div>

                {/* Impact Assessment */}
                <div className="border-t border-purple-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Impact Assessment</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Impact Level</label>
                      <select
                        name="impactLevel"
                        value={formData.impactLevel}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select impact level</option>
                        {impactLevels.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Affected Users (Count/Description)</label>
                      <input
                        type="text"
                        name="affectedUsers"
                        value={formData.affectedUsers}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., ~1,200 customers, 50 employees"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Affected Systems/Assets</label>
                    <textarea
                      name="affectedSystems"
                      value={formData.affectedSystems}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="List affected servers, applications, databases, network segments, etc."
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Involved</label>
                    <textarea
                      name="dataInvolved"
                      value={formData.dataInvolved}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Types of data accessed/exfiltrated (PII, PHI, credentials, financial data, etc.)"
                    />
                  </div>
                </div>

                {/* Root Cause & Attack Analysis */}
                <div className="border-t border-purple-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Root Cause Analysis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attack Vector / Entry Point</label>
                      <select
                        name="attackVector"
                        value={formData.attackVector}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select attack vector</option>
                        {attackVectors.map(vector => (
                          <option key={vector} value={vector}>{vector}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Root Cause</label>
                    <textarea
                      name="rootCause"
                      value={formData.rootCause}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="What was the underlying cause? (e.g., unpatched vulnerability, misconfiguration, weak credentials, user error)"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Indicators of Compromise (IOCs)</label>
                    <textarea
                      name="iocs"
                      value={formData.iocs}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                      placeholder="IP addresses, domains, file hashes, registry keys, etc. (one per line)"
                    />
                  </div>
                </div>

                {/* Response Actions */}
                <div className="border-t border-purple-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Response Actions</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Containment Actions Taken</label>
                    <textarea
                      name="containmentActions"
                      value={formData.containmentActions}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Steps taken to isolate and contain the threat (network isolation, account lockout, etc.)"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eradication Steps</label>
                    <textarea
                      name="eradicationSteps"
                      value={formData.eradicationSteps}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Steps taken to remove the threat (malware removal, patching, credential reset)"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Steps</label>
                    <textarea
                      name="recoverySteps"
                      value={formData.recoverySteps}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Steps taken to restore systems and services to normal operation"
                    />
                  </div>
                </div>

                {/* Lessons Learned & Evidence */}
                <div className="border-t border-purple-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Post-Incident</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lessons Learned / Recommendations</label>
                    <textarea
                      name="lessonsLearned"
                      value={formData.lessonsLearned}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="What could be improved? Recommendations for preventing similar incidents"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evidence / Artifacts Collected</label>
                    <textarea
                      name="evidence"
                      value={formData.evidence}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Log files, memory dumps, disk images, screenshots - include storage location/ticket references"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Update Incident' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
