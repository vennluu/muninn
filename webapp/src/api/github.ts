const GITHUB_API = 'https://api.github.com';
const TOKEN = process.env.REACT_APP_GITHUB_TOKEN;

const headers: Record<string, string> = TOKEN
  ? { Authorization: `token ${TOKEN}` }
  : {};

export interface GitHubActivity {
  username: string;
  lastActivityAt: Date | null;
  commitsLast30Days: number;
  prsLast30Days: number;
  eventsLast30Days: number;
  error?: string;
}

export async function fetchGitHubActivity(username: string): Promise<GitHubActivity> {
  try {
    const res = await fetch(`${GITHUB_API}/users/${username}/events?per_page=100`, { headers });

    if (res.status === 404) {
      return { username, lastActivityAt: null, commitsLast30Days: 0, prsLast30Days: 0, eventsLast30Days: 0, error: 'not_found' };
    }
    if (!res.ok) {
      return { username, lastActivityAt: null, commitsLast30Days: 0, prsLast30Days: 0, eventsLast30Days: 0, error: `http_${res.status}` };
    }

    const events: any[] = await res.json();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => new Date(e.created_at) > thirtyDaysAgo);

    const commits = recentEvents
      .filter(e => e.type === 'PushEvent')
      .reduce((sum: number, e: any) => sum + (e.payload?.commits?.length || 0), 0);
    const prs = recentEvents.filter(e => e.type === 'PullRequestEvent').length;
    const lastActivityAt = events.length > 0 ? new Date(events[0].created_at) : null;

    return { username, lastActivityAt, commitsLast30Days: commits, prsLast30Days: prs, eventsLast30Days: recentEvents.length };
  } catch {
    return { username, lastActivityAt: null, commitsLast30Days: 0, prsLast30Days: 0, eventsLast30Days: 0, error: 'fetch_error' };
  }
}

export function extractGitHubUsername(aliases: string[]): string | null {
  for (const alias of aliases) {
    if (alias.startsWith('github:')) return alias.replace('github:', '').trim();
  }
  // fallback: detect github.com URLs
  for (const alias of aliases) {
    const match = alias.match(/github\.com\/([a-zA-Z0-9-]+)/);
    if (match) return match[1];
  }
  return null;
}
