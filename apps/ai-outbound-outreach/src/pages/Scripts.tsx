import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Wand2, RefreshCw, Check } from 'lucide-react'

export default function Scripts() {
  const { id: campaignId } = useParams()
  const [contacts, setContacts] = useState<any[]>([])
  const [scripts, setScripts] = useState<any[]>([])
  const [generating, setGenerating] = useState<string[]>([])

  useEffect(() => {
    if (campaignId) {
      loadContacts()
      loadScripts()
    }
  }, [campaignId])

  async function loadContacts() {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('campaign_id', campaignId)
    setContacts(data || [])
  }

  async function loadScripts() {
    const { data } = await supabase
      .from('personalized_scripts')
      .select('*, contacts(first_name, last_name, company)')
      .eq('campaign_id', campaignId)
    setScripts(data || [])
  }

  async function generateScript(contactId: string) {
    setGenerating([...generating, contactId])
    try {
      const response = await fetch('/functions/v1/generate-personalized-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, contactIds: [contactId] })
      })
      const result = await response.json()
      if (result.success) {
        alert('Script generated successfully!')
        loadScripts()
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setGenerating(generating.filter(id => id !== contactId))
    }
  }

  async function generateAll() {
    const contactIds = contacts.map(c => c.id)
    setGenerating(contactIds)
    try {
      const response = await fetch('/functions/v1/generate-personalized-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, contactIds })
      })
      const result = await response.json()
      if (result.success) {
        alert(`Generated ${result.scripts.length} scripts!`)
        loadScripts()
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setGenerating([])
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Script Generator</h1>
        <button
          onClick={generateAll}
          disabled={generating.length > 0 || contacts.length === 0}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Wand2 size={18} />
          {generating.length > 0 ? 'Generating...' : 'Generate All Scripts'}
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No contacts found. Add contacts to generate scripts.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {contacts.map((contact) => {
            const script = scripts.find(s => s.contact_id === contact.id)
            return (
              <div key={contact.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{contact.first_name} {contact.last_name}</h3>
                    <p className="text-sm text-gray-600">{contact.company}</p>
                  </div>
                  {script ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check size={16} /> Generated
                    </span>
                  ) : (
                    <button
                      onClick={() => generateScript(contact.id)}
                      disabled={generating.includes(contact.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                    >
                      <Wand2 size={16} />
                      {generating.includes(contact.id) ? 'Generating...' : 'Generate'}
                    </button>
                  )}
                </div>

                {script && (
                  <div className="space-y-4 mt-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hook</label>
                      <p className="text-sm text-gray-900">{script.hook}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Script</label>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{script.script}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                        <p className="text-sm text-gray-900">{script.subject_line}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CTA</label>
                        <p className="text-sm text-gray-900">{script.cta}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
