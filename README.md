# Incident Response Manager

A web-based incident response management tool for tracking security incidents end-to-end — from initial triage through remediation, cost/legal tracking, and executive reporting.

## Features

- **Executive Dashboard** — stats cards, trend analysis, and charts for an at-a-glance view of incident volume and status
- **Incident Register** — create, list, and manage incidents with full detail views, comments, and attachments
- **Action Items** — track remediation tasks tied to each incident
- **Activity Timeline** — chronological audit trail of incident activity
- **MITRE ATT&CK Mapping** — tag incidents with relevant ATT&CK techniques
- **Threat Intelligence Lookups** — built-in integrations with VirusTotal, AbuseIPDB, Shodan, GreyNoise, AlienVault OTX, IPinfo, and abuse.ch feeds (URLhaus, ThreatFox, MalwareBazaar)
- **Playbooks** — guided response playbooks per incident type
- **Cost & Legal Tracking** — log incident-related costs and legal items
- **SLA Alerts** — banner notifications for incidents at risk of breaching SLA
- **Bulk Operations** — act on multiple incidents at once
- **Related Incidents** — link and cross-reference connected incidents
- **Reports** — export incident reports as PDF, DOCX, or JSON
- **Notifications & Templates** — in-app notifications and reusable incident templates

## Tech Stack

- [React](https://react.dev/) + [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/) — build tooling and dev server
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Chart.js](https://www.chartjs.org/) / react-chartjs-2 — dashboard charts
- [jsPDF](https://github.com/parallax/jsPDF) & [docx](https://github.com/dolanmiu/docx) — PDF/Word report generation
- Data is persisted to browser `localStorage` (no backend required)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm

### Installation

```bash
git clone https://github.com/jflangtry75/incident-response.git
cd incident-response
npm install
```

### Configuration

Threat intel integrations are optional — the app runs fine with none configured, but lookups for that service will be skipped.

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Add your own API keys to `.env` (leave any blank to disable that integration):
   - `VITE_VIRUSTOTAL_API_KEY` — [virustotal.com/gui/my-apikey](https://www.virustotal.com/gui/my-apikey)
   - `VITE_ABUSEIPDB_API_KEY` — [abuseipdb.com/account/api](https://www.abuseipdb.com/account/api)
   - `VITE_GREYNOISE_API_KEY` — [viz.greynoise.io/account/api-key](https://viz.greynoise.io/account/api-key)
   - `VITE_ALIENVAULT_OTX_API_KEY` — [otx.alienvault.com/api](https://otx.alienvault.com/api)
   - `VITE_SHODAN_API_KEY` — [account.shodan.io](https://account.shodan.io/)
   - `VITE_IPINFO_API_KEY` — [ipinfo.io/account/token](https://ipinfo.io/account/token) (optional, works without a key)
   - `VITE_NIST_NVD_API_KEY` — optional, increases NVD rate limits

`.env` is gitignored and will never be committed.

3. (Optional) Set your organization's name/logo for generated reports in [`src/config/company.js`](src/config/company.js).

### Running

```bash
npm run dev
```

Open the URL printed in the terminal (default `http://localhost:5173`).

### Other scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server with hot-reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |

## Data Storage

This app stores all incident data in the browser's `localStorage` — there is no backend or database. Data is local to whichever browser/device you use it on and will be lost if site data is cleared.

## License

No license specified yet.
