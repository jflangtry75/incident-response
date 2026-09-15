import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'
import { formatDate, formatDuration, checkSLAStatus, calculateTTD, calculateTTR } from './helpers'
import { companyConfig } from '../config/company'

// Helper to format multiline text
const formatMultiline = (text) => {
  if (!text) return 'N/A'
  return text.split('\n').map(line => line.trim()).filter(Boolean)
}

// Severity labels
const severityLabels = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
}

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
}

// ============================================
// JSON EXPORT
// ============================================
export function exportToJSON(incident, actions = [], costs = [], legalItems = []) {
  const report = {
    exportDate: new Date().toISOString(),
    exportType: 'Incident Response Report',
    company: companyConfig.name,
    incident: {
      ...incident,
      slaStatus: checkSLAStatus(incident.detectionTime, incident.notificationTime, 60),
      metrics: {
        timeToDetect: calculateTTD(incident.incidentStartTime, incident.detectionTime),
        timeToResolve: calculateTTR(incident.detectionTime, incident.resolutionTime)
      }
    },
    relatedActions: actions,
    relatedCosts: costs,
    relatedLegalItems: legalItems
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  saveAs(blob, `${companyConfig.name.replace(/\s+/g, '-')}-incident-${incident.id}.json`)
}

// ============================================
// PDF EXPORT
// ============================================
export function exportToPDF(incident, actions = [], costs = [], legalItems = []) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  const addPageIfNeeded = (requiredSpace = 30) => {
    if (yPos + requiredSpace > 270) {
      doc.addPage()
      yPos = 20
    }
  }

  const addSection = (title, content) => {
    addPageIfNeeded(40)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(31, 41, 55)
    doc.text(title, 14, yPos)
    yPos += 7

    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(75, 85, 99)

    if (Array.isArray(content)) {
      content.forEach(line => {
        addPageIfNeeded(10)
        const lines = doc.splitTextToSize(line, pageWidth - 28)
        doc.text(lines, 14, yPos)
        yPos += lines.length * 5 + 2
      })
    } else {
      const lines = doc.splitTextToSize(content || 'N/A', pageWidth - 28)
      doc.text(lines, 14, yPos)
      yPos += lines.length * 5
    }
    yPos += 5
  }

  // Header
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageWidth, 45, 'F')

  // Add logo if available
  let logoOffset = 14
  if (companyConfig.logo) {
    try {
      doc.addImage(companyConfig.logo, 'PNG', 14, 8, 30, 30)
      logoOffset = 50
    } catch (e) {
      console.warn('Could not load logo:', e)
    }
  }

  // Company name and report title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text(companyConfig.name, logoOffset, 14)

  doc.setFontSize(18)
  doc.text(companyConfig.reportTitle || 'INCIDENT RESPONSE REPORT', logoOffset, 26)

  doc.setFontSize(9)
  doc.setFont(undefined, 'normal')
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, logoOffset, 34)
  doc.text(`Incident ID: ${incident.id}`, logoOffset, 40)

  yPos = 55

  // Incident Overview
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(31, 41, 55)
  doc.text('Incident Overview', 14, yPos)
  yPos += 10

  // Title
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  const titleLines = doc.splitTextToSize(incident.title, pageWidth - 28)
  doc.text(titleLines, 14, yPos)
  yPos += titleLines.length * 7 + 5

  // Status badges table
  autoTable(doc, {
    startY: yPos,
    head: [['Severity', 'Status', 'Category', 'Assigned To']],
    body: [[
      severityLabels[incident.severity] || incident.severity,
      statusLabels[incident.status] || incident.status,
      incident.category || 'N/A',
      incident.assignedTo || 'Unassigned'
    ]],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    margin: { left: 14, right: 14 }
  })
  yPos = doc.lastAutoTable.finalY + 10

  // Description
  addSection('Description', incident.description)

  // Timeline Section
  addPageIfNeeded(60)
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(31, 41, 55)
  doc.text('Timeline & Metrics', 14, yPos)
  yPos += 10

  const slaStatus = checkSLAStatus(incident.detectionTime, incident.notificationTime, 60)
  const ttd = calculateTTD(incident.incidentStartTime, incident.detectionTime)
  const ttr = calculateTTR(incident.detectionTime, incident.resolutionTime)

  autoTable(doc, {
    startY: yPos,
    head: [['Event', 'Date/Time', 'Metric']],
    body: [
      ['Incident Start', incident.incidentStartTime ? formatDate(incident.incidentStartTime) : 'N/A', ''],
      ['Detection', incident.detectionTime ? formatDate(incident.detectionTime) : 'N/A', ttd ? `TTD: ${formatDuration(ttd)}` : ''],
      ['Notification', incident.notificationTime ? formatDate(incident.notificationTime) : 'N/A', slaStatus.status !== 'pending' ? slaStatus.message : 'Pending'],
      ['Resolution', incident.resolutionTime ? formatDate(incident.resolutionTime) : 'N/A', ttr ? `TTR: ${formatDuration(ttr)}` : '']
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    margin: { left: 14, right: 14 }
  })
  yPos = doc.lastAutoTable.finalY + 10

  // SLA Compliance Box
  addPageIfNeeded(30)
  const slaColor = slaStatus.status === 'met' ? [34, 197, 94] : slaStatus.status === 'breached' ? [239, 68, 68] : [234, 179, 8]
  doc.setFillColor(...slaColor)
  doc.roundedRect(14, yPos, pageWidth - 28, 20, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  const slaText = `FedRAMP SLA Status: ${slaStatus.status.toUpperCase()} - ${slaStatus.message}`
  doc.text(slaText, 20, yPos + 13)
  yPos += 30

  // Investigation Report
  if (incident.executiveSummary || incident.rootCause || incident.attackVector) {
    addPageIfNeeded(30)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(31, 41, 55)
    doc.text('Investigation Report', 14, yPos)
    yPos += 10

    if (incident.executiveSummary) {
      addSection('Executive Summary', incident.executiveSummary)
    }

    // Impact Assessment
    if (incident.impactLevel || incident.affectedSystems || incident.affectedUsers || incident.dataInvolved) {
      addPageIfNeeded(20)
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('Impact Assessment', 14, yPos)
      yPos += 8

      if (incident.impactLevel) addSection('Impact Level', incident.impactLevel.toUpperCase())
      if (incident.affectedSystems) addSection('Affected Systems', incident.affectedSystems)
      if (incident.affectedUsers) addSection('Affected Users', incident.affectedUsers)
      if (incident.dataInvolved) addSection('Data Involved', incident.dataInvolved)
    }

    // Root Cause Analysis
    if (incident.attackVector || incident.rootCause || incident.iocs) {
      addPageIfNeeded(20)
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('Root Cause Analysis', 14, yPos)
      yPos += 8

      if (incident.attackVector) addSection('Attack Vector', incident.attackVector)
      if (incident.rootCause) addSection('Root Cause', incident.rootCause)
      if (incident.iocs) addSection('Indicators of Compromise (IOCs)', formatMultiline(incident.iocs))
    }

    // Response Actions
    if (incident.containmentActions || incident.eradicationSteps || incident.recoverySteps) {
      addPageIfNeeded(20)
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('Response Actions', 14, yPos)
      yPos += 8

      if (incident.containmentActions) addSection('Containment Actions', formatMultiline(incident.containmentActions))
      if (incident.eradicationSteps) addSection('Eradication Steps', formatMultiline(incident.eradicationSteps))
      if (incident.recoverySteps) addSection('Recovery Steps', formatMultiline(incident.recoverySteps))
    }

    // Post-Incident
    if (incident.lessonsLearned || incident.evidence) {
      addPageIfNeeded(20)
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text('Post-Incident', 14, yPos)
      yPos += 8

      if (incident.lessonsLearned) addSection('Lessons Learned', formatMultiline(incident.lessonsLearned))
      if (incident.evidence) addSection('Evidence & Artifacts', formatMultiline(incident.evidence))
    }
  }

  // Related Actions
  if (actions.length > 0) {
    addPageIfNeeded(40)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(31, 41, 55)
    doc.text('Related Action Items', 14, yPos)
    yPos += 10

    autoTable(doc, {
      startY: yPos,
      head: [['Action', 'Assignee', 'Due Date', 'Status']],
      body: actions.map(a => [
        a.title,
        a.assignee || 'Unassigned',
        a.dueDate ? formatDate(a.dueDate) : 'N/A',
        a.status
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 14, right: 14 },
      columnStyles: { 0: { cellWidth: 80 } }
    })
    yPos = doc.lastAutoTable.finalY + 10
  }

  // Related Costs
  if (costs.length > 0) {
    addPageIfNeeded(40)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(31, 41, 55)
    doc.text('Cost Tracking', 14, yPos)
    yPos += 10

    const totalCost = costs.reduce((sum, c) => sum + (c.amount || 0), 0)

    autoTable(doc, {
      startY: yPos,
      head: [['Description', 'Category', 'Amount']],
      body: [
        ...costs.map(c => [c.description, c.category, `$${c.amount?.toLocaleString() || 0}`]),
        [{ content: 'TOTAL', styles: { fontStyle: 'bold' } }, '', { content: `$${totalCost.toLocaleString()}`, styles: { fontStyle: 'bold' } }]
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 14, right: 14 }
    })
    yPos = doc.lastAutoTable.finalY + 10
  }

  // Legal Items
  if (legalItems.length > 0) {
    addPageIfNeeded(40)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(31, 41, 55)
    doc.text('Legal & Compliance Items', 14, yPos)
    yPos += 10

    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Type', 'Due Date', 'Status']],
      body: legalItems.map(l => [
        l.description,
        l.type,
        l.dueDate ? formatDate(l.dueDate) : 'N/A',
        l.status
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 14, right: 14 },
      columnStyles: { 0: { cellWidth: 80 } }
    })
  }

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' })
    doc.text(companyConfig.reportFooter || 'CONFIDENTIAL - Incident Response Report', 14, 290)
    doc.text(companyConfig.name, pageWidth - 14, 290, { align: 'right' })
  }

  doc.save(`${companyConfig.name.replace(/\s+/g, '-')}-incident-${incident.id}.pdf`)
}

// ============================================
// WORD/DOCX EXPORT
// ============================================
export async function exportToWord(incident, actions = [], costs = [], legalItems = []) {
  const slaStatus = checkSLAStatus(incident.detectionTime, incident.notificationTime, 60)
  const ttd = calculateTTD(incident.incidentStartTime, incident.detectionTime)
  const ttr = calculateTTR(incident.detectionTime, incident.resolutionTime)

  const createHeading = (text, level = HeadingLevel.HEADING_1) => {
    return new Paragraph({
      text,
      heading: level,
      spacing: { before: 400, after: 200 }
    })
  }

  const createParagraph = (text, bold = false) => {
    return new Paragraph({
      children: [new TextRun({ text: text || 'N/A', bold })],
      spacing: { after: 120 }
    })
  }

  const createLabelValue = (label, value) => {
    return new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true }),
        new TextRun({ text: value || 'N/A' })
      ],
      spacing: { after: 120 }
    })
  }

  const createBulletList = (text) => {
    if (!text) return [createParagraph('N/A')]
    return text.split('\n').filter(Boolean).map(line =>
      new Paragraph({
        text: line.trim(),
        bullet: { level: 0 },
        spacing: { after: 60 }
      })
    )
  }

  const sections = []

  // Title Page Content
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: companyConfig.name, bold: true, size: 28, color: '2563EB' })],
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [new TextRun({ text: companyConfig.reportTitle || 'INCIDENT RESPONSE REPORT', bold: true, size: 48 })],
      spacing: { after: 200 }
    }),
    createParagraph(`Generated: ${formatDate(new Date().toISOString())}`),
    createParagraph(`Incident ID: ${incident.id}`),
    new Paragraph({ spacing: { after: 400 } })
  )

  // Incident Overview
  sections.push(
    createHeading('Incident Overview'),
    new Paragraph({
      children: [new TextRun({ text: incident.title, bold: true, size: 28 })],
      spacing: { after: 200 }
    }),
    createLabelValue('Severity', severityLabels[incident.severity] || incident.severity),
    createLabelValue('Status', statusLabels[incident.status] || incident.status),
    createLabelValue('Category', incident.category),
    createLabelValue('Assigned To', incident.assignedTo),
    createLabelValue('Reporter', incident.reporter),
    createHeading('Description', HeadingLevel.HEADING_2),
    createParagraph(incident.description)
  )

  // Timeline & Metrics
  sections.push(
    createHeading('Timeline & Metrics'),
    createLabelValue('Incident Start', incident.incidentStartTime ? formatDate(incident.incidentStartTime) : 'N/A'),
    createLabelValue('Detection Time', incident.detectionTime ? formatDate(incident.detectionTime) : 'N/A'),
    createLabelValue('Time to Detect (TTD)', ttd ? formatDuration(ttd) : 'N/A'),
    createLabelValue('Notification Time', incident.notificationTime ? formatDate(incident.notificationTime) : 'N/A'),
    createLabelValue('Resolution Time', incident.resolutionTime ? formatDate(incident.resolutionTime) : 'N/A'),
    createLabelValue('Time to Resolve (TTR)', ttr ? formatDuration(ttr) : 'N/A'),
    new Paragraph({ spacing: { after: 200 } }),
    new Paragraph({
      children: [
        new TextRun({ text: 'FedRAMP SLA Status: ', bold: true }),
        new TextRun({
          text: `${slaStatus.status.toUpperCase()} - ${slaStatus.message}`,
          bold: true,
          color: slaStatus.status === 'met' ? '22C55E' : slaStatus.status === 'breached' ? 'EF4444' : 'EAB308'
        })
      ],
      spacing: { after: 200 }
    })
  )

  // Investigation Report
  if (incident.executiveSummary || incident.rootCause || incident.attackVector) {
    sections.push(createHeading('Investigation Report'))

    if (incident.executiveSummary) {
      sections.push(
        createHeading('Executive Summary', HeadingLevel.HEADING_2),
        createParagraph(incident.executiveSummary)
      )
    }

    // Impact Assessment
    if (incident.impactLevel || incident.affectedSystems || incident.affectedUsers || incident.dataInvolved) {
      sections.push(createHeading('Impact Assessment', HeadingLevel.HEADING_2))
      if (incident.impactLevel) sections.push(createLabelValue('Impact Level', incident.impactLevel.toUpperCase()))
      if (incident.affectedSystems) sections.push(createLabelValue('Affected Systems', incident.affectedSystems))
      if (incident.affectedUsers) sections.push(createLabelValue('Affected Users', incident.affectedUsers))
      if (incident.dataInvolved) sections.push(createLabelValue('Data Involved', incident.dataInvolved))
    }

    // Root Cause Analysis
    if (incident.attackVector || incident.rootCause || incident.iocs) {
      sections.push(createHeading('Root Cause Analysis', HeadingLevel.HEADING_2))
      if (incident.attackVector) sections.push(createLabelValue('Attack Vector', incident.attackVector))
      if (incident.rootCause) sections.push(createLabelValue('Root Cause', incident.rootCause))
      if (incident.iocs) {
        sections.push(
          new Paragraph({ children: [new TextRun({ text: 'Indicators of Compromise (IOCs):', bold: true })], spacing: { after: 100 } }),
          ...createBulletList(incident.iocs)
        )
      }
    }

    // Response Actions
    if (incident.containmentActions || incident.eradicationSteps || incident.recoverySteps) {
      sections.push(createHeading('Response Actions', HeadingLevel.HEADING_2))
      if (incident.containmentActions) {
        sections.push(
          new Paragraph({ children: [new TextRun({ text: 'Containment Actions:', bold: true })], spacing: { after: 100 } }),
          ...createBulletList(incident.containmentActions)
        )
      }
      if (incident.eradicationSteps) {
        sections.push(
          new Paragraph({ children: [new TextRun({ text: 'Eradication Steps:', bold: true })], spacing: { after: 100 } }),
          ...createBulletList(incident.eradicationSteps)
        )
      }
      if (incident.recoverySteps) {
        sections.push(
          new Paragraph({ children: [new TextRun({ text: 'Recovery Steps:', bold: true })], spacing: { after: 100 } }),
          ...createBulletList(incident.recoverySteps)
        )
      }
    }

    // Post-Incident
    if (incident.lessonsLearned || incident.evidence) {
      sections.push(createHeading('Post-Incident', HeadingLevel.HEADING_2))
      if (incident.lessonsLearned) {
        sections.push(
          new Paragraph({ children: [new TextRun({ text: 'Lessons Learned:', bold: true })], spacing: { after: 100 } }),
          ...createBulletList(incident.lessonsLearned)
        )
      }
      if (incident.evidence) {
        sections.push(
          new Paragraph({ children: [new TextRun({ text: 'Evidence & Artifacts:', bold: true })], spacing: { after: 100 } }),
          ...createBulletList(incident.evidence)
        )
      }
    }
  }

  // Related Actions
  if (actions.length > 0) {
    sections.push(
      createHeading('Related Action Items'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: ['Action', 'Assignee', 'Due Date', 'Status'].map(text =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
                shading: { fill: '3B82F6' }
              })
            )
          }),
          ...actions.map(a =>
            new TableRow({
              children: [
                a.title,
                a.assignee || 'Unassigned',
                a.dueDate ? formatDate(a.dueDate) : 'N/A',
                a.status
              ].map(text =>
                new TableCell({ children: [createParagraph(text)] })
              )
            })
          )
        ]
      })
    )
  }

  // Costs
  if (costs.length > 0) {
    const totalCost = costs.reduce((sum, c) => sum + (c.amount || 0), 0)
    sections.push(
      createHeading('Cost Tracking'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: ['Description', 'Category', 'Amount'].map(text =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
                shading: { fill: '3B82F6' }
              })
            )
          }),
          ...costs.map(c =>
            new TableRow({
              children: [c.description, c.category, `$${c.amount?.toLocaleString() || 0}`].map(text =>
                new TableCell({ children: [createParagraph(text)] })
              )
            })
          ),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL', bold: true })] })] }),
              new TableCell({ children: [createParagraph('')] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `$${totalCost.toLocaleString()}`, bold: true })] })] })
            ]
          })
        ]
      })
    )
  }

  // Legal Items
  if (legalItems.length > 0) {
    sections.push(
      createHeading('Legal & Compliance Items'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: ['Item', 'Type', 'Due Date', 'Status'].map(text =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
                shading: { fill: '3B82F6' }
              })
            )
          }),
          ...legalItems.map(l =>
            new TableRow({
              children: [
                l.description,
                l.type,
                l.dueDate ? formatDate(l.dueDate) : 'N/A',
                l.status
              ].map(text =>
                new TableCell({ children: [createParagraph(text)] })
              )
            })
          )
        ]
      })
    )
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${companyConfig.name.replace(/\s+/g, '-')}-incident-${incident.id}.docx`)
}

// ============================================
// PRINT FUNCTION
// ============================================
export function printReport() {
  window.print()
}
