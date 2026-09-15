import React, { useRef, useState } from 'react'
import {
  Paperclip,
  Upload,
  Trash2,
  FileText,
  Image,
  File,
  Download,
  User,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { formatDateTime } from '../../utils/helpers'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/pdf',
  'text/plain', 'text/csv',
  'application/json',
  'application/zip',
  'application/x-pcap', 'application/vnd.tcpdump.pcap'
]

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return Image
  if (type === 'application/pdf') return FileText
  return File
}

export default function AttachmentSection({ incidentId }) {
  const { getAttachmentsForIncident, addAttachment, deleteAttachment } = useIncidents()
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const attachments = getAttachmentsForIncident(incidentId)

  const handleFiles = async (files) => {
    setError('')

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" exceeds 5MB limit`)
        continue
      }

      // Read file as base64
      const reader = new FileReader()
      reader.onload = (e) => {
        addAttachment({
          incidentId,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          data: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleDownload = (attachment) => {
    const link = document.createElement('a')
    link.href = attachment.data
    link.download = attachment.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = (attachmentId) => {
    if (window.confirm('Delete this attachment?')) {
      deleteAttachment(attachmentId)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Drag & drop files here, or click to select
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Max 5MB per file - Images, PDF, Text, JSON, ZIP, PCAP
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Attachments List */}
      {attachments.length === 0 ? (
        <div className="text-center py-8">
          <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No attachments yet</p>
          <p className="text-sm text-gray-400">Upload evidence files, screenshots, or logs</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map(attachment => {
            const FileIcon = getFileIcon(attachment.type)

            return (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    {attachment.type.startsWith('image/') ? (
                      <img
                        src={attachment.data}
                        alt={attachment.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FileIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                      {attachment.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(attachment.size)}</span>
                      <span>-</span>
                      <User className="w-3 h-3" />
                      <span>{attachment.uploadedBy}</span>
                      <span>-</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatDateTime(attachment.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
