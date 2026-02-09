import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Heading, SimpleGrid, Card, CardBody, Text, Avatar, HStack, Badge, Button, VStack
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import { listOrganizations, Organization } from '../../services/publicApi';

const EcosystemsDirectoryPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgs = await listOrganizations();
        setOrganizations(orgs || []);
      } catch (error) {
        console.error("Failed to fetch organizations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  const handleOrgClick = (orgId: string) => {
    history.push(`/ecosystem?orgId=${orgId}`);
  };

  if (loading) return <Box p={10}>Loading...</Box>;

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" shadow="sm" py={6}>
        <Container maxW="container.xl">
            <VStack align="start" spacing={2}>
                <Heading size="lg" color="brand.primary">Ecosystem Directory</Heading>
                <Text color="gray.500">Explore different ecosystems and their data</Text>
            </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={10}>
        {organizations.length === 0 ? (
            <Box p={10} bg="white" shadow="sm" borderRadius="md" textAlign="center">
                <Text color="gray.500">No ecosystems found.</Text>
            </Box>
        ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {organizations.map((org) => (
                <Card 
                  key={org.id} 
                  bg="white" 
                  shadow="md" 
                  borderRadius="lg"
                  _hover={{ shadow: 'xl', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
                  cursor="pointer"
                  onClick={() => handleOrgClick(org.id)}
                >
                  <CardBody p={6}>
                    <HStack spacing={4} mb={4}>
                        <Avatar 
                            name={org.name} 
                            size="lg" 
                            bg="brand.primary" 
                            color="white" 
                            src={org.profile?.avatar || undefined} // Assuming profile might have avatar
                        />
                        <Box>
                            <Heading size="md" mb={1}>{org.name}</Heading>
                            <Badge colorScheme="green">Active</Badge>
                        </Box>
                    </HStack>
                    
                    <Text color="gray.600" noOfLines={3} mb={6} minH="4.5em">
                        {org.profile?.description || "No description available for this ecosystem."}
                    </Text>

                    <Button 
                        width="full" 
                        colorScheme="blue" 
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOrgClick(org.id);
                        }}
                    >
                        View Ecosystem
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

export default EcosystemsDirectoryPage;
