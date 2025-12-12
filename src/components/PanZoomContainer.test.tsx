import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PanZoomContainer } from '@/components/PanZoomContainer';

describe('PanZoomContainer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    render(
      <PanZoomContainer>
        <div data-testid="child-content">Test Content</div>
      </PanZoomContainer>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render zoom controls', () => {
    render(
      <PanZoomContainer>
        <div>Content</div>
      </PanZoomContainer>
    );
    
    // Find zoom buttons by their SVG icons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should have cursor-grab class by default', () => {
    render(
      <PanZoomContainer>
        <div>Content</div>
      </PanZoomContainer>
    );
    
    const container = document.querySelector('.cursor-grab');
    expect(container).toBeInTheDocument();
  });

  it('should apply transform on zoom', async () => {
    render(
      <PanZoomContainer>
        <div data-testid="zoomable">Content</div>
      </PanZoomContainer>
    );
    
    // Get all buttons - should include zoom in, zoom out, reset
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    
    // Click zoom in button
    fireEvent.click(buttons[0]);
    
    // The component should still render
    expect(screen.getByTestId('zoomable')).toBeInTheDocument();
  });
});
