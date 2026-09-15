import React, { useState } from 'react'
import { MessageSquare, Send, Trash2, User, Clock } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'
import { formatDateTime } from '../../utils/helpers'

export default function CommentSection({ incidentId }) {
  const { getCommentsForIncident, addComment, deleteComment } = useIncidents()
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')

  const comments = getCommentsForIncident(incidentId)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    addComment({
      incidentId,
      content: newComment.trim(),
      author: authorName.trim() || 'Anonymous'
    }, authorName.trim() || 'Anonymous')

    setNewComment('')
  }

  const handleDelete = (commentId) => {
    if (window.confirm('Delete this comment?')) {
      deleteComment(commentId)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <textarea
            placeholder="Add a comment or note..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No comments yet</p>
          <p className="text-sm text-gray-400">Be the first to add a note</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">{comment.author}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(comment.createdAt)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
