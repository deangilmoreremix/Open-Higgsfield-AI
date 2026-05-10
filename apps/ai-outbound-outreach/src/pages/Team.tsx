import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useParams, Link } from 'react-router-dom'
import { UserPlus, Trash2, Shield, User } from 'lucide-react'

export default function Team() {
  const { id: workspaceId } from useParams()
  const [members, setMembers] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadMembers()
  }, [workspaceId])

  async function loadMembers() {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*, profiles(full_name, email)')
        .eq('workspace_id', workspaceId || '')
      
      if (error) throw error
      setMembers(data || [])
    } catch (error: any) {
      console.error('Error loading members:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite() {
    if (!inviteEmail) return
    setSaving(true)
    try {
      // Check if user exists
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single()

      if (!profiles) {
        alert('User not found. They need to sign up first.')
        return
      }

      const { error } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: profiles.id,
          role: 'member'
        })

      if (error) throw error
      alert('Team member added!')
      setInviteEmail('')
      loadMembers()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm('Remove this team member?')) return
    
    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId)
      
      if (error) throw error
      alert('Member removed!')
      loadMembers()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Team Management</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Invite Team Member</h2>
        <div className="flex gap-4">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleInvite}
            disabled={saving || !inviteEmail}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <UserPlus size={18} /> Invite
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    {member.profiles?.full_name || 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{member.profiles?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    member.role === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
