// Threat Intelligence API Configuration
// API keys are read from environment variables — see .env.example.
// Copy .env.example to .env and fill in your own keys. Services without keys will be skipped.

export const threatIntelConfig = {
  // VirusTotal - https://www.virustotal.com/gui/my-apikey
  virusTotal: {
    enabled: true,
    apiKey: import.meta.env.VITE_VIRUSTOTAL_API_KEY || '',
    rateLimit: 4 // requests per minute (free tier)
  },

  // AbuseIPDB - https://www.abuseipdb.com/account/api
  abuseIPDB: {
    enabled: true,
    apiKey: import.meta.env.VITE_ABUSEIPDB_API_KEY || '',
    rateLimit: 1000 // per day (free tier)
  },

  // GreyNoise - https://viz.greynoise.io/account/api-key
  greyNoise: {
    enabled: true,
    apiKey: import.meta.env.VITE_GREYNOISE_API_KEY || '', // Optional - Community API works without key for basic lookups
    rateLimit: 100 // per day (community)
  },

  // AlienVault OTX - https://otx.alienvault.com/api
  alienVaultOTX: {
    enabled: true,
    apiKey: import.meta.env.VITE_ALIENVAULT_OTX_API_KEY || '',
    rateLimit: 1000 // per hour
  },

  // Shodan - https://account.shodan.io/
  shodan: {
    enabled: true,
    apiKey: import.meta.env.VITE_SHODAN_API_KEY || '',
    rateLimit: 1 // per second (free tier)
  },

  // IPinfo.io - https://ipinfo.io/account/token
  ipInfo: {
    enabled: true,
    apiKey: import.meta.env.VITE_IPINFO_API_KEY || '', // Optional - works without key (50k/month)
    rateLimit: 1000 // per day without key
  },

  // abuse.ch services (no API key required)
  abuseCH: {
    enabled: true,
    urlhaus: true,
    threatFox: true,
    malwareBazaar: true
  },

  // MITRE ATT&CK (no API key required - static data)
  mitreAttack: {
    enabled: true
  },

  // NIST NVD (no API key required for basic use)
  nistNVD: {
    enabled: true,
    apiKey: import.meta.env.VITE_NIST_NVD_API_KEY || '' // Optional - increases rate limit
  }
}
