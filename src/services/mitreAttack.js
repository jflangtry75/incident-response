// MITRE ATT&CK Framework Data
// Documentation: https://attack.mitre.org/

// Tactics (columns in the ATT&CK matrix)
export const tactics = [
  { id: 'TA0043', name: 'Reconnaissance', description: 'Gathering information to plan future operations' },
  { id: 'TA0042', name: 'Resource Development', description: 'Establishing resources to support operations' },
  { id: 'TA0001', name: 'Initial Access', description: 'Trying to get into your network' },
  { id: 'TA0002', name: 'Execution', description: 'Trying to run malicious code' },
  { id: 'TA0003', name: 'Persistence', description: 'Trying to maintain their foothold' },
  { id: 'TA0004', name: 'Privilege Escalation', description: 'Trying to gain higher-level permissions' },
  { id: 'TA0005', name: 'Defense Evasion', description: 'Trying to avoid being detected' },
  { id: 'TA0006', name: 'Credential Access', description: 'Trying to steal account names and passwords' },
  { id: 'TA0007', name: 'Discovery', description: 'Trying to figure out your environment' },
  { id: 'TA0008', name: 'Lateral Movement', description: 'Trying to move through your environment' },
  { id: 'TA0009', name: 'Collection', description: 'Trying to gather data of interest' },
  { id: 'TA0011', name: 'Command and Control', description: 'Trying to communicate with compromised systems' },
  { id: 'TA0010', name: 'Exfiltration', description: 'Trying to steal data' },
  { id: 'TA0040', name: 'Impact', description: 'Trying to manipulate, interrupt, or destroy systems and data' }
]

// Common techniques (subset of most relevant for incident response)
export const techniques = [
  // Initial Access
  { id: 'T1566', name: 'Phishing', tactic: 'TA0001', description: 'Sending phishing messages to gain access' },
  { id: 'T1566.001', name: 'Phishing: Spearphishing Attachment', tactic: 'TA0001', description: 'Spearphishing with malicious attachment' },
  { id: 'T1566.002', name: 'Phishing: Spearphishing Link', tactic: 'TA0001', description: 'Spearphishing with malicious link' },
  { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'TA0001', description: 'Exploiting vulnerabilities in internet-facing systems' },
  { id: 'T1133', name: 'External Remote Services', tactic: 'TA0001', description: 'Leveraging external remote services like VPN' },
  { id: 'T1078', name: 'Valid Accounts', tactic: 'TA0001', description: 'Using stolen or compromised credentials' },
  { id: 'T1199', name: 'Trusted Relationship', tactic: 'TA0001', description: 'Abusing trusted third-party relationships' },
  { id: 'T1195', name: 'Supply Chain Compromise', tactic: 'TA0001', description: 'Compromising software supply chain' },

  // Execution
  { id: 'T1059', name: 'Command and Scripting Interpreter', tactic: 'TA0002', description: 'Using command-line interfaces or scripts' },
  { id: 'T1059.001', name: 'PowerShell', tactic: 'TA0002', description: 'Using PowerShell for execution' },
  { id: 'T1059.003', name: 'Windows Command Shell', tactic: 'TA0002', description: 'Using cmd.exe' },
  { id: 'T1204', name: 'User Execution', tactic: 'TA0002', description: 'Relying on user to execute malicious content' },
  { id: 'T1203', name: 'Exploitation for Client Execution', tactic: 'TA0002', description: 'Exploiting software vulnerabilities for code execution' },

  // Persistence
  { id: 'T1547', name: 'Boot or Logon Autostart Execution', tactic: 'TA0003', description: 'Configuring system to run malware at startup' },
  { id: 'T1053', name: 'Scheduled Task/Job', tactic: 'TA0003', description: 'Using task scheduling for persistence' },
  { id: 'T1136', name: 'Create Account', tactic: 'TA0003', description: 'Creating accounts for persistence' },
  { id: 'T1098', name: 'Account Manipulation', tactic: 'TA0003', description: 'Modifying accounts to maintain access' },

  // Privilege Escalation
  { id: 'T1548', name: 'Abuse Elevation Control Mechanism', tactic: 'TA0004', description: 'Bypassing UAC or sudo' },
  { id: 'T1068', name: 'Exploitation for Privilege Escalation', tactic: 'TA0004', description: 'Exploiting vulnerabilities to escalate privileges' },

  // Defense Evasion
  { id: 'T1070', name: 'Indicator Removal', tactic: 'TA0005', description: 'Deleting or modifying artifacts to hide activity' },
  { id: 'T1562', name: 'Impair Defenses', tactic: 'TA0005', description: 'Disabling security tools' },
  { id: 'T1036', name: 'Masquerading', tactic: 'TA0005', description: 'Manipulating features to appear legitimate' },
  { id: 'T1027', name: 'Obfuscated Files or Information', tactic: 'TA0005', description: 'Making files difficult to analyze' },

  // Credential Access
  { id: 'T1110', name: 'Brute Force', tactic: 'TA0006', description: 'Attempting many passwords to guess credentials' },
  { id: 'T1555', name: 'Credentials from Password Stores', tactic: 'TA0006', description: 'Searching for stored credentials' },
  { id: 'T1003', name: 'OS Credential Dumping', tactic: 'TA0006', description: 'Dumping credentials from the OS' },
  { id: 'T1552', name: 'Unsecured Credentials', tactic: 'TA0006', description: 'Searching for insecurely stored credentials' },
  { id: 'T1558', name: 'Steal or Forge Kerberos Tickets', tactic: 'TA0006', description: 'Kerberoasting, Golden/Silver tickets' },

  // Discovery
  { id: 'T1087', name: 'Account Discovery', tactic: 'TA0007', description: 'Attempting to get a list of accounts' },
  { id: 'T1083', name: 'File and Directory Discovery', tactic: 'TA0007', description: 'Enumerating files and directories' },
  { id: 'T1046', name: 'Network Service Discovery', tactic: 'TA0007', description: 'Scanning for running services' },
  { id: 'T1018', name: 'Remote System Discovery', tactic: 'TA0007', description: 'Attempting to get a list of systems' },

  // Lateral Movement
  { id: 'T1021', name: 'Remote Services', tactic: 'TA0008', description: 'Using remote services to move laterally' },
  { id: 'T1021.001', name: 'Remote Desktop Protocol', tactic: 'TA0008', description: 'Using RDP for lateral movement' },
  { id: 'T1021.002', name: 'SMB/Windows Admin Shares', tactic: 'TA0008', description: 'Using SMB for lateral movement' },
  { id: 'T1570', name: 'Lateral Tool Transfer', tactic: 'TA0008', description: 'Transferring tools between systems' },

  // Collection
  { id: 'T1005', name: 'Data from Local System', tactic: 'TA0009', description: 'Searching local system for data' },
  { id: 'T1039', name: 'Data from Network Shared Drive', tactic: 'TA0009', description: 'Searching network shares for data' },
  { id: 'T1114', name: 'Email Collection', tactic: 'TA0009', description: 'Collecting email data' },
  { id: 'T1113', name: 'Screen Capture', tactic: 'TA0009', description: 'Taking screenshots' },

  // Command and Control
  { id: 'T1071', name: 'Application Layer Protocol', tactic: 'TA0011', description: 'Using application protocols for C2' },
  { id: 'T1071.001', name: 'Web Protocols', tactic: 'TA0011', description: 'Using HTTP/HTTPS for C2' },
  { id: 'T1105', name: 'Ingress Tool Transfer', tactic: 'TA0011', description: 'Transferring tools into the environment' },
  { id: 'T1572', name: 'Protocol Tunneling', tactic: 'TA0011', description: 'Tunneling C2 within other protocols' },
  { id: 'T1090', name: 'Proxy', tactic: 'TA0011', description: 'Using a proxy for C2' },

  // Exfiltration
  { id: 'T1041', name: 'Exfiltration Over C2 Channel', tactic: 'TA0010', description: 'Exfiltrating data over C2 channel' },
  { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', tactic: 'TA0010', description: 'Using different protocol for exfiltration' },
  { id: 'T1567', name: 'Exfiltration Over Web Service', tactic: 'TA0010', description: 'Using cloud storage for exfiltration' },

  // Impact
  { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'TA0040', description: 'Encrypting data (ransomware)' },
  { id: 'T1485', name: 'Data Destruction', tactic: 'TA0040', description: 'Destroying data' },
  { id: 'T1489', name: 'Service Stop', tactic: 'TA0040', description: 'Stopping services' },
  { id: 'T1490', name: 'Inhibit System Recovery', tactic: 'TA0040', description: 'Deleting backups, disabling recovery' },
  { id: 'T1491', name: 'Defacement', tactic: 'TA0040', description: 'Modifying visual content' }
]

// Get techniques by tactic
export function getTechniquesByTactic(tacticId) {
  return techniques.filter(t => t.tactic === tacticId)
}

// Get tactic by ID
export function getTacticById(tacticId) {
  return tactics.find(t => t.id === tacticId)
}

// Get technique by ID
export function getTechniqueById(techniqueId) {
  return techniques.find(t => t.id === techniqueId)
}

// Search techniques
export function searchTechniques(query) {
  const lower = query.toLowerCase()
  return techniques.filter(t =>
    t.id.toLowerCase().includes(lower) ||
    t.name.toLowerCase().includes(lower) ||
    t.description.toLowerCase().includes(lower)
  )
}

// Get MITRE ATT&CK URL for a technique
export function getMitreUrl(techniqueId) {
  const cleanId = techniqueId.replace('.', '/')
  return `https://attack.mitre.org/techniques/${cleanId}/`
}

// Suggest techniques based on incident category
export function suggestTechniques(category) {
  const suggestions = {
    'Phishing': ['T1566', 'T1566.001', 'T1566.002', 'T1204', 'T1078'],
    'Malware': ['T1059', 'T1204', 'T1547', 'T1027', 'T1071', 'T1105'],
    'Unauthorized Access': ['T1078', 'T1110', 'T1133', 'T1021', 'T1068'],
    'Data Loss': ['T1005', 'T1039', 'T1041', 'T1567', 'T1048'],
    'Security Breach': ['T1190', 'T1068', 'T1003', 'T1070', 'T1562'],
    'Compliance Violation': ['T1552', 'T1078', 'T1136'],
    'Ransomware': ['T1486', 'T1490', 'T1489', 'T1027', 'T1071']
  }

  const techniqueIds = suggestions[category] || []
  return techniqueIds.map(id => getTechniqueById(id)).filter(Boolean)
}
