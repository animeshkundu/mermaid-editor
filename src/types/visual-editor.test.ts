/**
 * Tests for Visual Editor Type Definitions
 * 
 * These tests verify that the type definitions are correctly structured
 * and can be used without errors.
 */

import { describe, it, expect } from 'vitest';
import type {
  EditMode,
  DiagramParadigm,
  GraphVisualState,
  RailVisualState,
  TimelineVisualState,
  DataVisualState,
  VisualState,
  VisualNode,
  VisualEdge,
  MermaidShape,
  EdgeType,
  Viewport,
  ParseResult,
  GeneratorResult,
  ValidationResult,
} from './visual-editor';

describe('Visual Editor Types', () => {
  describe('EditMode', () => {
    it('should accept valid edit modes', () => {
      const textMode: EditMode = 'text';
      const visualMode: EditMode = 'visual';
      
      expect(textMode).toBe('text');
      expect(visualMode).toBe('visual');
    });
  });

  describe('DiagramParadigm', () => {
    it('should accept valid diagram paradigms', () => {
      const paradigms: DiagramParadigm[] = ['graph', 'rail', 'timeline', 'data'];
      
      expect(paradigms).toHaveLength(4);
      expect(paradigms).toContain('graph');
      expect(paradigms).toContain('rail');
      expect(paradigms).toContain('timeline');
      expect(paradigms).toContain('data');
    });
  });

  describe('Viewport', () => {
    it('should create valid viewport state', () => {
      const viewport: Viewport = {
        x: 100,
        y: 200,
        zoom: 1.5,
      };
      
      expect(viewport.x).toBe(100);
      expect(viewport.y).toBe(200);
      expect(viewport.zoom).toBe(1.5);
    });
  });

  describe('GraphVisualState', () => {
    it('should create valid graph visual state', () => {
      const state: GraphVisualState = {
        paradigm: 'graph',
        nodes: [
          {
            id: 'A',
            label: 'Start',
            x: 0,
            y: 0,
            shape: 'rectangle',
          },
          {
            id: 'B',
            label: 'End',
            x: 200,
            y: 0,
            shape: 'rounded',
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'A',
            target: 'B',
            type: 'solid',
          },
        ],
        viewport: { x: 0, y: 0, zoom: 1 },
      };
      
      expect(state.paradigm).toBe('graph');
      expect(state.nodes).toHaveLength(2);
      expect(state.edges).toHaveLength(1);
      expect(state.viewport.zoom).toBe(1);
    });

    it('should support all node properties', () => {
      const node: VisualNode = {
        id: 'test',
        label: 'Test Node',
        x: 100,
        y: 200,
        shape: 'rhombus',
        width: 150,
        height: 100,
        style: {
          fill: '#ff0000',
          stroke: '#000000',
          strokeWidth: 2,
        },
        metadata: {
          custom: 'data',
        },
      };
      
      expect(node.id).toBe('test');
      expect(node.shape).toBe('rhombus');
      expect(node.width).toBe(150);
      expect(node.style?.fill).toBe('#ff0000');
      expect(node.metadata?.custom).toBe('data');
    });

    it('should support all edge properties', () => {
      const edge: VisualEdge = {
        id: 'edge1',
        source: 'A',
        target: 'B',
        label: 'connects to',
        type: 'dotted',
        style: {
          stroke: '#0000ff',
          strokeWidth: 3,
        },
        metadata: {
          weight: 5,
        },
      };
      
      expect(edge.id).toBe('edge1');
      expect(edge.label).toBe('connects to');
      expect(edge.type).toBe('dotted');
      expect(edge.style?.stroke).toBe('#0000ff');
      expect(edge.metadata?.weight).toBe(5);
    });
  });

  describe('MermaidShape', () => {
    it('should accept all valid Mermaid shapes', () => {
      const shapes: MermaidShape[] = [
        'rectangle',
        'rounded',
        'stadium',
        'subroutine',
        'cylindrical',
        'circle',
        'asymmetric',
        'rhombus',
        'hexagon',
        'parallelogram',
        'parallelogram-alt',
        'trapezoid',
        'trapezoid-alt',
        'double-circle',
      ];
      
      expect(shapes).toHaveLength(14);
      expect(shapes).toContain('rectangle');
      expect(shapes).toContain('rhombus');
      expect(shapes).toContain('circle');
    });
  });

  describe('EdgeType', () => {
    it('should accept all valid edge types', () => {
      const types: EdgeType[] = ['solid', 'dotted', 'thick', 'open'];
      
      expect(types).toHaveLength(4);
      expect(types).toContain('solid');
      expect(types).toContain('dotted');
    });
  });

  describe('RailVisualState', () => {
    it('should create valid rail visual state', () => {
      const state: RailVisualState = {
        paradigm: 'rail',
        participants: [
          { id: 'alice', label: 'Alice', x: 0 },
          { id: 'bob', label: 'Bob', x: 200 },
        ],
        messages: [
          {
            id: 'msg1',
            from: 'alice',
            to: 'bob',
            label: 'Hello',
            y: 50,
            type: 'solid',
          },
        ],
        viewport: { x: 0, y: 0, zoom: 1 },
      };
      
      expect(state.paradigm).toBe('rail');
      expect(state.participants).toHaveLength(2);
      expect(state.messages).toHaveLength(1);
    });
  });

  describe('TimelineVisualState', () => {
    it('should create valid timeline visual state', () => {
      const state: TimelineVisualState = {
        paradigm: 'timeline',
        items: [
          {
            id: 'task1',
            label: 'Design',
            startDate: '2024-01-01',
            endDate: '2024-01-15',
            y: 0,
            progress: 50,
          },
        ],
        viewport: { x: 0, y: 0, zoom: 1 },
      };
      
      expect(state.paradigm).toBe('timeline');
      expect(state.items).toHaveLength(1);
      expect(state.items[0].progress).toBe(50);
    });
  });

  describe('DataVisualState', () => {
    it('should create valid data visual state', () => {
      const state: DataVisualState = {
        paradigm: 'data',
        dataset: [
          { id: '1', label: 'Category A', value: 30 },
          { id: '2', label: 'Category B', value: 70 },
        ],
        config: {
          chartType: 'pie',
        },
        viewport: { x: 0, y: 0, zoom: 1 },
      };
      
      expect(state.paradigm).toBe('data');
      expect(state.dataset).toHaveLength(2);
      expect(state.config.chartType).toBe('pie');
    });
  });

  describe('VisualState Union', () => {
    it('should accept any valid visual state variant', () => {
      const states: VisualState[] = [
        {
          paradigm: 'graph',
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
        {
          paradigm: 'rail',
          participants: [],
          messages: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
        {
          paradigm: 'timeline',
          items: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
        {
          paradigm: 'data',
          dataset: [],
          config: {},
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      ];
      
      expect(states).toHaveLength(4);
      expect(states[0].paradigm).toBe('graph');
      expect(states[1].paradigm).toBe('rail');
      expect(states[2].paradigm).toBe('timeline');
      expect(states[3].paradigm).toBe('data');
    });
  });

  describe('ParseResult', () => {
    it('should create valid parse success result', () => {
      const result: ParseResult<GraphVisualState> = {
        success: true,
        state: {
          paradigm: 'graph',
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      };
      
      expect(result.success).toBe(true);
      expect(result.state?.paradigm).toBe('graph');
      expect(result.error).toBeUndefined();
    });

    it('should create valid parse error result', () => {
      const result: ParseResult = {
        success: false,
        error: 'Invalid syntax',
      };
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid syntax');
      expect(result.state).toBeUndefined();
    });
  });

  describe('GeneratorResult', () => {
    it('should create valid generator success result', () => {
      const result: GeneratorResult = {
        success: true,
        code: 'flowchart TD\n  A --> B',
      };
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('flowchart');
      expect(result.error).toBeUndefined();
    });

    it('should create valid generator error result', () => {
      const result: GeneratorResult = {
        success: false,
        error: 'Cannot generate from empty state',
      };
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot generate from empty state');
      expect(result.code).toBeUndefined();
    });
  });

  describe('ValidationResult', () => {
    it('should create valid validation result', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            field: 'nodes',
            message: 'Duplicate node ID: A',
            severity: 'error',
          },
          {
            field: 'edges',
            message: 'Edge references non-existent node: C',
            severity: 'warning',
          },
        ],
      };
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].severity).toBe('error');
      expect(result.errors[1].severity).toBe('warning');
    });

    it('should create valid validation success', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
      };
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
