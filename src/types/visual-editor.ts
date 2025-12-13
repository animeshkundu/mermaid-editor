/**
 * Visual Editor Type Definitions
 * 
 * This file contains all TypeScript types for the visual editor system.
 * These types define the data structures for visual editing state, nodes, edges,
 * and the interaction between text and visual modes.
 */

/**
 * Edit mode for the application
 * - 'text': Traditional text-based editing with Monaco editor
 * - 'visual': Visual drag-and-drop editing interface
 */
export type EditMode = 'text' | 'visual';

/**
 * Diagram paradigm categories for visual editing
 * Different paradigms require different editor implementations
 * 
 * - 'graph': Node-graph based diagrams (flowchart, state, class, er, mindmap)
 * - 'rail': Rail-based diagrams with constrained lifelines (sequence)
 * - 'timeline': Timeline-based diagrams (gantt, timeline, user journey)
 * - 'data': Data-driven diagrams with forms/tables (pie, quadrant, requirement)
 */
export type DiagramParadigm = 'graph' | 'rail' | 'timeline' | 'data';

/**
 * Viewport state for pan and zoom functionality
 */
export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

/**
 * Visual state for graph-based diagrams
 * Used for flowchart, state, class, ER, and mindmap diagrams
 */
export type GraphVisualState = {
  paradigm: 'graph';
  nodes: VisualNode[];
  edges: VisualEdge[];
  viewport: Viewport;
};

/**
 * Visual state for rail-based diagrams
 * Used for sequence diagrams with constrained lifelines
 */
export type RailVisualState = {
  paradigm: 'rail';
  participants: Participant[];
  messages: Message[];
  viewport: Viewport;
};

/**
 * Visual state for timeline-based diagrams
 * Used for gantt, timeline, and user journey diagrams
 */
export type TimelineVisualState = {
  paradigm: 'timeline';
  items: TimelineItem[];
  viewport: Viewport;
};

/**
 * Visual state for data-driven diagrams
 * Used for pie, quadrant, and requirement diagrams
 */
export type DataVisualState = {
  paradigm: 'data';
  dataset: DataRow[];
  config: Record<string, unknown>;
  viewport: Viewport;
};

/**
 * Union type for all visual state variants
 * Each diagram paradigm has its own state structure
 */
export type VisualState =
  | GraphVisualState
  | RailVisualState
  | TimelineVisualState
  | DataVisualState;

/**
 * Visual node for graph-based diagrams
 * Represents a single node/vertex with position, label, and shape
 */
export type VisualNode = {
  /** Unique identifier for the node (e.g., 'A', 'B', 'start') */
  id: string;
  
  /** Display label for the node */
  label: string;
  
  /** X coordinate position on canvas */
  x: number;
  
  /** Y coordinate position on canvas */
  y: number;
  
  /** Shape type using Mermaid shape conventions */
  shape: MermaidShape;
  
  /** Optional width (auto-calculated if not specified) */
  width?: number;
  
  /** Optional height (auto-calculated if not specified) */
  height?: number;
  
  /** Optional custom styling */
  style?: NodeStyle;
  
  /** Optional metadata for extensibility */
  metadata?: Record<string, unknown>;
};

/**
 * Visual edge for graph-based diagrams
 * Represents a connection/link between two nodes
 */
export type VisualEdge = {
  /** Unique identifier for the edge */
  id: string;
  
  /** Source node ID */
  source: string;
  
  /** Target node ID */
  target: string;
  
  /** Optional edge label */
  label?: string;
  
  /** Edge connector type (solid, dotted, thick, open) */
  type: EdgeType;
  
  /** Optional custom styling */
  style?: EdgeStyle;
  
  /** Optional metadata for extensibility */
  metadata?: Record<string, unknown>;
};

/**
 * Mermaid shape types
 * Maps to Mermaid's shape syntax (rectangle, rhombus, circle, etc.)
 */
export type MermaidShape =
  | 'rectangle'      // [text]
  | 'rounded'        // (text)
  | 'stadium'        // ([text])
  | 'subroutine'     // [[text]]
  | 'cylindrical'    // [(text)]
  | 'circle'         // ((text))
  | 'asymmetric'     // >text]
  | 'rhombus'        // {text}
  | 'hexagon'        // {{text}}
  | 'parallelogram'  // [/text/]
  | 'parallelogram-alt' // [\text\]
  | 'trapezoid'      // [/text\]
  | 'trapezoid-alt'  // [\text/]
  | 'double-circle'; // (((text)))

/**
 * Edge connector types
 * Maps to Mermaid's edge syntax (-->, -.-->, etc.)
 */
export type EdgeType =
  | 'solid'    // -->
  | 'dotted'   // -.->
  | 'thick'    // ==>
  | 'open';    // ---

/**
 * Node styling options
 */
export type NodeStyle = {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  color?: string;
  fontSize?: number;
};

/**
 * Edge styling options
 */
export type EdgeStyle = {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  color?: string;
};

/**
 * Participant for sequence diagrams (rail paradigm)
 */
export type Participant = {
  id: string;
  label: string;
  x: number; // Horizontal position on rail
  type?: 'participant' | 'actor';
};

/**
 * Message for sequence diagrams (rail paradigm)
 */
export type Message = {
  id: string;
  from: string;
  to: string;
  label: string;
  y: number; // Vertical position (time)
  type: 'solid' | 'dotted' | 'async' | 'reply';
  activation?: boolean;
};

/**
 * Timeline item for timeline-based diagrams
 */
export type TimelineItem = {
  id: string;
  label: string;
  startDate: string;
  endDate?: string;
  category?: string;
  progress?: number;
  y: number; // Vertical position in timeline
};

/**
 * Data row for data-driven diagrams
 */
export type DataRow = {
  id: string;
  label: string;
  value: number;
  category?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Parser result type
 * Returned by diagram parsers when converting text to visual state
 */
export type ParseResult<T extends VisualState = VisualState> = {
  success: boolean;
  state?: T;
  error?: string;
};

/**
 * Generator result type
 * Returned by diagram generators when converting visual state to text
 */
export type GeneratorResult = {
  success: boolean;
  code?: string;
  error?: string;
};

/**
 * Validation result for visual state
 */
export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

/**
 * Validation error details
 */
export type ValidationError = {
  field: string;
  message: string;
  severity: 'error' | 'warning';
};
