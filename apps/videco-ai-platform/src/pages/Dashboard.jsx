import React, { useState } from 'react';
import {
  Box, Grid, GridItem, Flex, Text, Button, Card, CardBody, CardHeader,
  Progress, Badge, Stat, StatLabel, StatNumber, StatHelpText,
  SimpleGrid, VStack, HStack, Icon, Divider, Progress
} from '@chakra-ui/react';

const stats = [
  { label: 'Total Videos Created', value: '147', change: '+12%', color: 'blue' },
  { label: 'Total Views', value: '24.5K', change: '+8%', color: 'green' },
  { label: 'Total Clicks', value: '1,832', change: '+15%', color: 'purple' },
  { label: 'Active Campaigns', value: '8', change: '+2', color: 'orange' },
];

const recentVideos = [
  { id: 1, title: 'Product Launch Video', status: 'completed', views: '2.4K', date: '2026-06-01' },
  { id: 2, title: 'Social Media Ad', status: 'processing', views: '-', date: '2026-06-02' },
  { id: 3, title: 'Tutorial Video', status: 'completed', views: '1.8K', date: '2026-06-01' },
  { id: 4, title: 'Testimonial Compilation', status: 'completed', views: '956', date: '2026-05-31' },
  { id: 5, title: 'Brand Story', status: 'draft', views: '-', date: '2026-05-30' },
];

const templates = [
  { id: 1, name: 'Product Demo', icon: '🎬', used: 23 },
  { id: 2, name: 'Social Ad', icon: '📱', used: 45 },
  { id: 3, name: 'Tutorial', icon: '📚', used: 12 },
  { id: 4, name: 'Testimonial', icon: '💬', used: 8 },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Box>
      <Flex gap={6} mb={6}>
        {stats.map((stat) => (
          <Card flex={1} bg="#1e293b" color="white" key={stat.label}>
            <CardBody>
              <Stat>
                <StatLabel color="whiteAlpha.700">{stat.label}</StatLabel>
                <StatNumber fontSize="2xl">{stat.value}</StatNumber>
                <StatHelpText color={`${stat.color}.400`} mb={0}>{stat.change}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </Flex>

      <Grid templateColumns="2fr 1fr" gap={6}>
        <GridItem>
          <Card bg="#1e293b" color="white">
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">Recent Videos</Text>
                <Button size="sm" colorScheme="blue">Create New</Button>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={3} align="stretch">
                {recentVideos.map((video) => (
                  <Flex
                    key={video.id}
                    p={3}
                    bg="whiteAlpha.100"
                    borderRadius="md"
                    justify="space-between"
                    align="center"
                  >
                    <Flex align="center" gap={3}>
                      <Box w="60px" h="40px" bg="blue.600" borderRadius="md" />
                      <Box>
                        <Text fontSize="sm" fontWeight="500">{video.title}</Text>
                        <Text fontSize="xs" color="whiteAlpha.600">{video.date}</Text>
                      </Box>
                    </Flex>
                    <Flex align="center" gap={3}>
                      <Badge
                        colorScheme={
                          video.status === 'completed' ? 'green' :
                          video.status === 'processing' ? 'blue' : 'gray'
                        }
                        fontSize="xs"
                      >
                        {video.status}
                      </Badge>
                      <Text fontSize="sm" color="whiteAlpha.700">{video.views} views</Text>
                    </Flex>
                  </Flex>
                ))}
              </VStack>
            </CardBody>
          </Card>

          <Card bg="#1e293b" color="white" mt={6}>
            <CardHeader>
              <Text fontWeight="bold">Analytics Overview</Text>
            </CardHeader>
            <CardBody pt={0}>
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="whiteAlpha.700">Views</Text>
                  <Text fontSize="sm">24.5K</Text>
                </Flex>
                <Progress value={75} colorScheme="blue" size="sm" borderRadius="full" mb={4} />

                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="whiteAlpha.700">Engagement</Text>
                  <Text fontSize="sm">68%</Text>
                </Flex>
                <Progress value={68} colorScheme="green" size="sm" borderRadius="full" mb={4} />

                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="whiteAlpha.700">Click Rate</Text>
                  <Text fontSize="sm">7.4%</Text>
                </Flex>
                <Progress value={74} colorScheme="purple" size="sm" borderRadius="full" />
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg="#1e293b" color="white">
            <CardHeader>
              <Text fontWeight="bold">Templates</Text>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={3} align="stretch">
                {templates.map((template) => (
                  <Flex
                    key={template.id}
                    p={3}
                    bg="whiteAlpha.100"
                    borderRadius="md"
                    justify="space-between"
                    align="center"
                    cursor="pointer"
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    <Flex align="center" gap={3}>
                      <Text fontSize="xl">{template.icon}</Text>
                      <Text fontSize="sm">{template.name}</Text>
                    </Flex>
                    <Badge colorScheme="blue" fontSize="xs">{template.used}x</Badge>
                  </Flex>
                ))}
              </VStack>
            </CardBody>
          </Card>

          <Card bg="#1e293b" color="white" mt={6}>
            <CardHeader>
              <Text fontWeight="bold">Quick Actions</Text>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={2} align="stretch">
                <Button colorScheme="blue" size="md">🎬 Create Video</Button>
                <Button colorScheme="purple" size="md">🖼️ Create Image</Button>
                <Button colorScheme="green" size="md">📢 Create Campaign</Button>
                <Button variant="outline" size="md">⚡ Automation</Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Dashboard;