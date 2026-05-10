import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Upload, UserPlus } from 'lucide-react'

export default function Contacts() {
  const { id: campaignId } = useParams()
  const [contacts, setContacts] = useState<any[]>([])
  const [showImport, setShowImport] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (campaignId) loadContacts()
  }, [campaignId])

  async function loadContacts() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const rows = text.split('\n').map(row => row.split(','))
    const headers = rows[0].map(h => h.trim())
    
    const contactsToInsert = rows.slice(1)
      .filter(row => row.length === headers.length)
      .map(row => {
        const contact: any = { campaign_id: campaignId }
        headers.forEach((header, index) => {
          contact[header] = row[index]?.trim()
        })
        return contact
      })

    try {
      const { error } = await supabase
        .from('contacts')
        .insert(contactsToInsert)
      
      if (error) throw error
      alert(`Imported ${contactsToInsert.length} contacts`)
      loadContacts()
      setShowImport(false)
    } catch (error: any) {
      alert(`Import failed: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(!showImport)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload size={18} /> Import CSV
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <UserPlus size={18} /> Add Contact
          </button>
        </div>
      </div>

      {showImport && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-medium mb-4">Import Contacts from CSV</h3>
          <p className="text-sm text-gray-600 mb-4">
            CSV should have columns: first_name, last_name, email, company, website, industry, city
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVImport}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No contacts yet. Import a CSV or add manually.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.first_name} {contact.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{contact.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{contact.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{contact.industry}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{contact.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
