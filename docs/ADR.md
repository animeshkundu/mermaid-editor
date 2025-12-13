# Architecture Decision Record (Index & History)

## History
- ADR-001: SVG to Canvas Export Strategy (existing)
- ADR-002: Visual Builder Stack for Bidirectional Sync (this document)

## ADR-002: Visual Builder Stack for Bidirectional Sync
- **Context:** We need drag/drop, connectors, selection, and pan/zoom for the Visual Builder while keeping Monaco text authoritative.
- **Decision:** Use **React Flow** for graph-based diagram interactions (handles, edges, zoom, selection) and **Zustand** for builder state with undo/redo snapshots. Keep serialization/parsing per diagram type to generate Mermaid text and hydrate React Flow state.
- **Status:** Proposed for Slice #1 (Flowchart) prior to implementation.
- **Consequences:** Faster delivery via battle-tested graph primitives; lightweight state store aligns with existing React app and avoids Redux boilerplate. Requires type-safe serializers/parsers to prevent desync; will add tests and feature flags per slice.
