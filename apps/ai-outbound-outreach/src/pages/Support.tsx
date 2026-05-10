import { useState } from 'react'
import { Mail, Phone, MessageSquare, Send } from 'lucide-react'

export default function Support() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In production, this would send to support system
    console.log('Support request:', { subject, message })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Submitted!</h2>
          <p className="text-gray-600">
            Our support team will respond within 24 hours.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Support</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold">Email Support</h3>
          <p className="text-sm text-gray-600">support@aioutbound.io</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold">Live Chat</h3>
          <p className="text-sm text-gray-600">Available 9am-5pm EST</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Phone className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold">Phone</h3>
          <p className="text-sm text-gray-600">1-800-AI-OUTBOUND</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Submit a Ticket</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Brief description of your issue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Please describe your issue in detail..."
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <Send size={18} /> Submit Ticket
          </button>
        </form>
      </div>
    </div>
  )
}
