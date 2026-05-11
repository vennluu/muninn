import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  VStack, HStack, Box, Text, Input, IconButton, Spinner, Badge, Avatar,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import { GitHubActivity } from 'src/api/github';
import { SolanaActivity } from 'src/api/solana';
import { HealthScore } from 'src/utils/healthScore';
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

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  builders: BuilderData[];
}

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY;

function buildContext(builders: BuilderData[]): string {
  const loaded = builders.filter(b => !b.loading && b.health);
  if (loaded.length === 0) return 'No builder data loaded yet.';

  const red = loaded.filter(b => b.health?.status === 'red');
  const yellow = loaded.filter(b => b.health?.status === 'yellow');
  const green = loaded.filter(b => b.health?.status === 'green');
  const unknown = loaded.filter(b => b.health?.status === 'unknown');

  const fmt = (b: BuilderData) => {
    const h = b.health!;
    const github = b.githubUsername ? `github:${b.githubUsername}` : null;
    const signals = [
      github && b.github && !b.github.error ? `${b.github.commitsLast30Days} commits, ${b.github.prsLast30Days} PRs in 30d` : null,
      b.solana && !b.solana.error ? `${b.solana.txCount30Days} onchain txs in 30d` : null,
    ].filter(Boolean).join('; ') || 'no signals';
    const lastSeen = h.lastSeenDays !== null ? `last seen ${h.lastSeenDays}d ago` : 'last seen unknown';
    return `  - ${b.object.name} (score: ${h.score}/100, ${lastSeen}, ${signals})`;
  };

  const lines = [
    `Today: ${new Date().toISOString().slice(0, 10)}`,
    `Total builders tracked: ${loaded.length}`,
    '',
    `🔴 GHOST RISK (${red.length}):`,
    ...red.map(fmt),
    `🟡 FADING (${yellow.length}):`,
    ...yellow.map(fmt),
    `🟢 ACTIVE (${green.length}):`,
    ...green.map(fmt),
  ];
  if (unknown.length > 0) {
    lines.push(`⚪ NO DATA (${unknown.length}): ${unknown.map(b => b.object.name).join(', ')}`);
  }
  return lines.join('\n');
}

const SYSTEM_PROMPT = `You are BuilderLens AI, a community health assistant for a Web3 builder community (Superteam Vietnam).
You have access to real-time builder activity data tracked via GitHub commits and Solana on-chain transactions.
Health scores: 🟢 Active (≥65), 🟡 Fading (35-64), 🔴 Ghost risk (<35).
Answer questions concisely and specifically. Name names. Use emojis for status.
Give actionable insights when asked. Always respond in English.`;

export default function BuilderLensChat({ isOpen, onClose, builders }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hey! I\'m BuilderLens AI 👋 Ask me anything about your community — who\'s active, who\'s about to ghost, who needs a follow-up...' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadedCount = builders.filter(b => !b.loading && b.health).length;
  const totalCount = builders.length;
  const ready = loadedCount === totalCount && totalCount > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading || !GROQ_KEY) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const context = buildContext(builders);
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\n--- COMMUNITY DATA ---\n${context}` },
            ...history,
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data?.error?.message || `API error ${res.status}`;
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errMsg}` }]);
      } else {
        const reply = data.choices?.[0]?.message?.content || 'No response from AI.';
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Connection error: ${err?.message || err}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" pb={3}>
          <HStack spacing={2}>
            <Text fontWeight="800">BuilderLens AI</Text>
            {ready ? (
              <Badge colorScheme="green" fontSize="xs">{loadedCount} builders loaded</Badge>
            ) : (
              <Badge colorScheme="yellow" fontSize="xs">Loading {loadedCount}/{totalCount}...</Badge>
            )}
          </HStack>
        </DrawerHeader>

        <DrawerBody display="flex" flexDirection="column" p={0}>
          {/* Messages */}
          <VStack flex="1" overflowY="auto" spacing={3} p={4} align="stretch">
            {messages.map((msg, i) => (
              <HStack
                key={i}
                align="flex-start"
                spacing={2}
                flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}
              >
                {msg.role === 'assistant' && (
                  <Avatar size="xs" name="AI" bg="purple.500" color="white" fontSize="10px" />
                )}
                <Box
                  maxW="85%"
                  px={3}
                  py={2}
                  borderRadius="lg"
                  bg={msg.role === 'user' ? 'blue.500' : 'gray.100'}
                  color={msg.role === 'user' ? 'white' : 'gray.800'}
                  fontSize="sm"
                  whiteSpace="pre-wrap"
                  wordBreak="break-word"
                >
                  {msg.content}
                </Box>
              </HStack>
            ))}
            {loading && (
              <HStack spacing={2}>
                <Avatar size="xs" name="AI" bg="purple.500" color="white" fontSize="10px" />
                <Box px={3} py={2} borderRadius="lg" bg="gray.100">
                  <Spinner size="xs" color="purple.500" />
                </Box>
              </HStack>
            )}
            <div ref={bottomRef} />
          </VStack>

          {/* Suggestions */}
          {messages.length === 1 && (
            <VStack px={4} pb={2} spacing={2} align="stretch">
              {[
                'Who is about to ghost?',
                'Who is the most active builder?',
                'Who should I follow up with this week?',
                'Give me a community health summary',
              ].map(s => (
                <Box
                  key={s}
                  px={3}
                  py={2}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                  cursor="pointer"
                  fontSize="sm"
                  color="gray.600"
                  _hover={{ bg: 'gray.50', borderColor: 'blue.300' }}
                  onClick={() => { setInput(s); }}
                >
                  {s}
                </Box>
              ))}
            </VStack>
          )}

          {/* Input */}
          <HStack p={4} borderTopWidth="1px" spacing={2}>
            <Input
              placeholder={ready ? 'Ask about your community...' : 'Loading builder data...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              isDisabled={loading}
              size="sm"
              borderRadius="md"
            />
            <IconButton
              aria-label="Send"
              icon={<FiSend />}
              onClick={send}
              isLoading={loading}
              isDisabled={!input.trim() || !GROQ_KEY}
              colorScheme="blue"
              size="sm"
            />
          </HStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
