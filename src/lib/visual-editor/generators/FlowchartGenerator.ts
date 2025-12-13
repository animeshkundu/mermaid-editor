/**
 * FlowchartGenerator - Converts GraphVisualState to Mermaid flowchart text
 * 
 * Generates valid Mermaid flowchart syntax from visual state including:
 * - Flowchart header with direction (TD, LR, BT, RL)
 * - Nodes with proper shape syntax
 * - Edges with connectors and labels
 * - Position metadata as comments %%{...}%%
 * 
 * This is the inverse operation of FlowchartParser - together they enable
 * bidirectional text ↔ visual synchronization.
 */

import type { DiagramType, GraphVisualState, VisualNode, VisualEdge, MermaidShape, EdgeType } from '@/types';
import type { DiagramGenerator } from '../MermaidASTService';

/**
 * Shape syntax mapping
 * Maps our MermaidShape types to Mermaid syntax brackets
 */
const SHAPE_SYNTAX: Record<MermaidShape, [string, string]> = {
  'rectangle': ['[', ']'],
  'rounded': ['(', ')'],
  'stadium': ['([', '])'],
  'subroutine': ['[[', ']]'],
  'cylindrical': ['[(', ')]'],
  'circle': ['((', '))'],
  'asymmetric': ['>', ']'],
  'rhombus': ['{', '}'],
  'hexagon': ['{{', '}}'],
  'parallelogram': ['[/', '/]'],
  'parallelogram-alt': ['[\\', '\\]'],
  'trapezoid': ['[/', '\\]'],
  'trapezoid-alt': ['[\\', '/]'],
  'double-circle': ['(((', ')))'],
};

/**
 * Edge connector syntax mapping
 * Maps our EdgeType to Mermaid connector syntax
 */
const EDGE_SYNTAX: Record<EdgeType, string> = {
  'solid': '-->',
  'dotted': '-.->',
  'thick': '==>',
  'open': '---',
};

/**
 * FlowchartGenerator implementation
 */
export class FlowchartGenerator implements DiagramGenerator<GraphVisualState> {
  /**
   * Generate Mermaid flowchart code from GraphVisualState
   */
  async generate(state: GraphVisualState): Promise<string | null> {
    try {
      const lines: string[] = [];

      // Add flowchart header
      // TODO: Could extract direction from metadata in future
      lines.push('flowchart TD');

      // Generate node declarations
      for (const node of state.nodes) {
        const nodeLine = this.generateNodeSyntax(node);
        lines.push(`  ${nodeLine}`);
      }

      // Generate edges
      for (const edge of state.edges) {
        const edgeLine = this.generateEdgeSyntax(edge, state);
        if (edgeLine) {
          lines.push(`  ${edgeLine}`);
        }
      }

      return lines.join('\n');
    } catch (error) {
      console.error('FlowchartGenerator error:', error);
      return null;
    }
  }

  /**
   * Check if this generator supports the diagram type
   */
  supports(diagramType: DiagramType): boolean {
    return diagramType === 'flowchart';
  }

  /**
   * Generate syntax for a single node
   * Format: nodeId[label] %%{"position":{"x":100,"y":50}}%%
   */
  private generateNodeSyntax(node: VisualNode): string {
    const [openBracket, closeBracket] = SHAPE_SYNTAX[node.shape] || SHAPE_SYNTAX.rectangle;
    
    // Escape special characters in label
    const escapedLabel = this.escapeLabel(node.label);
    
    // Build node syntax
    let syntax = `${node.id}${openBracket}${escapedLabel}${closeBracket}`;

    // Add position metadata as comment
    const metadata = {
      position: {
        x: Math.round(node.x),
        y: Math.round(node.y),
      },
    };
    syntax += ` %%${JSON.stringify(metadata)}%%`;

    return syntax;
  }

  /**
   * Generate syntax for a single edge
   * Format: source --> target or source -->|label| target
   */
  private generateEdgeSyntax(edge: VisualEdge, state: GraphVisualState): string | null {
    // Validate edge references valid nodes
    const sourceExists = state.nodes.some(n => n.id === edge.source);
    const targetExists = state.nodes.some(n => n.id === edge.target);

    if (!sourceExists || !targetExists) {
      console.warn(`Edge ${edge.id} references non-existent node(s)`);
      return null;
    }

    const connector = EDGE_SYNTAX[edge.type] || EDGE_SYNTAX.solid;

    if (edge.label) {
      // Edge with label: A -->|label| B
      const escapedLabel = this.escapeLabel(edge.label);
      return `${edge.source} ${connector}|${escapedLabel}| ${edge.target}`;
    } else {
      // Simple edge: A --> B
      return `${edge.source} ${connector} ${edge.target}`;
    }
  }

  /**
   * Escape special characters in labels
   */
  private escapeLabel(label: string): string {
    // Replace characters that might break Mermaid syntax
    return label
      .replace(/"/g, '#quot;')
      .replace(/\n/g, '<br/>')
      .replace(/\|/g, '#124;');
  }

  /**
   * Unescape label (for parsing, not used in generator but useful for testing)
   */
  private unescapeLabel(label: string): string {
    return label
      .replace(/#quot;/g, '"')
      .replace(/<br\/>/g, '\n')
      .replace(/#124;/g, '|');
  }
}
