import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Grid, Heading, Text, VStack, HStack, Avatar, Badge, SimpleGrid, Card, CardBody,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, Select
} from '@chakra-ui/react';
import { useLocation, useHistory } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPublicStats, getPublicObjectTypes, getPublicObjectsByType, listOrganizations, ObjectTypeStat, PublicTopObject, PublicObjectType, Organization } from '../../services/publicApi';
import ObjectDetailPanel from '../../features/object-detail/ObjectDetailPanel';

// Hook to get query params
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const EcosystemPage: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const orgId = query.get('orgId') || 'e7b9bde5-76ac-477d-9480-93c098c4f1e9'; // Default to SuperteamIDN

  const [stats, setStats] = useState<ObjectTypeStat[]>([]);
  const [objects, setObjects] = useState<PublicTopObject[]>([]);
  const [objectTypes, setObjectTypes] = useState<PublicObjectType[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const handleObjectClick = (objectId: string) => {
    setSelectedObjectId(objectId);
    onOpen();
  };
  
  const renderTypeValues = (values: Record<string, any>) => {
    if (!values) return null;
    return Object.entries(values).map(([key, value]) => {
        if (!value) return null;
        return (
            <Text key={key} fontSize="xs" color="gray.600">
                <Text as="span" fontWeight="bold">{key}:</Text> {String(value)}
            </Text>
        );
    });
  };
  
  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOrgId = e.target.value;
    history.push(`?orgId=${newOrgId}`);
    setSelectedTypeId(undefined); // Reset selected type when changing org
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
    const fetchInitialData = async () => {
      try {
        const [statsData, typesData] = await Promise.all([
          getPublicStats(orgId),
          getPublicObjectTypes(orgId)
        ]);
        setStats(statsData);
        setObjectTypes(typesData || []);
      } catch (error) {
        console.error("Failed to fetch public data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [orgId]);

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

  if (loading) return <Box p={10}>Loading...</Box>;

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" shadow="sm" py={4}>
        <Container maxW="container.xl">
            <HStack justify="space-between">
                <Heading size="lg" color="brand.primary">Ecosystem Dashboard</Heading>
                <Select maxW="300px" value={orgId} onChange={handleOrgChange}>
                    {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </Select>
            </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        {/* Stats */}
        <Box mb={8} p={6} bg="white" shadow="md" borderRadius="md">
          <Heading size="md" mb={4}>Objects by Type</Heading>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="object_count" fill="#3182CE" name="Objects" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          {/* Objects List */}
          <Box>
            <Heading size="md" mb={4}>
              {selectedTypeId ? `Objects: ${objectTypes.find(t => t.id === selectedTypeId)?.name}` : 'Select a Data Type'}
            </Heading>
            {!selectedTypeId ? (
                <Box p={10} bg="white" shadow="sm" borderRadius="md" textAlign="center">
                    <Text color="gray.500">Please select a data type from the right to view objects.</Text>
                </Box>
            ) : objects.length === 0 ? (
                <Box p={10} bg="white" shadow="sm" borderRadius="md" textAlign="center">
                    <Text color="gray.500">No objects found for this type.</Text>
                </Box>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {objects.map((item) => (
                <Card 
                  key={item.id} 
                  bg="white" 
                  shadow="sm" 
                  _hover={{ shadow: 'md', cursor: 'pointer' }}
                  onClick={() => handleObjectClick(item.id)}
                >
                  <CardBody>
                        <HStack spacing={4} align="start">
                            <Avatar name={item.name} src={item.photo} size="md" borderRadius="md" />
                            <Box w="full">
                                <Heading size="sm" mb={1}>{item.name}</Heading>
                                <Text fontSize="xs" color="gray.500" noOfLines={2} mb={2}>{item.description}</Text>
                                <VStack align="start" spacing={0} mb={2}>
                                    {renderTypeValues(item.type_values)}
                                </VStack>
                                <HStack>
                                    <Badge colorScheme="blue" fontSize="xs">{item.fact_count} activities</Badge>
                                </HStack>
                            </Box>
                        </HStack>
                    </CardBody>
                    </Card>
                ))}
                </SimpleGrid>
            )}
          </Box>

          {/* Top Data Types */}
          <Box>
            <Heading size="md" mb={4}>Top Data Types</Heading>
             <VStack spacing={4} align="stretch">
              <Card 
                bg={!selectedTypeId ? "blue.50" : "white"} 
                shadow="sm" 
                cursor="pointer"
                onClick={() => setSelectedTypeId(undefined)}
                _hover={{ shadow: 'md' }}
              >
                  <CardBody p={4}>
                      <Text fontWeight="bold">Instructions</Text>
                  </CardBody>
              </Card>
              {objectTypes.map((type) => (
                <Card 
                    key={type.id} 
                    bg={selectedTypeId === type.id ? "blue.50" : "white"} 
                    shadow="sm"
                    cursor="pointer"
                    onClick={() => setSelectedTypeId(type.id)}
                    _hover={{ shadow: 'md' }}
                >
                  <CardBody p={4}>
                    <HStack spacing={3}>
                        <Avatar name={type.name} size="sm" borderRadius="md" bg="gray.100" color="gray.600" />
                        <Box flex={1}>
                            <Text fontWeight="bold" fontSize="sm">{type.name}</Text>
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>{type.description}</Text>
                        </Box>
                        <Badge variant="outline" colorScheme="purple">{type.object_count} objects</Badge>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </Box>
        </Grid>
      </Container>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Object Details</DrawerHeader>
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

export default EcosystemPage;
