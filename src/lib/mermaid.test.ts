import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeMermaid, renderMermaid, validateMermaidSyntax, extractErrorMessage } from '@/lib/mermaid';

// Get the mocked mermaid module
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(),
    parse: vi.fn(),
  },
}));

import mermaidAPI from 'mermaid';
const mermaid = mermaidAPI as any;

describe('Mermaid Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeMermaid', () => {
    it('should initialize with default config', () => {
      initializeMermaid();
      expect(mermaid.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          startOnLoad: false,
          theme: 'default',
        })
      );
    });

    it('should initialize with custom theme', () => {
      initializeMermaid({ theme: 'dark' });
      expect(mermaid.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          startOnLoad: false,
          theme: 'dark',
        })
      );
    });

    it('should pass through additional config options', () => {
      const customConfig = {
        theme: 'forest' as const,
        flowchart: { curve: 'linear' },
      };
      initializeMermaid(customConfig);
      expect(mermaid.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          startOnLoad: false,
          theme: 'forest',
          flowchart: { curve: 'linear' },
        })
      );
    });
  });

  describe('renderMermaid', () => {
    it('should render valid mermaid code', async () => {
      const mockSvg = '<svg><text>Test</text></svg>';
      vi.mocked(mermaid.render).mockResolvedValue({ svg: mockSvg });

      const result = await renderMermaid('flowchart TD\n  A --> B', 'test-id');
      expect(result.svg).toBe(mockSvg);
      expect(mermaid.render).toHaveBeenCalledWith('test-id', 'flowchart TD\n  A --> B');
    });

    it('should throw error for invalid mermaid code', async () => {
      const error = new Error('Syntax error');
      vi.mocked(mermaid.render).mockRejectedValue(error);

      await expect(
        renderMermaid('invalid code', 'test-id')
      ).rejects.toThrow('Syntax error');
    });

    it('should reinitialize with config when provided', async () => {
      vi.mocked(mermaid.render).mockResolvedValue({ svg: '<svg></svg>' });

      await renderMermaid('flowchart TD\n  A --> B', 'test-id', { theme: 'dark' });
      
      expect(mermaid.initialize).toHaveBeenCalled();
    });
  });

  describe('validateMermaidSyntax', () => {
    it('should return true for valid syntax', async () => {
      vi.mocked(mermaid.parse).mockResolvedValue(true as any);

      const isValid = await validateMermaidSyntax('flowchart TD\n  A --> B');
      expect(isValid).toBe(true);
    });

    it('should return false for invalid syntax', async () => {
      vi.mocked(mermaid.parse).mockRejectedValue(new Error('Parse error'));

      const isValid = await validateMermaidSyntax('invalid');
      expect(isValid).toBe(false);
    });
  });

  describe('extractErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error message');
      expect(extractErrorMessage(error)).toBe('Test error message');
    });

    it('should convert string to string', () => {
      expect(extractErrorMessage('String error')).toBe('String error');
    });

    it('should convert number to string', () => {
      expect(extractErrorMessage(404)).toBe('404');
    });

    it('should handle null', () => {
      expect(extractErrorMessage(null)).toBe('null');
    });

    it('should handle undefined', () => {
      expect(extractErrorMessage(undefined)).toBe('undefined');
    });

    it('should handle objects', () => {
      const result = extractErrorMessage({ code: 'ERR_001' });
      // Accept implementations that either stringify objects or include keys
      expect(result.includes('code') || result.includes('"code"')).toBe(true);
    });
  });
});
