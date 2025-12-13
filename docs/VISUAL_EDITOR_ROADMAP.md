# Visual Editor Implementation Roadmap

**Project**: Universal Visual Editor for Mermaid Diagrams  
**Timeline**: 12+ months (Phased rollout)  
**Status**: Planning Phase  
**Last Updated**: December 13, 2024

---

## Overview

This roadmap details the **vertical slicing strategy** for implementing the visual editor platform. Each phase delivers working, user-testable functionality while building toward the complete vision.

### Guiding Principles

1. **Ship Early, Ship Often**: Each phase delivers value
2. **Vertical Slices**: Complete workflows, not horizontal layers
3. **No Breaking Changes**: Text editor always works
4. **Progressive Enhancement**: Visual mode is opt-in
5. **Quality Over Speed**: Each phase must pass tests before next begins

---

## Phase 0: Foundation (Infrastructure)

**Duration**: 2 months (Weeks 1-8)  
**Goal**: Setup architecture without breaking existing features  
**Risk**: Low  
**Deliverable**: Can toggle visual mode (shows empty state)

### Objectives

- [ ] Create directory structure for visual editor
- [ ] Setup dependency infrastructure
- [ ] Implement state management additions to App.tsx
- [ ] Create component skeletons
- [ ] Document architecture decisions

### Tasks

#### Week 1-2: Project Setup

```bash
# Install dependencies
npm install @xyflow/react@^12.3.0
npm install dagre@^0.8.5
npm install elkjs@^0.9.0

# Dev dependencies
npm install -D @types/dagre
```

**Files to Create:**

```
src/
├── components/
│   └── visual-editor/
│       ├── VisualEditorRegistry.tsx       # [NEW] Router component
│       ├── VisualEditorShell.tsx          # [NEW] Layout wrapper
│       └── EmptyState.tsx                 # [NEW] Placeholder
├── lib/
│   └── visual-editor/
│       ├── MermaidASTService.ts           # [NEW] Parser abstraction
│       ├── SyncEngine.ts                  # [NEW] Sync logic
│       └── types.ts                       # [NEW] Type definitions
└── types/
    └── visual-editor.ts                   # [NEW] Public types
```

**Code Snippets:**

```typescript
// src/types/visual-editor.ts
export type EditMode = 'text' | 'visual';

export type DiagramParadigm = 'graph' | 'rail' | 'timeline' | 'data';

export interface VisualState {
  paradigm: DiagramParadigm;
  // ... paradigm-specific data
}

export interface MermaidASTService {
  parse(type: DiagramType, code: string): Promise<VisualState | null>;
  generate(type: DiagramType, state: VisualState): Promise<string>;
}
```

```typescript
// src/components/visual-editor/VisualEditorRegistry.tsx
import { FC } from 'react';
import { DiagramType } from '@/types';
import { EmptyState } from './EmptyState';

interface Props {
  diagramType: DiagramType;
  code: string;
  onChange: (code: string) => void;
}

export const VisualEditorRegistry: FC<Props> = ({ diagramType }) => {
  // Phase 0: Just show empty state
  return (
    <EmptyState 
      message={`Visual editing for ${diagramType} coming soon!`} 
    />
  );
};
```

```typescript
// src/lib/visual-editor/MermaidASTService.ts
export class MermaidASTService {
  async parse(type: DiagramType, code: string): Promise<VisualState | null> {
    // Phase 0: Stub implementation
    console.log('Parsing', type, code);
    return null;
  }
  
  async generate(type: DiagramType, state: VisualState): Promise<string> {
    // Phase 0: Stub implementation
    console.log('Generating', type, state);
    return '';
  }
}

export const astService = new MermaidASTService();
```

#### Week 3-4: State Management Integration

**Modify App.tsx:**

```typescript
// src/App.tsx - ADD THESE IMPORTS
import { VisualEditorRegistry } from '@/components/visual-editor/VisualEditorRegistry';

// src/App.tsx - ADD THESE STATE HOOKS
const [editMode, setEditMode] = useLocalStorage<'text' | 'visual'>(
  'edit-mode',
  'text'
);

const [visualStates, setVisualStates] = useLocalStorage<
  Partial<Record<DiagramType, VisualState>>
>('visual-states', {});

// src/App.tsx - COMPUTED VALUE
const currentVisualState = visualStates[diagramType];
```

**Add to Layout:**

```typescript
// In App.tsx return statement - ADD VISUAL TAB
<ResizablePanelGroup direction={layout}>
  {/* Existing panels */}
  
  {/* NEW: Visual Editor Panel */}
  {editMode === 'visual' && (
    <ResizablePanel defaultSize={33} minSize={20}>
      <div className="h-full border-r">
        <div className="border-b p-2">
          <h3 className="text-sm font-medium">Visual Editor</h3>
        </div>
        <VisualEditorRegistry
          diagramType={diagramType}
          code={code}
          onChange={setCode}
        />
      </div>
    </ResizablePanel>
  )}
</ResizablePanelGroup>
```

#### Week 5-6: Toolbar Integration

**Modify Toolbar.tsx:**

```typescript
// src/components/Toolbar.tsx - ADD IMPORTS
import { Code, Cursor } from '@phosphor-icons/react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// src/components/Toolbar.tsx - ADD PROPS
interface ToolbarProps {
  // ... existing props
  editMode: 'text' | 'visual';
  onEditModeChange: (mode: 'text' | 'visual') => void;
  isVisualAvailable: boolean; // Based on diagram type support
}

// src/components/Toolbar.tsx - ADD TO RENDER
<ToggleGroup 
  type="single" 
  value={editMode} 
  onValueChange={onEditModeChange}
  className="border rounded-md"
>
  <ToggleGroupItem value="text" aria-label="Text editor">
    <Code weight="duotone" className="h-4 w-4 mr-1" />
    <span>Code</span>
  </ToggleGroupItem>
  <ToggleGroupItem 
    value="visual" 
    aria-label="Visual editor"
    disabled={!isVisualAvailable}
  >
    <Cursor weight="duotone" className="h-4 w-4 mr-1" />
    <span>Visual</span>
    <Badge variant="secondary" className="ml-1">BETA</Badge>
  </ToggleGroupItem>
</ToggleGroup>
```

#### Week 7-8: Testing & Documentation

**Tests:**

```typescript
// src/components/visual-editor/VisualEditorRegistry.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VisualEditorRegistry } from './VisualEditorRegistry';

describe('VisualEditorRegistry', () => {
  it('should render empty state in Phase 0', () => {
    render(
      <VisualEditorRegistry 
        diagramType="flowchart" 
        code="" 
        onChange={() => {}} 
      />
    );
    
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
```

**Documentation:**

- [ ] Create [ADR/002-visual-editor-architecture.md](./ADR/002-visual-editor-architecture.md) ✅
- [ ] Update [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) with visual editor section
- [ ] Add visual editor types to [types/index.ts](../src/types/index.ts)

### Success Criteria

- [x] Can toggle between "Code" and "Visual" modes in Toolbar
- [x] Clicking "Visual" shows empty state (not crash)
- [x] localStorage correctly persists `edit-mode` preference
- [x] All existing tests still pass
- [x] No bundle size increase (visual components not loaded yet)

### Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing features | Comprehensive regression testing |
| State management complexity | Keep changes minimal, well-documented |

---

## Phase 1: Flowchart MVP (React Flow Integration)

**Duration**: 2 months (Weeks 9-16)  
**Goal**: Ship first working visual editor for flowcharts  
**Risk**: Medium  
**Deliverable**: Users can create simple flowcharts visually

### Objectives

- [ ] Implement FlowchartParser (text → AST)
- [ ] Implement FlowchartGenerator (AST → text)
- [ ] Create GraphCanvasEditor with React Flow
- [ ] Support basic Mermaid shapes (rectangle, diamond, circle)
- [ ] Enable node dragging with position persistence
- [ ] Implement bidirectional sync

### Tasks

#### Week 9-10: Flowchart Parser

**Goal**: Parse flowchart text into visual state

```typescript
// src/lib/visual-editor/parsers/FlowchartParser.ts
import { Diagram } from 'mermaid';
import type { GraphAST, VisualNode, VisualEdge } from '../types';

export class FlowchartParser {
  async parse(code: string): Promise<GraphAST> {
    // Use Mermaid's internal parser
    const fullCode = `flowchart TD\n${code}`;
    const diagram = await Diagram.fromText(fullCode);
    
    // Access Mermaid's internal DB
    const db = diagram.db as any; // FlowchartDB
    const vertices = db.getVertices();
    const edges = db.getEdges();
    const direction = db.getDirection();
    
    // Extract position metadata from comments
    const positions = this.extractPositions(code);
    
    // Build standardized AST
    const nodes: VisualNode[] = Object.entries(vertices).map(([id, vertex]: [string, any]) => ({
      id,
      type: this.mapMermaidShape(vertex.type),
      position: positions[id] || this.autoPosition(id), // fallback to auto-layout
      data: {
        label: vertex.text || id,
        shape: vertex.type,
        styling: vertex.styles || {},
      },
    }));
    
    const edges: VisualEdge[] = edges.map((edge: any) => ({
      id: `${edge.start}-${edge.end}`,
      source: edge.start,
      target: edge.end,
      label: edge.text,
      type: this.mapEdgeType(edge.stroke),
      animated: false,
    }));
    
    return {
      paradigm: 'graph',
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
      metadata: { direction },
    };
  }
  
  private extractPositions(code: string): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {};
    const regex = /(\w+)\[.*?\]\s*%%(\{.*?\})%%/g;
    
    let match;
    while ((match = regex.exec(code)) !== null) {
      const [, nodeId, jsonStr] = match;
      try {
        const data = JSON.parse(jsonStr);
        if (data.position) {
          positions[nodeId] = data.position;
        }
      } catch (e) {
        // Ignore malformed metadata
      }
    }
    
    return positions;
  }
  
  private mapMermaidShape(type: string): string {
    // Map Mermaid shape types to React Flow node types
    const shapeMap: Record<string, string> = {
      'square': 'default',
      'round': 'default',
      'stadium': 'default',
      'subroutine': 'default',
      'cylindrical': 'default',
      'circle': 'default',
      'asymmetric': 'default',
      'rhombus': 'diamond',
      'hexagon': 'hexagon',
      // ... add more mappings
    };
    
    return shapeMap[type] || 'default';
  }
  
  private autoPosition(nodeId: string): { x: number; y: number } {
    // Simple auto-layout (replaced by dagre in Week 11-12)
    const hash = nodeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      x: (hash % 500) + 50,
      y: Math.floor(hash / 500) * 100 + 50,
    };
  }
}
```

**Tests:**

```typescript
// src/lib/visual-editor/parsers/FlowchartParser.test.ts
describe('FlowchartParser', () => {
  it('should parse simple flowchart', async () => {
    const code = `
      A[Start] --> B[Process]
      B --> C[End]
    `;
    
    const parser = new FlowchartParser();
    const ast = await parser.parse(code);
    
    expect(ast.nodes).toHaveLength(3);
    expect(ast.nodes.find(n => n.id === 'A')).toMatchObject({
      id: 'A',
      data: { label: 'Start' },
    });
    expect(ast.edges).toHaveLength(2);
  });
  
  it('should extract position metadata from comments', async () => {
    const code = `
      A[Start] %%{"position":{"x":100,"y":50}}%%
    `;
    
    const parser = new FlowchartParser();
    const ast = await parser.parse(code);
    
    expect(ast.nodes[0].position).toEqual({ x: 100, y: 50 });
  });
});
```

#### Week 11-12: Flowchart Generator

**Goal**: Generate flowchart text from visual state

```typescript
// src/lib/visual-editor/generators/FlowchartGenerator.ts
import type { GraphAST, VisualNode, VisualEdge } from '../types';

export class FlowchartGenerator {
  generate(ast: GraphAST): string {
    let code = `flowchart ${ast.metadata.direction || 'TD'}\n`;
    
    // Generate nodes
    ast.nodes.forEach(node => {
      const shape = this.getShapeSyntax(node.data.shape);
      code += `    ${node.id}${shape[0]}${node.data.label}${shape[1]}`;
      
      // Inject position metadata
      if (node.position) {
        const metadata = JSON.stringify({ position: node.position });
        code += ` %%${metadata}%%`;
      }
      
      code += '\n';
    });
    
    // Generate edges
    ast.edges.forEach(edge => {
      const connector = this.getConnectorSyntax(edge.type);
      code += `    ${edge.source} ${connector}`;
      
      if (edge.label) {
        code += `|${edge.label}|`;
      }
      
      code += ` ${edge.target}\n`;
    });
    
    return code;
  }
  
  private getShapeSyntax(shape: string): [string, string] {
    const syntaxMap: Record<string, [string, string]> = {
      'rectangle': ['[', ']'],
      'rounded': ['(', ')'],
      'stadium': ['([', '])'],
      'subroutine': ['[[', ']]'],
      'cylindrical': ['[(', ')]'],
      'circle': ['((', '))'],
      'asymmetric': ['>', ']'],
      'rhombus': ['{', '}'],
      'hexagon': ['{{', '}}'],
      'parallelogram': ['[/', '/]'],
      'trapezoid': ['[\\', '/]'],
    };
    
    return syntaxMap[shape] || ['[', ']'];
  }
  
  private getConnectorSyntax(type: string): string {
    const connectorMap: Record<string, string> = {
      'solid': '-->',
      'dotted': '-.->,      'thick': '==>',
      'open': '---',
    };
    
    return connectorMap[type] || '-->';
  }
}
```

**Tests:**

```typescript
// src/lib/visual-editor/generators/FlowchartGenerator.test.ts
describe('FlowchartGenerator', () => {
  it('should generate valid Mermaid syntax', () => {
    const ast: GraphAST = {
      paradigm: 'graph',
      nodes: [
        { id: 'A', type: 'default', position: { x: 100, y: 50 }, data: { label: 'Start', shape: 'rectangle' } },
        { id: 'B', type: 'default', position: { x: 300, y: 50 }, data: { label: 'End', shape: 'rectangle' } },
      ],
      edges: [
        { id: 'A-B', source: 'A', target: 'B', type: 'solid' },
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
      metadata: { direction: 'TD' },
    };
    
    const generator = new FlowchartGenerator();
    const code = generator.generate(ast);
    
    expect(code).toContain('flowchart TD');
    expect(code).toContain('A[Start]');
    expect(code).toContain('A --> B');
  });
  
  it('should round-trip without data loss', async () => {
    const originalCode = 'flowchart TD\n    A[Start] --> B[End]';
    
    const parser = new FlowchartParser();
    const ast = await parser.parse(originalCode);
    
    const generator = new FlowchartGenerator();
    const generatedCode = generator.generate(ast);
    
    const ast2 = await parser.parse(generatedCode);
    expect(ast).toEqual(ast2);
  });
});
```

#### Week 13-14: Graph Canvas Editor (React Flow)

**Goal**: Visual canvas for dragging nodes

```typescript
// src/components/visual-editor/graph/GraphCanvasEditor.tsx
import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FlowchartNode } from './nodes/FlowchartNode';
import type { GraphAST } from '@/lib/visual-editor/types';

const nodeTypes: NodeTypes = {
  default: FlowchartNode,
  diamond: FlowchartNode, // Same component, different rendering
};

interface Props {
  state: GraphAST;
  onChange: (newState: GraphAST) => void;
}

export const GraphCanvasEditor: React.FC<Props> = ({ state, onChange }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(state.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(state.edges);
  
  const onConnect = useCallback((connection: Connection | Edge) => {
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);
  
  // Sync local changes back to parent
  useEffect(() => {
    const newState: GraphAST = {
      ...state,
      nodes,
      edges,
    };
    onChange(newState);
  }, [nodes, edges]);
  
  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
```

```typescript
// src/components/visual-editor/graph/nodes/FlowchartNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

export const FlowchartNode = memo(({ data, selected }: NodeProps) => {
  const shapeClass = getShapeClass(data.shape);
  
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div
        className={cn(
          'px-4 py-2 min-w-[100px] text-center',
          'border-2 bg-white',
          shapeClass,
          selected && 'ring-2 ring-blue-500'
        )}
        style={data.styling}
      >
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

function getShapeClass(shape: string): string {
  const shapes: Record<string, string> = {
    'rectangle': 'rounded-none',
    'rounded': 'rounded-md',
    'stadium': 'rounded-full',
    'rhombus': 'rotate-45', // CSS-based diamond
    'circle': 'rounded-full aspect-square',
  };
  
  return shapes[shape] || 'rounded-none';
}
```

#### Week 15-16: Sync Engine Integration

**Goal**: Wire up bidirectional sync

```typescript
// src/lib/visual-editor/SyncEngine.ts
import { debounce } from '@/lib/utils';
import { FlowchartParser } from './parsers/FlowchartParser';
import { FlowchartGenerator } from './generators/FlowchartGenerator';
import type { DiagramType, VisualState } from './types';

export class SyncEngine {
  private parsers: Record<string, any> = {
    'flowchart': new FlowchartParser(),
  };
  
  private generators: Record<string, any> = {
    'flowchart': new FlowchartGenerator(),
  };
  
  private lastCodeHash = '';
  private lastVisualHash = '';
  
  // Debounced methods
  syncTextToVisual = debounce(this._syncTextToVisual.bind(this), 300);
  syncVisualToText = debounce(this._syncVisualToText.bind(this), 300);
  
  private async _syncTextToVisual(
    code: string,
    diagramType: DiagramType
  ): Promise<VisualState | null> {
    const hash = this.hash(code);
    if (hash === this.lastCodeHash) return null;
    
    const parser = this.parsers[diagramType];
    if (!parser) return null;
    
    try {
      const state = await parser.parse(code);
      this.lastCodeHash = hash;
      return state;
    } catch (error) {
      console.error('Parse error:', error);
      return null;
    }
  }
  
  private async _syncVisualToText(
    state: VisualState,
    diagramType: DiagramType
  ): Promise<string | null> {
    const hash = this.hash(JSON.stringify(state));
    if (hash === this.lastVisualHash) return null;
    
    const generator = this.generators[diagramType];
    if (!generator) return null;
    
    try {
      const code = await generator.generate(state);
      this.lastVisualHash = hash;
      return code;
    } catch (error) {
      console.error('Generate error:', error);
      return null;
    }
  }
  
  private hash(data: string): string {
    // Simple hash for change detection
    return btoa(data).slice(0, 16);
  }
}

export const syncEngine = new SyncEngine();
```

**Wire into App.tsx:**

```typescript
// src/App.tsx
import { syncEngine } from '@/lib/visual-editor/SyncEngine';

// In App component
useEffect(() => {
  if (editMode === 'visual') {
    syncEngine.syncTextToVisual(code, diagramType).then(newState => {
      if (newState) {
        setVisualStates(prev => ({ ...prev, [diagramType]: newState }));
      }
    });
  }
}, [code, diagramType, editMode]);

const handleVisualChange = useCallback((newState: VisualState) => {
  setVisualStates(prev => ({ ...prev, [diagramType]: newState }));
  
  syncEngine.syncVisualToText(newState, diagramType).then(newCode => {
    if (newCode) {
      setCode(newCode);
    }
  });
}, [diagramType]);
```

### Success Criteria

- [ ] Can parse flowchart code → visual state
- [ ] Can drag nodes on canvas and see positions update
- [ ] Can connect nodes with edges
- [ ] Switching to text mode shows updated code with position metadata
- [ ] Switching back to visual mode preserves positions
- [ ] All tests pass (>90% code coverage)

### E2E Test

```typescript
// tests/e2e/flowchart-visual-editor.spec.ts
import { test, expect } from '@playwright/test';

test('flowchart visual editor workflow', async ({ page }) => {
  await page.goto('/');
  
  // Enter flowchart code
  await page.locator('.monaco-editor').fill(`
    flowchart TD
        A[Start] --> B[Process]
        B --> C[End]
  `);
  
  // Switch to visual mode
  await page.click('button:has-text("Visual")');
  
  // Wait for React Flow to render
  await expect(page.locator('.react-flow')).toBeVisible();
  
  // Verify nodes are rendered
  await expect(page.locator('[data-id="A"]')).toBeVisible();
  await expect(page.locator('[data-id="B"]')).toBeVisible();
  await expect(page.locator('[data-id="C"]')).toBeVisible();
  
  // Drag node A
  const nodeA = page.locator('[data-id="A"]');
  const bbox = await nodeA.boundingBox();
  await page.mouse.move(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
  await page.mouse.down();
  await page.mouse.move(500, 300);
  await page.mouse.up();
  
  // Switch to text mode
  await page.click('button:has-text("Code")');
  
  // Verify position metadata was injected
  const code = await page.locator('.monaco-editor').inputValue();
  expect(code).toContain('%%{"position"');
  
  // Switch back to visual - should preserve position
  await page.click('button:has-text("Visual")');
  const nodeAAfter = page.locator('[data-id="A"]');
  const bboxAfter = await nodeAAfter.boundingBox();
  
  // Position should be roughly the same
  expect(Math.abs(bboxAfter.x - 500)).toBeLessThan(50);
});
```

---

## Phase 2: Graph Family Expansion

**Duration**: 2 months (Weeks 17-24)  
**Goal**: Extend graph canvas to all Group A diagrams  
**Risk**: Medium  
**Deliverable**: State, Class, ER, Mindmap visual editing

### Diagram-Specific Features

#### State Diagrams
- [ ] Support state transitions
- [ ] Composite states (nested states)
- [ ] Start/end state nodes

#### Class Diagrams
- [ ] Class member editing (methods/attributes)
- [ ] Relationship types (composition, aggregation, inheritance)
- [ ] Visibility markers (+, -, #)

#### ER Diagrams
- [ ] Entity/attribute separation
- [ ] Cardinality markers (crow's foot notation)
- [ ] Relationship diamond nodes

#### Mindmap
- [ ] Radial layout algorithm
- [ ] Branch styling
- [ ] Icon support

### Auto-Layout Integration

**Goal**: Use dagre/elk for automatic node positioning

```typescript
// src/lib/visual-editor/layout/dagreLayout.ts
import dagre from 'dagre';
import type { GraphAST, VisualNode } from '../types';

export function applyDagreLayout(ast: GraphAST): GraphAST {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: ast.metadata.direction === 'LR' ? 'LR' : 'TB' });
  g.setDefaultEdgeLabel(() => ({}));
  
  // Add nodes
  ast.nodes.forEach(node => {
    g.setNode(node.id, { width: 150, height: 50 });
  });
  
  // Add edges
  ast.edges.forEach(edge => {
    g.setEdge(edge.source, edge.target);
  });
  
  // Run layout
  dagre.layout(g);
  
  // Update node positions
  const layoutedNodes = ast.nodes.map(node => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x,
        y: nodeWithPosition.y,
      },
    };
  });
  
  return { ...ast, nodes: layoutedNodes };
}
```

### Success Criteria

- [ ] All Group A diagrams (flowchart, state, class, ER, mindmap) have visual editors
- [ ] Auto-layout button in toolbar
- [ ] Diagram-specific node shapes render correctly
- [ ] Relationship types preserved in round-trip

---

## Phase 3-6: Remaining Paradigms

**(To be detailed after Phase 2 completion)**

### Phase 3: Sequence Diagrams (Weeks 25-32)
- Custom rail-based editor
- Actor/lifeline management
- Message dragging
- Fragment support (alt/loop/opt)

### Phase 4: Timeline Diagrams (Weeks 33-40)
- Gantt chart scheduler
- Task bar dragging
- Dependency management
- Date range selection

### Phase 5: Data-Driven Diagrams (Weeks 41-48)
- Table/form editors
- Pie chart slice editing
- Quadrant editing
- Requirement matrix

### Phase 6: Polish & Production (Weeks 49+)
- Performance optimization
- Accessibility audit
- Documentation
- User onboarding
- Analytics

---

## Maintenance & Iteration

### Post-Launch Tasks

- [ ] Monitor Mermaid.js releases for parser changes
- [ ] Collect user feedback via GitHub issues
- [ ] Performance profiling (large diagrams)
- [ ] Accessibility improvements (keyboard navigation)
- [ ] Mobile/tablet support

### Metrics to Track

1. **Adoption**: % of users toggling visual mode
2. **Performance**: Time to render visual editor
3. **Quality**: Sync accuracy (round-trip equality)
4. **Errors**: Parse failure rate

---

## Appendix: Quick Reference

### File Structure (Final State)

```
src/
├── components/
│   └── visual-editor/
│       ├── VisualEditorRegistry.tsx
│       ├── graph/
│       │   ├── GraphCanvasEditor.tsx
│       │   ├── nodes/
│       │   │   ├── FlowchartNode.tsx
│       │   │   ├── StateNode.tsx
│       │   │   ├── ClassNode.tsx
│       │   │   └── ERNode.tsx
│       │   └── AutoLayoutButton.tsx
│       ├── sequence/
│       │   └── SequenceRailEditor.tsx
│       ├── timeline/
│       │   └── TimelineSchedulerEditor.tsx
│       └── data/
│           └── DataTableEditor.tsx
├── lib/
│   └── visual-editor/
│       ├── MermaidASTService.ts
│       ├── SyncEngine.ts
│       ├── parsers/
│       │   ├── FlowchartParser.ts
│       │   ├── StateParser.ts
│       │   ├── ClassParser.ts
│       │   ├── SequenceParser.ts
│       │   └── GanttParser.ts
│       ├── generators/
│       │   └── ... (matching parsers)
│       └── layout/
│           ├── dagreLayout.ts
│           └── elkLayout.ts
└── types/
    └── visual-editor.ts
```

### Key Dependencies

```json
{
  "dependencies": {
    "@xyflow/react": "^12.3.0",
    "@mermaid-js/parser": "^0.3.0",
    "dagre": "^0.8.5",
    "elkjs": "^0.9.0"
  },
  "devDependencies": {
    "@types/dagre": "^0.7.52"
  }
}
```

### Testing Checklist

For each new diagram type:

- [ ] Unit test: Parser extracts all nodes/edges
- [ ] Unit test: Parser preserves position metadata
- [ ] Unit test: Generator produces valid Mermaid syntax
- [ ] Unit test: Round-trip (text → AST → text → AST) is identical
- [ ] Integration test: SyncEngine handles bidirectional updates
- [ ] E2E test: User can create diagram visually
- [ ] E2E test: User can edit diagram visually
- [ ] E2E test: Switching modes preserves state

---

**Next Steps**: 
1. Review this roadmap with team
2. Create GitHub project board with tasks
3. Begin Phase 0 implementation
4. Weekly sync meetings to track progress
