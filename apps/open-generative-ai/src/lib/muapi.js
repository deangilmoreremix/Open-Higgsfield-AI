const MUAPI_BASE_URL = 'https://api.muapi.ai/api/v1'

const getApiKey = () => import.meta.env.VITE_MUAPI_KEY

const headers = () => ({
  'Content-Type': 'application/json',
  'x-api-key': getApiKey()
})

export async function uploadFile(file) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${MUAPI_BASE_URL}/upload_file`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: formData
  })

  if (!response.ok) throw new Error(`Upload failed: ${response.status}`)
  return response.json()
}

export async function generateImage(prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/nano-banana`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt, ...options })
  })

  if (!response.ok) throw new Error(`Image generation failed: ${response.status}`)
  return response.json()
}

export async function generateImageV2(prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/nano-banana-2`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt, ...options })
  })

  if (!response.ok) throw new Error(`Image generation failed: ${response.status}`)
  return response.json()
}

export async function fluxDev(prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/flux-dev`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt, ...options })
  })

  if (!response.ok) throw new Error(`Flux Dev failed: ${response.status}`)
  return response.json()
}

export async function fluxSchnell(prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/flux-schnell`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt, ...options })
  })

  if (!response.ok) throw new Error(`Flux Schnell failed: ${response.status}`)
  return response.json()
}

export async function midjourney(prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/midjourney-v7`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt, ...options })
  })

  if (!response.ok) throw new Error(`Midjourney failed: ${response.status}`)
  return response.json()
}

export async function hdream(prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/hdream`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt, ...options })
  })

  if (!response.ok) throw new Error(`HiDream failed: ${response.status}`)
  return response.json()
}

export async function generateVideo(prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/seedance-lite-t2v`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt, ...options })
  })

  if (!response.ok) throw new Error(`Video generation failed: ${response.status}`)
  return response.json()
}

export async function wanVideo(imageUrl, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/wan-2.1`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, ...options })
  })

  if (!response.ok) throw new Error(`Wan video failed: ${response.status}`)
  return response.json()
}

export async function runwayVideo(imageUrl, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/runway-gen-3`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, ...options })
  })

  if (!response.ok) throw new Error(`Runway video failed: ${response.status}`)
  return response.json()
}

export async function klingVideo(imageUrl, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/kling-v2.1`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, ...options })
  })

  if (!response.ok) throw new Error(`Kling video failed: ${response.status}`)
  return response.json()
}

export async function lumaVideo(imageUrl, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/luma-dream-machine`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, ...options })
  })

  if (!response.ok) throw new Error(`Luma video failed: ${response.status}`)
  return response.json()
}

export async function imageToVideo(imageUrl, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/seedance-lite-i2v`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, ...options })
  })

  if (!response.ok) throw new Error(`Image-to-video failed: ${response.status}`)
  return response.json()
}

export async function applyVFX(imageUrl, prompt, name, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/generate_wan_ai_effects`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      image_url: imageUrl,
      prompt,
      name,
      aspect_ratio: options.aspectRatio || '16:9',
      resolution: options.resolution || '480p',
      quality: options.quality || 'medium',
      duration: options.duration || 5
    })
  })

  if (!response.ok) throw new Error(`VFX generation failed: ${response.status}`)
  return response.json()
}

export async function applyMotion(imageUrl, prompt, name, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/generate_wan_ai_effects`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      image_url: imageUrl,
      prompt,
      name,
      aspect_ratio: options.aspectRatio || '16:9',
      resolution: options.resolution || '480p',
      quality: options.quality || 'medium',
      duration: options.duration || 5
    })
  })

  if (!response.ok) throw new Error(`Motion generation failed: ${response.status}`)
  return response.json()
}

export async function generateSpeech(text, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/tts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ text, ...options })
  })

  if (!response.ok) throw new Error(`Speech generation failed: ${response.status}`)
  return response.json()
}

export async function sunoCreateMusic(prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/suno-create-music`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt, ...options })
  })

  if (!response.ok) throw new Error(`Music creation failed: ${response.status}`)
  return response.json()
}

export async function sunoRemixMusic(audioUrl, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/suno-remix-music`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ audio_url: audioUrl, ...options })
  })

  if (!response.ok) throw new Error(`Music remix failed: ${response.status}`)
  return response.json()
}

export async function sunoExtendMusic(audioUrl, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/suno-extend-music`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ audio_url: audioUrl, ...options })
  })

  if (!response.ok) throw new Error(`Music extension failed: ${response.status}`)
  return response.json()
}

export async function lipSync(imageUrl, audioUrl, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/sync-lipsync`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, audio_url: audioUrl, ...options })
  })

  if (!response.ok) throw new Error(`Lip sync failed: ${response.status}`)
  return response.json()
}

export async function latentsyncVideo(imageUrl, audioUrl, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/latentsync-video`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, audio_url: audioUrl, ...options })
  })

  if (!response.ok) throw new Error(`LatentSync failed: ${response.status}`)
  return response.json()
}

export async function mmaudioTextToAudio(prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/mmaudio-v2/text-to-audio`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt, ...options })
  })

  if (!response.ok) throw new Error(`Audio generation failed: ${response.status}`)
  return response.json()
}

export async function mmaudioVideoToVideo(videoUrl, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/mmaudio-v2/video-to-video`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ video_url: videoUrl, ...options })
  })

  if (!response.ok) throw new Error(`Audio video failed: ${response.status}`)
  return response.json()
}

export async function pollPrediction(requestId, maxAttempts = 120) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${MUAPI_BASE_URL}/predictions/${requestId}/result`, {
      headers: { 'x-api-key': apiKey }
    })

    if (!response.ok) throw new Error(`Poll failed: ${response.status}`)

    const result = await response.json()
    const status = result.data?.status

    if (status === 'completed') return result
    if (status === 'failed') throw new Error(result.error || 'Generation failed')

    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  throw new Error('Timeout waiting for generation')
}

export async function faceSwap(imageUrl1, imageUrl2, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/face-swap`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url_1: imageUrl1, image_url_2: imageUrl2, ...options })
  })

  if (!response.ok) throw new Error(`Face swap failed: ${response.status}`)
  return response.json()
}

export async function dressChange(imageUrl, prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/dress-change`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, prompt, ...options })
  })

  if (!response.ok) throw new Error(`Dress change failed: ${response.status}`)
  return response.json()
}

export async function upscale(imageUrl, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/upscale`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, ...options })
  })

  if (!response.ok) throw new Error(`Upscale failed: ${response.status}`)
  return response.json()
}

export async function productPhotography(imageUrl, prompt, options = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_MUAPI_KEY not configured')

  const response = await fetch(`${MUAPI_BASE_URL}/product-photography`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ image_url: imageUrl, prompt, ...options })
  })

  if (!response.ok) throw new Error(`Product photography failed: ${response.status}`)
  return response.json()
}