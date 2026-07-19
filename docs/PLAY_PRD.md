# Mermaidchart Play UX Parity PRD

Goal: deliver a UX-driven, no-code diagram builder that mirrors the mermaidchart.com/play experience while continuing to generate Mermaid source behind the scenes. The builder must let users create and edit every supported Mermaid diagram type through UI interactions, with the editor kept in sync bidirectionally.

## Research Summary: mermaidchart.com/play
- Dual modes: visual builder first, code editor second (code auto-syncs). Users can toggle between them; edits in either mode are reflected immediately.
- Canvas-first workflow with drag/drop palettes per diagram type. Nodes/lanes/actors/tasks are added from a left rail; a right rail shows properties for the selected item.
- Inline editing: double-click to edit labels, hitting Enter commits; Esc cancels. Multi-select with shift-drag; delete/backspace removes.
- Connectors: hover + drag from handles or toolbar “connector” tool; keyboard shortcuts for duplicate, align, distribute, zoom, fit, undo/redo.
- Diagram-specific inspectors: each type surfaces tailored fields (e.g., sequence messages, journey steps with ratings, gantt dates/durations, pie rows for label/value, quadrant coordinates, xychart series table).
- Diagram templates: starter templates per type plus “blank”. Changing diagram type swaps palette and inspector schema.
- Export/sharing: download PNG/SVG, copy image, share link; code panel always visible for copy.

## Diagram-specific UX notes (how users build in UI)
- **Flowchart**: drag nodes (rectangle, decision, terminator, subgraph), drag connectors between ports, inline text edit; toolbar for direction, edge label, shapes.
- **Sequence**: add participants horizontally; click lifeline to add messages; choose arrow style (solid/dashed/async), notes, loops/alt via context menu.
- **Class**: add class boxes; edit properties/methods in side panel; connect with inheritance/association/composition from toolbar.
- **State**: add states and start/end markers; connect with transitions; toggle composite/choice states via panel.
- **ER**: add entities, edit attributes in table; connectors choose relationship cardinality via menu.
- **Gantt**: add sections and tasks via table; edit start/end/duration, status (done/active/crit), today marker; drag to resize on timeline.
- **Pie**: table of slices (label + value); optional title; colors auto-assigned; live chart updates.
- **Journey**: define sections and steps with actor + score; reorder via drag; rating slider; optional descriptions.
- **GitGraph**: add commits/branches via toolbar; checkout branch, merge; message text inline; auto-layout chronologically.
- **Mindmap**: click/Enter to add child/sibling nodes; drag to reorder; hotkeys to promote/demote; icons/formatting inline.
- **Timeline**: add rows of events with date + label; optional title; supports multi-line description; reorder via drag.
- **Quadrant**: set quadrant titles and axis labels; add points with coordinates, label, size; drag point on canvas to move.
- **Requirement**: add requirements and elements; set id/text/risk/verify method; link via satisfies/refines/depends; panel for fields.
- **C4**: add people, systems, containers; choose external/internal; add relationships with descriptive text; boundaries as groups.
- **Sankey**: table of source/target/value rows; add/delete rows; auto-calculated flows; color palette generated.
- **XY Chart**: define axes titles and ranges; add bar/line series with arrays; series name + color; toggle markers/lines.
- **Block**: add blocks and arrows; set columns; drag to rearrange; style overrides per block.
- **Packet**: define ranges and labels in a table; add/remove rows; auto-render bit layout.
- **Kanban**: add columns and cards; edit titles inline; drag cards across columns; add new columns/cards via plus buttons.
- **Architecture**: add services/resources from icon palette; connect with directional links; assign group/container; choose icons and labels.

## Gap Analysis vs Current App
- Current app is code-first Monaco editor with live preview; no visual builder, palettes, inspectors, or diagram-type-specific schema.
- No UI toggle between code and visual, no auto-sync of code ↔ canvas, no per-type templates beyond examples list.
- No e2e coverage for UI builder flows or diagram-specific inspectors.

## Vertical Slicing Strategy
1. **Foundation slice**: add “Visual Builder” mode toggle, shared palette/sidebar layout, selection model, property panel framework, code sync pipeline (generate Mermaid code from UI state, and hydrate UI state from code when possible).
2. **Slice order by complexity/impact**:
   1) Flowchart, 2) Sequence, 3) Class, 4) State, 5) ER, 6) Gantt, 7) Journey, 8) GitGraph, 9) Mindmap, 10) Timeline, 11) Quadrant, 12) Requirement, 13) C4, 14) Pie, 15) Sankey, 16) XY Chart, 17) Block, 18) Packet, 19) Kanban, 20) Architecture.
3. Each slice ships: UI palette + inspector for that type, code generation/parsing, sample templates, undo/redo integration, snapshot tests + playwright e2e covering core flows, docs update.

## Todos by Diagram Type (each includes Research → Build → Test → Review/Fix)
- Flowchart: [ ] Research parity; [ ] Implement builder/palette/connectors + code sync; [ ] Unit + e2e; [ ] Review/bugfix.
- Sequence: [ ] Research parity; [ ] Participant/message UI + arrow styles + code sync; [ ] Unit + e2e; [ ] Review/bugfix.
- Class: [ ] Research parity; [ ] Class editor (props/methods) + relationships; [ ] Unit + e2e; [ ] Review/bugfix.
- State: [ ] Research parity; [ ] State nodes (start/end/choice) + transitions; [ ] Unit + e2e; [ ] Review/bugfix.
- ER: [ ] Research parity; [ ] Entity/attribute table + relationship picker; [ ] Unit + e2e; [ ] Review/bugfix.
- Gantt: [ ] Research parity; [ ] Section/task table + timeline drag/resize; [ ] Unit + e2e; [ ] Review/bugfix.
- Pie: [ ] Research parity; [ ] Slice table + title/color controls; [ ] Unit + e2e; [ ] Review/bugfix.
- Journey: [ ] Research parity; [ ] Section/step editor with actor + rating slider; [ ] Unit + e2e; [ ] Review/bugfix.
- GitGraph: [ ] Research parity; [ ] Branch/commit/merge UI + ordering; [ ] Unit + e2e; [ ] Review/bugfix.
- Mindmap: [ ] Research parity; [ ] Node hierarchy editor with keyboard shortcuts; [ ] Unit + e2e; [ ] Review/bugfix.
- Timeline: [ ] Research parity; [ ] Event rows with date/label + reordering; [ ] Unit + e2e; [ ] Review/bugfix.
- Quadrant: [ ] Research parity; [ ] Axis/quadrant config + draggable points; [ ] Unit + e2e; [ ] Review/bugfix.
- Requirement: [ ] Research parity; [ ] Requirement/element forms + relationship picker; [ ] Unit + e2e; [ ] Review/bugfix.
- C4: [ ] Research parity; [ ] Person/system/container palette + relationship labels; [ ] Unit + e2e; [ ] Review/bugfix.
- Sankey: [ ] Research parity; [ ] Source/target/value grid + validation; [ ] Unit + e2e; [ ] Review/bugfix.
- XY Chart: [ ] Research parity; [ ] Axis config + series table (bar/line); [ ] Unit + e2e; [ ] Review/bugfix.
- Block: [ ] Research parity; [ ] Block/arrow layout + column control; [ ] Unit + e2e; [ ] Review/bugfix.
- Packet: [ ] Research parity; [ ] Bit-range table + validation; [ ] Unit + e2e; [ ] Review/bugfix.
- Kanban: [ ] Research parity; [ ] Column/card CRUD + drag/drop; [ ] Unit + e2e; [ ] Review/bugfix.
- Architecture: [ ] Research parity; [ ] Service/icon palette + connectors + grouping; [ ] Unit + e2e; [ ] Review/bugfix.

## Execution Notes
- Keep Monaco editor as source of truth; builder updates code after each action; code edits rehydrate builder when parsable.
- Testing: unit (Vitest), lint (ESLint), build (vite/tsc), e2e (Playwright) must run per slice; gate merges on green.
- Documentation: update docs/PRD.md with slice status as we deliver; add per-slice UX notes to DESIGN_GUIDELINES.md when implemented.

## Risks & Mitigations
- Code ↔ UI desync: add robust serializer/parser per type with fallback to read-only preview when unparsable.
- Complexity of 20 types: slice delivery order locks scope; ship progressively with feature flags per type.
- Performance on large diagrams: virtualize node lists, debounce sync, reuse mermaid lazy init already in src/lib/mermaid.ts.
