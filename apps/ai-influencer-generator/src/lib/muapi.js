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

  if (!response.ok) throw new Error(`MuAPI Image Error: ${response.status}`)
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

  if (!response.ok) throw new Error(`MuAPI Video Error: ${response.status}`)
  return response.json()
}