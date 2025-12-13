/**
 * FlowchartParser - Converts Mermaid flowchart text to GraphVisualState
 * 
 * Uses Mermaid's internal Diagram API to parse flowchart code and extract:
 * - Nodes (vertices) with IDs, labels, and shapes
 * - Edges (links) with source, target, labels, and types
 * - Position metadata from comments (%%{...}%%)
 * 
 * Strategy: Hybrid metadata storage
 * - Primary: Position data in code comments %%{"position":{"x":100,"y":50}}%%
 * - Fallback: Generate default positions using dagre layout
 */

import type { DiagramType, GraphVisualState, VisualNode, VisualEdge, MermaidShape, EdgeType } from '@/types';
import type { DiagramParser } from '../MermaidASTService';
import mermaid from 'mermaid';

/**
 * Metadata extracted from comments
 */
interface NodeMetadata {
  position?: { x: number; y: number };
  [key: string]: unknown;
}

/**
 * FlowchartParser implementation
 */
export class FlowchartParser implements DiagramParser<GraphVisualState> {
  /**
   * Parse flowchart code into GraphVisualState
   */
  async parse(code: string): Promise<GraphVisualState | null> {
    try {
      // Use Mermaid's render API to parse the diagram
      // This is a workaround since Diagram is not directly exported
      const id = `flowchart-parse-${Date.now()}`;
      
      // Parse the diagram - this will throw if invalid
      const { svg } = await mermaid.render(id, code);
      
      // Try multiple ways to access the diagram database
      let diagram = (mermaid as any).diagrams?.[id];
      
      if (!diagram) {
        // Try mermaidAPI global
        diagram = (window as any).mermaidAPI?.diagrams?.[id];
      }
      
      if (!diagram) {
        // Try accessing through mermaid's internal state
        const internalMermaid = (mermaid as any);
        diagram = internalMermaid.lastDiagram || internalMermaid._lastDiagram;
      }
      
      if (!diagram || !diagram.db) {
        console.error('Failed to access diagram database. Available diagram keys:', 
          Object.keys((mermaid as any).diagrams || {}));
        console.warn('Falling back to regex-based parsing');
        return this.fallbackParse(code);
      }

      const db = diagram.db;

      // Extract nodes (vertices)
      const vertices = db.getVertices?.() || {};
      const nodes: VisualNode[] = [];
      const nodePositions = this.extractPositionMetadata(code);

      let nodeIndex = 0;
      for (const [id, vertex] of Object.entries(vertices)) {
        const metadata = nodePositions.get(id);
        const position = metadata?.position || this.generateDefaultPosition(nodeIndex, Object.keys(vertices).length);

        nodes.push({
          id,
          label: (vertex as any).text || id,
          x: position.x,
          y: position.y,
          shape: this.mapMermaidShape((vertex as any).type || 'square'),
        });

        nodeIndex++;
      }

      // Extract edges (links)
      const links = db.getEdges?.() || [];
      const edges: VisualEdge[] = [];

      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        edges.push({
          id: `edge${i}`,
          source: link.start,
          target: link.end,
          label: link.text || undefined,
          type: this.mapEdgeType(link.type),
        });
      }

      return {
        paradigm: 'graph',
        nodes,
        edges,
        viewport: { x: 0, y: 0, zoom: 1 },
      };
    } catch (error) {
      console.error('FlowchartParser error:', error);
      return null;
    }
  }

  /**
   * Check if this parser supports the diagram type
   */
  supports(diagramType: DiagramType): boolean {
    return diagramType === 'flowchart';
  }

  /**
   * Extract position metadata from code comments
   * Format: %%{"position":{"x":100,"y":50}}%%
   */
  private extractPositionMetadata(code: string): Map<string, NodeMetadata> {
    const metadataMap = new Map<string, NodeMetadata>();
    
    // Regex to match: nodeId[label] %%{...}%%
    // or: nodeId(label) %%{...}%%
    // or: nodeId{label} %%{...}%%
    const metadataRegex = /(\w+)(?:\[.*?\]|\(.*?\)|\{.*?\})\s*%%(\{.*?\})%%/g;
    
    let match;
    while ((match = metadataRegex.exec(code)) !== null) {
      const nodeId = match[1];
      const metadataJson = match[2];
      
      try {
        const metadata = JSON.parse(metadataJson);
        metadataMap.set(nodeId, metadata);
      } catch (error) {
        console.warn(`Failed to parse metadata for node ${nodeId}:`, error);
      }
    }

    return metadataMap;
  }

  /**
   * Generate default position for a node using simple grid layout
   * (In future, can use dagre for better auto-layout)
   */
  private generateDefaultPosition(index: number, totalNodes: number): { x: number; y: number } {
    const nodesPerRow = Math.ceil(Math.sqrt(totalNodes));
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;

    return {
      x: col * 200 + 100, // 200px horizontal spacing
      y: row * 150 + 100, // 150px vertical spacing
    };
  }

  /**
   * Map Mermaid shape type to our MermaidShape type
   */
  private mapMermaidShape(mermaidType: string): MermaidShape {
    const shapeMap: Record<string, MermaidShape> = {
      'square': 'rectangle',
      'rect': 'rectangle',
      'rectangle': 'rectangle',
      'round': 'rounded',
      'rounded': 'rounded',
      'stadium': 'stadium',
      'subroutine': 'subroutine',
      'cylindrical': 'cylindrical',
      'circle': 'circle',
      'asymmetric': 'asymmetric',
      'rhombus': 'rhombus',
      'diamond': 'rhombus',
      'hexagon': 'hexagon',
      'parallelogram': 'parallelogram',
      'parallelogram_alt': 'parallelogram-alt',
      'trapezoid': 'trapezoid',
      'trapezoid_alt': 'trapezoid-alt',
      'double_circle': 'double-circle',
    };

    return shapeMap[mermaidType] || 'rectangle';
  }

  /**
   * Fallback parser using regex when diagram database is not accessible
   */
  private fallbackParse(code: string): GraphVisualState {
    const nodes: VisualNode[] = [];
    const edges: VisualEdge[] = [];
    const nodePositions = this.extractPositionMetadata(code);
    const lines = code.split('\n');
    const nodeIds = new Set<string>();

    // Extract nodes - look for patterns like: A[Label], B{Label}, C(Label), etc.
    const nodeRegex = /([A-Za-z0-9_]+)([\[\(\{<][\[\(]?)([^\]\)\}>]+)([\]\)\}>][\]\)]?)/g;
    
    lines.forEach((line, idx) => {
      // Skip flowchart declaration and edge-only lines
      if (line.trim().startsWith('flowchart') || line.includes('-->') || line.includes('-.->')) {
        // But still check for inline node definitions in edges
        let match;
        while ((match = nodeRegex.exec(line)) !== null) {
          const [, id, openBracket, label, closeBracket] = match;
          if (!nodeIds.has(id)) {
            nodeIds.add(id);
            const shape = this.detectShapeFromBrackets(openBracket, closeBracket);
            const metadata = nodePositions.get(id);
            const position = metadata?.position || this.generateDefaultPosition(nodes.length, 10);

            nodes.push({
              id,
              label: label.trim(),
              x: position.x,
              y: position.y,
              shape,
            });
          }
        }
      }
    });

    // Extract edges - look for patterns like: A --> B, A -.-> B, etc.
    const edgeRegex = /([A-Za-z0-9_]+)\s*(-->|==>|\.\.>|-\.->|---)\|?([^\|]*)\|?\s*([A-Za-z0-9_]+)/g;
    
    lines.forEach(line => {
      let match;
      while ((match = edgeRegex.exec(line)) !== null) {
        const [, source, connector, label, target] = match;
        
        // Determine edge type from connector
        let type: EdgeType = 'solid';
        if (connector.includes('.')) type = 'dotted';
        else if (connector.includes('==')) type = 'thick';
        else if (connector === '---') type = 'open';

        edges.push({
          id: `${source}-${target}-${edges.length}`,
          source,
          target,
          label: label?.trim() || '',
          type,
        });
      }
    });

    return {
      paradigm: 'graph',
      nodes,
      edges,
    };
  }

  /**
   * Detect shape from bracket characters
   */
  private detectShapeFromBrackets(open: string, close: string): MermaidShape {
    const brackets = open + close;
    
    const shapeMap: Record<string, MermaidShape> = {
      '[]': 'rectangle',
      '()': 'rounded',
      '([])': 'stadium',
      '{}': 'rhombus',
      '(())': 'circle',
      '>]': 'asymmetric',
      '{{}}': 'hexagon',
      '[//]': 'parallelogram',
      '[\\\\]': 'parallelogram-alt',
      '[\\/]': 'trapezoid',
      '[/\\]': 'trapezoid-alt',
      '((()))': 'double-circle',
      '[[]]': 'subroutine',
      '[()]': 'cylindrical',
    };

    return shapeMap[brackets] || 'rectangle';
  }

  /**
   * Map Mermaid edge type to our EdgeType
   */
  private mapEdgeType(mermaidType: string): EdgeType {
    // Mermaid edge types: arrow_point, arrow_circle, arrow_cross, arrow_open
    // Our types: solid, dotted, thick, open
    
    if (mermaidType && mermaidType.includes('dotted')) {
      return 'dotted';
    }
    if (mermaidType && mermaidType.includes('thick')) {
      return 'thick';
    }
    if (mermaidType && mermaidType.includes('open')) {
      return 'open';
    }
    
    return 'solid'; // default
  }
}
