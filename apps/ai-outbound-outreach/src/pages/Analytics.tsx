import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart2, TrendingUp, Eye, MousePointer } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    views: 0,
    plays: 0,
    ctaClicks: 0,
    formSubmissions: 0,
    videoPerformance: [] as any[]
  })
  const [dateRange, setDateRange] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  async function loadAnalytics() {
    try {
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      const { count: views } = await supabase
        .from('video_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'view')
        .gte('created_at', startDate.toISOString())

      const { count: plays } = await supabase
        .from('video_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'play')
        .gte('created_at', startDate.toISOString())

      const { count: ctaClicks } = await supabase
        .from('video_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'cta_click')
        .gte('created_at', startDate.toISOString())

      const { count: formSubmissions } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())

      const { data: videoPerf } = await supabase
        .from('personalized_videos')
        .select(`
          id,
          landing_page_slug,
          video_events!inner(event_type)
        `)
        .gte('created_at', startDate.toISOString())

      const performanceMap = new Map()
      videoPerf?.forEach((video: any) => {
        const slug = video.landing_page_slug || 'Unknown'
        if (!performanceMap.has(slug)) {
          performanceMap.set(slug, { name: slug, views: 0, plays: 0, clicks: 0 })
        }
        const entry = performanceMap.get(slug)
        video.video_events.forEach((event: any) => {
          if (event.event_type === 'view') entry.views++
          if (event.event_type === 'play') entry.plays++
          if (event.event_type === 'cta_click') entry.clicks++
        })
      })

      setAnalytics({
        views: views || 0,
        plays: plays || 0,
        ctaClicks: ctaClicks || 0,
        formSubmissions: formSubmissions || 0,
        videoPerformance: Array.from(performanceMap.values()).slice(0, 10)
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Video Views" value={analytics.views} icon={<Eye className="w-6 h-6 text-blue-600" />} />
            <StatCard title="Video Plays" value={analytics.plays} icon={<TrendingUp className="w-6 h-6 text-green-600" />} />
            <StatCard title="CTA Clicks" value={analytics.ctaClicks} icon={<MousePointer className="w-6 h-6 text-purple-600" />} />
            <StatCard title="Form Submissions" value={analytics.formSubmissions} icon={<BarChart2 className="w-6 h-6 text-orange-600" />} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Top Performing Videos</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.videoPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3b82f6" name="Views" />
                  <Bar dataKey="plays" fill="#10b981" name="Plays" />
                  <Bar dataKey="clicks" fill="#8b5cf6" name="CTA Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  )
}
