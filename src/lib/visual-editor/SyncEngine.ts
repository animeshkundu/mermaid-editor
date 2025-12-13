/**
 * SyncEngine - Manages bidirectional synchronization between text and visual modes
 * 
 * Prevents infinite loops and excessive updates through:
 * - Hash-based change detection (only sync if content actually changed)
 * - Debouncing (300ms delay before sync)
 * - Direction tracking (text→visual vs visual→text)
 * 
 * Usage:
 *   const engine = new SyncEngine();
 *   
 *   // User edits text
 *   const state = await engine.syncTextToVisual(code, 'flowchart');
 *   
 *   // User edits visual
 *   const code = await engine.syncVisualToText(state, 'flowchart');
 */

import type { DiagramType, VisualState } from '@/types';
import { astService } from './MermaidASTService';

/**
 * Debounce utility
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(async () => {
        const result = await func(...args);
        resolve(result);
      }, wait);
    });
  };
}

/**
 * Simple hash function for change detection
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * SyncEngine class
 */
export class SyncEngine {
  private lastTextHash = '';
  private lastVisualHash = '';
  
  /**
   * Sync text code to visual state (debounced)
   */
  syncTextToVisual = debounce(
    async (code: string, diagramType: DiagramType): Promise<VisualState | null> => {
      const hash = simpleHash(code);
      
      // Skip if content hasn't changed
      if (hash === this.lastTextHash) {
        return null;
      }
      
      this.lastTextHash = hash;
      
      // Parse text to visual state
      const state = await astService.parse(code, diagramType);
      
      if (state) {
        // Update visual hash to prevent loop
        this.lastVisualHash = simpleHash(JSON.stringify(state));
      }
      
      return state;
    },
    300 // 300ms debounce
  );

  /**
   * Sync visual state to text code (debounced)
   */
  syncVisualToText = debounce(
    async (state: VisualState, diagramType: DiagramType): Promise<string | null> => {
      const hash = simpleHash(JSON.stringify(state));
      
      // Skip if content hasn't changed
      if (hash === this.lastVisualHash) {
        return null;
      }
      
      this.lastVisualHash = hash;
      
      // Generate text from visual state
      const code = await astService.generate(state, diagramType);
      
      if (code) {
        // Update text hash to prevent loop
        this.lastTextHash = simpleHash(code);
      }
      
      return code;
    },
    300 // 300ms debounce
  );

  /**
   * Reset sync state (useful when switching diagrams)
   */
  reset(): void {
    this.lastTextHash = '';
    this.lastVisualHash = '';
  }
}
