import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Video, Upload, Play, Square } from 'lucide-react'

export default function Recording() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const mediaRecorderRef = useState<any>(null)
  const timerRef = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadVideos()
    return () => {
      if (timerRef[0]) clearInterval(timerRef[0])
    }
  }, [])

  async function loadVideos() {
    try {
      const { data, error } = await supabase
        .from('personalized_videos')
        .select('*, campaigns(name)')
        .eq('status', 'recorded')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef[1](mediaRecorder)
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          // Handle data chunk
        }
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      timerRef[1](setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000))
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef[0]) {
      mediaRecorderRef[0].stop()
      setIsRecording(false)
      if (timerRef[0]) {
        clearInterval(timerRef[0])
        timerRef[1](null)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Screen & Video Recording</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recording Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Video className="text-blue-600" />
            Recording Studio
          </h2>
          
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
            {isRecording ? (
              <div className="text-center">
                <div className="animate-pulse w-4 h-4 bg-red-600 rounded-full mx-auto mb-2" />
                <p className="text-red-600 font-medium">Recording...</p>
                <p className="text-2xl font-bold mt-2">{formatTime(recordingTime)}</p>
              </div>
            ) : (
              <p className="text-gray-400">Camera preview</p>
            )}
          </div>

          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
              >
                <Play size={18} /> Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                <Square size={18} /> Stop
              </button>
            )}
          </div>
        </div>

        {/* Upload Option */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="text-blue-600" />
            Upload Video
          </h2>
          <input
            type="file"
            accept="video/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700"
          />
          <p className="text-sm text-gray-500 mt-4">
            Supported formats: MP4, MOV, AVI
          </p>
        </div>
      </div>

      {/* Recorded Videos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recorded Videos</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : videos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recorded videos yet.</p>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div key={video.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{video.campaigns?.name || 'Untitled'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(video.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
