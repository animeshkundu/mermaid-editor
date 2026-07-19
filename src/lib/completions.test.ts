import { describe, expect, it } from 'vitest';
import {
  buildCompletions,
  detectContextType,
  DIAGRAM_TYPES,
  STARTER_SNIPPETS,
} from '@/lib/completions';
import { DIAGRAM_EXAMPLES } from '@/lib/constants';

describe('Mermaid completions', () => {
  it.each(DIAGRAM_TYPES)('provides keywords and an example-backed snippet for %s', (type) => {
    const code = STARTER_SNIPPETS[type];
    const completions = buildCompletions(code);
    const example = DIAGRAM_EXAMPLES.find((candidate) => candidate.type === type);

    expect(completions.keywords.length).toBeGreaterThan(0);
    expect(completions.snippets.length).toBeGreaterThanOrEqual(1);
    expect(completions.snippets[0].insertText).toBe(example?.code);
    expect(STARTER_SNIPPETS[type]).toBe(example?.code);
  });

  it.each([
    ['%% comment\nflowchart LR\nA-->B', 'flowchart'],
    ['---\ntitle: Demo\n---\nsequenceDiagram\nA->>B: Hi', 'sequence'],
    ['%%{init: {"theme":"dark"}}%%\nclassDiagram\nclass A', 'class'],
    ['C4Deployment\nDeployment_Node(node, "Node")', 'c4'],
    ['architecture-beta\nservice api(server)[API]', 'architecture'],
  ] as const)('detects context from %s', (code, expected) => {
    expect(detectContextType(code)).toBe(expected);
  });

  it('returns generic keywords and all starter snippets for empty or unrecognized input', () => {
    for (const code of ['', 'not a mermaid diagram']) {
      const completions = buildCompletions(code);
      expect(completions.keywords).toContain('flowchart');
      expect(completions.snippets).toHaveLength(DIAGRAM_TYPES.length);
    }
  });
});
