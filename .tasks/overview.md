# Visual Builder Architecture & Implementation Spec

## High-Level Architecture
- **State sources**: Monaco code (string) remains the single source of truth; Visual Builder maintains typed diagram state derived from code. Sync is bidirectional with debounced serializer/parser per diagram type.
- **Core modules**:
  - **Parser/Serializer layer**: type-safe converters for each diagram (Flowchart first) -> React Flow node/edge state (or table-based state for non-graph diagrams) and back to Mermaid text.
  - **Builder Canvas**: React Flow for graph-like diagrams; table/grid editors for tabular types (pie, journey, gantt, sankey, packet, xychart).
  - **Palette & Inspector**: left rail palette for primitives, right rail property panels; both operate on builder state and trigger serialization.
  - **History/Undo**: Zustand store with history stack aligned to Monaco undo/redo where feasible; operations produce snapshots before serialization.
  - **Preview pipeline**: Existing DiagramPreview renders Mermaid from current code; builder updates code, preview auto-renders.
  - **Feature flags**: Per-diagram enablement for builder; default to code mode when parser fails.
- **Data flow**: Code → parse → builder state → UI mutations → serialize → code → preview render. Guard rails prevent writes on invalid state; show errors and keep last good builder snapshot.

## Design Principles
- **Vertical slices**: ship one diagram type end-to-end (Flowchart first) using the same abstractions.
- **Resilience**: parsing failures should never destroy user text; builder goes read-only with surfaced error.
- **Consistency**: shared palette/inspector shells; per-type schema defines controls rendered.
- **Accessibility**: keyboard shortcuts for add, delete, connect where applicable; focus/ARIA on palette/inspector controls.

## Low-Level Implementation Spec
- **Shared store**: Zustand store with slices: `builderMode`, `diagramType`, `graphState` (nodes/edges), `tableState` (for non-graph), `selection`, `history`, `status` (dirty/error).
- **Parser/Serializer contracts**:
  - `parseMermaidToState(code, type): ParseResult<State | Error>`
  - `serializeStateToMermaid(state, type): string`
  - Flowchart uses React Flow node/edge model (`id`, `type`, `position`, `data.label`, `source`, `target`, `edgeLabel`).
- **Builder shell**:
  - Layout: Palette (left), Canvas (center), Inspector (right), Status bar (errors/dirty/last sync).
  - Actions: add node, connect nodes, edit labels, delete, undo/redo; toolbar buttons for type switch (future), layout, zoom, fit.
- **Sync loop**:
  - On code change: debounce parse; if ok, hydrate store; if error, set `status=parseError` and keep last valid state.
  - On builder change: apply mutation → push history → serialize → update Monaco code → preview auto-renders.
  - Lock builder while serialization fails; show inline error.
- **Testing**:
  - Unit: parsers/serializers, sync loop (code→state→code idempotency), history, guard rails.
  - E2E: add/connect/rename/delete/undo/redo for Flowchart; ensure code updates and preview matches.

## Rollout Plan
- Slice 1 (Flowchart): full implementation and tests.
- Subsequent slices: reuse store/components; add parser/serializer + palette/inspector config per type, with tests and e2e per slice.
