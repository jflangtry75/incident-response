import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { generateId } from '../utils/helpers'

const IncidentContext = createContext()

const initialState = {
  incidents: [],
  actions: [],
  costs: [],
  legalItems: [],
  activityLog: [],
  comments: [],
  attachments: [],
  templates: [],
  notifications: [],
  escalationRules: []
}

// Default escalation rules
const defaultEscalationRules = [
  {
    id: 'rule_1',
    name: 'Critical data breach auto-escalate',
    enabled: true,
    conditions: {
      category: 'data_breach',
      currentSeverity: ['medium', 'high']
    },
    action: {
      newSeverity: 'critical'
    }
  },
  {
    id: 'rule_2',
    name: 'CUI disclosure auto-critical',
    enabled: true,
    conditions: {
      category: 'cui_fci_disclosure',
      currentSeverity: ['low', 'medium', 'high']
    },
    action: {
      newSeverity: 'critical'
    }
  },
  {
    id: 'rule_3',
    name: 'Ransomware auto-critical',
    enabled: true,
    conditions: {
      category: 'malware_ransomware',
      currentSeverity: ['low', 'medium', 'high']
    },
    action: {
      newSeverity: 'critical'
    }
  }
]

// Default templates
const defaultTemplates = [
  {
    id: 'template_phishing',
    name: 'Phishing Attack',
    description: 'Template for phishing/social engineering incidents',
    category: 'phishing',
    severity: 'medium',
    defaultTitle: 'Phishing Campaign Detected',
    defaultDescription: 'A phishing email/campaign has been identified targeting organization users.',
    suggestedActions: [
      'Quarantine suspicious emails',
      'Identify affected users',
      'Reset compromised credentials',
      'Block malicious domains'
    ]
  },
  {
    id: 'template_malware',
    name: 'Malware Detection',
    description: 'Template for malware/ransomware incidents',
    category: 'malware_ransomware',
    severity: 'high',
    defaultTitle: 'Malware Infection Detected',
    defaultDescription: 'Malware has been detected on one or more systems.',
    suggestedActions: [
      'Isolate affected systems',
      'Collect malware samples',
      'Identify infection vector',
      'Run full AV scans'
    ]
  },
  {
    id: 'template_unauthorized',
    name: 'Unauthorized Access',
    description: 'Template for unauthorized access incidents',
    category: 'unauthorized_access',
    severity: 'high',
    defaultTitle: 'Unauthorized Access Detected',
    defaultDescription: 'Unauthorized access to systems or data has been detected.',
    suggestedActions: [
      'Disable compromised accounts',
      'Review access logs',
      'Identify scope of access',
      'Reset credentials'
    ]
  },
  {
    id: 'template_data_breach',
    name: 'Data Breach',
    description: 'Template for data breach/exfiltration incidents',
    category: 'data_breach',
    severity: 'critical',
    defaultTitle: 'Data Breach Detected',
    defaultDescription: 'Unauthorized data access or exfiltration has been confirmed.',
    suggestedActions: [
      'Identify affected data',
      'Block exfiltration channels',
      'Notify legal/compliance',
      'Preserve evidence'
    ]
  },
  {
    id: 'template_ddos',
    name: 'DDoS Attack',
    description: 'Template for DDoS attack incidents',
    category: 'ddos',
    severity: 'high',
    defaultTitle: 'DDoS Attack in Progress',
    defaultDescription: 'A distributed denial of service attack is affecting services.',
    suggestedActions: [
      'Activate DDoS mitigation',
      'Contact ISP',
      'Implement rate limiting',
      'Monitor for secondary attacks'
    ]
  },
  {
    id: 'template_insider',
    name: 'Insider Threat',
    description: 'Template for insider threat incidents',
    category: 'insider_threat',
    severity: 'high',
    defaultTitle: 'Insider Threat Detected',
    defaultDescription: 'Suspicious insider activity has been identified.',
    suggestedActions: [
      'Coordinate with HR',
      'Preserve evidence',
      'Review user activity',
      'Consult legal'
    ]
  },
  {
    id: 'template_cui',
    name: 'CUI/FCI Disclosure',
    description: 'Template for CUI/FCI unauthorized disclosure',
    category: 'cui_fci_disclosure',
    severity: 'critical',
    defaultTitle: 'CUI/FCI Unauthorized Disclosure',
    defaultDescription: 'Controlled Unclassified Information or Federal Contract Information may have been disclosed.',
    suggestedActions: [
      'Identify disclosed data',
      'Notify contracting officer',
      'Report to DIBNet within 72hrs',
      'Engage legal counsel'
    ]
  }
]

function reducer(state, action) {
  switch (action.type) {
    // Incidents
    case 'SET_INCIDENTS':
      return { ...state, incidents: action.payload }
    case 'ADD_INCIDENT':
      return { ...state, incidents: [...state.incidents, action.payload] }
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(i =>
          i.id === action.payload.id ? action.payload : i
        )
      }
    case 'DELETE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.filter(i => i.id !== action.payload),
        actions: state.actions.filter(a => a.incidentId !== action.payload),
        costs: state.costs.filter(c => c.incidentId !== action.payload),
        legalItems: state.legalItems.filter(l => l.incidentId !== action.payload),
        comments: state.comments.filter(c => c.incidentId !== action.payload),
        attachments: state.attachments.filter(a => a.incidentId !== action.payload),
        activityLog: state.activityLog.filter(a => a.incidentId !== action.payload)
      }
    case 'BULK_UPDATE_INCIDENTS':
      return {
        ...state,
        incidents: state.incidents.map(i =>
          action.payload.ids.includes(i.id)
            ? { ...i, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : i
        )
      }

    // Actions
    case 'SET_ACTIONS':
      return { ...state, actions: action.payload }
    case 'ADD_ACTION':
      return { ...state, actions: [...state.actions, action.payload] }
    case 'UPDATE_ACTION':
      return {
        ...state,
        actions: state.actions.map(a =>
          a.id === action.payload.id ? action.payload : a
        )
      }
    case 'DELETE_ACTION':
      return {
        ...state,
        actions: state.actions.filter(a => a.id !== action.payload)
      }

    // Costs
    case 'SET_COSTS':
      return { ...state, costs: action.payload }
    case 'ADD_COST':
      return { ...state, costs: [...state.costs, action.payload] }
    case 'UPDATE_COST':
      return {
        ...state,
        costs: state.costs.map(c =>
          c.id === action.payload.id ? action.payload : c
        )
      }
    case 'DELETE_COST':
      return {
        ...state,
        costs: state.costs.filter(c => c.id !== action.payload)
      }

    // Legal Items
    case 'SET_LEGAL_ITEMS':
      return { ...state, legalItems: action.payload }
    case 'ADD_LEGAL_ITEM':
      return { ...state, legalItems: [...state.legalItems, action.payload] }
    case 'UPDATE_LEGAL_ITEM':
      return {
        ...state,
        legalItems: state.legalItems.map(l =>
          l.id === action.payload.id ? action.payload : l
        )
      }
    case 'DELETE_LEGAL_ITEM':
      return {
        ...state,
        legalItems: state.legalItems.filter(l => l.id !== action.payload)
      }

    // Activity Log
    case 'ADD_ACTIVITY':
      return { ...state, activityLog: [action.payload, ...state.activityLog].slice(0, 1000) }
    case 'SET_ACTIVITY_LOG':
      return { ...state, activityLog: action.payload }

    // Comments
    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.payload] }
    case 'UPDATE_COMMENT':
      return {
        ...state,
        comments: state.comments.map(c =>
          c.id === action.payload.id ? action.payload : c
        )
      }
    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter(c => c.id !== action.payload)
      }
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload }

    // Attachments
    case 'ADD_ATTACHMENT':
      return { ...state, attachments: [...state.attachments, action.payload] }
    case 'DELETE_ATTACHMENT':
      return {
        ...state,
        attachments: state.attachments.filter(a => a.id !== action.payload)
      }
    case 'SET_ATTACHMENTS':
      return { ...state, attachments: action.payload }

    // Templates
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload }
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.payload] }
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(t =>
          t.id === action.payload.id ? action.payload : t
        )
      }
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(t => t.id !== action.payload)
      }

    // Notifications
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 100) }
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      }
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] }
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload }

    // Escalation Rules
    case 'SET_ESCALATION_RULES':
      return { ...state, escalationRules: action.payload }
    case 'UPDATE_ESCALATION_RULE':
      return {
        ...state,
        escalationRules: state.escalationRules.map(r =>
          r.id === action.payload.id ? action.payload : r
        )
      }

    // Load all data
    case 'LOAD_DATA':
      return { ...state, ...action.payload }

    default:
      return state
  }
}

// Calculate field changes for audit trail
function getChanges(oldObj, newObj, fieldsToTrack) {
  const changes = []
  for (const field of fieldsToTrack) {
    const oldVal = oldObj?.[field]
    const newVal = newObj?.[field]
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({
        field,
        oldValue: oldVal,
        newValue: newVal
      })
    }
  }
  return changes
}

export function IncidentProvider({ children }) {
  const [savedData, setSavedData] = useLocalStorage('incidentResponseData', initialState)

  // Initialize with defaults if missing
  const initialData = {
    ...initialState,
    ...savedData,
    templates: savedData.templates?.length > 0 ? savedData.templates : defaultTemplates,
    escalationRules: savedData.escalationRules?.length > 0 ? savedData.escalationRules : defaultEscalationRules
  }

  const [state, dispatch] = useReducer(reducer, initialData)

  // Save to localStorage whenever state changes
  useEffect(() => {
    setSavedData(state)
  }, [state, setSavedData])

  // Add activity log entry
  const logActivity = useCallback((type, incidentId, description, details = {}, user = 'System') => {
    const activity = {
      id: generateId(),
      type,
      incidentId,
      description,
      details,
      user,
      timestamp: new Date().toISOString()
    }
    dispatch({ type: 'ADD_ACTIVITY', payload: activity })
    return activity
  }, [])

  // Add notification
  const addNotification = useCallback((type, title, message, incidentId = null, severity = 'info') => {
    const notification = {
      id: generateId(),
      type,
      title,
      message,
      incidentId,
      severity,
      read: false,
      timestamp: new Date().toISOString()
    }
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
    return notification
  }, [])

  // Check and apply escalation rules
  const checkEscalationRules = useCallback((incident) => {
    const applicableRules = state.escalationRules.filter(rule => {
      if (!rule.enabled) return false
      if (rule.conditions.category && rule.conditions.category !== incident.category) return false
      if (rule.conditions.currentSeverity && !rule.conditions.currentSeverity.includes(incident.severity)) return false
      return true
    })

    if (applicableRules.length > 0) {
      const rule = applicableRules[0]
      if (rule.action.newSeverity && rule.action.newSeverity !== incident.severity) {
        return {
          shouldEscalate: true,
          newSeverity: rule.action.newSeverity,
          ruleName: rule.name
        }
      }
    }
    return { shouldEscalate: false }
  }, [state.escalationRules])

  // Incident operations
  const addIncident = (incident, user = 'User') => {
    // Check escalation rules
    const escalation = checkEscalationRules(incident)
    const finalSeverity = escalation.shouldEscalate ? escalation.newSeverity : incident.severity

    const newIncident = {
      ...incident,
      severity: finalSeverity,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relatedIncidents: incident.relatedIncidents || [],
      completedPlaybookSteps: []
    }
    dispatch({ type: 'ADD_INCIDENT', payload: newIncident })

    logActivity('incident_created', newIncident.id, `Incident "${newIncident.title}" created`, { severity: newIncident.severity }, user)

    if (escalation.shouldEscalate) {
      logActivity('auto_escalated', newIncident.id, `Auto-escalated to ${escalation.newSeverity} by rule: ${escalation.ruleName}`, {
        originalSeverity: incident.severity,
        newSeverity: escalation.newSeverity,
        ruleName: escalation.ruleName
      }, 'System')

      addNotification('escalation', 'Incident Auto-Escalated',
        `"${newIncident.title}" was automatically escalated to ${escalation.newSeverity}`,
        newIncident.id, 'warning')
    }

    return newIncident
  }

  const updateIncident = (incident, user = 'User') => {
    const oldIncident = state.incidents.find(i => i.id === incident.id)

    // Track changes for audit
    const fieldsToTrack = ['title', 'description', 'severity', 'status', 'category', 'verdict', 'assignedTo']
    const changes = getChanges(oldIncident, incident, fieldsToTrack)

    const updated = {
      ...incident,
      updatedAt: new Date().toISOString()
    }
    dispatch({ type: 'UPDATE_INCIDENT', payload: updated })

    // Log specific changes
    changes.forEach(change => {
      logActivity('field_changed', incident.id,
        `${change.field} changed from "${change.oldValue || 'empty'}" to "${change.newValue || 'empty'}"`,
        change, user)
    })

    // Status change notification
    if (oldIncident?.status !== incident.status) {
      addNotification('status_change', 'Incident Status Changed',
        `"${incident.title}" status changed to ${incident.status.replace('_', ' ')}`,
        incident.id, incident.status === 'resolved' ? 'success' : 'info')
    }

    // Severity escalation notification
    if (oldIncident?.severity !== incident.severity) {
      const severityOrder = ['low', 'medium', 'high', 'critical']
      const isEscalation = severityOrder.indexOf(incident.severity) > severityOrder.indexOf(oldIncident?.severity)
      if (isEscalation) {
        addNotification('escalation', 'Incident Escalated',
          `"${incident.title}" escalated to ${incident.severity}`,
          incident.id, 'warning')
      }
    }
  }

  const deleteIncident = (id, user = 'User') => {
    const incident = state.incidents.find(i => i.id === id)
    dispatch({ type: 'DELETE_INCIDENT', payload: id })
    logActivity('incident_deleted', id, `Incident "${incident?.title}" deleted`, {}, user)
  }

  const getIncident = (id) => {
    return state.incidents.find(i => i.id === id)
  }

  // Bulk operations
  const bulkUpdateIncidents = (ids, updates, user = 'User') => {
    dispatch({ type: 'BULK_UPDATE_INCIDENTS', payload: { ids, updates } })

    ids.forEach(id => {
      const incident = state.incidents.find(i => i.id === id)
      Object.keys(updates).forEach(field => {
        logActivity('bulk_update', id, `Bulk update: ${field} changed to "${updates[field]}"`,
          { field, newValue: updates[field] }, user)
      })
    })

    addNotification('bulk_update', 'Bulk Update Complete',
      `${ids.length} incidents updated`, null, 'info')
  }

  // Related incidents
  const linkIncidents = (incidentId, relatedId, user = 'User') => {
    const incident = state.incidents.find(i => i.id === incidentId)
    const relatedIncident = state.incidents.find(i => i.id === relatedId)

    if (!incident || !relatedIncident) return

    const currentRelated = incident.relatedIncidents || []
    if (!currentRelated.includes(relatedId)) {
      updateIncident({
        ...incident,
        relatedIncidents: [...currentRelated, relatedId]
      }, user)

      // Also link the reverse
      const relatedCurrentRelated = relatedIncident.relatedIncidents || []
      if (!relatedCurrentRelated.includes(incidentId)) {
        updateIncident({
          ...relatedIncident,
          relatedIncidents: [...relatedCurrentRelated, incidentId]
        }, user)
      }

      logActivity('incidents_linked', incidentId,
        `Linked to incident "${relatedIncident.title}"`,
        { relatedId }, user)
    }
  }

  const unlinkIncidents = (incidentId, relatedId, user = 'User') => {
    const incident = state.incidents.find(i => i.id === incidentId)
    const relatedIncident = state.incidents.find(i => i.id === relatedId)

    if (incident) {
      updateIncident({
        ...incident,
        relatedIncidents: (incident.relatedIncidents || []).filter(id => id !== relatedId)
      }, user)
    }

    if (relatedIncident) {
      updateIncident({
        ...relatedIncident,
        relatedIncidents: (relatedIncident.relatedIncidents || []).filter(id => id !== incidentId)
      }, user)
    }
  }

  // Action operations
  const addAction = (action, user = 'User') => {
    const newAction = {
      ...action,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    dispatch({ type: 'ADD_ACTION', payload: newAction })
    logActivity('action_created', action.incidentId, `Action "${newAction.title}" created`, {}, user)
    return newAction
  }

  const updateAction = (action, user = 'User') => {
    const oldAction = state.actions.find(a => a.id === action.id)
    dispatch({ type: 'UPDATE_ACTION', payload: action })

    if (oldAction?.status !== action.status) {
      logActivity('action_status_changed', action.incidentId,
        `Action "${action.title}" status changed to ${action.status}`,
        { oldStatus: oldAction?.status, newStatus: action.status }, user)
    }
  }

  const deleteAction = (id, user = 'User') => {
    const action = state.actions.find(a => a.id === id)
    dispatch({ type: 'DELETE_ACTION', payload: id })
    if (action) {
      logActivity('action_deleted', action.incidentId, `Action "${action.title}" deleted`, {}, user)
    }
  }

  const getActionsForIncident = (incidentId) => {
    return state.actions.filter(a => a.incidentId === incidentId)
  }

  // Cost operations
  const addCost = (cost, user = 'User') => {
    const newCost = {
      ...cost,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    dispatch({ type: 'ADD_COST', payload: newCost })
    logActivity('cost_added', cost.incidentId, `Cost "${newCost.description}" ($${newCost.amount}) added`, {}, user)
    return newCost
  }

  const updateCost = (cost) => {
    dispatch({ type: 'UPDATE_COST', payload: cost })
  }

  const deleteCost = (id, user = 'User') => {
    const cost = state.costs.find(c => c.id === id)
    dispatch({ type: 'DELETE_COST', payload: id })
    if (cost) {
      logActivity('cost_deleted', cost.incidentId, `Cost "${cost.description}" deleted`, {}, user)
    }
  }

  const getCostsForIncident = (incidentId) => {
    return state.costs.filter(c => c.incidentId === incidentId)
  }

  const getTotalCosts = () => {
    return state.costs.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
  }

  // Legal operations
  const addLegalItem = (item, user = 'User') => {
    const newItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    dispatch({ type: 'ADD_LEGAL_ITEM', payload: newItem })
    logActivity('legal_item_added', item.incidentId, `Legal item "${newItem.description}" added`, {}, user)
    return newItem
  }

  const updateLegalItem = (item, user = 'User') => {
    const oldItem = state.legalItems.find(l => l.id === item.id)
    dispatch({ type: 'UPDATE_LEGAL_ITEM', payload: item })

    if (oldItem?.status !== item.status) {
      logActivity('legal_status_changed', item.incidentId,
        `Legal item "${item.description}" status changed to ${item.status}`, {}, user)
    }
  }

  const deleteLegalItem = (id, user = 'User') => {
    const item = state.legalItems.find(l => l.id === id)
    dispatch({ type: 'DELETE_LEGAL_ITEM', payload: id })
    if (item) {
      logActivity('legal_item_deleted', item.incidentId, `Legal item "${item.description}" deleted`, {}, user)
    }
  }

  const getLegalItemsForIncident = (incidentId) => {
    return state.legalItems.filter(l => l.incidentId === incidentId)
  }

  // Comment operations
  const addComment = (comment, user = 'User') => {
    const newComment = {
      ...comment,
      id: generateId(),
      author: user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    dispatch({ type: 'ADD_COMMENT', payload: newComment })
    logActivity('comment_added', comment.incidentId, `Comment added by ${user}`, {}, user)
    return newComment
  }

  const updateComment = (comment) => {
    dispatch({ type: 'UPDATE_COMMENT', payload: { ...comment, updatedAt: new Date().toISOString() } })
  }

  const deleteComment = (id, user = 'User') => {
    const comment = state.comments.find(c => c.id === id)
    dispatch({ type: 'DELETE_COMMENT', payload: id })
    if (comment) {
      logActivity('comment_deleted', comment.incidentId, `Comment deleted`, {}, user)
    }
  }

  const getCommentsForIncident = (incidentId) => {
    return state.comments.filter(c => c.incidentId === incidentId).sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  }

  // Attachment operations
  const addAttachment = (attachment, user = 'User') => {
    const newAttachment = {
      ...attachment,
      id: generateId(),
      uploadedBy: user,
      uploadedAt: new Date().toISOString()
    }
    dispatch({ type: 'ADD_ATTACHMENT', payload: newAttachment })
    logActivity('attachment_added', attachment.incidentId, `File "${attachment.name}" uploaded`, {}, user)
    return newAttachment
  }

  const deleteAttachment = (id, user = 'User') => {
    const attachment = state.attachments.find(a => a.id === id)
    dispatch({ type: 'DELETE_ATTACHMENT', payload: id })
    if (attachment) {
      logActivity('attachment_deleted', attachment.incidentId, `File "${attachment.name}" deleted`, {}, user)
    }
  }

  const getAttachmentsForIncident = (incidentId) => {
    return state.attachments.filter(a => a.incidentId === incidentId)
  }

  // Activity log operations
  const getActivityForIncident = (incidentId) => {
    return state.activityLog.filter(a => a.incidentId === incidentId)
  }

  // Template operations
  const getTemplates = () => state.templates

  const createFromTemplate = (templateId, overrides = {}) => {
    const template = state.templates.find(t => t.id === templateId)
    if (!template) return null

    return {
      title: template.defaultTitle,
      description: template.defaultDescription,
      category: template.category,
      severity: template.severity,
      ...overrides
    }
  }

  // Notification operations
  const markNotificationRead = (id) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id })
  }

  const markAllNotificationsRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })
  }

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' })
  }

  const getUnreadNotifications = () => {
    return state.notifications.filter(n => !n.read)
  }

  // Escalation rules
  const updateEscalationRule = (rule) => {
    dispatch({ type: 'UPDATE_ESCALATION_RULE', payload: rule })
  }

  // Statistics
  const getStats = () => {
    const incidents = state.incidents
    const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'in_progress')
    const criticalIncidents = incidents.filter(i => i.severity === 'critical' && i.status !== 'closed')
    const pendingActions = state.actions.filter(a => a.status !== 'completed')
    const pendingLegal = state.legalItems.filter(l => l.status !== 'completed')

    return {
      totalIncidents: incidents.length,
      openIncidents: openIncidents.length,
      criticalIncidents: criticalIncidents.length,
      totalCosts: getTotalCosts(),
      pendingActions: pendingActions.length,
      pendingLegal: pendingLegal.length,
      severityBreakdown: {
        critical: incidents.filter(i => i.severity === 'critical').length,
        high: incidents.filter(i => i.severity === 'high').length,
        medium: incidents.filter(i => i.severity === 'medium').length,
        low: incidents.filter(i => i.severity === 'low').length
      },
      statusBreakdown: {
        open: incidents.filter(i => i.status === 'open').length,
        in_progress: incidents.filter(i => i.status === 'in_progress').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
        closed: incidents.filter(i => i.status === 'closed').length
      }
    }
  }

  // Trend data for charts
  const getTrendData = (days = 30) => {
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const dailyData = {}
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      dailyData[dateStr] = { created: 0, resolved: 0, critical: 0, high: 0, medium: 0, low: 0 }
    }

    state.incidents.forEach(incident => {
      const createdDate = incident.createdAt?.split('T')[0]
      const resolvedDate = incident.resolutionTime?.split('T')[0]

      if (dailyData[createdDate]) {
        dailyData[createdDate].created++
        dailyData[createdDate][incident.severity]++
      }
      if (resolvedDate && dailyData[resolvedDate]) {
        dailyData[resolvedDate].resolved++
      }
    })

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data
    }))
  }

  const value = {
    incidents: state.incidents,
    actions: state.actions,
    costs: state.costs,
    legalItems: state.legalItems,
    activityLog: state.activityLog,
    comments: state.comments,
    attachments: state.attachments,
    templates: state.templates,
    notifications: state.notifications,
    escalationRules: state.escalationRules,
    // Incident operations
    addIncident,
    updateIncident,
    deleteIncident,
    getIncident,
    bulkUpdateIncidents,
    linkIncidents,
    unlinkIncidents,
    // Action operations
    addAction,
    updateAction,
    deleteAction,
    getActionsForIncident,
    // Cost operations
    addCost,
    updateCost,
    deleteCost,
    getCostsForIncident,
    getTotalCosts,
    // Legal operations
    addLegalItem,
    updateLegalItem,
    deleteLegalItem,
    getLegalItemsForIncident,
    // Comment operations
    addComment,
    updateComment,
    deleteComment,
    getCommentsForIncident,
    // Attachment operations
    addAttachment,
    deleteAttachment,
    getAttachmentsForIncident,
    // Activity operations
    getActivityForIncident,
    logActivity,
    // Template operations
    getTemplates,
    createFromTemplate,
    // Notification operations
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    getUnreadNotifications,
    // Escalation rules
    updateEscalationRule,
    checkEscalationRules,
    // Stats
    getStats,
    getTrendData
  }

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  )
}

export function useIncidents() {
  const context = useContext(IncidentContext)
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider')
  }
  return context
}
