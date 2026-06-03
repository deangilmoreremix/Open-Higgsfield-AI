import React, { useState } from 'react';
import {
  Box, Grid, Flex, Text, Button, Card, CardBody, CardHeader,
  SimpleGrid, VStack, HStack, Badge, Input, InputGroup, Select, Tabs, TabList, Tab, TabPanels, TabPanel, IconButton
} from '@chakra-ui/react';

const imageProjects = [
  { id: 1, title: 'Product Showcase', type: 'product', status: 'completed', views: '892' },
  { id: 2, title: 'Social Media Post', type: 'social', status: 'completed', views: '1.2K' },
  { id: 3, title: 'Banner Design', type: 'banner', status: 'draft', views: '-' },
  { id: 4, title: 'Profile Picture', type: 'profile', status: 'completed', views: '456' },
];

const imageStyles = [
  { id: 1, name: 'Photorealistic', icon: '📷', count: 45 },
  { id: 2, name: '3D Render', icon: '🎨', count: 32 },
  { id: 3, name: 'Vector Art', icon: '✏️', count: 28 },
  { id: 4, name: 'Anime', icon: '🎭', count: 19 },
  { id: 5, name: 'Oil Painting', icon: '🖼️', count: 24 },
  { id: 6, name: 'Digital Art', icon: '💻', count: 38 },
];

const AIImages = () => {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="white">AI Image Generator</Text>
          <Text fontSize="sm" color="whiteAlpha.600">Create stunning images with AI</Text>
        </Box>
        <Button colorScheme="purple">+ Create New Image</Button>
      </Flex>

      <Grid templateColumns="1fr 300px" gap={6}>
        <Box>
          <Card bg="#1e293b" color="white">
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">Image Projects</Text>
                <HStack spacing={2}>
                  <InputGroup size="sm" maxW="200px">
                    <Input placeholder="Search images..." bg="whiteAlpha.100" border="none" />
                  </InputGroup>
                  <Select size="sm" maxW="150px" bg="whiteAlpha.100" border="none">
                    <option value="">All Types</option>
                    <option value="product">Product</option>
                    <option value="social">Social</option>
                    <option value="banner">Banner</option>
                  </Select>
                </HStack>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={2} spacing={4}>
                {imageProjects.map((project) => (
                  <Card key={project.id} bg="whiteAlpha.100">
                    <CardBody p={3}>
                      <Box h="150px" bg="purple.900" borderRadius="md" mb={3} />
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontSize="sm" fontWeight="500">{project.title}</Text>
                          <Badge fontSize="xs" mt={1}>{project.type}</Badge>
                        </Box>
                        <VStack spacing={1} align="flex-end">
                          <Badge colorScheme={project.status === 'completed' ? 'green' : 'gray'}>{project.status}</Badge>
                          <Text fontSize="xs" color="whiteAlpha.600">{project.views} views</Text>
                        </VStack>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        </Box>

        <Box>
          <Card bg="#1e293b" color="white">
            <CardHeader>
              <Text fontWeight="bold">Image Styles</Text>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={2} align="stretch">
                {imageStyles.map((style) => (
                  <Flex
                    key={style.id}
                    p={3}
                    bg="whiteAlpha.100"
                    borderRadius="md"
                    justify="space-between"
                    align="center"
                    cursor="pointer"
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    <Flex align="center" gap={3}>
                      <Text fontSize="lg">{style.icon}</Text>
                      <Text fontSize="sm">{style.name}</Text>
                    </Flex>
                    <Badge colorScheme="purple" fontSize="xs">{style.count}</Badge>
                  </Flex>
                ))}
              </VStack>
            </CardBody>
          </Card>

          <Card bg="#1e293b" color="white" mt={4}>
            <CardHeader>
              <Text fontWeight="bold">Quick Create</Text>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={2}>
                <Input placeholder="Describe your image..." size="sm" bg="whiteAlpha.100" />
                <Button colorScheme="purple" size="md" w="full">Generate Image</Button>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Grid>
    </Box>
  );
};

export default AIImages;