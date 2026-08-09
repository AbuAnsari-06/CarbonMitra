/**
 * Nonce Manager for server-side Polygon Amoy transactions.
 * Prevents race conditions and "nonce too low" or "replacement transaction underpriced" errors
 * when multiple mint / transfer requests occur concurrently.
 */
interface NonceState {
  currentNonce: number;
  lastSyncTimestamp: number;
  lock: Promise<void>;
}

const nonceTracker = new Map<string, NonceState>();

/**
 * Executes a callback with an exclusive lock on the address's transaction queue.
 * Guarantees sequential, atomic nonce allocation across concurrent requests.
 */
export async function withAtomicNonce<T>(
  walletAddress: string,
  fetchOnChainNonce: () => Promise<number>,
  executeTransaction: (nonce: number) => Promise<T>
): Promise<T> {
  const addressKey = walletAddress.toLowerCase();
  
  let state = nonceTracker.get(addressKey);
  if (!state) {
    state = {
      currentNonce: -1,
      lastSyncTimestamp: 0,
      lock: Promise.resolve(),
    };
    nonceTracker.set(addressKey, state);
  }

  let releaseLock!: () => void;
  const nextLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  const previousLock = state.lock;
  state.lock = (async () => {
    await previousLock;
    await nextLock;
  })();

  await previousLock;

  try {
    const now = Date.now();
    if (state.currentNonce < 0 || now - state.lastSyncTimestamp > 120_000) {
      const onChainNonce = await fetchOnChainNonce();
      state.currentNonce = Math.max(state.currentNonce, onChainNonce);
      state.lastSyncTimestamp = now;
    }

    const assignedNonce = state.currentNonce;
    state.currentNonce += 1;

    const result = await executeTransaction(assignedNonce);
    return result;
  } catch (err: any) {
    try {
      const freshNonce = await fetchOnChainNonce();
      state.currentNonce = freshNonce;
      state.lastSyncTimestamp = Date.now();
    } catch {
      // Ignore RPC sync errors
    }
    throw err;
  } finally {
    if (releaseLock) releaseLock();
  }
}

/**
 * Force reset nonce cache for a wallet address to force RPC re-sync.
 */
export function resetNonceTracker(walletAddress: string): void {
  nonceTracker.delete(walletAddress.toLowerCase());
}
