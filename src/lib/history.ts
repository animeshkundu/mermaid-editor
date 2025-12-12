/**
 * History management for undo/redo functionality
 * Tracks code changes and allows navigating through history
 */

export interface HistoryEntry {
  code: string;
  timestamp: number;
}

export interface HistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
}

const MAX_HISTORY_SIZE = 50;
const DEBOUNCE_MS = 1000; // Don't add entries within 1 second of each other

export const createHistoryManager = () => {
  let state: HistoryState = {
    entries: [],
    currentIndex: -1,
  };

  let lastEntryTime = 0;

  const push = (code: string): void => {
    const now = Date.now();
    
    // Debounce rapid changes
    if (now - lastEntryTime < DEBOUNCE_MS && state.entries.length > 0) {
      // Update the current entry instead of adding a new one
      const currentEntry = state.entries[state.currentIndex];
      if (currentEntry) {
        currentEntry.code = code;
        currentEntry.timestamp = now;
        return;
      }
    }

    // Don't add duplicate entries
    if (state.currentIndex >= 0) {
      const currentCode = state.entries[state.currentIndex]?.code;
      if (currentCode === code) {
        return;
      }
    }

    // Remove any entries after current index (discard redo history)
    state.entries = state.entries.slice(0, state.currentIndex + 1);

    // Add new entry
    state.entries.push({
      code,
      timestamp: now,
    });

    // Limit history size
    if (state.entries.length > MAX_HISTORY_SIZE) {
      state.entries = state.entries.slice(-MAX_HISTORY_SIZE);
    }

    state.currentIndex = state.entries.length - 1;
    lastEntryTime = now;
  };

  const undo = (): string | null => {
    if (state.currentIndex > 0) {
      state.currentIndex--;
      return state.entries[state.currentIndex]?.code ?? null;
    }
    return null;
  };

  const redo = (): string | null => {
    if (state.currentIndex < state.entries.length - 1) {
      state.currentIndex++;
      return state.entries[state.currentIndex]?.code ?? null;
    }
    return null;
  };

  const canUndo = (): boolean => {
    return state.currentIndex > 0;
  };

  const canRedo = (): boolean => {
    return state.currentIndex < state.entries.length - 1;
  };

  const getCurrentCode = (): string | null => {
    return state.entries[state.currentIndex]?.code ?? null;
  };

  const getHistorySize = (): number => {
    return state.entries.length;
  };

  const clear = (): void => {
    state = {
      entries: [],
      currentIndex: -1,
    };
    lastEntryTime = 0;
  };

  const initialize = (initialCode: string): void => {
    clear();
    push(initialCode);
  };

  return {
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    getCurrentCode,
    getHistorySize,
    clear,
    initialize,
  };
};

export type HistoryManager = ReturnType<typeof createHistoryManager>;
