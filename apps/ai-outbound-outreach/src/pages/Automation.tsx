import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zapier, ArrowLeft } from 'lucide-react'

export default function Automation() {
  const [zapierConnected, setZapierConnected] = useState(false)
  const [apiKey, setApiKey] = useState('')

  function handleConnectZapier() {
    // In production, this would redirect to Zapier OAuth
    setZapierConnected(true)
    alert('Zapier connected successfully!')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/settings" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft size={16} /> Back to Settings
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Automation - Zapier</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
            <Zapier className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Zapier Integration</h2>
            <p className="text-gray-600">Connect with 5000+ apps through Zapier automation</p>
          </div>
        </div>

        {!zapierConnected ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Connect your Zapier account to automate video personalization workflows.
            </p>
            <button
              onClick={handleConnectZapier}
              className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
            >
              <Zapier size={18} /> Connect Zapier
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              Zapier Connected
            </div>
            <p className="text-sm text-gray-600">
              Your Zapier account is connected. You can now create Zaps using AI Outbound Outreach triggers.
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Available Triggers:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Video Viewed</li>
                <li>• CTA Clicked</li>
                <li>• Form Submitted</li>
                <li>• Lead Generated</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Webhook URL</h2>
        <p className="text-sm text-gray-600 mb-4">
          Use this URL in your Zapier Zaps to receive events from AI Outbound Outreach.
        </p>
        <div className="flex gap-2">
          <input
            value={`${window.location.origin}/api/webhook/zapier`}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/api/webhook/zapier`)
              alert('Copied!')
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Need help with automation?</h3>
        <p className="text-sm text-blue-700 mb-4">
          Check our documentation for popular Zapier workflows and templates.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          View Documentation →
        </a>
      </div>
    </div>
  )
}
