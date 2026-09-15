import React, { useState } from 'react'
import {
  X,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Globe,
  Server,
  FileText,
  Loader,
  AlertOctagon
} from 'lucide-react'
import { lookupIOC, parseIOCs, isConfigured } from '../../services/virustotal'
import { formatDate } from '../../utils/helpers'

function ThreatScore({ malicious, suspicious, total }) {
  const score = total > 0 ? ((malicious + suspicious) / total) * 100 : 0

  let color = 'bg-green-500'
  let textColor = 'text-green-700'
  let bgColor = 'bg-green-100'
  let label = 'Clean'

  if (malicious > 0 || suspicious > 5) {
    color = 'bg-red-500'
    textColor = 'text-red-700'
    bgColor = 'bg-red-100'
    label = 'Malicious'
  } else if (suspicious > 0) {
    color = 'bg-yellow-500'
    textColor = 'text-yellow-700'
    bgColor = 'bg-yellow-100'
    label = 'Suspicious'
  }

  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${textColor}`}>{label}</span>
        <span className={`text-2xl font-bold ${textColor}`}>{malicious}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {malicious} malicious, {suspicious} suspicious detections
      </p>
    </div>
  )
}

function ResultCard({ result, onClose }) {
  const getIcon = () => {
    switch (result.type) {
      case 'ip': return <Server className="w-5 h-5" />
      case 'domain': return <Globe className="w-5 h-5" />
      case 'hash': return <FileText className="w-5 h-5" />
      case 'url': return <Globe className="w-5 h-5" />
      default: return <Shield className="w-5 h-5" />
    }
  }

  if (result.notFound) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-medium text-gray-800">{result.value}</span>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{result.type}</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-gray-500 text-sm">No results found in VirusTotal database.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-medium text-gray-800 break-all">{result.value}</span>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">{result.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
            title="View on VirusTotal"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <ThreatScore
        malicious={result.malicious}
        suspicious={result.suspicious}
        total={result.totalEngines}
      />

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {result.type === 'ip' && (
          <>
            {result.country && (
              <div><span className="text-gray-500">Country:</span> <span className="font-medium">{result.country}</span></div>
            )}
            {result.asOwner && (
              <div><span className="text-gray-500">Owner:</span> <span className="font-medium">{result.asOwner}</span></div>
            )}
          </>
        )}

        {result.type === 'domain' && (
          <>
            {result.registrar && (
              <div><span className="text-gray-500">Registrar:</span> <span className="font-medium">{result.registrar}</span></div>
            )}
            {result.creationDate && (
              <div><span className="text-gray-500">Created:</span> <span className="font-medium">{formatDate(result.creationDate)}</span></div>
            )}
          </>
        )}

        {result.type === 'hash' && (
          <>
            {result.fileName && (
              <div className="col-span-2"><span className="text-gray-500">File:</span> <span className="font-medium">{result.fileName}</span></div>
            )}
            {result.fileType && (
              <div><span className="text-gray-500">Type:</span> <span className="font-medium">{result.fileType}</span></div>
            )}
            {result.fileSize && (
              <div><span className="text-gray-500">Size:</span> <span className="font-medium">{(result.fileSize / 1024).toFixed(1)} KB</span></div>
            )}
          </>
        )}

        {result.lastAnalysisDate && (
          <div className="col-span-2">
            <span className="text-gray-500">Last Analysis:</span>{' '}
            <span className="font-medium">{formatDate(result.lastAnalysisDate)}</span>
          </div>
        )}
      </div>

      {result.tags && result.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {result.tags.slice(0, 5).map((tag, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {result.tags.length > 5 && (
            <span className="text-xs text-gray-400">+{result.tags.length - 5} more</span>
          )}
        </div>
      )}
    </div>
  )
}

export default function VirusTotalLookup({ iocText, onClose }) {
  const [manualInput, setManualInput] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const configured = isConfigured()

  // Parse IOCs from the provided text
  const parsedIOCs = parseIOCs(iocText)

  const handleLookup = async (ioc) => {
    setLoading(true)
    setError(null)

    try {
      const result = await lookupIOC(ioc)
      setResults(prev => {
        // Replace if exists, otherwise add
        const existing = prev.findIndex(r => r.value.toLowerCase() === result.value.toLowerCase())
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = result
          return updated
        }
        return [result, ...prev]
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLookupAll = async () => {
    setLoading(true)
    setError(null)

    try {
      for (const ioc of parsedIOCs) {
        await handleLookup(ioc.value)
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleManualLookup = async (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    await handleLookup(manualInput.trim())
    setManualInput('')
  }

  const removeResult = (value) => {
    setResults(prev => prev.filter(r => r.value !== value))
  }

  if (!configured) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              VirusTotal Integration
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">API Key Required</p>
                <p className="text-sm text-yellow-700 mt-1">
                  To use VirusTotal lookups, add your API key to:
                </p>
                <code className="text-xs bg-yellow-100 px-2 py-1 rounded mt-2 block">
                  src/config/virustotal.js
                </code>
                <p className="text-sm text-yellow-700 mt-2">
                  Get a free API key at{' '}
                  <a
                    href="https://www.virustotal.com/gui/my-apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    virustotal.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            VirusTotal Lookup
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          {/* Manual lookup */}
          <form onSubmit={handleManualLookup} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter IP, domain, URL, or file hash..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !manualInput.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Lookup
            </button>
          </form>

          {/* Parsed IOCs from incident */}
          {parsedIOCs.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Detected {parsedIOCs.length} IOC{parsedIOCs.length !== 1 ? 's' : ''} in incident:
                </span>
                <button
                  onClick={handleLookupAll}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  Lookup All
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {parsedIOCs.map((ioc, i) => (
                  <button
                    key={i}
                    onClick={() => handleLookup(ioc.value)}
                    disabled={loading}
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="text-gray-400">{ioc.type}:</span> {ioc.value.length > 30 ? ioc.value.substring(0, 30) + '...' : ioc.value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Enter an IOC above to lookup threat intelligence.</p>
              <p className="text-sm mt-1">Supports IPs, domains, URLs, and file hashes.</p>
            </div>
          ) : (
            results.map((result, i) => (
              <ResultCard
                key={`${result.type}-${result.value}-${i}`}
                result={result}
                onClose={() => removeResult(result.value)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 text-center">
          <a
            href="https://www.virustotal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Powered by VirusTotal
          </a>
        </div>
      </div>
    </div>
  )
}
