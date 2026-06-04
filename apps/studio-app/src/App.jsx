import React, { useState } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Button, Input, Select, Card, CardBody,
  CardHeader, Badge, Tabs, TabList, TabPanels, Tab, TabPanel, Textarea,
  Progress, Image, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, FormControl, FormLabel,
  IconButton, SimpleGrid, AspectRatio
} from '@chakra-ui/react'
import { supabase, uploadToStorage, getPublicUrl } from './lib/supabase'
import { generateImage, generateVideo, generateSpeech, lipSync, transcribeAudio, cloneVoice } from './lib/muapi'
import { generateImage as openaiGenerateImage, editImage, textToSpeech, chatCompletion } from './lib/openai'

const STUDIO_TABS = [
  { id: 'image', label: 'Image Studio', icon: '🖼️', color: 'purple' },
  { id: 'video', label: 'Video Studio', icon: '🎬', color: 'blue' },
  { id: 'audio', label: 'Audio Studio', icon: '🔊', color: 'green' },
  { id: 'lipsync', label: 'Lip Sync', icon: '👄', color: 'orange' },
  { id: 'cinema', label: 'Cinema', icon: '🎥', color: 'red' },
  { id: 'marketing', label: 'Marketing', icon: '📢', color: 'cyan' },
]

function ImageStudio() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [size, setSize] = useState('1024x1024')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const handleGenerate = async () => {
    if (!prompt) return
    setIsGenerating(true)
    try {
      const result = await openaiGenerateImage(prompt, 'dall-e-3', size)
      if (result.data && result.data[0]) {
        setGeneratedImages([{ url: result.data[0].url, prompt }, ...generatedImages])
        toast({ title: 'Image generated successfully', status: 'success', duration: 3000 })
      }
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUploadToStorage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `image-${Date.now()}.png`, { type: 'image/png' })
      await uploadToStorage('images', file, `generated/${file.name}`)
      toast({ title: 'Image uploaded to storage', status: 'success', duration: 2000 })
    } catch (err) {
      toast({ title: `Upload error: ${err.message}`, status: 'error', duration: 5000 })
    }
  }

  return (
    <Box>
      <Card bg="gray.800" mb={4}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Image Prompt</FormLabel>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={3}
              />
            </FormControl>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Style</FormLabel>
                <Select value={style} onChange={e => setStyle(e.target.value)} bg="gray.700">
                  <option value="realistic">Realistic</option>
                  <option value="artistic">Artistic</option>
                  <option value="anime">Anime</option>
                  <option value="3d">3D Render</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Size</FormLabel>
                <Select value={size} onChange={e => setSize(e.target.value)} bg="gray.700">
                  <option value="1024x1024">1024x1024</option>
                  <option value="1792x1024">1792x1024</option>
                  <option value="1024x1792">1024x1792</option>
                </Select>
              </FormControl>
            </HStack>
            <Button colorScheme="purple" onClick={handleGenerate} isLoading={isGenerating} alignSelf="flex-end">
              🖼️ Generate Image
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {generatedImages.length > 0 && (
        <SimpleGrid columns={3} spacing={4}>
          {generatedImages.map((img, idx) => (
            <Card key={idx} bg="gray.800" cursor="pointer" onClick={() => { setSelectedImage(img); onOpen() }}>
              <CardBody p={2}>
                <AspectRatio ratio={1}>
                  <Image src={img.url} alt={img.prompt} borderRadius="md" objectFit="cover" />
                </AspectRatio>
                <Text fontSize="xs" mt={2} noOfLines={2}>{img.prompt}</Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>Generated Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedImage && <Image src={selectedImage.url} alt={selectedImage.prompt} borderRadius="md" />}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Close</Button>
            <Button colorScheme="blue" onClick={() => handleUploadToStorage(selectedImage.url)}>Upload to Storage</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

function VideoStudio() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState('5')
  const [isGenerating, setIsGenerating] = useState(false)
  const [videos, setVideos] = useState([])
  const toast = useToast()

  const handleGenerate = async () => {
    if (!prompt) return
    setIsGenerating(true)
    try {
      const result = await generateVideo(prompt, { duration: parseInt(duration) })
      setVideos([{ prompt, result, date: new Date().toISOString() }, ...videos])
      toast({ title: 'Video generation started', status: 'info', duration: 3000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Box>
      <Card bg="gray.800" mb={4}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Video Prompt</FormLabel>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe the video you want to generate..."
                rows={3}
              />
            </FormControl>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Duration (seconds)</FormLabel>
                <Select value={duration} onChange={e => setDuration(e.target.value)} bg="gray.700">
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                </Select>
              </FormControl>
            </HStack>
            <Button colorScheme="blue" onClick={handleGenerate} isLoading={isGenerating} alignSelf="flex-end">
              🎬 Generate Video
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <VStack spacing={4} align="stretch">
        {videos.map((video, idx) => (
          <Card key={idx} bg="gray.800">
            <CardBody>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="bold">{video.prompt}</Text>
                  <Text fontSize="sm" color="gray.400">{new Date(video.date).toLocaleDateString()}</Text>
                </Box>
                <Badge colorScheme="orange">Processing</Badge>
              </Flex>
            </CardBody>
          </Card>
        ))}
        {videos.length === 0 && (
          <Flex direction="column" align="center" py={10} color="gray.500">
            <Text fontSize="4xl" mb={4}>🎬</Text>
            <Text>No videos generated yet</Text>
          </Flex>
        )}
      </VStack>
    </Box>
  )
}

function AudioStudio() {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('alloy')
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioFiles, setAudioFiles] = useState([])
  const toast = useToast()

  const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

  const handleGenerate = async () => {
    if (!text) return
    setIsGenerating(true)
    try {
      const blob = await textToSpeech(text, voice)
      const url = URL.createObjectURL(blob)
      setAudioFiles([{ url, text, voice, date: new Date().toISOString() }, ...audioFiles])
      toast({ title: 'Audio generated successfully', status: 'success', duration: 3000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Box>
      <Card bg="gray.800" mb={4}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Text to Speech</FormLabel>
              <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter text to convert to speech..."
                rows={3}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Voice</FormLabel>
              <Select value={voice} onChange={e => setVoice(e.target.value)} bg="gray.700">
                {voices.map(v => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </Select>
            </FormControl>
            <Button colorScheme="green" onClick={handleGenerate} isLoading={isGenerating} alignSelf="flex-end">
              🔊 Generate Audio
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <VStack spacing={3} align="stretch">
        {audioFiles.map((audio, idx) => (
          <Card key={idx} bg="gray.800">
            <CardBody>
              <Flex justify="space-between" align="center">
                <HStack spacing={4}>
                  <audio controls src={audio.url} style={{ height: '40px' }} />
                  <Box>
                    <Text fontSize="sm" noOfLines={1}>{audio.text}</Text>
                    <Text fontSize="xs" color="gray.400">Voice: {audio.voice}</Text>
                  </Box>
                </HStack>
                <Button size="sm" colorScheme="blue">Download</Button>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  )
}

function LipSyncStudio() {
  const [videoUrl, setVideoUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState([])
  const toast = useToast()

  const handleGenerate = async () => {
    if (!videoUrl || !audioUrl) return
    setIsProcessing(true)
    try {
      const result = await lipSync(videoUrl, audioUrl)
      setResults([{ videoUrl, audioUrl, result, date: new Date().toISOString() }, ...results])
      toast({ title: 'Lip sync processing started', status: 'info', duration: 3000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box>
      <Card bg="gray.800" mb={4}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Video URL</FormLabel>
              <Input
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="Enter video URL..."
              />
            </FormControl>
            <FormControl>
              <FormLabel>Audio URL</FormLabel>
              <Input
                value={audioUrl}
                onChange={e => setAudioUrl(e.target.value)}
                placeholder="Enter audio URL..."
              />
            </FormControl>
            <Button colorScheme="orange" onClick={handleGenerate} isLoading={isProcessing} alignSelf="flex-end">
              👄 Generate Lip Sync
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <VStack spacing={3} align="stretch">
        {results.map((r, idx) => (
          <Card key={idx} bg="gray.800">
            <CardBody>
              <Text fontWeight="bold">Lip Sync Result #{idx + 1}</Text>
              <Text fontSize="sm" color="gray.400">{new Date(r.date).toLocaleDateString()}</Text>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  )
}

function CinemaStudio() {
  const [prompt, setPrompt] = useState('')
  const [scenes, setScenes] = useState([])
  const toast = useToast()

  const generateScene = async () => {
    if (!prompt) return
    try {
      const scene = await chatCompletion(`Create a cinematic scene description: ${prompt}`)
      setScenes([{ prompt, scene, date: new Date().toISOString() }, ...scenes])
      toast({ title: 'Scene generated', status: 'success', duration: 2000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    }
  }

  return (
    <Box>
      <Card bg="gray.800" mb={4}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Cinematic Prompt</FormLabel>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe your cinematic scene..."
                rows={3}
              />
            </FormControl>
            <Button colorScheme="red" onClick={generateScene} alignSelf="flex-end">
              🎥 Generate Scene
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <VStack spacing={3} align="stretch">
        {scenes.map((s, idx) => (
          <Card key={idx} bg="gray.800">
            <CardBody>
              <Text fontWeight="bold" mb={2}>Scene {scenes.length - idx}</Text>
              <Text color="gray.300">{s.scene}</Text>
              <Text fontSize="xs" color="gray.500" mt={2}>{new Date(s.date).toLocaleDateString()}</Text>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  )
}

function MarketingStudio() {
  const [product, setProduct] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const toast = useToast()

  const generateCampaign = async () => {
    if (!product) return
    try {
      const adCopy = await chatCompletion(`Create marketing campaign for: ${product}`)
      setCampaigns([{ product, adCopy, date: new Date().toISOString() }, ...campaigns])
      toast({ title: 'Campaign generated', status: 'success', duration: 2000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    }
  }

  return (
    <Box>
      <Card bg="gray.800" mb={4}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Product/Service</FormLabel>
              <Input
                value={product}
                onChange={e => setProduct(e.target.value)}
                placeholder="Enter product or service description..."
              />
            </FormControl>
            <Button colorScheme="cyan" onClick={generateCampaign} alignSelf="flex-end">
              📢 Generate Campaign
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <VStack spacing={3} align="stretch">
        {campaigns.map((c, idx) => (
          <Card key={idx} bg="gray.800">
            <CardBody>
              <Text fontWeight="bold" mb={2}>{c.product}</Text>
              <Text color="gray.300" whiteSpace="pre-wrap">{c.adCopy}</Text>
              <Text fontSize="xs" color="gray.500" mt={2}>{new Date(c.date).toLocaleDateString()}</Text>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  )
}

function App() {
  const [activeStudio, setActiveStudio] = useState('image')

  const renderStudio = () => {
    switch (activeStudio) {
      case 'image': return <ImageStudio />
      case 'video': return <VideoStudio />
      case 'audio': return <AudioStudio />
      case 'lipsync': return <LipSyncStudio />
      case 'cinema': return <CinemaStudio />
      case 'marketing': return <MarketingStudio />
      default: return <ImageStudio />
    }
  }

  const currentTab = STUDIO_TABS.find(t => t.id === activeStudio)

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box position="fixed" top={0} left={0} right={0} bg="gray.800" p={4} zIndex={100} borderBottom="1px solid" borderColor="gray.700">
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">🎨 AI Studios</Text>
            <Badge colorScheme={currentTab?.color}>{currentTab?.label}</Badge>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="purple">Powered by OpenAI + MuAPI</Badge>
            <Badge colorScheme="blue">Supabase Storage</Badge>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="70px">
        <Box w="220px" bg="gray.800" h="calc(100vh - 70px)" p={4} borderRight="1px solid" borderColor="gray.700" overflowY="auto">
          <Text fontWeight="bold" mb={4}>Studios</Text>
          <VStack spacing={2} align="stretch">
            {STUDIO_TABS.map(tab => (
              <Button
                key={tab.id}
                leftIcon={<Text>{tab.icon}</Text>}
                variant={activeStudio === tab.id ? 'solid' : 'ghost'}
                colorScheme={tab.color}
                onClick={() => setActiveStudio(tab.id)}
                justifyContent="flex-start"
                size="md"
              >
                {tab.label}
              </Button>
            ))}
          </VStack>
        </Box>

        <Box flex={1} p={6} overflowY="auto" h="calc(100vh - 70px)">
          {renderStudio()}
        </Box>
      </Flex>
    </Box>
  )
}

export default App