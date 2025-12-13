/**
 * VisualEditorRegistry Component
 * 
 * Routes to the appropriate visual editor based on diagram type and paradigm.
 * In Phase 0, shows EmptyState for all diagram types.
 * In future phases, will route to specialized editors (GraphCanvasEditor, etc.)
 */

import { DiagramType, VisualState } from '@/types';
import { EmptyState } from './EmptyState';

export interface VisualEditorRegistryProps {
  /** The type of diagram being edited */
  diagramType: DiagramType;
  /** Current visual state for this diagram */
  visualState: VisualState | null;
  /** Callback when visual state changes */
  onChange: (state: VisualState) => void;
}

/**
 * Registry component that selects the appropriate visual editor
 * based on diagram type and paradigm
 */
export const VisualEditorRegistry = ({
  diagramType,
  visualState,
  onChange,
}: VisualEditorRegistryProps) => {
  // Phase 0: Show empty state for all diagram types
  // Future phases will add routing logic here
  
  const getEmptyMessage = (type: DiagramType): string => {
    const typeNames: Record<DiagramType, string> = {
      flowchart: 'flowchart',
      sequence: 'sequence',
      class: 'class',
      state: 'state',
      er: 'entity-relationship',
      gantt: 'gantt',
      pie: 'pie',
      journey: 'user journey',
      gitGraph: 'git graph',
      mindmap: 'mindmap',
      timeline: 'timeline',
      quadrant: 'quadrant',
      requirement: 'requirement',
      c4: 'C4',
      sankey: 'sankey',
      xychart: 'XY chart',
      block: 'block',
      packet: 'packet',
      kanban: 'kanban',
      architecture: 'architecture',
    };
    
    return `Visual editing for ${typeNames[type]} diagrams is coming soon!`;
  };

  return (
    <EmptyState 
      message={getEmptyMessage(diagramType)}
      title="Visual Editor"
    />
  );
};
