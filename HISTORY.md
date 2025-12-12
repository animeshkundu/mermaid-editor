# Development History - Mermaid Live Editor

## Issue: Export and Copy Image Functionality

### Problem Summary
Both the PNG export and copy-to-clipboard image functionality are failing to produce correct outputs. Based on user feedback, the exported images appear to be showing truncated or incorrect diagram content.

### Root Cause Analysis

#### Issue 1: SVG Content Retrieval
The current implementation captures SVG content from the rendered diagram, but Mermaid.js may be generating SVG with:
1. **Embedded styles and fonts** that don't translate properly to raster formats
2. **External CSS references** that fail when SVG is isolated
3. **ViewBox vs width/height mismatches** causing scaling issues
4. **Dynamic styling** that doesn't get captured in the static SVG string

#### Issue 2: Canvas Rendering Process
The SVG-to-PNG conversion has multiple failure points:
1. **Scale calculation** - Currently using 4x scale which may cause issues with very large diagrams
2. **Context transformation** - The `ctx.scale()` approach may compound with existing SVG transformations
3. **Image loading timing** - Race conditions between SVG blob creation and image loading
4. **Font rendering** - Custom fonts may not be available when rendering to canvas
5. **CSS inheritance** - Styles defined in parent DOM may not apply to isolated SVG

#### Issue 3: Mermaid SVG Structure
Mermaid generates complex SVG structures with:
- Nested transformations and groups
- CSS classes that reference external stylesheets
- Potential relative sizing (percentages, ems)
- Markers and defs that may not export cleanly

### Previous Attempts (Iteration History)
1. **Initial Implementation** - Basic SVG string capture and canvas rendering
2. **Attempt 2** - Added SVG preparation step to inject namespaces
3. **Attempt 3** - Increased scale factor for better quality
4. **Attempt 4** - Added timeout and error handling
5. **Attempt 5** - Removed @import statements from embedded styles
6. **Current State** - Still failing to produce correct output

### Pattern Recognition
We're caught in a cycle of addressing symptoms rather than root causes. Each fix has been incremental without addressing the fundamental issue: **Mermaid's rendered SVG in the DOM has computed styles, inherited properties, and context that cannot be trivially extracted as a standalone SVG string.**

## Next Steps
A holistic solution requires:
1. **Proper SVG serialization** - Compute all inherited styles and embed them inline
2. **Font handling** - Ensure all fonts are properly embedded or converted to paths
3. **ViewBox normalization** - Calculate proper dimensions that respect the actual diagram bounds
4. **Testing framework** - Validate each diagram type exports correctly
5. **Quality verification** - Ensure exported images match the on-screen preview exactly
