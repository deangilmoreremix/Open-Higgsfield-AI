import React, { useState, useCallback } from 'react'
import {
  Box, Flex, VStack, HStack, Text, Button, Input, Select, Card, CardBody,
  Badge, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Textarea, IconButton, Tooltip
} from '@chakra-ui/react'
import { supabase, uploadToStorage, getPublicUrl } from './lib/supabase'
import { generateImage, generateVideo, generateSpeech, transcribeAudio } from './lib/muapi'
import { createResponse, editImage, generateImage as openaiGenerateImage, chatCompletion } from './lib/openai'

const NODE_TYPES = [
  { type: 'input', label: 'Input', color: 'blue', icon: '📥' },
  { type: 'image', label: 'AI Image', color: 'purple', icon: '🖼️' },
  { type: 'video', label: 'AI Video', color: 'orange', icon: '🎬' },
  { type: 'audio', label: 'AI Audio', color: 'green', icon: '🔊' },
  { type: 'chat', label: 'AI Chat', color: 'cyan', icon: '💬' },
  { type: 'storage', label: 'Storage', color: 'yellow', icon: '📦' },
  { type: 'output', label: 'Output', color: 'red', icon: '📤' },
]

function WorkflowNode({ node, onSelect, onDelete, isSelected }) {
  const nodeType = NODE_TYPES.find(n => n.type === node.type) || NODE_TYPES[0]

  return (
    <Card
      bg="gray.800"
      borderColor={isSelected ? `${nodeType.color}.400` : 'gray.700'}
      borderWidth="2px"
      cursor="pointer"
      onClick={() => onSelect(node)}
      _hover={{ borderColor: `${nodeType.color}.300` }}
      transition="all 0.2s"
    >
      <CardBody p={3}>
        <Flex align="center" gap={2} mb={2}>
          <Text fontSize="lg">{nodeType.icon}</Text>
          <Text fontWeight="bold" fontSize="sm">{node.label}</Text>
          <Badge colorScheme={nodeType.color} size="sm">{nodeType.label}</Badge>
        </Flex>
        <Text fontSize="xs" color="gray.400" noOfLines={2}>
          {node.prompt || 'No prompt set'}
        </Text>
        {node.result && (
          <Text fontSize="xs" color="green.400" mt={1}>✓ Complete</Text>
        )}
      </CardBody>
    </Card>
  )
}

function NodeEditor({ node, onSave, onClose }) {
  const [label, setLabel] = useState(node.label)
  const [prompt, setPrompt] = useState(node.prompt || '')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState(node.result || null)
  const toast = useToast()

  const nodeType = NODE_TYPES.find(n => n.type === node.type)

  const handleRun = async () => {
    setIsRunning(true)
    try {
      let res = null
      switch (node.type) {
        case 'image':
          res = await generateImage(prompt)
          break
        case 'video':
          res = await generateVideo(prompt)
          break
        case 'audio':
          res = await generateSpeech(prompt)
          break
        case 'chat':
          res = await createResponse(prompt)
          break
        case 'input':
        case 'storage':
        case 'output':
          res = { message: 'Node type does not generate content directly' }
          break
        default:
          res = await chatCompletion(prompt)
      }
      setResult(res)
      toast({ title: 'Node executed successfully', status: 'success', duration: 3000 })
    } catch (err) {
      toast({ title: `Error: ${err.message}`, status: 'error', duration: 5000 })
    } finally {
      setIsRunning(false)
    }
  }

  const handleSave = () => {
    onSave({ ...node, label, prompt, result })
    onClose()
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>
          <Flex align="center" gap={2}>
            <Text>{nodeType?.icon}</Text>
            <Text>Edit {nodeType?.label} Node</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Node Label</FormLabel>
              <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Enter node label" />
            </FormControl>
            <FormControl>
              <FormLabel>Prompt / Input</FormLabel>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Enter your prompt or input data..."
                rows={4}
              />
            </FormControl>
            {result && (
              <Box w="full" p={3} bg="gray.900" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={2}>Result:</Text>
                <Text fontSize="sm" color="gray.300">{JSON.stringify(result, null, 2)}</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={handleRun} isLoading={isRunning} mr={3}>
            ▶ Run
          </Button>
          <Button colorScheme="green" onClick={handleSave}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function App() {
  const [nodes, setNodes] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodeIdCounter, setNodeIdCounter] = useState(1)
  const [activeTab, setActiveTab] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const addNode = (type) => {
    const nodeType = NODE_TYPES.find(n => n.type === type)
    const newNode = {
      id: nodeIdCounter,
      type,
      label: `${nodeType.label} ${nodeIdCounter}`,
      prompt: '',
      result: null
    }
    setNodes([...nodes, newNode])
    setNodeIdCounter(nodeIdCounter + 1)
    toast({ title: `Added ${nodeType.label} node`, status: 'success', duration: 2000 })
  }

  const selectNode = (node) => {
    setSelectedNode(node)
    onOpen()
  }

  const saveNode = (updatedNode) => {
    setNodes(nodes.map(n => n.id === updatedNode.id ? updatedNode : n))
  }

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId))
    setSelectedNode(null)
    onClose()
    toast({ title: 'Node deleted', status: 'info', duration: 2000 })
  }

  const executeAll = async () => {
    toast({ title: 'Executing workflow...', status: 'info', duration: 2000 })
    for (const node of nodes) {
      if (node.prompt) {
        try {
          let res = null
          switch (node.type) {
            case 'image':
              res = await generateImage(node.prompt)
              break
            case 'video':
              res = await generateVideo(node.prompt)
              break
            case 'audio':
              res = await generateSpeech(node.prompt)
              break
            case 'chat':
              res = await createResponse(node.prompt)
              break
            default:
              res = await chatCompletion(node.prompt)
          }
          setNodes(nodes.map(n => n.id === node.id ? { ...n, result: res } : n))
        } catch (err) {
          toast({ title: `Error in ${node.label}: ${err.message}`, status: 'error', duration: 5000 })
        }
      }
    }
    toast({ title: 'Workflow executed!', status: 'success', duration: 2000 })
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box position="fixed" top={0} left={0} right={0} bg="gray.800" p={4} zIndex={100} borderBottom="1px solid" borderColor="gray.700">
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold">⚡ Vibe Workflow</Text>
            <Badge colorScheme="purple">Powered by MuAPI + OpenAI</Badge>
          </HStack>
          <HStack spacing={2}>
            <Button size="sm" colorScheme="blue" onClick={executeAll}>▶ Execute All</Button>
            <Button size="sm" colorScheme="red" onClick={() => setNodes([])}>Clear</Button>
          </HStack>
        </Flex>
      </Box>

      <Flex pt="70px">
        <Box w="250px" bg="gray.800" h="calc(100vh - 70px)" p={4} borderRight="1px solid" borderColor="gray.700" overflowY="auto">
          <Text fontWeight="bold" mb={4}>Add Nodes</Text>
          <VStack spacing={2} align="stretch">
            {NODE_TYPES.map(nodeType => (
              <Button
                key={nodeType.type}
                leftIcon={<Text>{nodeType.icon}</Text>}
                variant="outline"
                colorScheme={nodeType.color}
                onClick={() => addNode(nodeType.type)}
                justifyContent="flex-start"
                size="md"
              >
                {nodeType.label}
              </Button>
            ))}
          </VStack>

          <Text fontWeight="bold" mt={8} mb={4}>Integrations</Text>
          <VStack spacing={2} align="stretch" fontSize="sm" color="gray.400">
            <Text>🔐 Supabase Storage</Text>
            <Text>🎨 MuAPI (Image/Video)</Text>
            <Text>🤖 OpenAI Responses</Text>
          </VStack>
        </Box>

        <Box flex={1} p={6} overflowY="auto" h="calc(100vh - 70px)">
          <Tabs variant="soft-rounded" colorScheme="blue" onChange={i => setActiveTab(i)}>
            <TabList mb={4}>
              <Tab>Workflow Canvas</Tab>
              <Tab>Results</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                {nodes.length === 0 ? (
                  <Flex direction="column" align="center" justify="center" h="400px" color="gray.500">
                    <Text fontSize="4xl" mb={4}>⚡</Text>
                    <Text fontSize="lg">No nodes yet</Text>
                    <Text fontSize="sm">Click nodes on the left to add them to your workflow</Text>
                  </Flex>
                ) : (
                  <Flex flexWrap="wrap" gap={4}>
                    {nodes.map((node, idx) => (
                      <Box key={node.id}>
                        <WorkflowNode
                          node={node}
                          onSelect={selectNode}
                          onDelete={deleteNode}
                          isSelected={selectedNode?.id === node.id}
                        />
                        {idx < nodes.length - 1 && (
                          <Flex justify="center" my={2}>
                            <Text color="gray.500">→</Text>
                          </Flex>
                        )}
                      </Box>
                    ))}
                  </Flex>
                )}
              </TabPanel>

              <TabPanel p={0}>
                <VStack spacing={4} align="stretch">
                  {nodes.filter(n => n.result).map(node => (
                    <Card key={node.id} bg="gray.800">
                      <CardBody>
                        <Flex justify="space-between" align="center">
                          <HStack>
                            <Text fontWeight="bold">{node.label}</Text>
                            <Badge colorScheme="green">Complete</Badge>
                          </HStack>
                          <Button size="sm" variant="outline">View Details</Button>
                        </Flex>
                        <Box mt={3} p={3} bg="gray.900" borderRadius="md" maxH="200px" overflowY="auto">
                          <Text fontSize="sm" fontFamily="mono">
                            {JSON.stringify(node.result, null, 2)}
                          </Text>
                        </Box>
                      </CardBody>
                    </Card>
                  ))}
                  {nodes.filter(n => n.result).length === 0 && (
                    <Flex direction="column" align="center" justify="center" h="300px" color="gray.500">
                      <Text fontSize="4xl" mb={4}>📊</Text>
                      <Text>No results yet. Run your workflow!</Text>
                    </Flex>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>

      {selectedNode && (
        <NodeEditor
          node={selectedNode}
          onSave={saveNode}
          onClose={() => { onClose(); setSelectedNode(null) }}
        />
      )}
    </Box>
  )
}

export default App