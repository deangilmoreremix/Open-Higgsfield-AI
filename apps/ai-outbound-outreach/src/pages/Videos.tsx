import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { Video, Share2, BarChart2 } from 'lucide-react'

export default function Videos() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadVideos() }, [])

  async function loadVideos() {
    try {
      const { data, error } = await supabase
        .from('personalized_videos')
        .select('*, campaigns(name), contacts(first_name, last_name, company)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Personalized Videos</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Video className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600">No personalized videos yet.</p>
          <p className="text-sm text-gray-500">Create a campaign and generate videos to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow p-6">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt="Thumbnail" className="rounded-lg object-cover" />
                ) : (
                  <Video className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <h3 className="font-medium text-gray-900">
                {video.contacts?.first_name} {video.contacts?.last_name}
              </h3>
              <p className="text-sm text-gray-600">{video.contacts?.company}</p>
              <p className="text-xs text-gray-500 mt-1">Campaign: {video.campaigns?.name}</p>
              
              <div className="mt-4 flex gap-2">
                <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <Share2 size={14} /> Share
                </button>
                <Link
                  to={`/v/${video.landing_page_slug}`}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <BarChart2 size={14} /> View Page
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
