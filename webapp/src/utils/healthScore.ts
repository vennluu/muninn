import { GitHubActivity } from '../api/github';
import { SolanaActivity } from '../api/solana';

export type HealthStatus = 'green' | 'yellow' | 'red' | 'unknown';

export interface HealthScore {
  score: number;
  status: HealthStatus;
  githubScore: number;
  solanaScore: number;
  lastSeenDays: number | null;
  breakdown: string[];
}

function daysSince(date: Date | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeHealthScore(
  github: GitHubActivity | null,
  solana: SolanaActivity | null
): HealthScore {
  let githubScore = 0;
  let solanaScore = 0;
  const breakdown: string[] = [];
  let hasAnySignal = false;

  if (github && !github.error) {
    hasAnySignal = true;
    const days = daysSince(github.lastActivityAt);

    if (github.commitsLast30Days >= 10) { githubScore += 40; breakdown.push(`${github.commitsLast30Days} commits/30d`); }
    else if (github.commitsLast30Days >= 5) { githubScore += 28; breakdown.push(`${github.commitsLast30Days} commits/30d`); }
    else if (github.commitsLast30Days >= 1) { githubScore += 14; breakdown.push(`${github.commitsLast30Days} commits/30d`); }
    else { breakdown.push('0 commits in 30d'); }

    if (days !== null) {
      if (days < 7) githubScore += 20;
      else if (days < 14) githubScore += 12;
      else if (days < 30) githubScore += 5;
    }

    if (github.prsLast30Days > 0) { githubScore += 5; breakdown.push(`${github.prsLast30Days} PR(s)`); }
  }

  if (solana && !solana.error) {
    hasAnySignal = true;
    const days = daysSince(solana.lastActivityAt);

    if (days !== null) {
      if (days < 7) { solanaScore += 40; breakdown.push(`Onchain: ${days}d ago`); }
      else if (days < 14) { solanaScore += 28; breakdown.push(`Onchain: ${days}d ago`); }
      else if (days < 30) { solanaScore += 14; breakdown.push(`Onchain: ${days}d ago`); }
      else { breakdown.push(`Onchain: ${days}d ago`); }
    }

    if (solana.txCount30Days >= 10) { solanaScore += 10; }
    else if (solana.txCount30Days >= 3) { solanaScore += 5; }
  }

  if (!hasAnySignal) {
    return { score: 0, status: 'unknown', githubScore: 0, solanaScore: 0, lastSeenDays: null, breakdown: ['No signals found'] };
  }

  const hasGithub = github && !github.error;
  const hasSolana = solana && !solana.error;

  let total: number;
  if (hasGithub && hasSolana) {
    // max possible: 65 + 50 = 115
    total = Math.min(100, Math.round((githubScore + solanaScore) / 1.15));
  } else if (hasGithub) {
    // max: 65
    total = Math.min(100, Math.round((githubScore / 65) * 100));
  } else {
    // max: 50
    total = Math.min(100, Math.round((solanaScore / 50) * 100));
  }

  const lastGithub = github?.lastActivityAt ? daysSince(github.lastActivityAt) : null;
  const lastSolana = solana?.lastActivityAt ? daysSince(solana.lastActivityAt) : null;
  const lastSeenDays =
    lastGithub !== null && lastSolana !== null
      ? Math.min(lastGithub, lastSolana)
      : lastGithub ?? lastSolana;

  const status: HealthStatus = total >= 65 ? 'green' : total >= 35 ? 'yellow' : 'red';

  return { score: total, status, githubScore, solanaScore, lastSeenDays, breakdown };
}

export const STATUS_COLOR: Record<HealthStatus, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  unknown: '#94a3b8',
};

export const STATUS_LABEL: Record<HealthStatus, string> = {
  green: 'Active',
  yellow: 'Fading',
  red: 'Ghost risk',
  unknown: 'No data',
};

export const STATUS_EMOJI: Record<HealthStatus, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
  unknown: '⚪',
};
