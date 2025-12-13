# TOC: Architecture Guidelines

## 1. Architectural Principles
   - 1.1 Client-Side Only (No backend dependency)
   - 1.2 State Persistence Strategy
   - 1.3 Performance (Debouncing, Lazy Loading)

## 2. Core Subsystems
   - 2.1 Editor (Monaco/CodeMirror wrapper)
   - 2.2 Preview Engine (Mermaid.js integration)
   - 2.3 Export Engine (Canvas manipulation)
   - 2.4 URL State Manager (Compression/Encoding)

## 3. Data Flow
   - 3.1 Unidirectional Data Flow
   - 3.2 Event Handling

## 4. Dependency Management
   - 4.1 Key Libraries (Mermaid, Vite, React)
   - 4.2 Adding New Dependencies
