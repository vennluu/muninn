import React from 'react';
import { useObjectDetail } from '../contexts/ObjectDetailContext';
import { PublicTalentProfile } from './PublicTalentProfile';
import { PublicProjectProfile } from './PublicProjectProfile';
import { Spinner, Center, Text } from '@chakra-ui/react';

export const PublicProfileView: React.FC = () => {
  const { object, facts, isLoading } = useObjectDetail();

  if (isLoading) {
    return (
      <Center h="300px">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  if (!object) {
    return (
      <Center h="300px">
        <Text color="gray.500">No profile data found.</Text>
      </Center>
    );
  }

  const isPersonType = (name: string) => {
    const peopleKeywords = ['developer', 'designer', 'marketer', 'member', 'contributor', 'artist', 'founder', 'creator', 'person', 'talent'];
    return peopleKeywords.some(kw => name.toLowerCase().includes(kw));
  };

  const isProjectType = (name: string) => {
    const projectKeywords = ['project', 'startup', 'product', 'app', 'protocol', 'tool', 'ecosystem', 'venture'];
    return projectKeywords.some(kw => name.toLowerCase().includes(kw));
  };

  const primaryType = object.types?.[0]?.name || '';

  if (isPersonType(primaryType)) {
    return <PublicTalentProfile object={object} facts={facts} />;
  }

  if (isProjectType(primaryType)) {
    return <PublicProjectProfile object={object} facts={facts} />;
  }

  // Fallback if type doesn't match specifically
  return <PublicProjectProfile object={object} facts={facts} />;
};
