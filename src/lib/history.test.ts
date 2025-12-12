import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createHistoryManager, HistoryManager } from '@/lib/history';

describe('History Manager', () => {
  let history: HistoryManager;

  beforeEach(() => {
    vi.useFakeTimers();
    history = createHistoryManager();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should start with empty history', () => {
      expect(history.getHistorySize()).toBe(0);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });

    it('should initialize with code', () => {
      history.initialize('flowchart TD\n  A --> B');
      
      expect(history.getHistorySize()).toBe(1);
      expect(history.getCurrentCode()).toBe('flowchart TD\n  A --> B');
    });
  });

  describe('push', () => {
    it('should add entries to history', () => {
      history.push('code1');
      vi.advanceTimersByTime(1500);
      history.push('code2');
      vi.advanceTimersByTime(1500);
      history.push('code3');
      
      expect(history.getHistorySize()).toBe(3);
    });

    it('should debounce rapid changes', () => {
      history.push('code1');
      vi.advanceTimersByTime(100);
      history.push('code2');
      vi.advanceTimersByTime(100);
      history.push('code3');
      
      // Should only have 1 entry due to debouncing
      expect(history.getHistorySize()).toBe(1);
      expect(history.getCurrentCode()).toBe('code3');
    });

    it('should not add duplicate consecutive entries', () => {
      history.push('code1');
      vi.advanceTimersByTime(1500);
      history.push('code1'); // Same code
      
      expect(history.getHistorySize()).toBe(1);
    });

    it('should limit history size', () => {
      for (let i = 0; i < 60; i++) {
        history.push(`code${i}`);
        vi.advanceTimersByTime(1500);
      }
      
      expect(history.getHistorySize()).toBe(50); // MAX_HISTORY_SIZE
    });
  });

  describe('undo', () => {
    it('should return null when nothing to undo', () => {
      const result = history.undo();
      expect(result).toBeNull();
    });

    it('should undo to previous code', () => {
      history.push('code1');
      vi.advanceTimersByTime(1500);
      history.push('code2');
      
      expect(history.canUndo()).toBe(true);
      
      const result = history.undo();
      expect(result).toBe('code1');
    });

    it('should undo multiple times', () => {
      history.push('code1');
      vi.advanceTimersByTime(1500);
      history.push('code2');
      vi.advanceTimersByTime(1500);
      history.push('code3');
      
      history.undo();
      history.undo();
      
      expect(history.getCurrentCode()).toBe('code1');
      expect(history.canUndo()).toBe(false);
    });
  });

  describe('redo', () => {
    it('should return null when nothing to redo', () => {
      history.push('code1');
      
      const result = history.redo();
      expect(result).toBeNull();
    });

    it('should redo after undo', () => {
      history.push('code1');
      vi.advanceTimersByTime(1500);
      history.push('code2');
      
      history.undo();
      expect(history.canRedo()).toBe(true);
      
      const result = history.redo();
      expect(result).toBe('code2');
    });

    it('should clear redo history on new push', () => {
      history.push('code1');
      vi.advanceTimersByTime(1500);
      history.push('code2');
      vi.advanceTimersByTime(1500);
      history.push('code3');
      
      history.undo();
      history.undo();
      
      vi.advanceTimersByTime(1500);
      history.push('code4');
      
      expect(history.canRedo()).toBe(false);
      expect(history.getHistorySize()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear all history', () => {
      history.push('code1');
      vi.advanceTimersByTime(1500);
      history.push('code2');
      
      history.clear();
      
      expect(history.getHistorySize()).toBe(0);
      expect(history.getCurrentCode()).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      history.push('');
      expect(history.getHistorySize()).toBe(1);
      expect(history.getCurrentCode()).toBe('');
    });

    it('should handle very long code', () => {
      const longCode = 'x'.repeat(100000);
      history.push(longCode);
      
      expect(history.getCurrentCode()).toBe(longCode);
    });

    it('should handle special characters', () => {
      const code = 'flowchart TD\n  A["Special: <>&\'""] --> B';
      history.push(code);
      
      expect(history.getCurrentCode()).toBe(code);
    });
  });
});
