/**
 * Tests for MermaidASTService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MermaidASTService, type DiagramParser, type DiagramGenerator } from './MermaidASTService';
import type { DiagramType, GraphVisualState, VisualState } from '@/types';

describe('MermaidASTService', () => {
  let service: MermaidASTService;

  beforeEach(() => {
    service = new MermaidASTService();
  });

  describe('registerParser', () => {
    it('should register a parser for a single diagram type', () => {
      const mockParser: DiagramParser = {
        parse: async () => null,
        supports: (type) => type === 'flowchart',
      };

      service.registerParser(['flowchart'], mockParser);

      expect(service.hasParser('flowchart')).toBe(true);
      expect(service.hasParser('sequence')).toBe(false);
    });

    it('should register a parser for multiple diagram types', () => {
      const mockParser: DiagramParser = {
        parse: async () => null,
        supports: (type) => ['flowchart', 'state', 'class'].includes(type),
      };

      service.registerParser(['flowchart', 'state', 'class'], mockParser);

      expect(service.hasParser('flowchart')).toBe(true);
      expect(service.hasParser('state')).toBe(true);
      expect(service.hasParser('class')).toBe(true);
      expect(service.hasParser('sequence')).toBe(false);
    });
  });

  describe('registerGenerator', () => {
    it('should register a generator for a single diagram type', () => {
      const mockGenerator: DiagramGenerator = {
        generate: async () => null,
        supports: (type) => type === 'flowchart',
      };

      service.registerGenerator(['flowchart'], mockGenerator);

      expect(service.hasGenerator('flowchart')).toBe(true);
      expect(service.hasGenerator('sequence')).toBe(false);
    });

    it('should register a generator for multiple diagram types', () => {
      const mockGenerator: DiagramGenerator = {
        generate: async () => null,
        supports: (type) => ['flowchart', 'state', 'class'].includes(type),
      };

      service.registerGenerator(['flowchart', 'state', 'class'], mockGenerator);

      expect(service.hasGenerator('flowchart')).toBe(true);
      expect(service.hasGenerator('state')).toBe(true);
      expect(service.hasGenerator('class')).toBe(true);
      expect(service.hasGenerator('sequence')).toBe(false);
    });
  });

  describe('parse', () => {
    it('should return null when no parser is registered', async () => {
      const result = await service.parse('flowchart TD\n  A --> B', 'flowchart');

      expect(result).toBeNull();
    });

    it('should call the registered parser', async () => {
      const mockState: GraphVisualState = {
        paradigm: 'graph',
        nodes: [{ id: 'A', label: 'A', x: 0, y: 0, shape: 'rectangle' }],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      const mockParser: DiagramParser<GraphVisualState> = {
        parse: async (code) => {
          expect(code).toBe('flowchart TD\n  A --> B');
          return mockState;
        },
        supports: (type) => type === 'flowchart',
      };

      service.registerParser(['flowchart'], mockParser);

      const result = await service.parse('flowchart TD\n  A --> B', 'flowchart');

      expect(result).toEqual(mockState);
    });

    it('should handle parser errors gracefully', async () => {
      const mockParser: DiagramParser = {
        parse: async () => {
          throw new Error('Parse error');
        },
        supports: (type) => type === 'flowchart',
      };

      service.registerParser(['flowchart'], mockParser);

      const result = await service.parse('invalid', 'flowchart');

      expect(result).toBeNull();
    });
  });

  describe('generate', () => {
    it('should return null when no generator is registered', async () => {
      const mockState: GraphVisualState = {
        paradigm: 'graph',
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      const result = await service.generate(mockState, 'flowchart');

      expect(result).toBeNull();
    });

    it('should call the registered generator', async () => {
      const mockState: GraphVisualState = {
        paradigm: 'graph',
        nodes: [{ id: 'A', label: 'A', x: 0, y: 0, shape: 'rectangle' }],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      const mockGenerator: DiagramGenerator<GraphVisualState> = {
        generate: async (state) => {
          expect(state).toEqual(mockState);
          return 'flowchart TD\n  A';
        },
        supports: (type) => type === 'flowchart',
      };

      service.registerGenerator(['flowchart'], mockGenerator);

      const result = await service.generate(mockState, 'flowchart');

      expect(result).toBe('flowchart TD\n  A');
    });

    it('should handle generator errors gracefully', async () => {
      const mockState: GraphVisualState = {
        paradigm: 'graph',
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      const mockGenerator: DiagramGenerator = {
        generate: async () => {
          throw new Error('Generate error');
        },
        supports: (type) => type === 'flowchart',
      };

      service.registerGenerator(['flowchart'], mockGenerator);

      const result = await service.generate(mockState, 'flowchart');

      expect(result).toBeNull();
    });
  });

  describe('validate', () => {
    it('should validate a valid graph state', () => {
      const state: GraphVisualState = {
        paradigm: 'graph',
        nodes: [
          { id: 'A', label: 'A', x: 0, y: 0, shape: 'rectangle' },
          { id: 'B', label: 'B', x: 100, y: 0, shape: 'rectangle' },
        ],
        edges: [
          { id: 'edge1', source: 'A', target: 'B', type: 'solid' },
        ],
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      const result = service.validate(state);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate node IDs', () => {
      const state: GraphVisualState = {
        paradigm: 'graph',
        nodes: [
          { id: 'A', label: 'A', x: 0, y: 0, shape: 'rectangle' },
          { id: 'A', label: 'A duplicate', x: 100, y: 0, shape: 'rectangle' },
        ],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      const result = service.validate(state);

      expect(result.valid).toBe(false);
      const duplicateError = result.errors.find(e => e.message.includes('Duplicate'));
      expect(duplicateError).toBeDefined();
      expect(duplicateError?.field).toBe('nodes');
      expect(duplicateError?.message).toContain('Duplicate node ID: A');
      expect(duplicateError?.severity).toBe('error');
    });

    it('should detect edges referencing non-existent nodes', () => {
      const state: GraphVisualState = {
        paradigm: 'graph',
        nodes: [
          { id: 'A', label: 'A', x: 0, y: 0, shape: 'rectangle' },
        ],
        edges: [
          { id: 'edge1', source: 'A', target: 'B', type: 'solid' },
          { id: 'edge2', source: 'C', target: 'A', type: 'solid' },
        ],
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      const result = service.validate(state);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
      expect(result.errors.some(e => e.message.includes('B'))).toBe(true);
      expect(result.errors.some(e => e.message.includes('C'))).toBe(true);
    });

    it('should warn about isolated nodes', () => {
      const state: GraphVisualState = {
        paradigm: 'graph',
        nodes: [
          { id: 'A', label: 'A', x: 0, y: 0, shape: 'rectangle' },
          { id: 'B', label: 'B', x: 100, y: 0, shape: 'rectangle' },
          { id: 'C', label: 'C (isolated)', x: 200, y: 0, shape: 'rectangle' },
        ],
        edges: [
          { id: 'edge1', source: 'A', target: 'B', type: 'solid' },
        ],
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      const result = service.validate(state);

      expect(result.valid).toBe(true); // Warnings don't invalidate
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].severity).toBe('warning');
      expect(result.errors[0].message).toContain('Isolated node: C');
    });

    it('should not warn about isolated nodes when there is only one node', () => {
      const state: GraphVisualState = {
        paradigm: 'graph',
        nodes: [
          { id: 'A', label: 'A', x: 0, y: 0, shape: 'rectangle' },
        ],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      const result = service.validate(state);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getSupportedDiagramTypes', () => {
    it('should return empty array when no parsers/generators registered', () => {
      const types = service.getSupportedDiagramTypes();

      expect(types).toEqual([]);
    });

    it('should return types with both parser and generator', () => {
      const mockParser: DiagramParser = {
        parse: async () => null,
        supports: () => true,
      };

      const mockGenerator: DiagramGenerator = {
        generate: async () => null,
        supports: () => true,
      };

      service.registerParser(['flowchart', 'state'], mockParser);
      service.registerGenerator(['flowchart'], mockGenerator);

      const types = service.getSupportedDiagramTypes();

      expect(types).toContain('flowchart');
      expect(types).not.toContain('state'); // Has parser but no generator
    });
  });
});
