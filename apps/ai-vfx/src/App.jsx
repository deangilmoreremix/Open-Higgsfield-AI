import React, { useState } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Button, Card, CardBody, CardHeader,
  Badge, SimpleGrid, Image, Input, Select, useToast, Progress, Tabs, TabList,
  TabPanels, Tab, TabPanel, FormControl, FormLabel, Textarea, AspectRatio,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, IconButton, Divider
} from '@chakra-ui/react'
import { uploadToStorage } from './lib/supabase'
import {
  applyVFX, applyMotion, applyAIEffects, imageToVideo, uploadFile, pollPrediction, generateWithPolling
} from './lib/muapi'

const CAMERA_EFFECTS = [
  { id: 'crash_zoom_in', name: 'Crash Zoom In', icon: '🔍', prompt: 'zoom in rapidly' },
  { id: 'crash_zoom_out', name: 'Crash Zoom Out', icon: '🔭', prompt: 'zoom out rapidly' },
  { id: 'dolly_in', name: 'Dolly In', icon: '➡️', prompt: 'dolly camera move forward' },
  { id: 'dolly_out', name: 'Dolly Out', icon: '⬅️', prompt: 'dolly camera move backward' },
  { id: 'crane_up', name: 'Crane Up', icon: '⬆️', prompt: 'crane camera movement up' },
  { id: 'crane_down', name: 'Crane Down', icon: '⬇️', prompt: 'crane camera movement down' },
  { id: 'orbit_360', name: '360 Orbit', icon: '🔄', prompt: 'orbit 360 degrees around subject' },
  { id: 'arc_shot', name: 'Arc Shot', icon: '🌙', prompt: 'arc camera shot' },
  { id: 'hero_run', name: 'Hero Run', icon: '🏃', prompt: 'hero running camera follow' },
  { id: 'matrix_shot', name: 'Matrix Shot', icon: '💫', prompt: 'matrix bullet time effect' },
  { id: 'car_chase', name: 'Car Chase', icon: '🚗', prompt: 'car chase camera movement' },
  { id: 'vertigo_effect', name: 'Vertigo Effect', icon: '🌀', prompt: 'vertigo dolly zoom effect' },
]

const VFX_EFFECTS = [
  { id: 'building_explosion', name: 'Building Explosion', icon: '💥', prompt: 'building explosion' },
  { id: 'car_explosion', name: 'Car Explosion', icon: '🚙', prompt: 'car explosion' },
  { id: 'fire', name: 'Fire', icon: '🔥', prompt: 'fire flames surrounding' },
  { id: 'lightning', name: 'Lightning', icon: '⚡', prompt: 'lightning strike' },
  { id: 'tornado', name: 'Tornado', icon: '🌪️', prompt: 'tornado destruction' },
  { id: 'tsunami', name: 'Tsunami', icon: '🌊', prompt: 'tsunami wave' },
  { id: 'disintegration', name: 'Disintegration', icon: '✨', prompt: 'person disintegrating' },
  { id: 'decay_timelapse', name: 'Decay Time-Lapse', icon: '💀', prompt: 'decay time-lapse effect' },
  { id: 'levitate', name: 'Levitate', icon: '🧘', prompt: 'person levitating' },
  { id: 'flying', name: 'Flying', icon: '🦅', prompt: 'person flying' },
  { id: 'invisibility', name: 'Invisibility', icon: '👻', prompt: 'becoming invisible' },
  { id: 'tentacles', name: 'Tentacles', icon: '🐙', prompt: 'tentacles appearing' },
]

const AI_EFFECTS = [
  { id: 'kiss_me', name: 'Kiss Me AI', icon: '💋', prompt: 'kiss me ai effect' },
  { id: 'venom', name: 'Venom', icon: '🕷️', prompt: 'venom transformation' },
  { id: 'hulk', name: 'Hulk', icon: '💪', prompt: 'hulk transformation' },
  { id: 'muscle_surge', name: 'Muscle Surge', icon: '🏋️', prompt: 'muscle surge effect' },
  { id: 'tiger_touch', name: 'Tiger Touch', icon: '🐯', prompt: 'tiger touch effect' },
  { id: 'cakeify', name: 'Cakeify', icon: '🎂', prompt: 'cakeify effect' },
  { id: 'robotic_reveal', name: 'Robotic Face Reveal', icon: '🤖', prompt: 'robotic face reveal' },
  { id: 'turning_metal', name: 'Turning Metal', icon: '🔩', prompt: 'turning into metal' },
  { id: 'vhs_footage', name: 'VHS Footage', icon: '📼', prompt: 'vhs retro footage' },
  { id: 'samurai', name: 'Samurai It', icon: '⚔️', prompt: 'samurai style' },
  { id: 'film_noir', name: 'Film Noir', icon: '🎬', prompt: 'film noir style' },
  { id: 'inflate_it', name: 'Inflate It', icon: '🎈', prompt: 'inflate effect' },
]

function EffectCard({ effect, onClick, selected }) {
  return (
    <Card
      bg={selected ? 'blue.900' : 'gray.800'}
      cursor="pointer"
      onClick={() => onClick(effect)}
      borderWidth="2px"
      borderColor={selected ? 'blue.500' : 'transparent'}
      _hover={{ borderColor: 'blue.400', transform: 'scale(1.02)' }}
      transition="all 0.2s"
    >
      <CardBody p={3}>
        <VStack spacing={1}>
          <Text fontSize="2xl">{effect.icon}</Text>
          <Text fontSize="sm" fontWeight={selected ? 'bold' : 'normal'} textAlign="center">
            {effect.name}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [selectedEffect, setSelectedEffect] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [resolution, setResolution] = useState('480p')
  const [quality, setQuality] = useState('medium')
  const [duration, setDuration] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultUrl] = useState(null)
  const [generationStatus, setGenerationStatus] = useState('')
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const toast = useToast()

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setImageUrl(previewUrl)

    try {
      setGenerationStatus('Uploading file...')
      const uploadResult = await uploadFile(file)
      if (uploadResult.url) {
        setUploadedUrl(uploadResult.url)
        toast({ title: 'File uploaded successfully', status: 'success', duration: 2000 })
      }
    } catch (err) {
      toast({ title: `Upload error: ${err.message}`, status: 'error', duration: 5000 })
    }
  }

  const handleUrlSubmit = async () => {
    if (!imageUrl) return
    setUploadedUrl(imageUrl)
    toast({ title: 'Using image URL', status: 'info', duration: 2000 })
  }

  const handleGenerate = async () => {
    if (!selectedEffect) {
      toast({ title: 'Please select an effect', status: 'warning', duration: 3000 })
      return
    }
    if (!uploadedUrl && !imageUrl) {
      toast({ title: 'Please upload an image or enter URL', status: 'warning', duration: 3000 })
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setResultUrl(null)
    setGenerationStatus('Submitting generation request...')

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 5, 90))
    }, 1000)

    try {
      const targetUrl = uploadedUrl || imageUrl
      const effectPrompt = prompt || selectedEffect.prompt

      let result
      if (activeTab === 0) {
        result = await applyVFX(targetUrl, effectPrompt, selectedEffect.name, {
          aspectRatio, resolution, quality, duration
        })
      } else if (activeTab === 1) {
        result = await applyMotion(targetUrl, effectPrompt, selectedEffect.name, {
          aspectRatio, resolution, quality, duration
        })
      } else {
        result = await applyAIEffects(targetUrl, effectPrompt, selectedEffect.name, {
          aspectRatio, resolution, quality, duration
        })
      }

      clearInterval(progressInterval)
      setProgress(100)

      if (result.data?.request_id) {
        setGenerationStatus('Processing video...')
        const finalResult = await pollPrediction(result.data.request_id)
        if (finalResult.video?.url) {
          setResultUrl(finalResult.video.url)
          toast({ title: 'Video generated successfully!', status: 'success', duration: 3000 })
        }
      } else if (result.video?.url) {
        setResultUrl(result.video.url)
        toast({ title: 'Video generated successfully!', status: 'success', duration: 3000 })
      } else {
        throw new Error('No video URL in response')
      }
    } catch (err) {
      clearInterval(progressInterval)
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
      setGenerationStatus('')
    }
  }

  const handleImageToVideo = async () => {
    if (!uploadedUrl && !imageUrl) {
      toast({ title: 'Please upload an image first', status: 'warning', duration: 3000 })
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setResultUrl(null)

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 3, 90))
    }, 1000)

    try {
      setGenerationStatus('Generating video from image...')
      const targetUrl = uploadedUrl || imageUrl
      const result = await imageToVideo(targetUrl, {
        aspect_ratio: aspectRatio,
        resolution,
        quality,
        duration
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (result.data?.request_id) {
        const finalResult = await pollPrediction(result.data.request_id)
        if (finalResult.video?.url) {
          setResultUrl(finalResult.video.url)
        }
      } else if (result.video?.url) {
        setResultUrl(result.video.url)
      } else {
        throw new Error('No video URL in response')
      }

      toast({ title: 'Video generated!', status: 'success', duration: 3000 })
    } catch (err) {
      clearInterval(progressInterval)
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
      setGenerationStatus('')
    }
  }

  const currentEffects = activeTab === 0 ? VFX_EFFECTS : activeTab === 1 ? CAMERA_EFFECTS : AI_EFFECTS

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box position="fixed" top={0} left={0} right={0} bg="gray.800" p={4} zIndex={100}>
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">🎬 AI VFX Studio</Text>
            <Badge colorScheme="purple">Powered by MuAPI</Badge>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="blue">VFX</Badge>
            <Badge colorScheme="green">Motion</Badge>
            <Badge colorScheme="orange">AI Effects</Badge>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="70px" p={6} gap={6}>
        <Box w="320px">
          <Card bg="gray.800" mb={4}>
            <CardHeader>
              <Text fontWeight="bold">Upload Image</Text>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Image URL</FormLabel>
                  <HStack>
                    <Input
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="Paste image URL"
                      bg="gray.700"
                    />
                    <Button onClick={handleUrlSubmit} colorScheme="blue" isDisabled={!imageUrl}>
                      Use
                    </Button>
                  </HStack>
                </FormControl>

                <Divider />

                <FormControl>
                  <FormLabel>Upload File</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    bg="gray.700"
                    p={1}
                  />
                </FormControl>

                {(imageUrl || uploadedUrl) && (
                  <Box>
                    <Text fontSize="sm" color="gray.400" mb={2}>Preview:</Text>
                    <AspectRatio ratio={16/9}>
                      <Image src={uploadedUrl || imageUrl} alt="Preview" borderRadius="md" objectFit="cover" />
                    </AspectRatio>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card bg="gray.800" mb={4}>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel>Aspect Ratio</FormLabel>
                  <Select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} bg="gray.700">
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Resolution</FormLabel>
                  <Select value={resolution} onChange={e => setResolution(e.target.value)} bg="gray.700">
                    <option value="480p">480p</option>
                    <option value="720p">720p</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Quality: {quality}</FormLabel>
                  <Select value={quality} onChange={e => setQuality(e.target.value)} bg="gray.700">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Duration: {duration}s</FormLabel>
                  <Select value={duration} onChange={e => setDuration(parseInt(e.target.value))} bg="gray.700">
                    <option value="5">5 seconds</option>
                    <option value="10">10 seconds</option>
                  </Select>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="gray.800">
            <CardBody>
              <FormControl>
                <FormLabel>Custom Prompt (optional)</FormLabel>
                <Textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Add custom details to the effect..."
                  rows={3}
                />
              </FormControl>
            </CardBody>
          </Card>
        </Box>

        <Box flex={1}>
          <Tabs variant="soft-rounded" colorScheme="purple" onChange={i => setActiveTab(i)} mb={4}>
            <TabList>
              <Tab>💥 VFX</Tab>
              <Tab>🎥 Motion</Tab>
              <Tab>🤖 AI Effects</Tab>
              <Tab>🎬 Image to Video</Tab>
            </TabList>
          </Tabs>

          <SimpleGrid columns={6} spacing={3} mb={6}>
            {currentEffects.map(effect => (
              <EffectCard
                key={effect.id}
                effect={effect}
                onClick={setSelectedEffect}
                selected={selectedEffect?.id === effect.id}
              />
            ))}
          </SimpleGrid>

          {selectedEffect && (
            <Card bg="gray.800" mb={4}>
              <CardBody>
                <HStack justify="space-between">
                  <HStack>
                    <Text fontSize="2xl">{selectedEffect.icon}</Text>
                    <Box>
                      <Text fontWeight="bold">{selectedEffect.name}</Text>
                      <Text fontSize="sm" color="gray.400">{selectedEffect.prompt}</Text>
                    </Box>
                  </HStack>
                  <Button
                    colorScheme="purple"
                    size="lg"
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                    isDisabled={!uploadedUrl && !imageUrl}
                  >
                    Generate Video
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          )}

          {isGenerating && (
            <Card bg="gray.800" mb={4}>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Text fontWeight="bold">{generationStatus || 'Generating...'}</Text>
                  <Progress value={progress} colorScheme="purple" size="sm" borderRadius="full" />
                  <Text fontSize="sm" color="gray.400">This may take 1-3 minutes</Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          {resultUrl && (
            <Card bg="gray.800">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold">Generated Video</Text>
                  <HStack>
                    <Button as="a" href={resultUrl} target="_blank" colorScheme="blue" size="sm">
                      Open
                    </Button>
                    <Button colorScheme="green" size="sm">
                      Download
                    </Button>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <AspectRatio ratio={16/9}>
                  <video src={resultUrl} controls borderRadius="md" />
                </AspectRatio>
              </CardBody>
            </Card>
          )}

          {activeTab === 3 && !resultUrl && (
            <Card bg="gray.800">
              <CardBody>
                <VStack spacing={4}>
                  <Text fontSize="4xl">🎬</Text>
                  <Text fontWeight="bold">Image to Video</Text>
                  <Text color="gray.400" textAlign="center">
                    Transform your static images into dynamic videos with cinematic motion.
                    Upload an image and click generate to create a video.
                  </Text>
                  <Button
                    colorScheme="green"
                    size="lg"
                    onClick={handleImageToVideo}
                    isLoading={isGenerating}
                    isDisabled={!uploadedUrl && !imageUrl}
                  >
                    🎬 Generate Video from Image
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
        </Box>
      </Flex>
    </Box>
  )
}

export default App