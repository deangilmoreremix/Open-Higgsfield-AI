import React, { useState } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Button, Input, Select, Card, CardBody,
  CardHeader, Badge, Tabs, TabList, TabPanels, Tab, TabPanel, Textarea,
  Image, useToast, FormControl, FormLabel, SimpleGrid, Progress,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, AspectRatio, IconButton
} from '@chakra-ui/react'
import { supabase, uploadToStorage, getPublicUrl } from './lib/supabase'
import { generateVideo, generateSpeech } from './lib/muapi'
import { chatCompletion, textToSpeech } from './lib/openai'

const CATEGORIES = [
  { id: 'comedy', label: 'Comedy', icon: '😂' },
  { id: 'educational', label: 'Educational', icon: '📚' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌟' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'tech', label: 'Tech', icon: '💻' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'dance', label: 'Dance', icon: '💃' },
]

const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

function ScriptGenerator({ onScriptGenerated }) {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('lifestyle')
  const [style, setStyle] = useState('engaging')
  const [duration, setDuration] = useState('60')
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const handleGenerate = async () => {
    if (!topic) {
      toast({ title: 'Please enter a topic', status: 'warning', duration: 3000 })
      return
    }
    setIsGenerating(true)
    try {
      const script = await chatCompletion(
        `Write a ${duration}-second YouTube Shorts script for ${category} content. Topic: ${topic}. Style: ${style}. Include a hook, main content, and call-to-action. Keep it punchy and engaging for short-form video.`
      )
      onScriptGenerated({ topic, category, style, duration, script, id: Date.now() })
      toast({ title: 'Script generated!', status: 'success', duration: 3000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card bg="gray.800">
      <CardBody>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Shorts Topic</FormLabel>
            <Input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Enter your YouTube Shorts topic..."
            />
          </FormControl>
          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Category</FormLabel>
              <Select value={category} onChange={e => setCategory(e.target.value)} bg="gray.700">
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Duration</FormLabel>
              <Select value={duration} onChange={e => setDuration(e.target.value)} bg="gray.700">
                <option value="30">30 seconds</option>
                <option value="45">45 seconds</option>
                <option value="60">60 seconds</option>
              </Select>
            </FormControl>
          </HStack>
          <FormControl>
            <FormLabel>Style</FormLabel>
            <Select value={style} onChange={e => setStyle(e.target.value)} bg="gray.700">
              <option value="engaging">Engaging & Fun</option>
              <option value="educational">Educational</option>
              <option value="inspirational">Inspirational</option>
              <option value="humorous">Humorous</option>
            </Select>
          </FormControl>
          <Button colorScheme="red" onClick={handleGenerate} isLoading={isGenerating} alignSelf="flex-end">
            ✍️ Generate Script
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

function VideoProducer({ script, onVideoGenerated }) {
  const [voice, setVoice] = useState('alloy')
  const [isProducing, setIsProducing] = useState(false)
  const [progress, setProgress] = useState(0)
  const toast = useToast()

  const handleProduce = async () => {
    setIsProducing(true)
    setProgress(0)
    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90))
      }, 500)

      const [audioBlob, videoResult] = await Promise.all([
        textToSpeech(script.script, voice),
        generateVideo(script.script, { duration: parseInt(script.duration) })
      ])

      clearInterval(progressInterval)
      setProgress(100)

      const audioUrl = URL.createObjectURL(audioBlob)
      onVideoGenerated({
        ...script,
        audioUrl,
        videoResult,
        status: 'completed'
      })
      toast({ title: 'Video produced successfully!', status: 'success', duration: 3000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsProducing(false)
    }
  }

  return (
    <Card bg="gray.800">
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontWeight="bold">🎬 Produce Video</Text>
          <FormControl>
            <FormLabel>Voice Over</FormLabel>
            <Select value={voice} onChange={e => setVoice(e.target.value)} bg="gray.700">
              {VOICES.map(v => (
                <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
              ))}
            </Select>
          </FormControl>
          {isProducing && (
            <Box>
              <Text fontSize="sm" mb={2}>Generating video...</Text>
              <Progress value={progress} colorScheme="red" size="sm" borderRadius="full" />
            </Box>
          )}
          <Button colorScheme="red" onClick={handleProduce} isLoading={isProducing} isDisabled={!script}>
            🎬 Generate Short
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

function App() {
  const [shorts, setShorts] = useState([])
  const [selectedShort, setSelectedShort] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const handleScriptGenerated = (script) => {
    setShorts([script, ...shorts])
    setSelectedShort(script)
  }

  const handleVideoGenerated = (short) => {
    setShorts(shorts.map(s => s.id === short.id ? short : s))
    setSelectedShort(short)
  }

  const handlePublish = async (platform) => {
    toast({ title: `Publishing to ${platform}...`, status: 'info', duration: 3000 })
    setTimeout(() => {
      toast({ title: `Published to ${platform}!`, status: 'success', duration: 3000 })
    }, 2000)
  }

  const handleDownload = async () => {
    toast({ title: 'Download started...', status: 'info', duration: 2000 })
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box position="fixed" top={0} left={0} right={0} bg="gray.800" p={4} zIndex={100} borderBottom="1px solid" borderColor="gray.700">
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">🎬 AI YouTube Shorts</Text>
            <Badge colorScheme="red">Beta</Badge>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="purple">OpenAI</Badge>
            <Badge colorScheme="orange">MuAPI</Badge>
            <Badge colorScheme="blue">{shorts.length} Shorts</Badge>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="70px">
        <Box w="300px" bg="gray.800" h="calc(100vh - 70px)" p={4} borderRight="1px solid" borderColor="gray.700" overflowY="auto">
          <Text fontWeight="bold" mb={4}>My Shorts</Text>
          <VStack spacing={2} align="stretch">
            {shorts.map(short => (
              <Card
                key={short.id}
                bg={selectedShort?.id === short.id ? 'gray.700' : 'gray.700'}
                cursor="pointer"
                onClick={() => setSelectedShort(short)}
                _hover={{ bg: 'gray.600' }}
              >
                <CardBody p={3}>
                  <HStack mb={2}>
                    <Badge colorScheme="red">{short.duration}s</Badge>
                    <Badge colorScheme="purple">{short.category}</Badge>
                  </HStack>
                  <Text fontSize="sm" fontWeight="500" noOfLines={2}>{short.topic}</Text>
                  <Text fontSize="xs" color={short.status === 'completed' ? 'green.400' : 'yellow.400'} mt={1}>
                    {short.status === 'completed' ? '✓ Ready' : '📝 Script Ready'}
                  </Text>
                </CardBody>
              </Card>
            ))}
            {shorts.length === 0 && (
              <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
                No shorts yet. Create your first short!
              </Text>
            )}
          </VStack>
        </Box>

        <Box flex={1} p={6} overflowY="auto" h="calc(100vh - 70px)">
          <Tabs variant="soft-rounded" colorScheme="red" onChange={i => setActiveTab(i)}>
            <TabList mb={4}>
              <Tab>📝 Create Script</Tab>
              <Tab>🎬 Produce</Tab>
              <Tab>📊 Analytics</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  <ScriptGenerator onScriptGenerated={handleScriptGenerated} />

                  {selectedShort && (
                    <Card bg="gray.800">
                      <CardHeader>
                        <Flex justify="space-between" align="center">
                          <Text fontWeight="bold">Generated Script</Text>
                          <Badge colorScheme="green">{selectedShort.duration}s</Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody pt={0}>
                        <Text whiteSpace="pre-wrap" color="gray.200">{selectedShort.script}</Text>
                        <Button mt={4} size="sm" colorScheme="red" onClick={() => setActiveTab(1)}>
                          Next: Produce Video →
                        </Button>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </TabPanel>

              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  {selectedShort ? (
                    <>
                      <Box>
                        <Text fontWeight="bold" mb={2}>Topic: {selectedShort.topic}</Text>
                        <Text fontSize="sm" color="gray.400" mb={4}>Category: {selectedShort.category} | Duration: {selectedShort.duration}s</Text>
                      </Box>

                      <VideoProducer
                        script={selectedShort}
                        onVideoGenerated={handleVideoGenerated}
                      />

                      {selectedShort.videoResult && (
                        <Card bg="gray.800">
                          <CardBody>
                            <AspectRatio ratio={9/16} maxH="400px">
                              <Box bg="gray.700" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                                <VStack>
                                  <Text fontSize="4xl">🎬</Text>
                                  <Text>Video Ready</Text>
                                </VStack>
                              </Box>
                            </AspectRatio>
                            <HStack mt={4} spacing={2}>
                              <Button colorScheme="blue" onClick={handleDownload}>⬇️ Download</Button>
                              <Button colorScheme="red" onClick={() => handlePublish('youtube')}>▶️ Publish to YouTube</Button>
                              <Button variant="outline" onClick={() => handlePublish('tiktok')}>🎵 Share to TikTok</Button>
                            </HStack>
                          </CardBody>
                        </Card>
                      )}
                    </>
                  ) : (
                    <Flex direction="column" align="center" py={20} color="gray.500">
                      <Text fontSize="4xl" mb={4}>🎬</Text>
                      <Text>Create a script first to produce a video</Text>
                    </Flex>
                  )}
                </VStack>
              </TabPanel>

              <TabPanel p={0}>
                <SimpleGrid columns={4} spacing={4}>
                  <Card bg="gray.800">
                    <CardBody>
                      <Text color="gray.400">Total Shorts</Text>
                      <Text fontSize="2xl" fontWeight="bold">{shorts.length}</Text>
                    </CardBody>
                  </Card>
                  <Card bg="gray.800">
                    <CardBody>
                      <Text color="gray.400">Produced</Text>
                      <Text fontSize="2xl" fontWeight="bold">{shorts.filter(s => s.status === 'completed').length}</Text>
                    </CardBody>
                  </Card>
                  <Card bg="gray.800">
                    <CardBody>
                      <Text color="gray.400">Published</Text>
                      <Text fontSize="2xl" fontWeight="bold">0</Text>
                    </CardBody>
                  </Card>
                  <Card bg="gray.800">
                    <CardBody>
                      <Text color="gray.400">Total Views</Text>
                      <Text fontSize="2xl" fontWeight="bold">0</Text>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Card bg="gray.800" mt={6}>
                  <CardBody>
                    <Text fontWeight="bold" mb={4}>Publishing Platforms</Text>
                    <SimpleGrid columns={3} spacing={4}>
                      <Card bg="gray.700">
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <HStack>
                              <Text fontSize="2xl">▶️</Text>
                              <Text>YouTube</Text>
                            </HStack>
                            <Badge colorScheme="red">Connected</Badge>
                          </Flex>
                        </CardBody>
                      </Card>
                      <Card bg="gray.700">
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <HStack>
                              <Text fontSize="2xl">🎵</Text>
                              <Text>TikTok</Text>
                            </HStack>
                            <Badge colorScheme="gray">Not Connected</Badge>
                          </Flex>
                        </CardBody>
                      </Card>
                      <Card bg="gray.700">
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <HStack>
                              <Text fontSize="2xl">📸</Text>
                              <Text>Instagram</Text>
                            </HStack>
                            <Badge colorScheme="gray">Not Connected</Badge>
                          </Flex>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Box>
  )
}

export default App