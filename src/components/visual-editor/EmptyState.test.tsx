/**
 * Tests for EmptyState Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('should render with message prop', () => {
    render(<EmptyState message="Test message" />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render default title "Coming Soon"', () => {
    render(<EmptyState message="Test message" />);
    
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('should render custom title when provided', () => {
    render(<EmptyState message="Test message" title="Custom Title" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
  });

  it('should render with info icon', () => {
    const { container } = render(<EmptyState message="Test message" />);
    
    // Check for SVG icon (Phosphor icons render as SVG)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render message in AlertDescription', () => {
    render(<EmptyState message="Visual editing for flowchart diagrams is coming soon!" />);
    
    const message = screen.getByText('Visual editing for flowchart diagrams is coming soon!');
    expect(message).toBeInTheDocument();
  });

  it('should use Alert component for styling', () => {
    const { container } = render(<EmptyState message="Test" />);
    
    // Alert component should have specific classes
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });
});
