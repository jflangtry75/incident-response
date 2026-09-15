import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  User,
  Flag
} from 'lucide-react'
import { getPlaybook, incidentCategories } from '../../data/playbooks'

const priorityConfig = {
  critical: { color: 'text-red-600', bg: 'bg-red-100', label: 'Critical' },
  high: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'High' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium' },
  low: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Low' }
}

export default function PlaybookViewer({ incidentId, categoryId, completedSteps = [], onStepToggle }) {
  const [expandedPhases, setExpandedPhases] = useState({})
  const playbook = getPlaybook(categoryId)
  const categoryInfo = incidentCategories.find(c => c.id === categoryId)

  useEffect(() => {
    // Auto-expand all phases initially
    if (playbook) {
      const expanded = {}
      playbook.phases.forEach((_, index) => {
        expanded[index] = true
      })
      setExpandedPhases(expanded)
    }
  }, [categoryId])

  if (!playbook) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-700">No Playbook Available</h3>
        <p className="text-sm text-gray-500 mt-1">
          Select an incident type to see the response playbook.
        </p>
      </div>
    )
  }

  const togglePhase = (index) => {
    setExpandedPhases(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const isStepCompleted = (stepId) => {
    return completedSteps.includes(stepId)
  }

  const handleStepClick = (stepId) => {
    if (onStepToggle) {
      onStepToggle(stepId)
    }
  }

  const getPhaseProgress = (phase) => {
    const total = phase.steps.length
    const completed = phase.steps.filter(s => isStepCompleted(s.id)).length
    return { total, completed, percentage: Math.round((completed / total) * 100) }
  }

  const getTotalProgress = () => {
    let total = 0
    let completed = 0
    playbook.phases.forEach(phase => {
      total += phase.steps.length
      completed += phase.steps.filter(s => isStepCompleted(s.id)).length
    })
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  const totalProgress = getTotalProgress()

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <div>
              <h3 className="text-lg font-semibold text-white">{playbook.name}</h3>
              <p className="text-sm text-indigo-200">Response Playbook</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{totalProgress.percentage}%</div>
            <div className="text-sm text-indigo-200">{totalProgress.completed}/{totalProgress.total} steps</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-300"
            style={{ width: `${totalProgress.percentage}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">{playbook.description}</p>
      </div>

      {/* Phases */}
      <div className="divide-y divide-gray-200">
        {playbook.phases.map((phase, phaseIndex) => {
          const progress = getPhaseProgress(phase)
          const isExpanded = expandedPhases[phaseIndex]
          const isComplete = progress.completed === progress.total

          return (
            <div key={phaseIndex}>
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phaseIndex)}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  isComplete ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {isComplete ? <CheckCircle2 className="w-5 h-5" /> : phaseIndex + 1}
                  </div>
                  <span className="font-medium text-gray-800">{phase.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {progress.completed}/{progress.total}
                  </span>
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isComplete ? 'bg-green-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Phase Steps */}
              {isExpanded && (
                <div className="bg-gray-50 px-4 py-2">
                  {phase.steps.map((step, stepIndex) => {
                    const completed = isStepCompleted(step.id)
                    const priority = priorityConfig[step.priority]

                    return (
                      <div
                        key={step.id}
                        onClick={() => handleStepClick(step.id)}
                        className={`flex items-start gap-3 p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                          completed
                            ? 'bg-green-100 border border-green-200'
                            : 'bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="pt-0.5">
                          {completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                            {step.task}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${priority.bg} ${priority.color}`}>
                              <Flag className="w-3 h-3" />
                              {priority.label}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <User className="w-3 h-3" />
                              {step.owner}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
