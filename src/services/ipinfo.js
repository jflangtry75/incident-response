// IPinfo.io API Service
// Documentation: https://ipinfo.io/developers

import { threatIntelConfig } from '../config/threatIntel'

const config = threatIntelConfig.ipInfo
const BASE_URL = 'https://ipinfo.io'

export function isConfigured() {
  return config.enabled
}

export async function lookupIP(ip) {
  if (!isConfigured()) {
    return { source: 'IPinfo', notConfigured: true }
  }

  try {
    let url = `${BASE_URL}/${ip}/json`
    if (config.apiKey) {
      url += `?token=${config.apiKey}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`IPinfo API error: ${response.status}`)
    }

    const data = await response.json()

    // Parse location
    const [lat, lon] = (data.loc || '').split(',')

    return {
      source: 'IPinfo',
      type: 'ip',
      value: ip,
      found: true,
      hostname: data.hostname,
      city: data.city,
      region: data.region,
      country: data.country,
      location: data.loc,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lon ? parseFloat(lon) : null,
      org: data.org,
      postal: data.postal,
      timezone: data.timezone,
      isAnycast: data.anycast || false,
      link: `https://ipinfo.io/${ip}`
    }
  } catch (error) {
    return {
      source: 'IPinfo',
      type: 'ip',
      value: ip,
      error: error.message
    }
  }
}
