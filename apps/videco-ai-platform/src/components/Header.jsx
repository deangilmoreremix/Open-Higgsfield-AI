import React from 'react';
import {
  Box, Flex, Text, Input, InputGroup, InputLeftElement, IconButton, Avatar, Badge, Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react';

const Header = ({ title, collapsed }) => {
  return (
    <Box
      bg="#1e293b"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      px={6}
      py={3}
      position="fixed"
      top={0}
      left={collapsed ? '60px' : '240px'}
      right={0}
      zIndex={99}
      transition="left 0.3s"
    >
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={4}>
          <Text fontSize="xl" fontWeight="bold" color="white">{title}</Text>
        </Flex>

        <Flex align="center" gap={4}>
          <InputGroup maxW="400px" size="sm">
            <InputLeftElement>
              <Text>🔍</Text>
            </InputLeftElement>
            <Input
              placeholder="Search videos, campaigns..."
              bg="whiteAlpha.100"
              border="none"
              color="white"
              _placeholder={{ color: 'whiteAlpha.600' }}
              _focus={{ bg: 'whiteAlpha.200' }}
              borderRadius="md"
            />
          </InputGroup>

          <Flex align="center" gap={2}>
            <Text fontSize="sm" color="whiteAlpha.700">Free Plan</Text>
            <Badge colorScheme="purple" fontSize="xs">PRO</Badge>
          </Flex>

          <Avatar size="sm" name="User" bg="blue.500" color="white" cursor="pointer" />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;