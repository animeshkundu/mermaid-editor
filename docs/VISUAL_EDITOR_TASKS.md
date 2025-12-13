# Visual Editor: Task Breakdown for Implementation
**Vertical Slices for Junior Engineers**

> 🎯 **Purpose**: This document breaks down the Visual Editor project into small, manageable tasks. Each task is designed to be completed by a junior engineer in 1-3 days.

**Status**: Ready for Assignment  
**Project Board**: [GitHub Projects Link]  
**Slack Channel**: #visual-editor-dev

---

## How to Use This Document

### Task Structure

Each task includes:
- **Estimated Time**: How long it should take
- **Prerequisites**: What must be done first
- **Deliverables**: What you'll create
- **Acceptance Criteria**: How to know you're done
- **Testing**: How to verify it works
- **Code Review**: What reviewers will check

### Workflow

```
1. Pick a task from "Ready" column
2. Move to "In Progress"
3. Create feature branch: git checkout -b task-{number}-{description}
4. Implement following the spec
5. Write tests (aim for >80% coverage)
6. Self-review using checklist
7. Create PR with template
8. Address review feedback
9. Merge when approved
```

---

## Phase 0: Foundation (8 Tasks)

### Task 0.1: Type Definitions Setup

**ID**: `VE-001`  
**Estimated Time**: 2-3 hours  
**Prerequisites**: None  
**Difficulty**: ⭐ Beginner

**What You'll Do:**
Create TypeScript type definitions for the visual editor system.

**Deliverables:**
- [ ] Create `src/types/visual-editor.ts`
- [ ] Define `EditMode` type
- [ ] Define `DiagramParadigm` type
- [ ] Define `VisualState` union type
- [ ] Define `GraphVisualState` interface
- [ ] Define `VisualNode` interface
- [ ] Define `VisualEdge` interface
- [ ] Define `MermaidShape` type
- [ ] Export all types from `src/types/index.ts`

**File to Create:**
```
src/types/visual-editor.ts (250 lines)
```

**Acceptance Criteria:**
- [ ] TypeScript compiles without errors
- [ ] Can import: `import { EditMode, VisualState } from '@/types'`
- [ ] All types have JSDoc comments
- [ ] Types match the spec in VISUAL_EDITOR_TECH_SPEC.md

**Testing:**
```bash
# Create test file
src/types/visual-editor.test.ts

# Test that types work correctly
npm test -- src/types/visual-editor.test.ts
```

**Code Review Checklist:**
- [ ] All types exported from `src/types/index.ts`
- [ ] JSDoc comments explain each type's purpose
- [ ] No `any` types used
- [ ] Test file includes type validation examples

**Reference Code:**
See [VISUAL_EDITOR_TECH_SPEC.md](./VISUAL_EDITOR_TECH_SPEC.md#task-01-create-type-definitions)

---

### Task 0.2: App State Integration

**ID**: `VE-002`  
**Estimated Time**: 2-3 hours  
**Prerequisites**: VE-001  
**Difficulty**: ⭐ Beginner

**What You'll Do:**
Add visual editor state management to App.tsx without changing existing functionality.

**Deliverables:**
- [ ] Add `editMode` state with `useLocalStorage`
- [ ] Add `visualStates` state with `useLocalStorage`
- [ ] Add `currentVisualState` computed value
- [ ] Add `handleVisualStateChange` callback
- [ ] Verify existing app still works

**Files to Modify:**
```
src/App.tsx (modify: +15 lines)
```

**Acceptance Criteria:**
- [ ] App compiles without errors
- [ ] localStorage shows `edit-mode` key (check DevTools)
- [ ] localStorage shows `visual-states` key
- [ ] Existing diagram functionality unchanged
- [ ] Can manually toggle editMode in console

**Testing:**
```bash
# Manual test in browser console
localStorage.setItem('edit-mode', '"visual"')
localStorage.setItem('edit-mode', '"text"')

# Check localStorage in DevTools
Application → Local Storage → http://localhost:5000
```

**Code Review Checklist:**
- [ ] No breaking changes to existing state
- [ ] localStorage keys follow naming convention
- [ ] State types are correctly typed
- [ ] useCallback dependencies are correct

**Debug Tips:**
- If localStorage doesn't persist, check `useLocalStorage` hook
- If types error, verify imports from `@/types`

---

### Task 0.3: Empty State Component

**ID**: `VE-003`  
**Estimated Time**: 2 hours  
**Prerequisites**: VE-001  
**Difficulty**: ⭐ Beginner

**What You'll Do:**
Create a placeholder component to show when visual editing isn't available.

**Deliverables:**
- [ ] Create `src/components/visual-editor/EmptyState.tsx`
- [ ] Component accepts `message` and optional `title` props
- [ ] Uses shadcn/ui Alert component
- [ ] Uses Phosphor icon (Info, duotone weight)
- [ ] Write unit tests

**Files to Create:**
```
src/components/visual-editor/EmptyState.tsx (40 lines)
src/components/visual-editor/EmptyState.test.tsx (60 lines)
```

**Acceptance Criteria:**
- [ ] Component renders message prop
- [ ] Component renders custom title
- [ ] Component uses default title "Coming Soon"
- [ ] Uses shadcn/ui Alert styling
- [ ] All tests pass

**Example Usage:**
```tsx
<EmptyState 
  message="Visual editing for flowchart diagrams is coming soon!"
  title="Visual Editor"
/>
```

**Testing:**
```bash
npm test -- src/components/visual-editor/EmptyState.test.tsx
```

**Code Review Checklist:**
- [ ] Uses Phosphor icon (not Lucide)
- [ ] Proper TypeScript interfaces for props
- [ ] Tests cover all props variations
- [ ] Follows existing component patterns

---

### Task 0.4: Visual Editor Registry Component

**ID**: `VE-004`  
**Estimated Time**: 3 hours  
**Prerequisites**: VE-001, VE-003  
**Difficulty**: ⭐ Beginner

**What You'll Do:**
Create the router component that will switch between different visual editors (for now, just shows empty state).

**Deliverables:**
- [ ] Create `src/components/visual-editor/VisualEditorRegistry.tsx`
- [ ] Component accepts `diagramType`, `visualState`, `onChange` props
- [ ] Shows EmptyState for all diagram types (Phase 0)
- [ ] Write unit tests

**Files to Create:**
```
src/components/visual-editor/VisualEditorRegistry.tsx (50 lines)
src/components/visual-editor/VisualEditorRegistry.test.tsx (80 lines)
```

**Acceptance Criteria:**
- [ ] Component renders EmptyState
- [ ] Message includes diagram type name
- [ ] onChange callback typed correctly
- [ ] Tests verify different diagram types show different messages
- [ ] All TypeScript types are correct

**Testing:**
```bash
npm test -- src/components/visual-editor/VisualEditorRegistry.test.tsx
```

**Code Review Checklist:**
- [ ] Props interface is well-documented
- [ ] Component is exported (named export, not default)
- [ ] Tests check multiple diagram types
- [ ] No console warnings when rendering

---

### Task 0.5: Layout Integration

**ID**: `VE-005`  
**Estimated Time**: 3-4 hours  
**Prerequisites**: VE-002, VE-004  
**Difficulty**: ⭐⭐ Intermediate

**What You'll Do:**
Integrate the VisualEditorRegistry into App.tsx layout, creating a 3-panel view when in visual mode.

**Deliverables:**
- [ ] Import VisualEditorRegistry in App.tsx
- [ ] Add third ResizablePanel when `editMode === 'visual'`
- [ ] Add ResizableHandle between panels
- [ ] Panel has header with title
- [ ] Panel uses flex layout for future content
- [ ] Test layout switches correctly

**Files to Modify:**
```
src/App.tsx (modify: +30 lines)
```

**Acceptance Criteria:**
- [ ] 2-panel layout in text mode (unchanged)
- [ ] 3-panel layout in visual mode
- [ ] Panels are resizable
- [ ] Visual panel has proper header
- [ ] No layout shift/flash when toggling
- [ ] localStorage persists mode across refresh

**Visual Test:**
1. Toggle to visual mode
2. Should see 3 panels: Code | Preview | Visual
3. Drag resize handles - should work smoothly
4. Refresh page - should remember visual mode
5. Toggle back to text mode - should show 2 panels

**Code Review Checklist:**
- [ ] ResizablePanel has sensible default sizes (33% each)
- [ ] ResizablePanel has minSize (at least 20)
- [ ] Conditional rendering doesn't cause layout jump
- [ ] Props passed to VisualEditorRegistry are correct

**Debug Tips:**
- If panels don't resize: check ResizableHandle between panels
- If layout jumps: add CSS transition or ensure heights are set

---

### Task 0.6: Toolbar Mode Toggle

**ID**: `VE-006`  
**Estimated Time**: 3-4 hours  
**Prerequisites**: VE-001, VE-002  
**Difficulty**: ⭐⭐ Intermediate

**What You'll Do:**
Add Code/Visual toggle buttons to the toolbar using shadcn/ui ToggleGroup.

**Deliverables:**
- [ ] Add imports to Toolbar.tsx (ToggleGroup, Phosphor icons)
- [ ] Add `editMode`, `onEditModeChange`, `isVisualSupported` to ToolbarProps
- [ ] Create toggle group with Code and Visual buttons
- [ ] Add "BETA" badge to Visual button
- [ ] Update App.tsx to pass new props
- [ ] Write tests

**Files to Modify:**
```
src/components/Toolbar.tsx (modify: +40 lines)
src/App.tsx (modify: +5 lines)
```

**Files to Create:**
```
src/components/Toolbar.test.tsx (or modify existing: +80 lines)
```

**Acceptance Criteria:**
- [ ] Toggle buttons appear in toolbar
- [ ] Clicking Code/Visual changes mode
- [ ] Active button highlighted
- [ ] BETA badge visible on Visual button
- [ ] Visual button can be disabled (via `isVisualSupported`)
- [ ] State persists in localStorage
- [ ] Tests verify toggle behavior

**Visual Design:**
```
┌─────────┬─────────┐
│ ● Code  │ ○ Visual│ ← "BETA" badge on Visual
└─────────┴─────────┘
```

**Testing:**
```bash
# Unit tests
npm test -- src/components/Toolbar.test.tsx

# Manual test
1. Click "Visual" - layout changes to 3 panels
2. Click "Code" - layout changes to 2 panels
3. Refresh - should remember choice
```

**Code Review Checklist:**
- [ ] Uses Phosphor icons (Code, Cursor) with duotone weight
- [ ] ToggleGroup has `type="single"` for exclusive selection
- [ ] Badge uses shadcn/ui Badge component
- [ ] Visual button disabled state works
- [ ] Tests use @testing-library/react conventions

---

### Task 0.7: Phase 0 Testing Suite

**ID**: `VE-007`  
**Estimated Time**: 4 hours  
**Prerequisites**: VE-001 through VE-006  
**Difficulty**: ⭐⭐ Intermediate

**What You'll Do:**
Create comprehensive test suite for Phase 0 components and ensure >80% coverage.

**Deliverables:**
- [ ] Type definition tests
- [ ] EmptyState component tests
- [ ] VisualEditorRegistry tests
- [ ] Toolbar toggle integration tests
- [ ] Coverage report >80%

**Files to Verify:**
```
src/types/visual-editor.test.ts
src/components/visual-editor/EmptyState.test.tsx
src/components/visual-editor/VisualEditorRegistry.test.tsx
src/components/Toolbar.test.tsx (new or modified)
```

**Acceptance Criteria:**
- [ ] All test files pass
- [ ] Coverage >80% for new code
- [ ] No console warnings during tests
- [ ] Tests use consistent patterns

**Running Tests:**
```bash
# Run all visual editor tests
npm test -- src/components/visual-editor/

# Run with coverage
npm run test:coverage

# Check coverage report
open coverage/index.html
```

**Coverage Goals:**
- Type definitions: 100% (type-only, covered by usage)
- EmptyState: >90%
- VisualEditorRegistry: >85%
- Toolbar additions: >80%

**Code Review Checklist:**
- [ ] Tests follow Arrange-Act-Assert pattern
- [ ] Tests have descriptive names
- [ ] No duplicate test logic
- [ ] Mock data is realistic
- [ ] Tests cleanup after themselves

---

### Task 0.8: Phase 0 Documentation

**ID**: `VE-008`  
**Estimated Time**: 2 hours  
**Prerequisites**: VE-001 through VE-007  
**Difficulty**: ⭐ Beginner

**What You'll Do:**
Document Phase 0 implementation and create onboarding guide for future developers.

**Deliverables:**
- [ ] Update README.md with visual editor section
- [ ] Create CHANGELOG entry for Phase 0
- [ ] Add JSDoc comments to all public functions
- [ ] Create demo GIF or video of mode toggle

**Files to Modify/Create:**
```
README.md (modify: +20 lines)
CHANGELOG.md (modify: +15 lines)
docs/assets/visual-editor-demo.gif (new)
```

**Acceptance Criteria:**
- [ ] README explains visual editor feature
- [ ] README shows how to toggle modes
- [ ] CHANGELOG lists Phase 0 changes
- [ ] All public functions have JSDoc
- [ ] Demo GIF shows mode toggle in action

**README Section to Add:**
```markdown
## Visual Editor (Beta)

The Visual Editor allows you to create Mermaid diagrams using a drag-and-drop interface.

### Toggling Between Modes

Click the **Visual** button in the toolbar to switch to visual editing mode. 
Currently supported:
- ✅ Flowchart diagrams (coming in Phase 1)
- 🚧 Sequence diagrams (planned)
- 🚧 Gantt charts (planned)

[Demo GIF]
```

**Code Review Checklist:**
- [ ] Documentation is clear and concise
- [ ] No broken links
- [ ] GIF is optimized (<1MB)
- [ ] CHANGELOG follows keep-a-changelog format

---

## Phase 1: Flowchart MVP (10 Tasks)

### Task 1.1: MermaidASTService Foundation

**ID**: `VE-101`  
**Estimated Time**: 4 hours  
**Prerequisites**: Phase 0 complete  
**Difficulty**: ⭐⭐ Intermediate

**What You'll Do:**
Create the service layer that abstracts Mermaid's parser APIs.

**Deliverables:**
- [ ] Create `src/lib/visual-editor/types.ts`
- [ ] Create `src/lib/visual-editor/MermaidASTService.ts`
- [ ] Implement `registerParser()` method
- [ ] Implement `registerGenerator()` method
- [ ] Implement `parse()` method (stub for now)
- [ ] Implement `generate()` method (stub for now)
- [ ] Implement `validate()` method
- [ ] Write comprehensive tests

**Files to Create:**
```
src/lib/visual-editor/types.ts (80 lines)
src/lib/visual-editor/MermaidASTService.ts (150 lines)
src/lib/visual-editor/MermaidASTService.test.ts (200 lines)
```

**Acceptance Criteria:**
- [ ] Service is a singleton (exported instance)
- [ ] `parse()` returns null when no parser registered
- [ ] `generate()` throws error when no generator registered
- [ ] `validate()` checks for duplicate node IDs
- [ ] `validate()` checks edges reference valid nodes
- [ ] All tests pass with >85% coverage

**Reference:**
See [VISUAL_EDITOR_TECH_SPEC.md Task 1.1](./VISUAL_EDITOR_TECH_SPEC.md#task-11-create-mermaidastservice-foundation)

**Testing:**
```typescript
// Example test
it('should validate graph state', () => {
  const state: GraphVisualState = {
    paradigm: 'graph',
    nodes: [{ id: 'A', ... }],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };
  
  const result = astService.validate(state);
  expect(result.valid).toBe(true);
});
```

**Code Review Checklist:**
- [ ] Service follows singleton pattern
- [ ] Methods have clear JSDoc comments
- [ ] Error messages are helpful
- [ ] Tests cover edge cases (empty nodes, invalid edges)

---

### Task 1.2: FlowchartParser Implementation

**ID**: `VE-102`  
**Estimated Time**: 8 hours  
**Prerequisites**: VE-101  
**Difficulty**: ⭐⭐⭐ Advanced

**What You'll Do:**
Implement parser that converts Mermaid flowchart text to GraphVisualState.

**Deliverables:**
- [ ] Create `src/lib/visual-editor/parsers/FlowchartParser.ts`
- [ ] Implement `parse()` method
- [ ] Implement `extractPositionMetadata()` helper
- [ ] Implement `generateDefaultPosition()` helper
- [ ] Implement shape mapping methods
- [ ] Register parser with astService
- [ ] Write comprehensive tests

**Files to Create:**
```
src/lib/visual-editor/parsers/FlowchartParser.ts (300 lines)
src/lib/visual-editor/parsers/FlowchartParser.test.ts (350 lines)
```

**Key Algorithms:**

1. **Position Extraction:**
```typescript
// Extract from: A[Label] %%{"position":{"x":100,"y":50}}%%
const regex = /(\w+)(?:\[.*?\]|\(.*?\))\s*%%(\{.*?\})%%/g;
```

2. **Shape Mapping:**
```typescript
// Map Mermaid shape to our MermaidShape type
'square' → 'rectangle'
'diamond' → 'rhombus'
'round' → 'rounded'
```

**Acceptance Criteria:**
- [ ] Parses simple flowchart: `A --> B`
- [ ] Extracts node labels correctly
- [ ] Extracts position metadata from comments
- [ ] Handles 10+ different Mermaid shapes
- [ ] Handles 4+ edge types (solid, dotted, thick, open)
- [ ] Preserves edge labels
- [ ] Generates default positions for nodes without metadata
- [ ] All tests pass with >85% coverage

**Testing Strategy:**
```typescript
// Test categories:
1. Simple flowcharts (2-3 nodes)
2. Complex flowcharts (10+ nodes)
3. Different shapes
4. Different edge types
5. Position metadata extraction
6. Error handling (invalid syntax)
```

**Code Review Checklist:**
- [ ] Uses Mermaid's Diagram.fromText API correctly
- [ ] Accesses diagram.db safely (handles undefined)
- [ ] Position regex is robust
- [ ] Default positions are deterministic (same input = same output)
- [ ] Tests verify round-trip: text → AST → text → AST

**Debug Tips:**
- Use browser console to inspect: `diagram.db.getVertices()`
- Check Mermaid's source code for shape type strings
- Test regex at regex101.com

---

### Task 1.3: FlowchartGenerator Implementation

**ID**: `VE-103`  
**Estimated Time**: 6 hours  
**Prerequisites**: VE-102  
**Difficulty**: ⭐⭐⭐ Advanced

**What You'll Do:**
Implement generator that converts GraphVisualState to Mermaid flowchart text.

**Deliverables:**
- [ ] Create `src/lib/visual-editor/generators/FlowchartGenerator.ts`
- [ ] Implement `generate()` method
- [ ] Implement `getShapeSyntax()` helper
- [ ] Implement `getConnectorSyntax()` helper
- [ ] Register generator with astService
- [ ] Write comprehensive tests including round-trip tests

**Files to Create:**
```
src/lib/visual-editor/generators/FlowchartGenerator.ts (200 lines)
src/lib/visual-editor/generators/FlowchartGenerator.test.ts (300 lines)
```

**Key Algorithms:**

1. **Shape Syntax Generation:**
```typescript
'rectangle' → ['[', ']']    // A[Label]
'rhombus' → ['{', '}']      // A{Label}
'rounded' → ['(', ')']      // A(Label)
'stadium' → ['([', '])']    // A([Label])
```

2. **Metadata Injection:**
```typescript
// Inject position as comment
`${nodeId}[${label}] %%{"position":{"x":${x},"y":${y}}}%%`
```

**Acceptance Criteria:**
- [ ] Generates valid Mermaid syntax
- [ ] Includes `flowchart TD` header (or LR/BT/RL based on metadata)
- [ ] Generates correct shape syntax for all MermaidShape types
- [ ] Injects position metadata as comments
- [ ] Preserves edge labels
- [ ] Generates correct edge connectors (-->, -.-->, ==>, ---)
- [ ] Round-trip test: text → parse → generate → parse produces same AST
- [ ] All tests pass with >85% coverage

**Testing:**
```typescript
// Critical: Round-trip test
it('should round-trip without data loss', async () => {
  const originalCode = 'flowchart TD\n  A[Start] --> B[End]';
  
  const parser = new FlowchartParser();
  const ast1 = await parser.parse(originalCode);
  
  const generator = new FlowchartGenerator();
  const generated = await generator.generate(ast1);
  
  const ast2 = await parser.parse(generated);
  
  expect(ast1).toEqual(ast2); // Must be identical!
});
```

**Code Review Checklist:**
- [ ] Generated code is properly formatted (indentation)
- [ ] Shape syntax mapping is complete (covers all shapes)
- [ ] Position metadata is valid JSON
- [ ] Round-trip tests pass
- [ ] Generated code can be rendered by Mermaid

---

### Task 1.4: SyncEngine Implementation

**ID**: `VE-104`  
**Estimated Time**: 6 hours  
**Prerequisites**: VE-102, VE-103  
**Difficulty**: ⭐⭐⭐ Advanced

**What You'll Do:**
Create the synchronization engine that manages bidirectional updates between text and visual modes.

**Deliverables:**
- [ ] Create `src/lib/visual-editor/SyncEngine.ts`
- [ ] Implement `syncTextToVisual()` with debouncing
- [ ] Implement `syncVisualToText()` with debouncing
- [ ] Implement hash-based change detection
- [ ] Write integration tests
- [ ] Test infinite loop prevention

**Files to Create:**
```
src/lib/visual-editor/SyncEngine.ts (200 lines)
src/lib/visual-editor/SyncEngine.test.ts (250 lines)
```

**Key Algorithms:**

1. **Hash-based Change Detection:**
```typescript
private hash(data: string): string {
  // Prevent unnecessary syncs if data unchanged
  return btoa(data).slice(0, 16);
}
```

2. **Debouncing:**
```typescript
syncTextToVisual = debounce(this._syncTextToVisual, 300);
```

**Acceptance Criteria:**
- [ ] Sync only fires if content actually changed (hash check)
- [ ] Debouncing prevents excessive updates (300ms delay)
- [ ] Handles parse errors gracefully (returns null)
- [ ] No infinite loops (text→visual→text→...)
- [ ] Works with FlowchartParser and FlowchartGenerator
- [ ] All tests pass

**Testing:**
```typescript
it('should not sync if content unchanged', async () => {
  const engine = new SyncEngine();
  const code = 'A --> B';
  
  await engine.syncTextToVisual(code, 'flowchart');
  const result = await engine.syncTextToVisual(code, 'flowchart');
  
  expect(result).toBeNull(); // No change, returns null
});
```

**Code Review Checklist:**
- [ ] Uses debounce utility (from @/lib/utils or lodash)
- [ ] Hash function is fast and deterministic
- [ ] Error handling doesn't crash app
- [ ] Tests verify debouncing works
- [ ] Tests verify infinite loop prevention

---

*[Tasks 1.5 through 1.10 would continue with similar detail...]*

---

## Task Assignment Process

### How to Pick a Task

1. **Check Prerequisites**: Make sure all prerequisite tasks are merged
2. **Estimate Your Capacity**: Be realistic about time
3. **Assign Yourself**: Move card to "In Progress" and add your name
4. **Create Branch**: `git checkout -b task-{number}-{brief-description}`

### Branch Naming

```bash
# Format: task-{ID}-{brief-description}
git checkout -b task-VE-001-type-definitions
git checkout -b task-VE-102-flowchart-parser
```

### Commit Messages

```bash
# Format: [Task ID] Description
git commit -m "[VE-001] Add visual editor type definitions"
git commit -m "[VE-102] Implement FlowchartParser with position metadata extraction"
```

### Pull Request Template

```markdown
## Task ID
VE-001

## Description
Implements visual editor type definitions including EditMode, VisualState, and all related interfaces.

## Checklist
- [x] Code compiles without errors
- [x] All tests pass
- [x] Test coverage >80%
- [x] JSDoc comments added
- [x] Self-reviewed using checklist
- [x] No console warnings

## Testing
```bash
npm test -- src/types/visual-editor.test.ts
```

## Screenshots
[If applicable]

## Related Issues
Closes #123
```

---

## Getting Help

### Resources

- **Technical Spec**: [VISUAL_EDITOR_TECH_SPEC.md](./VISUAL_EDITOR_TECH_SPEC.md)
- **Architecture**: [ADR/002-visual-editor-architecture.md](./ADR/002-visual-editor-architecture.md)
- **Product Requirements**: [VISUAL_EDITOR_PRD.md](./VISUAL_EDITOR_PRD.md)
- **Slack**: #visual-editor-dev
- **Office Hours**: Tuesdays 2-3pm, Thursdays 10-11am

### Common Questions

**Q: What if I don't understand a requirement?**  
A: Ask in Slack before starting. It's better to clarify than to build the wrong thing.

**Q: What if a task is taking longer than estimated?**  
A: Post an update in Slack. We can break it down further or pair program.

**Q: What if I find a bug in existing code?**  
A: Create a separate issue. Don't mix bug fixes with feature work.

**Q: What if tests are failing?**  
A: Check the Debugging Guide in VISUAL_EDITOR_TECH_SPEC.md. Ask for help if stuck >30min.

---

## Progress Tracking

### Phase 0 Checklist

- [ ] VE-001: Type Definitions Setup
- [ ] VE-002: App State Integration
- [ ] VE-003: Empty State Component
- [ ] VE-004: Visual Editor Registry
- [ ] VE-005: Layout Integration
- [ ] VE-006: Toolbar Mode Toggle
- [ ] VE-007: Phase 0 Testing Suite
- [ ] VE-008: Phase 0 Documentation

**Phase 0 Definition of Done:**
- All 8 tasks merged to main
- E2E test: User can toggle between Code and Visual modes
- Documentation updated
- Demo to team completed

### Phase 1 Checklist

- [ ] VE-101: MermaidASTService Foundation
- [ ] VE-102: FlowchartParser Implementation
- [ ] VE-103: FlowchartGenerator Implementation
- [ ] VE-104: SyncEngine Implementation
- [ ] VE-105: React Flow Integration
- [ ] VE-106: GraphCanvasEditor Component
- [ ] VE-107: FlowchartNode Custom Component
- [ ] VE-108: Visual-to-Text Sync Wiring
- [ ] VE-109: Phase 1 Testing Suite
- [ ] VE-110: Phase 1 Documentation

**Phase 1 Definition of Done:**
- All 10 tasks merged to main
- E2E test: User can create a flowchart visually
- E2E test: Visual changes sync to text editor
- Demo video created
- Beta release deployed

---

**Last Updated**: December 13, 2024  
**Next Review**: End of Phase 0
