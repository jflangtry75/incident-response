import React, { useState } from 'react'
import { FileText, ChevronRight, AlertTriangle, Bug, Mail, Wifi, UserX, FileWarning, ShieldOff, DatabaseZap } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'

const categoryIcons = {
  phishing: Mail,
  malware_ransomware: Bug,
  unauthorized_access: ShieldOff,
  data_breach: DatabaseZap,
  ddos: Wifi,
  insider_threat: UserX,
  cui_fci_disclosure: FileWarning
}

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

export default function TemplateSelector({ onSelect, onClose }) {
  const { templates } = useIncidents()
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">Create from Template</h3>
          <p className="text-sm text-gray-500 mt-1">
            Select a template to pre-fill incident details
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {templates.map(template => {
              const Icon = categoryIcons[template.category] || FileText
              const isSelected = selectedTemplate?.id === template.id

              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">{template.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${severityColors[template.severity]}`}>
                          {template.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedTemplate && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Template Preview</h4>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-medium text-gray-800">{selectedTemplate.defaultTitle}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedTemplate.defaultDescription}</p>
                {selectedTemplate.suggestedActions?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Suggested Actions:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {selectedTemplate.suggestedActions.slice(0, 4).map((action, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                          {action}
                        </li>
                      ))}
                      {selectedTemplate.suggestedActions.length > 4 && (
                        <li className="text-gray-400 text-xs">
                          +{selectedTemplate.suggestedActions.length - 4} more actions
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  )
}
