const OPENAI_BASE_URL = 'https://api.openai.com/v1'

export async function chatCompletion(prompt, model = 'gpt-4o-mini', options = {}) {
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  if (!apiKey) throw new Error('VITE_OPENAI_KEY not configured')

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], ...options })
  })

  if (!response.ok) throw new Error(`OpenAI Chat Error: ${response.status}`)
  const data = await response.json()
  return data.choices[0].message.content
}

export async function textToSpeech(text, voice = 'alloy') {
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  if (!apiKey) throw new Error('VITE_OPENAI_KEY not configured')

  const response = await fetch(`${OPENAI_BASE_URL}/audio/speech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: 'tts-1', voice, input: text })
  })

  if (!response.ok) throw new Error(`OpenAI TTS Error: ${response.status}`)
  return response.blob()
}

export async function createResponse(prompt, model = 'gpt-4o-mini') {
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  if (!apiKey) throw new Error('VITE_OPENAI_KEY not configured')

  const response = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, input: prompt })
  })

  if (!response.ok) throw new Error(`OpenAI Response Error: ${response.status}`)
  return response.json()
}