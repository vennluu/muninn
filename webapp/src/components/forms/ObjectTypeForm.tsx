import React, { useState, useEffect } from 'react';
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
  IconButton,
  InputGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  InputLeftElement,
  useToast,
  Switch,
  Select,
  FormHelperText,
} from '@chakra-ui/react';
import { ObjectType } from 'src/types';
import MarkdownEditor from '../mardown/MardownEditor';
import { IconType } from 'react-icons';
import FaIconList from '../FaIconList';
import { SmartObjectFormConfigure } from 'src/features/smart-object-type/components/SmartObjectFormConfigure';

// Define the props for the ObjectTypeForm component
interface ObjectTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (objectType: ObjectType) => void;
  initialData?: ObjectType;
}

const ObjectTypeForm: React.FC<ObjectTypeFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  // State to hold the form data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('file');
  const [isPublic, setIsPublic] = useState(true);
  const [gdpMeasureField, setGdpMeasureField] = useState<string>('');
  const [initialConfig, setInitialConfig] = useState<any>();
  const [editingConfig, setEditingConfig] = useState<any>();
  const toast = useToast();

  // Effect to populate form when editing an existing ObjectType
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setIsPublic(initialData.is_public !== undefined ? initialData.is_public : true);
      setGdpMeasureField(initialData.gdp_measure_field || '');
      setInitialConfig({
        fields: initialData.fields,
      });
      setEditingConfig({
        fields: initialData.fields,
      });
    } else {
      // Clear form when creating a new ObjectType
      setName('');
      setDescription('');
      setIsPublic(true);
      setGdpMeasureField('');
      setInitialConfig({
        fields: {},
      });
      setEditingConfig({
        fields: {},
      });
    }
  }, [initialData, isOpen]);

  // Handler to save the ObjectType
  const handleSave = () => {
    // check if any field name is empty
    if (
      window.Object.keys(editingConfig.fields).some(
        (field) => field === '' || editingConfig.fields[field].label === ''
      ) ||
      window.Object.keys(editingConfig.fields).length === 0
    ) {
      toast({
        title:
          'Field and field label is required and a data type need at least one field',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (!name || !description) {
      toast({
        title: 'Name and description are required',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    onSave({
      id: initialData?.id,
      name,
      description,
      fields: editingConfig.fields,
      icon: selectedIcon,
      is_public: isPublic,
      gdp_measure_field: gdpMeasureField,
    });
    setInitialConfig(editingConfig);
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {/* {initialData ? 'Edit Data Type' : 'Create Data Type'} */}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mb={4} zIndex={'9999'}>
            <FormLabel>Name</FormLabel>
            <InputGroup>
              <InputLeftElement>
                <Menu matchWidth={true}>
                  <MenuButton
                    as={IconButton}
                    aria-label='Icon'
                    icon={FaIconList[selectedIcon as keyof IconType]}
                    variant={'outline'}
                    border={'none'}
                  />

                  <MenuList maxHeight={'200px'} overflowY='auto' minW={'50px'}>
                    {window.Object.keys(FaIconList).map((icon) => (
                      <MenuItem
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        display={'flex'}
                        alignItems={'center'}
                        width={'50px'}
                      >
                        {FaIconList[icon as keyof IconType]}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </InputLeftElement>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </InputGroup>
          </FormControl>
          
          <FormControl display='flex' alignItems='center' mb={4}>
            <FormLabel htmlFor='is-public' mb='0'>
              Public (Visible in Ecosystem)
            </FormLabel>
            <Switch
              id='is-public'
              isChecked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
          </FormControl>

          <FormControl isRequired mb={4}>
            <FormLabel>Description</FormLabel>
            <MarkdownEditor
              initialValue={description}
              onChange={(c: string) => setDescription(c)}
            />
          </FormControl>
          <SmartObjectFormConfigure
            initialConfig={initialConfig}
            onConfigChange={(newConfig) => setEditingConfig(newConfig)}
          />

          <FormControl mb={4} mt={4}>
            <FormLabel htmlFor='gdp-measure-field'>
              GDP Measure Field (Optional)
            </FormLabel>
            <Select
              id='gdp-measure-field'
              placeholder='Select a field to measure'
              value={gdpMeasureField}
              onChange={(e) => setGdpMeasureField(e.target.value)}
            >
              {editingConfig &&
                window.Object.keys(editingConfig.fields).map((key) => (
                  <option key={key} value={key}>
                    {editingConfig.fields[key].label || key} ({editingConfig.fields[key].type})
                  </option>
                ))}
            </Select>
            <FormHelperText>
              Select a numeric field to sum up for GDP statistics. Leave empty if
              not applicable.
            </FormHelperText>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant='ghost' onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ObjectTypeForm;
