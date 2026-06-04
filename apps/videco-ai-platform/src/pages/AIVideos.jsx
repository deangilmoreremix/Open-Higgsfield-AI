import React, { useState } from 'react';
import {
  Box, Flex, Text, Button, Card, CardBody, CardHeader,
  SimpleGrid, VStack, HStack, Badge, Input, InputGroup,
  Select, Tabs, TabList, TabPanels, Tab, TabPanel, Progress
} from '@chakra-ui/react';

const aiVideoTemplates = [
  { id: 1, name: 'Product Demo', duration: '30s', style: 'Modern', category: 'Marketing' },
  { id: 2, name: 'Social Media Ad', duration: '15s', style: 'Dynamic', category: 'Social' },
  { id: 3, name: 'Tutorial', duration: '60s', style: 'Educational', category: 'Educational' },
  { id: 4, name: 'Testimonial', duration: '45s', style: 'Professional', category: 'Social' },
  { id: 5, name: 'Brand Story', duration: '90s', style: 'Cinematic', category: 'Brand' },
  { id: 6, name: 'Promo', duration: '10s', style: 'Fast-paced', category: 'Marketing' },
];

const videoProjects = [
  { id: 1, title: 'Summer Sale Promo', status: 'completed', progress: 100, views: '3.2K' },
  { id: 2, title: 'New Product Launch', status: 'processing', progress: 67, views: '-' },
  { id: 3, title: 'Customer Testimonials', status: 'draft', progress: 0, views: '-' },
  { id: 4, title: 'How-To Tutorial', status: 'completed', progress: 100, views: '1.5K' },
  { id: 5, title: 'Brand Introduction', status: 'processing', progress: 45, views: '-' },
];

const AIVideos = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="white">AI Video Creator</Text>
          <Text fontSize="sm" color="whiteAlpha.600">Create stunning videos with AI</Text>
        </Box>
        <Button colorScheme="blue">+ Create New Video</Button>
      </Flex>

      <Tabs variant="soft-rounded" colorScheme="blue" onChange={(i) => setActiveTab(i)}>
        <TabList mb={4}>
          <Tab>Templates</Tab>
          <Tab>My Videos</Tab>
          <Tab>Drafts</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <SimpleGrid columns={3} spacing={4}>
              {aiVideoTemplates.map((template) => (
                <Card
                  key={template.id}
                  bg="#1e293b"
                  color="white"
                  cursor="pointer"
                  onClick={() => setSelectedTemplate(template)}
                  _hover={{ transform: 'scale(1.02)', borderColor: 'blue.500' }}
                  borderWidth="2px"
                  borderColor="transparent"
                  transition="all 0.2s"
                >
                  <CardBody>
                    <Box h="120px" bg="blue.900" borderRadius="md" mb={3} display="flex" alignItems="center" justifyContent="center">
                      <Text fontSize="4xl">🎬</Text>
                    </Box>
                    <Text fontWeight="bold" fontSize="md" mb={1}>{template.name}</Text>
                    <Flex gap={2} mb={2}>
                      <Badge fontSize="xs">{template.duration}</Badge>
                      <Badge fontSize="xs" colorScheme="purple">{template.style}</Badge>
                    </Flex>
                    <Text fontSize="xs" color="whiteAlpha.600">{template.category}</Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>

          <TabPanel p={0}>
            <VStack spacing={3} align="stretch">
              {videoProjects.map((video) => (
                <Card key={video.id} bg="#1e293b" color="white">
                  <CardBody>
                    <Flex justify="space-between" align="center">
                      <Flex align="center" gap={4}>
                        <Box w="100px" h="60px" bg="blue.700" borderRadius="md" />
                        <Box>
                          <Text fontWeight="bold">{video.title}</Text>
                          <HStack spacing={2} mt={1}>
                            <Badge
                              colorScheme={video.status === 'completed' ? 'green' : video.status === 'processing' ? 'blue' : 'gray'}
                            >
                              {video.status}
                            </Badge>
                            {video.status === 'processing' && (
                              <Progress value={video.progress} size="sm" colorScheme="blue" w="100px" borderRadius="full" />
                            )}
                          </HStack>
                        </Box>
                      </Flex>
                      <HStack spacing={2}>
                        <Text fontSize="sm" color="whiteAlpha.600">{video.views} views</Text>
                        <Button size="sm" colorScheme="blue">Edit</Button>
                        <Button size="sm" variant="outline">Download</Button>
                      </HStack>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </TabPanel>

          <TabPanel p={0}>
            <Card bg="#1e293b" color="white">
              <CardBody>
                <Flex direction="column" align="center" py={10}>
                  <Text fontSize="4xl" mb={4}>📝</Text>
                  <Text fontWeight="bold" mb={2}>No drafts yet</Text>
                  <Text color="whiteAlpha.600">Start creating a video to save drafts</Text>
                </Flex>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AIVideos;