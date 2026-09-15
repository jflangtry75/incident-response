// VirusTotal API Service
import { virusTotalConfig } from '../config/virustotal'

const { apiKey, baseUrl } = virusTotalConfig

// Check if API key is configured
export function isConfigured() {
  return apiKey && apiKey.length > 0
}

// Generic fetch wrapper with error handling
async function vtFetch(endpoint) {
  if (!isConfigured()) {
    throw new Error('VirusTotal API key not configured. Add your key in src/config/virustotal.js')
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'x-apikey': apiKey,
      'Accept': 'application/json'
    }
  })

  if (response.status === 404) {
    return { notFound: true }
  }

  if (response.status === 429) {
    throw new Error('VirusTotal rate limit exceeded. Please wait before making more requests.')
  }

  if (!response.ok) {
    throw new Error(`VirusTotal API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Look up IP address
export async function lookupIP(ip) {
  const data = await vtFetch(`/ip_addresses/${ip}`)
  if (data.notFound) return { type: 'ip', value: ip, notFound: true }

  const attrs = data.data?.attributes || {}
  const stats = attrs.last_analysis_stats || {}

  return {
    type: 'ip',
    value: ip,
    notFound: false,
    malicious: stats.malicious || 0,
    suspicious: stats.suspicious || 0,
    harmless: stats.harmless || 0,
    undetected: stats.undetected || 0,
    totalEngines: (stats.malicious || 0) + (stats.suspicious || 0) + (stats.harmless || 0) + (stats.undetected || 0),
    country: attrs.country,
    asOwner: attrs.as_owner,
    network: attrs.network,
    lastAnalysisDate: attrs.last_analysis_date ? new Date(attrs.last_analysis_date * 1000).toISOString() : null,
    reputation: attrs.reputation,
    tags: attrs.tags || [],
    link: `https://www.virustotal.com/gui/ip-address/${ip}`
  }
}

// Look up domain
export async function lookupDomain(domain) {
  // Clean the domain (remove protocol, path, etc.)
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].split(':')[0]

  const data = await vtFetch(`/domains/${cleanDomain}`)
  if (data.notFound) return { type: 'domain', value: cleanDomain, notFound: true }

  const attrs = data.data?.attributes || {}
  const stats = attrs.last_analysis_stats || {}

  return {
    type: 'domain',
    value: cleanDomain,
    notFound: false,
    malicious: stats.malicious || 0,
    suspicious: stats.suspicious || 0,
    harmless: stats.harmless || 0,
    undetected: stats.undetected || 0,
    totalEngines: (stats.malicious || 0) + (stats.suspicious || 0) + (stats.harmless || 0) + (stats.undetected || 0),
    registrar: attrs.registrar,
    creationDate: attrs.creation_date ? new Date(attrs.creation_date * 1000).toISOString() : null,
    lastAnalysisDate: attrs.last_analysis_date ? new Date(attrs.last_analysis_date * 1000).toISOString() : null,
    reputation: attrs.reputation,
    categories: attrs.categories || {},
    tags: attrs.tags || [],
    link: `https://www.virustotal.com/gui/domain/${cleanDomain}`
  }
}

// Look up file hash (MD5, SHA1, SHA256)
export async function lookupHash(hash) {
  const cleanHash = hash.trim().toLowerCase()

  const data = await vtFetch(`/files/${cleanHash}`)
  if (data.notFound) return { type: 'hash', value: cleanHash, notFound: true }

  const attrs = data.data?.attributes || {}
  const stats = attrs.last_analysis_stats || {}

  return {
    type: 'hash',
    value: cleanHash,
    notFound: false,
    malicious: stats.malicious || 0,
    suspicious: stats.suspicious || 0,
    harmless: stats.harmless || 0,
    undetected: stats.undetected || 0,
    totalEngines: (stats.malicious || 0) + (stats.suspicious || 0) + (stats.harmless || 0) + (stats.undetected || 0),
    fileName: attrs.meaningful_name || attrs.names?.[0] || 'Unknown',
    fileType: attrs.type_description,
    fileSize: attrs.size,
    md5: attrs.md5,
    sha1: attrs.sha1,
    sha256: attrs.sha256,
    lastAnalysisDate: attrs.last_analysis_date ? new Date(attrs.last_analysis_date * 1000).toISOString() : null,
    firstSubmission: attrs.first_submission_date ? new Date(attrs.first_submission_date * 1000).toISOString() : null,
    tags: attrs.tags || [],
    names: attrs.names || [],
    link: `https://www.virustotal.com/gui/file/${cleanHash}`
  }
}

// Look up URL
export async function lookupURL(url) {
  // URL needs to be base64 encoded (without padding)
  const urlId = btoa(url).replace(/=/g, '')

  const data = await vtFetch(`/urls/${urlId}`)
  if (data.notFound) return { type: 'url', value: url, notFound: true }

  const attrs = data.data?.attributes || {}
  const stats = attrs.last_analysis_stats || {}

  return {
    type: 'url',
    value: url,
    notFound: false,
    malicious: stats.malicious || 0,
    suspicious: stats.suspicious || 0,
    harmless: stats.harmless || 0,
    undetected: stats.undetected || 0,
    totalEngines: (stats.malicious || 0) + (stats.suspicious || 0) + (stats.harmless || 0) + (stats.undetected || 0),
    finalUrl: attrs.last_final_url,
    title: attrs.title,
    lastAnalysisDate: attrs.last_analysis_date ? new Date(attrs.last_analysis_date * 1000).toISOString() : null,
    categories: attrs.categories || {},
    tags: attrs.tags || [],
    link: `https://www.virustotal.com/gui/url/${urlId}`
  }
}

// Auto-detect IOC type and look it up
export async function lookupIOC(ioc) {
  const value = ioc.trim()

  // File hash patterns
  if (/^[a-fA-F0-9]{32}$/.test(value)) {
    return lookupHash(value) // MD5
  }
  if (/^[a-fA-F0-9]{40}$/.test(value)) {
    return lookupHash(value) // SHA1
  }
  if (/^[a-fA-F0-9]{64}$/.test(value)) {
    return lookupHash(value) // SHA256
  }

  // IP address pattern
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    return lookupIP(value)
  }

  // URL pattern
  if (/^https?:\/\//.test(value)) {
    return lookupURL(value)
  }

  // Domain pattern (basic check)
  if (/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(value)) {
    return lookupDomain(value)
  }

  throw new Error(`Unable to determine IOC type for: ${value}`)
}

// Parse IOC text field and extract individual IOCs
export function parseIOCs(text) {
  if (!text) return []

  const iocs = []
  const lines = text.split(/[\n,;]/)

  for (const line of lines) {
    // Extract potential IOCs using patterns
    const cleaned = line.trim()

    // IP addresses
    const ips = cleaned.match(/\b(\d{1,3}\.){3}\d{1,3}\b/g) || []
    ips.forEach(ip => iocs.push({ type: 'ip', value: ip }))

    // Hashes (MD5, SHA1, SHA256)
    const hashes = cleaned.match(/\b[a-fA-F0-9]{32,64}\b/g) || []
    hashes.forEach(hash => {
      if (hash.length === 32) iocs.push({ type: 'md5', value: hash })
      else if (hash.length === 40) iocs.push({ type: 'sha1', value: hash })
      else if (hash.length === 64) iocs.push({ type: 'sha256', value: hash })
    })

    // Domains (basic extraction)
    const domains = cleaned.match(/\b[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}\b/g) || []
    domains.forEach(domain => {
      // Filter out common non-domain patterns
      if (!domain.match(/^\d+\.\d+/) && domain.includes('.')) {
        iocs.push({ type: 'domain', value: domain })
      }
    })
  }

  // Remove duplicates
  const seen = new Set()
  return iocs.filter(ioc => {
    const key = `${ioc.type}:${ioc.value.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
