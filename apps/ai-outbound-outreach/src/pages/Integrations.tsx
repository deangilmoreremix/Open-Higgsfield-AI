import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { Zapier, Mail, Calendar, Crm, ChevronRight } from 'lucide-react'

const INTEGRATIONS = [
  { name: 'Zapier', description: 'Connect with 5000+ apps through Zapier automation', category: 'automation', icon: '⚡' },
  { name: 'Apollo', description: 'Add videos to Apollo campaigns and landing pages', category: 'crm', icon: '🔍' },
  { name: 'ActiveCampaign', description: 'Add videos to email campaigns and landing pages', category: 'email', icon: '📧' },
  { name: 'AWeber', description: 'Add videos to email campaigns', category: 'email', icon: '📨' },
  { name: 'Brevo', description: 'Add videos to campaigns and landing pages', category: 'email', icon: '✉️' },
  { name: 'Lemlist', description: 'Add videos to cold outreach campaigns', category: 'outreach', icon: '🚀' },
  { name: 'La Growth Machine', description: 'Add videos to outbound workflows', category: 'outreach', icon: '📈' },
  { name: 'Go High Level', description: 'Add videos to GHL campaigns and pages', category: 'crm', icon: '🏢' },
  { name: 'Mailchimp', description: 'Add videos to email campaigns', category: 'email', icon: '🐵' },
  { name: 'Smartlead', description: 'Add videos to cold email campaigns', category: 'outreach', icon: '💡' },
  { name: 'HubSpot', description: 'Track conversions and survey responses', category: 'crm', icon: '🧡' },
  { name: 'Calendly', description: 'Embed calendar booking in video pages', category: 'scheduling', icon: '📅' },
  { name: 'YouTube', description: 'Import videos from YouTube', category: 'video-source', icon: '🎥' },
  { name: 'Vimeo', description: 'Import videos from Vimeo', category: 'video-source', icon: '🎬' },
  { name: 'Vidyard', description: 'Import videos from Vidyard', category: 'video-source', icon: '📹' }
]

export default function Integrations() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = INTEGRATIONS.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(search.toLowerCase()) ||
      int.description.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = activeFilter === 'all' || int.category === activeFilter
    return matchesSearch && matchesFilter
  })

  const categories = ['all', ...new Set(INTEGRATIONS.map(i => i.category))]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Integrations</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search integrations..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((int) => (
          <div key={int.name} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{int.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{int.name}</h3>
                  <span className="text-xs text-gray-500 capitalize">{int.category}</span>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                Available
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{int.description}</p>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
              Configure
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Need a custom integration?</h3>
        <p className="text-sm text-blue-700 mb-4">
          We can help you integrate with any tool in your sales and marketing stack.
        </p>
        <Link
          to="/support"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Contact Support
        </Link>
      </div>
    </div>
  )
}
