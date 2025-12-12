# Export & Copy Image Feature PRD

## Mission Statement
Provide flawless, high-fidelity export of Mermaid diagrams to SVG and PNG formats, and enable one-click copying of diagram images to clipboard at maximum quality.

## Core Requirements

### Functional Requirements
1. **SVG Export** - Download the diagram as a clean, standalone SVG file that renders identically in any viewer
2. **PNG Export** - Download the diagram as a high-resolution PNG with perfect fidelity to the on-screen preview
3. **Copy to Clipboard** - Copy the diagram as a PNG image to the system clipboard for pasting into other applications
4. **Quality Standard** - All exports must be at 100% resolution with the highest possible quality (no compression artifacts, no truncation, no missing elements)

### Technical Requirements

#### SVG Serialization
- Extract the SVG from rendered Mermaid output
- Compute all CSS styles and inline them into the SVG (convert external/inherited styles to inline `style` attributes)
- Embed or convert all fonts to ensure portability
- Remove any references to external resources (stylesheets, scripts, imports)
- Preserve the exact visual appearance from the preview
- Ensure proper XML namespaces (`xmlns`, `xmlns:xlink`)
- Calculate correct viewBox and dimensions based on actual content bounds

#### PNG Generation
- Render SVG to canvas at high resolution (2x-4x scale for retina displays)
- Maintain aspect ratio and diagram proportions exactly
- Use high-quality image smoothing (`imageSmoothingQuality = 'high'`)
- White background for diagrams (or transparent if specified)
- Handle diagrams of any size (small to very large)
- Generate PNG at maximum quality (quality = 1.0, no compression)

#### Clipboard Copy
- Convert diagram to PNG blob
- Use Clipboard API to write image data
- Handle permission requests gracefully
- Provide user feedback on success/failure
- Support all modern browsers (Chrome, Firefox, Safari, Edge)

### Quality Validation

#### Success Criteria
Each exported/copied image must:
1. **Visual Fidelity** - Look identical to the on-screen preview when viewed/pasted
2. **No Truncation** - Include the entire diagram with no clipping
3. **No Missing Elements** - All nodes, edges, labels, and decorations present
4. **Correct Colors** - All colors match the preview exactly
5. **Sharp Text** - All text is crisp and readable (not blurry)
6. **Proper Sizing** - Dimensions are appropriate for the content (not too large/small)
7. **Clean Edges** - No artifacts, jagged edges, or rendering glitches

#### Test Cases
Must validate with all diagram types:
- Flowchart (basic and complex with subgraphs)
- Sequence diagram
- Class diagram
- State diagram
- ER diagram
- Gantt chart
- Pie chart
- User journey
- Git graph
- Mindmap
- Timeline
- Quadrant chart

### User Experience

#### Export Flow
1. User clicks "Export" button in toolbar
2. Dropdown shows format options: SVG, PNG, Markdown
3. User selects desired format
4. File downloads immediately with descriptive filename (`mermaid-YYYY-MM-DD.{ext}`)
5. Toast notification confirms: "Exported as {FORMAT}"

#### Copy Image Flow
1. User clicks "Copy Image" button in toolbar
2. System converts diagram to PNG and copies to clipboard
3. Toast notification confirms: "Image copied to clipboard"
4. User can immediately paste into any application

#### Error Handling
- If no diagram is rendered: Show "No diagram to export"
- If conversion fails: Show "Export failed" with option to retry
- If clipboard permission denied: Show "Clipboard access required" with instructions
- If browser doesn't support feature: Show "Not supported in this browser" with alternatives

## Implementation Strategy

### Phase 1: SVG Export (Foundation)
1. Capture the rendered SVG element from the DOM
2. Clone the SVG element to avoid modifying the display
3. Walk the DOM tree and compute all styles using `getComputedStyle()`
4. Convert computed styles to inline style attributes
5. Remove external references (@import, external stylesheets)
6. Ensure proper XML namespaces and structure
7. Serialize to string and download

### Phase 2: PNG Export (Raster Conversion)
1. Take the clean SVG from Phase 1
2. Create an Image object and load the SVG as a data URL
3. Calculate target dimensions (original size × scale factor)
4. Create a canvas with target dimensions
5. Draw the image to canvas with high-quality settings
6. Convert canvas to PNG blob at maximum quality
7. Download the PNG file

### Phase 3: Clipboard Copy (System Integration)
1. Use the PNG generation logic from Phase 2
2. Create a ClipboardItem with the PNG blob
3. Use `navigator.clipboard.write()` to copy
4. Handle permissions and browser compatibility
5. Provide user feedback

### Phase 4: Quality Assurance
1. Test with all diagram types
2. Verify exports match preview pixel-by-pixel
3. Test on different browsers and operating systems
4. Validate file sizes are reasonable
5. Ensure performance is acceptable (< 2 seconds for export)

## Technical Approach: Style Inlining

The critical innovation is proper style computation and inlining:

```typescript
function inlineStyles(element: SVGElement): void {
  // Get computed styles from the live DOM
  const computedStyle = window.getComputedStyle(element);
  
  // Convert to inline style attribute
  let inlineStyle = '';
  for (let i = 0; i < computedStyle.length; i++) {
    const property = computedStyle[i];
    const value = computedStyle.getPropertyValue(property);
    inlineStyle += `${property}: ${value}; `;
  }
  
  element.setAttribute('style', inlineStyle);
  
  // Recursively process children
  Array.from(element.children).forEach(child => {
    if (child instanceof SVGElement) {
      inlineStyles(child);
    }
  });
}
```

## Success Metrics
- 100% of diagram types export correctly
- Zero reported issues of missing elements or truncation
- User satisfaction with export quality
- Export completes in < 2 seconds for typical diagrams
- Clipboard copy works on all supported browsers

## Known Challenges & Mitigations

### Challenge 1: Font Embedding
**Problem**: Custom fonts may not render in exported SVG
**Solution**: Convert text to paths OR embed font data as base64 in SVG

### Challenge 2: Large Diagrams
**Problem**: Very large diagrams may exceed canvas size limits
**Solution**: Implement tile-based rendering or limit max dimensions with scaling

### Challenge 3: Browser Compatibility
**Problem**: Clipboard API has limited browser support
**Solution**: Provide fallback to download PNG with instructions to manually copy

### Challenge 4: Performance
**Problem**: Style inlining for complex diagrams may be slow
**Solution**: Optimize by caching computed styles, use worker threads if needed

## Dependencies
- Mermaid.js (already installed)
- Canvas API (browser native)
- Clipboard API (browser native)
- Blob/File APIs (browser native)

No external libraries needed - all functionality uses browser native APIs.
