# Visual Editor PRD: Universal Mermaid Diagram Editor

## Executive Summary

Transform the current text-based `mermaid-editor` into a **Universal Visual Editor Platform** that replicates and exceeds [MermaidChart](https://www.mermaidchart.com/play) capabilities while maintaining our client-side-only architecture. This is not merely adding drag-and-drop to flowcharts—it's building a **multi-paradigm visual platform** where each diagram type gets its purpose-built interaction model.

**Status**: Research Phase  
**Target**: Phased rollout starting Q1 2025  
**Complexity**: High (6-12 month effort)

---

## Vision & Strategic Positioning

### Core Philosophy

Different diagrams require fundamentally different visual editors:
- **Flowcharts** need a 2D graph canvas (node-link manipulation)
- **Gantt charts** need a scheduler (timeline-based editing)
- **Sequence diagrams** need rail-based editing (constrained vertical lifelines)
- **Pie charts** need data tables/forms (value-driven editing)

We are building **4 distinct editing paradigms** unified under one platform.

### Competitive Advantage

1. **Client-Side First**: No account required, works offline, privacy-first
2. **Two-Way Sync**: Seamless text ↔ visual editing (our differentiator)
3. **Open Source**: MIT license, extensible architecture
4. **Progressive Enhancement**: Text editor always works, visual is enhancement

---

## Research Findings

### 1. Mermaid Parsing Capabilities

**Key Discoveries:**

```typescript
// Mermaid provides multiple parsing layers:

// 1. High-level API (mermaidAPI.parse)
const result = await mermaid.parse(text);
// Returns: { diagramType: 'flowchart-v2', config: {...} }

// 2. Diagram-specific parsers
// - JISON parsers (legacy): flowchart, sequence, gantt, etc.
// - Langium parsers (modern): pie, architecture, packet, info, radar, treemap
import { parse } from '@mermaid-js/parser';
const ast: Pie = await parse('pie', text);

// 3. Internal diagram DB
const diagram = await Diagram.fromText(text);
diagram.db // Access to parsed data structures
```

**Challenges Identified:**

1. **Lossy Parsing**: Mermaid parsers prioritize rendering, not round-tripping
   - Comments are stripped during parsing
   - Whitespace/formatting lost
   - Custom positions/metadata often ignored

2. **Heterogeneous Architecture**:
   - Old diagrams use JISON (flowchart, sequence, gantt)
   - New diagrams use Langium (pie, architecture)
   - Each has different AST structure

3. **Position Data**:
   - Most diagrams use auto-layout (dagre, elk)
   - Only some support manual positioning (limited syntax)
   - No standard "position" field in AST

**Proposed Solution: Hybrid Strategy**

```typescript
// Strategy 1: Metadata Injection (Preferred)
// Store visual-only data in comments
flowchart TD
    A[Node A] %%{"x":100,"y":50,"color":"#ff0000"}%%
    B[Node B] %%{"x":300,"y":50}%%

// Strategy 2: External Position Store (Fallback)
// Keep positions in localStorage keyed by node ID hash
const positionStore = {
  "flowchart-node-A-hash": { x: 100, y: 50 },
  "flowchart-node-B-hash": { x: 300, y: 50 }
}

// Strategy 3: Lossy Mode (Last Resort)
// Accept that visual → text → visual loses some data
// Warn user when switching modes
```

### 2. React Flow/XYFlow Evaluation

**Capabilities:**

✅ **Strengths:**
- Mature (34.2K GitHub stars, 3.11M weekly installs)
- Highly customizable nodes (React components)
- Built-in features: dragging, zooming, panning, multi-select
- Excellent plugin ecosystem: MiniMap, Controls, Background
- TypeScript-first, well-documented
- Used by Stripe, Typeform, Zapier

✅ **Key APIs:**
```typescript
import { ReactFlow, useNodesState, useEdgesState, addEdge } from '@xyflow/react';

// Controlled state management
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

// Node structure matches our needs
type Node = {
  id: string;
  type: string; // 'default' | 'input' | 'output' | custom
  position: { x: number; y: number };
  data: { label: string; [key: string]: any };
  style?: CSSProperties;
  // ... extensible
};
```

⚠️ **Considerations:**
- Primarily designed for flowchart-style graphs
- Would need custom components for sequence/gantt paradigms
- Bundle size: ~150KB (acceptable for our use case)

**Decision: React Flow for Graph Paradigm (Group A)**

### 3. Diagram Paradigm Grouping

Based on interaction model research:

#### **Group A: Graph Canvas (Node-Link)**
Diagrams: Flowchart, State, Class, ER, Mindmap  
Engine: **React Flow**  
Interaction: Infinite 2D canvas, drag nodes, connect edges

```typescript
// Example node structure
{
  id: 'nodeA',
  type: 'flowchart-decision', // maps to Mermaid shapes
  position: { x: 100, y: 50 },
  data: {
    label: 'Is valid?',
    shape: 'diamond', // Mermaid-specific
    styling: { fill: '#ff0', stroke: '#000' }
  }
}
```

#### **Group B: Rail System (Constrained Layout)**
Diagrams: Sequence  
Engine: **Custom Component**  
Interaction: Fixed horizontal actors, vertical lifelines, draggable messages

```typescript
// Data structure
{
  actors: [
    { id: 'alice', label: 'Alice', position: 0 },
    { id: 'bob', label: 'Bob', position: 1 }
  ],
  messages: [
    {
      id: 'msg1',
      from: 'alice',
      to: 'bob',
      label: 'Hello',
      verticalPosition: 100 // Y-axis only
    }
  ]
}
```

#### **Group C: Timeline (Scheduler)**
Diagrams: Gantt, Timeline, User Journey  
Engine: **Custom Component** (consider `react-big-calendar` or `gantt-task-react`)  
Interaction: Horizontal bars on time axis, drag to adjust dates

```typescript
// Data structure
{
  tasks: [
    {
      id: 'task1',
      name: 'Design',
      start: '2024-01-01',
      end: '2024-01-15',
      dependencies: []
    }
  ]
}
```

#### **Group D: Data-Driven (Table/Form)**
Diagrams: Pie, Quadrant, Requirement, GitGraph  
Engine: **Form Components** (shadcn/ui Table + Form)  
Interaction: Spreadsheet-like editing

```typescript
// Pie chart data
{
  title: 'Market Share',
  slices: [
    { label: 'Product A', value: 45 },
    { label: 'Product B', value: 30 },
    { label: 'Product C', value: 25 }
  ]
}
```

---

## Architecture Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│  (Central State Hub - all useLocalStorage calls)           │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──► code: string (Mermaid text)
             ├──► editMode: 'text' | 'visual'
             ├──► diagramType: DiagramType
             └──► visualState: Record<DiagramType, any>
                                │
                                ▼
     ┌──────────────────────────────────────────────────┐
     │      VisualEditorRegistry Component              │
     │  (Switches active editor based on diagramType)   │
     └──────────┬───────────────────────────────────────┘
                │
                ├─► Group A: <GraphCanvasEditor />
                │             (React Flow)
                │
                ├─► Group B: <SequenceRailEditor />
                │             (Custom)
                │
                ├─► Group C: <TimelineSchedulerEditor />
                │             (Custom)
                │
                └─► Group D: <DataTableEditor />
                              (shadcn/ui)

                 ┌──────────────────────┐
                 │  MermaidASTService   │
                 │  (Parsing Layer)     │
                 └──────────┬───────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
         Text → JSON              JSON → Text
    (parse code into           (generate Mermaid
     standardized AST)          syntax from AST)
```

### Core Services

#### 1. MermaidASTService

**Purpose**: Parse Mermaid text into a standardized, editor-friendly JSON format

```typescript
// src/lib/visual-editor/MermaidASTService.ts

interface MermaidASTService {
  // Parse text to AST
  parse(diagramType: DiagramType, code: string): Promise<DiagramAST>;
  
  // Generate text from AST
  generate(diagramType: DiagramType, ast: DiagramAST): Promise<string>;
  
  // Validate AST structure
  validate(ast: DiagramAST): ValidationResult;
}

// Standardized AST format (paradigm-specific)
type GraphAST = {
  paradigm: 'graph';
  nodes: Array<{
    id: string;
    label: string;
    shape: MermaidShape;
    position?: { x: number; y: number }; // Optional: from metadata
    styling?: StyleProps;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    type: EdgeType; // solid, dotted, arrow, etc.
  }>;
  metadata: {
    direction?: 'TD' | 'LR' | 'BT' | 'RL';
    theme?: string;
  };
};
```

**Implementation Strategy:**

```typescript
// Parser registry pattern
const parsers: Record<DiagramType, Parser> = {
  'flowchart': new FlowchartParser(),
  'sequence': new SequenceParser(),
  'gantt': new GanttParser(),
  // ... etc
};

class FlowchartParser implements Parser {
  async parse(code: string): Promise<GraphAST> {
    // 1. Use mermaid's internal parser
    const diagram = await Diagram.fromText(`flowchart TD\n${code}`);
    
    // 2. Extract data from diagram.db
    const nodes = diagram.db.getVertices(); // Mermaid internal API
    const edges = diagram.db.getEdges();
    
    // 3. Parse metadata comments for positions
    const positions = this.extractPositionMetadata(code);
    
    // 4. Build standardized AST
    return {
      paradigm: 'graph',
      nodes: nodes.map(n => ({
        id: n.id,
        label: n.text,
        shape: n.type,
        position: positions[n.id],
        styling: n.styles
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.start,
        target: e.end,
        label: e.text,
        type: e.stroke
      })),
      metadata: {
        direction: diagram.db.getDirection()
      }
    };
  }
  
  async generate(ast: GraphAST): Promise<string> {
    let code = `flowchart ${ast.metadata.direction || 'TD'}\n`;
    
    // Generate nodes
    ast.nodes.forEach(node => {
      const shape = this.shapeToMermaidSyntax(node.shape);
      code += `    ${node.id}${shape[0]}${node.label}${shape[1]}`;
      
      // Inject position metadata as comment
      if (node.position) {
        code += ` %%${JSON.stringify(node.position)}%%`;
      }
      code += '\n';
    });
    
    // Generate edges
    ast.edges.forEach(edge => {
      const connector = this.edgeTypeToConnector(edge.type);
      code += `    ${edge.source} ${connector}`;
      if (edge.label) code += `|${edge.label}|`;
      code += ` ${edge.target}\n`;
    });
    
    return code;
  }
}
```

#### 2. SyncEngine

**Purpose**: Manage bidirectional synchronization between text and visual states

```typescript
// src/lib/visual-editor/SyncEngine.ts

class SyncEngine {
  private lastCodeHash: string = '';
  private lastVisualHash: string = '';
  
  async syncCodeToVisual(
    code: string,
    diagramType: DiagramType
  ): Promise<VisualState | null> {
    const codeHash = this.hash(code);
    
    // Skip if unchanged
    if (codeHash === this.lastCodeHash) return null;
    
    try {
      const ast = await astService.parse(diagramType, code);
      this.lastCodeHash = codeHash;
      return this.astToVisualState(ast, diagramType);
    } catch (error) {
      // Code is invalid - return null to disable visual editing
      return null;
    }
  }
  
  async syncVisualToCode(
    visualState: VisualState,
    diagramType: DiagramType
  ): Promise<string> {
    const visualHash = this.hash(JSON.stringify(visualState));
    
    const ast = this.visualStateToAst(visualState, diagramType);
    const code = await astService.generate(diagramType, ast);
    
    this.lastVisualHash = visualHash;
    return code;
  }
  
  private hash(data: string): string {
    // Simple hash for change detection
    return btoa(data).slice(0, 16);
  }
}
```

#### 3. VisualEditorRegistry

**Purpose**: Route to the correct editor based on diagram type

```typescript
// src/components/visual-editor/VisualEditorRegistry.tsx

import { GraphCanvasEditor } from './graph/GraphCanvasEditor';
import { SequenceRailEditor } from './sequence/SequenceRailEditor';
import { TimelineSchedulerEditor } from './timeline/TimelineSchedulerEditor';
import { DataTableEditor } from './data/DataTableEditor';

const EDITOR_MAP: Record<DiagramType, EditorComponent> = {
  // Group A: Graph Canvas
  'flowchart': GraphCanvasEditor,
  'state': GraphCanvasEditor,
  'class': GraphCanvasEditor,
  'er': GraphCanvasEditor,
  'mindmap': GraphCanvasEditor,
  
  // Group B: Rail System
  'sequence': SequenceRailEditor,
  
  // Group C: Timeline
  'gantt': TimelineSchedulerEditor,
  'timeline': TimelineSchedulerEditor,
  'journey': TimelineSchedulerEditor,
  
  // Group D: Data-Driven
  'pie': DataTableEditor,
  'quadrant': DataTableEditor,
  'requirement': DataTableEditor,
  'git': DataTableEditor,
};

export const VisualEditorRegistry: React.FC<{
  diagramType: DiagramType;
  visualState: VisualState;
  onChange: (newState: VisualState) => void;
}> = ({ diagramType, visualState, onChange }) => {
  const EditorComponent = EDITOR_MAP[diagramType];
  
  if (!EditorComponent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Visual editing not yet supported for {diagramType} diagrams
        </p>
      </div>
    );
  }
  
  return (
    <EditorComponent
      state={visualState}
      onChange={onChange}
      diagramType={diagramType}
    />
  );
};
```

---

## State Management Strategy

### Current Architecture (Preserved)

```typescript
// App.tsx - Single source of truth
const [code, setCode] = useLocalStorage('mermaid-code', DEFAULT_CODE);
const [config, setConfig] = useLocalStorage('mermaid-config', DEFAULT_CONFIG);
```

### New State (Added to App.tsx)

```typescript
// App.tsx additions
const [editMode, setEditMode] = useLocalStorage<'text' | 'visual'>(
  'edit-mode',
  'text'
);

// Store visual state per diagram type
// This allows switching diagrams without losing visual work
const [visualStates, setVisualStates] = useLocalStorage<
  Partial<Record<DiagramType, VisualState>>
>('visual-states', {});

// Computed current visual state
const currentVisualState = visualStates[diagramType];
```

### State Flow Diagram

```
User Action: Edit in Visual Mode
              │
              ▼
   VisualEditor updates local state
              │
              ▼
   onChange(newVisualState) fired
              │
              ▼
   SyncEngine.syncVisualToCode(newVisualState)
              │
              ▼
   setCode(newCode) ◄─── Updates both localStorage and DiagramPreview
              │
              ▼
   setVisualStates({ ...visualStates, [diagramType]: newVisualState })
              │
              ▼
   Both editors stay in sync
```

---

## User Experience Design

### 1. Mode Switching

```tsx
// Toolbar addition
<ToggleGroup type="single" value={editMode} onValueChange={setEditMode}>
  <ToggleGroupItem value="text" aria-label="Text editor">
    <Code weight="duotone" />
    <span>Code</span>
  </ToggleGroupItem>
  <ToggleGroupItem value="visual" aria-label="Visual editor">
    <Cursor weight="duotone" />
    <span>Visual</span>
  </ToggleGroupItem>
</ToggleGroup>
```

**Behavior:**
- Default to `text` mode (current behavior)
- Show visual mode button with badge "BETA" initially
- Disable visual button if diagram type unsupported
- Smooth transition animation when switching

### 2. Layout Options

**Option A: Split View (Recommended)**
```
┌─────────────────────────────────────────────┐
│  [Code] [Visual] [Preview]    Toolbar      │
├──────────────┬──────────────┬───────────────┤
│              │              │               │
│   Monaco     │   React      │   Mermaid     │
│   Editor     │   Flow       │   SVG         │
│              │   Canvas     │   Preview     │
│              │              │               │
└──────────────┴──────────────┴───────────────┘
```

**Option B: Tabbed View**
```
┌─────────────────────────────────────────────┐
│  ● Code  ○ Visual  ● Preview    Toolbar    │
├─────────────────────────────────────────────┤
│                                             │
│            Active Tab Content               │
│                                             │
└─────────────────────────────────────────────┘
```

**Decision: Start with Option B (Tabbed), Add Option A in Phase 2**
- Simpler implementation
- Less cognitive load for initial users
- Can detect user preference and make split-view opt-in

### 3. Error Handling

```tsx
// Visual editor error states
{editMode === 'visual' && !currentVisualState && (
  <Alert variant="warning">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Visual editing unavailable</AlertTitle>
    <AlertDescription>
      The code contains syntax errors. Fix them in the code editor to enable visual editing.
    </AlertDescription>
  </Alert>
)}
```

### 4. Lossy Mode Warning

```tsx
// Show when switching from text → visual → text might lose data
{showLossyWarning && (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Formatting may be lost</AlertTitle>
    <AlertDescription>
      Switching to visual mode will reformat your code. Comments and custom spacing may be lost.
      <Button variant="ghost" onClick={dismissWarning}>I understand</Button>
    </AlertDescription>
  </Alert>
)}
```

---

## Technical Specifications

### Dependencies

```json
{
  "dependencies": {
    "@xyflow/react": "^12.3.0",  // React Flow for graph editing
    "@mermaid-js/parser": "^0.3.0", // Access to Langium parsers
    "dagre": "^0.8.5",            // Auto-layout algorithm
    "elkjs": "^0.9.0"             // Alternative layout engine
  }
}
```

### File Structure

```
src/
├── components/
│   ├── visual-editor/
│   │   ├── VisualEditorRegistry.tsx       # Router component
│   │   ├── graph/
│   │   │   ├── GraphCanvasEditor.tsx      # React Flow wrapper
│   │   │   ├── nodes/
│   │   │   │   ├── FlowchartNode.tsx
│   │   │   │   ├── StateNode.tsx
│   │   │   │   └── ClassNode.tsx
│   │   │   └── edges/
│   │   │       └── CustomEdge.tsx
│   │   ├── sequence/
│   │   │   └── SequenceRailEditor.tsx
│   │   ├── timeline/
│   │   │   └── TimelineSchedulerEditor.tsx
│   │   └── data/
│   │       └── DataTableEditor.tsx
├── lib/
│   ├── visual-editor/
│   │   ├── MermaidASTService.ts           # Parsing service
│   │   ├── SyncEngine.ts                  # Bidirectional sync
│   │   ├── parsers/
│   │   │   ├── FlowchartParser.ts
│   │   │   ├── SequenceParser.ts
│   │   │   └── GanttParser.ts
│   │   └── generators/
│   │       ├── FlowchartGenerator.ts
│   │       └── SequenceGenerator.ts
├── types/
│   └── visual-editor.ts                   # Type definitions
└── hooks/
    ├── use-visual-editor.ts               # Main hook
    └── use-sync-engine.ts                 # Sync hook
```

### Type Definitions

```typescript
// src/types/visual-editor.ts

export type EditMode = 'text' | 'visual';

export type DiagramParadigm = 'graph' | 'rail' | 'timeline' | 'data';

export type VisualState = GraphVisualState | RailVisualState | TimelineVisualState | DataVisualState;

export interface GraphVisualState {
  paradigm: 'graph';
  nodes: VisualNode[];
  edges: VisualEdge[];
  viewport: { x: number; y: number; zoom: number };
}

export interface VisualNode {
  id: string;
  type: string; // Maps to Mermaid shape
  position: { x: number; y: number };
  data: {
    label: string;
    shape: MermaidShape;
    styling?: StyleProps;
  };
}

export interface VisualEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: EdgeType;
  animated?: boolean;
}

export type MermaidShape = 
  | 'rectangle'
  | 'rounded'
  | 'stadium'
  | 'subroutine'
  | 'cylindrical'
  | 'circle'
  | 'asymmetric'
  | 'rhombus'
  | 'hexagon'
  | 'parallelogram'
  | 'parallelogram_alt'
  | 'trapezoid'
  | 'trapezoid_alt'
  | 'double_circle';

export interface MermaidASTService {
  parse(diagramType: DiagramType, code: string): Promise<VisualState | null>;
  generate(diagramType: DiagramType, state: VisualState): Promise<string>;
  validate(state: VisualState): ValidationResult;
}

export interface SyncEngineOptions {
  debounceMs?: number;
  preserveFormatting?: boolean;
  strictMode?: boolean; // Fail on lossy conversions
}
```

---

## Security & Privacy Considerations

### Data Handling

✅ **Maintained Constraints:**
- All processing remains client-side
- No diagram data sent to external servers
- localStorage only (user-controlled)

⚠️ **New Considerations:**
- Visual state can be significantly larger than text
- Monitor localStorage quota usage
- Implement cleanup for old diagram states

```typescript
// Quota management
const STORAGE_LIMIT_MB = 5;

function checkStorageQuota() {
  const used = new Blob(Object.values(localStorage)).size;
  const usedMB = used / 1024 / 1024;
  
  if (usedMB > STORAGE_LIMIT_MB) {
    // Cleanup old visual states
    cleanupOldVisualStates();
  }
}
```

### Performance

**Target Metrics:**
- Visual editor load time: < 500ms
- Node drag latency: < 16ms (60fps)
- Text ↔ Visual sync: < 100ms

**Optimization Strategies:**
- Lazy load React Flow and editor components
- Debounce visual → text sync (300ms)
- Virtual rendering for large diagrams (>100 nodes)

---

## Testing Strategy

### Unit Tests

```typescript
// src/lib/visual-editor/MermaidASTService.test.ts

describe('FlowchartParser', () => {
  it('should parse simple flowchart to AST', async () => {
    const code = `
      flowchart TD
          A[Start] --> B[Process]
          B --> C[End]
    `;
    
    const ast = await parser.parse('flowchart', code);
    
    expect(ast.nodes).toHaveLength(3);
    expect(ast.nodes[0]).toMatchObject({
      id: 'A',
      label: 'Start',
      shape: 'rectangle'
    });
  });
  
  it('should preserve metadata in comments', async () => {
    const code = `
      flowchart TD
          A[Start] %%{"x":100,"y":50}%%
    `;
    
    const ast = await parser.parse('flowchart', code);
    expect(ast.nodes[0].position).toEqual({ x: 100, y: 50 });
  });
  
  it('should round-trip without data loss', async () => {
    const originalCode = `flowchart LR\n    A --> B`;
    const ast = await parser.parse('flowchart', originalCode);
    const generated = await parser.generate('flowchart', ast);
    const ast2 = await parser.parse('flowchart', generated);
    
    expect(ast).toEqual(ast2);
  });
});
```

### Integration Tests

```typescript
// tests/e2e/visual-editor.spec.ts

test('should sync visual changes to text editor', async ({ page }) => {
  await page.goto('/');
  
  // Enter flowchart code
  await page.locator('.monaco-editor').fill(`
    flowchart TD
        A --> B
  `);
  
  // Switch to visual mode
  await page.click('button:has-text("Visual")');
  
  // Drag node A
  const nodeA = page.locator('[data-id="A"]');
  await nodeA.dragTo(page.locator('body'), {
    targetPosition: { x: 500, y: 300 }
  });
  
  // Switch back to text mode
  await page.click('button:has-text("Code")');
  
  // Verify position metadata in code
  const code = await page.locator('.monaco-editor').inputValue();
  expect(code).toContain('%%{"x":500,"y":300}%%');
});
```

### Visual Regression Tests

```typescript
// Use Playwright's screenshot comparison
test('graph canvas renders correctly', async ({ page }) => {
  await page.goto('/?visual=true&diagram=flowchart');
  await page.click('button:has-text("Visual")');
  
  await expect(page.locator('.react-flow')).toHaveScreenshot('flowchart-visual.png');
});
```

---

## Rollout Plan

### Phase 0: Foundation (Month 1-2)
**Goal**: Setup infrastructure without breaking existing features

- [ ] Create `visual-editor` directory structure
- [ ] Implement `MermaidASTService` skeleton
- [ ] Add `editMode` state to App.tsx
- [ ] Create `VisualEditorRegistry` component
- [ ] Setup React Flow dependency
- [ ] Create ADR documenting architecture decisions

**Success Criteria**: Can toggle visual mode (shows empty canvas)

### Phase 1: Flowchart MVP (Month 3-4)
**Goal**: Ship first working visual editor for most popular diagram

- [ ] Implement `FlowchartParser`
- [ ] Create `GraphCanvasEditor` with React Flow
- [ ] Support basic shapes: rectangle, diamond, circle
- [ ] Enable node dragging with position persistence
- [ ] Implement visual → text sync
- [ ] Add edge editing (create/delete connections)

**Success Criteria**: Can create simple flowcharts visually

### Phase 2: Graph Family Expansion (Month 5-6)
**Goal**: Extend graph canvas to all Group A diagrams

- [ ] State diagram support
- [ ] Class diagram support (with member editing)
- [ ] ER diagram support (with cardinality)
- [ ] Mindmap support
- [ ] Auto-layout integration (dagre/elk)

**Success Criteria**: All graph-based diagrams editable visually

### Phase 3: Sequence Diagrams (Month 7-8)
**Goal**: Build custom rail editor for sequence diagrams

- [ ] Implement `SequenceRailEditor` component
- [ ] Actor management (add/remove/reorder)
- [ ] Message dragging between lifelines
- [ ] Fragment support (alt/loop/opt boxes)
- [ ] Activation box editing

**Success Criteria**: Can create complex sequence diagrams visually

### Phase 4: Timeline Diagrams (Month 9-10)
**Goal**: Build scheduler interface for Gantt/Timeline

- [ ] Implement `TimelineSchedulerEditor`
- [ ] Task bar dragging (adjust dates)
- [ ] Dependency arrows
- [ ] Milestone support
- [ ] User journey variant

**Success Criteria**: Can plan projects with Gantt charts visually

### Phase 5: Data-Driven Diagrams (Month 11-12)
**Goal**: Table/form editors for remaining diagrams

- [ ] Implement `DataTableEditor`
- [ ] Pie chart slice editing
- [ ] Quadrant point placement
- [ ] Requirement matrix editing
- [ ] Git graph branch management

**Success Criteria**: All diagram types supported

### Phase 6: Polish & Production (Month 12+)
**Goal**: Production-ready quality

- [ ] Performance optimization (virtual rendering)
- [ ] Comprehensive error handling
- [ ] Accessibility audit (keyboard navigation)
- [ ] Documentation and tutorials
- [ ] User feedback collection
- [ ] Analytics integration (anonymized usage patterns)

---

## Open Questions & Risks

### Open Questions

1. **Position Persistence Strategy**
   - **Question**: Use metadata comments vs external store?
   - **Recommendation**: Hybrid - prefer metadata, fallback to external
   - **Decision Needed By**: End of Month 1

2. **Auto-Layout Toggle**
   - **Question**: Allow users to disable auto-layout and use manual positions?
   - **Recommendation**: Yes, add toggle in Toolbar
   - **Decision Needed By**: Phase 1 design

3. **Multi-User Collaboration**
   - **Question**: Future support for real-time collaboration?
   - **Recommendation**: Out of scope for v1, but design state structure to be sync-friendly
   - **Decision Needed By**: Architecture phase

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Mermaid parser API changes | High | Medium | Pin to specific version, abstract parsing layer |
| React Flow bundle size | Medium | Low | Lazy load, code split by diagram type |
| Performance with large diagrams (>100 nodes) | High | High | Implement virtual rendering, pagination |
| localStorage quota exceeded | Medium | Medium | Quota management, cleanup old states |
| Lossy text→visual conversion | High | High | Clear user warnings, preserve original as backup |

### Product Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User confusion with dual editors | Medium | Medium | Clear mode indicators, onboarding tooltips |
| Preference for text-only workflow | Low | Medium | Always keep text editor as default/fallback |
| Feature parity with MermaidChart | Medium | Low | Phased rollout, focus on core workflows first |

---

## Success Metrics

### Adoption Metrics
- **Primary**: % of sessions using visual mode (target: 30% by Month 6)
- Visual mode toggle clicks per session
- Avg time spent in visual vs text mode

### Quality Metrics
- Visual editor load time < 500ms
- Sync latency < 100ms
- Crash-free rate > 99.9%

### User Satisfaction
- GitHub stars growth rate
- Issue reports related to visual editor
- User feedback sentiment (via optional survey)

---

## Appendix

### A. MermaidChart Feature Comparison

| Feature | MermaidChart | Our Plan | Notes |
|---------|--------------|----------|-------|
| Flowchart visual editing | ✅ | ✅ Phase 1 | React Flow |
| Sequence diagram visual | ✅ | ✅ Phase 3 | Custom component |
| Gantt visual | ✅ | ✅ Phase 4 | Custom component |
| Class diagram visual | ✅ | ✅ Phase 2 | React Flow + custom nodes |
| ER diagram visual | ✅ | ✅ Phase 2 | React Flow |
| State diagram visual | ✅ | ✅ Phase 2 | React Flow |
| Auto-layout | ✅ | ✅ Phase 2 | dagre/elk |
| Real-time collaboration | ✅ | ❌ | Out of scope |
| Cloud storage | ✅ | ❌ | Client-side only |
| AI diagram generation | ✅ | ❌ | Out of scope |
| Version history | ✅ | ❌ | Future consideration |
| Team features | ✅ | ❌ | Not applicable |

### B. React Flow vs Alternatives

| Library | Stars | License | Pros | Cons | Decision |
|---------|-------|---------|------|------|----------|
| React Flow | 34.2K | MIT | Mature, well-documented, TypeScript | Bundle size | ✅ Selected |
| Cytoscape | 10K | LGPL | Powerful, graph theory | Complex API | ❌ |
| JointJS | 4.5K | MPL 2.0 | Feature-rich | Commercial license for full features | ❌ |
| GoJS | N/A | Commercial | Professional | Not open source | ❌ |
| Reaflow | 2K | Apache 2.0 | Simpler than React Flow | Less mature | ❌ |

### C. References

- [Mermaid.js Documentation](https://mermaid.js.org/)
- [Mermaid Parser Package](https://github.com/mermaid-js/mermaid/tree/develop/packages/parser)
- [React Flow Documentation](https://reactflow.dev/)
- [Langium Documentation](https://langium.org/)
- [MermaidChart Live Editor](https://www.mermaidchart.com/play)
- [Diagram.fromText API](https://github.com/mermaid-js/mermaid/blob/develop/packages/mermaid/src/Diagram.ts)

---

**Document Version**: 1.0  
**Last Updated**: December 13, 2024  
**Authors**: Product Architecture Team  
**Status**: For Review
