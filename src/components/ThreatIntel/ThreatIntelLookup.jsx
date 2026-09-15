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
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Info,
  Eye,
  Radio
} from 'lucide-react'
import { lookupIOC, parseIOCs, getConfiguredServices } from '../../services/threatIntel'
import { formatDate } from '../../utils/helpers'

// Threat score component
function ThreatScore({ malicious = 0, suspicious = 0, total = 0, label }) {
  if (total === 0) return null

  const score = ((malicious + suspicious) / total) * 100

  let color = 'bg-green-500'
  let bgColor = 'bg-green-100'
  let status = 'Clean'

  if (malicious > 0 || suspicious > 5) {
    color = 'bg-red-500'
    bgColor = 'bg-red-100'
    status = 'Malicious'
  } else if (suspicious > 0) {
    color = 'bg-yellow-500'
    bgColor = 'bg-yellow-100'
    status = 'Suspicious'
  }

  return (
    <div className={`${bgColor} rounded p-2`}>
      <div className="flex items-center justify-between text-xs">
        <span>{label || status}</span>
        <span className="font-bold">{malicious}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
    </div>
  )
}

// Individual source result card
function SourceResult({ result }) {
  const [expanded, setExpanded] = useState(false)

  if (result.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-3">
        <div className="flex items-center gap-2 text-red-700">
          <XCircle className="w-4 h-4" />
          <span className="font-medium">{result.source}</span>
          <span className="text-sm">- {result.error}</span>
        </div>
      </div>
    )
  }

  if (result.notFound === true || result.found === false) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Info className="w-4 h-4" />
            <span className="font-medium">{result.source}</span>
            <span className="text-sm">- Not found</span>
          </div>
          {result.link && (
            <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-600">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    )
  }

  // Determine threat level
  let threatLevel = 'neutral'
  let threatIcon = <Info className="w-4 h-4" />

  if (result.malicious > 0 || result.abuseConfidenceScore > 50 || result.classification === 'malicious') {
    threatLevel = 'danger'
    threatIcon = <AlertOctagon className="w-4 h-4" />
  } else if (result.suspicious > 0 || result.abuseConfidenceScore > 20 || result.pulseCount > 0) {
    threatLevel = 'warning'
    threatIcon = <AlertTriangle className="w-4 h-4" />
  } else if (result.found && (result.harmless > 0 || result.classification === 'benign' || result.riot)) {
    threatLevel = 'safe'
    threatIcon = <CheckCircle className="w-4 h-4" />
  }

  const bgColors = {
    danger: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    safe: 'bg-green-50 border-green-200',
    neutral: 'bg-white border-gray-200'
  }

  const textColors = {
    danger: 'text-red-700',
    warning: 'text-yellow-700',
    safe: 'text-green-700',
    neutral: 'text-gray-700'
  }

  return (
    <div className={`border rounded ${bgColors[threatLevel]}`}>
      <div
        className="p-3 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className={textColors[threatLevel]}>{threatIcon}</span>
          <span className="font-medium">{result.source}</span>

          {/* Quick stats */}
          {result.malicious !== undefined && (
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              {result.malicious}/{result.totalEngines} detections
            </span>
          )}
          {result.abuseConfidenceScore !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded ${result.abuseConfidenceScore > 50 ? 'bg-red-100 text-red-700' : result.abuseConfidenceScore > 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
              {result.abuseConfidenceScore}% confidence
            </span>
          )}
          {result.classification && (
            <span className={`text-xs px-2 py-0.5 rounded ${result.classification === 'malicious' ? 'bg-red-100 text-red-700' : result.classification === 'benign' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
              {result.classification}
            </span>
          )}
          {result.noise !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded ${result.noise ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
              {result.noise ? 'Internet Scanner' : 'Not Scanning'}
            </span>
          )}
          {result.pulseCount > 0 && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
              {result.pulseCount} threat reports
            </span>
          )}
          {result.ports && result.ports.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {result.ports.length} open ports
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {result.link && (
            <a
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {/* VirusTotal specific */}
            {result.source === 'VirusTotal' && (
              <>
                <ThreatScore malicious={result.malicious} suspicious={result.suspicious} total={result.totalEngines} label="Detection Rate" />
                {result.country && <div><span className="text-gray-500">Country:</span> {result.country}</div>}
                {result.asOwner && <div><span className="text-gray-500">Owner:</span> {result.asOwner}</div>}
                {result.fileName && <div className="col-span-2"><span className="text-gray-500">File:</span> {result.fileName}</div>}
                {result.fileType && <div><span className="text-gray-500">Type:</span> {result.fileType}</div>}
              </>
            )}

            {/* AbuseIPDB specific */}
            {result.source === 'AbuseIPDB' && (
              <>
                <div><span className="text-gray-500">Reports:</span> {result.totalReports}</div>
                <div><span className="text-gray-500">Reporters:</span> {result.numDistinctUsers}</div>
                {result.isp && <div><span className="text-gray-500">ISP:</span> {result.isp}</div>}
                {result.isTor && <div className="text-red-600">TOR Exit Node</div>}
                {result.lastReportedAt && <div className="col-span-2"><span className="text-gray-500">Last Report:</span> {formatDate(result.lastReportedAt)}</div>}
              </>
            )}

            {/* GreyNoise specific */}
            {result.source === 'GreyNoise' && (
              <>
                {result.riot && <div className="text-green-600 col-span-2">Known Benign Service (RIOT)</div>}
                {result.name && <div className="col-span-2"><span className="text-gray-500">Name:</span> {result.name}</div>}
                {result.lastSeen && <div><span className="text-gray-500">Last Seen:</span> {result.lastSeen}</div>}
              </>
            )}

            {/* IPinfo specific */}
            {result.source === 'IPinfo' && (
              <>
                {result.org && <div className="col-span-2"><span className="text-gray-500">Org:</span> {result.org}</div>}
                {result.city && <div><span className="text-gray-500">Location:</span> {result.city}, {result.region}</div>}
                {result.country && <div><span className="text-gray-500">Country:</span> {result.country}</div>}
                {result.hostname && <div className="col-span-2"><span className="text-gray-500">Hostname:</span> {result.hostname}</div>}
              </>
            )}

            {/* AlienVault OTX specific */}
            {result.source === 'AlienVault OTX' && (
              <>
                {result.pulseCount > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Found in {result.pulseCount} threat intelligence reports</span>
                  </div>
                )}
                {result.malwareSamples > 0 && <div><span className="text-gray-500">Malware Samples:</span> {result.malwareSamples}</div>}
              </>
            )}

            {/* Shodan specific */}
            {result.source === 'Shodan' && (
              <>
                {result.ports && result.ports.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Open Ports:</span> {result.ports.join(', ')}
                  </div>
                )}
                {result.org && <div><span className="text-gray-500">Org:</span> {result.org}</div>}
                {result.os && <div><span className="text-gray-500">OS:</span> {result.os}</div>}
                {result.vulns && result.vulns.length > 0 && (
                  <div className="col-span-2 text-red-600">
                    Vulnerabilities: {result.vulns.slice(0, 5).join(', ')}
                  </div>
                )}
              </>
            )}

            {/* abuse.ch services */}
            {(result.source === 'URLhaus' || result.source === 'ThreatFox' || result.source === 'MalwareBazaar') && (
              <>
                {result.threat && <div><span className="text-gray-500">Threat:</span> {result.threat}</div>}
                {result.malware && <div><span className="text-gray-500">Malware:</span> {result.malware}</div>}
                {result.signature && <div><span className="text-gray-500">Signature:</span> {result.signature}</div>}
                {result.firstSeen && <div><span className="text-gray-500">First Seen:</span> {formatDate(result.firstSeen)}</div>}
              </>
            )}

            {/* Tags */}
            {result.tags && result.tags.length > 0 && (
              <div className="col-span-2 flex flex-wrap gap-1 mt-1">
                {result.tags.slice(0, 8).map((tag, i) => (
                  <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Main component
export default function ThreatIntelLookup({ iocText, onClose }) {
  const [manualInput, setManualInput] = useState('')
  const [lookupResults, setLookupResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const configuredServices = getConfiguredServices()
  const parsedIOCs = parseIOCs(iocText)

  const handleLookup = async (value) => {
    setLoading(true)
    setError(null)

    try {
      const result = await lookupIOC(value)
      setLookupResults(prev => {
        // Replace if exists
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

  const handleManualLookup = async (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    await handleLookup(manualInput.trim())
    setManualInput('')
  }

  const handleLookupAll = async () => {
    setLoading(true)
    for (const ioc of parsedIOCs.slice(0, 10)) { // Limit to 10 to avoid rate limits
      await handleLookup(ioc.value)
      await new Promise(r => setTimeout(r, 1000)) // Delay between lookups
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Threat Intelligence Lookup
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Services status */}
        <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-4 text-xs overflow-x-auto">
          <span className="text-gray-500 flex-shrink-0">Sources:</span>
          {Object.entries(configuredServices).map(([name, configured]) => (
            <span key={name} className={`flex items-center gap-1 flex-shrink-0 ${configured ? 'text-green-600' : 'text-gray-400'}`}>
              <Radio className={`w-3 h-3 ${configured ? 'fill-green-600' : ''}`} />
              {name}
            </span>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <form onSubmit={handleManualLookup} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter IP, domain, URL, or file hash..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !manualInput.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </form>

          {/* Detected IOCs */}
          {parsedIOCs.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Detected {parsedIOCs.length} IOC{parsedIOCs.length !== 1 ? 's' : ''} from incident:
                </span>
                <button
                  onClick={handleLookupAll}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  Lookup All (max 10)
                </button>
              </div>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {parsedIOCs.map((ioc, i) => (
                  <button
                    key={i}
                    onClick={() => handleLookup(ioc.value)}
                    disabled={loading}
                    className="text-xs bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="text-gray-400">{ioc.type}:</span>{' '}
                    {ioc.value.length > 25 ? ioc.value.substring(0, 25) + '...' : ioc.value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border-b">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {lookupResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Enter an IOC above to search across all threat intelligence sources.</p>
              <p className="text-sm mt-1">Supports IPs, domains, URLs, and file hashes (MD5, SHA1, SHA256).</p>
            </div>
          ) : (
            <div className="space-y-6">
              {lookupResults.map((lookup, i) => (
                <div key={`${lookup.value}-${i}`} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {lookup.type === 'ip' && <Server className="w-4 h-4" />}
                      {lookup.type === 'domain' && <Globe className="w-4 h-4" />}
                      {lookup.type === 'hash' && <FileText className="w-4 h-4" />}
                      {lookup.type === 'url' && <Globe className="w-4 h-4" />}
                      <span className="font-mono font-medium break-all">{lookup.value}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{lookup.type}</span>
                    </div>
                    <button
                      onClick={() => setLookupResults(prev => prev.filter(r => r.value !== lookup.value))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    {lookup.results && lookup.results.length > 0 ? (
                      lookup.results.map((result, j) => (
                        <SourceResult key={`${result.source}-${j}`} result={result} />
                      ))
                    ) : (
                      <div className="text-gray-500 text-center py-4">
                        No results found from any source.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 text-center text-xs text-gray-500">
          Data from VirusTotal, AbuseIPDB, GreyNoise, AlienVault OTX, Shodan, IPinfo, and abuse.ch
        </div>
      </div>
    </div>
  )
}
