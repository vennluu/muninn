import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Input, IconButton,
  Avatar, Spinner, Badge, Heading, Tag, Divider,
} from '@chakra-ui/react';
import { FiSend, FiGithub, FiSearch, FiTwitter, FiZap } from 'react-icons/fi';
import { fetchGitHubActivity } from 'src/api/github';
import { fetchSolanaActivity, isSolanaAddress } from 'src/api/solana';

const TWITTER_SERVICE = 'http://localhost:8001';

interface TwitterProfile {
  username: string;
  name: string;
  bio: string;
  followers: number;
  following: number;
  tweet_count: number;
  tweets_30d: number;
  last_tweet_days_ago: number | null;
  is_active: boolean;
  recent_tweets: { text: string; days_ago: number; likes: number; retweets: number }[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  avatar_url: string;
  html_url: string;
  company: string | null;
  location: string | null;
  blog: string | null;
}

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

async function callAI(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string> {
  const groqKey = process.env.REACT_APP_GROQ_API_KEY;
  if (!groqKey) throw new Error('No REACT_APP_GROQ_API_KEY found in .env');

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: 'compound-beta-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1024,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Groq API error ${res.status}`);
  return data.choices?.[0]?.message?.content || '';
}

async function fetchTwitterProfile(username: string): Promise<TwitterProfile | null> {
  try {
    const res = await fetch(`${TWITTER_SERVICE}/twitter/user/${username}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchTwitterViaAI(username: string): Promise<string> {
  try {
    return await callAI(
      'You are a Web3/Solana ecosystem researcher. Answer concisely from your training knowledge.',
      [{
        role: 'user',
        content: `What do you know about Twitter/X user @${username}? Are they active in Web3, Solana, or crypto? What topics do they post about? What projects are they associated with? If you don't know this specific person, say so honestly.`,
      }],
    );
  } catch {
    return '';
  }
}

function buildTwitterContext(tw: TwitterProfile): string {
  const tweets = tw.recent_tweets
    .slice(0, 3)
    .map(t => `  "${t.text.slice(0, 120)}..." (${t.days_ago}d ago, ❤️${t.likes} 🔁${t.retweets})`)
    .join('\n');

  return [
    `--- Twitter/X Profile: @${tw.username} ---`,
    `Name: ${tw.name}`,
    `Bio: ${tw.bio || 'N/A'}`,
    `Followers: ${tw.followers} | Following: ${tw.following}`,
    `Total tweets: ${tw.tweet_count}`,
    `Tweets in last 30 days: ${tw.tweets_30d}`,
    `Last tweet: ${tw.last_tweet_days_ago !== null ? `${tw.last_tweet_days_ago} days ago` : 'unknown'}`,
    `Status: ${tw.is_active ? 'ACTIVE' : 'INACTIVE'}`,
    ``,
    `Recent tweets:`,
    tweets || '  (none)',
  ].join('\n');
}
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const GITHUB_HEADERS: Record<string, string> = GITHUB_TOKEN
  ? { Authorization: `token ${GITHUB_TOKEN}` }
  : {};

const SYSTEM_PROMPT = `You are BuilderAgent, an AI that researches Web3 and Solana builders using public data.
When given builder data (GitHub profile + activity), provide a concise, insightful analysis covering:
- Activity level and consistency (commits, PRs, events in last 30 days)
- Tech stack hints from repos
- Builder reputation signals (followers, repos, account age)
- Whether they appear active or ghosting
- A short "talent signal" verdict

You also have access to web search — use it to find Twitter/X activity, project updates, and community presence.
Be direct and specific. Use emojis sparingly. If data is missing, say so honestly.
Always respond in English.`;

async function fetchGitHubProfile(username: string): Promise<GitHubProfile | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, { headers: GITHUB_HEADERS });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchTopRepos(username: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=pushed&per_page=5`,
      { headers: GITHUB_HEADERS }
    );
    if (!res.ok) return [];
    const repos: any[] = await res.json();
    return repos.map(r => `${r.name} (${r.language || 'unknown'}, ⭐${r.stargazers_count})`);
  } catch {
    return [];
  }
}

function detectHandles(text: string): { github: string | null; twitter: string | null; solana: string | null } {
  let github: string | null = null;
  let twitter: string | null = null;
  let solana: string | null = null;

  // Explicit Solana wallet (solana: prefix or base58 address)
  const solanaPrefix = text.match(/solana:([1-9A-HJ-NP-Za-km-z]{32,44})/);
  if (solanaPrefix) solana = solanaPrefix[1];
  if (!solana) {
    const base58 = text.match(/\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/);
    if (base58 && isSolanaAddress(base58[1])) solana = base58[1];
  }

  // Explicit GitHub
  const ghExplicit = text.match(/github\.com\/([a-zA-Z0-9-]+)/) || text.match(/github:([a-zA-Z0-9-]+)/);
  if (ghExplicit) github = ghExplicit[1];

  // Explicit Twitter
  const twExplicit = text.match(/twitter\.com\/([a-zA-Z0-9_]+)/) || text.match(/x\.com\/([a-zA-Z0-9_]+)/) || text.match(/twitter:([a-zA-Z0-9_]+)/);
  if (twExplicit) twitter = twExplicit[1];

  // @username — Twitter first
  if (!twitter && !github) {
    const atMatch = text.match(/@([a-zA-Z0-9_-]+)/);
    if (atMatch) twitter = atMatch[1];
  }

  // Bare word fallback — treat as both
  if (!github && !twitter) {
    const bare = text.match(/\b([a-zA-Z0-9-]{3,39})\b/g);
    const stopWords = new Set(['the','a','an','is','in','on','for','me','my','about','who','what','how','tell','show','find','research','profile','builder','active','still','building','wallet','solana','check','analyze']);
    const candidate = (bare || []).find(w => !stopWords.has(w.toLowerCase()));
    if (candidate) {
      github = candidate;
      twitter = candidate;
    }
  }

  return { github, twitter, solana };
}

function buildSolanaContext(activity: any): string {
  const lastSeen = activity.lastActivityAt
    ? `${Math.floor((Date.now() - new Date(activity.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24))} days ago`
    : 'unknown';
  return [
    `--- Solana On-chain Activity ---`,
    `Wallet: ${activity.wallet}`,
    `Transactions last 30 days: ${activity.txCount30Days}`,
    `Last on-chain activity: ${lastSeen}`,
    `Status: ${activity.txCount30Days > 0 ? 'ACTIVE on-chain' : 'NO recent on-chain activity'}`,
  ].join('\n');
}

function buildGitHubContext(profile: GitHubProfile, activity: any, repos: string[]): string {
  const accountAge = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365));
  const lastSeen = activity.lastActivityAt
    ? `${Math.floor((Date.now() - new Date(activity.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24))} days ago`
    : 'unknown';

  return [
    `--- GitHub Profile: ${profile.login} ---`,
    `Name: ${profile.name || 'N/A'}`,
    `Bio: ${profile.bio || 'N/A'}`,
    `Company: ${profile.company || 'N/A'}`,
    `Location: ${profile.location || 'N/A'}`,
    `Account age: ${accountAge} years`,
    `Public repos: ${profile.public_repos}`,
    `Followers: ${profile.followers} | Following: ${profile.following}`,
    ``,
    `--- Activity (last 30 days) ---`,
    `Commits: ${activity.commitsLast30Days}`,
    `Pull Requests: ${activity.prsLast30Days}`,
    `Total events: ${activity.eventsLast30Days}`,
    `Last active: ${lastSeen}`,
    ``,
    `--- Recent Repos ---`,
    repos.length > 0 ? repos.join('\n') : 'No public repos',
  ].join('\n');
}

const SUGGESTIONS = [
  'Research @vennluu — GitHub + Twitter',
  'Is builder github:rayhanrsb still active?',
  'Check wallet vennluu3.sol on Solana',
  'Who is github.com/anhchangvt1994 and are they building?',
];

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hey! I\'m BuilderAgent 🔍\n\nTôi có thể research bất kỳ Solana/Web3 builder nào bằng GitHub data. Hãy hỏi tôi:\n• "Research @username"\n• "Is github.com/username still active?"\n• "Profile builder X and tell me their tech stack"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastProfiled, setLastProfiled] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (overrideInput?: string) => {
    const q = (overrideInput ?? input).trim();
    if (!q || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      let contextBlock = '';
      let sources: string[] = [];

      const { github: ghUsername, twitter: twUsername, solana: solanaWallet } = detectHandles(q);

      if (ghUsername || twUsername || solanaWallet) {
        setLastProfiled(twUsername || ghUsername || solanaWallet);

        const [ghProfile, ghActivity, ghRepos, twProfile, solanaActivity] = await Promise.all([
          ghUsername ? fetchGitHubProfile(ghUsername) : Promise.resolve(null),
          ghUsername ? fetchGitHubActivity(ghUsername) : Promise.resolve(null),
          ghUsername ? fetchTopRepos(ghUsername) : Promise.resolve([]),
          twUsername ? fetchTwitterProfile(twUsername) : Promise.resolve(null),
          solanaWallet ? fetchSolanaActivity(solanaWallet) : Promise.resolve(null),
        ]);

        const parts: string[] = [];
        if (ghProfile && ghActivity) {
          parts.push(buildGitHubContext(ghProfile, ghActivity, ghRepos as string[]));
          sources.push(`github.com/${ghUsername}`);
        } else if (ghUsername) {
          parts.push(`GitHub user "${ghUsername}": not found or unavailable.`);
        }

        if (twProfile) {
          parts.push(buildTwitterContext(twProfile));
          sources.push(`twitter.com/${twUsername}`);
        } else if (twUsername) {
          const aiTwitter = await fetchTwitterViaAI(twUsername);
          if (aiTwitter) {
            parts.push(`--- Twitter/X @${twUsername} (AI knowledge, not real-time) ---\n${aiTwitter}`);
            sources.push(`ai-knowledge:@${twUsername}`);
          } else {
            parts.push(`Twitter @${twUsername}: service unavailable and no AI knowledge found.`);
          }
        } else if (twUsername) {
          parts.push(`Twitter @${twUsername}: service unavailable (make sure twitter_service.py is running).`);
        }

        if (solanaActivity && !solanaActivity.error) {
          parts.push(buildSolanaContext(solanaActivity));
          sources.push(`solscan.io/${solanaWallet?.slice(0, 8)}...`);
        } else if (solanaWallet) {
          parts.push(`--- Solana On-chain Activity ---\nWallet: ${solanaWallet}\nStatus: Could not fetch on-chain data.`);
        }

        contextBlock = parts.join('\n\n');
      }

      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

      const systemContent = contextBlock
        ? `${SYSTEM_PROMPT}\n\n${contextBlock}`
        : SYSTEM_PROMPT;

      const reply = await callAI(systemContent, history);
      setMessages(prev => [...prev, { role: 'assistant', content: reply, sources }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err?.message || err}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" h="100%" maxW="860px" mx="auto" px={4} pt={6} pb={0}>
      {/* Header */}
      <HStack mb={4} spacing={3}>
        <Avatar size="sm" name="Agent" bg="purple.500" color="white" icon={<FiSearch />} />
        <Box>
          <Heading size="sm" fontWeight="800">BuilderAgent</Heading>
          <Text fontSize="xs" color="gray.500">Research any builder via GitHub • Twitter • Solana on-chain</Text>
        </Box>
        <HStack ml="auto" spacing={2}>
          <Tag size="sm" colorScheme="green" variant="subtle">
            <FiGithub style={{ marginRight: 4 }} /> GitHub
          </Tag>
          <Tag size="sm" colorScheme="blue" variant="subtle">
            <FiTwitter style={{ marginRight: 4 }} /> Twitter
          </Tag>
          <Tag size="sm" colorScheme="purple" variant="subtle">
            <FiZap style={{ marginRight: 4 }} /> Solana
          </Tag>
        </HStack>
      </HStack>

      <Divider mb={4} />

      {/* Messages */}
      <VStack flex="1" overflowY="auto" spacing={4} align="stretch" pb={4}>
        {messages.map((msg, i) => (
          <Box key={i}>
            <HStack
              align="flex-start"
              spacing={2}
              flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}
            >
              {msg.role === 'assistant' && (
                <Avatar size="xs" name="AI" bg="purple.500" color="white" flexShrink={0} mt={1} />
              )}
              <Box
                maxW="80%"
                px={4}
                py={3}
                borderRadius="xl"
                bg={msg.role === 'user' ? 'blue.500' : 'white'}
                color={msg.role === 'user' ? 'white' : 'gray.800'}
                fontSize="sm"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
                boxShadow="sm"
                border="1px solid"
                borderColor={msg.role === 'user' ? 'blue.500' : 'gray.100'}
              >
                {msg.content}
                {msg.sources && msg.sources.length > 0 && (
                  <HStack mt={2} spacing={1} flexWrap="wrap">
                    {msg.sources.map(s => (
                      <Badge key={s} fontSize="10px" colorScheme="purple" variant="subtle">
                        {s}
                      </Badge>
                    ))}
                  </HStack>
                )}
              </Box>
            </HStack>
          </Box>
        ))}

        {loading && (
          <HStack spacing={2} align="flex-start">
            <Avatar size="xs" name="AI" bg="purple.500" color="white" flexShrink={0} mt={1} />
            <Box px={4} py={3} borderRadius="xl" bg="white" boxShadow="sm" border="1px solid" borderColor="gray.100">
              <HStack spacing={2}>
                <Spinner size="xs" color="purple.500" />
                <Text fontSize="xs" color="gray.500">Fetching data...</Text>
              </HStack>
            </Box>
          </HStack>
        )}

        <div ref={bottomRef} />
      </VStack>

      {/* Suggestions */}
      {messages.length === 1 && (
        <VStack mb={3} spacing={2} align="stretch">
          {SUGGESTIONS.map(s => (
            <Box
              key={s}
              px={4}
              py={2}
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
              cursor="pointer"
              fontSize="sm"
              color="gray.600"
              bg="white"
              _hover={{ bg: 'purple.50', borderColor: 'purple.300', color: 'purple.700' }}
              onClick={() => send(s)}
            >
              {s}
            </Box>
          ))}
        </VStack>
      )}

      {/* Input */}
      <HStack
        py={4}
        borderTopWidth="1px"
        borderColor="gray.100"
        spacing={2}
        bg="gray.50"
      >
        <Input
          placeholder='Ask about any builder, e.g. "Research @vennluu on GitHub"'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          isDisabled={loading}
          bg="white"
          borderRadius="xl"
          size="md"
          _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px #9F7AEA' }}
        />
        <IconButton
          aria-label="Send"
          icon={<FiSend />}
          onClick={() => send()}
          isLoading={loading}
          isDisabled={!input.trim()}
          colorScheme="purple"
          borderRadius="xl"
          size="md"
        />
      </HStack>
    </Flex>
  );
}
