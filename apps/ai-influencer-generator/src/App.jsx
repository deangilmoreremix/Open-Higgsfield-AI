import React, { useState } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Button, Input, Select, Card, CardBody,
  CardHeader, Badge, Tabs, TabList, TabPanels, Tab, TabPanel, Textarea,
  Image, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, FormControl, FormLabel,
  SimpleGrid, AspectRatio, Progress, Avatar
} from '@chakra-ui/react'
import { supabase, uploadToStorage, getPublicUrl } from './lib/supabase'
import { generateImage, generateVideo } from './lib/muapi'
import { generateImage as openaiGenerateImage, chatCompletion, textToSpeech, createResponse } from './lib/openai'

const INFLUENCER_TYPES = [
  { id: 'fitness', label: 'Fitness', icon: '💪', description: 'Health & wellness content' },
  { id: 'fashion', label: 'Fashion', icon: '👗', description: 'Style & lifestyle' },
  { id: 'tech', label: 'Tech', icon: '💻', description: 'Gadgets & reviews' },
  { id: 'food', label: 'Food', icon: '🍔', description: 'Recipes & dining' },
  { id: 'travel', label: 'Travel', icon: '✈️', description: 'Adventure & places' },
  { id: 'business', label: 'Business', icon: '📈', description: 'Entrepreneurship' },
]

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'twitter', label: 'Twitter', icon: '🐦' },
]

function InfluencerCreator({ onSave }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('fitness')
  const [description, setDescription] = useState('')
  const [personality, setPersonality] = useState('')
  const [age, setAge] = useState('25-34')
  const [style, setStyle] = useState('modern')
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const handleGenerate = async () => {
    if (!name || !description) {
      toast({ title: 'Please fill in all required fields', status: 'warning', duration: 3000 })
      return
    }
    setIsGenerating(true)
    try {
      const prompt = `Professional portrait photo of ${name}, ${type} influencer, ${style} style, ${description}, high quality, 4K`
      const result = await openaiGenerateImage(prompt, 'dall-e-3', '1024x1024')
      const imageUrl = result.data?.[0]?.url

      const bio = await chatCompletion(`Create an engaging bio for ${name}, a ${type} influencer: ${description}`)

      const influencer = {
        id: Date.now(),
        name,
        type,
        description,
        personality,
        age,
        style,
        imageUrl,
        bio,
        createdAt: new Date().toISOString(),
        content: [],
        followers: {}
      }

      toast({ title: 'Influencer created successfully!', status: 'success', duration: 3000 })
      return influencer
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card bg="gray.800">
      <CardHeader>
        <Text fontSize="xl" fontWeight="bold">Create AI Influencer</Text>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Influencer name" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Type</FormLabel>
              <Select value={type} onChange={e => setType(e.target.value)} bg="gray.700">
                {INFLUENCER_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                ))}
              </Select>
            </FormControl>
          </HStack>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the influencer's brand, style, and content focus..."
              rows={3}
            />
          </FormControl>

          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Personality</FormLabel>
              <Select value={personality} onChange={e => setPersonality(e.target.value)} bg="gray.700">
                <option value="friendly">Friendly & Approachable</option>
                <option value="professional">Professional & Expert</option>
                <option value="fun">Fun & Entertaining</option>
                <option value="inspirational">Inspirational & Motivating</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Age Group</FormLabel>
              <Select value={age} onChange={e => setAge(e.target.value)} bg="gray.700">
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45+">45+</option>
              </Select>
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel>Visual Style</FormLabel>
            <Select value={style} onChange={e => setStyle(e.target.value)} bg="gray.700">
              <option value="modern">Modern & Clean</option>
              <option value="bold">Bold & Vibrant</option>
              <option value="minimal">Minimal & Elegant</option>
              <option value="edgy">Edgy & Trendy</option>
            </Select>
          </FormControl>

          <Button colorScheme="purple" onClick={handleGenerate} isLoading={isGenerating} alignSelf="flex-end">
            ✨ Generate Influencer
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

function ContentGenerator({ influencer, onContentGenerated }) {
  const [contentType, setContentType] = useState('post')
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const toast = useToast()

  const generateContent = async () => {
    if (!topic) return
    setIsGenerating(true)
    try {
      let content = {}
      const personality = influencer.personality || 'friendly'

      if (contentType === 'post') {
        const caption = await chatCompletion(
          `Write an engaging Instagram caption for ${influencer.name}, a ${influencer.type} influencer. ${influencer.description}. Topic: ${topic}. Make it ${personality} and include relevant hashtags.`
        )
        content = { type: 'post', caption, topic }
      } else if (contentType === 'video') {
        const script = await chatCompletion(
          `Write a short video script for ${influencer.name}. Topic: ${topic}. Keep it under 60 seconds.`
        )
        content = { type: 'video', script, topic }
      } else if (contentType === 'story') {
        const storyText = await chatCompletion(
          `Write an Instagram story idea for ${influencer.name}. Topic: ${topic}.`
        )
        content = { type: 'story', text: storyText, topic }
      }

      content.id = Date.now()
      content.createdAt = new Date().toISOString()
      onContentGenerated(content)
      toast({ title: `${contentType} content generated!`, status: 'success', duration: 3000 })
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
          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Content Type</FormLabel>
              <Select value={contentType} onChange={e => setContentType(e.target.value)} bg="gray.700">
                <option value="post">📸 Post</option>
                <option value="video">🎬 Video Script</option>
                <option value="story">📱 Story</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Topic</FormLabel>
              <Input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Enter content topic..."
              />
            </FormControl>
          </HStack>
          <Button colorScheme="blue" onClick={generateContent} isLoading={isGenerating}>
            Generate Content
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

function App() {
  const [influencers, setInfluencers] = useState([])
  const [selectedInfluencer, setSelectedInfluencer] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const handleSaveInfluencer = (influencer) => {
    setInfluencers([...influencers, influencer])
    setSelectedInfluencer(influencer)
    toast({ title: 'Influencer saved to your collection', status: 'success', duration: 2000 })
  }

  const handleContentGenerated = (content) => {
    if (!selectedInfluencer) return
    const updated = {
      ...selectedInfluencer,
      content: [content, ...selectedInfluencer.content]
    }
    setSelectedInfluencer(updated)
    setInfluencers(influencers.map(i => i.id === updated.id ? updated : i))
  }

  const handlePostContent = async (content, platform) => {
    toast({ title: `Content scheduled for ${platform}`, status: 'info', duration: 3000 })
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box position="fixed" top={0} left={0} right={0} bg="gray.800" p={4} zIndex={100} borderBottom="1px solid" borderColor="gray.700">
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">🤖 AI Influencer Generator</Text>
            <Badge colorScheme="purple">Powered by OpenAI + MuAPI</Badge>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="blue">Supabase Multi-tenant</Badge>
            <Badge colorScheme="green">{influencers.length} Influencers</Badge>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="70px">
        <Box w="280px" bg="gray.800" h="calc(100vh - 70px)" p={4} borderRight="1px solid" borderColor="gray.700" overflowY="auto">
          <Text fontWeight="bold" mb={4}>My Influencers</Text>
          <VStack spacing={2} align="stretch">
            {influencers.map(inf => (
              <Card
                key={inf.id}
                bg={selectedInfluencer?.id === inf.id ? 'gray.700' : 'gray.700'}
                cursor="pointer"
                onClick={() => setSelectedInfluencer(inf)}
                _hover={{ bg: 'gray.600' }}
              >
                <CardBody p={3}>
                  <Flex align="center" gap={3}>
                    <Avatar size="sm" name={inf.name} src={inf.imageUrl} />
                    <Box flex={1}>
                      <Text fontWeight="bold" fontSize="sm">{inf.name}</Text>
                      <Text fontSize="xs" color="gray.400">{inf.type} influencer</Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>
            ))}
            {influencers.length === 0 && (
              <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                No influencers yet. Create one to get started!
              </Text>
            )}
          </VStack>
        </Box>

        <Box flex={1} p={6} overflowY="auto" h="calc(100vh - 70px)">
          <Tabs variant="soft-rounded" colorScheme="purple" onChange={i => setActiveTab(i)}>
            <TabList mb={4}>
              <Tab>Create Influencer</Tab>
              <Tab isDisabled={!selectedInfluencer}>Content Generator</Tab>
              <Tab isDisabled={!selectedInfluencer}>Analytics</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  <InfluencerCreator onSave={handleSaveInfluencer} />

                  {influencers.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" mb={4}>Your Influencers</Text>
                      <SimpleGrid columns={2} spacing={4}>
                        {influencers.map(inf => (
                          <Card key={inf.id} bg="gray.800" onClick={() => setSelectedInfluencer(inf)} cursor="pointer" _hover={{ bg: 'gray.700' }}>
                            <CardBody>
                              <Flex gap={4}>
                                <Image
                                  src={inf.imageUrl}
                                  alt={inf.name}
                                  w="100px"
                                  h="100px"
                                  borderRadius="md"
                                  objectFit="cover"
                                />
                                <Box flex={1}>
                                  <Text fontWeight="bold">{inf.name}</Text>
                                  <Badge colorScheme="purple" mb={2}>{inf.type}</Badge>
                                  <Text fontSize="sm" color="gray.400" noOfLines={2}>{inf.description}</Text>
                                </Box>
                              </Flex>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              <TabPanel p={0}>
                {selectedInfluencer && (
                  <VStack spacing={6} align="stretch">
                    <Card bg="gray.800">
                      <CardBody>
                        <Flex align="center" gap={4}>
                          <Image
                            src={selectedInfluencer.imageUrl}
                            alt={selectedInfluencer.name}
                            w="80px"
                            h="80px"
                            borderRadius="full"
                            objectFit="cover"
                          />
                          <Box>
                            <Text fontSize="xl" fontWeight="bold">{selectedInfluencer.name}</Text>
                            <Text fontSize="sm" color="gray.400">{selectedInfluencer.type} influencer</Text>
                          </Box>
                        </Flex>
                      </CardBody>
                    </Card>

                    <ContentGenerator
                      influencer={selectedInfluencer}
                      onContentGenerated={handleContentGenerated}
                    />

                    {selectedInfluencer.content?.length > 0 && (
                      <Box>
                        <Text fontWeight="bold" mb={4}>Generated Content</Text>
                        <VStack spacing={3} align="stretch">
                          {selectedInfluencer.content.map((c, idx) => (
                            <Card key={c.id || idx} bg="gray.800">
                              <CardBody>
                                <Flex justify="space-between" align="flex-start">
                                  <Box flex={1}>
                                    <HStack mb={2}>
                                      <Badge colorScheme={c.type === 'post' ? 'pink' : c.type === 'video' ? 'blue' : 'orange'}>
                                        {c.type}
                                      </Badge>
                                      <Text fontSize="sm" color="gray.400">{c.topic}</Text>
                                    </HStack>
                                    <Text whiteSpace="pre-wrap">{c.caption || c.script || c.text}</Text>
                                  </Box>
                                  <HStack spacing={2}>
                                    {PLATFORMS.map(p => (
                                      <Button
                                        key={p.id}
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handlePostContent(c, p.id)}
                                      >
                                        {p.icon}
                                      </Button>
                                    ))}
                                  </HStack>
                                </Flex>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                )}
              </TabPanel>

              <TabPanel p={0}>
                <SimpleGrid columns={4} spacing={4}>
                  <Card bg="gray.800">
                    <CardBody>
                      <Text color="gray.400">Total Content</Text>
                      <Text fontSize="2xl" fontWeight="bold">{selectedInfluencer?.content?.length || 0}</Text>
                    </CardBody>
                  </Card>
                  <Card bg="gray.800">
                    <CardBody>
                      <Text color="gray.400">Posts</Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {selectedInfluencer?.content?.filter(c => c.type === 'post').length || 0}
                      </Text>
                    </CardBody>
                  </Card>
                  <Card bg="gray.800">
                    <CardBody>
                      <Text color="gray.400">Videos</Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {selectedInfluencer?.content?.filter(c => c.type === 'video').length || 0}
                      </Text>
                    </CardBody>
                  </Card>
                  <Card bg="gray.800">
                    <CardBody>
                      <Text color="gray.400">Stories</Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {selectedInfluencer?.content?.filter(c => c.type === 'story').length || 0}
                      </Text>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Box>
  )
}

export default App