import React, { useState } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Button, Card, CardBody,
  CardHeader, Badge, Tabs, TabList, TabPanels, Tab, TabPanel,
  Select, SimpleGrid, Image, useToast, FormControl, FormLabel,
  Input, Progress, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, AspectRatio,
  Divider, IconButton
} from '@chakra-ui/react'
import { supabase, uploadToStorage, saveHeadshot, getHeadshots } from './lib/supabase'
import { generateImage, editImage, chatCompletion } from './lib/openai'

const HEADSHOT_STYLES = [
  { id: 'professional', label: 'Professional', icon: '👔', prompt: 'Professional business headshot, corporate' },
  { id: 'creative', label: 'Creative', icon: '🎨', prompt: 'Creative artistic portrait' },
  { id: 'casual', label: 'Casual', icon: '😊', prompt: 'Casual friendly portrait' },
  { id: 'editorial', label: 'Editorial', icon: '📰', prompt: 'Editorial magazine style' },
  { id: 'avatar', label: 'Avatar', icon: '🤖', prompt: 'AI avatar digital art' },
  { id: 'vintage', label: 'Vintage', icon: '📷', prompt: 'Vintage retro style portrait' },
]

const BACKGROUNDS = [
  { id: 'office', label: 'Modern Office', prompt: 'modern office background' },
  { id: 'studio', label: 'Photo Studio', prompt: 'photo studio background' },
  { id: 'outdoor', label: 'Outdoor', prompt: 'outdoor natural background' },
  { id: 'gradient', label: 'Abstract Gradient', prompt: 'abstract gradient background' },
  { id: 'solid', label: 'Solid Color', prompt: 'solid color background' },
]

function StyleSelector({ styles, selected, onSelect }) {
  return (
    <SimpleGrid columns={3} spacing={3}>
      {styles.map(style => (
        <Card
          key={style.id}
          bg={selected === style.id ? 'blue.900' : 'gray.800'}
          cursor="pointer"
          onClick={() => onSelect(style.id)}
          _hover={{ bg: selected === style.id ? 'blue.800' : 'gray.700' }}
          borderWidth="2px"
          borderColor={selected === style.id ? 'blue.500' : 'transparent'}
        >
          <CardBody p={3}>
            <VStack spacing={1}>
              <Text fontSize="2xl">{style.icon}</Text>
              <Text fontSize="sm" fontWeight={selected === style.id ? 'bold' : 'normal'}>
                {style.label}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  )
}

function HeadshotGenerator({ onGenerated }) {
  const [style, setStyle] = useState('professional')
  const [background, setBackground] = useState('studio')
  const [subject, setSubject] = useState('')
  const [gender, setGender] = useState('male')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const toast = useToast()

  const handleGenerate = async () => {
    if (!subject) {
      toast({ title: 'Please describe the person', status: 'warning', duration: 3000 })
      return
    }

    setIsGenerating(true)
    setProgress(10)

    try {
      const styleConfig = HEADSHOT_STYLES.find(s => s.id === style) || HEADSHOT_STYLES[0]
      const bgConfig = BACKGROUNDS.find(b => b.id === background) || BACKGROUNDS[1]

      setProgress(30)
      const prompt = `Professional headshot photo of ${gender === 'male' ? 'a man' : 'a woman'}, ${subject}. ${styleConfig.prompt}. ${bgConfig.prompt}. High quality, photorealistic, 4K, sharp focus, professional lighting.`

      setProgress(60)
      const result = await generateImage(prompt, 'dall-e-3', '1024x1024')
      const imageUrl = result.data?.[0]?.url

      if (imageUrl) {
        setProgress(90)
        try {
          const publicUrl = await uploadToStorage('headshots', imageUrl, `generated/${Date.now()}.png`)
          await saveHeadshot({
            image_url: imageUrl,
            style,
            background,
            subject,
            gender
          })
        } catch (e) {
          console.log('Storage not configured, saving locally')
        }

        onGenerated({ imageUrl, style, background, subject, gender })
        toast({ title: 'Headshot generated!', status: 'success', duration: 3000 })
      }
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
      setProgress(100)
    }
  }

  return (
    <Card bg="gray.800">
      <CardBody>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Subject Description</FormLabel>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., Asian woman with long black hair, smiling"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Gender</FormLabel>
            <Select value={gender} onChange={e => setGender(e.target.value)} bg="gray.700">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </FormControl>

          <Divider />

          <Text fontWeight="bold">Style</Text>
          <StyleSelector styles={HEADSHOT_STYLES} selected={style} onSelect={setStyle} />

          <Text fontWeight="bold" mt={4}>Background</Text>
          <StyleSelector styles={BACKGROUNDS} selected={background} onSelect={setBackground} />

          {isGenerating && (
            <Box>
              <Text fontSize="sm" mb={2}>Generating headshot...</Text>
              <Progress value={progress} colorScheme="blue" size="sm" borderRadius="full" />
            </Box>
          )}

          <Button
            colorScheme="blue"
            onClick={handleGenerate}
            isLoading={isGenerating}
            size="lg"
            alignSelf="flex-end"
          >
            🎭 Generate Headshot
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

function Gallery({ headshots }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selected, setSelected] = useState(null)
  const toast = useToast()

  const handleSelect = (headshot) => {
    setSelected(headshot)
    onOpen()
  }

  const handleDownload = () => {
    toast({ title: 'Download started...', status: 'info', duration: 2000 })
  }

  const handleUseAsAvatar = () => {
    toast({ title: 'Set as avatar!', status: 'success', duration: 2000 })
    onClose()
  }

  return (
    <>
      {headshots.length === 0 ? (
        <Flex direction="column" align="center" py={20} color="gray.500">
          <Text fontSize="4xl" mb={4}>🖼️</Text>
          <Text>No headshots yet</Text>
          <Text fontSize="sm">Generate your first AI headshot!</Text>
        </Flex>
      ) : (
        <SimpleGrid columns={4} spacing={4}>
          {headshots.map((h, idx) => (
            <Card
              key={idx}
              bg="gray.800"
              cursor="pointer"
              onClick={() => handleSelect(h)}
              _hover={{ bg: 'gray.700' }}
            >
              <CardBody p={2}>
                <AspectRatio ratio={1}>
                  <Image
                    src={h.imageUrl || h.image_url}
                    alt="Headshot"
                    borderRadius="md"
                    objectFit="cover"
                  />
                </AspectRatio>
                <HStack mt={2} spacing={1}>
                  <Badge fontSize="xs">{h.style}</Badge>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>Headshot Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <VStack spacing={4}>
                <Image
                  src={selected.imageUrl || selected.image_url}
                  alt="Headshot"
                  borderRadius="lg"
                  maxH="400px"
                  objectFit="contain"
                />
                <SimpleGrid columns={2} spacing={4} w="full">
                  <Box p={3} bg="gray.700" borderRadius="md">
                    <Text fontSize="sm" color="gray.400">Style</Text>
                    <Text>{selected.style}</Text>
                  </Box>
                  <Box p={3} bg="gray.700" borderRadius="md">
                    <Text fontSize="sm" color="gray.400">Background</Text>
                    <Text>{selected.background}</Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Close</Button>
            <Button colorScheme="blue" onClick={handleUseAsAvatar} mr={3}>Set as Avatar</Button>
            <Button colorScheme="green" onClick={handleDownload}>Download</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

function App() {
  const [headshots, setHeadshots] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const toast = useToast()

  const handleGenerated = (headshot) => {
    setHeadshots([headshot, ...headshots])
  }

  const stats = [
    { label: 'Total Headshots', value: headshots.length, color: 'blue' },
    { label: 'Professional', value: headshots.filter(h => h.style === 'professional').length, color: 'green' },
    { label: 'Creative', value: headshots.filter(h => h.style === 'creative').length, color: 'purple' },
  ]

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box position="fixed" top={0} left={0} right={0} bg="gray.800" p={4} zIndex={100}>
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">🎭 AI Headshot Generator</Text>
            <Badge colorScheme="purple">Powered by OpenAI DALL-E 3</Badge>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="blue">Supabase Storage</Badge>
            <Badge colorScheme="green">{headshots.length} Generated</Badge>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="70px" p={6} gap={6}>
        <Box w="400px">
          <HeadshotGenerator onGenerated={handleGenerated} />

          <Card bg="gray.800" mt={4}>
            <CardBody>
              <Text fontWeight="bold" mb={3}>Quick Stats</Text>
              <VStack spacing={2} align="stretch">
                {stats.map(s => (
                  <Flex key={s.label} justify="space-between" p={2} bg="gray.700" borderRadius="md">
                    <Text color="gray.400">{s.label}</Text>
                    <Text fontWeight="bold" color={`${s.color}.400`}>{s.value}</Text>
                  </Flex>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Box>

        <Box flex={1}>
          <Tabs variant="soft-rounded" colorScheme="blue" onChange={i => setActiveTab(i)}>
            <TabList mb={4}>
              <Tab>Gallery</Tab>
              <Tab>Styles</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <Gallery headshots={headshots} />
              </TabPanel>
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch">
                  <Text fontWeight="bold">Available Styles</Text>
                  {HEADSHOT_STYLES.map(s => (
                    <Card key={s.id} bg="gray.800">
                      <CardBody>
                        <HStack spacing={4}>
                          <Text fontSize="3xl">{s.icon}</Text>
                          <Box>
                            <Text fontWeight="bold">{s.label}</Text>
                            <Text fontSize="sm" color="gray.400">{s.prompt}</Text>
                          </Box>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Box>
  )
}

export default App