import React from 'react';
import { Box, Container, IconButton, HStack, Button } from '@chakra-ui/react';
import { useParams, useHistory } from 'react-router-dom';
import ObjectDetailPanel from '../../features/object-detail/ObjectDetailPanel';
import { FiArrowLeft } from 'react-icons/fi';

const PublicObjectDetailPage: React.FC = () => {
  const { orgId, objectId } = useParams<{ orgId: string; objectId: string }>();
  const history = useHistory();

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" shadow="sm" py={4} borderBottom="1px" borderColor="gray.100" position="sticky" top={0} zIndex={10}>
        <Container maxW="container.md">
          <HStack spacing={4}>
            <IconButton 
              aria-label="Back to ecosystem" 
              icon={<FiArrowLeft />} 
              variant="ghost" 
              onClick={() => history.push(`/ecosystem?orgId=${orgId}`)}
            />
            <Button variant="link" colorScheme="blue" onClick={() => history.push(`/ecosystem?orgId=${orgId}`)}>
              Back to Ecosystem
            </Button>
          </HStack>
        </Container>
      </Box>
      <Container maxW="container.md" py={8}>
        <ObjectDetailPanel objectId={objectId} orgId={orgId} />
      </Container>
    </Box>
  );
};

export default PublicObjectDetailPage;
