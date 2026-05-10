import { useEffect, useState, useRef } from 'react'
import { Mic, Play, Square, RotateCcw } from 'lucide-react'

export default function Teleprompter() {
  const [script, setScript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [scrollSpeed, setScrollSpeed] = useState(50)
  const mediaRecorderRef = useRef<any>(null)
  const chunksRef = useRef<any[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  function resetRecording() {
    setRecordingTime(0)
    stopRecording()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Teleprompter</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Script Input */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Script</h2>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Type or paste your script here..."
          />
          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm text-gray-600">Scroll Speed:</label>
            <input
              type="range"
              min="10"
              max="200"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600">{scrollSpeed}%</span>
          </div>
        </div>

        {/* Recording Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recording</h2>
          
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
            {isRecording ? (
              <div className="text-center">
                <div className="animate-pulse w-4 h-4 bg-red-600 rounded-full mx-auto mb-2" />
                <p className="text-red-600 font-medium">Recording...</p>
                <p className="text-2xl font-bold mt-2">{formatTime(recordingTime)}</p>
              </div>
            ) : (
              <p className="text-gray-400">Camera preview will appear here</p>
            )}
          </div>

          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
              >
                <Mic size={18} /> Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                <Square size={18} /> Stop
              </button>
            )}
            <button
              onClick={resetRecording}
              className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              <RotateCcw size={18} /> Reset
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {script || 'Your script will scroll here...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
