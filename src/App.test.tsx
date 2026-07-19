import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { copyImageToClipboard, exportDiagram } from '@/lib/export';
import { toast } from 'sonner';

vi.mock('@/components/Toolbar', () => ({
  Toolbar: ({
    onExport,
    onCopyImage,
  }: {
    onExport: (format: 'png') => void;
    onCopyImage: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => onExport('png')}>
        Export PNG
      </button>
      <button type="button" onClick={onCopyImage}>
        Copy image
      </button>
    </div>
  ),
}));

vi.mock('@/components/DiagramPreview', () => ({
  DiagramPreview: ({
    onSvgRendered,
    onStaleChange,
  }: {
    onSvgRendered?: (svg: string) => void;
    onStaleChange?: (stale: boolean) => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => {
          onSvgRendered?.('<svg><text>Retained</text></svg>');
          onStaleChange?.(true);
        }}
      >
        Set stale preview
      </button>
      <button
        type="button"
        onClick={() => {
          onSvgRendered?.('<svg><text>Current</text></svg>');
          onStaleChange?.(false);
        }}
      >
        Set current preview
      </button>
    </div>
  ),
}));

vi.mock('@/components/CodeEditor', () => ({
  CodeEditor: () => <div>Code editor</div>,
}));
vi.mock('@/components/ConfigDialog', () => ({ ConfigDialog: () => null }));
vi.mock('@/components/KeyboardShortcutsDialog', () => ({
  KeyboardShortcutsDialog: () => null,
}));
vi.mock('@/components/ui/resizable', () => ({
  ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResizablePanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResizableHandle: () => null,
}));
vi.mock('@/components/ui/sonner', () => ({ Toaster: () => null }));
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }));
vi.mock('@/lib/export', () => ({
  exportDiagram: vi.fn().mockResolvedValue(undefined),
  copyImageToClipboard: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe('App stale visual exports', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('exports and copies the retained SVG with the existing success toast and a warning', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Set stale preview' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() => {
      expect(exportDiagram).toHaveBeenCalledWith(
        'png',
        expect.any(String),
        '<svg><text>Retained</text></svg>',
        { scale: undefined }
      );
    });
    expect(toast.success).toHaveBeenCalledWith('Exported as PNG');
    expect(toast.warning).toHaveBeenCalledWith(
      'Exported last valid diagram — current source has errors'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy image' }));
    await waitFor(() => {
      expect(copyImageToClipboard).toHaveBeenCalledWith(
        '<svg><text>Retained</text></svg>'
      );
    });
    expect(toast.success).toHaveBeenCalledWith('Image copied to clipboard');
    expect(toast.warning).toHaveBeenCalledTimes(2);
    expect(toast.warning).toHaveBeenLastCalledWith(
      'Exported last valid diagram — current source has errors'
    );
  });

  it('does not warn when the exported SVG is current', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Set current preview' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() => expect(exportDiagram).toHaveBeenCalled());
    expect(toast.warning).not.toHaveBeenCalled();
  });
});
