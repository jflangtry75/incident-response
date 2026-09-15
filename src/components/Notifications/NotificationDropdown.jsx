import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  ArrowUpCircle,
  Info,
  CheckCircle
} from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { formatDateTime } from '../../utils/helpers'

const notificationIcons = {
  escalation: { icon: ArrowUpCircle, color: 'text-orange-500' },
  status_change: { icon: Info, color: 'text-blue-500' },
  bulk_update: { icon: CheckCheck, color: 'text-green-500' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500' },
  success: { icon: CheckCircle, color: 'text-green-500' },
  info: { icon: Info, color: 'text-blue-500' }
}

export default function NotificationDropdown() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    getUnreadNotifications
  } = useIncidents()

  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = getUnreadNotifications().length

  const handleNotificationClick = (notification) => {
    markNotificationRead(notification.id)
    if (notification.incidentId) {
      setIsOpen(false)
    }
  }

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'warning': return 'bg-orange-50 border-orange-200'
      case 'success': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.slice(0, 20).map(notification => {
                    const config = notificationIcons[notification.type] || notificationIcons.info
                    const Icon = config.icon

                    const content = (
                      <div
                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-full ${getSeverityBg(notification.severity)}`}>
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? 'font-medium' : ''} text-gray-800`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDateTime(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    )

                    if (notification.incidentId) {
                      return (
                        <Link
                          key={notification.id}
                          to={`/incidents/${notification.incidentId}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          {content}
                        </Link>
                      )
                    }

                    return <div key={notification.id}>{content}</div>
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
