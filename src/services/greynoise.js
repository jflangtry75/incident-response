// GreyNoise API Service
// Documentation: https://docs.greynoise.io/

import { threatIntelConfig } from '../config/threatIntel'

const config = threatIntelConfig.greyNoise
const BASE_URL = 'https://api.greynoise.io/v3/community'

export function isConfigured() {
  return config.enabled
}

export async function checkIP(ip) {
  if (!isConfigured()) {
    return { source: 'GreyNoise', notConfigured: true }
  }

  try {
    const headers = {
      'Accept': 'application/json'
    }

    // Add API key if available (for higher rate limits)
    if (config.apiKey) {
      headers['key'] = config.apiKey
    }

    const response = await fetch(`${BASE_URL}/${ip}`, { headers })

    if (response.status === 404) {
      return {
        source: 'GreyNoise',
        type: 'ip',
        value: ip,
        found: false,
        noise: false,
        riot: false,
        message: 'IP not found in GreyNoise dataset - likely not scanning the internet',
        classification: 'unknown',
        link: `https://viz.greynoise.io/ip/${ip}`
      }
    }

    if (!response.ok) {
      throw new Error(`GreyNoise API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      source: 'GreyNoise',
      type: 'ip',
      value: ip,
      found: true,
      noise: data.noise,
      riot: data.riot,
      classification: data.classification, // 'benign', 'malicious', 'unknown'
      name: data.name,
      lastSeen: data.last_seen,
      message: data.message,
      link: `https://viz.greynoise.io/ip/${ip}`
    }
  } catch (error) {
    return {
      source: 'GreyNoise',
      type: 'ip',
      value: ip,
      error: error.message
    }
  }
}

// Classification explanations
export const classificationInfo = {
  benign: 'Known benign service (e.g., search engine crawler)',
  malicious: 'Known malicious actor or scanner',
  unknown: 'Scanning the internet but intent unknown'
}

export const riotInfo = {
  true: 'Rule It Out - Known benign service IP',
  false: 'Not a known benign service'
}

export const noiseInfo = {
  true: 'This IP has been observed scanning the internet',
  false: 'This IP has NOT been observed mass-scanning'
}
