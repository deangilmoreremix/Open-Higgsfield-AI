import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { MessageSquare, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react'

export default function Comments() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadComments() }, [])

  async function loadComments() {
    try {
      const { data, error } = await supabase
        .from('video_events')
        .select('*, personalized_videos(landing_page_slug), contacts(first_name, last_name)')
        .eq('event_type', 'comment')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm('Delete this comment?')) return
    
    try {
      const { error } = await supabase
        .from('video_events')
        .delete()
        .eq('id', commentId)
      
      if (error) throw error
      alert('Comment deleted!')
      loadComments()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Comments</h1>

      {loading ? (
        <div className="text-center py-12">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600">No comments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">
                      {comment.contacts?.first_name} {comment.contacts?.last_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.metadata?.comment || 'No comment text'}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Video: {comment.personalized_videos?.landing_page_slug}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
