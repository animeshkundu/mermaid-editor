/**
 * VisualEditorRegistry Component
 * 
 * Routes to the appropriate visual editor based on diagram type and paradigm.
 * In Phase 1, supports flowchart diagrams with GraphCanvasEditor.
 * Future phases will add routing logic for other paradigms.
 */

import { DiagramType, VisualState, GraphVisualState } from '@/types';
import { EmptyState } from './EmptyState';
import { GraphCanvasEditor } from './GraphCanvasEditor';

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
  // Phase 1: Support flowchart diagrams
  if (diagramType === 'flowchart') {
    if (!visualState || visualState.paradigm !== 'graph') {
      return (
        <EmptyState 
          message="Loading flowchart visual editor..."
          title="Visual Editor"
        />
      );
    }

    return (
      <GraphCanvasEditor
        state={visualState as GraphVisualState}
        onChange={onChange}
      />
    );
  }

  // Future phases: Add support for other diagram types
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
