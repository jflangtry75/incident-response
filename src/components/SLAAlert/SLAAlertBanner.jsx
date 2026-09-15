import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Clock, X, Bell } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { checkSLAStatus } from '../../utils/helpers'

export default function SLAAlertBanner() {
  const { incidents } = useIncidents()
  const [dismissed, setDismissed] = useState([])
  const [playSound, setPlaySound] = useState(false)

  // Find incidents at risk of SLA breach
  const atRiskIncidents = incidents.filter(incident => {
    if (incident.status === 'closed' || incident.status === 'resolved') return false
    if (!incident.detectionTime) return false
    if (incident.notificationTime) return false // Already notified
    if (dismissed.includes(incident.id)) return false

    const slaStatus = checkSLAStatus(incident.detectionTime, null, 60)

    // Alert if within 15 minutes of breach or already breached
    if (slaStatus.status === 'pending' && slaStatus.minutesRemaining <= 15) {
      return true
    }
    return false
  })

  const breachedIncidents = incidents.filter(incident => {
    if (incident.status === 'closed' || incident.status === 'resolved') return false
    if (!incident.detectionTime) return false
    if (incident.notificationTime) return false
    if (dismissed.includes(incident.id)) return false

    const slaStatus = checkSLAStatus(incident.detectionTime, null, 60)
    return slaStatus.status === 'breached'
  })

  // Play alert sound for critical breaches
  useEffect(() => {
    if (breachedIncidents.length > 0 && playSound) {
      // Create an audio beep
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.1

      oscillator.start()
      setTimeout(() => oscillator.stop(), 200)
    }
  }, [breachedIncidents.length, playSound])

  const handleDismiss = (incidentId) => {
    setDismissed(prev => [...prev, incidentId])
  }

  if (atRiskIncidents.length === 0 && breachedIncidents.length === 0) {
    return null
  }

  return (
    <div className="space-y-2 mb-4">
      {/* Breached SLA Alert */}
      {breachedIncidents.map(incident => {
        const slaStatus = checkSLAStatus(incident.detectionTime, null, 60)

        return (
          <div
            key={incident.id}
            className="bg-red-600 text-white rounded-lg p-4 shadow-lg animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">SLA BREACHED - Immediate Action Required</p>
                  <p className="text-red-100">
                    "{incident.title}" - FedRAMP 1-hour notification SLA exceeded by{' '}
                    {Math.abs(slaStatus.minutesRemaining)} minutes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/incidents/${incident.id}`}
                  className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  View Incident
                </Link>
                <button
                  onClick={() => handleDismiss(incident.id)}
                  className="p-2 hover:bg-red-500 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* At Risk Alert */}
      {atRiskIncidents.map(incident => {
        const slaStatus = checkSLAStatus(incident.detectionTime, null, 60)

        return (
          <div
            key={incident.id}
            className="bg-yellow-500 text-yellow-900 rounded-lg p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400 rounded-full">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">SLA Warning - {slaStatus.minutesRemaining} minutes remaining</p>
                  <p className="text-yellow-800">
                    "{incident.title}" - FedRAMP notification deadline approaching
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/incidents/${incident.id}`}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  Record Notification
                </Link>
                <button
                  onClick={() => handleDismiss(incident.id)}
                  className="p-2 hover:bg-yellow-400 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Sound Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setPlaySound(!playSound)}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            playSound ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Bell className="w-3 h-3" />
          Alert Sound: {playSound ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  )
}
