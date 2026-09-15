// VirusTotal API Configuration
// Get your API key from: https://www.virustotal.com/gui/my-apikey
// Set VITE_VIRUSTOTAL_API_KEY in a local .env file (see .env.example) — do not hardcode it here.

export const virusTotalConfig = {
  apiKey: import.meta.env.VITE_VIRUSTOTAL_API_KEY || '',
  baseUrl: 'https://www.virustotal.com/api/v3',

  // Rate limiting (free tier: 4 requests/minute, 500/day)
  rateLimitPerMinute: 4,
  rateLimitPerDay: 500
}
