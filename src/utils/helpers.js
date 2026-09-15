export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export function getSeverityColor(severity) {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  }
  return colors[severity] || colors.low
}

export function getStatusColor(status) {
  const colors = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800'
  }
  return colors[status] || colors.open
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function getDaysUntilDue(dueDate) {
  if (!dueDate) return null
  const diff = new Date(dueDate) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// FedRAMP Compliance Metrics

export function calculateTimeDiff(startDate, endDate) {
  if (!startDate || !endDate) return null
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end - start
  if (diffMs < 0) return null
  return diffMs
}

export function formatDuration(ms) {
  if (ms === null || ms === undefined) return '-'

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h`
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m`
  }
  return '< 1m'
}

export function calculateTTD(incidentStartTime, detectionTime) {
  return calculateTimeDiff(incidentStartTime, detectionTime)
}

export function calculateTTR(detectionTime, resolutionTime) {
  return calculateTimeDiff(detectionTime, resolutionTime)
}

export function calculateNotificationTime(detectionTime, notificationTime) {
  return calculateTimeDiff(detectionTime, notificationTime)
}

export function checkSLAStatus(detectionTime, notificationTime, slaMinutes = 60) {
  if (!detectionTime || !notificationTime) return { status: 'pending', message: 'Awaiting notification' }

  const notificationMs = calculateTimeDiff(detectionTime, notificationTime)
  if (notificationMs === null) return { status: 'error', message: 'Invalid dates' }

  const notificationMinutes = notificationMs / (1000 * 60)
  const slaMs = slaMinutes * 60 * 1000

  if (notificationMinutes <= slaMinutes) {
    return {
      status: 'met',
      message: `Notified in ${formatDuration(notificationMs)}`,
      withinSLA: true,
      timeToNotify: notificationMs,
      margin: slaMs - notificationMs
    }
  } else {
    return {
      status: 'breached',
      message: `SLA breached by ${formatDuration(notificationMs - slaMs)}`,
      withinSLA: false,
      timeToNotify: notificationMs,
      breach: notificationMs - slaMs
    }
  }
}

export function getSLAStatusColor(slaStatus) {
  const colors = {
    met: 'bg-green-100 text-green-800 border-green-200',
    breached: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[slaStatus] || colors.pending
}

export function getLocalDateTimeString(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}
