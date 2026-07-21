# ADR-005: Performance Budgets and Validated Limits

## Status

Accepted

## Date

2026-07-20

## Context

The editor needs measurable limits that keep routine typing responsive while still supporting
meaningfully large diagrams. Mermaid cannot move to a worker because rendering requires DOM access.

## Decision

The reference tier is headless Chromium on a two-core Linux CI container with production assets
served by Vite Preview. The checked corpus is every built-in diagram example plus linear flowcharts
at 800, 1,000, and 2,000 edges.

Budgets and outcomes:

| Interaction | Budget |
| --- | --- |
| Auto-render scheduling | 300 ms after the latest edit |
| Routine example render after dependencies are cached | 1.5 seconds |
| Input response below the interactive threshold | 50 ms target; rendering never starts before debounce |
| 800-edge explicit render | 6 seconds on the reference tier |
| Above-threshold typing | No Mermaid invocation until **Render now** |

The observed 800-edge render was 4.4 seconds and the 1,000-edge render was 5.9 seconds. A 2,000-edge
fixture did not finish within 90 seconds, so the hard edge ceiling was reduced from the candidate
2,000 to the validated 1,000. The interactive threshold remains 300 edges / 100,000 characters.

## Consequences

- The supported large fixture and hard edge ceiling have browser evidence rather than guessed values.
- Large diagrams are intentionally user-triggered, not silently auto-rendered.
- Performance varies by diagram topology and device. The preflight gate is a safety envelope, not a
  guarantee that every in-envelope layout has identical cost.
- Future threshold increases require repeating the same production-browser corpus measurement.
