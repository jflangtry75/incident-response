import React from 'react'
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  MessageSquare,
  Paperclip,
  Link2,
  User,
  ArrowUpCircle,
  FileText,
  DollarSign,
  Scale,
  Zap
} from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { formatDateTime } from '../../utils/helpers'

const activityIcons = {
  incident_created: { icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
  incident_deleted: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
  field_changed: { icon: Edit, color: 'text-blue-600', bg: 'bg-blue-100' },
  auto_escalated: { icon: Zap, color: 'text-orange-600', bg: 'bg-orange-100' },
  action_created: { icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  action_status_changed: { icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  action_deleted: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
  cost_added: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  cost_deleted: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
  legal_item_added: { icon: Scale, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  legal_status_changed: { icon: Scale, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  legal_item_deleted: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
  comment_added: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
  comment_deleted: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
  attachment_added: { icon: Paperclip, color: 'text-teal-600', bg: 'bg-teal-100' },
  attachment_deleted: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
  incidents_linked: { icon: Link2, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  bulk_update: { icon: Edit, color: 'text-yellow-600', bg: 'bg-yellow-100' }
}

export default function ActivityTimeline({ incidentId }) {
  const { getActivityForIncident } = useIncidents()
  const activities = getActivityForIncident(incidentId)

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No activity recorded yet</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => {
          const config = activityIcons[activity.type] || { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' }
          const Icon = config.icon
          const isLast = idx === activities.length - 1

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className={`relative px-1`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-sm text-gray-800">{activity.description}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{activity.user}</span>
                        <span>-</span>
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(activity.timestamp)}</span>
                      </div>
                    </div>
                    {activity.details && Object.keys(activity.details).length > 0 && activity.type === 'field_changed' && (
                      <div className="mt-2 text-xs bg-gray-50 rounded p-2">
                        <span className="text-gray-500">Changed:</span>{' '}
                        <span className="line-through text-red-600">{activity.details.oldValue || 'empty'}</span>
                        {' -> '}
                        <span className="text-green-600">{activity.details.newValue || 'empty'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
