import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Flex, Text, Heading, Badge, Spinner, Input,
  Select, Tooltip, Progress, Avatar, Link,
  HStack, VStack, IconButton, useToast,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiRefreshCw, FiExternalLink, FiGithub, FiZap, FiMessageSquare } from 'react-icons/fi';
import BuilderLensChat from 'src/components/BuilderLensChat';
import { fetchObjects } from 'src/api/object';
import { fetchGitHubActivity, extractGitHubUsername, GitHubActivity } from 'src/api/github';
import { fetchSolanaActivity, extractSolanaWallet, SolanaActivity } from 'src/api/solana';
import { computeHealthScore, HealthScore, STATUS_COLOR, STATUS_LABEL } from 'src/utils/healthScore';
import { ListObjectsRow } from 'src/types/Object';

interface BuilderData {
  object: ListObjectsRow;
  githubUsername: string | null;
  solanaWallet: string | null;
  github: GitHubActivity | null;
  solana: SolanaActivity | null;
  health: HealthScore | null;
  loading: boolean;
}

const SCORE_BAR_COLOR = (score: number) => {
  if (score >= 65) return 'green';
  if (score >= 35) return 'yellow';
  return 'red';
};

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function BuilderLensPage() {
  const [builders, setBuilders] = useState<BuilderData[]>([]);
  const [filter, setFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const toast = useToast();

  const loadBuilders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchObjects(1, 100);
      const initial: BuilderData[] = res.objects.map(obj => ({
        object: obj,
        githubUsername: extractGitHubUsername(obj.aliases || []),
        solanaWallet: extractSolanaWallet(obj.aliases || []),
        github: null,
        solana: null,
        health: null,
        loading: true,
      }));
      setBuilders(initial);
      setLoading(false);

      // Fetch signals in batches to avoid rate limiting
      for (let i = 0; i < initial.length; i++) {
        const b = initial[i];
        const [github, solana] = await Promise.all([
          b.githubUsername ? fetchGitHubActivity(b.githubUsername) : Promise.resolve(null),
          b.solanaWallet ? fetchSolanaActivity(b.solanaWallet) : Promise.resolve(null),
        ]);
        const health = computeHealthScore(github, solana);
        setBuilders(prev =>
          prev.map((item, idx) =>
            idx === i ? { ...item, github, solana, health, loading: false } : item
          )
        );
        if (i % 5 === 4) await delay(1000); // avoid GitHub rate limit
      }
    } catch (e) {
      setLoading(false);
      toast({ title: 'Failed to load builders', status: 'error', duration: 3000 });
    }
  }, [toast]);

  useEffect(() => { loadBuilders(); }, [loadBuilders]);

  const filtered = builders.filter(b => {
    if (search && !b.object.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'all') return true;
    return b.health?.status === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    const order = { red: 0, yellow: 1, unknown: 2, green: 3 };
    const aOrder = order[a.health?.status || 'unknown'];
    const bOrder = order[b.health?.status || 'unknown'];
    return aOrder - bOrder;
  });

  const stats = {
    total: builders.filter(b => !b.loading).length,
    red: builders.filter(b => b.health?.status === 'red').length,
    yellow: builders.filter(b => b.health?.status === 'yellow').length,
    green: builders.filter(b => b.health?.status === 'green').length,
  };

  return (
    <Box p={6} maxW="1100px" mx="auto">
      <Flex align="center" justify="space-between" mb={2}>
        <Box>
          <Heading size="lg" fontWeight="800">BuilderLens</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Community health radar — catch churn before the ghost
          </Text>
        </Box>
        <HStack spacing={2}>
          <IconButton
            aria-label="Chat with AI"
            icon={<FiMessageSquare />}
            onClick={() => setShowChat(true)}
            variant="ghost"
            colorScheme="purple"
            title="Chat với BuilderLens AI"
          />
          <IconButton
            aria-label="Refresh"
            icon={<FiRefreshCw />}
            onClick={loadBuilders}
            isLoading={loading}
            variant="ghost"
          />
        </HStack>
      </Flex>

      {/* Stats summary */}
      <HStack spacing={4} mb={6} mt={4} flexWrap="wrap">
        <StatCard label="Total" value={stats.total} color="gray.600" />
        <StatCard label="🔴 Ghost risk" value={stats.red} color="red.500" onClick={() => setFilter('red')} />
        <StatCard label="🟡 Fading" value={stats.yellow} color="yellow.500" onClick={() => setFilter('yellow')} />
        <StatCard label="🟢 Active" value={stats.green} color="green.500" onClick={() => setFilter('green')} />
      </HStack>

      {/* Filters */}
      <HStack mb={4} spacing={3}>
        <Input
          placeholder="Search builder..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          maxW="260px"
          size="sm"
          borderRadius="md"
        />
        <Select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          maxW="160px"
          size="sm"
          borderRadius="md"
        >
          <option value="all">All builders</option>
          <option value="red">🔴 Ghost risk</option>
          <option value="yellow">🟡 Fading</option>
          <option value="green">🟢 Active</option>
        </Select>
        <Text fontSize="sm" color="gray.500">{sorted.length} shown</Text>
      </HStack>

      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="lg" color="blue.500" />
        </Flex>
      ) : sorted.length === 0 ? (
        <Text color="gray.400" textAlign="center" mt={10}>No builders found.</Text>
      ) : (
        <VStack spacing={2} align="stretch">
          {sorted.map(b => (
            <BuilderRow key={b.object.id} data={b} />
          ))}
        </VStack>
      )}

      <Text fontSize="xs" color="gray.400" mt={8} textAlign="center">
        Signals: GitHub public events API + Solana mainnet RPC · Aliases: use <code>github:username</code> or Solana wallet address
      </Text>

      <BuilderLensChat
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        builders={builders}
      />
    </Box>
  );
}

function StatCard({ label, value, color, onClick }: { label: string; value: number; color: string; onClick?: () => void }) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      px={4}
      py={3}
      minW="110px"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={onClick ? { borderColor: 'blue.300', shadow: 'sm' } : {}}
      transition="all 0.15s"
    >
      <Text fontSize="2xl" fontWeight="800" color={color}>{value}</Text>
      <Text fontSize="xs" color="gray.500">{label}</Text>
    </Box>
  );
}

function BuilderRow({ data }: { data: BuilderData }) {
  const { object, github, solana, health, loading, githubUsername, solanaWallet } = data;

  const statusColor = health ? STATUS_COLOR[health.status] : '#94a3b8';
  const statusLabel = health ? STATUS_LABEL[health.status] : 'Loading...';

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      px={5}
      py={4}
      _hover={{ borderColor: 'gray.300', shadow: 'sm' }}
      transition="all 0.15s"
    >
      <Flex align="center" gap={4} flexWrap="wrap">
        {/* Avatar + Name */}
        <HStack spacing={3} minW="180px" flex="1">
          <Avatar size="sm" name={object.name} src={object.photo} />
          <Box>
            <Link as={RouterLink} to={`/objects/${object.id}`} fontWeight="600" fontSize="sm" _hover={{ color: 'blue.600' }}>
              {object.name}
              <FiExternalLink style={{ display: 'inline', marginLeft: 4, opacity: 0.5 }} size={11} />
            </Link>
            <HStack spacing={2} mt={0.5}>
              {githubUsername && (
                <HStack spacing={1}>
                  <FiGithub size={11} color="#6b7280" />
                  <Text fontSize="xs" color="gray.400">{githubUsername}</Text>
                </HStack>
              )}
              {solanaWallet && (
                <HStack spacing={1}>
                  <FiZap size={11} color="#9945FF" />
                  <Text fontSize="xs" color="gray.400">{solanaWallet.slice(0, 6)}…</Text>
                </HStack>
              )}
              {!githubUsername && !solanaWallet && (
                <Text fontSize="xs" color="gray.300">no signals configured</Text>
              )}
            </HStack>
          </Box>
        </HStack>

        {/* Health Score */}
        {loading ? (
          <Spinner size="sm" color="gray.400" />
        ) : health ? (
          <HStack spacing={4} flex="2" flexWrap="wrap">
            {/* Score bar */}
            <Box minW="140px" flex="1">
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="xs" color="gray.500" fontWeight="600">Health</Text>
                <Text fontSize="sm" fontWeight="800" color={statusColor}>{health.score}</Text>
              </Flex>
              <Progress
                value={health.score}
                size="sm"
                borderRadius="full"
                colorScheme={SCORE_BAR_COLOR(health.score)}
              />
            </Box>

            {/* Status badge */}
            <Badge
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="700"
              bg={`${statusColor}22`}
              color={statusColor}
              border={`1px solid ${statusColor}44`}
            >
              {statusLabel}
            </Badge>

            {/* Last seen */}
            {health.lastSeenDays !== null && (
              <Text fontSize="xs" color="gray.400" minW="90px">
                Last seen: <b>{health.lastSeenDays}d ago</b>
              </Text>
            )}

            {/* Signal breakdown */}
            <Tooltip
              label={health.breakdown.join(' · ') || 'No signals'}
              placement="top"
              hasArrow
            >
              <HStack spacing={3} cursor="help">
                {github && !github.error ? (
                  <SignalPill icon={<FiGithub size={11} />} label={`${github.commitsLast30Days}c`} active={github.commitsLast30Days > 0} />
                ) : githubUsername ? (
                  <SignalPill icon={<FiGithub size={11} />} label="—" active={false} />
                ) : null}
                {solana && !solana.error ? (
                  <SignalPill icon={<FiZap size={11} />} label={`${solana.txCount30Days}tx`} active={solana.txCount30Days > 0} />
                ) : solanaWallet ? (
                  <SignalPill icon={<FiZap size={11} />} label="—" active={false} />
                ) : null}
              </HStack>
            </Tooltip>
          </HStack>
        ) : (
          <Text fontSize="xs" color="gray.300">—</Text>
        )}
      </Flex>
    </Box>
  );
}

function SignalPill({ icon, label, active }: { icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <HStack
      spacing={1}
      px={2}
      py={0.5}
      borderRadius="full"
      bg={active ? 'blue.50' : 'gray.100'}
      border="1px solid"
      borderColor={active ? 'blue.200' : 'gray.200'}
    >
      <Box color={active ? 'blue.500' : 'gray.400'}>{icon}</Box>
      <Text fontSize="xs" color={active ? 'blue.600' : 'gray.400'} fontWeight="600">{label}</Text>
    </HStack>
  );
}
