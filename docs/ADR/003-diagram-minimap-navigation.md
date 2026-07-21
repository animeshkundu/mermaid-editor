# ADR-003: Diagram Minimap Navigation

## Status

Accepted

## Date

2026-07-21

## Context

Large diagrams can extend well beyond the visible preview. Pan and zoom state is local to
`PanZoomContainer`, whose centered content uses
`translate(x, y) scale(s)` with `transform-origin: center center`. A minimap must reflect that
exact transform and navigate the same view without introducing a second source of pan/zoom state.

The minimap also needs the already-rendered SVG. Rendering Mermaid again would add work and could
violate the serialized render pipeline. Injecting a second inline copy would duplicate Mermaid SVG
IDs for markers, clip paths, and filters in the document.

## Decision

1. `PanZoomContainer` remains the sole owner of scale and position. It measures the viewport and
   displayed root SVG, then passes those measurements and the same state setters to
   `DiagramMinimap`.
2. Minimap geometry explicitly inverts the centered transform. The viewport rectangle maps the
   visible main-view bounds into a uniformly fitted thumbnail, while click and drag operations map
   thumbnail coordinates back to `position` without changing scale.
3. The thumbnail uses the committed SVG string from `DiagramPreview` as an isolated SVG data URL
   in an image. Mermaid is not invoked again, and inline SVG IDs are not duplicated.
4. `ResizeObserver` refreshes measurements when the preview or SVG layout changes. Zero-sized or
   unavailable layout produces no viewport rectangle and navigation becomes a no-op.
5. The panel is an always-on-top desktop overlay in the top-left corner, separate from the
   bottom-right zoom controls. It is hidden below the existing 768 px mobile breakpoint to preserve
   touch space.
6. Pan/zoom and minimap visibility remain in-memory view state. They are not persisted or added to
   URL sharing by this change.

## Consequences

### Positive

- The minimap stays synchronized with wheel, button, mouse, touch, and minimap navigation.
- Clicking the overview or dragging its viewport updates the existing main view immediately.
- The thumbnail adds no Mermaid render work and cannot conflict with IDs in the main SVG.
- Retained last-good previews automatically produce a matching retained minimap.

### Negative

- DOM measurement and a `ResizeObserver` are required to align the viewport with responsive SVG
  sizing.
- The minimap is intentionally unavailable on narrow mobile layouts.

### Neutral

- Pan/zoom remains local and resets when `PanZoomContainer` unmounts.
- Existing Monaco editor minimap settings are unrelated and unchanged.
