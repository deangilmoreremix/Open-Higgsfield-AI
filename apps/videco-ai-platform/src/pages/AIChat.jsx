import React, { useState } from 'react';
import {
  Box, Grid, Flex, Text, Button, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge, Input, Textarea, Select, Tabs, TabList, Tab, TabPanels, TabPanel
} from '@chakra-ui/react';

const chatSessions = [
  { id: 1, title: 'Video Ideas', messages: 24, last: '2 min ago' },
  { id: 2, title: 'Script Writing', messages: 15, last: '1 hour ago' },
  { id: 3, title: 'Content Strategy', messages: 8, last: '3 hours ago' },
];

const suggestedPrompts = [
  'Create a video script for a product launch',
  'Generate marketing ideas for my brand',
  'Write a compelling call-to-action',
  'Design a social media content calendar',
];

const AIChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you create amazing video content today?' }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I can help you with video scripts, marketing ideas, content strategy, and more!' }]);
    }, 1000);
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="white">AI Chat Assistant</Text>
          <Text fontSize="sm" color="whiteAlpha.600">Get help with your video content</Text>
        </Box>
        <Button colorScheme="green">+ New Chat</Button>
      </Flex>

      <Grid templateColumns="250px 1fr" gap={6} h="calc(100vh - 180px)">
        <Box>
          <Card bg="#1e293b" color="white" h="full">
            <CardHeader>
              <Text fontWeight="bold">Chat History</Text>
            </CardHeader>
            <CardBody pt={0} overflowY="auto">
              <VStack spacing={2} align="stretch">
                {chatSessions.map((session) => (
                  <Box
                    key={session.id}
                    p={3}
                    bg="whiteAlpha.100"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    <Text fontSize="sm" fontWeight="500">{session.title}</Text>
                    <Text fontSize="xs" color="whiteAlpha.600">{session.messages} messages · {session.last}</Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Box>

        <Box>
          <Card bg="#1e293b" color="white" h="full" display="flex" flexDirection="column">
            <Box flex={1} overflowY="auto" p={4}>
              <VStack spacing={4} align="stretch">
                {messages.map((msg, i) => (
                  <Flex
                    key={i}
                    justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                  >
                    <Box
                      maxW="70%"
                      p={4}
                      borderRadius="lg"
                      bg={msg.role === 'user' ? 'blue.600' : 'whiteAlpha.100'}
                    >
                      <Text>{msg.content}</Text>
                    </Box>
                  </Flex>
                ))}
              </VStack>
            </Box>

            <Box p={4} borderTop="1px solid" borderColor="whiteAlpha.100">
              <Flex gap={2}>
                <Input
                  placeholder="Ask me anything about video creation..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  bg="whiteAlpha.100"
                />
                <Button colorScheme="blue" onClick={handleSend}>Send</Button>
              </Flex>

              <HStack mt={3} flexWrap="wrap" gap={2}>
                {suggestedPrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="outline"
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </HStack>
            </Box>
          </Card>
        </Box>
      </Grid>
    </Box>
  );
};

export default AIChat;