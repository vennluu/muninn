import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  InputGroup,
  useDisclosure,
  InputRightAddon,
  InputLeftElement,
  HStack,
  Spacer,
  useToast,
  Divider,
  Select,
  Flex,
  Text,
  Switch,
  ModalFooter,
  Spinner,
} from '@chakra-ui/react';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import { addNewOrgMember, listOrgMembers, updateUserPassword } from 'src/api';
import {
  listObjectTypes,
  getAccessibleObjectTypesForMember,
  grantAccessToObjectType,
  revokeAccessToObjectType,
  updateObjectType,
} from 'src/api/objType';
import {
  listTags,
  getAccessibleTagsForMember,
  grantAccessToTag,
  revokeAccessToTag,
} from 'src/api/tag';
import authService from 'src/services/authService';
import { OrgMember, ObjectType, Tag } from 'src/types';
import { ChevronDownIcon, CopyIcon } from '@chakra-ui/icons';
import { normalise, generateRandomPassword } from 'src/utils';
import ActivityHeatmap from 'src/components/ActivityHeatmap';
import dayjs from 'dayjs';
import { fetchMetrics } from 'src/api/metrics';
import LoadingPanel from 'src/components/LoadingPanel';

interface MetricSummary {
  totalActivityScore: number;
  averageActivityScore: number;
  totalTasksCompleted: number;
  totalObjectsProcessed: number;
  mostActiveDate: string;
}

function numberWithCommas(x: number) {
  if (isNaN(x)) {
    return '';
  } else {
    return (x || 0)
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

const OrganisationPage: React.FC = () => {
  const [forceUpdate, setForceUpdate] = useState(0);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [currentEditingUserId, setCurrentEditingUserId] = useState('');
  const details = authService.getDetails();
  const toast = useToast();
  const handleLoadPage = async () => {
    const members = await listOrgMembers();
    setMembers(members);
  };
  const handleClickChangePassword = (userId: string) => {
    setCurrentEditingUserId(userId);
    onOpenChangePasswordDialog();
  };
  const handleAddNewOrgMember = async ({
    username,
    password,
    profile,
  }: {
    username: string;
    password: string;
    profile: any;
  }) => {
    await addNewOrgMember({ username, password, role: 'member', profile });
    setForceUpdate(forceUpdate + 1);
  };
  // const handleUpdateUserRoleAndStatus = () => {};
  const handleUpdateUserPassword = async (password: string) => {
    await updateUserPassword(currentEditingUserId, password);
    setForceUpdate(forceUpdate + 1);
  };
  const {
    isOpen: isOpenAddDialog,
    onOpen: onOpenAddDialog,
    onClose: onCloseAddDialog,
  } = useDisclosure();
  const {
    isOpen: isOpenChangePasswordDialog,
    onOpen: onOpenChangePasswordDialog,
    onClose: onCloseChangePasswordDialog,
  } = useDisclosure();
  const {
    isOpen: isOpenManageAccessDialog,
    onOpen: onOpenManageAccessDialog,
    onClose: onCloseManageAccessDialog,
  } = useDisclosure();
  useEffect(() => {
    handleLoadPage();
  }, [forceUpdate]);

  const [selectedMember, setSelectedMember] = useState('');
  const [metricData, setMetricData] = useState<any[]>([]);
  const [metricSummary, setMetricSummary] = useState<MetricSummary>(undefined);
  const [isMetricLoading, setIsMetricLoading] = useState(false);
  useEffect(() => {
    const fetchMetricsData = async () => {
      setIsMetricLoading(true);
      try {
        if (selectedMember) {
          const data = await fetchMetrics(selectedMember);
          setMetricData(data.metrics);
          setMetricSummary(data.summary);
        }
      } catch (e) {
        toast({
          title: 'Failed to fetch metrics data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsMetricLoading(false);
      }
    };
    fetchMetricsData();
  }, [selectedMember, toast]);

  return (
    <Box>
      <BreadcrumbComponent />
      <VStack spacing={6} align='stretch'>
        <Box>
          <Heading as='h2' size='lg' mb={4}>
            Organisation Details
          </Heading>
          <VStack spacing={4} align='stretch' maxWidth='500px'>
            <FormControl>
              <FormLabel>Organisation Name</FormLabel>
              <Input type='text' value={details?.orgName} isReadOnly />
            </FormControl>
            {/* <Button colorScheme='blue' alignSelf='flex-start'>
              Update Organisation
            </Button> */}
          </VStack>
        </Box>
        <Box>
          <Heading as='h2' size='lg' mb={4}>
            Members
          </Heading>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {members.map((member) => (
                <Tr key={member.id}>
                  <Td>
                    <Box>{member.profile?.fullname}</Box>
                    <Box color={'gray.500'}>{member.username}</Box>
                  </Td>
                  <Td>{member.profile?.email}</Td>
                  <Td>
                    <Badge
                      variant={'outline'}
                      colorScheme={member.role === 'admin' ? 'red' : 'gray'}
                      textTransform={'none'}
                    >
                      {member.role}
                    </Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={Button}
                        colorScheme='gray'
                        leftIcon={<ChevronDownIcon />}
                      >
                        Actions
                      </MenuButton>
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            handleClickChangePassword(member.id);
                          }}
                        >
                          Change Password
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setCurrentEditingUserId(member.id);
                            onOpenManageAccessDialog();
                          }}
                        >
                          Manage Access
                        </MenuItem>
                        <MenuItem isDisabled={true}>Active / Deactive</MenuItem>
                        <MenuItem isDisabled={true}>Update Role</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Button mt={4} colorScheme='blue' onClick={onOpenAddDialog}>
            Add Member
          </Button>
        </Box>
        <Box>
          <Heading as='h2' size='lg' mb={4}>
            30-days activity heatmap
          </Heading>
          <Select
            placeholder='Select a member'
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            mb={2}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.profile?.fullname || member.username}
              </option>
            ))}
          </Select>
          {isMetricLoading && <LoadingPanel />}
          {!isMetricLoading &&
            selectedMember &&
            metricData.length > 0 &&
            metricSummary && (
              <Flex>
                <ActivityHeatmap
                  startDate={dayjs().subtract(29, 'day').toDate()}
                  metricsData={metricData}
                />
                <Box ml={4}>
                  <Box fontWeight={'bold'}>Activity Detail</Box>
                  {Object.entries(metricSummary).map(([key, value]) => (
                    <Box key={key} mb={2} my={1}>
                      <Text>
                        {key}: {numberWithCommas(value)}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Flex>
            )}
        </Box>
      </VStack>
      <AddMemberDialog
        isOpen={isOpenAddDialog}
        onClose={onCloseAddDialog}
        submit={handleAddNewOrgMember}
      />
      <ChangePasswordDialog
        userName={
          members.find((m) => m.id === currentEditingUserId)?.username || ''
        }
        isOpen={isOpenChangePasswordDialog}
        onClose={onCloseChangePasswordDialog}
        submit={handleUpdateUserPassword}
      />
      <ManageAccessDialog
        key={currentEditingUserId}
        isOpen={isOpenManageAccessDialog}
        onClose={onCloseManageAccessDialog}
        memberId={currentEditingUserId}
        memberName={
          members.find((m) => m.id === currentEditingUserId)?.profile?.fullname ||
          members.find((m) => m.id === currentEditingUserId)?.username ||
          ''
        }
      />
    </Box>
  );
};

type AddMemberDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  submit: (props: { username: string; password: string; profile: any }) => void;
};

const AddMemberDialog = ({ isOpen, onClose, submit }: AddMemberDialogProps) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState(generateRandomPassword());
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleGeneratePassword = () => {
    setPassword(generateRandomPassword());
  };
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
  };
  const toast = useToast();
  const handleSubmit = async () => {
    const profile = {
      fullname,
      email,
      avatar: '',
    };
    try {
      await submit({ username: userName, password, profile });
      toast({
        title: 'New member added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: 'Failed to add new member',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };
  const handleReset = () => {
    setUserName('');
    setPassword(generateRandomPassword());
    setFullname('');
    setEmail('');
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        handleReset();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Member</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input
                type='text'
                placeholder='Must be unique'
                value={userName}
                onChange={(e: any) => setUserName(normalise(e.target.value))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <InputLeftElement
                  cursor={'pointer'}
                  _hover={{ bg: 'gray.200' }}
                >
                  <CopyIcon onClick={handleCopyPassword} />
                </InputLeftElement>
                <Input type='text' value={password} isDisabled={true} />
                <InputRightAddon
                  cursor={'pointer'}
                  _hover={{ bg: 'gray.200' }}
                  onClick={handleGeneratePassword}
                >
                  Generate
                </InputRightAddon>
              </InputGroup>
            </FormControl>
            <Divider />
            <FormControl>
              <FormLabel>Fullname</FormLabel>
              <Input
                type='text'
                value={fullname}
                onChange={(e: any) => setFullname(e.target.value || '')}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type='text'
                value={email}
                onChange={(e: any) => setEmail(e.target.value || '')}
              />
            </FormControl>
            <HStack width={'100%'} mb={2}>
              <Button
                colorScheme='gray'
                onClick={() => {
                  onClose();
                  handleReset();
                }}
              >
                Close
              </Button>
              <Spacer />
              <Button
                colorScheme='blue'
                onClick={handleSubmit}
                isLoading={isLoading}
              >
                Submit
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

type ChangePasswordDialogProps = {
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  submit: (password: string) => void;
};

const ChangePasswordDialog = ({
  userName,
  isOpen,
  onClose,
  submit,
}: ChangePasswordDialogProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const handleReset = () => {
    setNewPassword('');
    setConfirmPassword('');
  };
  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      await submit(newPassword);
      toast({
        title: 'Password changed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      handleReset();
      onClose();
    } catch (e) {
      toast({
        title: 'Failed to change password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        handleReset();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change Password</ModalHeader>
        <ModalBody>
          <VStack mb={4}>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input
                type='text'
                value={userName}
                isReadOnly
                isDisabled={true}
              />
            </FormControl>
            <FormControl>
              <FormLabel>New Password</FormLabel>
              <Input
                type='newPassword'
                value={newPassword}
                onChange={(e: any) => setNewPassword(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type='confirmPassword'
                value={confirmPassword}
                onChange={(e: any) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
          </VStack>

          <HStack>
            <Button type='reset' colorScheme='gray' onClick={handleReset}>
              Reset
            </Button>
            <Spacer />
            <Button
              colorScheme='blue'
              onClick={() => {
                handleSubmit();
                onClose();
              }}
              isLoading={isLoading}
            >
              Submit
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

interface ManageAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
}

const ManageAccessDialog = ({
  isOpen,
  onClose,
  memberId,
  memberName,
}: ManageAccessDialogProps) => {
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const [accessibleIds, setAccessibleIds] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<Tag[]>([]);
  const [accessibleTagIds, setAccessibleTagIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [togglingTagIds, setTogglingTagIds] = useState<Set<string>>(new Set());
  const [updatingPublicIds, setUpdatingPublicIds] = useState<Set<string>>(new Set());
  const toast = useToast();

  useEffect(() => {
    if (isOpen && memberId) {
      loadData();
    }
  }, [isOpen, memberId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTypesRes, accessibleTypesRes, allTagsRes, accessibleTagsRes] = await Promise.allSettled([
        listObjectTypes({ page: 1, pageSize: 100 }),
        getAccessibleObjectTypesForMember(memberId),
        listTags({ page: 1, pageSize: 100 }),
        getAccessibleTagsForMember(memberId),
      ]);

      const allTypes = allTypesRes.status === 'fulfilled' ? allTypesRes.value : undefined;
      const accessibleTypes =
        accessibleTypesRes.status === 'fulfilled' ? accessibleTypesRes.value : undefined;
      const allTags = allTagsRes.status === 'fulfilled' ? allTagsRes.value : undefined;
      const accessibleTags =
        accessibleTagsRes.status === 'fulfilled' ? accessibleTagsRes.value : undefined;

      setObjectTypes(allTypes?.objectTypes || []);
      setAccessibleIds(new Set((accessibleTypes || []).map((t) => t.id)));
      setTags(allTags?.tags || []);
      setAccessibleTagIds(new Set((accessibleTags || []).map((t) => t.id)));

      const rejected = [allTypesRes, accessibleTypesRes, allTagsRes, accessibleTagsRes].filter(
        (r) => r.status === 'rejected',
      ) as PromiseRejectedResult[];
      if (rejected.length > 0) {
        const first = rejected[0].reason;
        throw first;
      }
    } catch (error: any) {
      console.error('Error loading manage access data:', error);
      toast({
        title: 'Error loading data',
        description: error.response?.data?.message || error.message || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTypePublicStatus = async (type: ObjectType, isPublic: boolean) => {
    if (updatingPublicIds.has(type.id)) return;
    setUpdatingPublicIds((prev) => new Set(prev).add(type.id));

    try {
      const updated = await updateObjectType(type.id, {
        name: type.name,
        description: type.description || '',
        fields: type.fields,
        icon: type.icon,
        is_public: isPublic,
        gdp_measure_field: type.gdp_measure_field,
      });

      setObjectTypes((prev) => 
        prev.map((t) => t.id === type.id ? { ...t, is_public: isPublic } : t)
      );

      toast({
        title: `Object type set to ${isPublic ? 'Public' : 'Private'}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (e: any) {
      toast({
        title: 'Failed to update object type',
        description: e.response?.data?.message || e.message || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdatingPublicIds((prev) => {
        const next = new Set(prev);
        next.delete(type.id);
        return next;
      });
    }
  };

  const handleToggle = async (typeId: string, isCurrentlyGranted: boolean) => {
    if (togglingIds.has(typeId)) return;

    setTogglingIds((prev) => new Set(prev).add(typeId));
    
    // Optimistic update
    setAccessibleIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyGranted) {
        next.delete(typeId);
      } else {
        next.add(typeId);
      }
      return next;
    });

    try {
      if (isCurrentlyGranted) {
        await revokeAccessToObjectType({
          creator_id: memberId,
          obj_type_id: typeId,
        });
        toast({
          title: 'Access revoked',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        await grantAccessToObjectType({
          creator_id: memberId,
          obj_type_id: typeId,
        });
        toast({
          title: 'Access granted',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (e: any) {
      // Revert on error
      setAccessibleIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyGranted) {
          next.add(typeId);
        } else {
          next.delete(typeId);
        }
        return next;
      });
      toast({
        title: 'Failed to update access',
        description: e.response?.data?.message || e.message || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(typeId);
        return next;
      });
    }
  };

  const handleToggleTag = async (tagId: string, isCurrentlyGranted: boolean) => {
    if (togglingTagIds.has(tagId)) return;

    setTogglingTagIds((prev) => new Set(prev).add(tagId));
    
    // Optimistic update
    setAccessibleTagIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyGranted) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });

    try {
      if (isCurrentlyGranted) {
        await revokeAccessToTag({
          creator_id: memberId,
          tag_id: tagId,
        });
        toast({
          title: 'Tag access revoked',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        await grantAccessToTag({
          creator_id: memberId,
          tag_id: tagId,
        });
        toast({
          title: 'Tag access granted',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (e: any) {
      // Revert on error
      setAccessibleTagIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyGranted) {
          next.add(tagId);
        } else {
          next.delete(tagId);
        }
        return next;
      });
      toast({
        title: 'Failed to update tag access',
        description: e.response?.data?.message || e.message || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setTogglingTagIds((prev) => {
        const next = new Set(prev);
        next.delete(tagId);
        return next;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Access for {memberName}</ModalHeader>
        <ModalBody>
          {loading ? (
            <Flex justify='center' align='center' p={4}>
              <Spinner size="xl" />
            </Flex>
          ) : (
            <VStack align='stretch' spacing={6} maxH='70vh' overflowY='auto'>
              <Box>
                <Heading size="sm" mb={3} color="blue.600">Object Types Access</Heading>
                <VStack align='stretch' spacing={3}>
                  {objectTypes.length === 0 ? (
                    <Text color="gray.500" textAlign="center" fontSize="sm">No object types available.</Text>
                  ) : (
                    objectTypes.map((type) => (
                      <HStack key={type.id} justify='space-between' p={2} borderWidth={1} borderRadius='md' bg={type.is_public ? 'blue.50' : 'inherit'}>
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack>
                            <Text fontWeight="bold" fontSize="sm">{type.name}</Text>
                            {type.is_public && (
                              <Badge colorScheme="blue" fontSize="2xs">Public</Badge>
                            )}
                          </HStack>
                          {type.description && (
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>{type.description}</Text>
                          )}
                          <Text fontSize="2xs" color={type.is_public ? 'blue.600' : 'gray.500'}>
                            {type.is_public ? 'Publicly visible' : 'Private'} - Individual access controls visibility & management
                          </Text>
                        </VStack>
                        
                        <HStack spacing={4} align="center">
                          <VStack align="center" spacing={0}>
                            <Text fontSize="9px" fontWeight="bold" color="gray.500" textTransform="uppercase">Global Public</Text>
                            <Switch
                              size="sm"
                              isDisabled={updatingPublicIds.has(type.id)}
                              isChecked={type.is_public}
                              onChange={(e) => handleUpdateTypePublicStatus(type, e.target.checked)}
                              colorScheme="blue"
                            />
                          </VStack>
                          
                          <VStack align="center" spacing={0}>
                            <Text fontSize="9px" fontWeight="bold" color="gray.500" textTransform="uppercase">Can See & Edit</Text>
                            <Switch
                              size="md"
                              isDisabled={togglingIds.has(type.id)}
                              isChecked={accessibleIds.has(type.id)}
                              onChange={() => handleToggle(type.id, accessibleIds.has(type.id))}
                              colorScheme="green"
                            />
                          </VStack>
                        </HStack>
                      </HStack>
                    ))
                  )}
                </VStack>
              </Box>

              <Divider />

              <Box>
                <Heading size="sm" mb={3} color="green.600">Tags Access</Heading>
                <VStack align='stretch' spacing={3}>
                  {tags.length === 0 ? (
                    <Text color="gray.500" textAlign="center" fontSize="sm">No tags available.</Text>
                  ) : (
                    tags.map((tag) => (
                      <HStack key={tag.id} justify='space-between' p={2} borderWidth={1} borderRadius='md'>
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack>
                            <Badge
                              variant="solid"
                              bg={tag.color_schema.background}
                              color={tag.color_schema.text}
                              fontSize="xs"
                            >
                              {tag.name}
                            </Badge>
                          </HStack>
                          {tag.description && (
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>{tag.description}</Text>
                          )}
                          <Text fontSize="2xs" color="gray.500">
                            Grants access to all objects with this tag
                          </Text>
                        </VStack>
                        
                        <VStack align="center" spacing={0}>
                          <Text fontSize="9px" fontWeight="bold" color="gray.500" textTransform="uppercase">Can See & Edit</Text>
                          <Switch
                            size="md"
                            isDisabled={togglingTagIds.has(tag.id)}
                            isChecked={accessibleTagIds.has(tag.id)}
                            onChange={() => handleToggleTag(tag.id, accessibleTagIds.has(tag.id))}
                            colorScheme="green"
                          />
                        </VStack>
                      </HStack>
                    ))
                  )}
                </VStack>
              </Box>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} colorScheme="blue">Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OrganisationPage;
