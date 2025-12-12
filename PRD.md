# Mermaid Live Editor Clone

A professional, feature-complete mermaid diagram editor providing real-time preview, syntax highlighting, configuration management, and comprehensive export capabilities—all client-side with no paywalls.

**Experience Qualities**:
1. **Efficient** - Immediate visual feedback with real-time rendering as users type, minimal latency
2. **Professional** - Clean interface with powerful features for creating production-ready diagrams
3. **Flexible** - Support for all mermaid diagram types with full configuration control and multiple export formats

**Complexity Level**: Complex Application (advanced functionality with multiple views, real-time rendering engine, export capabilities, configuration management)
This is a feature-rich development tool requiring sophisticated state management, real-time parsing, error handling, and multiple interaction modes.

## Essential Features

### Real-Time Code Editor
- **Functionality**: Monaco-based code editor with mermaid syntax support
- **Purpose**: Enable users to write mermaid diagram code with professional IDE features
- **Trigger**: User opens the application or starts typing
- **Progression**: User types mermaid syntax → Editor provides syntax highlighting → Auto-save to persistence → Real-time validation
- **Success Criteria**: Smooth typing experience with syntax highlighting, line numbers, and code folding

### Live Diagram Preview
- **Functionality**: Real-time rendering of mermaid diagrams with error display
- **Purpose**: Provide instant visual feedback for diagram code
- **Trigger**: Code changes in editor or initial page load
- **Progression**: Code change detected → Debounced render trigger → Mermaid parser executes → Diagram renders or error displays → Pan/zoom interactions enabled
- **Success Criteria**: Diagrams render within 300ms of typing stop, errors show helpful messages

### Resizable Split Layout
- **Functionality**: Draggable divider between editor and preview panels
- **Purpose**: Allow users to optimize screen space for their workflow
- **Trigger**: User drags the divider handle
- **Progression**: User clicks divider → Drag starts → Panels resize in real-time → Position persists
- **Success Criteria**: Smooth resizing with no rendering lag, position remembered between sessions

### Export Capabilities
- **Functionality**: Download diagrams as SVG, PNG, or markdown
- **Purpose**: Enable users to use diagrams in other applications
- **Trigger**: User clicks export button and selects format
- **Progression**: User clicks export → Format dialog appears → User selects format → File downloads with descriptive name
- **Success Criteria**: Downloads work in all formats with high quality, proper filenames

### Example Diagram Library
- **Functionality**: Collection of sample diagrams for all mermaid types
- **Purpose**: Help users learn mermaid syntax and start quickly
- **Trigger**: User clicks examples button or dropdown
- **Progression**: User clicks examples → Gallery/menu displays → User selects example → Code loads into editor → Diagram renders
- **Success Criteria**: 10+ examples covering all major diagram types, loads instantly

### Configuration Editor
- **Functionality**: Visual interface for mermaid configuration options
- **Purpose**: Allow theme customization, styling, and behavior changes
- **Trigger**: User opens config panel
- **Progression**: User opens config → JSON editor displays current config → User edits → Changes apply to diagram → Config persists
- **Success Criteria**: Config changes apply immediately to preview, validation prevents invalid JSON

### Auto-Save & Persistence
- **Functionality**: Automatic saving of code, config, and UI state
- **Purpose**: Never lose work, seamless experience across sessions
- **Trigger**: Any change to code, config, or layout
- **Progression**: User makes change → Debounced save trigger → Data persists to KV store → Success indicator (subtle)
- **Success Criteria**: All data restored on page reload, no manual save needed

### Pan & Zoom
- **Functionality**: Mouse wheel zoom and drag to pan large diagrams
- **Purpose**: Enable working with complex, large diagrams
- **Trigger**: User scrolls or drags in preview panel
- **Progression**: User scrolls → Zoom level changes → Diagram scales → Pan by dragging → Position maintained
- **Success Criteria**: Smooth zooming centered on cursor, natural panning feel

### Error Handling & Validation
- **Functionality**: Clear error messages for syntax errors with line numbers
- **Purpose**: Help users debug diagram code quickly
- **Trigger**: Parser encounters invalid syntax
- **Progression**: Parser error occurs → Error message displays in preview → Line number highlighted → User fixes → Error clears
- **Success Criteria**: Errors are descriptive, line numbers accurate, recovery is immediate

## Edge Case Handling

- **Empty Editor**: Display welcome message with quick start guide and example links
- **Large Diagrams**: Implement virtual scrolling and canvas optimization for 100+ node diagrams
- **Parse Errors**: Graceful error display without breaking UI, preserve last valid render
- **Browser Compatibility**: Fallback for canvas export if specific APIs unavailable
- **Mobile View**: Stack editor/preview vertically, touch-friendly controls
- **Clipboard Operations**: Handle copy/paste of diagram code and images
- **Invalid Config**: Validate and show errors without breaking renderer, offer reset to defaults
- **Network Offline**: Fully functional since all processing is client-side

## Design Direction

The design should evoke professional developer tools with a modern, clean aesthetic. Think VS Code meets data visualization—technical but approachable, powerful but not cluttered. The interface should feel like a precision instrument that gets out of the way and lets users focus on creating diagrams.

## Color Selection

A sophisticated developer-focused palette with strong contrast and clear visual hierarchy.

- **Primary Color**: Deep Blue (#2563eb / oklch(0.55 0.22 260)) - Represents trust, professionalism, and technical precision. Used for primary actions and interactive elements.
- **Secondary Colors**: 
  - Slate Gray (#475569 / oklch(0.42 0.02 250)) - For secondary UI elements and borders
  - Emerald Green (#10b981 / oklch(0.70 0.17 165)) - Success states and valid syntax highlighting
- **Accent Color**: Electric Violet (#8b5cf6 / oklch(0.60 0.24 295)) - For highlights, active states, and attention-grabbing elements like export buttons
- **Background**: Off-white (#fafafa / oklch(0.98 0 0)) with subtle texture pattern for depth
- **Editor Background**: True dark (#1e1e1e / oklch(0.15 0 0)) for code editor with syntax colors

**Foreground/Background Pairings**:
- Primary (Deep Blue #2563eb): White text (#ffffff) - Ratio 8.6:1 ✓
- Accent (Electric Violet #8b5cf6): White text (#ffffff) - Ratio 7.1:1 ✓
- Background (Off-white #fafafa): Slate text (#1e293b) - Ratio 14.2:1 ✓
- Editor (Dark #1e1e1e): Off-white text (#f5f5f5) - Ratio 13.8:1 ✓

## Font Selection

Typography should emphasize code clarity and technical precision while maintaining readability for UI elements.

- **Primary Font**: **JetBrains Mono** - Exceptional code font with ligatures, used for the editor
- **UI Font**: **Inter Variable** - Clean, modern sans-serif for interface elements and labels
- **Headers**: **Space Grotesk** - Geometric, distinctive for section headers and branding

**Typographic Hierarchy**:
- H1 (App Title): Space Grotesk Bold / 24px / -0.02em letter spacing
- H2 (Section Headers): Space Grotesk SemiBold / 18px / -0.01em letter spacing
- Body (UI Text): Inter Regular / 14px / 1.5 line height / 0em letter spacing
- Code (Editor): JetBrains Mono Regular / 14px / 1.6 line height / monospace
- Labels: Inter Medium / 12px / 0.01em letter spacing / uppercase
- Buttons: Inter SemiBold / 14px

## Animations

Animations should provide functional feedback and guide attention without slowing workflow. Micro-interactions reinforce actions and state changes.

- **Code Changes → Render**: 200ms debounce before render trigger, subtle pulse on preview panel border
- **Panel Resize**: Real-time with spring physics (framer-motion) for natural feel when released
- **Export Success**: Brief scale+fade animation on success toast notification
- **Error Display**: Gentle shake animation on error panel appearance, red accent pulse
- **Example Load**: Smooth 150ms opacity transition as code replaces
- **Button Hover**: 100ms color shift with subtle lift (2px translate-y)
- **Config Panel**: 250ms slide-in from right with backdrop blur fade-in
- **Zoom/Pan**: Hardware-accelerated transform for 60fps smoothness

## Component Selection

**Components**:
- **ResizablePanelGroup / ResizablePanel**: Core layout for editor/preview split with drag handle
- **Tabs**: Switch between code, config, and examples in secondary views
- **Button**: All action triggers (export, examples, reset) with variant hierarchy
- **DropdownMenu**: Export format selection, example categories
- **Dialog**: Full-screen config editor, about/help modals
- **Select**: Diagram type quick-select, theme switcher
- **Scroll-Area**: Smooth scrolling for example lists and config options
- **Separator**: Visual dividers in toolbars and panels
- **Badge**: Diagram type indicators, status pills
- **Tooltip**: Contextual help for toolbar icons and shortcuts
- **Alert**: Error messages and warnings in preview panel
- **Sheet**: Mobile-friendly slide-out for settings on small screens

**Customizations**:
- **Monaco Editor Integration**: Custom React component wrapping @monaco-editor/react with mermaid language support
- **Canvas Export Component**: Custom SVG-to-PNG converter using html2canvas logic
- **Pan/Zoom Container**: Custom wrapper for preview panel with gesture controls
- **Syntax Error Marker**: Custom overlay component showing line-specific errors

**States**:
- **Buttons**: Default (bg-primary), Hover (bg-primary/90 + lift), Active (bg-primary/80), Disabled (opacity-50)
- **Editor**: Focus (border-ring), Error (border-destructive), Success (border-emerald)
- **Preview Panel**: Rendering (skeleton pulse), Error (red border + icon), Success (subtle green accent)
- **Drag Handle**: Default (bg-border), Hover (bg-primary/20), Active (bg-primary/40 + cursor-grabbing)

**Icon Selection**:
- Code (code icon): Editor mode toggle
- Eye (eye icon): Preview panel indicator  
- Download (download-simple icon): Export actions
- Gear (gear icon): Configuration panel
- Lightning (lightning-bolt icon): Examples/templates
- ArrowsOut (arrows-out icon): Full-screen preview
- Copy (copy icon): Copy code/diagram
- Trash (trash icon): Clear editor
- Warning (warning icon): Error states
- Check (check icon): Success states

**Spacing**:
- Container padding: p-4 (16px) on mobile, p-6 (24px) on desktop
- Component gaps: gap-4 (16px) for related groups, gap-6 (24px) for sections
- Toolbar items: gap-2 (8px) for tight grouping, gap-3 (12px) for logical groups
- Panel padding: p-4 internally for content areas
- Button padding: px-4 py-2 (16px/8px) for default, px-6 py-3 for large
- Border radius: rounded-lg (var(--radius)) for panels, rounded-md for buttons

**Mobile**:
- Stack editor/preview vertically on <768px breakpoint
- Toolbar switches to hamburger menu with Sheet component
- Preview panel defaults to larger height ratio (60/40 split)
- Touch-friendly button sizes (min 44px hit area)
- Swipe gestures to switch between editor/preview tabs
- Floating action button for quick export on mobile
- Bottom sheet for examples and config on mobile
