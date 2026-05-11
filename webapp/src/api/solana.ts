const SOLANA_RPC = process.env.REACT_APP_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';

export interface SolanaActivity {
  wallet: string;
  lastActivityAt: Date | null;
  txCount30Days: number;
  error?: string;
}

export function isSolanaAddress(alias: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(alias);
}

export function extractSolanaWallet(aliases: string[]): string | null {
  for (const alias of aliases) {
    if (alias.startsWith('solana:')) return alias.replace('solana:', '').trim();
  }
  for (const alias of aliases) {
    if (isSolanaAddress(alias)) return alias;
  }
  return null;
}

export async function fetchSolanaActivity(wallet: string): Promise<SolanaActivity> {
  try {
    const res = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [wallet, { limit: 100 }],
      }),
    });

    const data = await res.json();

    if (data.error || !Array.isArray(data.result)) {
      return { wallet, lastActivityAt: null, txCount30Days: 0, error: 'rpc_error' };
    }

    const sigs: any[] = data.result;
    if (sigs.length === 0) return { wallet, lastActivityAt: null, txCount30Days: 0 };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const lastActivityAt = sigs[0].blockTime ? new Date(sigs[0].blockTime * 1000) : null;
    const txCount30Days = sigs.filter(s => s.blockTime && new Date(s.blockTime * 1000) > thirtyDaysAgo).length;

    return { wallet, lastActivityAt, txCount30Days };
  } catch {
    return { wallet, lastActivityAt: null, txCount30Days: 0, error: 'fetch_error' };
  }
}
