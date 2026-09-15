// AbuseIPDB API Service
// Documentation: https://docs.abuseipdb.com/

import { threatIntelConfig } from '../config/threatIntel'

const config = threatIntelConfig.abuseIPDB
const BASE_URL = 'https://api.abuseipdb.com/api/v2'

export function isConfigured() {
  return config.enabled && config.apiKey && config.apiKey.length > 0
}

export async function checkIP(ip) {
  if (!isConfigured()) {
    return { source: 'AbuseIPDB', notConfigured: true }
  }

  try {
    const response = await fetch(`${BASE_URL}/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose`, {
      headers: {
        'Key': config.apiKey,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`AbuseIPDB API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.data

    return {
      source: 'AbuseIPDB',
      type: 'ip',
      value: ip,
      found: true,
      abuseConfidenceScore: result.abuseConfidenceScore,
      totalReports: result.totalReports,
      numDistinctUsers: result.numDistinctUsers,
      lastReportedAt: result.lastReportedAt,
      isWhitelisted: result.isWhitelisted,
      countryCode: result.countryCode,
      isp: result.isp,
      domain: result.domain,
      usageType: result.usageType,
      isTor: result.isTor,
      categories: result.reports?.slice(0, 5).map(r => r.categories).flat() || [],
      link: `https://www.abuseipdb.com/check/${ip}`
    }
  } catch (error) {
    return {
      source: 'AbuseIPDB',
      type: 'ip',
      value: ip,
      error: error.message
    }
  }
}

// Category mapping
export const abuseCategories = {
  1: 'DNS Compromise',
  2: 'DNS Poisoning',
  3: 'Fraud Orders',
  4: 'DDoS Attack',
  5: 'FTP Brute-Force',
  6: 'Ping of Death',
  7: 'Phishing',
  8: 'Fraud VoIP',
  9: 'Open Proxy',
  10: 'Web Spam',
  11: 'Email Spam',
  12: 'Blog Spam',
  13: 'VPN IP',
  14: 'Port Scan',
  15: 'Hacking',
  16: 'SQL Injection',
  17: 'Spoofing',
  18: 'Brute-Force',
  19: 'Bad Web Bot',
  20: 'Exploited Host',
  21: 'Web App Attack',
  22: 'SSH',
  23: 'IoT Targeted'
}
