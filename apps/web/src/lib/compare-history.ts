export interface CompareHistoryEntry {
  ids: string[];
  names: string[];
  savedAt: number; // timestamp
}

const HISTORY_KEY = 'compario-compare-history';
const MAX_HISTORY = 5;

export function saveCompareHistory(ids: string[], names: string[]): void {
  try {
    const existing = getCompareHistory();
    // Remove duplicate (same ids in any order)
    const sorted = [...ids].sort().join(',');
    const filtered = existing.filter((e) => [...e.ids].sort().join(',') !== sorted);
    const next: CompareHistoryEntry[] = [
      { ids, names, savedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

export function getCompareHistory(): CompareHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CompareHistoryEntry[];
  } catch {
    return [];
  }
}

export function clearCompareHistory(): void {
  try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
}
