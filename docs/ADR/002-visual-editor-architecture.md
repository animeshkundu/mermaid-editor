# ADR 002: Visual Editor Architecture

## Status
**Proposed** - December 13, 2024

## Context

We are building a **Universal Visual Editor** for Mermaid diagrams to complement our existing text-based editor. This represents a fundamental shift in product architecture, introducing bidirectional editing (text ↔ visual) while maintaining our core principle of being client-side only.

### Problem Statement

Current state:
- Users must write Mermaid syntax manually
- Barrier to entry for non-technical users
- No visual feedback during diagram construction
- Competitor (MermaidChart.com) offers visual editing with cloud dependency

### Goals

1. Enable visual editing for all major Mermaid diagram types
2. Maintain seamless synchronization between text and visual modes
3. Preserve client-side-only architecture (no backend)
4. Build extensible foundation for future diagram types
5. Keep bundle size reasonable (<500KB total)

### Constraints

- **Client-Side Only**: All processing in browser
- **No Breaking Changes**: Existing text editor must continue to work
- **localStorage Limits**: Visual state can't exceed ~5MB
- **Mermaid Compatibility**: Must work with Mermaid v11+ parser APIs

## Decision

We will implement a **Multi-Paradigm Visual Platform** with the following architectural decisions:

### 1. State Management: Centralized in App.tsx

**Decision**: Continue pattern of all `useLocalStorage` calls living in `App.tsx`, but add visual editor state.

**Rationale**:
- Existing pattern works well for text editor
- Single source of truth prevents sync bugs
- Easy to serialize entire app state for export/import

**Implementation**:
```typescript
// App.tsx - NEW STATE
const [editMode, setEditMode] = useLocalStorage<'text' | 'visual'>('edit-mode', 'text');
const [visualStates, setVisualStates] = useLocalStorage<VisualStates>('visual-states', {});

// App.tsx - EXISTING STATE (unchanged)
const [code, setCode] = useLocalStorage('mermaid-code', DEFAULT_DIAGRAM_CODE);
const [config, setConfig] = useLocalStorage('mermaid-config', DEFAULT_MERMAID_CONFIG);
```

**Alternatives Considered**:
- ❌ **Zustand store**: Adds dependency, overkill for current scale
- ❌ **Context + useReducer**: More complex than needed
- ✅ **Direct localStorage + React state**: Simple, performant, proven

### 2. Parsing Strategy: Hybrid Approach

**Decision**: Use **metadata comments** for position/layout data, with **external store** as fallback.

**Rationale**:
- Mermaid parsers are lossy (strip comments, whitespace)
- Need to preserve user-created positions across text edits
- Metadata comments keep related data together
- External store handles edge cases

**Implementation**:
```typescript
// PRIMARY: Metadata comments
flowchart TD
    A[Start] %%{"position":{"x":100,"y":50},"color":"#ff0000"}%%
    B[End] %%{"position":{"x":300,"y":50}}%%

// FALLBACK: External position store (localStorage)
{
  "visualPositions": {
    "flowchart-hash-abc123": {
      "A": { "x": 100, "y": 50 },
      "B": { "x": 300, "y": 50 }
    }
  }
}
```

**Alternatives Considered**:
- ❌ **Mermaid native positioning**: Limited support, not all diagrams
- ❌ **Only external store**: Positions divorced from diagram content
- ✅ **Hybrid**: Best of both worlds

### 3. Editor Architecture: Paradigm-Based Registry

**Decision**: Group diagrams by **interaction paradigm**, not by diagram type. Use registry pattern to route to correct editor.

**Rationale**:
- Flowcharts, State, Class, ER all need same canvas interaction
- Avoids code duplication
- Easy to extend with new diagram types
- Clear separation of concerns

**Implementation**:
```typescript
// Four distinct paradigms
enum DiagramParadigm {
  GRAPH = 'graph',        // Node-link manipulation
  RAIL = 'rail',          // Constrained lifelines
  TIMELINE = 'timeline',  // Scheduler-style
  DATA = 'data'          // Form/table editing
}

// Registry maps diagram type → paradigm → component
const PARADIGM_MAP: Record<DiagramType, DiagramParadigm> = {
  'flowchart': DiagramParadigm.GRAPH,
  'state': DiagramParadigm.GRAPH,
  'class': DiagramParadigm.GRAPH,
  'sequence': DiagramParadigm.RAIL,
  'gantt': DiagramParadigm.TIMELINE,
  'pie': DiagramParadigm.DATA,
};

const EDITOR_COMPONENTS: Record<DiagramParadigm, React.ComponentType> = {
  [DiagramParadigm.GRAPH]: GraphCanvasEditor,
  [DiagramParadigm.RAIL]: SequenceRailEditor,
  [DiagramParadigm.TIMELINE]: TimelineSchedulerEditor,
  [DiagramParadigm.DATA]: DataTableEditor,
};
```

**Alternatives Considered**:
- ❌ **One editor per diagram type**: Too much duplication
- ❌ **Single universal editor**: Too complex, doesn't fit paradigms
- ✅ **Paradigm-based registry**: Optimal code reuse

### 4. Synchronization: Debounced Bidirectional Sync

**Decision**: Use **SyncEngine** service with debounced transformations.

**Rationale**:
- Visual changes happen rapidly (every drag event)
- Don't want to regenerate text on every pixel move
- Need to prevent infinite loops (text → visual → text)
- Debouncing provides smooth UX

**Implementation**:
```typescript
class SyncEngine {
  private textToVisualDebounce = debounce(this.syncTextToVisual, 300);
  private visualToTextDebounce = debounce(this.syncVisualToText, 300);
  
  private lastCodeHash: string = '';
  private lastVisualHash: string = '';
  
  async syncTextToVisual(code: string): Promise<VisualState | null> {
    const hash = this.hash(code);
    if (hash === this.lastCodeHash) return null; // Skip if unchanged
    
    const ast = await this.parser.parse(code);
    this.lastCodeHash = hash;
    return this.astToVisualState(ast);
  }
  
  async syncVisualToText(visualState: VisualState): Promise<string> {
    const hash = this.hash(JSON.stringify(visualState));
    if (hash === this.lastVisualHash) return null;
    
    const code = await this.generator.generate(visualState);
    this.lastVisualHash = hash;
    return code;
  }
}
```

**Alternatives Considered**:
- ❌ **Immediate sync**: Too many updates, performance issues
- ❌ **Manual sync button**: Poor UX, easy to forget
- ✅ **Debounced automatic sync**: Best balance

### 5. Graph Canvas: React Flow

**Decision**: Use **React Flow** (`@xyflow/react`) for all graph-based diagrams (Group A).

**Rationale**:
- Mature library (34K+ stars, 3M+ weekly installs)
- MIT licensed
- Excellent TypeScript support
- Built-in features: zoom, pan, drag, multi-select
- Used by production apps (Stripe, Typeform)
- Extensible with custom nodes/edges

**Bundle Impact**: ~150KB gzipped (acceptable given features)

**Alternatives Considered**:
| Library | Stars | License | Decision | Reason |
|---------|-------|---------|----------|--------|
| React Flow | 34.2K | MIT | ✅ Selected | Best overall fit |
| Cytoscape | 10K | LGPL | ❌ | Complex API, LGPL concerns |
| Reaflow | 2K | Apache 2.0 | ❌ | Less mature, smaller community |
| GoJS | N/A | Commercial | ❌ | Not open source |

### 6. Data Flow: Unidirectional Updates

**Decision**: Visual editors never directly mutate code. All changes flow through SyncEngine.

**Rationale**:
- Predictable state updates
- Easier debugging
- Enables undo/redo in future
- Prevents race conditions

**Flow Diagram**:
```
User drags node in GraphCanvasEditor
              │
              ▼
onChange(newVisualState) fired
              │
              ▼
SyncEngine.syncVisualToText(newVisualState)
              │
              ▼
newCode = await generator.generate(visualState)
              │
              ▼
setCode(newCode) ◄── This updates App.tsx state
              │
              ▼
CodeEditor re-renders with new code
DiagramPreview re-renders with new SVG
VisualEditor updates from visualState
```

### 7. Parser Abstraction: Service Layer

**Decision**: Create **MermaidASTService** to abstract Mermaid's heterogeneous parsers.

**Rationale**:
- Mermaid has 2 parser types: JISON (legacy) and Langium (modern)
- Each has different API surface
- Need consistent interface for visual editors
- Isolates breaking changes in Mermaid internals

**Implementation**:
```typescript
interface MermaidASTService {
  parse(diagramType: DiagramType, code: string): Promise<DiagramAST>;
  generate(diagramType: DiagramType, ast: DiagramAST): Promise<string>;
  validate(ast: DiagramAST): ValidationResult;
}

// Internal: Per-diagram parsers
class FlowchartParser implements Parser {
  async parse(code: string): Promise<GraphAST> {
    // Use Diagram.fromText to access db
    const diagram = await Diagram.fromText(`flowchart TD\n${code}`);
    const nodes = diagram.db.getVertices();
    const edges = diagram.db.getEdges();
    
    return this.buildAST(nodes, edges);
  }
}

class PieParser implements Parser {
  async parse(code: string): Promise<DataAST> {
    // Use @mermaid-js/parser for Langium diagrams
    const ast: Pie = await parse('pie', code);
    return this.buildAST(ast);
  }
}
```

### 8. Error Handling: Graceful Degradation

**Decision**: If code is invalid, **disable visual mode** but keep text editor working.

**Rationale**:
- Never block user from editing
- Text editor is source of truth
- Visual mode is enhancement, not requirement

**Implementation**:
```typescript
// In VisualEditorRegistry
const [parseError, setParseError] = useState<Error | null>(null);

useEffect(() => {
  syncEngine.syncTextToVisual(code)
    .then(setVisualState)
    .catch(error => {
      setParseError(error);
      setVisualState(null); // Disable visual editing
    });
}, [code]);

if (parseError) {
  return (
    <Alert variant="warning">
      <AlertCircle />
      <AlertTitle>Visual editing unavailable</AlertTitle>
      <AlertDescription>
        Fix syntax errors in the code editor to enable visual mode.
      </AlertDescription>
    </Alert>
  );
}
```

### 9. Performance: Lazy Loading & Code Splitting

**Decision**: Lazy load visual editor components and React Flow.

**Rationale**:
- Don't penalize users who only use text editor
- React Flow is ~150KB
- Keep initial bundle small
- Visual editors are opt-in feature

**Implementation**:
```typescript
// Lazy load editors
const GraphCanvasEditor = lazy(() => import('./graph/GraphCanvasEditor'));
const SequenceRailEditor = lazy(() => import('./sequence/SequenceRailEditor'));

// Code split by diagram type
const editorImports: Record<DiagramType, () => Promise<any>> = {
  'flowchart': () => import('./graph/GraphCanvasEditor'),
  'sequence': () => import('./sequence/SequenceRailEditor'),
  // ...
};

// In VisualEditorRegistry
<Suspense fallback={<LoadingSpinner />}>
  <EditorComponent {...props} />
</Suspense>
```

### 10. Testing Strategy: Multi-Layer Validation

**Decision**: Test at 3 levels: unit (parsers), integration (sync), e2e (UI).

**Layers**:
1. **Unit Tests**: Parser round-trip validation
2. **Integration Tests**: SyncEngine correctness
3. **E2E Tests**: User workflows (Playwright)

**Example**:
```typescript
// Unit: Parser round-trip
test('flowchart parser preserves structure', async () => {
  const code = 'flowchart TD\n    A --> B';
  const ast1 = await parser.parse(code);
  const generated = await parser.generate(ast1);
  const ast2 = await parser.parse(generated);
  expect(ast1).toEqual(ast2); // Must be identical
});

// Integration: Sync engine
test('visual changes sync to text', async () => {
  const engine = new SyncEngine();
  const visualState = { nodes: [...], edges: [...] };
  
  const code = await engine.syncVisualToText(visualState);
  const roundTrip = await engine.syncTextToVisual(code);
  
  expect(roundTrip).toEqual(visualState);
});

// E2E: User workflow
test('user can drag nodes visually', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Visual")');
  await page.locator('[data-id="nodeA"]').dragTo(
    page.locator('body'),
    { targetPosition: { x: 500, y: 300 } }
  );
  await page.click('button:has-text("Code")');
  
  const code = await page.locator('.monaco-editor').inputValue();
  expect(code).toContain('%%{"position"');
});
```

## Consequences

### Positive

1. **User Accessibility**: Non-technical users can create diagrams visually
2. **Competitive Parity**: Matches MermaidChart features while staying client-side
3. **Extensibility**: Easy to add new diagram types following paradigm pattern
4. **Performance**: Lazy loading keeps initial bundle small
5. **Maintainability**: Clear separation of concerns, testable architecture

### Negative

1. **Complexity**: Significant increase in codebase size (~5,000 new lines)
2. **Bundle Size**: ~150KB added for React Flow (mitigated by lazy loading)
3. **Maintenance Burden**: Need to track Mermaid parser changes
4. **Learning Curve**: Team needs to learn React Flow APIs
5. **Lossy Conversions**: Some text→visual→text transformations lose formatting

### Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Mermaid API breaking changes | Pin to specific version, abstract parsers |
| Performance issues with large diagrams | Virtual rendering, pagination at 100+ nodes |
| localStorage quota exceeded | Cleanup old states, warn at 80% capacity |
| User confusion with dual modes | Clear mode indicators, onboarding tooltips |
| Sync bugs (infinite loops) | Hash-based change detection, debouncing |

## Implementation Plan

See [VISUAL_EDITOR_ROADMAP.md](../VISUAL_EDITOR_ROADMAP.md) for detailed phased rollout.

**Summary**:
- **Phase 0** (Month 1-2): Infrastructure setup
- **Phase 1** (Month 3-4): Flowchart MVP (React Flow)
- **Phase 2** (Month 5-6): Graph family expansion
- **Phase 3** (Month 7-8): Sequence diagrams
- **Phase 4** (Month 9-10): Timeline diagrams  
- **Phase 5** (Month 11-12): Data-driven diagrams
- **Phase 6** (Month 12+): Polish & production

## References

- [VISUAL_EDITOR_PRD.md](../VISUAL_EDITOR_PRD.md) - Full product requirements
- [React Flow Documentation](https://reactflow.dev/)
- [Mermaid Parser Source](https://github.com/mermaid-js/mermaid/tree/develop/packages/parser)
- [Diagram.fromText API](https://github.com/mermaid-js/mermaid/blob/develop/packages/mermaid/src/Diagram.ts)

## Approval

- [ ] Product Manager: _____________________
- [ ] Lead Engineer: _____________________
- [ ] Principal Architect: _____________________
- [ ] QA Lead: _____________________

**Next Review Date**: January 15, 2025
