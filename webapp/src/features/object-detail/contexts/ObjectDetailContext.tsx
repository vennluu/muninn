import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useToast } from '@chakra-ui/react';
import { fetchObjectDetails } from 'src/api'; // Adjust import paths as needed
import { getPublicObjectDetails } from 'src/services/publicApi';
import { ObjectDetail, ObjectTypeValue } from 'src/types/Object';
import { Fact, Task } from 'src/types';

interface ObjectDetailContextProps {
  object: ObjectDetail | null;
  facts: Fact[];
  tasks: Task[];
  imgUrls: string[];
  isLoading: boolean;
  isReadOnly: boolean;
  tabIndex: number;
  setTabIndex: (index: number) => void;
  refresh: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

const ObjectDetailContext = createContext<ObjectDetailContextProps | undefined>(
  undefined
);

export const ObjectDetailProvider: React.FC<{
  objectId: string;
  orgId?: string;
  children: React.ReactNode;
}> = ({ objectId, orgId, children }) => {
  const [object, setObject] = useState<ObjectDetail | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const toast = useToast();

  const loadImageUrlsFromObject = useCallback((obj: ObjectDetail) => {
    const tmp: string[] = [];
    obj?.typeValues?.forEach((otv: ObjectTypeValue) => {
      if (!otv.type_values) return;
      try {
        Object.entries(otv.type_values).forEach(([_, value]) => {
          if (
            value &&
            typeof value === 'string' &&
            (value.includes('http://') ||
              value.includes('https://') ||
              value.includes('data:image'))
          ) {
            tmp.push(value);
          }
        });
      } catch (e) {
        console.warn('Error parsing type values for images', e);
      }
    });
    return tmp;
  }, []);

  const loadObjectDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!objectId) return;

      if (orgId) {
        const data = await getPublicObjectDetails(orgId, objectId);
        
        const objectDetail: ObjectDetail = {
          id: data.object?.id,
          name: data.object?.name,
          description: data.object?.description,
          idString: data.object?.id,
          aliases: [],
          tags: [],
          tasks: [],
          createdAt: data.object?.created_at,
          updatedAt: data.object?.created_at,
          types: (data.type_values || []).map((tv: any) => ({
            id: tv.type_id,
            name: tv.type_name,
            description: tv.description,
            fields: tv.fields,
            icon: tv.icon
          })), 
          typeValues: (data.type_values || []).map((tv: any) => ({
              id: 'public', 
              objectTypeId: tv.type_id,
              type_values: tv.type_values
          })),
          stepsAndFunnels: []
        };

        const mappedFacts: Fact[] = (data.facts || []).map((f: any) => ({
            id: f.id,
            text: f.text,
            happenedAt: f.happened_at?.Time || f.happened_at, 
            location: '',
            creatorId: '', 
            creatorName: f.creator_name,
            createdAt: '',
            relatedObjects: []
        }));

        setObject(objectDetail);
        setFacts(mappedFacts);
        setTasks([]);
        setImgUrls(loadImageUrlsFromObject(objectDetail));
      } else {
        const data = await fetchObjectDetails(objectId);
        const objectData = data;

        // Map types from the embedded type_values for protected route
        const types = (objectData.typeValues || []).map((tv: any) => ({
            id: tv.objectTypeId,
            name: tv.objectTypeName,
            icon: tv.objectTypeIcon,
            description: tv.objectTypeDescription,
            fields: tv.objectTypeFields
        }));

        const objectDetail: ObjectDetail = {
            ...objectData,
            types: types,
            typeValues: objectData.typeValues
        };

        setObject(objectDetail);
        setFacts(data.facts);
        setTasks(data.tasks);
        setImgUrls(loadImageUrlsFromObject(objectDetail));
      }
    } catch (error) {
      toast({
        title: 'Error loading object details.',
        description: 'Unable to fetch object details.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [objectId, orgId, toast, loadImageUrlsFromObject]);

  useEffect(() => {
    loadObjectDetails();
  }, [loadObjectDetails, forceUpdate]); // Added loadObjectDetails dependency

  return (
    <ObjectDetailContext.Provider
      value={{
        object,
        facts,
        tasks,
        imgUrls,
        isLoading,
        isReadOnly: !!orgId,
        tabIndex,
        setTabIndex,
        refresh: () => {
          setForceUpdate(forceUpdate + 1);
        },
        setIsLoading,
      }}
    >
      {children}
    </ObjectDetailContext.Provider>
  );
};

export const useObjectDetail = () => {
  const context = useContext(ObjectDetailContext);
  if (!context) {
    throw new Error(
      'useObjectDetail must be used within an ObjectDetailProvider'
    );
  }
  return context;
};
