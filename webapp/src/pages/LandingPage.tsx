import React, { useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  VStack,
  Container,
  HStack,
  Text,
  SimpleGrid,
  Icon,
  Badge,
  Link as ChakraLink,
  Divider,
  Stack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FiArrowRight,
  FiGitBranch,
  FiGlobe,
  FiLayers,
  FiSearch,
  FiShare2,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import authService from 'src/services/authService';

const LandingPage: React.FC = () => {
  useEffect(() => {
    authService.isAuthenticated() && window.location.replace('/feed');
  }, []);
  return (
    <Box minH='100vh' bg='gray.50'>
      <Box
        position='sticky'
        top={0}
        zIndex={10}
        bg='rgba(255,255,255,0.9)'
        backdropFilter='blur(10px)'
        borderBottom='1px solid'
        borderColor='gray.100'
      >
        <Container maxW='container.lg' py={4}>
          <HStack justify='space-between'>
            <HStack spacing={3}>
              <Box
                w='36px'
                h='36px'
                borderRadius='12px'
                bgGradient='linear(to-br, blue.500, purple.500)'
              />
              <VStack spacing={0} align='start'>
                <Text fontWeight='bold' lineHeight='1'>
                  Muninn
                </Text>
                <Text fontSize='xs' color='gray.500' lineHeight='1'>
                  Personal CRM & Community Data
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={4}>
              <ChakraLink as={RouterLink} to='/ecosystems' fontSize='sm' color='gray.600'>
                Ecosystems
              </ChakraLink>
              <ChakraLink href='https://github.com/vennluu/muninn' isExternal fontSize='sm' color='gray.600'>
                GitHub
              </ChakraLink>
              <Button as={RouterLink} to='/login' colorScheme='blue' size='sm' borderRadius='full'>
                Sign in
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Box position='relative' overflow='hidden'>
        <Box
          position='absolute'
          inset={0}
          bgGradient='radial(circle at 20% 15%, rgba(49,130,206,0.22), transparent 55%), radial(circle at 75% 25%, rgba(128,90,213,0.18), transparent 55%), radial(circle at 55% 85%, rgba(72,187,120,0.14), transparent 55%)'
        />
        <Container maxW='container.lg' py={{ base: 14, md: 20 }} position='relative'>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 10, md: 14 }} alignItems='center'>
            <VStack align='start' spacing={6}>
              <HStack spacing={2} wrap='wrap'>
                <Badge colorScheme='blue' variant='subtle' borderRadius='full' px={3} py={1}>
                  Open source
                </Badge>
                <Badge colorScheme='purple' variant='subtle' borderRadius='full' px={3} py={1}>
                  Go + React
                </Badge>
                <Badge colorScheme='green' variant='subtle' borderRadius='full' px={3} py={1}>
                  Public ecosystem pages
                </Badge>
              </HStack>

              <Heading as='h1' size='2xl' letterSpacing='tight'>
                A CRM built for communities — not pipelines.
              </Heading>
              <Text fontSize='lg' color='gray.600'>
                Track people, projects, and relationships as living profiles. Add facts as a timeline, connect objects, and share a public ecosystem view when you’re ready.
              </Text>

              <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} w='full'>
                <Button
                  as={RouterLink}
                  to='/register'
                  colorScheme='blue'
                  size='lg'
                  borderRadius='full'
                  rightIcon={<FiArrowRight />}
                >
                  Get started
                </Button>
                <Button as={RouterLink} to='/ecosystems' variant='outline' size='lg' borderRadius='full'>
                  Explore ecosystems
                </Button>
              </Stack>

              <Text fontSize='sm' color='gray.500'>
                No “deal stages”. Just objects, facts, and context.
              </Text>
            </VStack>

            <Box
              bg='white'
              border='1px solid'
              borderColor='gray.100'
              borderRadius='24px'
              shadow='sm'
              p={{ base: 5, md: 6 }}
            >
              <VStack align='stretch' spacing={4}>
                <HStack justify='space-between'>
                  <HStack spacing={2}>
                    <Box w='10px' h='10px' borderRadius='full' bg='red.300' />
                    <Box w='10px' h='10px' borderRadius='full' bg='yellow.300' />
                    <Box w='10px' h='10px' borderRadius='full' bg='green.300' />
                  </HStack>
                  <Badge colorScheme='blue' variant='subtle' borderRadius='full'>
                    Demo snapshot
                  </Badge>
                </HStack>
                <Divider />
                <SimpleGrid columns={2} spacing={3}>
                  <MiniStat icon={FiUsers} label='People' value='Profiles + roles' />
                  <MiniStat icon={FiGitBranch} label='Links' value='Projects & teams' />
                  <MiniStat icon={FiTrendingUp} label='Funnels' value='Track progress' />
                  <MiniStat icon={FiSearch} label='Search' value='Filter anything' />
                </SimpleGrid>
                <Box bg='gray.50' borderRadius='16px' p={4} border='1px solid' borderColor='gray.100'>
                  <HStack spacing={3} align='start'>
                    <Icon as={FiShare2} color='blue.500' mt={1} />
                    <VStack align='start' spacing={1}>
                      <Text fontWeight='semibold'>Publish an ecosystem view</Text>
                      <Text fontSize='sm' color='gray.600'>
                        Share a clean public page for members and projects without exposing internal notes.
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW='container.lg' py={{ base: 12, md: 16 }}>
        <VStack spacing={10} align='stretch'>
          <VStack spacing={2} align='start'>
            <Text fontSize='sm' color='gray.500' fontWeight='bold' textTransform='uppercase'>
              What you get
            </Text>
            <Heading size='lg'>Everything you need to run a community knowledge graph</Heading>
            <Text color='gray.600'>
              Muninn focuses on strong primitives: objects, types, facts, and links. From that, you can build workflows for recruiting, grants, founders, events, and more.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
            <FeatureCard
              icon={FiLayers}
              title='Flexible object types'
              description='Model people, projects, roles, grants, events, anything — and evolve fields over time.'
            />
            <FeatureCard
              icon={FiGitBranch}
              title='Links that matter'
              description='Connect objects bi-directionally so members can be part of multiple projects (and vice versa).'
            />
            <FeatureCard
              icon={FiTrendingUp}
              title='Funnels & steps'
              description='Track progress with funnels, steps, and sub-status — perfect for pipelines without “deals”.'
            />
            <FeatureCard
              icon={FiSearch}
              title='Advanced filtering'
              description='Search through object content, type values, tags, and related facts to find signal fast.'
            />
            <FeatureCard
              icon={FiGlobe}
              title='Public ecosystem pages'
              description='Showcase your org with a public directory and clean public profiles for projects and talent.'
            />
            <FeatureCard
              icon={FiShare2}
              title='Import & tidy data'
              description='Keep your source of truth clean with merge-friendly objects, aliases, and structured fields.'
            />
          </SimpleGrid>
        </VStack>
      </Container>

      <Box bg='white' borderTop='1px solid' borderColor='gray.100'>
        <Container maxW='container.lg' py={{ base: 12, md: 16 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems='center'>
            <VStack align='start' spacing={3}>
              <Text fontSize='sm' color='gray.500' fontWeight='bold' textTransform='uppercase'>
                How it works
              </Text>
              <Heading size='lg'>From messy contacts to a shared map</Heading>
              <Text color='gray.600'>
                Start simple: create objects and capture facts. Then layer on types, links, and funnels as your community grows.
              </Text>
            </VStack>
            <VStack align='stretch' spacing={4}>
              <StepRow index='01' title='Create objects' description='People, projects, events — whatever you need to track.' />
              <StepRow index='02' title='Add facts & context' description='Log updates as a timeline and keep notes structured.' />
              <StepRow index='03' title='Link + publish' description='Connect relationships and optionally share a public ecosystem page.' />
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW='container.lg' py={{ base: 12, md: 16 }}>
        <Box
          bgGradient='linear(to-r, blue.600, purple.600)'
          borderRadius='28px'
          p={{ base: 6, md: 10 }}
          color='white'
          position='relative'
          overflow='hidden'
        >
          <Box
            position='absolute'
            right='-60px'
            top='-60px'
            w='220px'
            h='220px'
            borderRadius='999px'
            bg='rgba(255,255,255,0.18)'
            filter='blur(1px)'
          />
          <Box
            position='absolute'
            left='-70px'
            bottom='-70px'
            w='260px'
            h='260px'
            borderRadius='999px'
            bg='rgba(255,255,255,0.12)'
            filter='blur(1px)'
          />

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} alignItems='center' position='relative'>
            <VStack align='start' spacing={3}>
              <Heading size='lg'>Ready to make your ecosystem searchable?</Heading>
              <Text opacity={0.9}>
                Start with a small set of objects today. Share a public directory when you’re ready.
              </Text>
            </VStack>
            <HStack spacing={3} justify={{ base: 'start', md: 'end' }}>
              <Button as={RouterLink} to='/register' colorScheme='blackAlpha' bg='white' color='gray.900' borderRadius='full'>
                Create account
              </Button>
              <Button as={RouterLink} to='/login' variant='outline' borderColor='whiteAlpha.600' color='white' borderRadius='full'>
                Sign in
              </Button>
            </HStack>
          </SimpleGrid>
        </Box>
      </Container>

      <Box borderTop='1px solid' borderColor='gray.100' bg='white'>
        <Container maxW='container.lg' py={8}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} alignItems='center'>
            <HStack spacing={3}>
              <Box w='28px' h='28px' borderRadius='10px' bgGradient='linear(to-br, blue.500, purple.500)' />
              <Text fontWeight='bold'>Muninn</Text>
            </HStack>
            <Text fontSize='sm' color='gray.500'>
              Built for operators who want clarity, not clutter.
            </Text>
            <HStack justify={{ base: 'start', md: 'end' }} spacing={4}>
              <ChakraLink href='https://github.com/vennluu/muninn' isExternal fontSize='sm' color='gray.600'>
                GitHub
              </ChakraLink>
              <ChakraLink as={RouterLink} to='/ecosystems' fontSize='sm' color='gray.600'>
                Ecosystems
              </ChakraLink>
            </HStack>
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <Box bg='white' border='1px solid' borderColor='gray.100' borderRadius='20px' p={5} shadow='sm'>
    <HStack spacing={3} align='start'>
      <Box
        w='40px'
        h='40px'
        borderRadius='14px'
        bg='blue.50'
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <Icon as={icon} color='blue.600' />
      </Box>
      <VStack align='start' spacing={1}>
        <Text fontWeight='bold'>{title}</Text>
        <Text fontSize='sm' color='gray.600'>
          {description}
        </Text>
      </VStack>
    </HStack>
  </Box>
);

const MiniStat = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <Box bg='white' border='1px solid' borderColor='gray.100' borderRadius='16px' p={4}>
    <HStack spacing={3} align='start'>
      <Icon as={icon} color='gray.700' mt={1} />
      <VStack align='start' spacing={0}>
        <Text fontSize='xs' color='gray.500' fontWeight='bold' textTransform='uppercase'>
          {label}
        </Text>
        <Text fontWeight='semibold' color='gray.800'>
          {value}
        </Text>
      </VStack>
    </HStack>
  </Box>
);

const StepRow = ({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) => (
  <HStack align='start' spacing={4} bg='gray.50' border='1px solid' borderColor='gray.100' borderRadius='20px' p={5}>
    <Box
      w='44px'
      h='44px'
      borderRadius='16px'
      bg='white'
      border='1px solid'
      borderColor='gray.100'
      display='flex'
      alignItems='center'
      justifyContent='center'
    >
      <Text fontWeight='bold' color='gray.700'>
        {index}
      </Text>
    </Box>
    <VStack align='start' spacing={1} flex={1}>
      <Text fontWeight='bold'>{title}</Text>
      <Text fontSize='sm' color='gray.600'>
        {description}
      </Text>
    </VStack>
  </HStack>
);

export default LandingPage;
