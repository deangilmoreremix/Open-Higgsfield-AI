import React, { useState, useEffect } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Button, Input, Select, Card, CardBody,
  CardHeader, Badge, Tabs, TabList, TabPanels, Tab, TabPanel, Textarea,
  Image, useToast, FormControl, FormLabel, SimpleGrid, Progress, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, Grid, GridItem, Avatar, Divider, Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react'
import { supabase, savePost, getScheduledPosts, updatePost, deletePost, uploadMedia } from './lib/supabase'
import { chatCompletion, generateImage } from './lib/openai'

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter', icon: '🐦', color: 'blue' },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'pink' },
  { id: 'facebook', label: 'Facebook', icon: '👍', color: 'blue' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'blue' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'black' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: 'red' },
]

const CONTENT_TYPES = [
  { id: 'text', label: 'Text Post', icon: '📝' },
  { id: 'image', label: 'Image Post', icon: '🖼️' },
  { id: 'video', label: 'Video Post', icon: '🎬' },
  { id: 'story', label: 'Story', icon: '📱' },
]

const CATEGORIES = [
  'Marketing', 'Educational', 'Entertainment', 'Promotional', 'Engagement', 'Behind the Scenes', 'User Generated', 'Announcement'
]

function PostCreator({ onPostCreated }) {
  const [content, setContent] = useState('')
  const [platform, setPlatform] = useState('twitter')
  const [contentType, setContentType] = useState('text')
  const [scheduledFor, setScheduledFor] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const toast = useToast()

  const handleGenerateContent = async () => {
    if (!content) return
    setIsGenerating(true)
    try {
      const generated = await chatCompletion(
        `Generate engaging social media content for ${platform}. Original idea: ${content}. Make it suitable for ${platform} platform with appropriate length and style.`
      )
      setContent(generated)
      toast({ title: 'Content generated!', status: 'success', duration: 2000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateImage = async () => {
    setIsGenerating(true)
    try {
      const result = await generateImage(content)
      if (result.data?.[0]?.url) {
        setMediaUrl(result.data[0].url)
        toast({ title: 'Image generated!', status: 'success', duration: 2000 })
      }
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSchedule = async () => {
    if (!content || !scheduledFor) {
      toast({ title: 'Please fill in content and schedule time', status: 'warning', duration: 3000 })
      return
    }
    setIsPosting(true)
    try {
      const post = {
        content,
        platform,
        content_type: contentType,
        scheduled_for: scheduledFor,
        media_url: mediaUrl,
        status: 'scheduled'
      }
      await savePost(post)
      onPostCreated(post)
      setContent('')
      setMediaUrl('')
      toast({ title: 'Post scheduled!', status: 'success', duration: 3000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <Card bg="gray.800">
      <CardBody>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>What do you want to post about?</FormLabel>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter your post idea or topic..."
              rows={3}
            />
          </FormControl>

          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Platform</FormLabel>
              <Select value={platform} onChange={e => setPlatform(e.target.value)} bg="gray.700">
                {PLATFORMS.map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Content Type</FormLabel>
              <Select value={contentType} onChange={e => setContentType(e.target.value)} bg="gray.700">
                {CONTENT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Schedule For</FormLabel>
              <Input
                type="datetime-local"
                value={scheduledFor}
                onChange={e => setScheduledFor(e.target.value)}
                bg="gray.700"
              />
            </FormControl>
          </HStack>

          {contentType === 'image' && (
            <Box>
              <FormControl>
                <FormLabel>Image URL (optional)</FormLabel>
                <Input
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                  placeholder="Enter image URL or generate one"
                />
              </FormControl>
              <Button mt={2} size="sm" colorScheme="purple" onClick={handleGenerateImage} isLoading={isGenerating}>
                🎨 Generate Image
              </Button>
              {mediaUrl && (
                <Image src={mediaUrl} alt="Generated" mt={2} maxW="200px" borderRadius="md" />
              )}
            </Box>
          )}

          <HStack spacing={2}>
            <Button variant="outline" onClick={handleGenerateContent} isLoading={isGenerating}>
              ✨ Generate Content
            </Button>
            <Button colorScheme="green" onClick={handleSchedule} isLoading={isPosting} flex={1}>
              📅 Schedule Post
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

function PostCard({ post, onDelete, onEdit }) {
  const platform = PLATFORMS.find(p => p.id === post.platform) || PLATFORMS[0]
  const contentType = CONTENT_TYPES.find(t => t.id === post.content_type) || CONTENT_TYPES[0]

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'green'
      case 'scheduled': return 'blue'
      case 'failed': return 'red'
      default: return 'gray'
    }
  }

  return (
    <Card bg="gray.800" _hover={{ bg: 'gray.750' }}>
      <CardBody>
        <Flex justify="space-between" align="flex-start">
          <HStack spacing={3}>
            <Avatar size="sm" name={platform.label} icon={platform.icon} bg={`${platform.color}.500`} />
            <Box flex={1}>
              <HStack mb={2}>
                <Badge colorScheme={platform.color}>{platform.icon} {platform.label}</Badge>
                <Badge colorScheme={contentType.color || 'gray'}>{contentType.icon} {contentType.label}</Badge>
                <Badge colorScheme={getStatusColor(post.status)}>{post.status}</Badge>
              </HStack>
              <Text color="gray.200" noOfLines={3}>{post.content}</Text>
              {post.media_url && (
                <Image src={post.media_url} alt="Media" maxW="150px" mt={2} borderRadius="md" />
              )}
              <Text fontSize="xs" color="gray.500" mt={2}>
                Scheduled: {new Date(post.scheduled_for).toLocaleString()}
              </Text>
            </Box>
          </HStack>
          <Menu>
            <MenuButton as={IconButton} icon="•••" variant="ghost" size="sm" />
            <MenuList bg="gray.700">
              <MenuItem bg="gray.700" onClick={() => onEdit(post)}>Edit</MenuItem>
              <MenuItem bg="gray.700" color="red.400" onClick={() => onDelete(post.id)}>Delete</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </CardBody>
    </Card>
  )
}

function CalendarView({ posts }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getPostsForDay = (day) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduled_for)
      return postDate.getDate() === day &&
             postDate.getMonth() === currentDate.getMonth() &&
             postDate.getFullYear() === currentDate.getFullYear()
    })
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Card bg="gray.800">
      <CardHeader>
        <Flex justify="space-between" align="center">
          <IconButton icon="◀" onClick={prevMonth} variant="ghost" />
          <Text fontWeight="bold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <IconButton icon="▶" onClick={nextMonth} variant="ghost" />
        </Flex>
      </CardHeader>
      <CardBody pt={0}>
        <Grid templateColumns="repeat(7, 1fr)" gap={1}>
          {dayNames.map(day => (
            <GridItem key={day} textAlign="center" fontSize="xs" color="gray.500" py={2}>
              {day}
            </GridItem>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <GridItem key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayPosts = getPostsForDay(day)
            const isToday = new Date().getDate() === day &&
                           new Date().getMonth() === currentDate.getMonth() &&
                           new Date().getFullYear() === currentDate.getFullYear()

            return (
              <GridItem
                key={day}
                p={2}
                bg={isToday ? 'blue.900' : dayPosts.length > 0 ? 'gray.700' : 'gray.800'}
                borderRadius="md"
                minH="60px"
                cursor="pointer"
                _hover={{ bg: 'gray.600' }}
              >
                <Text fontSize="sm" fontWeight={isToday ? 'bold' : 'normal'}>{day}</Text>
                {dayPosts.length > 0 && (
                  <VStack spacing={1} mt={1}>
                    {dayPosts.slice(0, 2).map(post => (
                      <Badge key={post.id} colorScheme="blue" fontSize="xs" w="full" textAlign="center">
                        {PLATFORMS.find(p => p.id === post.platform)?.icon}
                      </Badge>
                    ))}
                    {dayPosts.length > 2 && (
                      <Text fontSize="xs" color="gray.500">+{dayPosts.length - 2}</Text>
                    )}
                  </VStack>
                )}
              </GridItem>
            )
          })}
        </Grid>
      </CardBody>
    </Card>
  )
}

function Analytics() {
  const stats = [
    { label: 'Total Posts', value: '47', change: '+12%', color: 'blue' },
    { label: 'Published', value: '32', change: '+8%', color: 'green' },
    { label: 'Scheduled', value: '15', change: '+5', color: 'orange' },
    { label: 'Engagement', value: '2.4K', change: '+15%', color: 'purple' },
  ]

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={4} spacing={4}>
        {stats.map(stat => (
          <Card key={stat.label} bg="gray.800">
            <CardBody>
              <Text color="gray.400">{stat.label}</Text>
              <Text fontSize="2xl" fontWeight="bold">{stat.value}</Text>
              <Text color={`${stat.color}.400`} fontSize="sm">{stat.change}</Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card bg="gray.800">
        <CardHeader>
          <Text fontWeight="bold">Platform Performance</Text>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            {PLATFORMS.map(platform => (
              <Flex key={platform.id} justify="space-between" align="center" p={3} bg="gray.700" borderRadius="md">
                <HStack>
                  <Text fontSize="xl">{platform.icon}</Text>
                  <Text>{platform.label}</Text>
                </HStack>
                <HStack spacing={4}>
                  <VStack spacing={0} align="flex-end">
                    <Text fontSize="sm" fontWeight="bold">{Math.floor(Math.random() * 50) + 10}</Text>
                    <Text fontSize="xs" color="gray.400">posts</Text>
                  </VStack>
                  <VStack spacing={0} align="flex-end">
                    <Text fontSize="sm" fontWeight="bold">{Math.floor(Math.random() * 5000) + 500}</Text>
                    <Text fontSize="xs" color="gray.400">engagements</Text>
                  </VStack>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

function App() {
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [view, setView] = useState('list')
  const toast = useToast()

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const data = await getScheduledPosts()
      setPosts(data || [])
    } catch (err) {
      console.log('Using demo data (Supabase not configured)')
      setPosts([])
    }
  }

  const handlePostCreated = (post) => {
    setPosts([{ ...post, id: Date.now() }, ...posts])
  }

  const handleDeletePost = async (id) => {
    try {
      await deletePost(id)
    } catch (err) {
      console.log('Delete locally')
    }
    setPosts(posts.filter(p => p.id !== id))
    toast({ title: 'Post deleted', status: 'info', duration: 2000 })
  }

  const handleEditPost = (post) => {
    toast({ title: 'Edit functionality coming soon', status: 'info', duration: 2000 })
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box position="fixed" top={0} left={0} right={0} bg="gray.800" p={4} zIndex={100} borderBottom="1px solid" borderColor="gray.700">
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">📅 Free Social Scheduler</Text>
            <Badge colorScheme="green">FREE</Badge>
          </HStack>
          <HStack spacing={2}>
            <Button size="sm" variant={view === 'list' ? 'solid' : 'outline'} onClick={() => setView('list')}>📋 List</Button>
            <Button size="sm" variant={view === 'calendar' ? 'solid' : 'outline'} onClick={() => setView('calendar')}>📅 Calendar</Button>
            <Badge colorScheme="blue">{posts.length} Posts</Badge>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="70px">
        <Box flex={1} p={6} overflowY="auto" h="calc(100vh - 70px)">
          <Tabs variant="soft-rounded" colorScheme="green" onChange={i => setActiveTab(i)}>
            <TabList mb={4}>
              <Tab>📝 Create Post</Tab>
              <Tab>📅 Scheduled ({posts.length})</Tab>
              <Tab>📊 Analytics</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  <PostCreator onPostCreated={handlePostCreated} />

                  <Card bg="gray.800">
                    <CardHeader>
                      <Text fontWeight="bold">Platforms</Text>
                    </CardHeader>
                    <CardBody pt={0}>
                      <SimpleGrid columns={6} spacing={4}>
                        {PLATFORMS.map(p => (
                          <Card key={p.id} bg="gray.700" cursor="pointer" _hover={{ bg: 'gray.600' }}>
                            <CardBody p={3}>
                              <VStack spacing={2}>
                                <Text fontSize="2xl">{p.icon}</Text>
                                <Text fontSize="sm">{p.label}</Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              <TabPanel p={0}>
                {view === 'calendar' ? (
                  <CalendarView posts={posts} />
                ) : (
                  <VStack spacing={4} align="stretch">
                    {posts.length === 0 ? (
                      <Flex direction="column" align="center" py={20} color="gray.500">
                        <Text fontSize="4xl" mb={4}>📅</Text>
                        <Text>No scheduled posts yet</Text>
                        <Text fontSize="sm">Create your first post to get started!</Text>
                      </Flex>
                    ) : (
                      posts.map(post => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onDelete={handleDeletePost}
                          onEdit={handleEditPost}
                        />
                      ))
                    )}
                  </VStack>
                )}
              </TabPanel>

              <TabPanel p={0}>
                <Analytics />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Box>
  )
}

export default App