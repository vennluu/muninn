import React, { useMemo, useState } from 'react';
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
  Button,
  Link,
  IconButton,
  Grid,
  Select,
} from '@chakra-ui/react';
import { 
  FiGithub, FiUsers, FiDatabase, FiExternalLink, 
  FiShare2, FiActivity, FiStar, FiGitBranch, FiCode 
} from 'react-icons/fi';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { ObjectDetail } from 'src/types/Object';
import { Fact } from 'src/types';
import { Progress } from '@chakra-ui/react';
import { useObjectDetail } from '../contexts/ObjectDetailContext';

interface PublicProjectProfileProps {
  object: ObjectDetail;
  facts: Fact[];
}

// Mock GitHub data
const mockGithubData = {
  stars: 128,
  forks: 42,
  contributors: 12,
  commits: 856,
  languages: [
    { name: 'TypeScript', percent: 65 },
    { name: 'Rust', percent: 20 },
    { name: 'CSS', percent: 10 },
    { name: 'Other', percent: 5 },
  ],
  recentCommits: [
    { msg: 'feat: add passport issuance core', date: '2 days ago' },
    { msg: 'fix: validation logic for on-chain badges', date: '4 days ago' },
    { msg: 'docs: update integration guide', date: '1 week ago' },
  ]
};

// Mock chart data
const chartData = [
  { date: 'Feb 15', dau: 120 },
  { date: 'Feb 19', dau: 300 },
  { date: 'Feb 23', dau: 250 },
  { date: 'Feb 27', dau: 450 },
  { date: 'Mar 03', dau: 400 },
  { date: 'Mar 07', dau: 550 },
  { date: 'Mar 11', dau: 480 },
  { date: 'Mar 15', dau: 600 },
  { date: 'Mar 17', dau: 580 },
];

export const PublicProjectProfile: React.FC<PublicProjectProfileProps> = ({ object, facts }) => {
  const { linkedObjects, orgId } = useObjectDetail();

  const [githubView, setGithubView] = useState<'overview' | 'stars' | 'commits' | 'contributors' | 'languages' | 'activity'>('overview');

  const githubAnalyticsData = useMemo(() => {
    const seed = object.name.length * 17 + (object.description?.length || 0);
    const points = Array.from({ length: 12 }, (_, i) => {
      const t = i / 11;
      const noise = Math.round(8 * Math.sin((i + seed) * 0.9));
      const stars = Math.max(0, 40 + Math.round(120 * t) + noise);
      const commits = Math.max(0, 30 + Math.round(420 * t) + Math.round(20 * Math.sin((i + seed) * 0.6)));
      const contributors = Math.max(1, 2 + Math.round(18 * t) + Math.round(2 * Math.sin((i + seed) * 0.4)));
      return { idx: i, stars, commits, contributors };
    });
    return points;
  }, [object.name, object.description]);

  const allTypeValues = object.typeValues.reduce((acc, tv) => ({ ...acc, ...tv.type_values }), {} as Record<string, any>);
  
  const website = allTypeValues.Website || allTypeValues.website || 'passportx.vercel.app';
  const github = allTypeValues.Github || allTypeValues.github || '';
  const category = object.types?.[0]?.name || 'Developer Tools & Infrastructure';
  const teamSize = linkedObjects?.length || 0;

  return (
    <VStack align="stretch" spacing={6} p={4} bg="gray.50" minH="100%">
      {/* Project Header */}
      <Box bg="white" p={6} borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.100">
        <VStack align="start" spacing={4}>
          <HStack justify="space-between" w="full">
            <Avatar size="xl" name={object.name} src={object.photo} borderRadius="2xl" shadow="md" />
            <HStack spacing={2}>
              <IconButton aria-label="Share" icon={<FiShare2 />} variant="ghost" borderRadius="full" />
              <Button leftIcon={<FiExternalLink />} colorScheme="blue" size="sm" borderRadius="full" as={Link} href={website} isExternal>
                Visit Site
              </Button>
            </HStack>
          </HStack>
          
          <VStack align="start" spacing={1}>
            <Heading size="lg">{object.name}</Heading>
            <Text color="gray.500" fontSize="sm">{website}</Text>
          </VStack>
          
          <Text color="gray.600" fontSize="md">{object.description}</Text>
          
          <HStack spacing={2} wrap="wrap">
            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">{category}</Badge>
            <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="full">Stacks</Badge>
          </HStack>

          <Divider />

          <HStack spacing={8}>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.400" textTransform="uppercase" fontWeight="bold">Impact</Text>
              <HStack>
                <Icon as={FiActivity} color="green.500" />
                <Text fontWeight="bold">High</Text>
              </HStack>
            </VStack>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.400" textTransform="uppercase" fontWeight="bold">Team</Text>
              <HStack>
                <Icon as={FiUsers} color="blue.500" />
                <Text fontWeight="bold">{teamSize}</Text>
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      </Box>

      {/* On-chain Metrics */}
      <Box bg="white" p={6} borderRadius="2xl" shadow="sm">
        <HStack justify="space-between" mb={6}>
          <Heading size="sm">On-chain Metrics</Heading>
          <HStack bg="gray.100" p={1} borderRadius="lg">
            {['7D', '30D', '90D', '1Y'].map(t => (
              <Button key={t} size="xs" variant={t === '30D' ? 'white' : 'ghost'} shadow={t === '30D' ? 'sm' : 'none'} borderRadius="md">
                {t}
              </Button>
            ))}
          </HStack>
        </HStack>

        <SimpleGrid columns={3} spacing={4} mb={8}>
          <MetricStat label="Transactions" value="4K" sub="Last 30D" />
          <MetricStat label="DAU" value="2K" sub="Last 30D" />
          <MetricStat label="Gas Fees" value="1.67 STX" sub="Last 30D" />
        </SimpleGrid>

        <Box h="200px" w="full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3182CE" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3182CE" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#A0AEC0'}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="dau" stroke="#3182CE" strokeWidth={2} fillOpacity={1} fill="url(#colorDau)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Data Sources / Contracts */}
      <Box bg="white" p={6} borderRadius="2xl" shadow="sm">
        <HStack spacing={2} mb={6}>
          <Icon as={FiDatabase} color="blue.500" />
          <Heading size="sm">Data Sources</Heading>
        </HStack>
        <VStack align="stretch" spacing={4}>
          <DataSourceItem 
            title="SP3KKF...anager" 
            type="Stacks" 
            desc="AI-generated summary not available yet" 
          />
          <DataSourceItem 
            title="SP3KKF...ontrol" 
            type="Stacks" 
            badge="Social"
            desc="This contract provides centralized access control for badge issuance and community management." 
          />
          {github && (
            <DataSourceItem 
              title={github.split('/').slice(-2).join('/')}
              type="GitHub" 
              badge="Public"
              desc="Main repository for PassportX development." 
            />
          )}
        </VStack>
      </Box>

      {/* Related Objects */}
      <Box bg="white" p={5} borderRadius="xl" shadow="sm">
        <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="wider" mb={4}>
          Team & Ecosystem
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

      {/* GitHub Deep Analysis */}
      <Box bg="white" p={6} borderRadius="2xl" shadow="sm" border="1px" borderColor="blue.50">
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon as={FiGithub} color="gray.800" fontSize="xl" />
              <Heading size="sm">GitHub Deep Analysis</Heading>
              {!github && (
                <Badge colorScheme="gray" variant="subtle" borderRadius="full" fontSize="10px">
                  No repo linked
                </Badge>
              )}
            </HStack>
            <HStack spacing={2}>
              <Select
                size="sm"
                value={githubView}
                onChange={(e) => setGithubView(e.target.value as any)}
                borderRadius="full"
                bg="gray.50"
                w={{ base: '160px', md: '220px' }}
              >
                <option value="overview">Overview</option>
                <option value="stars">Stars</option>
                <option value="commits">Commits</option>
                <option value="contributors">Contributors</option>
                <option value="languages">Languages</option>
                <option value="activity">Recent Activity</option>
              </Select>
              {github ? (
                <Button size="xs" variant="ghost" colorScheme="blue" as={Link} href={github} isExternal>
                  View Repository
                </Button>
              ) : (
                <Button size="xs" variant="ghost" colorScheme="gray" isDisabled>
                  View Repository
                </Button>
              )}
            </HStack>
          </HStack>

            {githubView === 'overview' && (
              <>
                <SimpleGrid columns={4} spacing={4}>
                  <MetricStat label="Stars" value={mockGithubData.stars} icon={FiStar} />
                  <MetricStat label="Forks" value={mockGithubData.forks} icon={FiGitBranch} />
                  <MetricStat label="Commits" value={mockGithubData.commits} icon={FiActivity} />
                  <MetricStat label="Contribs" value={mockGithubData.contributors} icon={FiUsers} />
                </SimpleGrid>

                <Divider />

                <Grid templateColumns={{ base: '1fr', md: '1fr 1.5fr' }} gap={6}>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={4} textTransform="uppercase">Languages</Text>
                    <VStack align="stretch" spacing={3}>
                      {mockGithubData.languages.map((lang, idx) => (
                        <Box key={lang.name}>
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" fontWeight="medium">{lang.name}</Text>
                            <Text fontSize="xs" color="gray.500">{lang.percent}%</Text>
                          </HStack>
                          <Progress value={lang.percent} size="xs" borderRadius="full" colorScheme={idx === 0 ? 'blue' : 'gray'} />
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={4} textTransform="uppercase">Recent Activity</Text>
                    <VStack align="stretch" spacing={3}>
                      {mockGithubData.recentCommits.map((commit, idx) => (
                        <HStack key={idx} spacing={3} p={2} borderRadius="md" _hover={{ bg: 'gray.50' }}>
                          <Icon as={FiCode} fontSize="xs" color="blue.500" />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{commit.msg}</Text>
                            <Text fontSize="10px" color="gray.400">{commit.date}</Text>
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </Grid>
              </>
            )}

            {githubView === 'stars' && (
              <Box h="240px" w="full">
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={3} textTransform="uppercase">Stars</Text>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={githubAnalyticsData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="idx" axisLine={false} tickLine={false} tick={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="stars" stroke="#3182CE" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {githubView === 'commits' && (
              <Box h="240px" w="full">
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={3} textTransform="uppercase">Commits</Text>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={githubAnalyticsData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ghCommits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3182CE" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3182CE" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="idx" axisLine={false} tickLine={false} tick={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="commits" stroke="#3182CE" strokeWidth={2} fill="url(#ghCommits)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}

            {githubView === 'contributors' && (
              <Box h="240px" w="full">
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={3} textTransform="uppercase">Contributors</Text>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={githubAnalyticsData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="idx" axisLine={false} tickLine={false} tick={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="contributors" fill="#3182CE" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {githubView === 'languages' && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={4} textTransform="uppercase">Languages</Text>
                <VStack align="stretch" spacing={3}>
                  {mockGithubData.languages.map((lang, idx) => (
                    <Box key={lang.name}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" fontWeight="medium">{lang.name}</Text>
                        <Text fontSize="xs" color="gray.500">{lang.percent}%</Text>
                      </HStack>
                      <Progress value={lang.percent} size="xs" borderRadius="full" colorScheme={idx === 0 ? 'blue' : 'gray'} />
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {githubView === 'activity' && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={4} textTransform="uppercase">Recent Activity</Text>
                <VStack align="stretch" spacing={3}>
                  {mockGithubData.recentCommits.map((commit, idx) => (
                    <HStack key={idx} spacing={3} p={2} borderRadius="md" _hover={{ bg: 'gray.50' }}>
                      <Icon as={FiCode} fontSize="xs" color="blue.500" />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{commit.msg}</Text>
                        <Text fontSize="10px" color="gray.400">{commit.date}</Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
        </VStack>
      </Box>
    </VStack>
  );
};

const MetricStat = ({ label, value, sub, icon }: any) => (
  <VStack align="start" spacing={0}>
    <HStack spacing={1} mb={1}>
      {icon && <Icon as={icon} fontSize="10px" color="gray.400" />}
      <Text fontSize="10px" color="gray.400" fontWeight="bold" textTransform="uppercase">{label}</Text>
    </HStack>
    <Text fontSize="lg" fontWeight="extrabold" color="gray.700">{value}</Text>
    {sub && <Text fontSize="9px" color="gray.400">{sub}</Text>}
  </VStack>
);

const DataSourceItem = ({ title, type, badge, desc }: any) => (
  <Box p={4} borderRadius="xl" border="1px" borderColor="gray.100" _hover={{ bg: 'blue.50', borderColor: 'blue.100' }} transition="all 0.2s">
    <HStack justify="space-between" mb={2}>
      <VStack align="start" spacing={0}>
        <Text fontSize="sm" fontWeight="bold" color="blue.600">{title}</Text>
        <Text fontSize="xs" color="gray.400">{type}</Text>
      </VStack>
      {badge && <Badge colorScheme="blue" variant="subtle" fontSize="10px" borderRadius="md">{badge}</Badge>}
    </HStack>
    <Text fontSize="xs" color="gray.500" noOfLines={2}>{desc}</Text>
  </Box>
);
