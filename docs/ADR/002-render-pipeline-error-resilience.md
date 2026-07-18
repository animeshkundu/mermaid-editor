# ADR-002: Serialized Mermaid Rendering and Error Resilience

## Status

Accepted

## Date

2026-07-18

## Context

Mermaid exposes mutable singleton configuration and rendering APIs. Concurrent renders can
therefore observe another request's configuration or temporary DOM. The preview also used to
blank the last valid diagram after a parse error, remove the export source, and report no Monaco
diagnostic.

The editor must remain responsive with a 300 ms debounce, keep Monaco lazy and CDN-loaded, and
preserve the existing client-only and offline-after-initial-load posture.

## Decision

1. All configuration-plus-render work is serialized by a module-level promise chain.
2. Each request establishes a normalized effective configuration, renders into its own detached
   offscreen container, and removes that container and defensive Mermaid orphan nodes before the
   critical section is released.
3. Failed, superseded, or unmounted work restores the last committed configuration. A successful
   current preview commit advances that rollback baseline.
4. `DiagramPreview` uses a monotonic request epoch and mounted guard. Only the newest mounted
   request can update SVG, diagnostics, last-good state, or export state.
5. Parse failures retain and dim the last committed SVG only when the current root diagram type
   matches. Empty input or a type change clears retained output and uses the blocking error card.
6. The same committed render rejection produces both preview feedback and at most one Monaco
   marker. Monaco keeps native F8 and Shift+F8 navigation.
7. Visual export and image copy use the retained SVG while stale and emit an explicit warning.
   Code copy, sharing, and Markdown export continue to use current source.
8. Synchronous completions use a framework-free vocabulary and starter snippets backed by the
   validated diagram examples.

## Consequences

### Positive

- Mermaid singleton work cannot interleave across requests.
- Temporary render DOM and configuration are cleaned up on every outcome.
- Invalid edits preserve useful visual context without misrepresenting it as current.
- Preview feedback, Monaco diagnostics, and export state share one debounced result.
- Completion remains available even when rendering fails.

### Negative

- Render requests are serialized, so a slow render can delay a newer queued request.
- The last-good cache is intentionally in memory and is lost on reload.
- Error locations remain best-effort because Mermaid parsers expose several incompatible error
  shapes.

### Neutral

- Monaco remains external and lazy-loaded.
- No validator, LSP, worker, backend, or additional runtime dependency is introduced.
