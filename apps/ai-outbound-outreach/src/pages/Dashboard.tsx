import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { BarChart2, Video, Users, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    campaigns: 0,
    videos: 0,
    leads: 0,
    views: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const { count: campaignCount } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
        
        const { count: videoCount } = await supabase
          .from('personalized_videos')
          .select('*', { count: 'exact', head: true })
        
        const { count: leadCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
        
        const { count: viewCount } = await supabase
          .from('video_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'view')
        
        setStats({
          campaigns: campaignCount || 0,
          videos: videoCount || 0,
          leads: leadCount || 0,
          views: viewCount || 0
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Outbound Outreach Dashboard</h1>
        <Link
          to="/campaigns/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Create New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading stats...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Campaigns"
              value={stats.campaigns}
              icon={<BarChart2 className="w-6 h-6 text-blue-600" />}
              link="/campaigns"
            />
            <StatCard
              title="Videos"
              value={stats.videos}
              icon={<Video className="w-6 h-6 text-green-600" />}
              link="/videos"
            />
            <StatCard
              title="Leads"
              value={stats.leads}
              icon={<Users className="w-6 h-6 text-purple-600" />}
              link="/leads"
            />
            <StatCard
              title="Video Views"
              value={stats.views}
              icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
              link="/analytics"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickAction title="Create Campaign" description="Start a new personalized video outreach campaign" link="/campaigns/new" />
              <QuickAction title="Import Contacts" description="Upload CSV or add contacts manually" link="/campaigns" />
              <QuickAction title="View Analytics" description="Track video performance and engagement" link="/analytics" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, link }: { title: string; value: number; icon: React.ReactNode; link: string }) {
  return (
    <Link to={link} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {icon}
      </div>
    </Link>
  )
}

function QuickAction({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <Link to={link} className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </Link>
  )
}
