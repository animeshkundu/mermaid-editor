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
