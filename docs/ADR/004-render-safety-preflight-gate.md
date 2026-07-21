# ADR-004: Render Safety Through Preflight Limits

## Status

Accepted

## Date

2026-07-20

## Context

Mermaid's Dagre layout runs synchronously on the browser main thread. A Promise timeout cannot
interrupt synchronous layout, and Mermaid's hidden defaults (`maxEdges: 500`,
`maxTextSize: 50000`) rejected valid large diagrams without exposing a useful control.

## Decision

1. Effective configuration exposes `maxEdges` and `maxTextSize`, clamps both to an application hard
   ceiling, and always pins strict security.
2. A cheap source-metrics pass runs before `mermaid.render`. Inputs beyond the effective limits
   throw `DiagramLimitError`, so Mermaid is never invoked.
3. The validated edge ceiling is 1,000 and the text ceiling is 250,000 characters. Defaults are
   1,000 and 200,000 respectively.
4. Live rendering remains debounced by 300 ms below 300 estimated edges and 100,000 characters.
   Above either threshold, the preview retains compatible last-valid output and requires the
   explicit, disclosed **Render now** action.
5. The 15-second Promise timeout remains only as protection against asynchronous module/dependency
   stalls. It is not represented as an interrupt for synchronous layout.
6. Limit, dependency, and syntax failures use one `RenderDiagnostic` path for the preview, live
   announcements, Monaco marker, last-valid state, and visual export state.

## Consequences

- The browser-verified 800-edge fixture renders while Mermaid's former 500-edge default no longer
  leaks into behavior.
- Typing large source never starts layout implicitly.
- Work inside the supported envelope can still block while the user-requested synchronous layout is
  running; the UI discloses this before the action.
- Inputs above the envelope terminate before Mermaid and preserve both source and last-valid SVG.
