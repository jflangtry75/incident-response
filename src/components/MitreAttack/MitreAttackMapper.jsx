import React, { useState } from 'react'
import { Shield, Plus, X, ExternalLink, Search, Check } from 'lucide-react'
import { tactics, getTechniquesByTactic, getTechniqueById } from '../../services/mitreAttack'
import { useIncidents } from '../../context/IncidentContext'

export default function MitreAttackMapper({ incidentId, incident, onUpdate }) {
  const [showMapper, setShowMapper] = useState(false)
  const [selectedTactic, setSelectedTactic] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const mappedTechniques = incident?.mitreTechniques || []

  const handleAddTechnique = (techniqueId) => {
    if (!mappedTechniques.includes(techniqueId)) {
      onUpdate({
        ...incident,
        mitreTechniques: [...mappedTechniques, techniqueId]
      })
    }
  }

  const handleRemoveTechnique = (techniqueId) => {
    onUpdate({
      ...incident,
      mitreTechniques: mappedTechniques.filter(t => t !== techniqueId)
    })
  }

  const filteredTechniques = selectedTactic
    ? getTechniquesByTactic(selectedTactic).filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <div className="space-y-4">
      {/* Mapped Techniques */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-600" />
          MITRE ATT&CK Mapping
        </h4>
        <button
          onClick={() => setShowMapper(true)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Technique
        </button>
      </div>

      {mappedTechniques.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <Shield className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No techniques mapped</p>
          <p className="text-xs text-gray-400">Map this incident to MITRE ATT&CK techniques</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {mappedTechniques.map(techId => {
            const technique = getTechniqueById(techId)
            if (!technique) return null

            return (
              <div
                key={techId}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg group"
              >
                <span className="text-xs font-mono text-red-600">{technique.id}</span>
                <span className="text-sm text-gray-800">{technique.name}</span>
                <a
                  href={technique.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => handleRemoveTechnique(techId)}
                  className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Mapper Modal */}
      {showMapper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Map MITRE ATT&CK Techniques</h3>
                <button
                  onClick={() => {
                    setShowMapper(false)
                    setSelectedTactic(null)
                    setSearchQuery('')
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Tactics Sidebar */}
              <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-500 uppercase px-2 mb-2">Tactics</p>
                  {tactics.map(tactic => (
                    <button
                      key={tactic.id}
                      onClick={() => setSelectedTactic(tactic.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedTactic === tactic.id
                          ? 'bg-red-100 text-red-800'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{tactic.name}</span>
                      <span className="text-xs text-gray-500 block">{tactic.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Techniques Panel */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedTactic ? (
                  <>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search techniques..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {filteredTechniques.map(technique => {
                        const isMapped = mappedTechniques.includes(technique.id)

                        return (
                          <div
                            key={technique.id}
                            className={`p-3 rounded-lg border transition-colors ${
                              isMapped
                                ? 'bg-red-50 border-red-200'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                    {technique.id}
                                  </span>
                                  <span className="font-medium text-gray-800">{technique.name}</span>
                                </div>
                                {technique.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {technique.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => isMapped
                                  ? handleRemoveTechnique(technique.id)
                                  : handleAddTechnique(technique.id)
                                }
                                className={`p-2 rounded-lg transition-colors ${
                                  isMapped
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {isMapped ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Select a tactic to view techniques</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {mappedTechniques.length} technique(s) mapped
                </p>
                <button
                  onClick={() => {
                    setShowMapper(false)
                    setSelectedTactic(null)
                    setSearchQuery('')
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
