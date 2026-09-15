import React from 'react'
import { User, Database } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { loadSampleData } from '../../utils/sampleData'
import NotificationDropdown from '../Notifications/NotificationDropdown'
import SLAAlertBanner from '../SLAAlert/SLAAlertBanner'

export default function Header({ title }) {
  const { getStats, incidents } = useIncidents()
  const stats = getStats()

  const handleLoadSampleData = () => {
    if (incidents.length > 0) {
      if (!window.confirm('This will replace all existing data with sample data. Continue?')) {
        return
      }
    }
    loadSampleData()
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>

          <div className="flex items-center gap-4">
            {incidents.length === 0 && (
              <button
                onClick={handleLoadSampleData}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-200 transition-colors"
              >
                <Database className="w-4 h-4" />
                <span>Load Sample Data</span>
              </button>
            )}

            {stats.criticalIncidents > 0 && (
              <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>{stats.criticalIncidents} Critical</span>
              </div>
            )}

            <NotificationDropdown />

            <div className="flex items-center gap-2 text-gray-600 border-l pl-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Admin</span>
            </div>
          </div>
        </div>
      </header>
      <div className="px-6 pt-4">
        <SLAAlertBanner />
      </div>
    </>
  )
}
