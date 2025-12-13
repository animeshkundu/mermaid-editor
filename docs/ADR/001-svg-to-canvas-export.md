# ADR-001: SVG to Canvas Export Strategy

## Status
Accepted

## Date
2024-12-12

## Context

Users need to copy mermaid diagrams to the clipboard as PNG images and export them as PNG files. This requires converting the SVG rendered by mermaid into a canvas, then extracting the image data.

We encountered several issues with the initial implementation:

1. **Tainted Canvas Error**: Using `URL.createObjectURL()` with SVG blobs triggered `SecurityError: Tainted canvases may not be exported` in some browsers, as blob URLs can be treated as cross-origin content.

2. **Black Image Output**: When the SVG was loaded into an `<img>` element and drawn to canvas, the result was a completely black image. This occurred because CSS styles applied by mermaid (from the page's stylesheets) were not available when the SVG was rendered in isolation.

3. **Large Diagram Failures**: Very large diagrams caused `toBlob()` to return `null` because the canvas exceeded browser size limits (~16384×16384 pixels or ~268 million total pixels).

4. **createImageBitmap Incompatibility**: The `createImageBitmap()` API, while theoretically better for this use case, consistently failed with `InvalidStateError: The source image could not be decoded` when processing mermaid SVGs.

## Decision

We implemented a multi-part solution:

### 1. Inline Computed Styles Before Export

The `prepareSVGForExport()` function now:
- Temporarily appends the SVG to the DOM
- Uses `window.getComputedStyle()` to read all computed CSS properties
- Inlines critical SVG styling properties (`fill`, `stroke`, `font-family`, etc.) directly as `style` attributes on each element
- Adds a white background `<rect>` to prevent transparency issues
- Removes the temporary DOM element

This ensures the SVG is self-contained and renders correctly when isolated from the page's CSS.

### 2. Use Base64 Data URLs Instead of Blob URLs

Instead of:
```javascript
const blob = new Blob([svg], { type: 'image/svg+xml' });
const url = URL.createObjectURL(blob);
img.src = url;
```

We use:
```javascript
const svgBase64 = btoa(unescape(encodeURIComponent(preparedSvg)));
const svgDataUrl = 'data:image/svg+xml;base64,' + svgBase64;
img.src = svgDataUrl;
```

Data URLs are always same-origin, avoiding tainted canvas issues entirely.

### 3. Auto-Scale Reduction for Large Diagrams

Added `getMaxSafeScale()` function that:
- Checks if the requested scale would exceed browser canvas limits
- Automatically reduces scale (from 3x → 2x → 1x) until dimensions are safe
- Logs a warning when scale is reduced

### 4. Remove createImageBitmap Attempt

After testing showed `createImageBitmap()` consistently fails for SVG content in browsers, we removed it entirely rather than having a fallback that always triggers.

## Consequences

### Positive
- Copy to clipboard now works reliably across browsers
- Large diagrams export successfully (at reduced resolution if necessary)
- No more tainted canvas security errors
- SVG styles are preserved in exports
- Cleaner code without unnecessary fallback paths

### Negative
- Style inlining adds processing time (~100-200ms for large diagrams)
- The DOM manipulation in `prepareSVGForExport()` is a side effect that could theoretically cause issues if called during a render cycle (mitigated by using an off-screen container)
- Very large diagrams may be exported at lower resolution than requested

### Neutral
- Base64 encoding increases the data URL size by ~33%, but this is in-memory only and doesn't affect the final export

## Alternatives Considered

1. **Service Workers**: Could intercept requests and serve SVGs without cross-origin issues, but adds significant complexity for a client-side-only app.

2. **foreignObject with embedded HTML**: Would allow CSS to work, but has poor cross-browser support and breaks in many SVG contexts.

3. **Server-side rendering**: Would solve all issues but requires backend infrastructure, defeating the purpose of a client-side editor.

4. **Canvas-based rendering from scratch**: Libraries like `html2canvas` could render the preview directly, but would lose SVG vector quality and add a large dependency.

## References

- [MDN: Canvas security and tainted canvases](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)
- [MDN: createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/createImageBitmap)
- [Chromium canvas size limits](https://chromium.googlesource.com/chromium/src/+/HEAD/third_party/blink/renderer/core/html/canvas/canvas_rendering_context.cc)
