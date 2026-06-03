const OPENAI_BASE_URL = 'https://api.openai.com/v1'

export async function generateImage(prompt, model = 'dall-e-3', size = '1024x1024') {
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  if (!apiKey) throw new Error('VITE_OPENAI_KEY not configured')

  const response = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, prompt, size, n: 1 })
  })

  if (!response.ok) throw new Error(`OpenAI Image Error: ${response.status}`)
  return response.json()
}

export async function editImage(imageUrl, maskUrl, prompt) {
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  if (!apiKey) throw new Error('VITE_OPENAI_KEY not configured')

  const response = await fetch(`${OPENAI_BASE_URL}/images/edits`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image: imageUrl, mask: maskUrl, prompt, model: 'dall-e-3' })
  })

  if (!response.ok) throw new Error(`OpenAI Image Edit Error: ${response.status}`)
  return response.json()
}

export async function chatCompletion(prompt, model = 'gpt-4o-mini') {
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  if (!apiKey) throw new Error('VITE_OPENAI_KEY not configured')

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] })
  })

  if (!response.ok) throw new Error(`OpenAI Chat Error: ${response.status}`)
  const data = await response.json()
  return data.choices[0].message.content
}