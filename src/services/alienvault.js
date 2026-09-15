// AlienVault OTX API Service
// Documentation: https://otx.alienvault.com/api

import { threatIntelConfig } from '../config/threatIntel'

const config = threatIntelConfig.alienVaultOTX
const BASE_URL = 'https://otx.alienvault.com/api/v1'

export function isConfigured() {
  return config.enabled && config.apiKey && config.apiKey.length > 0
}

async function otxFetch(endpoint) {
  if (!isConfigured()) {
    return { notConfigured: true }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'X-OTX-API-KEY': config.apiKey,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`OTX API error: ${response.status}`)
  }

  return response.json()
}

export async function lookupIP(ip) {
  if (!isConfigured()) {
    return { source: 'AlienVault OTX', notConfigured: true }
  }

  try {
    const [general, reputation, malware, geo] = await Promise.all([
      otxFetch(`/indicators/IPv4/${ip}/general`),
      otxFetch(`/indicators/IPv4/${ip}/reputation`).catch(() => ({})),
      otxFetch(`/indicators/IPv4/${ip}/malware`).catch(() => ({ data: [] })),
      otxFetch(`/indicators/IPv4/${ip}/geo`).catch(() => ({}))
    ])

    return {
      source: 'AlienVault OTX',
      type: 'ip',
      value: ip,
      found: true,
      pulseCount: general.pulse_info?.count || 0,
      pulses: general.pulse_info?.pulses?.slice(0, 5) || [],
      reputation: reputation.reputation || 0,
      activities: reputation.activities || [],
      malwareSamples: malware.data?.length || 0,
      country: geo.country_name,
      city: geo.city,
      asn: geo.asn,
      tags: general.pulse_info?.pulses?.flatMap(p => p.tags || []).slice(0, 10) || [],
      link: `https://otx.alienvault.com/indicator/ip/${ip}`
    }
  } catch (error) {
    return {
      source: 'AlienVault OTX',
      type: 'ip',
      value: ip,
      error: error.message
    }
  }
}

export async function lookupDomain(domain) {
  if (!isConfigured()) {
    return { source: 'AlienVault OTX', notConfigured: true }
  }

  try {
    const [general, malware, whois] = await Promise.all([
      otxFetch(`/indicators/domain/${domain}/general`),
      otxFetch(`/indicators/domain/${domain}/malware`).catch(() => ({ data: [] })),
      otxFetch(`/indicators/domain/${domain}/whois`).catch(() => ({}))
    ])

    return {
      source: 'AlienVault OTX',
      type: 'domain',
      value: domain,
      found: true,
      pulseCount: general.pulse_info?.count || 0,
      pulses: general.pulse_info?.pulses?.slice(0, 5) || [],
      malwareSamples: malware.data?.length || 0,
      whoisCreated: whois.data?.[0]?.creation_date,
      whoisUpdated: whois.data?.[0]?.update_date,
      registrar: whois.data?.[0]?.registrar,
      tags: general.pulse_info?.pulses?.flatMap(p => p.tags || []).slice(0, 10) || [],
      link: `https://otx.alienvault.com/indicator/domain/${domain}`
    }
  } catch (error) {
    return {
      source: 'AlienVault OTX',
      type: 'domain',
      value: domain,
      error: error.message
    }
  }
}

export async function lookupHash(hash) {
  if (!isConfigured()) {
    return { source: 'AlienVault OTX', notConfigured: true }
  }

  try {
    const hashType = hash.length === 32 ? 'md5' : hash.length === 40 ? 'sha1' : 'sha256'
    const [general, analysis] = await Promise.all([
      otxFetch(`/indicators/file/${hash}/general`),
      otxFetch(`/indicators/file/${hash}/analysis`).catch(() => ({}))
    ])

    return {
      source: 'AlienVault OTX',
      type: 'hash',
      value: hash,
      found: true,
      pulseCount: general.pulse_info?.count || 0,
      pulses: general.pulse_info?.pulses?.slice(0, 5) || [],
      fileType: analysis.analysis?.info?.file_type,
      fileSize: analysis.analysis?.info?.filesize,
      malwareNames: analysis.analysis?.plugins?.cuckoo?.result?.signatures?.map(s => s.name) || [],
      tags: general.pulse_info?.pulses?.flatMap(p => p.tags || []).slice(0, 10) || [],
      link: `https://otx.alienvault.com/indicator/file/${hash}`
    }
  } catch (error) {
    return {
      source: 'AlienVault OTX',
      type: 'hash',
      value: hash,
      error: error.message
    }
  }
}

export async function lookupURL(url) {
  if (!isConfigured()) {
    return { source: 'AlienVault OTX', notConfigured: true }
  }

  try {
    const general = await otxFetch(`/indicators/url/${encodeURIComponent(url)}/general`)

    return {
      source: 'AlienVault OTX',
      type: 'url',
      value: url,
      found: true,
      pulseCount: general.pulse_info?.count || 0,
      pulses: general.pulse_info?.pulses?.slice(0, 5) || [],
      tags: general.pulse_info?.pulses?.flatMap(p => p.tags || []).slice(0, 10) || [],
      link: `https://otx.alienvault.com/indicator/url/${encodeURIComponent(url)}`
    }
  } catch (error) {
    return {
      source: 'AlienVault OTX',
      type: 'url',
      value: url,
      error: error.message
    }
  }
}
