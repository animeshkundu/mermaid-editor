# Task Modules (Vertical Slices)
Each module is sized for a junior engineer and includes tasks, tests, and verification. All modules share the core builder shell from Slice 1.

## Module 1: Flowchart (graph-based, React Flow)
- Tasks:
  - Implement Flowchart parser/serializer (Mermaid ↔ React Flow nodes/edges).
  - Render builder canvas with palette (process, decision, terminator, subgraph placeholder) and inspector (label, shape).
  - Enable add node, drag move, connect via handles, edit label, delete, undo/redo, zoom/fit.
  - Sync loop: builder→code→preview and code→builder with parse error handling.
- Tests:
  - Unit: parse/serialize round-trip, invalid code fallback, history stack, edge validation.
  - E2E: add→connect→rename→delete→undo/redo; verify code updates and preview renders.
- Verification:
  - Matches mermaidchart flowchart UX basics: palette add, connector handles, inline rename, live code sync.

## Module 2: Sequence Diagram
- Tasks:
  - Parser/serializer for participants/messages (sync message types, notes, loops/alt).
  - Builder UI: participant rail (add/remove/reorder), canvas lanes, message creation with arrow type selector, note/loop insertion.
  - Sync loop + undo/redo.
- Tests:
  - Unit: round-trip participants/messages, guard on invalid arrows.
  - E2E: add participants, send messages, add note, rename, undo/redo, code sync.
- Verification: Inline message creation mirrors mermaidchart play behavior; code updates live.

## Module 3: Class Diagram
- Tasks:
  - Parser/serializer for classes, members, relationships (extends/implements/association/composition).
  - Builder UI: class cards with properties/methods editor, relationship tool.
  - Selection inspector for member CRUD.
- Tests: round-trip class + relations; e2e add class, add member, connect, rename, delete, undo/redo.
- Verification: Relationship tool and member editing align with reference UX.

## Module 4: State Diagram
- Tasks: parser/serializer for states (start/end/choice), transitions, labels; builder nodes/edges; inspector flags for composite.
- Tests: round-trip states; e2e add start→state→end with transitions.
- Verification: Handles start/end markers and labels.

## Module 5: ER Diagram
- Tasks: parser/serializer for entities/attributes and relationships with cardinality; table editor for attributes; edge picker for relation type.
- Tests: round-trip attributes/cardinality; e2e create entities, set attributes, link.
- Verification: Cardinality selection mirrors UX.

## Module 6: Gantt
- Tasks: parser/serializer for sections/tasks (date/duration/status); table editor + timeline drag/resize.
- Tests: unit round-trip tasks; e2e add section/task, drag duration, mark done/crit.
- Verification: Timeline edits sync to code.

## Module 7: Journey
- Tasks: parser/serializer for sections/steps with actor + score; table/list editor; drag reorder.
- Tests: round-trip; e2e add step, set score slider, reorder.
- Verification: Matches scoring flow UX.

## Module 8: Pie
- Tasks: parser/serializer for slices; simple table; color preview.
- Tests: round-trip; e2e add slice, edit value/title.
- Verification: Live chart updates and code sync.

## Module 9: GitGraph
- Tasks: parser/serializer for branches/commits/merge; builder controls for commit/branch/checkout/merge; auto ordering.
- Tests: round-trip; e2e branch→checkout→commit→merge; undo/redo.
- Verification: Matches mermaidchart git graph UX.

## Module 10: Mindmap
- Tasks: parser/serializer for hierarchy; keyboard shortcuts for child/sibling; drag reorder; inline edit.
- Tests: round-trip; e2e add child/sibling, reorder, rename.
- Verification: Matches mindmap node operations.

## Module 11: Timeline
- Tasks: parser/serializer for events; list editor; drag reorder; optional description.
- Tests: round-trip; e2e add event, reorder, edit text.
- Verification: Visual timeline aligns with code.

## Module 12: Quadrant
- Tasks: parser/serializer for axes/quadrant titles and points; draggable points with coordinate binding.
- Tests: round-trip; e2e drag point updates code, add point, rename axes.
- Verification: Points move sync to code.

## Module 13: Requirement
- Tasks: parser/serializer for requirements/elements/relations; form-based editor; relation picker.
- Tests: round-trip; e2e add requirement, set fields, link element.
- Verification: Relationship semantics preserved.

## Module 14: C4
- Tasks: parser/serializer for persons/systems/containers/boundaries/relationships; palette icons; inspector for external/internal.
- Tests: round-trip; e2e add person/system, link with label, boundary grouping.
- Verification: Aligns with C4 syntax.

## Module 15: Sankey
- Tasks: parser/serializer for rows (source,target,value); grid editor; validation (numeric values).
- Tests: round-trip; e2e add row, edit value, delete row; code sync.
- Verification: Diagram updates with flow weights.

## Module 16: XY Chart
- Tasks: parser/serializer for axes config and series (bar/line arrays); table editor; series color picker.
- Tests: round-trip; e2e add series, edit data, toggle type.
- Verification: Chart reflects series edits.

## Module 17: Block Diagram
- Tasks: parser/serializer for blocks/columns/arrows; React Flow layout with column constraints; style overrides.
- Tests: round-trip; e2e add block, arrow, column change.
- Verification: Column-based layout preserved.

## Module 18: Packet
- Tasks: parser/serializer for bit ranges/labels; grid editor with validation; visualization overlay.
- Tests: round-trip; e2e add range, validate overlaps, edit label.
- Verification: Ranges render accurately.

## Module 19: Kanban
- Tasks: parser/serializer for columns/cards; drag/drop between columns; add/delete columns/cards.
- Tests: round-trip; e2e move card across columns; code sync.
- Verification: Board operations reflect in Mermaid code.

## Module 20: Architecture
- Tasks: parser/serializer for services/resources/groups/links; palette with icons; connector creation; grouping.
- Tests: round-trip; e2e add service, connect, assign group; undo/redo.
- Verification: Matches architecture-beta semantics.
