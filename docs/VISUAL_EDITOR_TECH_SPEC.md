# Visual Editor Technical Specification
**For Junior Engineers**

> 📘 **Purpose**: This document provides step-by-step implementation instructions for building the Visual Editor feature. Each task is designed to be completed in 1-3 days with clear acceptance criteria.

**Last Updated**: December 13, 2024  
**Status**: Ready for Implementation  
**Prerequisite Reading**:
- [VISUAL_EDITOR_PRD.md](./VISUAL_EDITOR_PRD.md) - Product requirements
- [ADR/002-visual-editor-architecture.md](./ADR/002-visual-editor-architecture.md) - Architecture decisions

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Phase 0: Foundation](#phase-0-foundation)
4. [Phase 1: Flowchart MVP](#phase-1-flowchart-mvp)
5. [Testing Guide](#testing-guide)
6. [Debugging Guide](#debugging-guide)
7. [Code Review Checklist](#code-review-checklist)

---

## Architecture Overview

### System Components Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Interface                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Code Editor │  │ Visual Editor│  │   Preview    │          │
│  │   (Monaco)   │  │ (React Flow) │  │  (Mermaid)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx (State Hub)                      │
│                                                                  │
│  State:                                                          │
│  - code: string                    ← Text content               │
│  - editMode: 'text' | 'visual'     ← Current mode               │
│  - visualStates: {...}             ← Visual editor state        │
│  - diagramType: DiagramType        ← Current diagram            │
│                                                                  │
└─────────┬────────────────────────────────────────────┬──────────┘
          │                                            │
          ▼                                            ▼
┌──────────────────────┐                    ┌──────────────────────┐
│    SyncEngine        │                    │  MermaidASTService   │
│                      │                    │                      │
│ - syncTextToVisual() │◄──────────────────►│  - parse()          │
│ - syncVisualToText() │                    │  - generate()        │
│                      │                    │  - validate()        │
└──────────────────────┘                    └──────────────────────┘
          │                                            │
          │                                            │
          ▼                                            ▼
┌──────────────────────┐                    ┌──────────────────────┐
│  Parsers (Text→AST)  │                    │ Generators (AST→Text)│
│                      │                    │                      │
│ - FlowchartParser    │                    │ - FlowchartGenerator │
│ - SequenceParser     │                    │ - SequenceGenerator  │
│ - GanttParser        │                    │ - GanttGenerator     │
└──────────────────────┘                    └──────────────────────┘
```

### Data Flow Diagram

```
User Action: Drag node in visual editor
                │
                ▼
    GraphCanvasEditor.onNodesChange(newNodes)
                │
                ▼
    onChange(newVisualState) ──────────┐
                                       │
                                       ▼
                            App.tsx updates state
                            setVisualStates({...})
                                       │
                                       ▼
                            SyncEngine.syncVisualToText()
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
         FlowchartGenerator.generate()         Update localStorage
                    │                                     │
                    ▼                                     │
              New Mermaid code                            │
                    │                                     │
                    ▼                                     │
         setCode(newCode) ◄───────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
CodeEditor    DiagramPreview   VisualEditor
re-renders    re-renders       updates
```

---

## Development Environment Setup

### 1. Install Dependencies

```bash
# Navigate to project
cd /home/ani/Code/mermaid-editor

# Install React Flow and layout libraries
npm install @xyflow/react@^12.3.0
npm install dagre@^0.8.5
npm install elkjs@^0.9.0

# Install TypeScript types
npm install -D @types/dagre

# Verify installation
npm list @xyflow/react dagre elkjs
```

### 2. Verify Existing Setup

```bash
# Should see these existing packages
npm list mermaid monaco-editor react
```

### 3. Create Branch

```bash
# Already done, but for reference
git checkout -b visual-editor
```

### 4. Development Server

```bash
# Run development server
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch
```

---

## Phase 0: Foundation

**Goal**: Setup infrastructure without breaking anything  
**Duration**: 1-2 weeks  
**Difficulty**: ⭐ Beginner

### Task 0.1: Create Type Definitions

**Estimated Time**: 2-3 hours  
**Files**: `src/types/visual-editor.ts` (new file)

<details>
<summary>📝 Implementation Steps</summary>

#### Step 1: Create the file

```bash
touch src/types/visual-editor.ts
```

#### Step 2: Add base types

```typescript
// src/types/visual-editor.ts

/**
 * Edit mode for the application
 * - 'text': Monaco code editor (default)
 * - 'visual': React Flow canvas editor
 */
export type EditMode = 'text' | 'visual';

/**
 * The interaction paradigm for different diagram types.
 * Each paradigm uses a different editor component.
 */
export type DiagramParadigm = 
  | 'graph'      // Node-link manipulation (flowchart, state, class)
  | 'rail'       // Constrained lifelines (sequence)
  | 'timeline'   // Scheduler-style (gantt)
  | 'data';      // Form/table editing (pie, quadrant)

/**
 * Visual state for a diagram. This is what gets stored in localStorage
 * and passed to visual editors.
 */
export type VisualState = 
  | GraphVisualState 
  | RailVisualState 
  | TimelineVisualState 
  | DataVisualState;

/**
 * Visual state for graph-based diagrams (flowchart, state, class, ER, mindmap)
 */
export interface GraphVisualState {
  paradigm: 'graph';
  nodes: VisualNode[];
  edges: VisualEdge[];
  viewport: ViewportState;
  metadata?: {
    direction?: 'TD' | 'LR' | 'BT' | 'RL';
    theme?: string;
  };
}

/**
 * A node in the visual graph editor.
 * Position is what we're trying to preserve!
 */
export interface VisualNode {
  id: string;                    // Must match Mermaid node ID
  type: string;                  // React Flow node type ('default', 'diamond', etc.)
  position: { x: number; y: number };  // CRITICAL: This is what we preserve
  data: {
    label: string;               // Display text
    shape: MermaidShape;         // Mermaid shape type
    styling?: Record<string, any>;  // CSS styles
  };
}

/**
 * An edge (connection) in the visual graph editor
 */
export interface VisualEdge {
  id: string;                    // Unique edge ID
  source: string;                // Source node ID
  target: string;                // Target node ID
  label?: string;                // Optional label text
  type: EdgeType;                // Line style
  animated?: boolean;            // Should the line animate?
}

/**
 * Mermaid shape types (from Mermaid syntax)
 */
export type MermaidShape = 
  | 'rectangle'        // [text]
  | 'rounded'          // (text)
  | 'stadium'          // ([text])
  | 'subroutine'       // [[text]]
  | 'cylindrical'      // [(text)]
  | 'circle'           // ((text))
  | 'asymmetric'       // >text]
  | 'rhombus'          // {text}
  | 'hexagon'          // {{text}}
  | 'parallelogram'    // [/text/]
  | 'parallelogram_alt'// [\text\]
  | 'trapezoid'        // [/text\]
  | 'trapezoid_alt'    // [\text/]
  | 'double_circle';   // (((text)))

/**
 * Edge/connector types
 */
export type EdgeType = 
  | 'solid'    // -->
  | 'dotted'   // -.->
  | 'thick'    // ==>
  | 'open';    // ---

/**
 * Viewport state (zoom, pan position)
 */
export interface ViewportState {
  x: number;      // Pan X offset
  y: number;      // Pan Y offset
  zoom: number;   // Zoom level (0.1 to 2.0)
}

// Placeholder types for other paradigms (implement in later phases)
export interface RailVisualState {
  paradigm: 'rail';
  // TODO: Implement in Phase 3
}

export interface TimelineVisualState {
  paradigm: 'timeline';
  // TODO: Implement in Phase 4
}

export interface DataVisualState {
  paradigm: 'data';
  // TODO: Implement in Phase 5
}
```

#### Step 3: Export from main types file

```typescript
// src/types/index.ts - ADD THIS EXPORT
export * from './visual-editor';
```

</details>

**✅ Acceptance Criteria:**
- [ ] File compiles without TypeScript errors
- [ ] Types are exported from `src/types/index.ts`
- [ ] Can import types: `import { EditMode, VisualState } from '@/types'`

**🐛 Common Issues:**
- **Issue**: "Cannot find module '@/types/visual-editor'"
  - **Fix**: Check `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }`

---

### Task 0.2: Add State to App.tsx

**Estimated Time**: 1-2 hours  
**Files**: `src/App.tsx` (modify existing)

<details>
<summary>📝 Implementation Steps</summary>

#### Step 1: Add imports

```typescript
// src/App.tsx - ADD THESE IMPORTS AT TOP
import { EditMode, VisualState } from '@/types';
```

#### Step 2: Add new state hooks

Find the existing state hooks in `App.tsx` (should be near the top of the component). Add these NEW hooks after the existing ones:

```typescript
// src/App.tsx - ADD THESE HOOKS

// NEW: Edit mode state (text or visual)
const [editMode, setEditMode] = useLocalStorage<EditMode>(
  'edit-mode',
  'text'  // Default to text mode
);

// NEW: Visual states for each diagram type
// Stores the visual editor state separately for each diagram
const [visualStates, setVisualStates] = useLocalStorage<
  Partial<Record<DiagramType, VisualState>>
>('visual-states', {});

// Computed: Get the current diagram's visual state
const currentVisualState = visualStates[diagramType];
```

#### Step 3: Add helper function for visual state updates

```typescript
// src/App.tsx - ADD THIS HELPER FUNCTION

/**
 * Update the visual state for the current diagram type
 */
const handleVisualStateChange = useCallback((newState: VisualState) => {
  setVisualStates(prev => ({
    ...prev,
    [diagramType]: newState
  }));
}, [diagramType, setVisualStates]);
```

</details>

**✅ Acceptance Criteria:**
- [ ] App compiles without errors
- [ ] Can see `edit-mode` in localStorage (DevTools → Application → Local Storage)
- [ ] Can see `visual-states` in localStorage
- [ ] Switching diagram type doesn't crash app

**🧪 Manual Test:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Verify you see keys: `edit-mode`, `visual-states`
4. Change diagram type in dropdown
5. Verify app doesn't crash

---

### Task 0.3: Create Empty Visual Editor Component

**Estimated Time**: 2-3 hours  
**Files**: 
- `src/components/visual-editor/VisualEditorRegistry.tsx` (new)
- `src/components/visual-editor/EmptyState.tsx` (new)

<details>
<summary>📝 Implementation Steps</summary>

#### Step 1: Create directory structure

```bash
mkdir -p src/components/visual-editor
```

#### Step 2: Create EmptyState component

```typescript
// src/components/visual-editor/EmptyState.tsx
import { FC } from 'react';
import { Info } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EmptyStateProps {
  message: string;
  title?: string;
}

/**
 * Placeholder component shown when visual editing is not yet available
 */
export const EmptyState: FC<EmptyStateProps> = ({ 
  message, 
  title = 'Coming Soon' 
}) => {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Alert>
        <Info className="h-4 w-4" weight="duotone" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
};
```

#### Step 3: Create VisualEditorRegistry component

```typescript
// src/components/visual-editor/VisualEditorRegistry.tsx
import { FC } from 'react';
import { DiagramType, VisualState } from '@/types';
import { EmptyState } from './EmptyState';

interface VisualEditorRegistryProps {
  /** Current diagram type */
  diagramType: DiagramType;
  
  /** Current visual state (may be undefined if not initialized) */
  visualState?: VisualState;
  
  /** Called when visual state changes */
  onChange: (newState: VisualState) => void;
}

/**
 * Registry component that routes to the correct visual editor
 * based on diagram type.
 * 
 * Phase 0: Just shows empty state
 * Phase 1+: Will route to actual editors
 */
export const VisualEditorRegistry: FC<VisualEditorRegistryProps> = ({
  diagramType,
  visualState,
  onChange,
}) => {
  // Phase 0: Show empty state for all diagram types
  return (
    <EmptyState 
      message={`Visual editing for ${diagramType} diagrams is coming soon!`}
      title="Visual Editor"
    />
  );
};
```

#### Step 4: Add to App.tsx layout

Find the `<ResizablePanelGroup>` in `App.tsx` and modify it to include the visual editor panel when in visual mode:

```typescript
// src/App.tsx - MODIFY THE LAYOUT

// Import the component at top
import { VisualEditorRegistry } from '@/components/visual-editor/VisualEditorRegistry';

// In the return statement, modify ResizablePanelGroup:
<ResizablePanelGroup direction={layout}>
  {/* Existing Code Editor Panel */}
  <ResizablePanel defaultSize={33} minSize={20}>
    {/* ... existing CodeEditor ... */}
  </ResizablePanel>

  <ResizableHandle />

  {/* Existing Diagram Preview Panel */}
  <ResizablePanel defaultSize={33} minSize={20}>
    {/* ... existing DiagramPreview ... */}
  </ResizablePanel>

  {/* NEW: Visual Editor Panel (only shown in visual mode) */}
  {editMode === 'visual' && (
    <>
      <ResizableHandle />
      <ResizablePanel defaultSize={34} minSize={20}>
        <div className="h-full flex flex-col border-l">
          <div className="border-b p-2 bg-muted/30">
            <h3 className="text-sm font-medium">Visual Editor</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <VisualEditorRegistry
              diagramType={diagramType}
              visualState={currentVisualState}
              onChange={handleVisualStateChange}
            />
          </div>
        </div>
      </ResizablePanel>
    </>
  )}
</ResizablePanelGroup>
```

</details>

**✅ Acceptance Criteria:**
- [ ] Components compile without errors
- [ ] Layout doesn't show visual editor panel by default
- [ ] Manually changing `editMode` in DevTools shows/hides panel
- [ ] Panel shows "Coming Soon" message

**🧪 Manual Test:**
1. Open DevTools → Console
2. Run: `localStorage.setItem('edit-mode', '"visual"')`
3. Refresh page
4. Should see 3-panel layout with "Coming Soon" message on right
5. Run: `localStorage.setItem('edit-mode', '"text"')`
6. Refresh page
7. Should see 2-panel layout (back to normal)

---

### Task 0.4: Add Mode Toggle to Toolbar

**Estimated Time**: 2-3 hours  
**Files**: `src/components/Toolbar.tsx` (modify)

<details>
<summary>📝 Implementation Steps</summary>

#### Step 1: Add imports

```typescript
// src/components/Toolbar.tsx - ADD IMPORTS
import { Code, Cursor } from '@phosphor-icons/react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import type { EditMode } from '@/types';
```

#### Step 2: Update props interface

```typescript
// src/components/Toolbar.tsx - MODIFY ToolbarProps

export interface ToolbarProps {
  // ... existing props ...
  
  // NEW: Edit mode props
  editMode: EditMode;
  onEditModeChange: (mode: EditMode) => void;
  isVisualSupported?: boolean;  // Optional: whether current diagram supports visual
}
```

#### Step 3: Add toggle group to render

Find a good spot in the Toolbar's return statement (suggest after the diagram type dropdown) and add:

```typescript
// src/components/Toolbar.tsx - ADD TO RENDER

{/* Edit Mode Toggle */}
<div className="flex items-center gap-2">
  <span className="text-sm text-muted-foreground">Mode:</span>
  <ToggleGroup 
    type="single" 
    value={editMode} 
    onValueChange={(value) => {
      if (value) onEditModeChange(value as EditMode);
    }}
    className="border rounded-md"
  >
    <ToggleGroupItem 
      value="text" 
      aria-label="Text editor"
      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
    >
      <Code weight="duotone" className="h-4 w-4 mr-1.5" />
      <span>Code</span>
    </ToggleGroupItem>
    
    <ToggleGroupItem 
      value="visual" 
      aria-label="Visual editor"
      disabled={isVisualSupported === false}
      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
    >
      <Cursor weight="duotone" className="h-4 w-4 mr-1.5" />
      <span>Visual</span>
      <Badge variant="secondary" className="ml-1.5 text-[10px] px-1">
        BETA
      </Badge>
    </ToggleGroupItem>
  </ToggleGroup>
</div>
```

#### Step 4: Update App.tsx to pass props

```typescript
// src/App.tsx - UPDATE TOOLBAR USAGE

<Toolbar
  // ... existing props ...
  
  // NEW: Pass edit mode props
  editMode={editMode}
  onEditModeChange={setEditMode}
  isVisualSupported={true}  // Phase 0: Always true. Phase 1+: Based on diagram type
/>
```

</details>

**✅ Acceptance Criteria:**
- [ ] Toolbar compiles without errors
- [ ] Toggle buttons appear in toolbar
- [ ] Clicking "Code" or "Visual" changes mode
- [ ] Visual mode shows 3-panel layout
- [ ] Text mode shows 2-panel layout
- [ ] "BETA" badge appears on Visual button
- [ ] Mode persists after refresh (stored in localStorage)

**🧪 Manual Test:**
1. Click "Visual" button in toolbar
2. Should see 3 panels appear
3. Click "Code" button
4. Should see visual panel disappear
5. Refresh page
6. Should remember your last selection

**🐛 Common Issues:**
- **Issue**: Toggle doesn't change panels
  - **Fix**: Check that `editMode` state is correctly connected in App.tsx
- **Issue**: Mode doesn't persist
  - **Fix**: Verify `useLocalStorage` hook is working (check DevTools)

---

### Task 0.5: Write Tests for Phase 0

**Estimated Time**: 2-3 hours  
**Files**: New test files

<details>
<summary>📝 Implementation Steps</summary>

#### Step 1: Test type definitions

```typescript
// src/types/visual-editor.test.ts
import { describe, it, expect } from 'vitest';
import type { EditMode, VisualState, GraphVisualState } from './visual-editor';

describe('Visual Editor Types', () => {
  it('should allow valid EditMode values', () => {
    const textMode: EditMode = 'text';
    const visualMode: EditMode = 'visual';
    
    expect(textMode).toBe('text');
    expect(visualMode).toBe('visual');
  });
  
  it('should create valid GraphVisualState', () => {
    const state: GraphVisualState = {
      paradigm: 'graph',
      nodes: [
        {
          id: 'A',
          type: 'default',
          position: { x: 100, y: 50 },
          data: {
            label: 'Test',
            shape: 'rectangle',
          },
        },
      ],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    
    expect(state.paradigm).toBe('graph');
    expect(state.nodes).toHaveLength(1);
  });
});
```

#### Step 2: Test EmptyState component

```typescript
// src/components/visual-editor/EmptyState.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('should render message', () => {
    render(<EmptyState message="Test message" />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
  
  it('should render custom title', () => {
    render(<EmptyState message="Test" title="Custom Title" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });
  
  it('should use default title', () => {
    render(<EmptyState message="Test" />);
    
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });
});
```

#### Step 3: Test VisualEditorRegistry

```typescript
// src/components/visual-editor/VisualEditorRegistry.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VisualEditorRegistry } from './VisualEditorRegistry';

describe('VisualEditorRegistry', () => {
  it('should show empty state in Phase 0', () => {
    render(
      <VisualEditorRegistry 
        diagramType="flowchart"
        onChange={() => {}}
      />
    );
    
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    expect(screen.getByText(/flowchart/i)).toBeInTheDocument();
  });
  
  it('should show empty state for different diagram types', () => {
    const { rerender } = render(
      <VisualEditorRegistry 
        diagramType="sequence"
        onChange={() => {}}
      />
    );
    
    expect(screen.getByText(/sequence/i)).toBeInTheDocument();
    
    rerender(
      <VisualEditorRegistry 
        diagramType="gantt"
        onChange={() => {}}
      />
    );
    
    expect(screen.getByText(/gantt/i)).toBeInTheDocument();
  });
});
```

#### Step 4: Run tests

```bash
npm test -- src/components/visual-editor/
npm test -- src/types/visual-editor.test.ts
```

</details>

**✅ Acceptance Criteria:**
- [ ] All tests pass
- [ ] Test coverage >80% for new files
- [ ] No console errors during test run

---

## Phase 1: Flowchart MVP

**Goal**: Working visual editor for flowcharts  
**Duration**: 2-3 weeks  
**Difficulty**: ⭐⭐⭐ Intermediate

### Task 1.1: Create MermaidASTService Foundation

**Estimated Time**: 4-6 hours  
**Files**: 
- `src/lib/visual-editor/MermaidASTService.ts` (new)
- `src/lib/visual-editor/types.ts` (new)

<details>
<summary>📝 Implementation Steps</summary>

#### Step 1: Create directory

```bash
mkdir -p src/lib/visual-editor
```

#### Step 2: Create internal types

```typescript
// src/lib/visual-editor/types.ts

import type { DiagramType, VisualState } from '@/types';

/**
 * Parser interface - converts Mermaid text to VisualState
 */
export interface Parser {
  parse(code: string): Promise<VisualState>;
}

/**
 * Generator interface - converts VisualState to Mermaid text
 */
export interface Generator {
  generate(state: VisualState): Promise<string>;
}

/**
 * Validation result from parse/generate operations
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

#### Step 3: Create service skeleton

```typescript
// src/lib/visual-editor/MermaidASTService.ts

import type { DiagramType, VisualState } from '@/types';
import type { Parser, Generator, ValidationResult } from './types';

/**
 * Service for parsing Mermaid text to AST and generating text from AST.
 * 
 * This is the main abstraction layer over Mermaid's various parsers.
 * 
 * Usage:
 *   const ast = await astService.parse('flowchart', code);
 *   const newCode = await astService.generate('flowchart', ast);
 */
export class MermaidASTService {
  private parsers: Partial<Record<DiagramType, Parser>> = {};
  private generators: Partial<Record<DiagramType, Generator>> = {};
  
  /**
   * Register a parser for a diagram type
   */
  registerParser(type: DiagramType, parser: Parser): void {
    this.parsers[type] = parser;
  }
  
  /**
   * Register a generator for a diagram type
   */
  registerGenerator(type: DiagramType, generator: Generator): void {
    this.generators[type] = generator;
  }
  
  /**
   * Parse Mermaid text into visual state
   * 
   * @param type - Diagram type
   * @param code - Mermaid text (without diagram type prefix)
   * @returns Visual state, or null if parsing fails
   */
  async parse(type: DiagramType, code: string): Promise<VisualState | null> {
    const parser = this.parsers[type];
    
    if (!parser) {
      console.warn(`No parser registered for diagram type: ${type}`);
      return null;
    }
    
    try {
      const state = await parser.parse(code);
      return state;
    } catch (error) {
      console.error(`Parse error for ${type}:`, error);
      return null;
    }
  }
  
  /**
   * Generate Mermaid text from visual state
   * 
   * @param type - Diagram type
   * @param state - Visual state
   * @returns Mermaid text (without diagram type prefix)
   */
  async generate(type: DiagramType, state: VisualState): Promise<string> {
    const generator = this.generators[type];
    
    if (!generator) {
      throw new Error(`No generator registered for diagram type: ${type}`);
    }
    
    return generator.generate(state);
  }
  
  /**
   * Validate that a visual state is well-formed
   * 
   * @param state - Visual state to validate
   * @returns Validation result
   */
  validate(state: VisualState): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    if (!state.paradigm) {
      errors.push('Missing paradigm');
    }
    
    if (state.paradigm === 'graph') {
      const graphState = state;
      
      if (!graphState.nodes || graphState.nodes.length === 0) {
        warnings.push('No nodes defined');
      }
      
      // Validate node IDs are unique
      const nodeIds = new Set<string>();
      graphState.nodes?.forEach(node => {
        if (nodeIds.has(node.id)) {
          errors.push(`Duplicate node ID: ${node.id}`);
        }
        nodeIds.add(node.id);
      });
      
      // Validate edges reference existing nodes
      graphState.edges?.forEach(edge => {
        if (!nodeIds.has(edge.source)) {
          errors.push(`Edge references non-existent source: ${edge.source}`);
        }
        if (!nodeIds.has(edge.target)) {
          errors.push(`Edge references non-existent target: ${edge.target}`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Singleton instance
export const astService = new MermaidASTService();
```

</details>

**✅ Acceptance Criteria:**
- [ ] Service compiles without errors
- [ ] Can import: `import { astService } from '@/lib/visual-editor/MermaidASTService'`
- [ ] Calling `astService.parse('flowchart', code)` returns null (no parser registered yet)
- [ ] `validate()` method works on sample GraphVisualState

**🧪 Test:**

```typescript
// src/lib/visual-editor/MermaidASTService.test.ts
import { describe, it, expect } from 'vitest';
import { astService } from './MermaidASTService';
import type { GraphVisualState } from '@/types';

describe('MermaidASTService', () => {
  it('should return null when no parser registered', async () => {
    const result = await astService.parse('flowchart', 'A --> B');
    expect(result).toBeNull();
  });
  
  it('should validate graph state', () => {
    const state: GraphVisualState = {
      paradigm: 'graph',
      nodes: [
        { id: 'A', type: 'default', position: { x: 0, y: 0 }, data: { label: 'A', shape: 'rectangle' } },
      ],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    
    const result = astService.validate(state);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should detect duplicate node IDs', () => {
    const state: GraphVisualState = {
      paradigm: 'graph',
      nodes: [
        { id: 'A', type: 'default', position: { x: 0, y: 0 }, data: { label: 'A', shape: 'rectangle' } },
        { id: 'A', type: 'default', position: { x: 100, y: 0 }, data: { label: 'A2', shape: 'rectangle' } },
      ],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    
    const result = astService.validate(state);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Duplicate node ID: A');
  });
});
```

---

### Task 1.2: Implement FlowchartParser

**Estimated Time**: 6-8 hours  
**Files**: `src/lib/visual-editor/parsers/FlowchartParser.ts` (new)

<details>
<summary>📝 Implementation Steps</summary>

#### Step 1: Understand Mermaid's Parser

**Important Concepts:**

1. **Diagram.fromText()**: Mermaid's main API for parsing
2. **diagram.db**: Internal database with parsed data
3. **getVertices()**: Returns nodes/vertices
4. **getEdges()**: Returns connections

**Example inspection:**

```typescript
// In browser console or Node:
import { Diagram } from 'mermaid';

const diagram = await Diagram.fromText('flowchart TD\n  A[Start] --> B[End]');
console.log(diagram.db.getVertices());
// {
//   A: { id: 'A', text: 'Start', type: 'square', ... },
//   B: { id: 'B', text: 'End', type: 'square', ... }
// }

console.log(diagram.db.getEdges());
// [
//   { start: 'A', end: 'B', text: '', stroke: 'normal', ... }
// ]
```

#### Step 2: Create parser

```typescript
// src/lib/visual-editor/parsers/FlowchartParser.ts

import { Diagram } from 'mermaid';
import type { GraphVisualState, VisualNode, VisualEdge, MermaidShape } from '@/types';
import type { Parser } from '../types';

/**
 * Parser for flowchart diagrams.
 * 
 * Converts Mermaid flowchart text to GraphVisualState.
 * 
 * Key challenges:
 * 1. Extracting position metadata from comments
 * 2. Mapping Mermaid shapes to React Flow node types
 * 3. Handling various edge types (solid, dotted, thick)
 */
export class FlowchartParser implements Parser {
  /**
   * Parse flowchart text into visual state
   * 
   * @param code - Mermaid flowchart code (without "flowchart TD" prefix)
   * @returns GraphVisualState
   */
  async parse(code: string): Promise<GraphVisualState> {
    // Step 1: Add flowchart prefix and parse with Mermaid
    const fullCode = `flowchart TD\n${code}`;
    const diagram = await Diagram.fromText(fullCode);
    
    // Step 2: Access Mermaid's internal database
    // @ts-ignore - Mermaid's db types are not fully exported
    const db = diagram.db;
    
    // Step 3: Extract nodes (vertices)
    const vertices = db.getVertices();
    const edges = db.getEdges();
    const direction = db.getDirection?.() || 'TD';
    
    // Step 4: Extract position metadata from comments
    const positions = this.extractPositionMetadata(code);
    
    // Step 5: Build nodes array
    const nodes: VisualNode[] = Object.entries(vertices).map(([id, vertex]: [string, any]) => {
      const position = positions[id] || this.generateDefaultPosition(id);
      
      return {
        id,
        type: this.mapMermaidShapeToNodeType(vertex.type),
        position,
        data: {
          label: vertex.text || id,
          shape: this.mapMermaidTypeToShape(vertex.type),
          styling: vertex.styles || {},
        },
      };
    });
    
    // Step 6: Build edges array
    const visualEdges: VisualEdge[] = edges.map((edge: any, index: number) => ({
      id: `e-${edge.start}-${edge.end}-${index}`,
      source: edge.start,
      target: edge.end,
      label: edge.text || undefined,
      type: this.mapEdgeStroke(edge.stroke),
      animated: false,
    }));
    
    // Step 7: Return complete state
    return {
      paradigm: 'graph',
      nodes,
      edges: visualEdges,
      viewport: { x: 0, y: 0, zoom: 1 },
      metadata: {
        direction,
      },
    };
  }
  
  /**
   * Extract position metadata from comment syntax
   * 
   * Example: A[Label] %%{"position":{"x":100,"y":50}}%%
   * 
   * @param code - Original Mermaid code
   * @returns Map of node ID to position
   */
  private extractPositionMetadata(code: string): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {};
    
    // Regex to match: NodeID[...] %%{...}%%
    // Group 1: Node ID
    // Group 2: JSON metadata
    const regex = /(\w+)(?:\[.*?\]|\(.*?\)|\{.*?\}|>.*?\])\s*%%(\{.*?\})%%/g;
    
    let match;
    while ((match = regex.exec(code)) !== null) {
      const [, nodeId, jsonStr] = match;
      
      try {
        const metadata = JSON.parse(jsonStr);
        if (metadata.position && 
            typeof metadata.position.x === 'number' && 
            typeof metadata.position.y === 'number') {
          positions[nodeId] = metadata.position;
        }
      } catch (e) {
        // Ignore malformed JSON
        console.warn(`Failed to parse metadata for node ${nodeId}:`, e);
      }
    }
    
    return positions;
  }
  
  /**
   * Generate a default position for a node (when no metadata exists)
   * 
   * Uses a simple hash-based algorithm for consistency.
   * Real auto-layout will be added in Phase 2 with dagre.
   * 
   * @param nodeId - Node ID
   * @returns Default position
   */
  private generateDefaultPosition(nodeId: string): { x: number; y: number } {
    // Simple hash of node ID to get consistent positions
    let hash = 0;
    for (let i = 0; i < nodeId.length; i++) {
      hash = ((hash << 5) - hash) + nodeId.charCodeAt(i);
      hash |= 0; // Convert to 32-bit integer
    }
    
    // Spread nodes across a grid
    const absHash = Math.abs(hash);
    return {
      x: (absHash % 600) + 50,
      y: Math.floor(absHash / 600) * 100 + 50,
    };
  }
  
  /**
   * Map Mermaid shape type to React Flow node type
   * 
   * @param mermaidType - Mermaid's internal type
   * @returns React Flow node type
   */
  private mapMermaidShapeToNodeType(mermaidType: string): string {
    // For now, simple mapping
    // Phase 2 will add custom node components for each shape
    const typeMap: Record<string, string> = {
      'square': 'default',
      'round': 'default',
      'stadium': 'default',
      'diamond': 'default',  // TODO: Custom diamond component in Phase 2
      'odd': 'default',
      'circle': 'default',
      'rect_left_inv_arrow': 'default',
      'rect_right_inv_arrow': 'default',
      'trapezoid': 'default',
      'inv_trapezoid': 'default',
      'hexagon': 'default',
    };
    
    return typeMap[mermaidType] || 'default';
  }
  
  /**
   * Map Mermaid type to our MermaidShape enum
   * 
   * @param mermaidType - Mermaid's internal type
   * @returns MermaidShape
   */
  private mapMermaidTypeToShape(mermaidType: string): MermaidShape {
    const shapeMap: Record<string, MermaidShape> = {
      'square': 'rectangle',
      'round': 'rounded',
      'stadium': 'stadium',
      'diamond': 'rhombus',
      'odd': 'asymmetric',
      'circle': 'circle',
      'rect_left_inv_arrow': 'trapezoid_alt',
      'rect_right_inv_arrow': 'trapezoid',
      'trapezoid': 'trapezoid',
      'inv_trapezoid': 'trapezoid_alt',
      'hexagon': 'hexagon',
    };
    
    return shapeMap[mermaidType] || 'rectangle';
  }
  
  /**
   * Map Mermaid edge stroke to our EdgeType
   * 
   * @param stroke - Mermaid stroke type
   * @returns EdgeType
   */
  private mapEdgeStroke(stroke: string): 'solid' | 'dotted' | 'thick' | 'open' {
    const strokeMap: Record<string, 'solid' | 'dotted' | 'thick' | 'open'> = {
      'normal': 'solid',
      'thick': 'thick',
      'dotted': 'dotted',
      'invisible': 'open',
    };
    
    return strokeMap[stroke] || 'solid';
  }
}
```

#### Step 3: Register parser with service

```typescript
// src/lib/visual-editor/MermaidASTService.ts - ADD THIS

import { FlowchartParser } from './parsers/FlowchartParser';

// After the class definition
astService.registerParser('flowchart', new FlowchartParser());
```

#### Step 4: Write comprehensive tests

```typescript
// src/lib/visual-editor/parsers/FlowchartParser.test.ts

import { describe, it, expect } from 'vitest';
import { FlowchartParser } from './FlowchartParser';

describe('FlowchartParser', () => {
  const parser = new FlowchartParser();
  
  it('should parse simple flowchart', async () => {
    const code = `
      A[Start] --> B[Process]
      B --> C[End]
    `;
    
    const result = await parser.parse(code);
    
    expect(result.paradigm).toBe('graph');
    expect(result.nodes).toHaveLength(3);
    expect(result.edges).toHaveLength(2);
    
    // Check node structure
    const nodeA = result.nodes.find(n => n.id === 'A');
    expect(nodeA).toBeDefined();
    expect(nodeA?.data.label).toBe('Start');
    expect(nodeA?.position).toHaveProperty('x');
    expect(nodeA?.position).toHaveProperty('y');
  });
  
  it('should extract position metadata from comments', async () => {
    const code = `
      A[Start] %%{"position":{"x":100,"y":50}}%%
      B[End] %%{"position":{"x":300,"y":50}}%%
      A --> B
    `;
    
    const result = await parser.parse(code);
    
    const nodeA = result.nodes.find(n => n.id === 'A');
    const nodeB = result.nodes.find(n => n.id === 'B');
    
    expect(nodeA?.position).toEqual({ x: 100, y: 50 });
    expect(nodeB?.position).toEqual({ x: 300, y: 50 });
  });
  
  it('should handle different shapes', async () => {
    const code = `
      A[Rectangle]
      B(Rounded)
      C([Stadium])
      D{Diamond}
      E((Circle))
    `;
    
    const result = await parser.parse(code);
    
    expect(result.nodes).toHaveLength(5);
    expect(result.nodes.find(n => n.id === 'A')?.data.shape).toBe('rectangle');
    expect(result.nodes.find(n => n.id === 'B')?.data.shape).toBe('rounded');
    expect(result.nodes.find(n => n.id === 'D')?.data.shape).toBe('rhombus');
  });
  
  it('should handle different edge types', async () => {
    const code = `
      A --> B
      B -.-> C
      C ==> D
      D --- E
    `;
    
    const result = await parser.parse(code);
    
    expect(result.edges).toHaveLength(4);
    expect(result.edges[0].type).toBe('solid');
    expect(result.edges[1].type).toBe('dotted');
    expect(result.edges[2].type).toBe('thick');
  });
  
  it('should preserve edge labels', async () => {
    const code = `
      A -->|Yes| B
      B -->|No| C
    `;
    
    const result = await parser.parse(code);
    
    expect(result.edges[0].label).toBe('Yes');
    expect(result.edges[1].label).toBe('No');
  });
  
  it('should handle direction metadata', async () => {
    const code = `
      A --> B
    `;
    
    const result = await parser.parse(code);
    
    expect(result.metadata?.direction).toBe('TD'); // Default direction
  });
});
```

</details>

**✅ Acceptance Criteria:**
- [ ] Parser can parse simple flowchart: `A --> B`
- [ ] Parser extracts node labels correctly
- [ ] Parser extracts position metadata from comments
- [ ] Parser handles different shapes (rectangle, diamond, circle)
- [ ] Parser handles different edge types (solid, dotted, thick)
- [ ] All tests pass
- [ ] Test coverage >85%

**🐛 Common Issues:**
- **Issue**: "Cannot read properties of undefined (reading 'getVertices')"
  - **Fix**: Make sure you're adding "flowchart TD\n" prefix before parsing
- **Issue**: Position metadata not extracted
  - **Fix**: Check regex pattern, ensure JSON is valid in comments

---

*[Continuing with remaining tasks... The document will continue with Task 1.3 through Task 1.6, following the same detailed pattern]*

---

## Testing Guide

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/lib/visual-editor/parsers/FlowchartParser.test.ts

# Run tests matching pattern
npm test -- --grep "FlowchartParser"
```

### Writing Good Tests

**Structure: Arrange-Act-Assert**

```typescript
it('should do something', () => {
  // Arrange: Setup test data
  const input = 'A --> B';
  const parser = new FlowchartParser();
  
  // Act: Execute the code
  const result = await parser.parse(input);
  
  // Assert: Verify the outcome
  expect(result.nodes).toHaveLength(2);
});
```

**Test Coverage Goals:**
- Unit tests: >85% coverage
- Integration tests: Critical paths
- E2E tests: User workflows

---

## Debugging Guide

### Common Issues & Solutions

#### Issue: "Module not found"

**Symptoms**: Import errors, "Cannot find module '@/components/...'"

**Solutions:**
1. Check `tsconfig.json` has correct path mappings
2. Restart TypeScript server in VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
3. Clear cache: `rm -rf node_modules/.vite`

#### Issue: "Type error in component"

**Symptoms**: TypeScript errors about missing properties

**Solutions:**
1. Check you're importing types from `@/types`
2. Make sure types are exported from `src/types/index.ts`
3. Run `npm run build` to check for type errors

#### Issue: "React Flow not rendering"

**Symptoms**: Blank canvas, no nodes visible

**Solutions:**
1. Check that parent container has explicit height: `className="h-full"`
2. Verify nodes have `position` property
3. Check browser console for errors
4. Ensure `@xyflow/react/dist/style.css` is imported

### Browser DevTools Tips

**React DevTools:**
- Install React DevTools extension
- Inspect component props: Right-click → "Inspect Element" → Components tab
- Check state: Look for hooks in component tree

**Network Tab:**
- Check if assets are loading (fonts, styles)
- Verify no 404 errors

**Console:**
- Look for warnings about missing keys
- Check for Mermaid parsing errors

---

## Code Review Checklist

Before submitting a PR, verify:

### Code Quality
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] Test coverage >80% for new code

### Functionality
- [ ] Feature works in browser
- [ ] No console errors
- [ ] Works after page refresh (state persists)
- [ ] Works with different diagram types

### Code Style
- [ ] Named exports (not default exports)
- [ ] Components use arrow functions
- [ ] Types imported from `@/types`
- [ ] Consistent formatting (Prettier)

### Documentation
- [ ] JSDoc comments on public functions
- [ ] Complex logic has inline comments
- [ ] README updated if needed
- [ ] ADR created for architecture decisions

### Performance
- [ ] No unnecessary re-renders
- [ ] Large components lazy-loaded
- [ ] Debouncing on frequent updates

---

## Next Steps

After completing Phase 0:
1. Get code reviewed
2. Merge to main branch
3. Begin Phase 1: Flowchart MVP
4. Continue with FlowchartGenerator implementation

**Questions?** Check the [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) or ask the team!
