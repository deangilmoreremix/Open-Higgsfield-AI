import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Trash2, Save } from 'lucide-react'

export default function CampaignBuilder() {
  const { id: campaignId } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState({
    name: '',
    offer: '',
    audience: '',
    cta_text: '',
    cta_url: '',
    calendar_url: '',
    personalization_mode: 'personalized_page',
    status: 'draft',
    base_video_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (campaignId && campaignId !== 'new') loadCampaign()
  }, [campaignId])

  async function loadCampaign() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()
      if (error) throw error
      if (data) setCampaign(data)
    } catch (error: any) {
      alert(`Error loading campaign: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!workspace) throw new Error('No workspace found')

      if (campaignId === 'new') {
        const { data, error } = await supabase
          .from('campaigns')
          .insert({
            ...campaign,
            workspace_id: workspace.id,
            user_id: user.id
          })
          .select()
          .single()
        if (error) throw error
        navigate(`/campaigns/${data.id}`)
        alert('Campaign created successfully!')
      } else {
        const { error } = await supabase
          .from('campaigns')
          .update(campaign)
          .eq('id', campaignId)
        if (error) throw error
        alert('Campaign updated successfully!')
      }
    } catch (error: any) {
      alert(`Error saving: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {campaignId === 'new' ? 'Create Campaign' : 'Edit Campaign'}
      </h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
          <input
            value={campaign.name}
            onChange={(e) => setCampaign({...campaign, name: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., Q1 Outreach Campaign"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Offer/Value Proposition</label>
          <textarea
            value={campaign.offer}
            onChange={(e) => setCampaign({...campaign, offer: e.target.value})}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="What are you offering to prospects?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
          <input
            value={campaign.audience}
            onChange={(e) => setCampaign({...campaign, audience: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., Roofing companies in Miami"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
            <input
              value={campaign.cta_text}
              onChange={(e) => setCampaign({...campaign, cta_text: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Book a Call"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CTA URL</label>
            <input
              value={campaign.cta_url}
              onChange={(e) => setCampaign({...campaign, cta_url: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="https://calendly.com/your-link"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Calendar URL (Optional)</label>
          <input
            value={campaign.calendar_url}
            onChange={(e) => setCampaign({...campaign, calendar_url: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="https://calendly.com/your-link"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Personalization Mode</label>
          <select
            value={campaign.personalization_mode}
            onChange={(e) => setCampaign({...campaign, personalization_mode: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="personalized_page">Personalized Page Only</option>
            <option value="ai_intro">AI Personalized Intro</option>
            <option value="full_ai">Full AI Generated Video</option>
            <option value="muapi_workflow">MuAPI Workflow Video</option>
            <option value="ai_clone">AI Clone/Spokesperson</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Base Video URL (Optional)</label>
          <input
            value={campaign.base_video_url}
            onChange={(e) => setCampaign({...campaign, base_video_url: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="https://example.com/video.mp4"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving || !campaign.name}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Campaign'}
          </button>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
