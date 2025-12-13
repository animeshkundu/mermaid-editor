# Flowchart Vertical Slice Task Ladder

1. **Research**  
   - Validate Mermaid flowchart syntax/edge semantics and React Flow node/edge APIs for handles, connection validation, and custom node rendering.

2. **Scaffold**  
   - Wire a Visual Builder mode switch, initialize React Flow canvas with blank diagram state, and keep Monaco code as source of truth.

3. **Render static flowchart**  
   - Load a sample flowchart state into React Flow nodes/edges; render preview via existing lib/mermaid.ts to confirm serialization parity.

4. **Add Node**  
   - Provide “Add Node” control (palette button). Insert node into state, serialize to Mermaid, and update Monaco/preview.

5. **Edit Label**  
   - Enable inline or inspector-based label editing; mutations update state then regenerate Mermaid text.

6. **Connect Nodes**  
   - Enable handle-to-handle drag to create edges; enforce valid source/target and serialize edges to Mermaid.

7. **Undo/Redo + Delete**  
   - Integrate history stack for add/edit/connect/delete operations; delete/backspace removes selection and rewrites code.

8. **Tests**  
   - Unit tests for flowchart serializer/parser and sync loop; Playwright e2e covering add → connect → rename → delete → undo/redo.

9. **Review**  
   - Compare UX against mermaidchart.com/play for flowcharts (palette, connectors, inline edit, sync fidelity) and file gaps for next iteration.
