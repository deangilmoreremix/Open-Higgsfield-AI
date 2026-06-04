import React from 'react';
import {
  Box, Flex, Text, Button, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge, Switch, Icon
} from '@chakra-ui/react';

const automations = [
  { id: 1, name: 'Daily Video Report', trigger: 'Schedule', status: true, lastRun: '2 hours ago' },
  { id: 2, name: 'Social Media Post', trigger: 'Video Complete', status: true, lastRun: '1 day ago' },
  { id: 3, name: 'Email Summary', trigger: 'Weekly', status: false, lastRun: '3 days ago' },
  { id: 4, name: 'Campaign Optimization', trigger: 'AI Trigger', status: true, lastRun: '30 min ago' },
];

const templates = [
  { id: 1, name: 'Post to Social', icon: '📱', description: 'Automatically post videos to social platforms' },
  { id: 2, name: 'Email Report', icon: '📧', description: 'Send weekly performance reports' },
  { id: 3, name: 'Generate Thumbnail', icon: '🖼️', description: 'Create AI thumbnails for new videos' },
  { id: 4, name: 'Content Repurpose', icon: '🔄', description: 'Convert videos to different formats' },
];

const Automation = () => {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="white">Automation</Text>
          <Text fontSize="sm" color="whiteAlpha.600">Automate your video workflow</Text>
        </Box>
        <Button colorScheme="orange">+ Create Automation</Button>
      </Flex>

      <SimpleGrid columns={2} gap={6}>
        <Card bg="#1e293b" color="white">
          <CardHeader>
            <Text fontWeight="bold">Active Automations</Text>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={4} align="stretch">
              {automations.map((auto) => (
                <Flex
                  key={auto.id}
                  p={4}
                  bg="whiteAlpha.100"
                  borderRadius="md"
                  justify="space-between"
                  align="center"
                >
                  <Box>
                    <Flex align="center" gap={3}>
                      <Text fontWeight="bold">{auto.name}</Text>
                      <Badge colorScheme="blue" fontSize="xs">{auto.trigger}</Badge>
                    </Flex>
                    <Text fontSize="xs" color="whiteAlpha.600" mt={1}>Last run: {auto.lastRun}</Text>
                  </Box>
                  <Switch colorScheme="green" isChecked={auto.status} />
                </Flex>
              ))}
            </VStack>
          </CardBody>
        </Card>

        <Card bg="#1e293b" color="white">
          <CardHeader>
            <Text fontWeight="bold">Automation Templates</Text>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              {templates.map((template) => (
                <Box
                  key={template.id}
                  p={4}
                  bg="whiteAlpha.100"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: 'whiteAlpha.200' }}
                >
                  <Flex align="center" gap={3}>
                    <Text fontSize="2xl">{template.icon}</Text>
                    <Box>
                      <Text fontWeight="bold">{template.name}</Text>
                      <Text fontSize="sm" color="whiteAlpha.600">{template.description}</Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default Automation;