import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  encodeState,
  decodeState,
  generateShareUrl,
  parseUrlState,
  ShareableState,
} from '@/lib/share';

describe('Share Library', () => {
  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/',
        origin: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
      },
      writable: true,
    });
  });

  describe('encodeState', () => {
    it('should encode a simple state', () => {
      const state: ShareableState = {
        code: 'flowchart TD\n  A --> B',
      };
      
      const encoded = encodeState(state);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
    });

    it('should produce URL-safe output', () => {
      const state: ShareableState = {
        code: 'flowchart TD\n  A --> B\n  B --> C',
        config: { theme: 'dark' },
      };
      
      const encoded = encodeState(state);
      // Should not contain + or / or =
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toMatch(/=+$/);
    });

    it('should handle unicode characters', () => {
      const state: ShareableState = {
        code: 'flowchart TD\n  A[こんにちは] --> B[世界]',
      };
      
      const encoded = encodeState(state);
      expect(encoded).toBeTruthy();
      
      // Should be decodable
      const decoded = decodeState(encoded);
      expect(decoded?.code).toBe(state.code);
    });

    it('should handle empty code', () => {
      const state: ShareableState = { code: '' };
      
      const encoded = encodeState(state);
      expect(encoded).toBeTruthy();
    });
  });

  describe('decodeState', () => {
    it('should decode an encoded state', () => {
      const original: ShareableState = {
        code: 'flowchart TD\n  A --> B',
        config: { theme: 'dark' },
      };
      
      const encoded = encodeState(original);
      const decoded = decodeState(encoded);
      
      expect(decoded).toEqual(original);
    });

    it('should return null for invalid input', () => {
      const decoded = decodeState('invalid!!!');
      expect(decoded).toBeNull();
    });

    it('should return null for empty string', () => {
      const decoded = decodeState('');
      expect(decoded).toBeNull();
    });

    it('should handle panZoom state', () => {
      const original: ShareableState = {
        code: 'pie title Pets\n  "Dogs" : 50',
        panZoom: { x: 100, y: 200, zoom: 1.5 },
      };
      
      const encoded = encodeState(original);
      const decoded = decodeState(encoded);
      
      expect(decoded?.panZoom).toEqual(original.panZoom);
    });
  });

  describe('round-trip encoding', () => {
    it('should preserve all state properties', () => {
      const original: ShareableState = {
        code: 'sequenceDiagram\n  Alice->>Bob: Hello',
        config: {
          theme: 'forest',
          themeVariables: { primaryColor: '#ff0000' },
          flowchart: { curve: 'linear' },
        },
        panZoom: { x: 50, y: 75, zoom: 2 },
      };
      
      const encoded = encodeState(original);
      const decoded = decodeState(encoded);
      
      expect(decoded).toEqual(original);
    });

    it('should handle special characters in code', () => {
      const original: ShareableState = {
        code: 'flowchart TD\n  A["Hello & Goodbye"] --> B{"Is it <ok>?"}',
      };
      
      const encoded = encodeState(original);
      const decoded = decodeState(encoded);
      
      expect(decoded?.code).toBe(original.code);
    });

    it('should handle long code', () => {
      const longCode = 'flowchart TD\n' + 
        Array.from({ length: 100 }, (_, i) => `  N${i} --> N${i + 1}`).join('\n');
      
      const original: ShareableState = { code: longCode };
      
      const encoded = encodeState(original);
      const decoded = decodeState(encoded);
      
      expect(decoded?.code).toBe(original.code);
    });
  });

  describe('generateShareUrl', () => {
    it('should generate a valid URL', () => {
      const state: ShareableState = {
        code: 'flowchart TD\n  A --> B',
      };
      
      const url = generateShareUrl(state);
      expect(url).toContain('http://localhost:3000');
      expect(url).toContain('code=');
    });
  });

  describe('parseUrlState', () => {
    it('should return null when no code param exists', () => {
      const state = parseUrlState();
      expect(state).toBeNull();
    });

    it('should parse state from URL', () => {
      const original: ShareableState = {
        code: 'flowchart TD\n  A --> B',
      };
      const encoded = encodeState(original);
      
      Object.defineProperty(window, 'location', {
        value: {
          href: `http://localhost:3000/?code=${encoded}`,
          origin: 'http://localhost:3000',
          pathname: '/',
          search: `?code=${encoded}`,
          hash: '',
        },
        writable: true,
      });
      
      const parsed = parseUrlState();
      expect(parsed?.code).toBe(original.code);
    });
  });
});
