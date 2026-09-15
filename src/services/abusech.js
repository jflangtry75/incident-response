// abuse.ch Services (URLhaus, ThreatFox, MalwareBazaar)
// Documentation: https://urlhaus.abuse.ch/api/, https://threatfox.abuse.ch/api/, https://bazaar.abuse.ch/api/

import { threatIntelConfig } from '../config/threatIntel'

const config = threatIntelConfig.abuseCH

// ============================================
// URLhaus - Malicious URLs
// ============================================
export async function urlhausLookup(type, value) {
  if (!config.enabled || !config.urlhaus) {
    return { source: 'URLhaus', notConfigured: true }
  }

  try {
    let endpoint = 'https://urlhaus-api.abuse.ch/v1'
    let body = ''

    if (type === 'url') {
      endpoint += '/url/'
      body = `url=${encodeURIComponent(value)}`
    } else if (type === 'domain') {
      endpoint += '/host/'
      body = `host=${encodeURIComponent(value)}`
    } else if (type === 'hash') {
      endpoint += '/payload/'
      body = value.length === 32 ? `md5_hash=${value}` : `sha256_hash=${value}`
    } else {
      return { source: 'URLhaus', notSupported: true }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })

    const data = await response.json()

    if (data.query_status === 'no_results') {
      return {
        source: 'URLhaus',
        type,
        value,
        found: false,
        link: 'https://urlhaus.abuse.ch/'
      }
    }

    return {
      source: 'URLhaus',
      type,
      value,
      found: true,
      threat: data.threat || data.urls?.[0]?.threat,
      urlCount: data.url_count || data.urls?.length || 1,
      firstSeen: data.date_added || data.urls?.[0]?.date_added,
      lastSeen: data.last_online || data.urls?.[0]?.last_online,
      status: data.url_status || 'unknown',
      tags: data.tags || data.urls?.[0]?.tags || [],
      blacklists: data.blacklists || {},
      link: data.urlhaus_reference || 'https://urlhaus.abuse.ch/'
    }
  } catch (error) {
    return { source: 'URLhaus', error: error.message }
  }
}

// ============================================
// ThreatFox - IOC Database
// ============================================
export async function threatFoxLookup(type, value) {
  if (!config.enabled || !config.threatFox) {
    return { source: 'ThreatFox', notConfigured: true }
  }

  try {
    let searchType = ''
    if (type === 'ip') searchType = 'ioc'
    else if (type === 'domain') searchType = 'ioc'
    else if (type === 'hash') searchType = 'hash'
    else if (type === 'url') searchType = 'ioc'
    else return { source: 'ThreatFox', notSupported: true }

    const response = await fetch('https://threatfox-api.abuse.ch/api/v1/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'search_ioc',
        search_term: value
      })
    })

    const data = await response.json()

    if (data.query_status === 'no_result') {
      return {
        source: 'ThreatFox',
        type,
        value,
        found: false,
        link: 'https://threatfox.abuse.ch/'
      }
    }

    const ioc = data.data?.[0]
    return {
      source: 'ThreatFox',
      type,
      value,
      found: true,
      threatType: ioc?.threat_type,
      threatTypeDesc: ioc?.threat_type_desc,
      malware: ioc?.malware,
      malwareAlias: ioc?.malware_alias,
      malwarePrintable: ioc?.malware_printable,
      confidence: ioc?.confidence_level,
      firstSeen: ioc?.first_seen,
      lastSeen: ioc?.last_seen,
      reporter: ioc?.reporter,
      tags: ioc?.tags || [],
      link: `https://threatfox.abuse.ch/ioc/${ioc?.id}` || 'https://threatfox.abuse.ch/'
    }
  } catch (error) {
    return { source: 'ThreatFox', error: error.message }
  }
}

// ============================================
// MalwareBazaar - Malware Samples
// ============================================
export async function malwareBazaarLookup(hash) {
  if (!config.enabled || !config.malwareBazaar) {
    return { source: 'MalwareBazaar', notConfigured: true }
  }

  try {
    const hashType = hash.length === 32 ? 'md5' : hash.length === 40 ? 'sha1' : 'sha256'

    const response = await fetch('https://mb-api.abuse.ch/api/v1/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `query=get_info&hash=${hash}`
    })

    const data = await response.json()

    if (data.query_status === 'hash_not_found') {
      return {
        source: 'MalwareBazaar',
        type: 'hash',
        value: hash,
        found: false,
        link: 'https://bazaar.abuse.ch/'
      }
    }

    const sample = data.data?.[0]
    return {
      source: 'MalwareBazaar',
      type: 'hash',
      value: hash,
      found: true,
      sha256: sample?.sha256_hash,
      sha1: sample?.sha1_hash,
      md5: sample?.md5_hash,
      fileName: sample?.file_name,
      fileType: sample?.file_type,
      fileSize: sample?.file_size,
      signature: sample?.signature,
      firstSeen: sample?.first_seen,
      lastSeen: sample?.last_seen,
      intelligence: sample?.intelligence,
      deliveryMethod: sample?.delivery_method,
      tags: sample?.tags || [],
      link: `https://bazaar.abuse.ch/sample/${sample?.sha256_hash}` || 'https://bazaar.abuse.ch/'
    }
  } catch (error) {
    return { source: 'MalwareBazaar', error: error.message }
  }
}

// Combined lookup for abuse.ch services
export async function lookupIOC(type, value) {
  const results = []

  if (type === 'hash') {
    results.push(await malwareBazaarLookup(value))
    results.push(await urlhausLookup('hash', value))
    results.push(await threatFoxLookup('hash', value))
  } else if (type === 'url' || type === 'domain') {
    results.push(await urlhausLookup(type, value))
    results.push(await threatFoxLookup(type, value))
  } else if (type === 'ip') {
    results.push(await threatFoxLookup('ip', value))
  }

  return results.filter(r => !r.notSupported)
}
