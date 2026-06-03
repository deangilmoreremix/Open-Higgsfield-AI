import React, { useState } from 'react';
import {
  Box, Flex, Text, Button, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge, Input, Select, Tabs, TabList, Tab, TabPanels, TabPanel, Progress, IconButton
} from '@chakra-ui/react';

const campaigns = [
  { id: 1, name: 'Summer Sale 2026', status: 'active', videos: 12, views: '15.2K', ctr: '8.2%' },
  { id: 2, name: 'Product Launch', status: 'active', videos: 8, views: '9.8K', ctr: '6.5%' },
  { id: 3, name: 'Brand Awareness', status: 'paused', videos: 5, views: '4.3K', ctr: '5.1%' },
  { id: 4, name: 'Testimonial Promo', status: 'draft', videos: 3, views: '-', ctr: '-' },
];

const campaignStats = [
  { label: 'Active Campaigns', value: '8', color: 'green' },
  { label: 'Total Videos', value: '45', color: 'blue' },
  { label: 'Total Spend', value: '$234', color: 'purple' },
  { label: 'Avg CTR', value: '7.2%', color: 'orange' },
];

const Campaigns = () => {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="white">Campaigns</Text>
          <Text fontSize="sm" color="whiteAlpha.600">Manage your video campaigns</Text>
        </Box>
        <Button colorScheme="blue">+ Create Campaign</Button>
      </Flex>

      <SimpleGrid columns={4} spacing={4} mb={6}>
        {campaignStats.map((stat) => (
          <Card key={stat.label} bg="#1e293b" color="white">
            <CardBody>
              <Flex align="center" gap={2}>
                <Box w="8px" h="8px" borderRadius="full" bg={`${stat.color}.400`} />
                <Text color="whiteAlpha.600" fontSize="sm">{stat.label}</Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" mt={2}>{stat.value}</Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card bg="#1e293b" color="white">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold">All Campaigns</Text>
            <HStack spacing={2}>
              <Input size="sm" placeholder="Search campaigns" maxW="200px" bg="whiteAlpha.100" border="none" />
              <Select size="sm" maxW="150px" bg="whiteAlpha.100" border="none">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </Select>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            {campaigns.map((campaign) => (
              <Box
                key={campaign.id}
                p={4}
                bg="whiteAlpha.100"
                borderRadius="md"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Flex align="center" gap={3}>
                      <Text fontWeight="bold">{campaign.name}</Text>
                      <Badge
                        colorScheme={
                          campaign.status === 'active' ? 'green' :
                          campaign.status === 'paused' ? 'yellow' : 'gray'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </Flex>
                    <HStack spacing={4} mt={2}>
                      <Text fontSize="sm" color="whiteAlpha.600">{campaign.videos} videos</Text>
                      <Text fontSize="sm" color="whiteAlpha.600">{campaign.views} views</Text>
                      <Text fontSize="sm" color="whiteAlpha.600">CTR: {campaign.ctr}</Text>
                    </HStack>
                  </Box>
                  <HStack spacing={2}>
                    <Button size="sm" colorScheme="blue">Manage</Button>
                    <Button size="sm" variant="outline">Analytics</Button>
                  </HStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Campaigns;