import React from 'react';
import {
  Box, Flex, VStack, Text, Icon, Button, Divider, Badge
} from '@chakra-ui/react';

const navItems = [
  { label: 'Dashboard', icon: '📊', path: '/' },
  { label: 'AI Videos', icon: '🎬', path: '/ai-videos', badge: '12' },
  { label: 'AI Images', icon: '🖼️', path: '/ai-images' },
  { label: 'AI Chat', icon: '💬', path: '/ai-chat' },
  { label: 'Analytics', icon: '📈', path: '/analytics' },
  { label: 'Campaigns', icon: '📢', path: '/campaigns' },
  { label: 'Automation', icon: '⚡', path: '/automation' },
  { label: 'Affiliate', icon: '🎯', path: '/affiliate' },
];

const Sidebar = ({ currentPage, setCurrentPage, collapsed }) => {
  return (
    <Box
      w={collapsed ? '60px' : '240px'}
      bg="#0f172a"
      color="white"
      h="100vh"
      position="fixed"
      left={0}
      top={0}
      transition="width 0.3s"
      zIndex={100}
      overflowY="auto"
      overflowX="hidden"
    >
      <Box p={4} pb={2}>
        <Flex align="center" gap={2}>
          <Text fontSize="xl" fontWeight="bold">🎬</Text>
          {!collapsed && <Text fontWeight="bold" fontSize="lg">VidECO</Text>}
        </Flex>
      </Box>

      <Divider borderColor="whiteAlpha.200" />

      <VStack spacing={1} align="stretch" p={2} mt={2}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            onClick={() => setCurrentPage(item.path)}
            variant={currentPage === item.path ? 'solid' : 'ghost'}
            justifyContent={collapsed ? 'center' : 'flex-start'}
            color={currentPage === item.path ? 'white' : 'whiteAlpha.700'}
            bg={currentPage === item.path ? 'blue.600' : 'transparent'}
            _hover={{ bg: currentPage === item.path ? 'blue.700' : 'whiteAlpha.100' }}
            size="md"
            fontWeight={currentPage === item.path ? '600' : '400'}
            position="relative"
          >
            <Text mr={collapsed ? 0 : 3}>{item.icon}</Text>
            {!collapsed && (
              <>
                <Text flex={1} textAlign="left" fontSize="sm">{item.label}</Text>
                {item.badge && (
                  <Badge colorScheme="purple" fontSize="xs">{item.badge}</Badge>
                )}
              </>
            )}
          </Button>
        ))}
      </VStack>

      <Divider borderColor="whiteAlpha.200" mt={4} />

      <VStack spacing={1} align="stretch" p={2}>
        <Button
          onClick={() => setCurrentPage('/settings')}
          variant={currentPage === '/settings' ? 'solid' : 'ghost'}
          justifyContent={collapsed ? 'center' : 'flex-start'}
          color={currentPage === '/settings' ? 'white' : 'whiteAlpha.700'}
          _hover={{ bg: 'whiteAlpha.100' }}
          size="md"
        >
          <Text mr={collapsed ? 0 : 3}>⚙️</Text>
          {!collapsed && <Text fontSize="sm">Settings</Text>}
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;