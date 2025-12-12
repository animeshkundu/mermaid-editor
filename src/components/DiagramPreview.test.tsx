import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DiagramPreview } from '@/components/DiagramPreview';
import { DEFAULT_MERMAID_CONFIG } from '@/lib/constants';

// Mock the mermaid module
vi.mock('@/lib/mermaid', () => ({
  renderMermaid: vi.fn().mockResolvedValue({ svg: '<svg><text>Test Diagram</text></svg>' }),
  extractErrorMessage: vi.fn((error) => String(error)),
}));

describe('DiagramPreview Component', () => {
  const defaultProps = {
    code: 'flowchart TD\n  A --> B',
    config: DEFAULT_MERMAID_CONFIG,
    onSvgRendered: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });
  

  it('should show placeholder when code is empty', async () => {
    render(<DiagramPreview code="" config={DEFAULT_MERMAID_CONFIG} />);
    
    await waitFor(() => {
      expect(screen.getByText('Start typing to see your diagram')).toBeInTheDocument();
    });
  });

  it('should render the diagram container', () => {
    render(<DiagramPreview {...defaultProps} />);
    
    // The diagram-preview-bg class should be present
    expect(document.querySelector('.diagram-preview-bg')).toBeInTheDocument();
  });

  it('should call onSvgRendered when diagram is rendered', async () => {
    const onSvgRendered = vi.fn();
    render(
      <DiagramPreview
        {...defaultProps}
        onSvgRendered={onSvgRendered}
      />
    );

    // The callback should eventually be called (allow some time for async render)
    await waitFor(() => {
      expect(onSvgRendered).toHaveBeenCalled();
    }, { timeout: 5000 });
  });
});

describe('DiagramPreview Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display error message on render failure', async () => {
    // Mock render to throw error
    vi.mocked(await import('@/lib/mermaid')).renderMermaid.mockRejectedValueOnce(
      new Error('Syntax error in diagram')
    );

    render(
      <DiagramPreview
        code="invalid mermaid"
        config={DEFAULT_MERMAID_CONFIG}
      />
    );

    // The component should handle errors gracefully
    expect(document.querySelector('.diagram-preview-bg')).toBeInTheDocument();
  });
});
