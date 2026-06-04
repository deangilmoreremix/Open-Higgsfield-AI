import React, { useState } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Button, Input, Select, Card, CardBody,
  CardHeader, Badge, Tabs, TabList, TabPanels, Tab, TabPanel, Textarea,
  Image, useToast, FormControl, FormLabel, SimpleGrid, Progress, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, AspectRatio, Divider, Avatar
} from '@chakra-ui/react'
import { supabase, saveUGC, getUGCList } from './lib/supabase'
import { chatCompletion, generateImage, editImage, textToSpeech, createResponse } from './lib/openai'

const CONTENT_TYPES = [
  { id: 'review', label: 'Product Review', icon: '⭐', prompt: 'Write an authentic product review in a conversational tone' },
  { id: 'testimonial', label: 'Testimonial', icon: '💬', prompt: 'Create a customer testimonial story' },
  { id: 'unboxing', label: 'Unboxing', icon: '📦', prompt: 'Write an exciting unboxing script' },
  { id: 'tutorial', label: 'Tutorial', icon: '📚', prompt: 'Create a helpful how-to tutorial' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌟', prompt: 'Write an engaging lifestyle content piece' },
  { id: 'comparison', label: 'Comparison', icon: '⚖️', prompt: 'Create a balanced product comparison' },
]

const TONES = [
  { id: 'friendly', label: 'Friendly & Casual' },
  { id: 'professional', label: 'Professional' },
  { id: 'humorous', label: 'Humorous' },
  { id: 'inspirational', label: 'Inspirational' },
  { id: 'educational', label: 'Educational' },
]

const TARGET_AUDIENCES = [
  'Gen Z (18-25)', 'Millennials (26-41)', 'Gen X (42-57)', 'Boomers (58+)',
  'Tech Savvy', 'Budget Conscious', 'Luxury Seekers', 'Eco-Conscious'
]

function ContentGenerator({ onContentGenerated }) {
  const [product, setProduct] = useState('')
  const [contentType, setContentType] = useState('review')
  const [tone, setTone] = useState('friendly')
  const [audience, setAudience] = useState('Millennials (26-41)')
  const [platform, setPlatform] = useState('instagram')
  const [includeImage, setIncludeImage] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const typeConfig = CONTENT_TYPES.find(t => t.id === contentType) || CONTENT_TYPES[0]

  const handleGenerate = async () => {
    if (!product) {
      toast({ title: 'Please enter product/service info', status: 'warning', duration: 3000 })
      return
    }
    setIsGenerating(true)
    try {
      const contentPrompt = `${typeConfig.prompt}. Product/Service: ${product}. Tone: ${tone}. Target audience: ${audience}. Platform: ${platform}.`
      const content = await chatCompletion(contentPrompt)

      let imageUrl = null
      if (includeImage) {
        const imageResult = await generateImage(`Professional UGC content photo for ${product}, authentic lifestyle shot, natural lighting`)
        imageUrl = imageResult.data?.[0]?.url || null
      }

      const ugc = {
        id: Date.now(),
        product,
        content_type: contentType,
        content,
        image_url: imageUrl,
        tone,
        audience,
        platform,
        status: 'generated',
        created_at: new Date().toISOString()
      }

      onContentGenerated(ugc)
      toast({ title: 'UGC content generated!', status: 'success', duration: 3000 })
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
            <FormLabel>Product or Service</FormLabel>
            <Textarea
              value={product}
              onChange={e => setProduct(e.target.value)}
              placeholder="Describe the product or service you need UGC for..."
              rows={3}
            />
          </FormControl>

          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Content Type</FormLabel>
              <Select value={contentType} onChange={e => setContentType(e.target.value)} bg="gray.700">
                {CONTENT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Tone</FormLabel>
              <Select value={tone} onChange={e => setTone(e.target.value)} bg="gray.700">
                {TONES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </Select>
            </FormControl>
          </HStack>

          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Target Audience</FormLabel>
              <Select value={audience} onChange={e => setAudience(e.target.value)} bg="gray.700">
                {TARGET_AUDIENCES.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Platform</FormLabel>
              <Select value={platform} onChange={e => setPlatform(e.target.value)} bg="gray.700">
                <option value="instagram">📸 Instagram</option>
                <option value="tiktok">🎵 TikTok</option>
                <option value="youtube">▶️ YouTube</option>
                <option value="twitter">🐦 Twitter</option>
              </Select>
            </FormControl>
          </HStack>

          <HStack>
            <Button
              variant={includeImage ? 'solid' : 'outline'}
              colorScheme="purple"
              onClick={() => setIncludeImage(!includeImage)}
            >
              🖼️ Include AI Image
            </Button>
          </HStack>

          <Button colorScheme="blue" onClick={handleGenerate} isLoading={isGenerating} alignSelf="flex-end">
            ✨ Generate UGC Content
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

function UGCCard({ ugc, onSelect, onPublish }) {
  const typeConfig = CONTENT_TYPES.find(t => t.id === ugc.content_type) || CONTENT_TYPES[0]

  return (
    <Card bg="gray.800" _hover={{ bg: 'gray.750' }} cursor="pointer" onClick={() => onSelect(ugc)}>
      <CardBody>
        <Flex gap={4}>
          {ugc.image_url && (
            <Image src={ugc.image_url} alt={ugc.product} w="120px" h="120px" objectFit="cover" borderRadius="md" />
          )}
          <Box flex={1}>
            <HStack mb={2}>
              <Badge colorScheme="blue">{typeConfig.icon} {typeConfig.label}</Badge>
              <Badge colorScheme="purple">{ugc.tone}</Badge>
              <Badge colorScheme="green">{ugc.platform}</Badge>
            </HStack>
            <Text fontSize="sm" color="gray.400" mb={1}>{ugc.product}</Text>
            <Text color="gray.200" noOfLines={3}>{ugc.content}</Text>
            <HStack mt={3} spacing={2}>
              <Button size="sm" colorScheme="blue" onClick={(e) => { e.stopPropagation(); onPublish(ugc, ugc.platform) }}>
                📤 Publish
              </Button>
              <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                📋 Copy
              </Button>
            </HStack>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  )
}

function ContentEditor({ ugc, onSave, onClose }) {
  const [content, setContent] = useState(ugc.content)
  const [isSaving, setIsSaving] = useState(false)
  const toast = useToast()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveUGC({ ...ugc, content })
      onSave({ ...ugc, content })
      toast({ title: 'Content saved!', status: 'success', duration: 2000 })
    } catch (err) {
      onSave({ ...ugc, content })
      toast({ title: 'Saved locally', status: 'info', duration: 2000 })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegenerate = async () => {
    setIsSaving(true)
    try {
      const typeConfig = CONTENT_TYPES.find(t => t.id === ugc.content_type) || CONTENT_TYPES[0]
      const newContent = await chatCompletion(
        `Regenerate this UGC content: ${ugc.product}. Type: ${typeConfig.label}. Tone: ${ugc.tone}.`
      )
      setContent(newContent)
      toast({ title: 'Content regenerated!', status: 'success', duration: 2000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white" maxW="900px">
        <ModalHeader>
          <HStack>
            <Text>Edit UGC Content</Text>
            <Badge colorScheme="blue">{ugc.content_type}</Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {ugc.image_url && (
              <Image src={ugc.image_url} alt={ugc.product} maxH="300px" objectFit="contain" borderRadius="md" />
            )}
            <FormControl>
              <FormLabel>Content</FormLabel>
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={8}
              />
            </FormControl>
            <SimpleGrid columns={3} spacing={4}>
              <Box p={3} bg="gray.700" borderRadius="md">
                <Text fontSize="sm" color="gray.400">Product</Text>
                <Text>{ugc.product}</Text>
              </Box>
              <Box p={3} bg="gray.700" borderRadius="md">
                <Text fontSize="sm" color="gray.400">Platform</Text>
                <Text>{ugc.platform}</Text>
              </Box>
              <Box p={3} bg="gray.700" borderRadius="md">
                <Text fontSize="sm" color="gray.400">Audience</Text>
                <Text>{ugc.audience}</Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button variant="outline" mr={3} onClick={handleRegenerate} isLoading={isSaving}>
            🔄 Regenerate
          </Button>
          <Button colorScheme="green" onClick={handleSave} isLoading={isSaving}>
            💾 Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function PlatformPublisher({ ugc, onPublish }) {
  const [selectedPlatform, setSelectedPlatform] = useState(ugc.platform)
  const [caption, setCaption] = useState(ugc.content)
  const [isPublishing, setIsPublishing] = useState(false)
  const toast = useToast()

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📸', color: 'pink' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'black' },
    { id: 'youtube', name: 'YouTube Shorts', icon: '▶️', color: 'red' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'blue' },
  ]

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await onPublish(ugc, selectedPlatform)
      toast({ title: `Publishing to ${selectedPlatform}...`, status: 'info', duration: 3000 })
      setTimeout(() => {
        toast({ title: 'Published successfully!', status: 'success', duration: 3000 })
      }, 2000)
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Card bg="gray.800">
      <CardHeader>
        <Text fontWeight="bold">Publish to Platform</Text>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          <SimpleGrid columns={2} spacing={4}>
            {platforms.map(p => (
              <Card
                key={p.id}
                bg={selectedPlatform === p.id ? `${p.color}.900` : 'gray.700'}
                cursor="pointer"
                onClick={() => setSelectedPlatform(p.id)}
                _hover={{ bg: selectedPlatform === p.id ? `${p.color}.800` : 'gray.600' }}
              >
                <CardBody p={4}>
                  <VStack>
                    <Text fontSize="3xl">{p.icon}</Text>
                    <Text fontWeight="bold">{p.name}</Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          <FormControl>
            <FormLabel>Caption</FormLabel>
            <Textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={4}
            />
          </FormControl>

          <Button colorScheme="green" onClick={handlePublish} isLoading={isPublishing} size="lg">
            📤 Publish Now
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

function App() {
  const [ugcList, setUgcList] = useState([])
  const [selectedUgc, setSelectedUgc] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const handleContentGenerated = (ugc) => {
    setUgcList([ugc, ...ugcList])
  }

  const handleSelectUgc = (ugc) => {
    setSelectedUgc(ugc)
    onOpen()
  }

  const handleSaveUgc = (updatedUgc) => {
    setUgcList(ugcList.map(u => u.id === updatedUgc.id ? updatedUgc : u))
    setSelectedUgc(null)
    onClose()
  }

  const handlePublish = async (ugc, platform) => {
    toast({ title: `Publishing to ${platform}...`, status: 'info', duration: 3000 })
  }

  const stats = [
    { label: 'Total Content', value: ugcList.length, color: 'blue' },
    { label: 'Reviews', value: ugcList.filter(u => u.content_type === 'review').length, color: 'green' },
    { label: 'Testimonials', value: ugcList.filter(u => u.content_type === 'testimonial').length, color: 'purple' },
    { label: 'Published', value: 0, color: 'orange' },
  ]

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box position="fixed" top={0} left={0} right={0} bg="gray.800" p={4} zIndex={100} borderBottom="1px solid" borderColor="gray.700">
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">🤳 Open AI UGC</Text>
            <Badge colorScheme="purple">Powered by OpenAI</Badge>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="blue">Supabase Storage</Badge>
            <Badge colorScheme="green">{ugcList.length} Created</Badge>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="70px">
        <Box w="280px" bg="gray.800" h="calc(100vh - 70px)" p={4} borderRight="1px solid" borderColor="gray.700" overflowY="auto">
          <Text fontWeight="bold" mb={4}>Quick Stats</Text>
          <VStack spacing={3} align="stretch">
            {stats.map(stat => (
              <Box key={stat.label} p={3} bg="gray.700" borderRadius="md">
                <Text fontSize="sm" color="gray.400">{stat.label}</Text>
                <Text fontSize="xl" fontWeight="bold" color={`${stat.color}.400`}>{stat.value}</Text>
              </Box>
            ))}
          </VStack>

          <Divider my={4} />

          <Text fontWeight="bold" mb={4}>Content Types</Text>
          <VStack spacing={2} align="stretch">
            {CONTENT_TYPES.map(type => (
              <HStack key={type.id} p={2} bg="gray.700" borderRadius="md" cursor="pointer" _hover={{ bg: 'gray.600' }}>
                <Text>{type.icon}</Text>
                <Text fontSize="sm">{type.label}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        <Box flex={1} p={6} overflowY="auto" h="calc(100vh - 70px)">
          <Tabs variant="soft-rounded" colorScheme="purple" onChange={i => setActiveTab(i)}>
            <TabList mb={4}>
              <Tab>✨ Create UGC</Tab>
              <Tab>📋 My Content ({ugcList.length})</Tab>
              <Tab>📊 Dashboard</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  <ContentGenerator onContentGenerated={handleContentGenerated} />

                  <Card bg="gray.800">
                    <CardHeader>
                      <Text fontWeight="bold">Content Types Explained</Text>
                    </CardHeader>
                    <CardBody pt={0}>
                      <SimpleGrid columns={3} spacing={4}>
                        {CONTENT_TYPES.map(type => (
                          <Box key={type.id} p={4} bg="gray.700" borderRadius="md">
                            <HStack mb={2}>
                              <Text fontSize="xl">{type.icon}</Text>
                              <Text fontWeight="bold">{type.label}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.400">{type.prompt}</Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              <TabPanel p={0}>
                {ugcList.length === 0 ? (
                  <Flex direction="column" align="center" py={20} color="gray.500">
                    <Text fontSize="4xl" mb={4}>📋</Text>
                    <Text>No UGC content yet</Text>
                    <Text fontSize="sm">Create your first piece to get started!</Text>
                  </Flex>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {ugcList.map(ugc => (
                      <UGCCard
                        key={ugc.id}
                        ugc={ugc}
                        onSelect={handleSelectUgc}
                        onPublish={handlePublish}
                      />
                    ))}
                  </VStack>
                )}
              </TabPanel>

              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={4} spacing={4}>
                    {stats.map(stat => (
                      <Card key={stat.label} bg="gray.800">
                        <CardBody>
                          <Text color="gray.400">{stat.label}</Text>
                          <Text fontSize="2xl" fontWeight="bold">{stat.value}</Text>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>

                  <PlatformPublisher ugc={ugcList[0] || {}} onPublish={handlePublish} />

                  <Card bg="gray.800">
                    <CardHeader>
                      <Text fontWeight="bold">Platform Integration Guide</Text>
                    </CardHeader>
                    <CardBody pt={0}>
                      <VStack spacing={3} align="stretch">
                        <Box p={4} bg="gray.700" borderRadius="md">
                          <HStack>
                            <Text fontSize="2xl">📸</Text>
                            <Box>
                              <Text fontWeight="bold">Instagram</Text>
                              <Text fontSize="sm" color="gray.400">Connect your Instagram business account to publish directly</Text>
                            </Box>
                          </HStack>
                        </Box>
                        <Box p={4} bg="gray.700" borderRadius="md">
                          <HStack>
                            <Text fontSize="2xl">🎵</Text>
                            <Box>
                              <Text fontWeight="bold">TikTok</Text>
                              <Text fontSize="sm" color="gray.400">Share to TikTok with auto-generated captions</Text>
                            </Box>
                          </HStack>
                        </Box>
                        <Box p={4} bg="gray.700" borderRadius="md">
                          <HStack>
                            <Text fontSize="2xl">🐦</Text>
                            <Box>
                              <Text fontWeight="bold">Twitter/X</Text>
                              <Text fontSize="sm" color="gray.400">Publish tweets with AI-generated hashtags</Text>
                            </Box>
                          </HStack>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>

      {selectedUgc && (
        <ContentEditor
          ugc={selectedUgc}
          onSave={handleSaveUgc}
          onClose={() => { setSelectedUgc(null); onClose() }}
        />
      )}
    </Box>
  )
}

export default App