import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PublicVideoPage() {
  const { slug } = useParams()
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) loadVideo()
  }, [slug])

  async function loadVideo() {
    try {
      const { data, error } = await supabase
        .from('personalized_videos')
        .select('*, campaigns(*), contacts(*)')
        .eq('landing_page_slug', slug)
        .single()
      
      if (error) throw error
      setVideo(data)
      
      // Track view event
      await supabase.from('video_events').insert({
        video_id: data.id,
        campaign_id: data.campaign_id,
        contact_id: data.contact_id,
        event_type: 'view'
      })
    } catch (error) {
      console.error('Error loading video:', error)
    } finally {
      setLoading(false)
    }
  }

  async function trackEvent(eventType: string) {
    if (!video) return
    await supabase.from('video_events').insert({
      video_id: video.id,
      campaign_id: video.campaign_id,
      contact_id: video.contact_id,
      event_type: eventType
    })
  }

  if (loading) return <div className="text-center py-12">Loading video...</div>
  if (!video) return <div className="text-center py-12">Video not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="aspect-w-16 aspect-h-9 mb-6">
            {video.video_url ? (
              <video
                src={video.video_url}
                controls
                className="w-full rounded-lg"
                onPlay={() => trackEvent('play')}
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                Video not available
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {video.campaigns?.offer || 'Personalized Video'}
          </h1>
          <p className="text-gray-600 mb-6">
            For {video.contacts?.first_name} {video.contacts?.last_name} at {video.contacts?.company}
          </p>

          {video.campaigns?.cta_url && (
            <a
              href={video.campaigns.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition mb-6"
              onClick={() => trackEvent('cta_click')}
            >
              {video.campaigns.cta_text || 'Learn More'}
            </a>
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Contact {video.contacts?.first_name}</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const formData = new FormData(form)
                
                await supabase.from('leads').insert({
                  video_id: video.id,
                  campaign_id: video.campaign_id,
                  contact_id: video.contact_id,
                  name: formData.get('name'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  message: formData.get('message')
                })
                
                trackEvent('form_submit')
                alert('Thank you for your submission!')
                form.reset()
              }}
              className="space-y-4"
            >
              <input
                name="name"
                placeholder="Your Name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                name="email"
                type="email"
                placeholder="Your Email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                name="phone"
                placeholder="Your Phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
