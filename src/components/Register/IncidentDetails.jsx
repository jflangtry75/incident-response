import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  CheckSquare,
  DollarSign,
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileText,
  Shield,
  Target,
  Activity,
  Download,
  FileJson,
  FileType,
  Printer,
  ChevronDown,
  Search,
  BookOpen,
  MessageSquare,
  Paperclip,
  Link2,
  History
} from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { exportToPDF, exportToWord, exportToJSON, printReport } from '../../utils/exportReport'
import ThreatIntelLookup from '../ThreatIntel/ThreatIntelLookup'
import PlaybookViewer from '../Playbook/PlaybookViewer'
import ActivityTimeline from '../Activity/ActivityTimeline'
import CommentSection from '../Comments/CommentSection'
import AttachmentSection from '../Attachments/AttachmentSection'
import RelatedIncidentsSection from '../RelatedIncidents/RelatedIncidentsSection'
import MitreAttackMapper from '../MitreAttack/MitreAttackMapper'
import { incidentCategories, verdictOptions } from '../../data/playbooks'
import {
  formatDate,
  formatDateTime,
  getSeverityColor,
  getStatusColor,
  formatCurrency,
  calculateTTD,
  calculateTTR,
  formatDuration,
  checkSLAStatus,
  getSLAStatusColor
} from '../../utils/helpers'
import IncidentForm from './IncidentForm'
import ActionForm from '../Actions/ActionForm'
import CostForm from '../CostLegal/CostForm'
import LegalForm from '../CostLegal/LegalForm'

const impactLabels = {
  none: 'None',
  minimal: 'Minimal',
  moderate: 'Moderate',
  significant: 'Significant',
  severe: 'Severe'
}

const impactColors = {
  none: 'bg-gray-100 text-gray-700',
  minimal: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  significant: 'bg-orange-100 text-orange-700',
  severe: 'bg-red-100 text-red-700'
}

export default function IncidentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getIncident,
    updateIncident,
    deleteIncident,
    getActionsForIncident,
    getCostsForIncident,
    getLegalItemsForIncident,
    getCommentsForIncident,
    getAttachmentsForIncident,
    deleteAction,
    deleteCost,
    deleteLegalItem
  } = useIncidents()

  const [showEditForm, setShowEditForm] = useState(false)
  const [showActionForm, setShowActionForm] = useState(false)
  const [showCostForm, setShowCostForm] = useState(false)
  const [showLegalForm, setShowLegalForm] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showVirusTotal, setShowVirusTotal] = useState(false)

  const incident = getIncident(id)
  const actions = getActionsForIncident(id)
  const costs = getCostsForIncident(id)
  const legalItems = getLegalItemsForIncident(id)
  const comments = getCommentsForIncident(id)
  const attachments = getAttachmentsForIncident(id)

  if (!incident) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500">Incident not found.</p>
          <Link to="/incidents" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to incidents
          </Link>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      deleteIncident(id)
      navigate('/incidents')
    }
  }

  const totalCost = costs.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)

  // Calculate FedRAMP metrics
  const ttd = calculateTTD(incident.incidentStartTime, incident.detectionTime)
  const ttr = calculateTTR(incident.detectionTime, incident.resolutionTime)
  const slaStatus = checkSLAStatus(incident.detectionTime, incident.notificationTime, 60)

  // Check if investigation data exists
  const hasInvestigationData = incident.executiveSummary || incident.rootCause ||
    incident.attackVector || incident.containmentActions || incident.iocs

  // Get category display name
  const categoryInfo = incidentCategories.find(c => c.id === incident.category)
  const categoryName = categoryInfo?.name || incident.category

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'playbook', label: 'Response Playbook', icon: BookOpen },
    { id: 'investigation', label: 'Investigation Report', icon: FileText },
    { id: 'actions', label: `Actions (${actions.length})`, icon: CheckSquare },
    { id: 'financial', label: 'Cost & Legal', icon: DollarSign },
    { id: 'collaboration', label: `Notes (${comments.length})`, icon: MessageSquare },
    { id: 'files', label: `Files (${attachments.length})`, icon: Paperclip },
    { id: 'activity', label: 'Activity Log', icon: History },
  ]

  // Handle playbook step toggle
  const handlePlaybookStepToggle = (stepId) => {
    const currentSteps = incident.completedPlaybookSteps || []
    const newSteps = currentSteps.includes(stepId)
      ? currentSteps.filter(s => s !== stepId)
      : [...currentSteps, stepId]
    updateIncident({ ...incident, completedPlaybookSteps: newSteps })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/incidents')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-800">{incident.title}</h2>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                {incident.severity}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                {incident.status.replace('_', ' ')}
              </span>
              {incident.verdict && (
                <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                  incident.verdict === 'true_positive' ? 'bg-red-100 text-red-800' :
                  incident.verdict === 'false_positive' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {incident.verdict === 'true_positive' && <XCircle className="w-3 h-3" />}
                  {incident.verdict === 'false_positive' && <CheckCircle className="w-3 h-3" />}
                  {incident.verdict === 'undefined' && <HelpCircle className="w-3 h-3" />}
                  {verdictOptions.find(v => v.id === incident.verdict)?.name || incident.verdict}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Created {formatDateTime(incident.createdAt)} | Assigned to: {incident.assignedTo || 'Unassigned'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-4 h-4" />
            </button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        exportToPDF(incident, actions, costs, legalItems)
                        setShowExportMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileText className="w-4 h-4 text-red-500" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => {
                        exportToWord(incident, actions, costs, legalItems)
                        setShowExportMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileType className="w-4 h-4 text-blue-500" />
                      Export as Word
                    </button>
                    <button
                      onClick={() => {
                        exportToJSON(incident, actions, costs, legalItems)
                        setShowExportMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileJson className="w-4 h-4 text-yellow-500" />
                      Export as JSON
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => {
                        printReport()
                        setShowExportMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Printer className="w-4 h-4 text-gray-500" />
                      Print Report
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setShowEditForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FedRAMP Metrics Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-800">FedRAMP Compliance Metrics</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Time to Detect</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{ttd !== null ? formatDuration(ttd) : '-'}</p>
          </div>
          <div className={`rounded-lg p-3 ${getSLAStatusColor(slaStatus.status)}`}>
            <p className="text-xs uppercase tracking-wide opacity-75">Time to Notify</p>
            <p className="text-xl font-bold mt-1">{slaStatus.timeToNotify ? formatDuration(slaStatus.timeToNotify) : '-'}</p>
            <p className="text-xs mt-1 flex items-center gap-1">
              {slaStatus.status === 'met' && <CheckCircle className="w-3 h-3" />}
              {slaStatus.status === 'breached' && <XCircle className="w-3 h-3" />}
              {slaStatus.status === 'pending' && <AlertTriangle className="w-3 h-3" />}
              {slaStatus.message}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Time to Resolve</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{ttr !== null ? formatDuration(ttr) : '-'}</p>
          </div>
          <div className={`rounded-lg p-3 border-2 ${
            slaStatus.status === 'met' ? 'border-green-500 bg-green-50' :
            slaStatus.status === 'breached' ? 'border-red-500 bg-red-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <p className="text-xs uppercase tracking-wide opacity-75">1-Hour SLA</p>
            <p className="text-xl font-bold mt-1 flex items-center gap-2">
              {slaStatus.status === 'met' && <><CheckCircle className="w-5 h-5 text-green-600" /><span className="text-green-800">MET</span></>}
              {slaStatus.status === 'breached' && <><XCircle className="w-5 h-5 text-red-600" /><span className="text-red-800">BREACHED</span></>}
              {slaStatus.status === 'pending' && <><AlertTriangle className="w-5 h-5 text-yellow-600" /><span className="text-yellow-800">PENDING</span></>}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                  <p className="text-gray-800 whitespace-pre-wrap">{incident.description || 'No description provided'}</p>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Timeline</h4>
                  <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
                    {[
                      { label: 'Incident Start', time: incident.incidentStartTime, color: 'red' },
                      { label: 'Detection', time: incident.detectionTime, color: 'blue' },
                      { label: 'Notification', time: incident.notificationTime, color: slaStatus.status === 'met' ? 'green' : 'red' },
                      { label: 'Resolution', time: incident.resolutionTime, color: 'green' },
                    ].map((event, i) => (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[25px] w-4 h-4 rounded-full ${
                          event.time ? `bg-${event.color}-500` : 'bg-gray-300'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{event.label}</p>
                          <p className="text-sm text-gray-500">{event.time ? formatDateTime(event.time) : 'Not recorded'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Details</h4>
                  <dl className="space-y-2">
                    <div><dt className="text-xs text-gray-500">Incident Type</dt><dd className="text-sm font-medium">{categoryName || '-'}</dd></div>
                    <div>
                      <dt className="text-xs text-gray-500">Analyst Verdict</dt>
                      <dd className="text-sm font-medium mt-0.5">
                        {incident.verdict ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${
                            incident.verdict === 'true_positive' ? 'bg-red-100 text-red-800' :
                            incident.verdict === 'false_positive' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {incident.verdict === 'true_positive' && <XCircle className="w-3 h-3" />}
                            {incident.verdict === 'false_positive' && <CheckCircle className="w-3 h-3" />}
                            {incident.verdict === 'undefined' && <HelpCircle className="w-3 h-3" />}
                            {verdictOptions.find(v => v.id === incident.verdict)?.name || incident.verdict}
                          </span>
                        ) : '-'}
                      </dd>
                    </div>
                    <div><dt className="text-xs text-gray-500">Reporter</dt><dd className="text-sm font-medium">{incident.reporter || '-'}</dd></div>
                    <div><dt className="text-xs text-gray-500">Assigned To</dt><dd className="text-sm font-medium">{incident.assignedTo || 'Unassigned'}</dd></div>
                    <div><dt className="text-xs text-gray-500">Last Updated</dt><dd className="text-sm font-medium">{formatDateTime(incident.updatedAt)}</dd></div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Summary</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between"><dt className="text-sm text-gray-600">Actions</dt><dd className="text-sm font-medium">{actions.filter(a => a.status !== 'completed').length} pending</dd></div>
                    <div className="flex justify-between"><dt className="text-sm text-gray-600">Total Cost</dt><dd className="text-sm font-medium">{formatCurrency(totalCost)}</dd></div>
                    <div className="flex justify-between"><dt className="text-sm text-gray-600">Legal Items</dt><dd className="text-sm font-medium">{legalItems.filter(l => l.status !== 'completed').length} pending</dd></div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Playbook Tab */}
          {activeTab === 'playbook' && (
            <div>
              {incident.category && incidentCategories.some(c => c.id === incident.category) ? (
                <PlaybookViewer
                  incidentId={id}
                  categoryId={incident.category}
                  completedSteps={incident.completedPlaybookSteps || []}
                  onStepToggle={handlePlaybookStepToggle}
                />
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Playbook Available</h3>
                  <p className="text-gray-500 mb-4">
                    {incident.category
                      ? `The incident type "${incident.category}" does not have an associated playbook.`
                      : 'Please select an incident type to view the response playbook.'
                    }
                  </p>
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit incident to select a type
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Investigation Report Tab */}
          {activeTab === 'investigation' && (
            <div className="space-y-6">
              {!hasInvestigationData ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No investigation report data yet.</p>
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Click here to add investigation details
                  </button>
                </div>
              ) : (
                <>
                  {/* Executive Summary */}
                  {incident.executiveSummary && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Executive Summary
                      </h4>
                      <p className="text-gray-800 whitespace-pre-wrap">{incident.executiveSummary}</p>
                    </div>
                  )}

                  {/* Impact Assessment */}
                  {(incident.impactLevel || incident.affectedUsers || incident.affectedSystems || incident.dataInvolved) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Impact Assessment
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {incident.impactLevel && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Impact Level</p>
                            <span className={`inline-block mt-1 px-3 py-1 text-sm font-medium rounded-full ${impactColors[incident.impactLevel] || 'bg-gray-100'}`}>
                              {impactLabels[incident.impactLevel] || incident.impactLevel}
                            </span>
                          </div>
                        )}
                        {incident.affectedUsers && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Affected Users</p>
                            <p className="text-sm font-medium mt-1">{incident.affectedUsers}</p>
                          </div>
                        )}
                      </div>
                      {incident.affectedSystems && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 uppercase">Affected Systems/Assets</p>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{incident.affectedSystems}</p>
                        </div>
                      )}
                      {incident.dataInvolved && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 uppercase">Data Involved</p>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{incident.dataInvolved}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Root Cause Analysis */}
                  {(incident.attackVector || incident.rootCause || incident.iocs) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Root Cause Analysis
                      </h4>
                      {incident.attackVector && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase">Attack Vector / Entry Point</p>
                          <span className="inline-block mt-1 px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                            {incident.attackVector}
                          </span>
                        </div>
                      )}
                      {incident.rootCause && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase">Root Cause</p>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{incident.rootCause}</p>
                        </div>
                      )}
                      {incident.iocs && (
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 uppercase">Indicators of Compromise (IOCs)</p>
                            <button
                              onClick={() => setShowVirusTotal(true)}
                              className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                            >
                              <Search className="w-3 h-3" />
                              Threat Intel Lookup
                            </button>
                          </div>
                          <pre className="text-sm mt-1 bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto font-mono">
                            {incident.iocs}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Response Actions */}
                  {(incident.containmentActions || incident.eradicationSteps || incident.recoverySteps) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Response Actions
                      </h4>
                      {incident.containmentActions && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase">Containment Actions</p>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{incident.containmentActions}</p>
                        </div>
                      )}
                      {incident.eradicationSteps && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase">Eradication Steps</p>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{incident.eradicationSteps}</p>
                        </div>
                      )}
                      {incident.recoverySteps && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Recovery Steps</p>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{incident.recoverySteps}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lessons Learned & Evidence */}
                  {(incident.lessonsLearned || incident.evidence) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Post-Incident
                      </h4>
                      {incident.lessonsLearned && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase">Lessons Learned / Recommendations</p>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{incident.lessonsLearned}</p>
                        </div>
                      )}
                      {incident.evidence && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Evidence / Artifacts</p>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{incident.evidence}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-800">Action Items</h4>
                <button
                  onClick={() => setShowActionForm(true)}
                  className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" /> Add Action
                </button>
              </div>
              {actions.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">No action items yet.</p>
              ) : (
                <div className="space-y-2">
                  {actions.map(action => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{action.title}</p>
                        <p className="text-sm text-gray-500">{action.assignee} - Due: {formatDate(action.dueDate)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(action.status)}`}>{action.status}</span>
                        <button onClick={() => deleteAction(action.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Costs */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800">Costs - {formatCurrency(totalCost)}</h4>
                  <button
                    onClick={() => setShowCostForm(true)}
                    className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" /> Add Cost
                  </button>
                </div>
                {costs.length === 0 ? (
                  <p className="text-gray-500 text-sm py-8 text-center">No costs recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {costs.map(cost => (
                      <div key={cost.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{cost.description}</p>
                          <p className="text-sm text-gray-500">{cost.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(cost.amount)}</span>
                          <button onClick={() => deleteCost(cost.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Legal Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800">Legal Items</h4>
                  <button
                    onClick={() => setShowLegalForm(true)}
                    className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" /> Add Legal Item
                  </button>
                </div>
                {legalItems.length === 0 ? (
                  <p className="text-gray-500 text-sm py-8 text-center">No legal items.</p>
                ) : (
                  <div className="space-y-2">
                    {legalItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{item.description}</p>
                          <p className="text-sm text-gray-500">{item.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                          <button onClick={() => deleteLegalItem(item.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Collaboration Tab - Comments */}
          {activeTab === 'collaboration' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <CommentSection incidentId={id} />
              </div>
              <div className="space-y-6">
                <RelatedIncidentsSection incidentId={id} />
                <MitreAttackMapper
                  incidentId={id}
                  incident={incident}
                  onUpdate={updateIncident}
                />
              </div>
            </div>
          )}

          {/* Files Tab - Attachments */}
          {activeTab === 'files' && (
            <AttachmentSection incidentId={id} />
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <ActivityTimeline incidentId={id} />
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditForm && <IncidentForm incident={incident} onClose={() => setShowEditForm(false)} />}
      {showActionForm && <ActionForm incidentId={id} onClose={() => setShowActionForm(false)} />}
      {showCostForm && <CostForm incidentId={id} onClose={() => setShowCostForm(false)} />}
      {showLegalForm && <LegalForm incidentId={id} onClose={() => setShowLegalForm(false)} />}
      {showVirusTotal && <ThreatIntelLookup iocText={incident.iocs} onClose={() => setShowVirusTotal(false)} />}
    </div>
  )
}
