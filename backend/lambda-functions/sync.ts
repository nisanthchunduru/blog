import { createCache } from '../cache_factory.js';
import { syncCache } from '../daemons/sync.js';

interface SyncResult {
  success: boolean;
  syncedAt: string;
  entityCounts: Record<string, number>;
  errors: string[];
}

export async function run(): Promise<SyncResult> {
  try {
    await syncCache(createCache());
    return {
      success: true,
      syncedAt: new Date().toISOString(),
      entityCounts: {},
      errors: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      syncedAt: new Date().toISOString(),
      entityCounts: {},
      errors: [message],
    };
  }
}
