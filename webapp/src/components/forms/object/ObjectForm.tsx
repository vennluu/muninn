import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  InputGroup,
  InputRightAddon,
  FormHelperText,
  useToast,
  InputLeftElement,
  Stack,
  Divider,
} from '@chakra-ui/react';
import { v4 as uuidv4 } from 'uuid';
import { NewObject, UpdateObject } from 'src/types';
import MarkdownEditor from 'src/components/mardown/MardownEditor';
import { normalizeToIdStyle } from 'src/utils/text';
import authService from 'src/services/authService';
import AliasInput from './AliasInput';
import { FaGithub, FaTwitter, FaDiscord, FaLink } from 'react-icons/fa';

interface ObjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateObject?: (newObject: NewObject) => Promise<void>;
  initialObject?: UpdateObject; // Optional prop for editing an existing object
  onUpdateObject?: (updatedObject: UpdateObject) => Promise<void>; // Optional prop for updating an existing object
  onDeleteObject?: (objectId: string) => Promise<void>; // Optional prop for deleting an existing object
}

const ObjectForm: React.FC<ObjectFormProps> = ({
  isOpen,
  onClose,
  onCreateObject,
  initialObject,
  onUpdateObject,
  onDeleteObject,
}) => {
  const [name, setName] = useState(initialObject?.name || '');
  const [idString, setIDString] = useState(initialObject?.idString || uuidv4());
  const [description, setDescription] = useState(
    initialObject?.description || ''
  );
  const [aliases, setAliases] = useState<string[]>(
    initialObject?.aliases || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const toast = useToast();

  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [link, setLink] = useState('');

  const addSocialAlias = (type: string, value: string) => {
    if (!value) return;
    let newAlias = value.trim();
    if (
      type === 'github' &&
      !newAlias.startsWith('http') &&
      !newAlias.startsWith('github:')
    ) {
      newAlias = `https://github.com/${newAlias}`;
    }
    if (
      type === 'twitter' &&
      !newAlias.startsWith('http') &&
      !newAlias.startsWith('twitter:')
    ) {
      newAlias = `https://twitter.com/${newAlias}`;
    }

    if (!aliases.includes(newAlias)) {
      setAliases([...aliases, newAlias]);
      setIsDirty(true);
    }
    if (type === 'github') setGithub('');
    if (type === 'twitter') setTwitter('');
    if (type === 'discord') setDiscord('');
    if (type === 'link') setLink('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!initialObject && onCreateObject) {
      try {
        await onCreateObject({ name, description, idString, aliases });
        toast({
          title: 'Success',
          description: 'Object successfully created.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setIsDirty(false);
        onReset();
        onClose();
      } catch (error) {
        console.error('Error creating object:', error);
        toast({
          title: 'Error creating object',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    } else if (initialObject && onUpdateObject) {
      try {
        await onUpdateObject({
          id: initialObject.id,
          name,
          description,
          idString,
          aliases,
        });
        toast({
          title: 'Success',
          description: 'Object successfully edited.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onReset();
        onClose();
      } catch (error) {
        console.error('Error updating object:', error);
        toast({
          title: 'Error updating object',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGenerateId = () => {
    setIDString(uuidv4());
  };

  const onReset = () => {
    if (!initialObject) {
      setName('');
      setIDString(uuidv4());
      setDescription('');
    } else {
      setName(initialObject.name);
      setIDString(initialObject.idString);
      setDescription(initialObject.description);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      const cfm = window.confirm(
        'Are you sure you want to discard the changes?'
      );
      if (!cfm) return;
    }
    onReset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {initialObject ? 'Edit Object' : 'Create New Object'}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => {
                    setIsDirty(true);
                    setName(e.target.value);
                  }}
                  placeholder='Enter object name'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>ID String</FormLabel>
                <FormHelperText>
                  Use unique ID string to import object data from csv or any
                  thirdparty system. You can let the system generate one for you
                  or create one yourself. Use '-' to replace space.
                </FormHelperText>
                <InputGroup marginTop={4}>
                  <Input
                    value={idString}
                    onChange={(e) => {
                      setIsDirty(true);
                      setIDString(normalizeToIdStyle(e.target.value));
                    }}
                    placeholder='Object id string, useful for adding info from csv'
                    isDisabled={isSubmitting}
                  />
                  <InputRightAddon>
                    <Button
                      variant='ghost'
                      title='Auto generate the UUID'
                      onClick={handleGenerateId}
                    >
                      Generate
                    </Button>
                  </InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Aliases</FormLabel>
                <FormHelperText mb={2}>
                  Alternative names, email, links, GitHub, Twitter, Discord for
                  this object. Type and press Enter to add multiple aliases.
                  This is useful to identify object when merging data from
                  multiple sources.
                </FormHelperText>
                <AliasInput
                  value={aliases}
                  onChange={(newAliases) => {
                    setIsDirty(true);
                    setAliases(newAliases);
                  }}
                />
              </FormControl>

              <Divider my={4} />

              <FormControl>
                <FormLabel>Quick Add Socials</FormLabel>
                <Stack spacing={3}>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents='none'
                      children={<FaLink color='gray' />}
                    />
                    <Input
                      placeholder='Add Link (URL)'
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSocialAlias('link', link);
                        }
                      }}
                      onBlur={() => addSocialAlias('link', link)}
                    />
                  </InputGroup>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents='none'
                      children={<FaGithub color='gray' />}
                    />
                    <Input
                      placeholder='GitHub username or URL'
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSocialAlias('github', github);
                        }
                      }}
                      onBlur={() => addSocialAlias('github', github)}
                    />
                  </InputGroup>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents='none'
                      children={<FaTwitter color='gray' />}
                    />
                    <Input
                      placeholder='Twitter username or URL'
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSocialAlias('twitter', twitter);
                        }
                      }}
                      onBlur={() => addSocialAlias('twitter', twitter)}
                    />
                  </InputGroup>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents='none'
                      children={<FaDiscord color='gray' />}
                    />
                    <Input
                      placeholder='Discord handle'
                      value={discord}
                      onChange={(e) => setDiscord(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSocialAlias('discord', discord);
                        }
                      }}
                      onBlur={() => addSocialAlias('discord', discord)}
                    />
                  </InputGroup>
                </Stack>
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <MarkdownEditor
                  initialValue={description}
                  onChange={(content: string) => {
                    setIsDirty(true);
                    setDescription(content);
                  }}
                  filters={[]}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onReset}>
              Reset
            </Button>
            <Button variant='ghost' mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' type='submit' isLoading={isSubmitting}>
              {initialObject ? 'Edit' : 'Create'}
            </Button>
            {authService.hasRole('admin') &&
              onDeleteObject &&
              initialObject && (
                <Button
                  ml={3}
                  colorScheme='red'
                  onClick={() => {
                    const cfm = window.confirm(
                      'Are you sure you want to delete this object?'
                    );
                    if (!cfm) {
                      return;
                    }
                    onDeleteObject(initialObject.id);
                    onClose();
                    toast({
                      title: 'Object deleted',
                      description: 'The object',
                    });
                  }}
                >
                  Delete
                </Button>
              )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ObjectForm;
