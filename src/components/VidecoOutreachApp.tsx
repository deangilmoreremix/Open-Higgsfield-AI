import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/common/sidebar';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Button,
  Spinner,
  Text,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Card,
  CardBody,
  Heading,
  Container,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabContent,
  TabPanel,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
} from '@chakra-ui/react';
import { ChevronDownIcon, FiPlay, FiPause, FiUsers, FiGlobe, FiMail, FiCalendar, FiBarChart2, FiPlus } from 'react-icons/all';
import { FiFilm } from 'react-icons/fi';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const VidecoOutreachApp: React.FC = () => {
  const supabase = createClientComponentClient();
  const session = useSession();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const toast = useToast();
  const user = session?.user;

  const fetchWorkflows = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('workflows').select('*').eq('user_id', user?.id);
      if (error) throw error;
      setWorkflows(data || []);
    } catch {
      toast({
        title: 'Error fetching workflows',
        description: 'Could not load your workflows',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user, supabase, toast]);

  useEffect(() => {
    if (user) fetchWorkflows();
  }, [user, fetchWorkflows]);

  const runWorkflow = async () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  const defaultWorkflows = [
    {
      id: 'video-creation',
      name: 'Video Creation Pipeline',
      description: 'Generate, edit, and publish videos automatically',
      steps: [
        { id: 'generate', name: 'Generate Content', type: 'ai-generate', status: 'pending' },
        { id: 'edit', name: 'Edit & Polish', type: 'timeline-edit', status: 'pending' },
        { id: 'personalize', name: 'Add Personalization', type: 'personalization', status: 'pending' },
        { id: 'export', name: 'Export Final Video', type: 'export', status: 'pending' },
        { id: 'publish', name: 'Auto Publish', type: 'social-publish', status: 'pending' }
      ],
      triggers: ['manual', 'schedule'],
      integrations: ['social-media', 'email', 'analytics']
    },
    {
      id: 'batch-processing',
      name: 'Batch Video Processing',
      description: 'Process multiple videos with consistent branding',
      steps: [
        { id: 'upload', name: 'Batch Upload', type: 'batch-upload', status: 'pending' },
        { id: 'process', name: 'Apply Templates', type: 'template-apply', status: 'pending' },
        { id: 'quality', name: 'Quality Check', type: 'quality-gate', status: 'pending' },
        { id: 'distribute', name: 'Distribute', type: 'multi-publish', status: 'pending' }
      ],
      triggers: ['upload', 'api'],
      integrations: ['cloud-storage', 'cdn', 'analytics']
    }
  ];

  const allWorkflows = [...defaultWorkflows, ...workflows];

  if (!session) {
    return (
      <Box textAlign="center" alignItems="center" justifyContent="center" display="flex" flexDirection="column" height="full" width="full">
        <Spinner size="xl" />
        <Text mt={7}><a href="/auth/login">Please Login</a></Text>
      </Box>
    );
  }

  return (
    <>
      <Sidebar>
        <Flex direction="column" bg="white" mb={2} boxShadow="sm" w="full">
          <Flex justifyContent="space-between" alignItems="center" px={4} py={3}>
            <Heading size="md">Outreach Agent</Heading>
          </Flex>
        </Flex>
        
        <Container maxW="container.xl" py={4}>
          <Tabs defaultIndex={0} colorScheme="blue" mb={4}>
            <TabList>
              <Tab>Workflows</Tab>
              <Tab>Templates</Tab>
              <Tab>Analytics</Tab>
              <Tab>Settings</Tab>
            </TabList>
            <TabContent>
              <TabPanel p={0} pt={4}>
                <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                  <GridItem>
                    <Card hoverable cursor="pointer" onClick={() => setSelectedWorkflow({ name: 'New Workflow', steps: [] })}>
                      <CardBody textAlign="center">
                        <FiPlus size={48} style={{ margin: '0 auto 12px' }} />
                        <Heading size="md">Create New Workflow</Heading>
                        <Text color="gray.500" mt={2}>
                          Start building your outreach automation
                        </Text>
                      </CardBody>
                    </Card>
                  </GridItem>
                  
                  {allWorkflows.map((workflow) => (
                    <GridItem key={workflow.id}>
                      <Card>
                        <CardBody>
                          <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Heading size="sm">{workflow.name}</Heading>
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={(e) => {
                                e.stopPropagation();
                                runWorkflow();
                              }}
                              isDisabled={isRunning}
                            >
                              {isRunning ? <FiPause /> : <FiPlay />}
                            </Button>
                          </Flex>
                          <Text color="gray.500" fontSize="sm" mb={3}>
                            {workflow.description}
                          </Text>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="xs" color="gray.400">
                              {workflow.steps.length} steps
                            </Text>
                            <Menu>
                              <MenuButton as={Button} size="xs" variant="ghost">
                                <ChevronDownIcon />
                              </MenuButton>
                              <MenuList>
                                <MenuItem onClick={() => setSelectedWorkflow(workflow)}>
                                  View Details
                                </MenuItem>
                                <MenuItem onClick={() => runWorkflow()}>
                                  Run Workflow
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Flex>
                        </CardBody>
                      </Card>
                    </GridItem>
                  ))}
                </Grid>
              </TabPanel>
              
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {[
                    { name: 'Cold Email', icon: FiMail, desc: 'Personalized email campaigns' },
                    { name: 'Video Outreach', icon: FiFilm, desc: 'Video messaging at scale' },
                    { name: 'Social Media', icon: FiGlobe, desc: 'Multi-platform posting' },
                    { name: 'Lead Qualification', icon: FiUsers, desc: 'Automated lead scoring' },
                    { name: 'Follow-up Sequences', icon: FiCalendar, desc: 'Nurture campaigns' },
                    { name: 'Analytics Dashboard', icon: FiBarChart2, desc: 'Performance tracking' },
                  ].map((template) => (
                    <Card key={template.name} hoverable>
                      <CardBody textAlign="center">
                        <template.icon size={48} style={{ margin: '0 auto 12px' }} />
                        <Heading size="sm">{template.name}</Heading>
                        <Text color="gray.500" fontSize="sm" mt={2}>
                          {template.desc}
                        </Text>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </TabPanel>
              
              <TabPanel>
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Performance Analytics</Heading>
                    <SimpleGrid columns={3} spacing={4}>
                      <Box textAlign="center" p={4} bg="gray.50" borderRadius="md">
                        <Text fontSize="2xl" fontWeight="bold">1,247</Text>
                        <Text color="gray.500">Videos Created</Text>
                      </Box>
                      <Box textAlign="center" p={4} bg="gray.50" borderRadius="md">
                        <Text fontSize="2xl" fontWeight="bold">89%</Text>
                        <Text color="gray.500">Success Rate</Text>
                      </Box>
                      <Box textAlign="center" p={4} bg="gray.50" borderRadius="md">
                        <Text fontSize="2xl" fontWeight="bold">$42.5K</Text>
                        <Text color="gray.500">Revenue Generated</Text>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </TabPanel>
              
              <TabPanel>
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Workflow Settings</Heading>
                    <Text color="gray.500">
                      Configure your outreach automation preferences and integrations.
                    </Text>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabContent>
          </Tabs>
        </Container>
      </Sidebar>
      
      <Modal isOpen={!!selectedWorkflow} onClose={() => setSelectedWorkflow(null)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedWorkflow?.name || 'Workflow Details'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="gray.500" mb={4}>{selectedWorkflow?.description}</Text>
            <Divider mb={4} />
            <Heading size="sm" mb={3}>Steps</Heading>
            {selectedWorkflow?.steps?.map((step: any) => (
              <Card key={step.id} mb={2}>
                <CardBody>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="medium">{step.name}</Text>
                    <Text fontSize="xs" color="gray.500">{step.type}</Text>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default VidecoOutreachApp;