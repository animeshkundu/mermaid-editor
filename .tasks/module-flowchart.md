# Module: Flowchart (Slice 1 Implementation Plan)

## Goal
Deliver end-to-end Flowchart visual builder with bidirectional Mermaid sync, matching mermaidchart.com/play core UX.

## Tasks & Subtasks
1) **Parser/Serializer**
   - Implement `parseMermaidToState` for flowcharts → React Flow nodes/edges with stable IDs, labels, direction.
   - Implement `serializeStateToMermaid` (nodes/edges → Mermaid flowchart text with direction + edge labels).
   - Add validation: disallow self-loop without label, ensure source/target exist, default positions.
2) **State & Store**
   - Add builder slice to Zustand: nodes, edges, selection, history, status, diagramType.
   - Wire sync loop: code→parse→store; store→serialize→code; debounce and guard on errors.
   - History integration: push before mutation; undo/redo updates builder and code.
3) **Builder Shell**
   - Integrate React Flow canvas inside builder view; enable pan/zoom, fit view.
   - Palette (left): add process/decision/terminator/subgraph placeholders.
   - Inspector (right): label edit, shape change, edge label edit; delete action.
   - Toolbar: zoom in/out/fit; snap-to-grid optional toggle.
4) **Interactions**
   - Add node via palette click; auto-place near viewport center.
   - Drag move nodes; updates serialized positions.
   - Create edges via handles; optional label inline edit.
   - Inline label edit (double-click) + inspector edit; delete/backspace removes selection.
5) **Error Handling**
   - On parse error from code, keep last good builder state, show error banner; builder read-only until resolved.
   - Prevent serialization write if invalid state; surface inline error.

## Tests
- Unit:
  - Parse/serialize round-trip (node+edge labels, direction).
  - Invalid code → parse error state without clobbering builder.
  - History: add → undo → redo restores nodes/edges.
  - Edge validation (missing source/target rejected).
- E2E (Playwright):
  - Add node, connect, rename node and edge label, delete, undo/redo; verify Mermaid code updates and preview matches.
  - Load existing flowchart code, toggle builder, edits persist in code tab.

## Verification Checklist
- Palette add, connector handles, inline rename behave like mermaidchart play basics.
- Code edits that remain valid rehydrate builder without losing selection/viewport.
- Undo/redo works for both builder operations and code-originated changes.
