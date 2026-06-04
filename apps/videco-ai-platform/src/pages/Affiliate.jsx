import React from 'react';
import {
  Box, Flex, Text, Button, Card, CardBody, CardHeader, SimpleGrid, VStack, HStack, Badge, Progress
} from '@chakra-ui/react';

const affiliateStats = [
  { label: 'Total Earnings', value: '$1,234', change: '+$89' },
  { label: 'Referrals', value: '45', change: '+5' },
  { label: 'Conversion Rate', value: '12%', change: '+2%' },
  { label: 'Avg Commission', value: '$27', change: '+$3' },
];

const referrals = [
  { name: 'Sarah M.', email: 'sarah@example.com', status: 'active', earnings: '$234', joined: '2026-05-15' },
  { name: 'John D.', email: 'john@example.com', status: 'active', earnings: '$189', joined: '2026-05-10' },
  { name: 'Mike R.', email: 'mike@example.com', status: 'pending', earnings: '$45', joined: '2026-06-01' },
  { name: 'Lisa K.', email: 'lisa@example.com', status: 'active', earnings: '$312', joined: '2026-04-20' },
];

const Affiliate = () => {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="white">Affiliate Program</Text>
          <Text fontSize="sm" color="whiteAlpha.600">Earn by referring new users</Text>
        </Box>
        <Button colorScheme="green">Get Referral Link</Button>
      </Flex>

      <SimpleGrid columns={4} spacing={4} mb={6}>
        {affiliateStats.map((stat) => (
          <Card key={stat.label} bg="#1e293b" color="white">
            <CardBody>
              <Text color="whiteAlpha.600" fontSize="sm">{stat.label}</Text>
              <Text fontSize="2xl" fontWeight="bold" mt={1}>{stat.value}</Text>
              <Text color="green.400" fontSize="sm">{stat.change}</Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card bg="#1e293b" color="white">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold">Your Referrals</Text>
            <HStack spacing={2}>
              <Badge colorScheme="green">Active: 3</Badge>
              <Badge colorScheme="yellow">Pending: 1</Badge>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            {referrals.map((ref) => (
              <Flex
                key={ref.email}
                p={4}
                bg="whiteAlpha.100"
                borderRadius="md"
                justify="space-between"
                align="center"
              >
                <Flex align="center" gap={4}>
                  <Box w="40px" h="40px" borderRadius="full" bg="blue.600" display="flex" alignItems="center" justifyContent="center">
                    <Text>{ref.name[0]}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">{ref.name}</Text>
                    <Text fontSize="sm" color="whiteAlpha.600">{ref.email}</Text>
                  </Box>
                </Flex>
                <HStack spacing={4}>
                  <Badge colorScheme={ref.status === 'active' ? 'green' : 'yellow'}>{ref.status}</Badge>
                  <Text color="whiteAlpha.600">{ref.joined}</Text>
                  <Text fontWeight="bold" color="green.400">{ref.earnings}</Text>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Affiliate;