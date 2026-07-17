/**
 * Acceptance spec for the "Export as JPEG" capability.
 *
 * This is an additive, capability-level test authored for the JPEG export
 * feature. It is collected and executed by the repo's own primary test
 * command (`npm run test` -> `vitest run`) and exercises two seams that make
 * the capability observable:
 *
 *   1. The export library (`exportDiagram('jpeg', ...)`) must produce a real
 *      JPEG download (an `image/jpeg` blob written to a `.jpeg`/`.jpg` file).
 *   2. The `Toolbar` component tree must surface a user-facing "Export as
 *      JPEG" option in its export menu.
 *
 * Both specs FAIL on the untouched base (JPEG export does not exist yet) and
 * PASS once the feature is implemented, per the plan's acceptance contract.
 */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { exportDiagram } from '@/lib/export';
import type { ExportFormat } from '@/types';
import { Toolbar } from '@/components/Toolbar';

// Force the desktop layout so the export menu is the real Radix dropdown the
// app ships, rather than the mobile sheet variant.
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }));

const SAMPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">' +
  '<rect width="200" height="120" fill="#ffffff"/></svg>';
const SAMPLE_CODE = 'flowchart TD\n  A --> B';

// The gate runs this whole file; `jpeg` is intentionally passed as an
// ExportFormat even though the base union does not yet contain it. Casting
// keeps the spec authoring honest without depending on the not-yet-added
// literal type.
const JPEG_FORMAT = 'jpeg' as unknown as ExportFormat;

describe('JPEG export capability (acceptance)', () => {
  // ---------------------------------------------------------------------------
  // DOM tier: the real component tree must expose the capability to the user.
  // ---------------------------------------------------------------------------
  describe('Toolbar surfaces a JPEG export option', () => {
    beforeAll(() => {
      // jsdom does not implement the pointer-capture / scroll APIs that Radix
      // relies on to open menus. Provide minimal no-op polyfills so the real
      // dropdown can open under the repo's existing jsdom environment.
      const proto = Element.prototype as unknown as Record<string, unknown>;
      proto.hasPointerCapture ??= () => false;
      proto.setPointerCapture ??= () => {};
      proto.releasePointerCapture ??= () => {};
      proto.scrollIntoView ??= () => {};
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('offers an "Export as JPEG" item in the export menu', async () => {
      const onExport = vi.fn();

      render(
        <Toolbar
          onExport={onExport}
          onLoadExample={vi.fn()}
          onOpenConfig={vi.fn()}
          onCopyCode={vi.fn()}
          onCopyImage={vi.fn()}
          currentCode={SAMPLE_CODE}
        />
      );

      // Open the export dropdown the way a user would.
      const trigger = screen.getByTestId('toolbar-export');
      fireEvent.pointerDown(trigger, { button: 0 });
      fireEvent.pointerUp(trigger, { button: 0 });
      fireEvent.click(trigger);
      (trigger as HTMLElement).focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });

      // The new capability must be visible in the rendered menu (accepts both
      // "JPEG" and "JPG" wording, and either a plain item or a submenu label).
      const jpegOption = await screen.findByText(
        /export as jpe?g/i,
        {},
        { timeout: 3000 }
      );
      expect(jpegOption).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Library tier: exporting as JPEG must actually emit a JPEG file.
  // ---------------------------------------------------------------------------
  describe('exportDiagram emits a JPEG file', () => {
    const mockLink = { href: '', download: '', click: vi.fn() };
    const capturedBlobTypes: string[] = [];
    const originalCreateElement = document.createElement.bind(document);

    beforeEach(() => {
      vi.clearAllMocks();
      mockLink.href = '';
      mockLink.download = '';
      capturedBlobTypes.length = 0;

      // Route <a> and <canvas> creation to inspectable doubles while letting
      // everything else (divs used during style inlining, etc.) be real.
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
            // Preserve the requested mime type so we can assert it downstream.
            toBlob: vi.fn((callback: (b: Blob) => void, type?: string) => {
              callback(new Blob(['jpeg-bytes'], { type: type || 'image/png' }));
            }),
            toDataURL: vi.fn(
              (type?: string) => `data:${type || 'image/png'};base64,AAAA`
            ),
          } as unknown as HTMLElement;
        }
        return originalCreateElement(tag);
      });

      vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el);
      vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el);

      // Capture the mime type of every blob handed to the browser for download.
      vi.spyOn(URL, 'createObjectURL').mockImplementation(
        (obj: Blob | MediaSource) => {
          if (obj instanceof Blob) capturedBlobTypes.push(obj.type);
          return 'blob:mock-url';
        }
      );
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue(''),
      } as unknown as CSSStyleDeclaration);

      // Rasterizing an SVG loads it through an <img>; resolve the load so the
      // canvas pipeline completes.
      vi.stubGlobal(
        'Image',
        class {
          onload: (() => void) | null = null;
          onerror: (() => void) | null = null;
          crossOrigin = '';
          set src(_value: string) {
            setTimeout(() => this.onload?.(), 0);
          }
        }
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it('downloads a file with a .jpeg/.jpg extension', async () => {
      await exportDiagram(JPEG_FORMAT, SAMPLE_CODE, SAMPLE_SVG);

      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toMatch(/\.jpe?g$/i);
    });

    it('encodes the exported image as image/jpeg', async () => {
      await exportDiagram(JPEG_FORMAT, SAMPLE_CODE, SAMPLE_SVG);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(capturedBlobTypes).toContain('image/jpeg');
    });
  });
});
