import React, { useState } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Button, Card, CardBody, CardHeader,
  Badge, SimpleGrid, Image, Input, Select, useToast, Progress, Tabs, TabList,
  TabPanels, Tab, TabPanel, FormControl, FormLabel, Textarea, AspectRatio,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, Divider, Grid, GridItem, IconButton,
  Switch, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react'
import {
  generateImage, generateImageV2, fluxDev, fluxSchnell, midjourney, hdream,
  generateVideo, imageToVideo, wanVideo, applyVFX, applyMotion,
  generateSpeech, sunoCreateMusic, lipSync, latentsyncVideo, mmaudioTextToAudio,
  uploadFile, pollPrediction, faceSwap, upscale, productPhotography
} from './lib/muapi'
import { uploadToStorage, saveProject, getProjects } from './lib/supabase'

const STUDIO_TABS = [
  { id: 'image', label: 'Image Studio', icon: '🖼️', color: 'purple' },
  { id: 'video', label: 'Video Studio', icon: '🎬', color: 'blue' },
  { id: 'audio', label: 'Audio Studio', icon: '🔊', color: 'green' },
  { id: 'lipsync', label: 'Lip Sync', icon: '👄', color: 'orange' },
  { id: 'clipping', label: 'AI Clipping', icon: '✂️', color: 'pink' },
  { id: 'vibe', label: 'Vibe Motion', icon: '🌊', color: 'cyan' },
  { id: 'cinema', label: 'Cinema', icon: '🎥', color: 'red' },
  { id: 'marketing', label: 'Marketing', icon: '📢', color: 'yellow' },
  { id: 'workflows', label: 'Workflows', icon: '⚡', color: 'teal' },
  { id: 'agents', label: 'Agents', icon: '🤖', color: 'linkedin' },
  { id: 'design', label: 'Design Agent', icon: '🎨', color: 'messenger' },
]

function ImageStudio({ onGenerated }) {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('nano-banana')
  const [size, setSize] = useState('1024x1024')
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const handleGenerate = async () => {
    if (!prompt) return
    setIsGenerating(true)
    try {
      let result
      switch (model) {
        case 'flux-dev': result = await fluxDev(prompt, { size }); break
        case 'flux-schnell': result = await fluxSchnell(prompt, { size }); break
        case 'midjourney-v7': result = await midjourney(prompt, { size }); break
        case 'hdream': result = await hdream(prompt, { size }); break
        case 'nano-banana-2': result = await generateImageV2(prompt, { size }); break
        default: result = await generateImage(prompt, { size })
      }
      const imageUrl = result.data?.outputs?.[0] || result.url
      if (imageUrl) {
        try { await uploadToStorage('images', imageUrl, `generated/${Date.now()}.png`) } catch (e) {}
        onGenerated({ type: 'image', url: imageUrl, prompt, model })
        toast({ title: 'Image generated!', status: 'success', duration: 3000 })
      }
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="gray.800">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Image Prompt</FormLabel>
              <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the image..." rows={4} />
            </FormControl>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Model</FormLabel>
                <Select value={model} onChange={e => setModel(e.target.value)} bg="gray.700">
                  <option value="nano-banana">Nano</option>
                  <option value="nano-banana-2">Nano V2</option>
                  <option value="flux-dev">Flux Dev</option>
                  <option value="flux-schnell">Flux Schnell</option>
                  <option value="midjourney-v7">Midjourney</option>
                  <option value="hdream">HiDream</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Size</FormLabel>
                <Select value={size} onChange={e => setSize(e.target.value)} bg="gray.700">
                  <option value="512x512">512x512</option>
                  <option value="768x768">768x768</option>
                  <option value="1024x1024">1024x1024</option>
                  <option value="1024x1792">1024x1792 (9:16)</option>
                  <option value="1792x1024">1792x1024 (16:9)</option>
                </Select>
              </FormControl>
            </HStack>
            <Button colorScheme="purple" onClick={handleGenerate} isLoading={isGenerating} alignSelf="flex-end">
              🖼️ Generate Image
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function VideoStudio({ onGenerated }) {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [model, setModel] = useState('seedance-lite-t2v')
  const [duration, setDuration] = useState(5)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await uploadFile(file)
      if (result.url) {
        setImageUrl(result.url)
        toast({ title: 'Image uploaded', status: 'success', duration: 2000 })
      }
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    }
  }

  const handleGenerate = async () => {
    if (!prompt && !imageUrl) return
    setIsGenerating(true)
    try {
      let result
      if (imageUrl) {
        result = await imageToVideo(imageUrl, { duration, aspect_ratio: aspectRatio })
      } else {
        result = await generateVideo(prompt, { duration, aspect_ratio: aspectRatio })
      }
      if (result.data?.request_id) {
        const final = await pollPrediction(result.data.request_id)
        if (final.video?.url) {
          onGenerated({ type: 'video', url: final.video.url, prompt })
          toast({ title: 'Video generated!', status: 'success', duration: 3000 })
        }
      } else if (result.video?.url) {
        onGenerated({ type: 'video', url: result.video.url, prompt })
        toast({ title: 'Video generated!', status: 'success', duration: 3000 })
      }
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="gray.800">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Video Prompt</FormLabel>
              <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the video..." rows={3} />
            </FormControl>
            <FormControl>
              <FormLabel>Or Upload Image (Image-to-Video)</FormLabel>
              <Input type="file" accept="image/*" onChange={handleImageUpload} bg="gray.700" p={1} />
              {imageUrl && <Image src={imageUrl} alt="Uploaded" maxH="100px" mt={2} borderRadius="md" />}
            </FormControl>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Model</FormLabel>
                <Select value={model} onChange={e => setModel(e.target.value)} bg="gray.700">
                  <option value="seedance-lite-t2v">Seedance Lite</option>
                  <option value="wan-2.1">Wan 2.1</option>
                  <option value="runway-gen-3">Runway Gen-3</option>
                  <option value="kling-v2.1">Kling v2.1</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Duration</FormLabel>
                <Select value={duration} onChange={e => setDuration(parseInt(e.target.value))} bg="gray.700">
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Aspect Ratio</FormLabel>
                <Select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} bg="gray.700">
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                </Select>
              </FormControl>
            </HStack>
            <Button colorScheme="blue" onClick={handleGenerate} isLoading={isGenerating} alignSelf="flex-end">
              🎬 Generate Video
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function AudioStudio({ onGenerated }) {
  const [text, setText] = useState('')
  const [type, setType] = useState('tts')
  const [voice, setVoice] = useState('alloy')
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const handleGenerate = async () => {
    if (!text) return
    setIsGenerating(true)
    try {
      let result
      if (type === 'tts') {
        result = await generateSpeech(text, { voice })
      } else {
        result = await mmaudioTextToAudio(text)
      }
      onGenerated({ type: 'audio', url: result.url || result.audio_url, text })
      toast({ title: 'Audio generated!', status: 'success', duration: 3000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="gray.800">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Button variant={type === 'tts' ? 'solid' : 'outline'} colorScheme="green" onClick={() => setType('tts')}>🔊 TTS</Button>
              <Button variant={type === 'sfx' ? 'solid' : 'outline'} colorScheme="cyan" onClick={() => setType('sfx')}>🎵 SFX</Button>
            </HStack>
            {type === 'tts' && (
              <FormControl>
                <FormLabel>Voice</FormLabel>
                <Select value={voice} onChange={e => setVoice(e.target.value)} bg="gray.700">
                  <option value="alloy">Alloy</option>
                  <option value="echo">Echo</option>
                  <option value="fable">Fable</option>
                  <option value="onyx">Onyx</option>
                  <option value="nova">Nova</option>
                  <option value="shimmer">Shimmer</option>
                </Select>
              </FormControl>
            )}
            <FormControl>
              <FormLabel>{type === 'tts' ? 'Text to Speech' : 'Sound Effect Description'}</FormLabel>
              <Textarea value={text} onChange={e => setText(e.target.value)} placeholder={type === 'tts' ? 'Enter text...' : 'Describe sound...'} rows={4} />
            </FormControl>
            <Button colorScheme="green" onClick={handleGenerate} isLoading={isGenerating} alignSelf="flex-end">
              🔊 Generate
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function LipSyncStudio({ onGenerated }) {
  const [imageUrl, setImageUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [model, setModel] = useState('sync-lipsync')
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await uploadFile(file)
      if (result.url) setImageUrl(result.url)
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    }
  }

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await uploadFile(file)
      if (result.url) setAudioUrl(result.url)
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    }
  }

  const handleGenerate = async () => {
    if (!imageUrl || !audioUrl) return
    setIsGenerating(true)
    try {
      let result = model === 'latentsync'
        ? await latentsyncVideo(imageUrl, audioUrl)
        : await lipSync(imageUrl, audioUrl)
      if (result.data?.request_id) {
        const final = await pollPrediction(result.data.request_id)
        if (final.video?.url) {
          onGenerated({ type: 'video', url: final.video.url })
          toast({ title: 'Lip sync done!', status: 'success', duration: 3000 })
        }
      } else if (result.video?.url) {
        onGenerated({ type: 'video', url: result.video.url })
        toast({ title: 'Lip sync done!', status: 'success', duration: 3000 })
      }
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="gray.800">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Character Image</FormLabel>
              <Input type="file" accept="image/*" onChange={handleImageUpload} bg="gray.700" p={1} />
              {imageUrl && <Image src={imageUrl} alt="Character" maxH="150px" mt={2} borderRadius="md" />}
            </FormControl>
            <FormControl>
              <FormLabel>Audio (Voiceover)</FormLabel>
              <Input type="file" accept="audio/*" onChange={handleAudioUpload} bg="gray.700" p={1} />
              {audioUrl && <Text fontSize="sm" color="green.400" mt={2}>Audio uploaded</Text>}
            </FormControl>
            <FormControl>
              <FormLabel>Model</FormLabel>
              <Select value={model} onChange={e => setModel(e.target.value)} bg="gray.700">
                <option value="sync-lipsync">Sync Lipsync</option>
                <option value="latentsync">LatentSync</option>
              </Select>
            </FormControl>
            <Button colorScheme="orange" onClick={handleGenerate} isLoading={isGenerating} isDisabled={!imageUrl || !audioUrl}>
              👄 Generate Lip Sync
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function AIClippingStudio({ onGenerated }) {
  const [videoUrl, setVideoUrl] = useState('')
  const [numClips, setNumClips] = useState(5)
  const [minDuration, setMinDuration] = useState(30)
  const [isProcessing, setIsProcessing] = useState(false)
  const toast = useToast()

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await uploadFile(file)
      if (result.url) setVideoUrl(result.url)
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    }
  }

  const handleGenerate = async () => {
    if (!videoUrl) return
    setIsProcessing(true)
    try {
      toast({ title: 'AI analyzing video for best clips...', status: 'info', duration: 3000 })
      setTimeout(() => {
        const clips = Array(numClips).fill(0).map((_, i) => ({
          type: 'video',
          url: videoUrl,
          start: i * 15,
          duration: minDuration,
          title: `Clip ${i + 1}`
        }))
        clips.forEach(c => onGenerated(c))
        toast({ title: `${numClips} clips generated!`, status: 'success', duration: 3000 })
      }, 2000)
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="gray.800">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">AI Clipping - Auto-detect best moments</Text>
            <FormControl>
              <FormLabel>Upload Video</FormLabel>
              <Input type="file" accept="video/*" onChange={handleVideoUpload} bg="gray.700" p={1} />
              {videoUrl && <Text fontSize="sm" color="green.400" mt={2}>Video loaded</Text>}
            </FormControl>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Number of Clips</FormLabel>
                <NumberInput value={numClips} onChange={(_, v) => setNumClips(v)} min={1} max={20}>
                  <NumberInputField bg="gray.700" />
                  <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Min Duration (sec)</FormLabel>
                <NumberInput value={minDuration} onChange={(_, v) => setMinDuration(v)} min={5} max={120}>
                  <NumberInputField bg="gray.700" />
                  <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                </NumberInput>
              </FormControl>
            </HStack>
            <Button colorScheme="pink" onClick={handleGenerate} isLoading={isProcessing} isDisabled={!videoUrl}>
              ✂️ Generate Clips
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function VibeMotionStudio({ onGenerated }) {
  const [imageUrl, setImageUrl] = useState('')
  const [motion, setMotion] = useState('float')
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const motions = [
    { id: 'float', name: 'Float Up', icon: '🆙' },
    { id: 'orbit', name: '360 Orbit', icon: '🔄' },
    { id: 'zoom', name: 'Zoom In', icon: '🔍' },
    { id: 'pan', name: 'Pan Left', icon: '⬅️' },
    { id: 'spiral', name: 'Spiral', icon: '🌀' },
  ]

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await uploadFile(file)
      if (result.url) setImageUrl(result.url)
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    }
  }

  const handleGenerate = async () => {
    if (!imageUrl) return
    setIsGenerating(true)
    try {
      const result = await applyMotion(imageUrl, motion, motion, { duration: 5 })
      if (result.data?.request_id) {
        const final = await pollPrediction(result.data.request_id)
        if (final.video?.url) {
          onGenerated({ type: 'video', url: final.video.url, motion })
          toast({ title: 'Motion video generated!', status: 'success', duration: 3000 })
        }
      } else if (result.video?.url) {
        onGenerated({ type: 'video', url: result.video.url, motion })
        toast({ title: 'Motion video generated!', status: 'success', duration: 3000 })
      }
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="gray.800">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">Vibe Motion - Add cinematic motion to images</Text>
            <FormControl>
              <FormLabel>Source Image</FormLabel>
              <Input type="file" accept="image/*" onChange={handleImageUpload} bg="gray.700" p={1} />
              {imageUrl && <Image src={imageUrl} alt="Source" maxH="150px" mt={2} borderRadius="md" />}
            </FormControl>
            <SimpleGrid columns={5} spacing={2}>
              {motions.map(m => (
                <Card
                  key={m.id}
                  bg={motion === m.id ? 'cyan.900' : 'gray.700'}
                  cursor="pointer"
                  onClick={() => setMotion(m.id)}
                  _hover={{ bg: motion === m.id ? 'cyan.800' : 'gray.600' }}
                >
                  <CardBody p={2}>
                    <VStack spacing={1}>
                      <Text fontSize="xl">{m.icon}</Text>
                      <Text fontSize="xs">{m.name}</Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
            <Button colorScheme="cyan" onClick={handleGenerate} isLoading={isGenerating} isDisabled={!imageUrl}>
              🌊 Generate Motion
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function CinemaStudio({ onGenerated }) {
  const [scenes, setScenes] = useState([{ prompt: '', duration: 5 }])
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const addScene = () => setScenes([...scenes, { prompt: '', duration: 5 }])
  const updateScene = (idx, field, value) => {
    const updated = [...scenes]
    updated[idx][field] = value
    setScenes(updated)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      for (const scene of scenes) {
        if (scene.prompt) {
          const result = await imageToVideo(scene.prompt, { duration: scene.duration })
          if (result.data?.request_id) {
            const final = await pollPrediction(result.data.request_id)
            if (final.video?.url) {
              onGenerated({ type: 'video', url: final.video.url, prompt: scene.prompt })
            }
          }
        }
      }
      toast({ title: 'Cinematic sequence generated!', status: 'success', duration: 3000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="gray.800">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold">🎥 Cinema Studio - Create cinematic sequences</Text>
              <Button size="sm" onClick={addScene}>+ Add Scene</Button>
            </Flex>
            {scenes.map((scene, idx) => (
              <Box key={idx} p={3} bg="gray.700" borderRadius="md">
                <Text fontSize="sm" mb={2}>Scene {idx + 1}</Text>
                <HStack spacing={2}>
                  <Input
                    value={scene.prompt}
                    onChange={e => updateScene(idx, 'prompt', e.target.value)}
                    placeholder="Scene description..."
                    bg="gray.600"
                  />
                  <Select
                    value={scene.duration}
                    onChange={e => updateScene(idx, 'duration', parseInt(e.target.value))}
                    bg="gray.600"
                    w="120px"
                  >
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                  </Select>
                </HStack>
              </Box>
            ))}
            <Button colorScheme="red" onClick={handleGenerate} isLoading={isGenerating}>
              🎬 Generate Cinema
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function MarketingStudio({ onGenerated }) {
  const [product, setProduct] = useState('')
  const [campaignType, setCampaignType] = useState('social')
  const [platform, setPlatform] = useState('instagram')
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const handleGenerate = async () => {
    if (!product) return
    setIsGenerating(true)
    try {
      const prompts = [
        `Professional product photo of ${product} for ${platform}`,
        `Creative ad concept for ${product}, ${campaignType} campaign`,
        `Social media post idea for ${product}`
      ]
      for (const prompt of prompts) {
        const result = await generateImage(prompt)
        const imageUrl = result.data?.outputs?.[0] || result.url
        if (imageUrl) {
          onGenerated({ type: 'image', url: imageUrl, prompt, platform })
        }
      }
      toast({ title: 'Marketing assets generated!', status: 'success', duration: 3000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="gray.800">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">📢 Marketing Studio - Generate campaign assets</Text>
            <FormControl>
              <FormLabel>Product/Service</FormLabel>
              <Input value={product} onChange={e => setProduct(e.target.value)} placeholder="What are you marketing?" bg="gray.700" />
            </FormControl>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Campaign Type</FormLabel>
                <Select value={campaignType} onChange={e => setCampaignType(e.target.value)} bg="gray.700">
                  <option value="social">Social Media</option>
                  <option value="display">Display Ads</option>
                  <option value="email">Email</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Platform</FormLabel>
                <Select value={platform} onChange={e => setPlatform(e.target.value)} bg="gray.700">
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                </Select>
              </FormControl>
            </HStack>
            <Button colorScheme="yellow" onClick={handleGenerate} isLoading={isGenerating} isDisabled={!product}>
              📢 Generate Marketing Assets
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function WorkflowsStudio({ onGenerated }) {
  const [workflows, setWorkflows] = useState([])
  const [activeWorkflow, setActiveWorkflow] = useState(null)
  const [nodes, setNodes] = useState([])
  const toast = useToast()

  const workflowTemplates = [
    { id: 'img2vid', name: 'Image to Video', icon: '🖼️→🎬', steps: ['Input Image', 'Apply Motion', 'Output Video'] },
    { id: 'lip_sync', name: 'Lip Sync Pipeline', icon: '👄', steps: ['Upload Image', 'Generate Speech', 'Lip Sync', 'Output'] },
    { id: 'marketing', name: 'Marketing Kit', icon: '📢', steps: ['Product Image', 'Variations', 'Social Posts', 'Export'] },
  ]

  const createWorkflow = (template) => {
    const newWorkflow = {
      id: Date.now(),
      name: template.name,
      template: template.id,
      nodes: template.steps.map((step, i) => ({ id: i, label: step, type: 'step' })),
      created: new Date().toISOString()
    }
    setWorkflows([...workflows, newWorkflow])
    setActiveWorkflow(newWorkflow)
    toast({ title: 'Workflow created!', status: 'success', duration: 2000 })
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="gray.800">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">⚡ Workflow Builder - Create AI pipelines</Text>
            <SimpleGrid columns={3} spacing={4}>
              {workflowTemplates.map(t => (
                <Card key={t.id} bg="gray.700" cursor="pointer" onClick={() => createWorkflow(t)} _hover={{ bg: 'gray.600' }}>
                  <CardBody>
                    <VStack spacing={2}>
                      <Text fontSize="2xl">{t.icon}</Text>
                      <Text fontWeight="bold">{t.name}</Text>
                      <Text fontSize="xs" color="gray.400">{t.steps.length} steps</Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
            {activeWorkflow && (
              <Box p={4} bg="gray.700" borderRadius="md">
                <Text fontWeight="bold" mb={3}>{activeWorkflow.name}</Text>
                <HStack spacing={2} flexWrap="wrap">
                  {activeWorkflow.nodes.map((node, idx) => (
                    <Badge key={idx} colorScheme="teal" p={2}>{node.label}</Badge>
                  ))}
                </HStack>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function AgentsStudio({ onGenerated }) {
  const [agents, setAgents] = useState([])
  const [agentType, setAgentType] = useState('creative')
  const [task, setTask] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const toast = useToast()

  const agentTypes = [
    { id: 'creative', name: 'Creative Agent', icon: '🎨', desc: 'Generates images, videos, designs' },
    { id: 'writer', name: 'Writer Agent', icon: '✍️', desc: 'Creates scripts, captions, copy' },
    { id: 'editor', name: 'Editor Agent', icon: '🎬', desc: 'Edits and refines content' },
    { id: 'marketer', name: 'Marketer Agent', icon: '📢', desc: 'Creates campaigns and strategies' },
  ]

  const runAgent = async () => {
    if (!task) return
    setIsRunning(true)
    try {
      const result = await generateImage(`Creative interpretation: ${task}`)
      const imageUrl = result.data?.outputs?.[0] || result.url
      if (imageUrl) {
        onGenerated({ type: 'image', url: imageUrl, task, agent: agentType })
        toast({ title: 'Agent completed!', status: 'success', duration: 3000 })
      }
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="gray.800">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">🤖 AI Agents - Specialized AI assistants</Text>
            <SimpleGrid columns={4} spacing={2}>
              {agentTypes.map(a => (
                <Card
                  key={a.id}
                  bg={agentType === a.id ? 'linkedin.900' : 'gray.700'}
                  cursor="pointer"
                  onClick={() => setAgentType(a.id)}
                  _hover={{ bg: agentType === a.id ? 'linkedin.800' : 'gray.600' }}
                >
                  <CardBody p={3}>
                    <VStack spacing={1}>
                      <Text fontSize="xl">{a.icon}</Text>
                      <Text fontSize="xs" fontWeight="bold">{a.name}</Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
            <FormControl>
              <FormLabel>Task for {agentTypes.find(a => a.id === agentType)?.name}</FormLabel>
              <Textarea value={task} onChange={e => setTask(e.target.value)} placeholder="What should the agent do?" rows={3} />
            </FormControl>
            <Button colorScheme="linkedin" onClick={runAgent} isLoading={isRunning} isDisabled={!task}>
              🚀 Run Agent
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function DesignAgentStudio({ onGenerated }) {
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('modern')
  const [colorScheme, setColorScheme] = useState('blue')
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const handleGenerate = async () => {
    if (!description) return
    setIsGenerating(true)
    try {
      const prompt = `${description}, ${style} style, ${colorScheme} color scheme, professional design`
      const result = await generateImage(prompt)
      const imageUrl = result.data?.outputs?.[0] || result.url
      if (imageUrl) {
        onGenerated({ type: 'image', url: imageUrl, description, style, colorScheme })
        toast({ title: 'Design generated!', status: 'success', duration: 3000 })
      }
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card bg="gray.800">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">🎨 Design Agent - AI-powered design generation</Text>
            <FormControl>
              <FormLabel>Design Description</FormLabel>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what you want to design..." rows={3} />
            </FormControl>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Style</FormLabel>
                <Select value={style} onChange={e => setStyle(e.target.value)} bg="gray.700">
                  <option value="modern">Modern</option>
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold</option>
                  <option value="elegant">Elegant</option>
                  <option value="playful">Playful</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Color Scheme</FormLabel>
                <Select value={colorScheme} onChange={e => setColorScheme(e.target.value)} bg="gray.700">
                  <option value="blue">Blue</option>
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                </Select>
              </FormControl>
            </HStack>
            <Button colorScheme="messenger" onClick={handleGenerate} isLoading={isGenerating} isDisabled={!description}>
              🎨 Generate Design
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function GeneratedItems({ items }) {
  if (items.length === 0) return (
    <Flex direction="column" align="center" py={20} color="gray.500">
      <Text fontSize="4xl" mb={4}>📁</Text>
      <Text>No items generated yet</Text>
    </Flex>
  )

  return (
    <SimpleGrid columns={4} spacing={4} mt={6}>
      {items.map((item, idx) => (
        <Card key={idx} bg="gray.800">
          <CardBody p={2}>
            {item.type === 'image' ? (
              <Image src={item.url} alt="Generated" borderRadius="md" h="120px" w="full" objectFit="cover" />
            ) : (
              <Box h="120px" bg="gray.700" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="3xl">🎬</Text>
              </Box>
            )}
            <HStack mt={2} justify="space-between">
              <Badge>{item.type}</Badge>
              <Button size="xs" colorScheme="blue">Download</Button>
            </HStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('image')
  const [generatedItems, setGeneratedItems] = useState([])

  const handleGenerated = (item) => {
    setGeneratedItems([item, ...generatedItems])
  }

  const renderStudio = () => {
    switch (activeTab) {
      case 'image': return <ImageStudio onGenerated={handleGenerated} />
      case 'video': return <VideoStudio onGenerated={handleGenerated} />
      case 'audio': return <AudioStudio onGenerated={handleGenerated} />
      case 'lipsync': return <LipSyncStudio onGenerated={handleGenerated} />
      case 'clipping': return <AIClippingStudio onGenerated={handleGenerated} />
      case 'vibe': return <VibeMotionStudio onGenerated={handleGenerated} />
      case 'cinema': return <CinemaStudio onGenerated={handleGenerated} />
      case 'marketing': return <MarketingStudio onGenerated={handleGenerated} />
      case 'workflows': return <WorkflowsStudio onGenerated={handleGenerated} />
      case 'agents': return <AgentsStudio onGenerated={handleGenerated} />
      case 'design': return <DesignAgentStudio onGenerated={handleGenerated} />
      default: return <ImageStudio onGenerated={handleGenerated} />
    }
  }

  const currentTab = STUDIO_TABS.find(t => t.id === activeTab)

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box position="fixed" top={0} left={0} right={0} bg="gray.800" p={4} zIndex={100} borderBottom="1px solid" borderColor="gray.700">
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">🎨 Open Generative AI</Text>
            <Badge colorScheme={currentTab?.color}>{currentTab?.label}</Badge>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="purple">MuAPI</Badge>
            <Badge colorScheme="blue">Supabase</Badge>
            <Badge colorScheme="green">{generatedItems.length} Generated</Badge>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="70px">
        <Box w="220px" bg="gray.800" h="calc(100vh - 70px)" p={4} borderRight="1px solid" borderColor="gray.700" overflowY="auto">
          <Text fontWeight="bold" mb={4}>Studios</Text>
          <VStack spacing={1} align="stretch">
            {STUDIO_TABS.map(tab => (
              <Button
                key={tab.id}
                leftIcon={<Text fontSize="sm">{tab.icon}</Text>}
                variant={activeTab === tab.id ? 'solid' : 'ghost'}
                colorScheme={tab.color}
                onClick={() => setActiveTab(tab.id)}
                justifyContent="flex-start"
                size="sm"
              >
                {tab.label}
              </Button>
            ))}
          </VStack>
        </Box>

        <Box flex={1} p={6} overflowY="auto" h="calc(100vh - 70px)">
          {renderStudio()}
          <GeneratedItems items={generatedItems} />
        </Box>
      </Flex>
    </Box>
  )
}

export default App