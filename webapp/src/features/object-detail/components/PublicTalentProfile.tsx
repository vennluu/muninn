import React from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Heading,
  Avatar,
  Badge,
  SimpleGrid,
  Divider,
  Icon,
  List,
  ListItem,
  Button,
} from '@chakra-ui/react';
import { FiGithub, FiTwitter, FiGlobe, FiCode, FiActivity, FiExternalLink } from 'react-icons/fi';
import { Bar, BarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ObjectDetail } from 'src/types/Object';
import { Fact } from 'src/types';
import dayjs from 'dayjs';
import { useObjectDetail } from '../contexts/ObjectDetailContext';

interface PublicTalentProfileProps {
  object: ObjectDetail;
  facts: Fact[];
}

export const PublicTalentProfile: React.FC<PublicTalentProfileProps> = ({ object, facts }) => {
  const { linkedObjects, orgId } = useObjectDetail();
  
  // Extract data from typeValues
  const allTypeValues = object.typeValues.reduce((acc, tv) => ({ ...acc, ...tv.type_values }), {} as Record<string, any>);
  
  const github = allTypeValues.Github || allTypeValues.github || '';
  const twitter = allTypeValues.Twitter || allTypeValues.twitter || '';
  const website = allTypeValues.Website || allTypeValues.website || '';
  const bio = object.description || 'i Build, i Innovate, i Solve';
  const role = object.types?.[0]?.name || 'Engineering';

  // Mock some data if not present in typeValues to match the requested UI style
  const followers = allTypeValues.Followers || Math.floor(Math.random() * 200) + 50;
  const projectsCount = allTypeValues.ProjectsCount || Math.floor(Math.random() * 5) + 1;
  const contributions = allTypeValues.GitHubContributions || '6K';

  const githubContribChartData = Array.from({ length: 12 }, (_, i) => {
    const base = 220 + (object.name.length % 7) * 25;
    const wave = Math.round(90 * Math.sin((i / 12) * Math.PI * 2));
    const bump = i > 6 ? (i - 6) * 18 : 0;
    return { idx: i, value: Math.max(30, base + wave + bump) };
  });

  return (
    <VStack align="stretch" spacing={6} p={4} bg="gray.50" minH="100%">
      {/* Profile Header */}
      <Box bg="white" p={6} borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.100">
        <VStack align="center" spacing={4}>
          <Avatar size="2xl" name={object.name} src={object.photo} border="4px solid white" shadow="xl" />
          <VStack spacing={1}>
            <Heading size="lg">{object.name}</Heading>
            <Text color="gray.500" fontWeight="medium">@{object.name.toLowerCase().replace(/\s/g, '')}</Text>
          </VStack>
          <Text textAlign="center" color="gray.600" fontSize="md" maxW="300px">{bio}</Text>
          
          <HStack spacing={6}>
            <VStack spacing={0}>
              <Text fontWeight="bold" fontSize="lg">{followers}</Text>
              <Text fontSize="xs" color="gray.500">Followers</Text>
            </VStack>
            <Divider orientation="vertical" h="30px" />
            <VStack spacing={0}>
              <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">{role}</Badge>
              <Text fontSize="xs" color="gray.500" mt={1}>Primary Role</Text>
            </VStack>
          </HStack>

          <HStack spacing={4} w="full" justify="center" pt={2}>
            {github && <Icon as={FiGithub} cursor="pointer" _hover={{ color: 'blue.500' }} />}
            {twitter && <Icon as={FiTwitter} cursor="pointer" _hover={{ color: 'blue.500' }} />}
            {website && <Icon as={FiGlobe} cursor="pointer" _hover={{ color: 'blue.500' }} />}
          </HStack>
        </VStack>
      </Box>

      {/* Quick Stats */}
      <SimpleGrid columns={2} spacing={4}>
        <StatCard icon={FiCode} label="Projects" value={projectsCount} />
        <StatCard icon={FiActivity} label="Activities" value={facts.length} />
      </SimpleGrid>

      {/* Related Objects */}
      <Box bg="white" p={5} borderRadius="xl" shadow="sm">
        <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="wider" mb={4}>
          Related Projects & Objects
        </Heading>
        {!linkedObjects || linkedObjects.length === 0 ? (
          <Text fontSize="sm" color="gray.500">No related objects found.</Text>
        ) : (
          <VStack align="stretch" spacing={3}>
            {linkedObjects.map((lo) => (
              <HStack
                key={lo.id}
                p={2}
                borderRadius="md"
                _hover={{ bg: 'gray.50' }}
                cursor="pointer"
                onClick={() => {
                  window.location.href = `/public/${orgId || 'org'}/objects/${lo.id}`;
                }}
              >
                <Avatar size="sm" name={lo.name} src={lo.photo} />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="bold" fontSize="sm">{lo.name}</Text>
                  <Text fontSize="xs" color="gray.500">{lo.type_name}</Text>
                </VStack>
                <Icon as={FiExternalLink} color="gray.400" />
              </HStack>
            ))}
          </VStack>
        )}
      </Box>

      {/* Talent Rewards */}
      <Box bg="white" p={5} borderRadius="xl" shadow="sm">
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="wider">Talent Rewards (USD)</Heading>
              <Text fontSize="2xl" fontWeight="extrabold">6 USDC</Text>
            </VStack>
            <Button size="xs" variant="ghost" colorScheme="blue">Breakdown</Button>
          </HStack>
          
          <VStack align="stretch" spacing={3} pl={2} borderLeft="2px solid" borderColor="blue.50">
            <RewardItem label="Wallet Connect Builder Rewards" value="7.0K WCT" color="blue.400" />
            <RewardItem label="Base Builder Rewards" value="0.1142 ETH" color="purple.400" />
            <Text fontSize="10px" color="blue.500" fontWeight="bold" cursor="pointer">See 2 more</Text>
          </VStack>
        </VStack>
      </Box>

      {/* On-chain Activity */}
      <Box bg="white" p={5} borderRadius="xl" shadow="sm">
        <SimpleGrid columns={1} spacing={6}>
          <Box>
            <HStack justify="space-between" mb={2}>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Total Transactions</Text>
                <Text fontSize="xl" fontWeight="bold">28</Text>
              </VStack>
              <Button size="xs" variant="link" colorScheme="gray">Breakdown</Button>
            </HStack>
            <VStack align="stretch" spacing={1} pl={2} borderLeft="2px solid" borderColor="gray.50">
              <HStack justify="space-between" fontSize="10px">
                <Text color="gray.500">Base</Text>
                <Text fontWeight="bold">26.9K</Text>
              </HStack>
              <HStack justify="space-between" fontSize="10px">
                <Text color="gray.500">Celo</Text>
                <Text fontWeight="bold">590.00</Text>
              </HStack>
            </VStack>
            <Text fontSize="9px" color="gray.400" mt={2} textAlign="right">180d Sum</Text>
          </Box>
          
          <Box>
            <HStack justify="space-between" mb={2}>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Gas Fees</Text>
                <Text fontSize="xl" fontWeight="bold">12 USDC</Text>
              </VStack>
              <Button size="xs" variant="link" colorScheme="gray">Breakdown</Button>
            </HStack>
            <VStack align="stretch" spacing={1} pl={2} borderLeft="2px solid" borderColor="gray.50">
              <HStack justify="space-between" fontSize="10px">
                <Text color="gray.500">Base</Text>
                <Text fontWeight="bold">0.0040 ETH</Text>
              </HStack>
              <HStack justify="space-between" fontSize="10px">
                <Text color="gray.500">Celo</Text>
                <Text fontWeight="bold">1.05 CELO</Text>
              </HStack>
            </VStack>
            <Text fontSize="9px" color="gray.400" mt={2} textAlign="right">180d Sum</Text>
          </Box>

          <Box>
            <HStack justify="space-between" mb={2}>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Active Smart Contracts</Text>
                <Text fontSize="xl" fontWeight="bold">4</Text>
              </VStack>
              <Button size="xs" variant="link" colorScheme="gray">Breakdown</Button>
            </HStack>
            <VStack align="stretch" spacing={1} pl={2} borderLeft="2px solid" borderColor="gray.50">
              <HStack justify="space-between" fontSize="10px">
                <Text color="gray.500">Base Mainnet Active Contracts</Text>
                <Text fontWeight="bold">3 contracts</Text>
              </HStack>
              <HStack justify="space-between" fontSize="10px">
                <Text color="gray.500">Celo Mainnet Active Contracts</Text>
                <Text fontWeight="bold">1 contracts</Text>
              </HStack>
            </VStack>
            <Text fontSize="9px" color="gray.400" mt={2} textAlign="right">180d Sum</Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* GitHub Crypto Section */}
      <Box bg="white" p={5} borderRadius="xl" shadow="sm">
        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">GitHub Crypto Commits</Text>
            <Text fontSize="xl" fontWeight="bold">0</Text>
          </VStack>
          <Text fontSize="9px" color="gray.400" alignSelf="flex-end">180d Sum</Text>
        </HStack>
      </Box>

      {/* GitHub Section */}
      <Box bg="white" p={5} borderRadius="xl" shadow="sm" border="1px solid" borderColor="blue.50">
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <HStack spacing={2}>
                <Icon as={FiGithub} color="gray.700" boxSize={3} />
                <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">GitHub Contributions</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" fontWeight="bold">{contributions}</Text>
            </VStack>
            <Badge colorScheme="green" variant="subtle" fontSize="10px">+183,233%</Badge>
          </HStack>
          <Box w="100%" h="72px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={githubContribChartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <Tooltip
                  contentStyle={{ borderRadius: 8, borderColor: '#E2E8F0', fontSize: 12 }}
                  labelFormatter={() => ''}
                  formatter={(val: any) => [val, 'Contribs']}
                />
                <Bar dataKey="value" fill="#3182CE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Text fontSize="9px" color="gray.400" textAlign="right">180d Sum</Text>
        </VStack>
      </Box>

      {/* Recent Activity Feed */}
      <Box bg="white" p={5} borderRadius="xl" shadow="sm">
        <Heading size="xs" textTransform="uppercase" color="gray.500" mb={4} letterSpacing="wider">Recent Activity</Heading>
        <List spacing={4}>
          {facts.slice(0, 3).map((fact) => (
            <ListItem key={fact.id}>
              <HStack align="start" spacing={3}>
                <Box boxSize="8px" borderRadius="full" bg="blue.400" mt={1.5} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="gray.700">{fact.text}</Text>
                  <Text fontSize="10px" color="gray.400">{dayjs(fact.happenedAt).fromNow()}</Text>
                </VStack>
              </HStack>
            </ListItem>
          ))}
        </List>
      </Box>
    </VStack>
  );
};

const StatCard = ({ icon, label, value }: { icon: any, label: string, value: any }) => (
  <Card variant="outline" borderRadius="xl" bg="white">
    <CardBody p={4}>
      <HStack spacing={3}>
        <Icon as={icon} color="blue.500" />
        <VStack align="start" spacing={0}>
          <Text fontSize="xs" color="gray.500">{label}</Text>
          <Text fontWeight="bold">{value}</Text>
        </VStack>
      </HStack>
    </CardBody>
  </Card>
);

const RewardItem = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <HStack justify="space-between">
    <HStack spacing={2}>
      <Box boxSize="6px" borderRadius="full" bg={color} />
      <Text fontSize="xs" color="gray.600">{label}</Text>
    </HStack>
    <Text fontSize="xs" fontWeight="bold">{value}</Text>
  </HStack>
);

const Card = ({ children, variant, borderRadius, bg }: any) => (
  <Box border="1px solid" borderColor="gray.100" borderRadius={borderRadius} bg={bg} shadow="sm">
    {children}
  </Box>
);

const CardBody = ({ children, p }: any) => (
  <Box p={p}>
    {children}
  </Box>
);
