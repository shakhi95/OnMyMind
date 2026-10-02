import type { AppState, Journal } from '../types';
import { emptyJournal, isEmptyDump } from '../types';

export const STORAGE_KEY = 'on-my-mind';

export const emptyState = (): AppState => ({ journals: {}, threads: [], tasks: [] });

/** Drop placeholder dumps and journal days with nothing real left. */
export function prunePersistedState(data: AppState): AppState {
  const journals: Record<string, Journal> = {};

  Object.entries(data.journals).forEach(([date, journal]) => {
    const dumps = (journal.dumps || []).filter((dump) => !isEmptyDump(dump));
    if (dumps.length > 0) journals[date] = { dumps };
  });

  return {
    journals,
    threads: data.threads,
    tasks: data.tasks,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const saved = JSON.parse(raw) as unknown;
    if (!isAppState(saved)) return emptyState();
    return prunePersistedState(saved);
  } catch {
    return emptyState();
  }
}

export function saveState(data: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prunePersistedState(data)));
    return true;
  } catch {
    return false;
  }
}

export function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AppState>;
  return (
    typeof candidate.journals === 'object' &&
    candidate.journals !== null &&
    Array.isArray(candidate.threads) &&
    Array.isArray(candidate.tasks)
  );
}

export function parseImportPayload(raw: string): AppState {
  const parsed = JSON.parse(raw) as unknown;
  if (!isAppState(parsed)) throw new Error('Invalid On My Mind backup file.');
  return prunePersistedState(parsed);
}

export function exportState(data: AppState, filename: string) {
  const payload = prunePersistedState(data);
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export function draftKey(threadId: string, kind: 'thinking' | 'decision') {
  return `${STORAGE_KEY}.draft.${threadId}.${kind}`;
}

export function readDraft(key: string) {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

export function writeDraft(key: string, value: string) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export { emptyJournal };
