import { describe, it, expect } from 'vitest';
import {
  DEFAULT_DIAGRAM_CODE,
  DEFAULT_MERMAID_CONFIG,
  DEFAULT_EDITOR_SETTINGS,
  DIAGRAM_EXAMPLES,
} from '@/lib/constants';
import { DiagramType, ExportFormat, MermaidConfig, EditorSettings, DiagramExample } from '@/types';

describe('Constants', () => {
  describe('DEFAULT_DIAGRAM_CODE', () => {
    it('should be a non-empty string', () => {
      expect(DEFAULT_DIAGRAM_CODE).toBeTruthy();
      expect(typeof DEFAULT_DIAGRAM_CODE).toBe('string');
    });

    it('should be valid mermaid flowchart syntax', () => {
      expect(DEFAULT_DIAGRAM_CODE).toContain('flowchart');
    });
  });

  describe('DEFAULT_MERMAID_CONFIG', () => {
    it('should have a default theme', () => {
      expect(DEFAULT_MERMAID_CONFIG.theme).toBe('default');
    });

    it('should have themeVariables object', () => {
      expect(DEFAULT_MERMAID_CONFIG.themeVariables).toBeDefined();
      expect(typeof DEFAULT_MERMAID_CONFIG.themeVariables).toBe('object');
    });

    it('should have flowchart config', () => {
      expect(DEFAULT_MERMAID_CONFIG.flowchart).toBeDefined();
      expect(DEFAULT_MERMAID_CONFIG.flowchart?.curve).toBe('basis');
    });
  });

  describe('DEFAULT_EDITOR_SETTINGS', () => {
    it('should have valid theme', () => {
      expect(['vs-dark', 'vs-light']).toContain(DEFAULT_EDITOR_SETTINGS.theme);
    });

    it('should have valid fontSize', () => {
      expect(DEFAULT_EDITOR_SETTINGS.fontSize).toBeGreaterThan(0);
      expect(DEFAULT_EDITOR_SETTINGS.fontSize).toBeLessThanOrEqual(32);
    });

    it('should have valid wordWrap setting', () => {
      expect(['on', 'off']).toContain(DEFAULT_EDITOR_SETTINGS.wordWrap);
    });

    it('should have minimap setting', () => {
      expect(typeof DEFAULT_EDITOR_SETTINGS.minimap).toBe('boolean');
    });
  });

  describe('DIAGRAM_EXAMPLES', () => {
    it('should have at least 10 examples', () => {
      expect(DIAGRAM_EXAMPLES.length).toBeGreaterThanOrEqual(10);
    });

    it('should have unique ids', () => {
      const ids = DIAGRAM_EXAMPLES.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required properties for each example', () => {
      DIAGRAM_EXAMPLES.forEach((example) => {
        expect(example.id).toBeTruthy();
        expect(example.name).toBeTruthy();
        expect(example.type).toBeTruthy();
        expect(example.code).toBeTruthy();
        expect(example.description).toBeTruthy();
      });
    });

    it('should cover major diagram types', () => {
      const types = new Set(DIAGRAM_EXAMPLES.map((e) => e.type));
      expect(types.has('flowchart')).toBe(true);
      expect(types.has('sequence')).toBe(true);
      expect(types.has('class')).toBe(true);
      expect(types.has('state')).toBe(true);
      expect(types.has('er')).toBe(true);
      expect(types.has('gantt')).toBe(true);
      expect(types.has('pie')).toBe(true);
    });

    it('should have valid code for each example (starts with diagram type)', () => {
      DIAGRAM_EXAMPLES.forEach((example) => {
        const code = example.code.trim().toLowerCase();
        const validStarts = [
          'flowchart',
          'graph',
          'sequencediagram',
          'classdiagram',
          'statediagram',
          'erdiagram',
          'gantt',
          'pie',
          'journey',
          'gitgraph',
          'mindmap',
          'timeline',
          'quadrantchart',
          'requirementdiagram',
          'c4context',
        ];
        const hasValidStart = validStarts.some((start) =>
          code.startsWith(start)
        );
        expect(hasValidStart).toBe(true);
      });
    });
  });
});

describe('Types', () => {
  describe('DiagramType', () => {
    it('should support flowchart type', () => {
      const type: DiagramType = 'flowchart';
      expect(type).toBe('flowchart');
    });

    it('should support all diagram types', () => {
      const types: DiagramType[] = [
        'flowchart',
        'sequence',
        'class',
        'state',
        'er',
        'gantt',
        'pie',
        'journey',
        'gitGraph',
        'mindmap',
        'timeline',
        'quadrant',
        'requirement',
        'c4',
      ];
      types.forEach((type) => {
        expect(type).toBeTruthy();
      });
    });
  });

  describe('ExportFormat', () => {
    it('should support svg format', () => {
      const format: ExportFormat = 'svg';
      expect(format).toBe('svg');
    });

    it('should support all export formats', () => {
      const formats: ExportFormat[] = ['svg', 'png', 'markdown'];
      formats.forEach((format) => {
        expect(format).toBeTruthy();
      });
    });
  });

  describe('MermaidConfig', () => {
    it('should accept valid config', () => {
      const config: MermaidConfig = {
        theme: 'dark',
        themeVariables: { primaryColor: '#ff0000' },
        flowchart: { curve: 'linear', padding: 10 },
      };
      expect(config.theme).toBe('dark');
    });

    it('should accept all theme values', () => {
      const themes: Array<MermaidConfig['theme']> = [
        'default',
        'forest',
        'dark',
        'neutral',
        'base',
      ];
      themes.forEach((theme) => {
        const config: MermaidConfig = { theme };
        expect(config.theme).toBe(theme);
      });
    });
  });

  describe('EditorSettings', () => {
    it('should accept valid settings', () => {
      const settings: EditorSettings = {
        theme: 'vs-dark',
        fontSize: 14,
        wordWrap: 'on',
        minimap: true,
      };
      expect(settings.fontSize).toBe(14);
    });
  });

  describe('DiagramExample', () => {
    it('should accept valid example', () => {
      const example: DiagramExample = {
        id: 'test-id',
        name: 'Test Example',
        type: 'flowchart',
        code: 'flowchart TD\n  A --> B',
        description: 'A test example',
      };
      expect(example.id).toBe('test-id');
    });
  });
});
