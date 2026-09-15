// Unified Threat Intelligence Service
// Combines all threat intel sources into a single lookup

import * as virusTotal from './virustotal'
import * as abuseIPDB from './abuseipdb'
import * as greyNoise from './greynoise'
import * as abuseCH from './abusech'
import * as ipInfo from './ipinfo'
import * as alienVault from './alienvault'
import * as shodan from './shodan'

// Detect IOC type
export function detectIOCType(value) {
  const v = value.trim()

  // File hashes
  if (/^[a-fA-F0-9]{32}$/.test(v)) return 'md5'
  if (/^[a-fA-F0-9]{40}$/.test(v)) return 'sha1'
  if (/^[a-fA-F0-9]{64}$/.test(v)) return 'sha256'

  // IP address
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v)) return 'ip'

  // URL
  if (/^https?:\/\//.test(v)) return 'url'

  // Domain (basic check)
  if (/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(v)) {
    return 'domain'
  }

  // CVE
  if (/^CVE-\d{4}-\d+$/i.test(v)) return 'cve'

  return 'unknown'
}

// Parse IOCs from text
export function parseIOCs(text) {
  if (!text) return []

  const iocs = []
  const seen = new Set()

  // IP addresses
  const ips = text.match(/\b(\d{1,3}\.){3}\d{1,3}\b/g) || []
  ips.forEach(ip => {
    if (!seen.has(ip)) {
      seen.add(ip)
      iocs.push({ type: 'ip', value: ip })
    }
  })

  // Hashes
  const hashes = text.match(/\b[a-fA-F0-9]{32,64}\b/g) || []
  hashes.forEach(hash => {
    const lower = hash.toLowerCase()
    if (!seen.has(lower)) {
      seen.add(lower)
      const type = hash.length === 32 ? 'md5' : hash.length === 40 ? 'sha1' : 'sha256'
      iocs.push({ type, value: lower })
    }
  })

  // Domains (extract from URLs too)
  const domains = text.match(/\b[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}\b/g) || []
  domains.forEach(domain => {
    const lower = domain.toLowerCase()
    if (!seen.has(lower) && !lower.match(/^\d+\.\d+/)) {
      seen.add(lower)
      iocs.push({ type: 'domain', value: lower })
    }
  })

  // URLs
  const urls = text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/g) || []
  urls.forEach(url => {
    if (!seen.has(url)) {
      seen.add(url)
      iocs.push({ type: 'url', value: url })
    }
  })

  return iocs
}

// Lookup IP across all services
export async function lookupIP(ip) {
  const results = await Promise.allSettled([
    virusTotal.lookupIP(ip),
    abuseIPDB.checkIP(ip),
    greyNoise.checkIP(ip),
    ipInfo.lookupIP(ip),
    alienVault.lookupIP(ip),
    shodan.lookupIP(ip),
    abuseCH.threatFoxLookup('ip', ip)
  ])

  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(r => r && !r.notConfigured)
}

// Lookup domain across all services
export async function lookupDomain(domain) {
  const results = await Promise.allSettled([
    virusTotal.lookupDomain(domain),
    alienVault.lookupDomain(domain),
    shodan.lookupDomain(domain),
    abuseCH.urlhausLookup('domain', domain),
    abuseCH.threatFoxLookup('domain', domain)
  ])

  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(r => r && !r.notConfigured)
}

// Lookup hash across all services
export async function lookupHash(hash) {
  const results = await Promise.allSettled([
    virusTotal.lookupHash(hash),
    alienVault.lookupHash(hash),
    abuseCH.malwareBazaarLookup(hash),
    abuseCH.urlhausLookup('hash', hash),
    abuseCH.threatFoxLookup('hash', hash)
  ])

  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(r => r && !r.notConfigured)
}

// Lookup URL across all services
export async function lookupURL(url) {
  const results = await Promise.allSettled([
    virusTotal.lookupURL(url),
    alienVault.lookupURL(url),
    abuseCH.urlhausLookup('url', url)
  ])

  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(r => r && !r.notConfigured)
}

// Unified lookup based on IOC type
export async function lookupIOC(value) {
  const type = detectIOCType(value)

  switch (type) {
    case 'ip':
      return { type: 'ip', value, results: await lookupIP(value) }
    case 'domain':
      return { type: 'domain', value, results: await lookupDomain(value) }
    case 'md5':
    case 'sha1':
    case 'sha256':
      return { type: 'hash', value, results: await lookupHash(value) }
    case 'url':
      return { type: 'url', value, results: await lookupURL(value) }
    default:
      return { type: 'unknown', value, results: [], error: 'Unable to determine IOC type' }
  }
}

// Get configured services
export function getConfiguredServices() {
  return {
    virusTotal: virusTotal.isConfigured(),
    abuseIPDB: abuseIPDB.isConfigured(),
    greyNoise: greyNoise.isConfigured(),
    ipInfo: ipInfo.isConfigured(),
    alienVaultOTX: alienVault.isConfigured(),
    shodan: shodan.isConfigured(),
    abuseCH: true // No API key required
  }
}
