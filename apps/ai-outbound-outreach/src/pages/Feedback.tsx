import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Star, Trash2, MessageSquare } from 'lucide-react'

export default function Feedback() {
  const [feedback, setFeedback] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadFeedback() }, [filter])

  async function loadFeedback() {
    setLoading(true)
    try {
      let query = supabase
        .from('video_events')
        .select('*, personalized_videos(landing_page_slug), contacts(first_name, last_name)')
        .in('event_type', ['feedback', 'survey_response'])
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('event_type', filter)
      }

      const { data, error } = await query
      if (error) throw error
      setFeedback(data || [])
    } catch (error) {
      console.error('Error loading feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Feedback & Surveys</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Feedback</option>
          <option value="feedback">Feedback Only</option>
          <option value="survey_response">Survey Responses</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading feedback...</div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600">No feedback yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">
                      {item.contacts?.first_name} {item.contacts?.last_name}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.event_type === 'feedback' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {item.event_type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {item.metadata?.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= item.metadata.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{item.metadata.rating}/5</span>
                    </div>
                  )}
                  
                  <p className="text-gray-700">{item.metadata?.comment || item.metadata?.response || 'No details'}</p>
                  
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
