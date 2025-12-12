import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfigDialog } from '@/components/ConfigDialog';
import { DEFAULT_MERMAID_CONFIG } from '@/lib/constants';

describe('ConfigDialog Component', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    config: DEFAULT_MERMAID_CONFIG,
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(<ConfigDialog {...defaultProps} />);
    expect(screen.getByText('Mermaid Configuration')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    render(<ConfigDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Mermaid Configuration')).not.toBeInTheDocument();
  });

  it('should show Visual Editor and JSON Editor tabs', () => {
    render(<ConfigDialog {...defaultProps} />);
    expect(screen.getByText('Visual Editor')).toBeInTheDocument();
    expect(screen.getByText('JSON Editor')).toBeInTheDocument();
  });

  it('should show theme selection in visual editor', () => {
    render(<ConfigDialog {...defaultProps} />);
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('should show flowchart options', () => {
    render(<ConfigDialog {...defaultProps} />);
    expect(screen.getByText('Flowchart Options')).toBeInTheDocument();
  });

  it('should show curve style selector', () => {
    render(<ConfigDialog {...defaultProps} />);
    expect(screen.getByText('Curve Style')).toBeInTheDocument();
  });

  it('should have reset button', () => {
    render(<ConfigDialog {...defaultProps} />);
    const resetButtons = screen.getAllByText('Reset to Default');
    expect(resetButtons.length).toBeGreaterThan(0);
  });

  it('should have apply button', () => {
    render(<ConfigDialog {...defaultProps} />);
    const applyButtons = screen.getAllByText('Apply Changes');
    expect(applyButtons.length).toBeGreaterThan(0);
  });

  it('should call onSave when apply is clicked in visual editor', async () => {
    render(<ConfigDialog {...defaultProps} />);
    
    const applyButtons = screen.getAllByText('Apply Changes');
    fireEvent.click(applyButtons[0]);
    
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalled();
    });
  });

  it('should show JSON textarea in JSON editor tab', async () => {
    render(<ConfigDialog {...defaultProps} />);
    
    // Click JSON Editor tab
    fireEvent.click(screen.getByText('JSON Editor'));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Configuration JSON')).toBeInTheDocument();
    });
  });

  it('should display error for invalid JSON', async () => {
    render(<ConfigDialog {...defaultProps} />);
    
    // Switch to JSON tab
    fireEvent.click(screen.getByText('JSON Editor'));
    
    await waitFor(() => {
      const textarea = screen.getByLabelText('Configuration JSON');
      fireEvent.change(textarea, { target: { value: 'invalid json{' } });
    });
    
    // Click apply
    const applyButtons = screen.getAllByText('Apply Changes');
    fireEvent.click(applyButtons[applyButtons.length - 1]);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
    });
  });
});
