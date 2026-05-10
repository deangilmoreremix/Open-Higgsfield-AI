import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Save } from 'lucide-react'

export default function BrandKit() {
  const [brand, setBrand] = useState({
    brand_name: '',
    logo_url: '',
    primary_color: '#3b82f6',
    cta_button_color: '#10b981',
    custom_footer_text: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadBrandKit()
  }, [])

  async function loadBrandKit() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (data) setBrand(data)
    } catch (error) {
      console.error('Error loading brand kit:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('workspaces')
        .update(brand)
        .eq('owner_id', user.id)

      if (error) throw error
      alert('Brand kit saved successfully!')
    } catch (error: any) {
      alert(`Error saving: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading brand kit...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Brand Kit</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
            <input
              value={brand.brand_name}
              onChange={(e) => setBrand({...brand, brand_name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
            <input
              value={brand.logo_url}
              onChange={(e) => setBrand({...brand, logo_url: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <input
                type="color"
                value={brand.primary_color}
                onChange={(e) => setBrand({...brand, primary_color: e.target.value})}
                className="w-full h-12 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Color</label>
              <input
                type="color"
                value={brand.cta_button_color}
                onChange={(e) => setBrand({...brand, cta_button_color: e.target.value})}
                className="w-full h-12 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Footer Text</label>
            <textarea
              value={brand.custom_footer_text}
              onChange={(e) => setBrand({...brand, custom_footer_text: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Brand Kit'}
          </button>
        </div>
      </div>
    </div>
  )
}
