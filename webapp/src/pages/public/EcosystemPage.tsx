import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Grid, Heading, Text, VStack, HStack, Avatar, Badge, SimpleGrid, Card, CardBody,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, Select,
  Stat, StatLabel, StatNumber, StatHelpText, Divider, Icon, Flex, Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import { useLocation, useHistory } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { 
  FiUsers, FiBriefcase, FiActivity, FiBox, FiTrendingUp, FiSearch, FiDollarSign 
} from 'react-icons/fi';
import { getPublicStats, getPublicObjectTypes, getPublicObjectsByType, listOrganizations, getPublicFeed, getPublicTopObjects, getPublicGDPStats, getPublicSummary, getPublicFunnels, getPublicFunnelView, ObjectTypeStat, PublicTopObject, PublicObjectType, Organization, PublicFeedItem, PublicGDPStat, PublicSummary } from '../../services/publicApi';
import ObjectDetailPanel from '../../features/object-detail/ObjectDetailPanel';
import ObjectsByFunnel from '../../components/views/objects-by-funnel/ObjectsByFunnel';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Hook to get query params
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const EcosystemPage: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const orgId = query.get('orgId') || 'e7b9bde5-76ac-477d-9480-93c098c4f1e9';

  const [stats, setStats] = useState<ObjectTypeStat[]>([]);
  const [objects, setObjects] = useState<PublicTopObject[]>([]);
  const [objectTypes, setObjectTypes] = useState<PublicObjectType[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [feed, setFeed] = useState<PublicFeedItem[]>([]);
  const [topObjects, setTopObjects] = useState<PublicTopObject[]>([]);
  const [gdpStats, setGdpStats] = useState<PublicGDPStat[]>([]);
  const [summary, setSummary] = useState<PublicSummary | null>(null);
  const [funnels, setFunnels] = useState<any[]>([]);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | undefined>(undefined);
  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(undefined);
  const [gdpTypeId, setGdpTypeId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const handleObjectClick = (objectId: string) => {
    setSelectedObjectId(objectId);
    onOpen();
  };

  const isPersonType = (name: string) => {
    const peopleKeywords = ['developer', 'designer', 'marketer', 'member', 'contributor', 'artist', 'founder', 'creator', 'person', 'talent'];
    return peopleKeywords.some(kw => name.toLowerCase().includes(kw));
  };

  const isProjectType = (name: string) => {
    const projectKeywords = ['project', 'startup', 'product', 'app', 'protocol', 'tool', 'ecosystem', 'venture'];
    return projectKeywords.some(kw => name.toLowerCase().includes(kw));
  };

  const peopleCount = stats.filter(s => isPersonType(s.name)).reduce((acc, s) => acc + s.object_count, 0);
  const projectCount = summary?.project_count || 0;
  const totalObjects = summary?.object_count || 0;
  const totalGDP = gdpStats.reduce((acc, s) => acc + s.count, 0);
  const totalEvents = summary?.fact_count || 0;
  const totalTalent = summary?.creator_count || 0;

  const pieData = stats.map(s => ({ name: s.name, value: s.object_count }));

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOrgId = e.target.value;
    history.push(`?orgId=${newOrgId}`);
    setSelectedTypeId(undefined);
    setSearchTerm('');
  };

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgs = await listOrganizations();
        setOrganizations(orgs || []);
      } catch (error) {
        console.error("Failed to fetch organizations", error);
      }
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Reset all data states to prevent showing stale data from previous organization
      setStats([]);
      setObjectTypes([]);
      setFeed([]);
      setTopObjects([]);
      setGdpStats([]);
      setSummary(null);
      setObjects([]);
      setFunnels([]);
      setSelectedFunnelId(undefined);
      setSelectedTypeId(undefined);
      setGdpTypeId(undefined);
      setSearchTerm('');

      try {
        const [statsData, typesData, feedData, topData, gdpData, summaryData, funnelsData] = await Promise.all([
          getPublicStats(orgId),
          getPublicObjectTypes(orgId),
          getPublicFeed(orgId),
          getPublicTopObjects(orgId),
          getPublicGDPStats(orgId, 'month'),
          getPublicSummary(orgId),
          getPublicFunnels(orgId)
        ]);
        
        setStats(statsData || []);
        setObjectTypes(typesData || []);
        setFeed(feedData || []);
        setTopObjects(topData || []);
        setGdpStats(gdpData || []);
        setSummary(summaryData);
        setFunnels(funnelsData || []);
        
        if (typesData && typesData.length > 0 && !selectedTypeId) {
          setSelectedTypeId(typesData[0].id);
        }
        if (funnelsData && funnelsData.length > 0 && !selectedFunnelId) {
          setSelectedFunnelId(funnelsData[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch ecosystem data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orgId]);

  useEffect(() => {
    const fetchGDP = async () => {
      try {
        const gdpData = await getPublicGDPStats(orgId, 'month', gdpTypeId);
        setGdpStats(gdpData || []);
      } catch (error) {
        console.error("Failed to fetch GDP stats", error);
      }
    };
    if (!loading) fetchGDP();
  }, [orgId, gdpTypeId]);

  useEffect(() => {
    const fetchObjects = async () => {
      if (!selectedTypeId) {
        setObjects([]);
        return;
      }
      try {
        const objectsData = await getPublicObjectsByType(orgId, selectedTypeId);
        setObjects(objectsData || []);
      } catch (error) {
        console.error("Failed to fetch objects", error);
      }
    };
    fetchObjects();
  }, [orgId, selectedTypeId]);

  const filteredObjects = objects.filter(obj => 
    obj.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    obj.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTypeValues = (values: Record<string, any>) => {
    if (!values) return null;
    return Object.entries(values).slice(0, 3).map(([key, value]) => {
        if (!value) return null;
        return (
            <Text key={key} fontSize="xs" color="gray.600" noOfLines={1}>
                <Text as="span" fontWeight="bold">{key}:</Text> {String(value)}
            </Text>
        );
    });
  };

  if (loading) return <Box p={10}>Loading Dashboard...</Box>;

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" py={6} borderBottom="1px" borderColor="gray.100" position="sticky" top={0} zIndex={10}>
        <Container maxW="container.xl">
            <HStack justify="space-between" spacing={4}>
                <VStack align="start" spacing={0}>
                  <Heading size="lg" color="blue.600">Ecosystem Insight</Heading>
                  <Text color="gray.500" fontSize="sm">Real-time analysis of people and projects</Text>
                </VStack>
                <Select maxW="300px" value={orgId} onChange={handleOrgChange} bg="white" variant="filled" borderRadius="full">
                    {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </Select>
            </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        {/* Summary Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6} mb={8}>
          <StatCard icon={FiBox} label="Total Assets" value={totalObjects} color="blue.500" />
          <StatCard icon={FiUsers} label="Total Talent" value={totalTalent} color="green.500" />
          <StatCard icon={FiBriefcase} label="Active Projects" value={projectCount} color="purple.500" />
          <StatCard icon={FiDollarSign} label="Ecosystem GDP" value={totalGDP} color="gold.500" isCurrency />
          <StatCard icon={FiActivity} label="Recent Events" value={totalEvents} color="orange.500" />
        </SimpleGrid>

        <Tabs variant="soft-rounded" colorScheme="blue" mb={8}>
          <TabList bg="white" p={2} borderRadius="full" shadow="sm" w="fit-content">
            <Tab><Icon as={FiTrendingUp} mr={2} /> Overview</Tab>
            <Tab><Icon as={FiBox} mr={2} /> Explore Data</Tab>
            <Tab><Icon as={FiActivity} mr={2} /> Funnels</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={6}>
              <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
                <VStack spacing={8} align="stretch">
                  {/* Distribution Charts */}
                  <Grid templateColumns={{ base: "1fr", md: "1.2fr 0.8fr" }} gap={6}>
                    <Box p={6} bg="white" shadow="sm" borderRadius="xl" border="1px" borderColor="gray.100">
                      <Heading size="sm" mb={6}>Distribution by Category</Heading>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={stats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                          <YAxis axisLine={false} tickLine={false} fontSize={12} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="object_count" fill="#3182CE" radius={[4, 4, 0, 0]} name="Objects" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box p={6} bg="white" shadow="sm" borderRadius="xl" border="1px" borderColor="gray.100">
                      <Heading size="sm" mb={6}>Talent vs Project</Heading>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Talent', value: peopleCount },
                              { name: 'Projects', value: projectCount },
                              { name: 'Others', value: totalObjects - peopleCount - projectCount }
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#48BB78" />
                            <Cell fill="#805AD5" />
                            <Cell fill="#A0AEC0" />
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>

                  {/* GDP Trend Chart */}
                  <Box p={6} bg="white" shadow="sm" borderRadius="xl" border="1px" borderColor="gray.100">
                    <HStack justify="space-between" mb={6}>
                      <Heading size="sm" display="flex" alignItems="center">
                        <Icon as={FiDollarSign} mr={2} color="gold.500" /> Ecosystem GDP Growth
                      </Heading>
                      <Select 
                        size="xs" 
                        maxW="150px" 
                        borderRadius="full" 
                        value={gdpTypeId} 
                        onChange={(e) => setGdpTypeId(e.target.value || undefined)}
                      >
                        <option value="">All Categories</option>
                        {objectTypes.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </Select>
                    </HStack>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={[...gdpStats].reverse()}>
                        <defs>
                          <linearGradient id="colorGdp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          fontSize={10} 
                          tickFormatter={(val) => dayjs(val).format('MMM YY')}
                        />
                        <YAxis axisLine={false} tickLine={false} fontSize={10} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                          formatter={(val) => [`$${Number(val).toLocaleString()}`, 'GDP']}
                        />
                        <Area type="monotone" dataKey="count" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorGdp)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Top Objects Section */}
                  <Box>
                    <Heading size="md" mb={6} display="flex" alignItems="center">
                      <Icon as={FiTrendingUp} mr={2} color="blue.500" /> Top Highlights
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {topObjects.slice(0, 6).map((item) => (
                        <Card 
                          key={item.id} 
                          variant="outline" 
                          borderRadius="xl"
                          _hover={{ shadow: 'lg', transform: 'translateY(-2px)', borderColor: 'blue.200' }}
                          transition="all 0.2s"
                          onClick={() => handleObjectClick(item.id)}
                          cursor="pointer"
                        >
                          <CardBody p={5}>
                            <HStack spacing={4} align="start">
                              <Avatar 
                                name={item.name} 
                                src={item.photo} 
                                size="lg" 
                                borderRadius="xl" 
                                shadow="sm"
                              />
                              <Box flex={1}>
                                <HStack justify="space-between" mb={1}>
                                  <Heading size="sm" noOfLines={1}>{item.name}</Heading>
                                  <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                                    {item.type_name.String}
                                  </Badge>
                                </HStack>
                                <Text fontSize="xs" color="gray.500" noOfLines={2} mb={3}>
                                  {item.description}
                                </Text>
                                <HStack spacing={4}>
                                  <HStack spacing={1}>
                                    <Icon as={FiActivity} fontSize="xs" color="green.500" />
                                    <Text fontSize="xs" fontWeight="bold" color="green.600">{item.fact_count} Actions</Text>
                                  </HStack>
                                  <Divider orientation="vertical" h="12px" />
                                  <VStack align="start" spacing={0} flex={1}>
                                    {renderTypeValues(item.type_values)}
                                  </VStack>
                                </HStack>
                              </Box>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>
                </VStack>

                {/* Sidebar: Activity Feed */}
                <Box>
                  <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px" borderColor="gray.100" position="sticky" top="100px">
                    <Heading size="sm" mb={6} display="flex" alignItems="center">
                      <Icon as={FiActivity} mr={2} color="orange.500" /> Recent Activities
                    </Heading>
                    <VStack spacing={6} align="stretch">
                      {feed.length === 0 ? (
                        <Text color="gray.500" fontSize="sm" textAlign="center" py={10}>No recent activities</Text>
                      ) : (
                        feed.map((item) => (
                          <HStack key={item.id} spacing={3} align="start">
                            <Avatar size="xs" name={item.creator_name} src={item.creator_profile?.avatar} />
                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="gray.700">
                                <Text as="span" fontWeight="bold">{item.creator_name}</Text> {item.text}
                              </Text>
                              <Text fontSize="10px" color="gray.400">{dayjs(item.happened_at.Time).fromNow()}</Text>
                            </VStack>
                          </HStack>
                        ))
                      )}
                    </VStack>
                  </Box>
                </Box>
              </Grid>
            </TabPanel>

            <TabPanel p={0} pt={6}>
              <Grid templateColumns={{ base: "1fr", lg: "1fr 3fr" }} gap={8}>
                {/* Categories Sidebar */}
                <Box>
                  <VStack spacing={3} align="stretch">
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" px={2} textTransform="uppercase">Categories</Text>
                    {objectTypes.map((type) => (
                      <HStack 
                        key={type.id} 
                        p={3} 
                        borderRadius="lg" 
                        cursor="pointer"
                        bg={selectedTypeId === type.id ? "blue.50" : "transparent"}
                        color={selectedTypeId === type.id ? "blue.600" : "gray.600"}
                        _hover={{ bg: 'gray.100' }}
                        onClick={() => setSelectedTypeId(type.id)}
                        transition="all 0.2s"
                      >
                        <Avatar size="xs" name={type.name} bg="gray.200" color="gray.600" />
                        <Text fontSize="sm" fontWeight={selectedTypeId === type.id ? "bold" : "medium"} flex={1}>{type.name}</Text>
                        <Badge borderRadius="full">{type.object_count}</Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                {/* Objects List */}
                <Box>
                  <VStack align="stretch" spacing={6}>
                    <InputGroup bg="white" shadow="sm" borderRadius="xl">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input 
                        placeholder="Search for people, projects, or keywords..." 
                        borderRadius="xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        border="1px"
                        borderColor="gray.100"
                        _focus={{ borderColor: 'blue.400', shadow: 'md' }}
                      />
                    </InputGroup>

                    {!selectedTypeId ? (
                      <Flex h="300px" align="center" justify="center" direction="column" bg="white" borderRadius="xl" shadow="sm">
                        <Icon as={FiBox} fontSize="4xl" color="gray.200" mb={4} />
                        <Text color="gray.500">Select a category to explore data</Text>
                      </Flex>
                    ) : filteredObjects.length === 0 ? (
                      <Flex h="300px" align="center" justify="center" direction="column" bg="white" borderRadius="xl" shadow="sm">
                        <Icon as={FiSearch} fontSize="4xl" color="gray.200" mb={4} />
                        <Text color="gray.500">No results found for "{searchTerm}"</Text>
                      </Flex>
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {filteredObjects.map((item) => (
                          <Card 
                            key={item.id} 
                            variant="outline"
                            _hover={{ shadow: 'md', borderColor: 'blue.200' }}
                            onClick={() => handleObjectClick(item.id)}
                            cursor="pointer"
                          >
                            <CardBody p={4}>
                              <HStack spacing={3}>
                                <Avatar name={item.name} src={item.photo} size="md" borderRadius="md" />
                                <Box flex={1}>
                                  <Heading size="xs" mb={1}>{item.name}</Heading>
                                  <Text fontSize="xs" color="gray.500" noOfLines={1}>{item.description}</Text>
                                </Box>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    )}
                  </VStack>
                </Box>
              </Grid>
            </TabPanel>

            <TabPanel p={0} pt={6}>
              <Grid templateColumns={{ base: "1fr", lg: "1fr 3fr" }} gap={8}>
                {/* Funnels Sidebar */}
                <Box>
                  <VStack spacing={3} align="stretch">
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" px={2} textTransform="uppercase">Funnels</Text>
                    {funnels.map((funnel) => (
                      <HStack 
                        key={funnel.id} 
                        p={3} 
                        borderRadius="lg" 
                        cursor="pointer"
                        bg={selectedFunnelId === funnel.id ? "blue.50" : "transparent"}
                        color={selectedFunnelId === funnel.id ? "blue.600" : "gray.600"}
                        _hover={{ bg: 'gray.100' }}
                        onClick={() => setSelectedFunnelId(funnel.id)}
                        transition="all 0.2s"
                      >
                        <Avatar size="xs" name={funnel.name} bg="gray.200" color="gray.600" icon={<Icon as={FiActivity} />} />
                        <Text fontSize="sm" fontWeight={selectedFunnelId === funnel.id ? "bold" : "medium"} flex={1}>{funnel.name}</Text>
                        <Badge borderRadius="full">{funnel.object_count || 0}</Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                {/* Funnel View Content */}
                <Box>
                  <VStack align="stretch" spacing={6}>
                    {!selectedFunnelId ? (
                      <Flex h="500px" align="center" justify="center" direction="column" bg="white" borderRadius="xl" shadow="sm" border="1px" borderColor="gray.100">
                        <Icon as={FiActivity} fontSize="4xl" color="gray.200" mb={4} />
                        <Text color="gray.500">Select a funnel to view details</Text>
                      </Flex>
                    ) : (
                      <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px" borderColor="gray.100" minH="500px">
                        <ObjectsByFunnel
                          funnelId={selectedFunnelId}
                          getFunnelView={(params: any) => getPublicFunnelView({ ...params, orgId })}
                          isPublic={true}
                          onObjectClick={handleObjectClick}
                        />
                      </Box>
                    )}
                  </VStack>
                </Box>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Details View</DrawerHeader>
          <DrawerBody p={0}>
            {selectedObjectId && (
              <ObjectDetailPanel objectId={selectedObjectId} orgId={orgId} />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

interface StatCardProps {
  icon: any;
  label: string;
  value: number;
  color: string;
  isCurrency?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, isCurrency }) => (
  <Card variant="outline" borderRadius="xl" border="1px" borderColor="gray.100" bg="white" shadow="sm">
    <CardBody p={5}>
      <HStack spacing={4}>
        <Flex p={3} borderRadius="lg" bg={`${color.split('.')[0]}.50`} color={color}>
          <Icon as={icon} fontSize="xl" />
        </Flex>
        <VStack align="start" spacing={0}>
          <Text fontSize="xs" color="gray.500" fontWeight="medium">{label}</Text>
          <Heading size="md">
            {isCurrency ? `$${value.toLocaleString()}` : value.toLocaleString()}
          </Heading>
        </VStack>
      </HStack>
    </CardBody>
  </Card>
);


export default EcosystemPage;
