import React from 'react';
import {
  Box, Flex, Text, Button, Card, CardBody, CardHeader, VStack, HStack, Input, Switch, Badge, Select
} from '@chakra-ui/react';

const Settings = () => {
  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" color="white" mb={6}>Settings</Text>

      <VStack spacing={4} align="stretch" maxW="800px">
        <Card bg="#1e293b" color="white">
          <CardHeader>
            <Text fontWeight="bold">Account Settings</Text>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="500">Email</Text>
                  <Text fontSize="sm" color="whiteAlpha.600">user@example.com</Text>
                </Box>
                <Button size="sm" variant="outline">Change</Button>
              </Flex>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="500">Password</Text>
                  <Text fontSize="sm" color="whiteAlpha.600">Last changed 30 days ago</Text>
                </Box>
                <Button size="sm" variant="outline">Update</Button>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="#1e293b" color="white">
          <CardHeader>
            <Text fontWeight="bold">Preferences</Text>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="500">Email Notifications</Text>
                  <Text fontSize="sm" color="whiteAlpha.600">Receive email updates</Text>
                </Box>
                <Switch colorScheme="blue" defaultChecked />
              </Flex>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="500">Video Autoplay</Text>
                  <Text fontSize="sm" color="whiteAlpha.600">Autoplay videos in feed</Text>
                </Box>
                <Switch colorScheme="blue" />
              </Flex>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="500">Dark Mode</Text>
                  <Text fontSize="sm" color="whiteAlpha.600">Use dark theme</Text>
                </Box>
                <Switch colorScheme="blue" defaultChecked />
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="#1e293b" color="white">
          <CardHeader>
            <Text fontWeight="bold">Integrations</Text>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.100" borderRadius="md">
                <HStack spacing={3}>
                  <Text fontSize="xl">📹</Text>
                  <Box>
                    <Text fontWeight="500">YouTube</Text>
                    <Badge colorScheme="green" fontSize="xs">Connected</Badge>
                  </Box>
                </HStack>
                <Button size="sm" variant="outline">Manage</Button>
              </Flex>
              <Flex justify="space-between" align="center" p={3} bg="whiteAlpha.100" borderRadius="md">
                <HStack spacing={3}>
                  <Text fontSize="xl">📸</Text>
                  <Box>
                    <Text fontWeight="500">Instagram</Text>
                    <Badge colorScheme="gray" fontSize="xs">Not Connected</Badge>
                  </Box>
                </HStack>
                <Button size="sm" colorScheme="blue">Connect</Button>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="#1e293b" color="white">
          <CardHeader>
            <Text fontWeight="bold">Billing</Text>
          </CardHeader>
          <CardBody pt={0}>
            <Flex justify="space-between" align="center">
              <Box>
                <HStack spacing={2}>
                  <Text fontWeight="500">Free Plan</Text>
                  <Badge colorScheme="purple">PRO</Badge>
                </HStack>
                <Text fontSize="sm" color="whiteAlpha.600">Upgrade for more features</Text>
              </Box>
              <Button colorScheme="blue">Upgrade Plan</Button>
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Settings;