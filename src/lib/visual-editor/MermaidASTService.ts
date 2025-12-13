/**
 * Visual Editor Internal Types
 * 
 * These types are used internally by the visual editor services
 * (parsers, generators, AST manipulation) and are not exported to the main app.
 */

import type { DiagramType, VisualState, GraphVisualState } from '@/types';

/**
 * Parser interface for converting Mermaid text to visual state
 */
export interface DiagramParser<T extends VisualState = VisualState> {
  /**
   * Parse Mermaid diagram text into visual state
   * @param code - Mermaid diagram code
   * @returns Parsed visual state or null if parsing fails
   */
  parse(code: string): Promise<T | null>;
  
  /**
   * Validate that this parser can handle the given diagram type
   * @param diagramType - The diagram type to check
   * @returns True if this parser supports the diagram type
   */
  supports(diagramType: DiagramType): boolean;
}

/**
 * Generator interface for converting visual state to Mermaid text
 */
export interface DiagramGenerator<T extends VisualState = VisualState> {
  /**
   * Generate Mermaid diagram code from visual state
   * @param state - Visual state to convert
   * @returns Generated Mermaid code or null if generation fails
   */
  generate(state: T): Promise<string | null>;
  
  /**
   * Validate that this generator can handle the given diagram type
   * @param diagramType - The diagram type to check
   * @returns True if this generator supports the diagram type
   */
  supports(diagramType: DiagramType): boolean;
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Parser registration entry
 */
interface ParserEntry {
  diagramTypes: DiagramType[];
  parser: DiagramParser;
}

/**
 * Generator registration entry
 */
interface GeneratorEntry {
  diagramTypes: DiagramType[];
  generator: DiagramGenerator;
}

/**
 * MermaidASTService - Central service for parsing and generating diagrams
 * 
 * This service provides a unified interface for converting between Mermaid text
 * and visual state representations. It uses a registry pattern to support
 * multiple diagram types with different parsers/generators.
 */
export class MermaidASTService {
  private parsers: Map<DiagramType, DiagramParser> = new Map();
  private generators: Map<DiagramType, DiagramGenerator> = new Map();

  /**
   * Register a parser for one or more diagram types
   * @param diagramTypes - Array of diagram types this parser supports
   * @param parser - The parser instance
   */
  registerParser(diagramTypes: DiagramType[], parser: DiagramParser): void {
    for (const type of diagramTypes) {
      this.parsers.set(type, parser);
    }
  }

  /**
   * Register a generator for one or more diagram types
   * @param diagramTypes - Array of diagram types this generator supports
   * @param generator - The generator instance
   */
  registerGenerator(diagramTypes: DiagramType[], generator: DiagramGenerator): void {
    for (const type of diagramTypes) {
      this.generators.set(type, generator);
    }
  }

  /**
   * Parse Mermaid text into visual state
   * @param code - Mermaid diagram code
   * @param diagramType - The type of diagram
   * @returns Visual state or null if parsing fails
   */
  async parse(code: string, diagramType: DiagramType): Promise<VisualState | null> {
    const parser = this.parsers.get(diagramType);
    
    if (!parser) {
      console.warn(`No parser registered for diagram type: ${diagramType}`);
      return null;
    }

    try {
      return await parser.parse(code);
    } catch (error) {
      console.error(`Parser error for ${diagramType}:`, error);
      return null;
    }
  }

  /**
   * Generate Mermaid text from visual state
   * @param state - Visual state
   * @param diagramType - The type of diagram
   * @returns Mermaid code or null if generation fails
   */
  async generate(state: VisualState, diagramType: DiagramType): Promise<string | null> {
    const generator = this.generators.get(diagramType);
    
    if (!generator) {
      console.warn(`No generator registered for diagram type: ${diagramType}`);
      return null;
    }

    try {
      return await generator.generate(state);
    } catch (error) {
      console.error(`Generator error for ${diagramType}:`, error);
      return null;
    }
  }

  /**
   * Validate visual state structure
   * @param state - Visual state to validate
   * @returns Validation result with errors
   */
  validate(state: VisualState): ValidationResult {
    const errors: ValidationError[] = [];

    // Paradigm-specific validation
    if (state.paradigm === 'graph') {
      const graphState = state as GraphVisualState;
      
      // Check for duplicate node IDs
      const nodeIds = new Set<string>();
      for (const node of graphState.nodes) {
        if (nodeIds.has(node.id)) {
          errors.push({
            field: 'nodes',
            message: `Duplicate node ID: ${node.id}`,
            severity: 'error',
          });
        }
        nodeIds.add(node.id);
      }

      // Check edges reference valid nodes
      for (const edge of graphState.edges) {
        if (!nodeIds.has(edge.source)) {
          errors.push({
            field: 'edges',
            message: `Edge references non-existent source node: ${edge.source}`,
            severity: 'error',
          });
        }
        if (!nodeIds.has(edge.target)) {
          errors.push({
            field: 'edges',
            message: `Edge references non-existent target node: ${edge.target}`,
            severity: 'error',
          });
        }
      }

      // Check for isolated nodes (warning only)
      const connectedNodes = new Set<string>();
      for (const edge of graphState.edges) {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      }
      for (const node of graphState.nodes) {
        if (!connectedNodes.has(node.id) && graphState.nodes.length > 1) {
          errors.push({
            field: 'nodes',
            message: `Isolated node: ${node.id}`,
            severity: 'warning',
          });
        }
      }
    }

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
    };
  }

  /**
   * Check if a parser is registered for a diagram type
   * @param diagramType - The diagram type to check
   * @returns True if a parser is available
   */
  hasParser(diagramType: DiagramType): boolean {
    return this.parsers.has(diagramType);
  }

  /**
   * Check if a generator is registered for a diagram type
   * @param diagramType - The diagram type to check
   * @returns True if a generator is available
   */
  hasGenerator(diagramType: DiagramType): boolean {
    return this.generators.has(diagramType);
  }

  /**
   * Get list of supported diagram types
   * @returns Array of diagram types with both parser and generator
   */
  getSupportedDiagramTypes(): DiagramType[] {
    const types: DiagramType[] = [];
    for (const [type] of this.parsers) {
      if (this.generators.has(type)) {
        types.push(type);
      }
    }
    return types;
  }
}

/**
 * Singleton instance of MermaidASTService
 * Import this to use the service throughout the app
 */
export const astService = new MermaidASTService();
