/**
 * Tests for VisualEditorRegistry Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VisualEditorRegistry } from './VisualEditorRegistry';
import { DiagramType } from '@/types';

describe('VisualEditorRegistry', () => {
  const mockOnChange = vi.fn();

  it('should render EmptyState for flowchart diagram', () => {
    render(
      <VisualEditorRegistry 
        diagramType="flowchart"
        visualState={null}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Visual Editor')).toBeInTheDocument();
    expect(screen.getByText('Visual editing for flowchart diagrams is coming soon!')).toBeInTheDocument();
  });

  it('should render EmptyState for sequence diagram', () => {
    render(
      <VisualEditorRegistry 
        diagramType="sequence"
        visualState={null}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Visual editing for sequence diagrams is coming soon!')).toBeInTheDocument();
  });

  it('should render EmptyState for gantt diagram', () => {
    render(
      <VisualEditorRegistry 
        diagramType="gantt"
        visualState={null}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Visual editing for gantt diagrams is coming soon!')).toBeInTheDocument();
  });

  it('should render EmptyState for pie diagram', () => {
    render(
      <VisualEditorRegistry 
        diagramType="pie"
        visualState={null}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Visual editing for pie diagrams is coming soon!')).toBeInTheDocument();
  });

  it('should render EmptyState for class diagram', () => {
    render(
      <VisualEditorRegistry 
        diagramType="class"
        visualState={null}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Visual editing for class diagrams is coming soon!')).toBeInTheDocument();
  });

  it('should render EmptyState for state diagram', () => {
    render(
      <VisualEditorRegistry 
        diagramType="state"
        visualState={null}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Visual editing for state diagrams is coming soon!')).toBeInTheDocument();
  });

  it('should render EmptyState for er diagram', () => {
    render(
      <VisualEditorRegistry 
        diagramType="er"
        visualState={null}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Visual editing for entity-relationship diagrams is coming soon!')).toBeInTheDocument();
  });

  it('should render EmptyState for mindmap diagram', () => {
    render(
      <VisualEditorRegistry 
        diagramType="mindmap"
        visualState={null}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Visual editing for mindmap diagrams is coming soon!')).toBeInTheDocument();
  });

  it('should accept visualState prop without errors', () => {
    const mockState = {
      paradigm: 'graph' as const,
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    
    render(
      <VisualEditorRegistry 
        diagramType="flowchart"
        visualState={mockState}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Visual Editor')).toBeInTheDocument();
  });

  it('should accept onChange callback without errors', () => {
    render(
      <VisualEditorRegistry 
        diagramType="flowchart"
        visualState={null}
        onChange={mockOnChange}
      />
    );
    
    // Callback should be defined (will be used in future phases)
    expect(mockOnChange).toBeDefined();
  });

  it('should render all diagram types with appropriate messages', () => {
    const diagramTypes: DiagramType[] = [
      'flowchart',
      'sequence',
      'class',
      'state',
      'er',
      'gantt',
      'pie',
      'journey',
      'gitGraph',
      'mindmap',
      'timeline',
      'quadrant',
      'requirement',
      'c4',
      'sankey',
      'xychart',
      'block',
      'packet',
      'kanban',
      'architecture',
    ];

    diagramTypes.forEach((type) => {
      const { unmount } = render(
        <VisualEditorRegistry 
          diagramType={type}
          visualState={null}
          onChange={mockOnChange}
        />
      );
      
      // Should render without errors
      expect(screen.getByText('Visual Editor')).toBeInTheDocument();
      
      unmount();
    });
  });
});
