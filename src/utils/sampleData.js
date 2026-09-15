// Sample data for demonstrating FedRAMP compliance tracking
import { generateId } from './helpers'

// Helper to create dates relative to now
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString()

export const sampleIncidents = [
  // SLA MET - Notified within 1 hour (45 minutes)
  {
    id: generateId(),
    title: 'Unauthorized Access Attempt - East Region Server',
    description: 'Multiple failed login attempts detected from external IP addresses targeting the East Region authentication server. Brute force attack pattern identified. IP blocked and credentials rotated.',
    severity: 'high',
    status: 'resolved',
    category: 'Unauthorized Access',
    dateReported: daysAgo(2),
    incidentStartTime: hoursAgo(50),
    detectionTime: hoursAgo(49),
    notificationTime: hoursAgo(48.25), // 45 minutes after detection - SLA MET
    resolutionTime: hoursAgo(44),
    assignedTo: 'Sarah Chen',
    reporter: 'SOC Team',
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(44),
    // Investigation Report
    executiveSummary: 'A coordinated brute force attack was detected against the East Region authentication server originating from a known botnet. The attack was quickly identified by our SIEM correlation rules and blocked at the firewall level. No successful authentication occurred. Affected service accounts have had credentials rotated as a precaution.',
    impactLevel: 'low',
    affectedSystems: 'East Region Authentication Server (AUTH-EAST-01), Perimeter Firewall (FW-EAST-02)',
    affectedUsers: '0 - No successful compromise',
    dataInvolved: 'None - Attack was blocked before any access',
    attackVector: 'External brute force attack via SSH (port 22) from distributed botnet IPs',
    rootCause: 'SSH service was exposed to internet without rate limiting. Firewall rule allowed broad access to management ports.',
    iocs: 'IP Addresses: 185.220.101.x/24, 45.155.205.x/24, 91.240.118.x/24\nUser-Agent: libssh2/1.9.0\nAttack Pattern: 500+ login attempts per minute targeting root, admin, and service accounts',
    containmentActions: '1. Blocked attacking IP ranges at perimeter firewall\n2. Enabled geo-blocking for non-business regions\n3. Implemented rate limiting on SSH service\n4. Disabled password authentication, enforced key-based auth only',
    eradicationSteps: '1. Rotated all service account credentials\n2. Revoked and regenerated SSH keys for affected server\n3. Updated firewall rules to restrict SSH access to VPN only',
    recoverySteps: '1. Verified no unauthorized access in authentication logs\n2. Confirmed all services operational\n3. Monitored for 24 hours for additional attack attempts',
    lessonsLearned: '1. SSH services should never be directly exposed to internet\n2. Rate limiting should be default on all authentication services\n3. Consider implementing fail2ban or similar on all edge systems\n4. Quarterly review of firewall rules needed',
    evidence: 'SIEM Alert ID: ALERT-2024-8847\nFirewall Logs: FW-EAST-02-logs-20241228.gz\nAuth Logs: /var/log/auth.log (preserved)\nPacket Capture: pcap-east-20241228-brute.pcap'
  },
  // SLA BREACHED - Notified after 2 hours
  {
    id: generateId(),
    title: 'Data Exfiltration Detected - Customer Database',
    description: 'Anomalous data transfer detected from customer database to unknown external endpoint. Investigation revealed compromised service account. Data included PII for approximately 1,200 customers.',
    severity: 'critical',
    status: 'closed',
    category: 'Data Loss',
    dateReported: daysAgo(5),
    incidentStartTime: daysAgo(5) + 'T02:30:00.000Z',
    detectionTime: daysAgo(5) + 'T08:15:00.000Z',
    notificationTime: daysAgo(5) + 'T10:30:00.000Z', // 2h 15m after detection - SLA BREACHED
    resolutionTime: daysAgo(4),
    assignedTo: 'Marcus Johnson',
    reporter: 'SIEM Alert',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
    // Investigation Report
    executiveSummary: 'A sophisticated data exfiltration attack resulted in the unauthorized access and transfer of PII for approximately 1,200 customers. The attacker compromised a service account via credential stuffing using credentials from a third-party breach. Data was exfiltrated to an external server over encrypted HTTPS connections. Regulatory notifications are in progress. This incident requires customer notification under applicable breach laws.',
    impactLevel: 'critical',
    affectedSystems: 'Customer Database Server (DB-CUST-01), Application Server (APP-WEB-03), Data Warehouse (DW-PROD-01)',
    affectedUsers: '1,200 customers with PII exposed',
    dataInvolved: 'Customer PII: Full names, email addresses, phone numbers, billing addresses, last 4 digits of payment cards, account creation dates, purchase history',
    attackVector: 'Credential stuffing attack using credentials from third-party breach (LinkedData breach 2024). Compromised svc_reporting@internal service account.',
    rootCause: 'Service account svc_reporting had excessive database permissions and was using a password that matched credentials in public breach databases. No MFA was required for service accounts. DLP controls were not configured for this database.',
    iocs: 'Destination IP: 194.36.1.27 (VPS in Moldova)\nUser-Agent: python-requests/2.28.1\nQuery Pattern: SELECT * FROM customers WHERE created_at > [date]\nExfiltration Volume: 847MB over 6 hours\nC2 Domain: api.datasynch-backup.com (now sinkholed)',
    containmentActions: '1. Immediately disabled compromised service account\n2. Blocked external IP at firewall and DNS level\n3. Isolated affected database server\n4. Revoked all active sessions\n5. Enabled emergency DLP rules',
    eradicationSteps: '1. Reset all service account credentials\n2. Implemented MFA for all service accounts\n3. Reduced service account permissions to minimum required\n4. Deployed enhanced DLP monitoring on all databases\n5. Added credential breach monitoring service',
    recoverySteps: '1. Restored database server from clean backup (no data loss)\n2. Performed full security audit of all service accounts\n3. Implemented network segmentation for database tier\n4. Deployed database activity monitoring (DAM)\n5. Conducted penetration test of remediated systems',
    lessonsLearned: '1. Service accounts must have MFA and be included in credential monitoring\n2. Principle of least privilege must be enforced for all accounts\n3. DLP controls should cover all data repositories\n4. Network segmentation would have limited blast radius\n5. Delay in notification was due to unclear escalation procedures - need to update runbooks',
    evidence: 'SIEM Alert ID: ALERT-2024-9102\nForensic Image: db-cust-01-forensic.E01\nNetwork Captures: exfil-traffic-20241225.pcap\nDatabase Logs: audit-db-cust-01-20241225.log\nExternal Forensics Report: CrowdStrike-IR-2024-1847.pdf'
  },
  // SLA MET - Notified within 30 minutes
  {
    id: generateId(),
    title: 'Malware Detection - Endpoint Workstation',
    description: 'Ransomware variant detected on endpoint WS-2847. Machine isolated immediately. No lateral movement observed. User clicked on phishing link in email.',
    severity: 'high',
    status: 'resolved',
    category: 'Malware',
    dateReported: daysAgo(1),
    incidentStartTime: hoursAgo(28),
    detectionTime: hoursAgo(27.5),
    notificationTime: hoursAgo(27), // 30 minutes after detection - SLA MET
    resolutionTime: hoursAgo(20),
    assignedTo: 'David Park',
    reporter: 'EDR System',
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(20),
    // Investigation Report
    executiveSummary: 'An employee clicked on a phishing link that downloaded a LockBit 3.0 ransomware variant. The EDR solution detected and quarantined the malware before encryption could begin. The workstation was isolated within seconds of detection. No lateral movement or data exfiltration was observed. The phishing email originated from a compromised vendor account.',
    impactLevel: 'medium',
    affectedSystems: 'Workstation WS-2847 (Marketing Department)',
    affectedUsers: '1 - Jennifer Walsh (Marketing)',
    dataInvolved: 'No data encrypted or exfiltrated. Local files were targeted but attack was stopped before encryption.',
    attackVector: 'Phishing email with malicious link masquerading as DocuSign document. Link led to attacker-controlled domain hosting LockBit dropper.',
    rootCause: 'Phishing email bypassed email security gateway using compromised legitimate sender domain. User awareness training gap - employee did not recognize phishing indicators.',
    iocs: 'Malware Hash (SHA256): 3b4a...[redacted]...8c2d\nDropper Domain: docusign-secure-verify.com\nC2 IP: 91.92.251.87\nEmail Sender: invoice@vendor-acme.com (compromised)\nFile Name: Invoice_DocuSign_Final.exe',
    containmentActions: '1. EDR automatically isolated endpoint\n2. Blocked malicious domain at DNS and proxy\n3. Blocked C2 IP at firewall\n4. Quarantined phishing email from all mailboxes\n5. Reset user credentials as precaution',
    eradicationSteps: '1. Wiped and reimaged affected workstation\n2. Deployed updated EDR signatures across all endpoints\n3. Added phishing domain to email gateway blocklist\n4. Notified vendor of their compromised email account',
    recoverySteps: '1. Restored workstation from standard image\n2. Restored user data from backup (no files were encrypted)\n3. User returned to normal operations\n4. Enhanced monitoring on user account for 30 days',
    lessonsLearned: '1. EDR solution performed excellently - continued investment justified\n2. Need targeted phishing training for marketing department\n3. Consider implementing URL sandboxing for all links\n4. Vendor email compromise highlights supply chain risk',
    evidence: 'EDR Alert ID: EDR-2024-3847\nMalware Sample: LockBit-sample-quarantined.zip (password protected)\nPhishing Email: phish-2024-12-29.eml\nUser Interview: interview-jwlash-20241229.docx'
  },
  // SLA PENDING - Open incident, not yet notified
  {
    id: generateId(),
    title: 'Suspicious Network Traffic - DMZ Segment',
    description: 'Unusual outbound traffic patterns detected from DMZ web servers. Currently investigating potential C2 communication. Traffic analysis in progress.',
    severity: 'medium',
    status: 'in_progress',
    category: 'Security Breach',
    dateReported: new Date().toISOString(),
    incidentStartTime: minutesAgo(45),
    detectionTime: minutesAgo(30),
    notificationTime: null, // Not yet notified - SLA PENDING
    resolutionTime: null,
    assignedTo: 'Emily Rodriguez',
    reporter: 'Network Team',
    createdAt: minutesAgo(30),
    updatedAt: minutesAgo(5)
  },
  // SLA MET - Notified within 15 minutes
  {
    id: generateId(),
    title: 'Phishing Campaign Targeting Executives',
    description: 'Coordinated spear-phishing campaign identified targeting C-level executives. Emails spoofing board members requesting wire transfers. 3 recipients reported suspicious emails.',
    severity: 'high',
    status: 'resolved',
    category: 'Phishing',
    dateReported: daysAgo(3),
    incidentStartTime: daysAgo(3) + 'T09:00:00.000Z',
    detectionTime: daysAgo(3) + 'T09:30:00.000Z',
    notificationTime: daysAgo(3) + 'T09:45:00.000Z', // 15 minutes - SLA MET
    resolutionTime: daysAgo(3) + 'T14:00:00.000Z',
    assignedTo: 'Sarah Chen',
    reporter: 'User Report',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    // Investigation Report
    executiveSummary: 'A sophisticated Business Email Compromise (BEC) campaign targeted executive leadership using well-researched spear-phishing emails. Attackers impersonated board members and requested urgent wire transfers totaling $2.3M. Alert employees recognized the suspicious nature and reported the emails. No financial loss occurred. The campaign appears to be part of a broader attack targeting companies in our industry.',
    impactLevel: 'low',
    affectedSystems: 'Email system (Microsoft 365), Executive mailboxes (CFO, CEO, VP Finance)',
    affectedUsers: '5 executives received phishing emails, 3 reported them',
    dataInvolved: 'No data compromised. Attackers had access to publicly available org chart and executive names.',
    attackVector: 'Spear-phishing emails sent from lookalike domain (company-board.com instead of company.com). Emails referenced recent public press release to add credibility.',
    rootCause: 'Attackers leveraged publicly available information from LinkedIn and company website. Lookalike domain was not monitored. No DMARC enforcement on incoming email.',
    iocs: 'Sending Domain: company-board.com\nSender IP: 185.234.72.19\nReply-To: ceo.executive@protonmail.com\nSubject Lines: "Urgent: Wire Transfer Required" / "Confidential Board Request"',
    containmentActions: '1. Blocked lookalike domain at email gateway\n2. Quarantined all emails from malicious domain\n3. Sent company-wide alert about the campaign\n4. Implemented additional fraud controls in finance department',
    eradicationSteps: '1. Registered and sinkholed lookalike domain variants\n2. Implemented domain monitoring service\n3. Enabled DMARC reject policy\n4. Updated email security rules for BEC indicators',
    recoverySteps: '1. Verified no wire transfers were initiated\n2. Conducted executive briefing on threat\n3. Implemented callback verification for all wire transfers over $10k\n4. Enhanced fraud detection in finance processes',
    lessonsLearned: '1. Employee security awareness training is effective - users reported suspicious emails\n2. Need to register and monitor lookalike domains proactively\n3. Wire transfer procedures should require out-of-band verification\n4. Public information exposure on company website should be minimized',
    evidence: 'Phishing Emails: bec-campaign-emails.zip\nEmail Headers: headers-analysis-20241227.txt\nDomain Registration: whois-company-board.txt\nThreat Intel Report: BEC-campaign-industry-analysis.pdf'
  },
  // SLA BREACHED - Notified after 90 minutes
  {
    id: generateId(),
    title: 'API Authentication Bypass Vulnerability',
    description: 'Security researcher reported authentication bypass in customer-facing API. Vulnerability allowed access to user data without valid tokens. Emergency patch deployed.',
    severity: 'critical',
    status: 'closed',
    category: 'Security Breach',
    dateReported: daysAgo(7),
    incidentStartTime: daysAgo(10), // Vulnerability existed for days before detection
    detectionTime: daysAgo(7) + 'T11:00:00.000Z',
    notificationTime: daysAgo(7) + 'T12:30:00.000Z', // 90 minutes - SLA BREACHED
    resolutionTime: daysAgo(7) + 'T18:00:00.000Z',
    assignedTo: 'Marcus Johnson',
    reporter: 'Bug Bounty',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    // Investigation Report
    executiveSummary: 'A critical authentication bypass vulnerability was identified in the customer-facing REST API by a security researcher through our bug bounty program. The vulnerability allowed attackers to access user data by manipulating JWT tokens. Log analysis indicates the vulnerability existed for approximately 3 days before discovery. Evidence suggests limited exploitation - 47 accounts may have been accessed. Emergency patch was deployed within 7 hours of disclosure.',
    impactLevel: 'high',
    affectedSystems: 'Customer API Gateway (api.company.com), User Profile Service, Authentication Service',
    affectedUsers: '47 accounts with potential unauthorized access based on log analysis',
    dataInvolved: 'User profile data: names, email addresses, preferences, activity history. No payment data was accessible through this endpoint.',
    attackVector: 'JWT token manipulation - algorithm confusion attack (RS256 vs HS256). Attacker could forge valid tokens using the public key as HMAC secret.',
    rootCause: 'API accepted both RS256 and HS256 algorithms for JWT validation without proper algorithm restriction. Development team was unaware of algorithm confusion vulnerability class. Code was introduced 10 days prior in release v2.4.1.',
    iocs: 'Malformed JWT headers with alg:HS256\nUnusual API patterns: rapid profile enumeration\nSuspicious IP: 103.224.182.x (VPN exit node)\nTime window: 2024-12-21 to 2024-12-23',
    containmentActions: '1. Deployed WAF rule to block malformed JWT tokens\n2. Invalidated all existing JWT tokens, forcing re-authentication\n3. Implemented rate limiting on profile endpoints\n4. Blocked identified suspicious IPs',
    eradicationSteps: '1. Deployed emergency patch restricting JWT algorithm to RS256 only\n2. Added explicit algorithm validation in all JWT processing\n3. Implemented JWT library security audit\n4. Updated secure coding guidelines for authentication',
    recoverySteps: '1. Reset sessions for all potentially affected users\n2. Notified 47 potentially affected users via email\n3. Deployed comprehensive API security monitoring\n4. Conducted third-party security assessment of all authentication flows',
    lessonsLearned: '1. JWT algorithm confusion is a well-known vulnerability - need better security training\n2. Code review process should include security-focused review for auth changes\n3. Bug bounty program proved its value - researcher awarded $15,000\n4. SLA breach was due to delayed escalation - on-call process needs improvement\n5. Need automated security testing for common vulnerability classes',
    evidence: 'Bug Bounty Report: HackerOne-2024-87432.pdf\nVulnerable Code: api-auth-v2.4.1-diff.patch\nAPI Logs: api-access-logs-20241221-23.json.gz\nPatch Verification: pentest-report-post-patch.pdf'
  },
  // Open incident - recently detected
  {
    id: generateId(),
    title: 'Privilege Escalation Attempt - Production Server',
    description: 'Attempted privilege escalation detected on production application server. User account attempting to access admin functions. Account suspended pending investigation.',
    severity: 'high',
    status: 'open',
    category: 'Unauthorized Access',
    dateReported: hoursAgo(2),
    incidentStartTime: hoursAgo(3),
    detectionTime: hoursAgo(2),
    notificationTime: hoursAgo(1.5), // 30 minutes - SLA MET
    resolutionTime: null,
    assignedTo: 'David Park',
    reporter: 'SIEM Alert',
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(1)
  },
  // Low severity - resolved
  {
    id: generateId(),
    title: 'SSL Certificate Expiration Warning',
    description: 'Internal monitoring system SSL certificate approaching expiration. Certificate renewed and deployed. No service interruption.',
    severity: 'low',
    status: 'closed',
    category: 'Compliance Violation',
    dateReported: daysAgo(10),
    incidentStartTime: daysAgo(10),
    detectionTime: daysAgo(10),
    notificationTime: daysAgo(10), // Immediate - SLA MET
    resolutionTime: daysAgo(9),
    assignedTo: 'Emily Rodriguez',
    reporter: 'Monitoring System',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(9),
    // Investigation Report
    executiveSummary: 'Internal monitoring dashboard SSL certificate was detected 7 days before expiration by automated monitoring. Certificate was renewed and deployed with no service disruption. This incident highlighted a gap in our certificate lifecycle management process.',
    impactLevel: 'low',
    affectedSystems: 'Internal Monitoring Dashboard (monitor.internal.company.com)',
    affectedUsers: 'Internal IT and Security staff (approximately 15 users)',
    dataInvolved: 'None - certificate expiration would only affect availability, not confidentiality',
    attackVector: 'N/A - Not a security attack',
    rootCause: 'Certificate was manually provisioned 1 year ago and not added to certificate management system. No automated renewal was configured.',
    iocs: 'N/A',
    containmentActions: 'N/A - No containment required',
    eradicationSteps: '1. Generated new certificate via internal CA\n2. Deployed certificate to monitoring server\n3. Verified HTTPS connectivity',
    recoverySteps: '1. Added certificate to certificate management system\n2. Configured automated renewal alert at 30 days\n3. Documented certificate in CMDB',
    lessonsLearned: '1. All certificates should be tracked in certificate management system\n2. Consider implementing automated certificate renewal (ACME/Let\'s Encrypt for internal)\n3. Quarterly certificate inventory audit needed',
    evidence: 'Certificate Warning Alert: cert-alert-20241220.log\nNew Certificate: monitor-internal-2024.crt'
  }
]

export const sampleActions = [
  {
    id: generateId(),
    incidentId: null, // Will be linked to first incident
    title: 'Conduct forensic analysis of compromised credentials',
    description: 'Full forensic review of how credentials were compromised and what access was gained.',
    assignee: 'Sarah Chen',
    dueDate: daysAgo(-2), // 2 days from now
    priority: 'high',
    status: 'in_progress',
    createdAt: daysAgo(2)
  },
  {
    id: generateId(),
    incidentId: null, // Will be linked to second incident
    title: 'Notify affected customers per breach protocol',
    description: 'Send breach notification letters to all 1,200 affected customers as required by regulations.',
    assignee: 'Legal Team',
    dueDate: daysAgo(-5), // 5 days from now
    priority: 'high',
    status: 'pending',
    createdAt: daysAgo(5)
  },
  {
    id: generateId(),
    incidentId: null,
    title: 'Update firewall rules to block malicious IPs',
    description: 'Add identified malicious IP ranges to firewall blocklist.',
    assignee: 'Network Team',
    dueDate: daysAgo(1), // Overdue
    priority: 'high',
    status: 'pending',
    createdAt: daysAgo(3)
  },
  {
    id: generateId(),
    incidentId: null,
    title: 'Implement additional MFA controls',
    description: 'Roll out hardware tokens for privileged accounts.',
    assignee: 'IT Security',
    dueDate: daysAgo(-14),
    priority: 'medium',
    status: 'pending',
    createdAt: daysAgo(5)
  },
  {
    id: generateId(),
    incidentId: null,
    title: 'Complete incident post-mortem report',
    description: 'Document lessons learned and improvement recommendations.',
    assignee: 'Marcus Johnson',
    dueDate: daysAgo(-7),
    priority: 'medium',
    status: 'completed',
    createdAt: daysAgo(4)
  }
]

export const sampleCosts = [
  {
    id: generateId(),
    incidentId: null,
    description: 'External forensics consultant - Incident investigation',
    category: 'Investigation',
    amount: 15000,
    currency: 'USD',
    date: daysAgo(4),
    createdAt: daysAgo(4)
  },
  {
    id: generateId(),
    incidentId: null,
    description: 'Emergency patch development and deployment',
    category: 'Remediation',
    amount: 8500,
    currency: 'USD',
    date: daysAgo(6),
    createdAt: daysAgo(6)
  },
  {
    id: generateId(),
    incidentId: null,
    description: 'Customer notification mailing service',
    category: 'Customer Notification',
    amount: 3200,
    currency: 'USD',
    date: daysAgo(3),
    createdAt: daysAgo(3)
  },
  {
    id: generateId(),
    incidentId: null,
    description: 'Credit monitoring service for affected customers (1 year)',
    category: 'Credit Monitoring',
    amount: 24000,
    currency: 'USD',
    date: daysAgo(2),
    createdAt: daysAgo(2)
  },
  {
    id: generateId(),
    incidentId: null,
    description: 'Legal consultation - Regulatory compliance review',
    category: 'Legal Fees',
    amount: 12000,
    currency: 'USD',
    date: daysAgo(5),
    createdAt: daysAgo(5)
  },
  {
    id: generateId(),
    incidentId: null,
    description: 'Replacement hardware security modules',
    category: 'Hardware/Software',
    amount: 4500,
    currency: 'USD',
    date: daysAgo(8),
    createdAt: daysAgo(8)
  }
]

export const sampleLegalItems = [
  {
    id: generateId(),
    incidentId: null,
    type: 'notification',
    description: 'FedRAMP PMO Incident Notification',
    status: 'completed',
    dueDate: daysAgo(4),
    notes: 'Submitted within 1 hour of detection as required.',
    createdAt: daysAgo(5)
  },
  {
    id: generateId(),
    incidentId: null,
    type: 'notification',
    description: 'State Attorney General Breach Notification - California',
    status: 'in_progress',
    dueDate: daysAgo(-10),
    notes: 'Required within 45 days of discovery for CA residents.',
    createdAt: daysAgo(5)
  },
  {
    id: generateId(),
    incidentId: null,
    type: 'compliance',
    description: 'CISA Incident Report Submission',
    status: 'completed',
    dueDate: daysAgo(4),
    notes: 'Submitted to CISA as required for federal systems.',
    createdAt: daysAgo(5)
  },
  {
    id: generateId(),
    incidentId: null,
    type: 'consultation',
    description: 'External legal counsel review of breach response',
    status: 'in_progress',
    dueDate: daysAgo(-3),
    notes: 'Review of response procedures and liability exposure.',
    createdAt: daysAgo(4)
  },
  {
    id: generateId(),
    incidentId: null,
    type: 'compliance',
    description: 'Update System Security Plan (SSP)',
    status: 'pending',
    dueDate: daysAgo(-30),
    notes: 'SSP must be updated to reflect new controls implemented.',
    createdAt: daysAgo(3)
  }
]

export function loadSampleData() {
  // Link actions, costs, and legal items to incidents
  const incidents = [...sampleIncidents]
  const actions = sampleActions.map((action, index) => ({
    ...action,
    incidentId: incidents[index % incidents.length].id
  }))
  const costs = sampleCosts.map((cost, index) => ({
    ...cost,
    incidentId: incidents[(index + 1) % incidents.length].id
  }))
  const legalItems = sampleLegalItems.map((item, index) => ({
    ...item,
    incidentId: incidents[Math.min(index, 1)].id // Link to first two incidents (major ones)
  }))

  const data = {
    incidents,
    actions,
    costs,
    legalItems
  }

  // Save to localStorage
  localStorage.setItem('incidentResponseData', JSON.stringify(data))

  // Reload the page to pick up new data
  window.location.reload()
}
