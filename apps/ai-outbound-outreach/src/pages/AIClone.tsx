import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mic, Video, Globe, RefreshCw } from 'lucide-react'

const LANGUAGES = [
  'English', 'French', 'Spanish', 'German', 'Portuguese', 'Portuguese Brazil',
  'Dutch', 'Italian', 'Turkish', 'Swedish', 'Polish', 'Danish', 'Norwegian'
]

export default function AIClone() {
  const [step, setStep] = useState(1)
  const [trainingVideo, setTrainingVideo] = useState<File | null>(null)
  const [voiceRecording, setVoiceRecording] = useState<File | null>(null)
  const [language, setLanguage] = useState('English')
  const [script, setScript] = useState('')
  const [greeting, setGreeting] = useState('Hello')
  const [generating, setGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  async function handleGenerateClone() {
    if (!trainingVideo || !voiceRecording || !script) {
      alert('Please complete all steps')
      return
    }

    setGenerating(true)
    try {
      // Upload training video to Supabase Storage
      const videoPath = `clones/${Date.now()}-${trainingVideo.name}`
      const { data: videoData, error: videoError } = await supabase.storage
        .from('clones')
        .upload(videoPath, trainingVideo)

      if (videoError) throw videoError

      const { data: videoUrl } = supabase.storage
        .from('clones')
        .getPublicUrl(videoPath)

      // Upload voice recording
      const voicePath = `clones/${Date.now()}-${voiceRecording.name}`
      const { error: voiceError } = await supabase.storage
        .from('clones')
        .upload(voicePath, voiceRecording)

      if (voiceError) throw voiceError

      const { data: voiceUrl } = supabase.storage
        .from('clones')
        .getPublicUrl(voicePath)

      // Call MuAPI/AI service to generate clone
      const response = await fetch('/functions/v1/create-ai-clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoUrl.publicUrl,
          voiceUrl: voiceUrl.publicUrl,
          language,
          script,
          greeting,
          cloneName: 'AI Clone'
        })
      })

      const result = await response.json()
      if (result.success) {
        setPreviewUrl(result.videoUrl)
        alert('AI Clone generated successfully!')
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Clone Creator</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-8">
        {/* Step 1: Upload Training Video */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Video className="text-blue-600" />
            Step 1: Upload Training Video (min 60 seconds)
          </h2>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setTrainingVideo(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700"
          />
          {trainingVideo && (
            <p className="mt-2 text-sm text-green-600">✓ {trainingVideo.name}</p>
          )}
        </div>

        {/* Step 2: Record Voice */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mic className="text-blue-600" />
            Step 2: Record Voice (min 15 seconds)
          </h2>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setVoiceRecording(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700"
          />
          {voiceRecording && (
            <p className="mt-2 text-sm text-green-600">✓ {voiceRecording.name}</p>
          )}
        </div>

        {/* Step 3: Select Language */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="text-blue-600" />
            Step 3: Select Language
          </h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Step 4: Write Script */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Step 4: Write Script (max 650 characters)</h2>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value.slice(0, 650))}
            rows={6}
            maxLength={650}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Write the script for your AI clone to say..."
          />
          <p className="text-sm text-gray-500 mt-1">{script.length}/650 characters</p>
        </div>

        {/* Step 5: Greeting */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Step 5: Greeting</h2>
          <input
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g., Hello, Hi there"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateClone}
          disabled={generating}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <RefreshCw className="animate-spin" size={18} />
              Generating AI Clone...
            </>
          ) : (
            'Generate AI Clone Video'
          )}
        </button>

        {/* Preview */}
        {previewUrl && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <video src={previewUrl} controls className="w-full rounded-lg" />
          </div>
        )}
      </div>
    </div>
  )
}
