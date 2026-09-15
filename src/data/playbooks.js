// Incident Response Playbooks
// Guided response steps for each incident type

export const incidentCategories = [
  { id: 'unauthorized_access', name: 'Unauthorized Access/Compromise', icon: 'ShieldOff' },
  { id: 'malware_ransomware', name: 'Malware/Ransomware', icon: 'Bug' },
  { id: 'data_breach', name: 'Data Breach/Exfiltration', icon: 'DatabaseZap' },
  { id: 'phishing', name: 'Phishing/Social Engineering', icon: 'Mail' },
  { id: 'ddos', name: 'DDoS Attack', icon: 'Wifi' },
  { id: 'insider_threat', name: 'Insider Threat', icon: 'UserX' },
  { id: 'cui_fci_disclosure', name: 'CUI/FCI Unauthorized Disclosure', icon: 'FileWarning' }
]

export const verdictOptions = [
  { id: 'undefined', name: 'Undefined', color: 'gray' },
  { id: 'true_positive', name: 'True Positive', color: 'red' },
  { id: 'false_positive', name: 'False Positive', color: 'green' }
]

export const playbooks = {
  unauthorized_access: {
    name: 'Unauthorized Access/Compromise',
    description: 'Response procedures for unauthorized access attempts or confirmed system compromise.',
    phases: [
      {
        name: 'Detection & Analysis',
        steps: [
          { id: 'ua_1', task: 'Identify affected systems and scope of access', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'ua_2', task: 'Determine method of unauthorized access (credentials, exploit, etc.)', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'ua_3', task: 'Review authentication logs for the affected accounts/systems', priority: 'high', owner: 'SOC Analyst' },
          { id: 'ua_4', task: 'Check for lateral movement indicators', priority: 'high', owner: 'SOC Analyst' },
          { id: 'ua_5', task: 'Identify timeline of unauthorized activity', priority: 'high', owner: 'SOC Analyst' },
          { id: 'ua_6', task: 'Determine if any data was accessed or exfiltrated', priority: 'critical', owner: 'SOC Analyst' }
        ]
      },
      {
        name: 'Containment',
        steps: [
          { id: 'ua_7', task: 'Disable compromised accounts immediately', priority: 'critical', owner: 'IT Admin' },
          { id: 'ua_8', task: 'Isolate affected systems from the network', priority: 'critical', owner: 'Network Team' },
          { id: 'ua_9', task: 'Block attacker IP addresses at firewall', priority: 'high', owner: 'Network Team' },
          { id: 'ua_10', task: 'Revoke active sessions for compromised accounts', priority: 'high', owner: 'IT Admin' },
          { id: 'ua_11', task: 'Preserve forensic evidence (memory dumps, logs)', priority: 'high', owner: 'Forensics' }
        ]
      },
      {
        name: 'Eradication',
        steps: [
          { id: 'ua_12', task: 'Reset passwords for all affected accounts', priority: 'critical', owner: 'IT Admin' },
          { id: 'ua_13', task: 'Remove any unauthorized accounts or access', priority: 'critical', owner: 'IT Admin' },
          { id: 'ua_14', task: 'Patch exploited vulnerabilities', priority: 'high', owner: 'IT Admin' },
          { id: 'ua_15', task: 'Review and update access control policies', priority: 'medium', owner: 'Security Team' },
          { id: 'ua_16', task: 'Rotate API keys and service account credentials', priority: 'high', owner: 'IT Admin' }
        ]
      },
      {
        name: 'Recovery',
        steps: [
          { id: 'ua_17', task: 'Restore systems from known clean backups if needed', priority: 'high', owner: 'IT Admin' },
          { id: 'ua_18', task: 'Implement enhanced monitoring on affected systems', priority: 'high', owner: 'SOC Analyst' },
          { id: 'ua_19', task: 'Require MFA for affected accounts', priority: 'high', owner: 'IT Admin' },
          { id: 'ua_20', task: 'Verify system integrity before returning to production', priority: 'high', owner: 'IT Admin' }
        ]
      },
      {
        name: 'Post-Incident',
        steps: [
          { id: 'ua_21', task: 'Document incident timeline and response actions', priority: 'medium', owner: 'Incident Lead' },
          { id: 'ua_22', task: 'Conduct lessons learned meeting', priority: 'medium', owner: 'Incident Lead' },
          { id: 'ua_23', task: 'Update detection rules based on attack patterns', priority: 'medium', owner: 'SOC Analyst' },
          { id: 'ua_24', task: 'Brief management on incident and remediation', priority: 'medium', owner: 'Incident Lead' }
        ]
      }
    ]
  },

  malware_ransomware: {
    name: 'Malware/Ransomware',
    description: 'Response procedures for malware infections including ransomware attacks.',
    phases: [
      {
        name: 'Detection & Analysis',
        steps: [
          { id: 'mr_1', task: 'Identify infected systems and malware variant', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'mr_2', task: 'Determine infection vector (email, web, USB, etc.)', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'mr_3', task: 'Collect malware samples for analysis', priority: 'high', owner: 'Malware Analyst' },
          { id: 'mr_4', task: 'Check for C2 communication indicators', priority: 'high', owner: 'SOC Analyst' },
          { id: 'mr_5', task: 'Assess scope of infection across the network', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'mr_6', task: 'Identify IOCs (hashes, domains, IPs)', priority: 'high', owner: 'Malware Analyst' }
        ]
      },
      {
        name: 'Containment',
        steps: [
          { id: 'mr_7', task: 'Isolate infected systems from network immediately', priority: 'critical', owner: 'Network Team' },
          { id: 'mr_8', task: 'Block C2 domains/IPs at firewall and DNS', priority: 'critical', owner: 'Network Team' },
          { id: 'mr_9', task: 'Disable network shares to prevent spread', priority: 'critical', owner: 'IT Admin' },
          { id: 'mr_10', task: 'Quarantine malicious emails if phishing-delivered', priority: 'high', owner: 'Email Admin' },
          { id: 'mr_11', task: 'Take forensic images of infected systems', priority: 'high', owner: 'Forensics' },
          { id: 'mr_12', task: 'Do NOT pay ransom - consult legal and management', priority: 'critical', owner: 'Incident Lead' }
        ]
      },
      {
        name: 'Eradication',
        steps: [
          { id: 'mr_13', task: 'Deploy updated AV/EDR signatures across all endpoints', priority: 'critical', owner: 'Security Team' },
          { id: 'mr_14', task: 'Remove malware from infected systems or reimage', priority: 'critical', owner: 'IT Admin' },
          { id: 'mr_15', task: 'Scan all systems for IOCs', priority: 'high', owner: 'SOC Analyst' },
          { id: 'mr_16', task: 'Reset credentials for users on infected systems', priority: 'high', owner: 'IT Admin' },
          { id: 'mr_17', task: 'Remove persistence mechanisms (registry, scheduled tasks)', priority: 'high', owner: 'IT Admin' }
        ]
      },
      {
        name: 'Recovery',
        steps: [
          { id: 'mr_18', task: 'Restore data from clean backups', priority: 'critical', owner: 'IT Admin' },
          { id: 'mr_19', task: 'Verify backup integrity before restoration', priority: 'critical', owner: 'IT Admin' },
          { id: 'mr_20', task: 'Rebuild systems from known clean images', priority: 'high', owner: 'IT Admin' },
          { id: 'mr_21', task: 'Implement additional endpoint protections', priority: 'high', owner: 'Security Team' },
          { id: 'mr_22', task: 'Monitor recovered systems closely for reinfection', priority: 'high', owner: 'SOC Analyst' }
        ]
      },
      {
        name: 'Post-Incident',
        steps: [
          { id: 'mr_23', task: 'Submit malware samples to threat intel platforms', priority: 'medium', owner: 'Malware Analyst' },
          { id: 'mr_24', task: 'Update email filtering rules', priority: 'medium', owner: 'Email Admin' },
          { id: 'mr_25', task: 'Conduct user awareness training on infection vector', priority: 'medium', owner: 'Security Team' },
          { id: 'mr_26', task: 'Review and improve backup procedures', priority: 'medium', owner: 'IT Admin' }
        ]
      }
    ]
  },

  data_breach: {
    name: 'Data Breach/Exfiltration',
    description: 'Response procedures for confirmed or suspected data breaches and exfiltration events.',
    phases: [
      {
        name: 'Detection & Analysis',
        steps: [
          { id: 'db_1', task: 'Identify what data was accessed or exfiltrated', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'db_2', task: 'Determine the volume of affected records', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'db_3', task: 'Identify data classification (PII, PHI, CUI, FCI)', priority: 'critical', owner: 'Data Owner' },
          { id: 'db_4', task: 'Trace exfiltration method and destination', priority: 'high', owner: 'SOC Analyst' },
          { id: 'db_5', task: 'Identify affected individuals or entities', priority: 'high', owner: 'Data Owner' },
          { id: 'db_6', task: 'Preserve all evidence and logs', priority: 'critical', owner: 'Forensics' }
        ]
      },
      {
        name: 'Containment',
        steps: [
          { id: 'db_7', task: 'Block exfiltration channels immediately', priority: 'critical', owner: 'Network Team' },
          { id: 'db_8', task: 'Revoke access for compromised accounts', priority: 'critical', owner: 'IT Admin' },
          { id: 'db_9', task: 'Isolate affected data stores', priority: 'critical', owner: 'DBA' },
          { id: 'db_10', task: 'Enable enhanced DLP monitoring', priority: 'high', owner: 'Security Team' },
          { id: 'db_11', task: 'Engage legal counsel', priority: 'critical', owner: 'Incident Lead' },
          { id: 'db_12', task: 'Notify executive leadership', priority: 'critical', owner: 'Incident Lead' }
        ]
      },
      {
        name: 'Eradication',
        steps: [
          { id: 'db_13', task: 'Close the vulnerability or access path used', priority: 'critical', owner: 'Security Team' },
          { id: 'db_14', task: 'Revoke and rotate all affected credentials', priority: 'high', owner: 'IT Admin' },
          { id: 'db_15', task: 'Implement additional access controls on sensitive data', priority: 'high', owner: 'Security Team' },
          { id: 'db_16', task: 'Audit all access to affected data stores', priority: 'high', owner: 'SOC Analyst' }
        ]
      },
      {
        name: 'Notification & Compliance',
        steps: [
          { id: 'db_17', task: 'Notify FedRAMP PMO within 1 hour (if applicable)', priority: 'critical', owner: 'Compliance' },
          { id: 'db_18', task: 'File CISA incident report (if required)', priority: 'critical', owner: 'Compliance' },
          { id: 'db_19', task: 'Determine state breach notification requirements', priority: 'high', owner: 'Legal' },
          { id: 'db_20', task: 'Prepare affected individual notification letters', priority: 'high', owner: 'Legal' },
          { id: 'db_21', task: 'Notify affected individuals within required timeframe', priority: 'high', owner: 'Compliance' },
          { id: 'db_22', task: 'Offer credit monitoring if PII involved', priority: 'medium', owner: 'Legal' }
        ]
      },
      {
        name: 'Post-Incident',
        steps: [
          { id: 'db_23', task: 'Complete root cause analysis', priority: 'high', owner: 'Incident Lead' },
          { id: 'db_24', task: 'Implement data classification improvements', priority: 'medium', owner: 'Data Owner' },
          { id: 'db_25', task: 'Review and enhance DLP policies', priority: 'medium', owner: 'Security Team' },
          { id: 'db_26', task: 'Update incident response procedures', priority: 'medium', owner: 'Incident Lead' }
        ]
      }
    ]
  },

  phishing: {
    name: 'Phishing/Social Engineering',
    description: 'Response procedures for phishing campaigns and social engineering attacks.',
    phases: [
      {
        name: 'Detection & Analysis',
        steps: [
          { id: 'ph_1', task: 'Identify the phishing email/message and extract IOCs', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'ph_2', task: 'Determine number of recipients', priority: 'high', owner: 'Email Admin' },
          { id: 'ph_3', task: 'Identify users who clicked links or opened attachments', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'ph_4', task: 'Identify users who submitted credentials', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'ph_5', task: 'Analyze malicious payload if attachment-based', priority: 'high', owner: 'Malware Analyst' },
          { id: 'ph_6', task: 'Check for credential harvesting site activity', priority: 'high', owner: 'SOC Analyst' }
        ]
      },
      {
        name: 'Containment',
        steps: [
          { id: 'ph_7', task: 'Remove/quarantine phishing emails from all mailboxes', priority: 'critical', owner: 'Email Admin' },
          { id: 'ph_8', task: 'Block sender domain/IP at email gateway', priority: 'critical', owner: 'Email Admin' },
          { id: 'ph_9', task: 'Block malicious URLs at web proxy', priority: 'critical', owner: 'Network Team' },
          { id: 'ph_10', task: 'Reset passwords for users who submitted credentials', priority: 'critical', owner: 'IT Admin' },
          { id: 'ph_11', task: 'Terminate active sessions for compromised accounts', priority: 'critical', owner: 'IT Admin' },
          { id: 'ph_12', task: 'Send company-wide alert about the campaign', priority: 'high', owner: 'Communications' }
        ]
      },
      {
        name: 'Eradication',
        steps: [
          { id: 'ph_13', task: 'Scan endpoints of users who clicked for malware', priority: 'high', owner: 'Security Team' },
          { id: 'ph_14', task: 'Update email filtering rules with new IOCs', priority: 'high', owner: 'Email Admin' },
          { id: 'ph_15', task: 'Add phishing domain to blocklists', priority: 'high', owner: 'Security Team' },
          { id: 'ph_16', task: 'Review MFA status for affected accounts', priority: 'high', owner: 'IT Admin' }
        ]
      },
      {
        name: 'Recovery',
        steps: [
          { id: 'ph_17', task: 'Verify no unauthorized access occurred', priority: 'high', owner: 'SOC Analyst' },
          { id: 'ph_18', task: 'Enable MFA for accounts that didn\'t have it', priority: 'high', owner: 'IT Admin' },
          { id: 'ph_19', task: 'Monitor affected accounts for suspicious activity', priority: 'high', owner: 'SOC Analyst' },
          { id: 'ph_20', task: 'Clear affected users to resume normal operations', priority: 'medium', owner: 'Incident Lead' }
        ]
      },
      {
        name: 'Post-Incident',
        steps: [
          { id: 'ph_21', task: 'Report phishing site to hosting provider', priority: 'medium', owner: 'SOC Analyst' },
          { id: 'ph_22', task: 'Share IOCs with threat intel community', priority: 'low', owner: 'SOC Analyst' },
          { id: 'ph_23', task: 'Conduct targeted training for affected users', priority: 'medium', owner: 'Security Team' },
          { id: 'ph_24', task: 'Review and improve email security controls', priority: 'medium', owner: 'Email Admin' }
        ]
      }
    ]
  },

  ddos: {
    name: 'DDoS Attack',
    description: 'Response procedures for Distributed Denial of Service attacks.',
    phases: [
      {
        name: 'Detection & Analysis',
        steps: [
          { id: 'dd_1', task: 'Confirm DDoS attack vs legitimate traffic spike', priority: 'critical', owner: 'NOC' },
          { id: 'dd_2', task: 'Identify attack type (volumetric, protocol, application)', priority: 'high', owner: 'Network Team' },
          { id: 'dd_3', task: 'Identify targeted services/infrastructure', priority: 'critical', owner: 'NOC' },
          { id: 'dd_4', task: 'Collect attack traffic samples and source IPs', priority: 'high', owner: 'Network Team' },
          { id: 'dd_5', task: 'Assess business impact of affected services', priority: 'high', owner: 'Incident Lead' },
          { id: 'dd_6', task: 'Check if attack is a diversion for other activity', priority: 'high', owner: 'SOC Analyst' }
        ]
      },
      {
        name: 'Containment',
        steps: [
          { id: 'dd_7', task: 'Activate DDoS mitigation service (if available)', priority: 'critical', owner: 'Network Team' },
          { id: 'dd_8', task: 'Contact ISP for upstream filtering', priority: 'critical', owner: 'Network Team' },
          { id: 'dd_9', task: 'Implement rate limiting on affected services', priority: 'high', owner: 'Network Team' },
          { id: 'dd_10', task: 'Block attacking IP ranges at perimeter', priority: 'high', owner: 'Network Team' },
          { id: 'dd_11', task: 'Enable geo-blocking if attack is region-specific', priority: 'medium', owner: 'Network Team' },
          { id: 'dd_12', task: 'Scale infrastructure if cloud-based', priority: 'high', owner: 'Cloud Team' }
        ]
      },
      {
        name: 'Eradication',
        steps: [
          { id: 'dd_13', task: 'Fine-tune filtering rules based on attack patterns', priority: 'high', owner: 'Network Team' },
          { id: 'dd_14', task: 'Update WAF rules for application-layer attacks', priority: 'high', owner: 'Security Team' },
          { id: 'dd_15', task: 'Implement additional CDN caching', priority: 'medium', owner: 'Web Team' }
        ]
      },
      {
        name: 'Recovery',
        steps: [
          { id: 'dd_16', task: 'Verify services are restored and accessible', priority: 'critical', owner: 'NOC' },
          { id: 'dd_17', task: 'Monitor for attack resumption', priority: 'high', owner: 'NOC' },
          { id: 'dd_18', task: 'Gradually remove emergency filtering rules', priority: 'medium', owner: 'Network Team' },
          { id: 'dd_19', task: 'Communicate service restoration to stakeholders', priority: 'high', owner: 'Communications' }
        ]
      },
      {
        name: 'Post-Incident',
        steps: [
          { id: 'dd_20', task: 'Document attack vectors and mitigation effectiveness', priority: 'medium', owner: 'Network Team' },
          { id: 'dd_21', task: 'Review DDoS protection capabilities', priority: 'medium', owner: 'Security Team' },
          { id: 'dd_22', task: 'Consider enhanced DDoS mitigation services', priority: 'medium', owner: 'Security Team' },
          { id: 'dd_23', task: 'Report to law enforcement if significant', priority: 'low', owner: 'Legal' }
        ]
      }
    ]
  },

  insider_threat: {
    name: 'Insider Threat',
    description: 'Response procedures for malicious or negligent insider activities.',
    phases: [
      {
        name: 'Detection & Analysis',
        steps: [
          { id: 'it_1', task: 'Identify the suspected insider and their access level', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'it_2', task: 'Review user activity logs and UEBA alerts', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'it_3', task: 'Determine if activity is malicious or negligent', priority: 'high', owner: 'Incident Lead' },
          { id: 'it_4', task: 'Identify accessed or exfiltrated data', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'it_5', task: 'Review email and file transfer activity', priority: 'high', owner: 'SOC Analyst' },
          { id: 'it_6', task: 'Engage HR and Legal early in investigation', priority: 'critical', owner: 'Incident Lead' }
        ]
      },
      {
        name: 'Containment',
        steps: [
          { id: 'it_7', task: 'Coordinate with HR before taking action', priority: 'critical', owner: 'Incident Lead' },
          { id: 'it_8', task: 'Preserve evidence before any account changes', priority: 'critical', owner: 'Forensics' },
          { id: 'it_9', task: 'Disable user account access (coordinate with HR)', priority: 'critical', owner: 'IT Admin' },
          { id: 'it_10', task: 'Revoke physical access badges', priority: 'high', owner: 'Physical Security' },
          { id: 'it_11', task: 'Collect corporate devices', priority: 'high', owner: 'IT Admin' },
          { id: 'it_12', task: 'Block personal email/cloud storage access', priority: 'high', owner: 'Network Team' }
        ]
      },
      {
        name: 'Investigation',
        steps: [
          { id: 'it_13', task: 'Forensically image user devices', priority: 'high', owner: 'Forensics' },
          { id: 'it_14', task: 'Review all data access for past 90 days', priority: 'high', owner: 'SOC Analyst' },
          { id: 'it_15', task: 'Interview witnesses if appropriate', priority: 'medium', owner: 'HR' },
          { id: 'it_16', task: 'Document chain of custody for all evidence', priority: 'critical', owner: 'Forensics' },
          { id: 'it_17', task: 'Coordinate with Legal on potential criminal referral', priority: 'high', owner: 'Legal' }
        ]
      },
      {
        name: 'Remediation',
        steps: [
          { id: 'it_18', task: 'Change shared credentials the user had access to', priority: 'high', owner: 'IT Admin' },
          { id: 'it_19', task: 'Review and revoke third-party access', priority: 'high', owner: 'IT Admin' },
          { id: 'it_20', task: 'Audit access controls for similar roles', priority: 'medium', owner: 'Security Team' },
          { id: 'it_21', task: 'Implement separation of duties if lacking', priority: 'medium', owner: 'Security Team' }
        ]
      },
      {
        name: 'Post-Incident',
        steps: [
          { id: 'it_22', task: 'Complete investigation report for HR/Legal', priority: 'high', owner: 'Incident Lead' },
          { id: 'it_23', task: 'Review hiring and termination procedures', priority: 'medium', owner: 'HR' },
          { id: 'it_24', task: 'Enhance monitoring for similar behavior patterns', priority: 'medium', owner: 'SOC Analyst' },
          { id: 'it_25', task: 'Conduct insider threat awareness training', priority: 'low', owner: 'Security Team' }
        ]
      }
    ]
  },

  cui_fci_disclosure: {
    name: 'CUI/FCI Unauthorized Disclosure',
    description: 'Response procedures for unauthorized disclosure of Controlled Unclassified Information (CUI) or Federal Contract Information (FCI).',
    phases: [
      {
        name: 'Detection & Analysis',
        steps: [
          { id: 'cf_1', task: 'Identify the specific CUI/FCI data disclosed', priority: 'critical', owner: 'Data Owner' },
          { id: 'cf_2', task: 'Determine classification level and handling requirements', priority: 'critical', owner: 'Compliance' },
          { id: 'cf_3', task: 'Identify how the disclosure occurred', priority: 'critical', owner: 'SOC Analyst' },
          { id: 'cf_4', task: 'Determine who received the unauthorized disclosure', priority: 'critical', owner: 'Incident Lead' },
          { id: 'cf_5', task: 'Assess potential impact to national security/contracts', priority: 'critical', owner: 'Compliance' },
          { id: 'cf_6', task: 'Identify all individuals involved', priority: 'high', owner: 'SOC Analyst' }
        ]
      },
      {
        name: 'Containment',
        steps: [
          { id: 'cf_7', task: 'Stop ongoing disclosure immediately', priority: 'critical', owner: 'IT Admin' },
          { id: 'cf_8', task: 'Request deletion from unauthorized recipients', priority: 'critical', owner: 'Incident Lead' },
          { id: 'cf_9', task: 'Block further access to the disclosed data', priority: 'critical', owner: 'IT Admin' },
          { id: 'cf_10', task: 'Preserve all evidence and communications', priority: 'critical', owner: 'Forensics' },
          { id: 'cf_11', task: 'Notify contracting officer immediately', priority: 'critical', owner: 'Contracts' },
          { id: 'cf_12', task: 'Engage legal counsel', priority: 'critical', owner: 'Legal' }
        ]
      },
      {
        name: 'Notification & Reporting',
        steps: [
          { id: 'cf_13', task: 'Report to DIBNet within 72 hours (DFARS 7012)', priority: 'critical', owner: 'Compliance' },
          { id: 'cf_14', task: 'Notify agency contracting officer', priority: 'critical', owner: 'Contracts' },
          { id: 'cf_15', task: 'Submit malicious software to DC3', priority: 'high', owner: 'Security Team' },
          { id: 'cf_16', task: 'Prepare incident report for government', priority: 'critical', owner: 'Compliance' },
          { id: 'cf_17', task: 'Document all notification timestamps', priority: 'critical', owner: 'Compliance' }
        ]
      },
      {
        name: 'Remediation',
        steps: [
          { id: 'cf_18', task: 'Implement additional CUI/FCI access controls', priority: 'high', owner: 'Security Team' },
          { id: 'cf_19', task: 'Review and update data handling procedures', priority: 'high', owner: 'Compliance' },
          { id: 'cf_20', task: 'Conduct additional CUI/FCI training for personnel', priority: 'high', owner: 'Compliance' },
          { id: 'cf_21', task: 'Audit CUI/FCI data locations and access', priority: 'high', owner: 'Data Owner' }
        ]
      },
      {
        name: 'Post-Incident',
        steps: [
          { id: 'cf_22', task: 'Complete required government reporting', priority: 'critical', owner: 'Compliance' },
          { id: 'cf_23', task: 'Cooperate with government investigation', priority: 'critical', owner: 'Legal' },
          { id: 'cf_24', task: 'Update System Security Plan if needed', priority: 'high', owner: 'Compliance' },
          { id: 'cf_25', task: 'Review CMMC/NIST 800-171 control implementation', priority: 'high', owner: 'Compliance' },
          { id: 'cf_26', task: 'Document lessons learned and procedure updates', priority: 'medium', owner: 'Incident Lead' }
        ]
      }
    ]
  }
}

// Get playbook by category
export function getPlaybook(categoryId) {
  return playbooks[categoryId] || null
}

// Get all category options for dropdown
export function getCategoryOptions() {
  return incidentCategories.map(c => ({
    value: c.id,
    label: c.name
  }))
}
