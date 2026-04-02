import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  CloseButton,
  Flex,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  useDisclosure,
  useToast,
  VStack,
  Heading,
  Icon,
  Grid,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Divider,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FunnelViewType } from 'src/api/funnel';
import { FaSave } from 'react-icons/fa';
import { FiChevronRight, FiSearch, FiActivity, FiBox, FiChevronLeft } from 'react-icons/fi';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import CreateListDialog from 'src/components/CreateListDialog';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';
import LoadingPanel from 'src/components/LoadingPanel';
import { FunnelStep as FunnelStepType, Object } from 'src/types';
import { StepDetail } from 'src/components/forms/object/object-step/ObjectFunnelCard';
import { shortenText } from 'src/utils';

type ObjectsByFunnelProps = {
  funnelId: string;
  getFunnelView: any;
  isPublic?: boolean;
  onObjectClick?: (objectId: string) => void;
};

const ObjectsByFunnel: React.FC<ObjectsByFunnelProps> = ({
  funnelId,
  getFunnelView,
  isPublic,
  onObjectClick,
}: ObjectsByFunnelProps) => {
  const [funnelViewData, setFunnelViewData] = useState<FunnelViewType>();
  const [isLoading, setIsLoading] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const {
    isOpen: isListOpen,
    onClose: onListClose,
    onOpen: onListOpen,
  } = useDisclosure();
  const {
    isOpen: isStepOpen,
    onClose: onStepClose,
    onOpen: onStepOpen,
  } = useDisclosure();
  const [selectedStep, setSelectedStep] = useState<FunnelStepType | null>(null);
  const toast = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const initFunnelViewData = async () => {
      setIsLoading(true);
      try {
        const query: any = {};
        if (debouncedSearchTerm && activeStepId) {
          query['search_' + activeStepId] = debouncedSearchTerm;
        }
        const data = await getFunnelView({ id: funnelId, query });
        setFunnelViewData(data);
        if (data?.steps && data.steps.length > 0 && !activeStepId) {
          setActiveStepId(data.steps[0].step.id);
        }
      } catch (e) {
        toast({
          title: 'Error',
          description: 'Failed to load funnel view',
          status: 'error',
          duration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    initFunnelViewData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelId, debouncedSearchTerm]);

  useEffect(() => {
    if (funnelViewData?.steps && funnelViewData.steps.length > 0) {
      if (!activeStepId || !funnelViewData.steps.find(s => s.step.id === activeStepId)) {
        setActiveStepId(funnelViewData.steps[0].step.id);
      }
    }
  }, [funnelViewData, activeStepId]);

  const handlePageChange = async (stepId: string, page: number) => {
    setIsLoading(true);
    const query: any = {};
    query['page_' + stepId] = page;
    if (debouncedSearchTerm) {
      query['search_' + stepId] = debouncedSearchTerm;
    }
    try {
      setFunnelViewData(await getFunnelView({ id: funnelId, query }));
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to change page',
        status: 'error',
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const funnel = funnelViewData?.funnel || {};
  const steps = funnelViewData?.steps || [];
  let orderedSteps = [...steps].sort(
    (a, b) => a.step.step_order - b.step.step_order
  );

  const activeStepInfo = steps.find(s => s.step.id === activeStepId);
  const objects = activeStepInfo?.objects || [];
  // No frontend filtering needed since we use backend search
  const filteredObjects = objects;

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="md" color="gray.800">{funnel.name}</Heading>
            {funnel.object_count > 0 && (
              <Badge colorScheme="blue" borderRadius="full" px={3}>
                Total {funnel.object_count} objects
              </Badge>
            )}
          </VStack>
          {!isLoading && !isPublic && (
            <Button
              leftIcon={<FaSave />}
              size='sm'
              colorScheme="blue"
              onClick={onListOpen}
            >
              Save As List
            </Button>
          )}
        </HStack>

        {funnel.description && (
          <Box p={4} bg="blue.50" borderRadius="xl" border="1px" borderColor="blue.100">
            <MarkdownDisplay
              content={funnel.description}
              characterLimit={200}
            />
          </Box>
        )}

        <VStack align="stretch" spacing={6}>
          {/* Steps Horizontal Bar */}
          <Box overflowX="auto" pb={2} css={{
            '&::-webkit-scrollbar': { height: '6px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#E2E8F0', borderRadius: '4px' },
          }}>
            <HStack spacing={2} minW="max-content">
              {orderedSteps.map((stepInfo, index) => (
                <React.Fragment key={stepInfo.step.id}>
                  <Box
                    p={2}
                    px={4}
                    borderRadius="full"
                    cursor="pointer"
                    bg={activeStepId === stepInfo.step.id ? "blue.500" : "white"}
                    color={activeStepId === stepInfo.step.id ? "white" : "gray.600"}
                    border="1px"
                    borderColor={activeStepId === stepInfo.step.id ? "blue.500" : "gray.200"}
                    _hover={{ 
                      bg: activeStepId === stepInfo.step.id ? "blue.600" : "gray.50",
                      borderColor: activeStepId === stepInfo.step.id ? "blue.600" : "gray.300"
                    }}
                    onClick={() => setActiveStepId(stepInfo.step.id)}
                    transition="all 0.2s"
                    shadow="sm"
                  >
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight={activeStepId === stepInfo.step.id ? "bold" : "medium"} whiteSpace="nowrap">
                        {stepInfo.step.name}
                      </Text>
                      <Badge 
                        borderRadius="full" 
                        colorScheme={activeStepId === stepInfo.step.id ? "blue" : "gray"}
                        bg={activeStepId === stepInfo.step.id ? "whiteAlpha.300" : "gray.100"}
                        color={activeStepId === stepInfo.step.id ? "white" : "gray.600"}
                      >
                        {stepInfo.totalCount || 0}
                      </Badge>
                    </HStack>
                  </Box>
                  {index < orderedSteps.length - 1 && (
                    <Icon as={FiChevronRight} color="gray.300" />
                  )}
                </React.Fragment>
              ))}
            </HStack>
          </Box>

          {/* Main Content Area */}
          <Box>
            <VStack align="stretch" spacing={6}>
              <InputGroup bg="white" shadow="sm" borderRadius="xl">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input 
                  placeholder="Search for objects in this step..." 
                  borderRadius="xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  border="1px"
                  borderColor="gray.100"
                  _focus={{ borderColor: 'blue.400', shadow: 'md' }}
                />
              </InputGroup>

              {isLoading ? (
                <LoadingPanel />
              ) : !activeStepId ? (
                <Flex h="300px" align="center" justify="center" direction="column" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                  <Icon as={FiActivity} fontSize="4xl" color="gray.200" mb={4} />
                  <Text color="gray.500">Select a step to view data</Text>
                </Flex>
              ) : filteredObjects.length === 0 ? (
                <Flex h="300px" align="center" justify="center" direction="column" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                  <Icon as={FiSearch} fontSize="4xl" color="gray.200" mb={4} />
                  <Text color="gray.500">{searchTerm ? `No results found for "${searchTerm}"` : "No objects in this step"}</Text>
                </Flex>
              ) : (
                <VStack align="stretch" spacing={4}>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {filteredObjects.map((item: any) => (
                      <Card 
                        key={item.id} 
                        variant="outline"
                        _hover={{ shadow: 'md', borderColor: 'blue.200', bg: 'white' }}
                        onClick={() => onObjectClick ? onObjectClick(item.id) : null}
                        cursor={onObjectClick ? "pointer" : "default"}
                        borderRadius="xl"
                        bg="white"
                      >
                        <CardBody p={4}>
                          <HStack spacing={3}>
                            <Avatar name={item.name} src={item.photo} size="md" borderRadius="md" />
                            <Box flex={1}>
                              <Heading size="xs" mb={1}>{item.name}</Heading>
                              <Text fontSize="xs" color="gray.500" noOfLines={2}>{item.description}</Text>
                            </Box>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </VStack>
              )}
            </VStack>
          </Box>
        </VStack>
      </VStack>

      <CreateListDialog
        isOpen={isListOpen}
        onClose={onListClose}
        filterSetting={{
          funnelId: funnelId,
        }}
        onListCreated={() => {}}
      />
      <ModalObjectStep
        isOpen={isStepOpen}
        onClose={onStepClose}
        step={selectedStep as FunnelStepType}
      />
    </Box>
  );
};

type ModalObjectStepProps = {
  isOpen: boolean;
  step: FunnelStepType;
  onClose: () => void;
};

const ModalObjectStep = ({ isOpen, step, onClose }: ModalObjectStepProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='full'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex>
            Step: {step?.name}
            <Spacer />
            <IconButton
              icon={<CloseButton />}
              onClick={onClose}
              aria-label='close'
              colorScheme='red'
              size='sm'
              variant={'ghost'}
            />
          </Flex>
        </ModalHeader>
        <ModalBody>
          <StepDetail step={step} defaultItem='action' />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ObjectsByFunnel;
