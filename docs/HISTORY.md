# Development History - Mermaid Live Editor

## Issue: Export and Copy Image Functionality

### Problem Summary
Both the PNG export and copy-to-clipboard image functionality were failing to produce correct outputs. The exported images appeared truncated or with incorrect diagram content.

### Root Cause Analysis

#### Issue 1: SVG Content Retrieval
The initial implementation captured SVG content from the rendered diagram, but Mermaid.js generates SVG with:
1. Embedded styles and fonts that don't translate properly to raster formats
2. External CSS references that fail when SVG is isolated
3. ViewBox vs width/height mismatches causing scaling issues
4. Dynamic styling that doesn't get captured in the static SVG string

#### Issue 2: Canvas Rendering Process
The SVG-to-PNG conversion had multiple failure points:
1. Scale calculation issues with very large diagrams
2. Context transformation compounding with existing SVG transformations
3. Race conditions between SVG blob creation and image loading
4. Font rendering issues when custom fonts are unavailable
5. CSS inheritance not applying to isolated SVG

### Solution Implemented
A holistic solution addressing:
1. **Proper SVG serialization** - Compute all inherited styles and embed them inline
2. **Font handling** - Ensure all fonts are properly embedded
3. **ViewBox normalization** - Calculate proper dimensions respecting actual diagram bounds
4. **Quality settings** - 3x scale with high-quality image smoothing
