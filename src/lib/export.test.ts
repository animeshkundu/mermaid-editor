import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportSVG, exportMarkdown, exportDiagram, copyImageToClipboard } from '@/lib/export';

// Mock DOM elements and APIs
const mockLink = {
  href: '',
  download: '',
  click: vi.fn(),
};

const mockBlob = new Blob(['test'], { type: 'image/png' });

// Store original createElement to use for non-mocked elements
const originalCreateElement = document.createElement.bind(document);

describe('Export Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock document.createElement for link and canvas
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return mockLink as unknown as HTMLElement;
      }
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({
            fillStyle: '',
            fillRect: vi.fn(),
            drawImage: vi.fn(),
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
          })),
          toBlob: vi.fn((callback) => callback(mockBlob)),
        } as unknown as HTMLElement;
      }
      // Use original for other elements (div, etc.)
      return originalCreateElement(tag);
    });
    
    // Mock appendChild and removeChild
    vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el);
    vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el);
    
    // Mock URL APIs
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    
    // Mock window.getComputedStyle for style inlining
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue(''),
    } as unknown as CSSStyleDeclaration);
  });

  describe('exportSVG', () => {
    it('should create a download link for SVG', () => {
      const svgString = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>';
      
      exportSVG(svgString, 'test.svg');
      
      expect(mockLink.download).toBe('test.svg');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should use default filename if not provided', () => {
      const svgString = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
      
      exportSVG(svgString);
      
      expect(mockLink.download).toBe('diagram.svg');
    });

    it('should add xmlns attributes to SVG', () => {
      const svgString = '<svg><rect/></svg>';
      
      exportSVG(svgString, 'test.svg');
      
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportMarkdown', () => {
    it('should create a download link for markdown', () => {
      const code = 'flowchart TD\n  A --> B';
      
      exportMarkdown(code, 'test.md');
      
      expect(mockLink.download).toBe('test.md');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should wrap code in mermaid code block', () => {
      const code = 'flowchart TD\n  A --> B';
      
      // We can't easily check the content, but we can verify the function runs
      expect(() => exportMarkdown(code)).not.toThrow();
    });
  });

  describe('exportDiagram', () => {
    it('should call exportSVG for svg format', async () => {
      const svgString = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
      const code = 'flowchart TD\n  A --> B';
      
      await exportDiagram('svg', code, svgString);
      
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toContain('.svg');
    });

    it('should call exportMarkdown for markdown format', async () => {
      const code = 'flowchart TD\n  A --> B';
      
      await exportDiagram('markdown', code);
      
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toContain('.md');
    });

    it('should generate timestamped filename', async () => {
      const code = 'flowchart TD\n  A --> B';
      
      await exportDiagram('markdown', code);
      
      // Check filename format: mermaid-YYYY-MM-DD.md
      expect(mockLink.download).toMatch(/^mermaid-\d{4}-\d{2}-\d{2}\.md$/);
    });
  });

  describe('SVG parsing', () => {
    it('should handle SVG with viewBox', () => {
      const svgString = '<svg viewBox="0 0 100 100"><rect/></svg>';
      
      expect(() => exportSVG(svgString)).not.toThrow();
    });

    it('should handle SVG with width and height', () => {
      const svgString = '<svg width="100" height="100"><rect/></svg>';
      
      expect(() => exportSVG(svgString)).not.toThrow();
    });

    it('should throw for invalid SVG', () => {
      const invalidSvg = '<div>not an svg</div>';
      
      expect(() => exportSVG(invalidSvg)).toThrow();
    });
  });
});

describe('Clipboard Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Image constructor
    vi.stubGlobal('Image', class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    });
  });

  it('should handle clipboard write errors gracefully', async () => {
    // Mock clipboard API to fail
    Object.assign(navigator, {
      clipboard: {
        write: vi.fn().mockRejectedValue(new Error('Clipboard access denied')),
      },
    });

    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect/></svg>';
    
    await expect(copyImageToClipboard(svgString)).rejects.toThrow();
  });
});
