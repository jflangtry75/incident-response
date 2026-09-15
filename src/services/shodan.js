// Shodan API Service
// Documentation: https://developer.shodan.io/api

import { threatIntelConfig } from '../config/threatIntel'

const config = threatIntelConfig.shodan
const BASE_URL = 'https://api.shodan.io'

export function isConfigured() {
  return config.enabled && config.apiKey && config.apiKey.length > 0
}

export async function lookupIP(ip) {
  if (!isConfigured()) {
    return { source: 'Shodan', notConfigured: true }
  }

  try {
    const response = await fetch(`${BASE_URL}/shodan/host/${ip}?key=${config.apiKey}`)

    if (response.status === 404) {
      return {
        source: 'Shodan',
        type: 'ip',
        value: ip,
        found: false,
        link: `https://www.shodan.io/host/${ip}`
      }
    }

    if (!response.ok) {
      throw new Error(`Shodan API error: ${response.status}`)
    }

    const data = await response.json()

    // Extract unique ports and services
    const services = data.data?.map(d => ({
      port: d.port,
      transport: d.transport,
      product: d.product,
      version: d.version,
      module: d._shodan?.module
    })) || []

    const ports = [...new Set(services.map(s => s.port))].sort((a, b) => a - b)

    return {
      source: 'Shodan',
      type: 'ip',
      value: ip,
      found: true,
      ports: ports,
      services: services.slice(0, 10),
      hostnames: data.hostnames || [],
      domains: data.domains || [],
      org: data.org,
      asn: data.asn,
      isp: data.isp,
      country: data.country_name,
      city: data.city,
      os: data.os,
      tags: data.tags || [],
      vulns: data.vulns || [],
      lastUpdate: data.last_update,
      link: `https://www.shodan.io/host/${ip}`
    }
  } catch (error) {
    return {
      source: 'Shodan',
      type: 'ip',
      value: ip,
      error: error.message
    }
  }
}

export async function lookupDomain(domain) {
  if (!isConfigured()) {
    return { source: 'Shodan', notConfigured: true }
  }

  try {
    const response = await fetch(`${BASE_URL}/dns/domain/${domain}?key=${config.apiKey}`)

    if (!response.ok) {
      throw new Error(`Shodan API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      source: 'Shodan',
      type: 'domain',
      value: domain,
      found: true,
      subdomains: data.subdomains || [],
      records: data.data?.slice(0, 20) || [],
      link: `https://www.shodan.io/search?query=hostname:${domain}`
    }
  } catch (error) {
    return {
      source: 'Shodan',
      type: 'domain',
      value: domain,
      error: error.message
    }
  }
}
