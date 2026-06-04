const MUAPI_BASE_URL = 'https://api.muapi.ai'

export async function generateImage(prompt, options = {}) {
  const apiKey = import.meta.env.VITE_MUAPI_KEY
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/v1/generate/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, ...options })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MuAPI Image Error ${response.status}: ${errorText}`)
  }

  return response.json()
}

export async function generateVideo(prompt, options = {}) {
  const apiKey = import.meta.env.VITE_MUAPI_KEY
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/v1/generate/video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, ...options })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MuAPI Video Error ${response.status}: ${errorText}`)
  }

  return response.json()
}

export async function generateSpeech(text, options = {}) {
  const apiKey = import.meta.env.VITE_MUAPI_KEY
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/v1/generate/speech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, ...options })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MuAPI Speech Error ${response.status}: ${errorText}`)
  }

  return response.json()
}

export async function transcribeAudio(audioFile, options = {}) {
  const apiKey = import.meta.env.VITE_MUAPI_KEY
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const formData = new FormData()
  formData.append('file', audioFile)
  formData.append('options', JSON.stringify(options))

  const response = await fetch(`${MUAPI_BASE_URL}/v1/transcribe`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MuAPI Transcription Error ${response.status}: ${errorText}`)
  }

  return response.json()
}