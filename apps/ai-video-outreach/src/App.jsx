import React, { useState } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Button, Card, CardBody, CardHeader,
  Badge, SimpleGrid, Image, Input, Select, useToast, FormControl, FormLabel,
  Textarea, Tabs, TabList, TabPanels, Tab, TabPanel, Divider
} from '@chakra-ui/react'
import { generateImage, imageToVideo, generateSpeech, uploadFile, pollPrediction } from './lib/muapi'

function App() {
  const [prospects, setProspects] = useState([
    { id: 1, name: 'John Smith', email: 'john@company.com', company: 'Tech Corp' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@startup.io', company: 'Startup.io' },
  ])
  const [script, setScript] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const toast = useToast()

  const handleGenerateVideo = async () => {
    if (!script) return
    setIsGenerating(true)
    try {
      const imgResult = await generateImage('Professional headshot for video message, corporate setting')
      const imgUrl = imgResult.data?.outputs?.[0] || imgResult.url

      if (imgUrl) {
        const vidResult = await imageToVideo(imgUrl, { duration: 10 })
        if (vidResult.data?.request_id) {
          const final = await pollPrediction(vidResult.data.request_id)
          if (final.video?.url) {
            setVideoUrl(final.video.url)
            toast({ title: 'Video generated!', status: 'success', duration: 3000 })
          }
        } else if (vidResult.video?.url) {
          setVideoUrl(vidResult.video.url)
          toast({ title: 'Video generated!', status: 'success', duration: 3000 })
        }
      }
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateScript = async (prospect) => {
    try {
      const result = await generateSpeech(`Hello ${prospect.name}, I wanted to reach out about our AI video platform. We help companies like ${prospect.company} create personalized video messages at scale.`)
      toast({ title: 'Script created!', status: 'success', duration: 2000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    }
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box position="fixed" top={0} left={0} right={0} bg="gray.800" p={4} zIndex={100}>
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">🎬 AI Video Outreach</Text>
            <Badge colorScheme="purple">Powered by MuAPI</Badge>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="blue">{prospects.length} Prospects</Badge>
            <Badge colorScheme="green">Ready</Badge>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="70px" p={6} gap={6}>
        <Box w="300px">
          <Card bg="gray.800" mb={4}>
            <CardHeader><Text fontWeight="bold">Prospects</Text></CardHeader>
            <CardBody pt={0}>
              <VStack spacing={2} align="stretch">
                {prospects.map(p => (
                  <Box key={p.id} p={3} bg="gray.700" borderRadius="md" cursor="pointer" _hover={{ bg: 'gray.600' }}>
                    <Text fontWeight="bold">{p.name}</Text>
                    <Text fontSize="sm" color="gray.400">{p.company}</Text>
                    <Button size="xs" mt={2} colorScheme="blue" onClick={() => handleCreateScript(p)}>
                      Generate Script
                    </Button>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Box>

        <Box flex={1}>
          <Tabs variant="soft-rounded" colorScheme="purple" onChange={i => setActiveTab(i)}>
            <TabList mb={4}>
              <Tab>Script Editor</Tab>
              <Tab>Video Generation</Tab>
              <Tab>Distribution</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <Card bg="gray.800">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Video Script</FormLabel>
                        <Textarea
                          value={script}
                          onChange={e => setScript(e.target.value)}
                          placeholder="Enter your outreach script..."
                          rows={8}
                        />
                      </FormControl>
                      <Button colorScheme="blue" alignSelf="flex-end">
                        Save Script
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel p={0}>
                <Card bg="gray.800">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Text fontWeight="bold">Generate Video</Text>
                      <Button
                        colorScheme="purple"
                        onClick={handleGenerateVideo}
                        isLoading={isGenerating}
                        isDisabled={!script}
                      >
                        🎬 Generate Video
                      </Button>
                      {videoUrl && (
                        <Box>
                          <Text fontSize="sm" mb={2}>Generated Video:</Text>
                          <video src={videoUrl} controls style={{ maxHeight: '200px', borderRadius: '8px' }} />
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel p={0}>
                <Card bg="gray.800">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Text fontWeight="bold">Distribution Channels</Text>
                      <SimpleGrid columns={3} spacing={4}>
                        <Card bg="gray.700" cursor="pointer" _hover={{ bg: 'gray.600' }}>
                          <CardBody textAlign="center">
                            <Text fontSize="2xl">📧</Text>
                            <Text>Email</Text>
                          </CardBody>
                        </Card>
                        <Card bg="gray.700" cursor="pointer" _hover={{ bg: 'gray.600' }}>
                          <CardBody textAlign="center">
                            <Text fontSize="2xl">💼</Text>
                            <Text>LinkedIn</Text>
                          </CardBody>
                        </Card>
                        <Card bg="gray.700" cursor="pointer" _hover={{ bg: 'gray.600' }}>
                          <CardBody textAlign="center">
                            <Text fontSize="2xl">🐦</Text>
                            <Text>Twitter</Text>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                      <Button colorScheme="green">
                        🚀 Send to All Prospects
                      </Button>
                    </VStack>
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