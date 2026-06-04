import React from 'react';
import {
  Box, Grid, Flex, Text, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge, Progress
} from '@chakra-ui/react';

const metrics = [
  { label: 'Total Views', value: '24,521', change: '+12%', trend: 'up' },
  { label: 'Total Clicks', value: '1,832', change: '+8%', trend: 'up' },
  { label: 'Engagement Rate', value: '7.4%', change: '+0.3%', trend: 'up' },
  { label: 'Videos Created', value: '147', change: '+23', trend: 'up' },
];

const viewsData = [
  { day: 'Mon', views: 1200 },
  { day: 'Tue', views: 1900 },
  { day: 'Wed', views: 1500 },
  { day: 'Thu', views: 2200 },
  { day: 'Fri', views: 2800 },
  { day: 'Sat', views: 3100 },
  { day: 'Sun', views: 2400 },
];

const topVideos = [
  { title: 'Product Launch Video', views: '4.2K', engagement: '8.5%' },
  { title: 'Social Media Ad', views: '3.8K', engagement: '7.2%' },
  { title: 'Tutorial Series', views: '2.9K', engagement: '9.1%' },
  { title: 'Customer Testimonial', views: '2.1K', engagement: '6.8%' },
];

const platformBreakdown = [
  { platform: 'YouTube', percentage: 45, color: 'red' },
  { platform: 'Instagram', percentage: 30, color: 'purple' },
  { platform: 'TikTok', percentage: 15, color: 'cyan' },
  { platform: 'Twitter', percentage: 10, color: 'blue' },
];

const Analytics = () => {
  const maxViews = Math.max(...viewsData.map(d => d.views));

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="white">Analytics</Text>
          <Text fontSize="sm" color="whiteAlpha.600">Track your video performance</Text>
        </Box>
        <HStack spacing={2}>
          <Badge colorScheme="blue" p={2}>Last 7 days</Badge>
          <Badge colorScheme="gray" p={2}>Export</Badge>
        </HStack>
      </Flex>

      <SimpleGrid columns={4} spacing={4} mb={6}>
        {metrics.map((metric) => (
          <Card key={metric.label} bg="#1e293b" color="white">
            <CardBody>
              <Text color="whiteAlpha.600" fontSize="sm">{metric.label}</Text>
              <Text fontSize="2xl" fontWeight="bold" mt={1}>{metric.value}</Text>
              <Text color="green.400" fontSize="sm">{metric.change}</Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Grid templateColumns="2fr 1fr" gap={6}>
        <Card bg="#1e293b" color="white">
          <CardHeader>
            <Text fontWeight="bold">Views Overview</Text>
          </CardHeader>
          <CardBody pt={0}>
            <Flex align="flex-end" justify="space-between" h="200px" gap={2}>
              {viewsData.map((d) => (
                <VStack key={d.day} spacing={1}>
                  <Box
                    h={`${(d.views / maxViews) * 180}px`}
                    w="40px"
                    bg="blue.500"
                    borderRadius="md"
                    transition="height 0.3s"
                  />
                  <Text fontSize="xs" color="whiteAlpha.600">{d.day}</Text>
                </VStack>
              ))}
            </Flex>
          </CardBody>
        </Card>

        <Card bg="#1e293b" color="white">
          <CardHeader>
            <Text fontWeight="bold">Platform Breakdown</Text>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={4} align="stretch">
              {platformBreakdown.map((p) => (
                <Box key={p.platform}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="sm">{p.platform}</Text>
                    <Text fontSize="sm" color="whiteAlpha.600">{p.percentage}%</Text>
                  </Flex>
                  <Progress value={p.percentage} colorScheme={p.color} size="sm" borderRadius="full" />
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      <Card bg="#1e293b" color="white" mt={6}>
        <CardHeader>
          <Text fontWeight="bold">Top Performing Videos</Text>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            {topVideos.map((video, i) => (
              <Flex
                key={i}
                p={3}
                bg="whiteAlpha.100"
                borderRadius="md"
                justify="space-between"
                align="center"
              >
                <Flex align="center" gap={3}>
                  <Badge colorScheme="blue" fontSize="sm">{i + 1}</Badge>
                  <Text>{video.title}</Text>
                </Flex>
                <HStack spacing={4}>
                  <Text color="whiteAlpha.600">{video.views}</Text>
                  <Badge colorScheme="green">{video.engagement}</Badge>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Analytics;