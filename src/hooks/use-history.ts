import { useCallback, useRef, useEffect } from 'react';
import { createHistoryManager, HistoryManager } from '@/lib/history';

interface UseHistoryOptions {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
}

export const useHistory = ({ initialCode = '', onCodeChange }: UseHistoryOptions = {}) => {
  const historyRef = useRef<HistoryManager>(createHistoryManager());

  // Initialize with initial code
  useEffect(() => {
    if (initialCode) {
      historyRef.current.initialize(initialCode);
    }
  }, []); // Only run on mount

  const pushCode = useCallback((code: string) => {
    historyRef.current.push(code);
  }, []);

  const undo = useCallback(() => {
    const code = historyRef.current.undo();
    if (code !== null && onCodeChange) {
      onCodeChange(code);
    }
    return code;
  }, [onCodeChange]);

  const redo = useCallback(() => {
    const code = historyRef.current.redo();
    if (code !== null && onCodeChange) {
      onCodeChange(code);
    }
    return code;
  }, [onCodeChange]);

  const canUndo = useCallback(() => {
    return historyRef.current.canUndo();
  }, []);

  const canRedo = useCallback(() => {
    return historyRef.current.canRedo();
  }, []);

  return {
    pushCode,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
