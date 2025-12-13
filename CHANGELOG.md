# Changelog

All notable changes to the Mermaid Live Editor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Phase 0: Visual Editor Foundation (2024-12-13)

#### Type System
- Added comprehensive TypeScript type definitions for visual editor (`src/types/visual-editor.ts`)
  - `EditMode` type: 'text' | 'visual'
  - `DiagramParadigm` type: 'graph' | 'rail' | 'timeline' | 'data'
  - `VisualState` union type with paradigm-specific variants
  - `VisualNode` and `VisualEdge` types for graph-based diagrams
  - `MermaidShape` type covering 14 Mermaid shape conventions
  - `ParseResult`, `GeneratorResult`, and `ValidationResult` types

#### State Management
- Added `editMode` state with localStorage persistence
- Added `visualStates` storage for diagram-specific visual state
- Integrated visual editor state management into `App.tsx`

#### UI Components
- Created `EmptyState` component for placeholder messages
- Created `VisualEditorRegistry` component for paradigm-based editor routing
- Added Edit Mode toggle in Toolbar with Code/Visual buttons
- Added BETA badge to Visual mode button
- Implemented 3-panel layout (Code | Preview | Visual) when in visual mode

#### Layout Integration
- Added third resizable panel for visual editor
- Panel dynamically appears/disappears based on edit mode
- Maintains responsive panel sizing (33% each in visual mode)
- Added visual editor header with title

#### Diagram Type Detection
- Implemented heuristic-based diagram type detection from code
- Supports all 20 Mermaid diagram types
- Automatic routing to appropriate visual state

#### Testing
- Added 18 type definition tests
- Added 6 EmptyState component tests
- Added 11 VisualEditorRegistry tests
- All tests passing with comprehensive coverage

#### Documentation
- Updated README.md with Visual Editor section
- Added roadmap for Phase 0-4
- Created CHANGELOG.md
- Enhanced feature list

### Technical Details
- **Bundle Impact**: +~10KB (EmptyState, VisualEditorRegistry, types)
- **Performance**: No performance impact - visual editor lazily loaded
- **Browser Compatibility**: Works in all modern browsers supporting localStorage

## [1.0.0] - 2024-12-01

### Initial Release
- Live preview with real-time diagram rendering
- Monaco code editor with syntax highlighting
- Pan & zoom controls
- Multiple Mermaid themes
- Export to SVG, PNG (1x-4x), and Markdown
- Copy to clipboard support
- URL-based sharing
- Keyboard shortcuts
- Undo/Redo support
- Responsive design (mobile + desktop)
- Light/Dark mode toggle
- Support for 20+ diagram types

[Unreleased]: https://github.com/animeshkundu/mermaid-editor/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/animeshkundu/mermaid-editor/releases/tag/v1.0.0
