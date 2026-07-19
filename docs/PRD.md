# PRD: Mermaidchart Play Parity (Bidirectional Visual Builder)

## Objective
Deliver a visual, no-code builder that mirrors mermaidchart.com/play while keeping Mermaid text as the single source of truth. UI interactions must generate valid Mermaid, and text edits must rehydrate the UI when parsable. Ship vertically sliced, starting with Flowchart.

## Core Mechanics (Bidirectional Sync Engine)
- **Model:** Diagram AST (type-specific schema) ⇄ UI state ⇄ Mermaid text.
- **Text → UI:** Parse Mermaid into a typed diagram state. On parse failure, keep preview read-only and surface errors; do not mutate text.
- **UI → Text:** Every UI mutation (add node, connect, rename, delete, reorder) mutates diagram state then serializes to Mermaid string; Monaco updates immediately.
- **Reconciliation:** Stable IDs per node/edge; diff-based updates to avoid resetting selection/viewport. Undo/redo operates on diagram state snapshots.
- **Validation:** Type-specific guards (e.g., flow edges require source/target; gantt tasks require date/duration). Block serialization on invalid state with actionable errors.

## UX / UI Flow (reference: mermaidchart.com/play)
- **Modes:** Code panel + Visual Builder panel. Toggle; both stay in sync. Code edits re-render; UI edits rewrite code.
- **Canvas:** Pan/zoom, multi-select, drag to move nodes, drag handles to create connectors, delete/backspace to remove.
- **Palette:** Diagram-type-specific primitives (e.g., flow nodes/decisions/terminators; sequence participants/messages; gantt sections/tasks; pie rows; journey steps; quadrant points).
- **Inspector:** Right-rail properties for selected item; inline text editing on canvas (double-click to edit labels). Batch edit for multi-select where applicable.
- **Templates:** “Blank” plus starter templates per type; switching type swaps palette/inspector and reserializes code.
- **Shortcuts:** Undo/redo, duplicate, align/distribute (where relevant), zoom/focus, delete, add sibling/child (mindmap), add participant/message (sequence).

## Tech Stack Decisions
- **UI framework:** React (existing).
- **Canvas/graph interactions:** Adopt React Flow for graph-based types to get handles, edges, selection, zoom, and custom nodes:
  - Flowchart, State, Class, ER, GitGraph
  - Quadrant, C4, Block, Architecture
- **State management:** Zustand store for builder state + undo/redo stacks; keep Monaco state authoritative for text.
- **Parsing/serialization:** Type-specific serializers/parsers; where native Mermaid parsing is insufficient, maintain lightweight schema and serialize to compliant text.
- **Styling:** Reuse existing design tokens/components; keep preview pipeline via lib/mermaid.ts.

## Gap Analysis (Current App vs Target)
- Current: code-first Monaco + live preview, examples list, export/copy; no visual builder, no palette/inspector, no code↔UI hydration, no per-type UX.
- Target: visual-first builder with per-type primitives, inline editing, connectors, inspector forms, templates, undo/redo, selection model, and robust serializer/parser loop.
- Testing gap: no unit coverage for sync engine or e2e for UI builder flows.

## Vertical Slice Strategy
1. Foundation: add builder mode toggle, selection model, palette shell, inspector shell, parser/serializer interface, undo/redo plumbing, and Monaco sync.
2. Slice #1 (Flowchart): ship end-to-end UI creation/editing and text sync before other types.
3. Subsequent slices: one diagram type at a time using same loop (research → build → test → review).

## Risks & Mitigations
- **Parse failures:** Fallback to read-only builder; surface errors; do not overwrite user text.
- **Desync:** Stable IDs + diffing; debounce serialization; lock during invalid intermediate states.
- **Performance:** React Flow virtualization and memoization; debounce heavy sync; lazy-load type-specific inspectors.

## Acceptance Criteria for Slice #1 (Flowchart)
- Add/rename/delete nodes and connectors via UI; updates reflect in Mermaid text immediately.
- Text edits that remain valid rehydrate the builder (nodes/edges/labels) without losing selection/viewport.
- Undo/redo works for both UI and text-originated changes.
- Tests: unit for serializer/parser + sync, Playwright e2e for core flows (add node, connect, rename, delete, sync).
