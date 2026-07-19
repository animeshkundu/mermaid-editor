import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  detectDiagramType,
  extractErrorLocation,
  isDependencyError,
  normalizeConfigKey,
  renderMermaid,
  setCommittedConfig,
  initializeMermaid,
} from '@/lib/mermaid';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(function render(
      _id: string,
      _code: string,
      _container: Element
    ) {
      return Promise.resolve({ svg: '<svg></svg>' });
    }),
    parse: vi.fn(),
  },
}));

import mermaidAPI from 'mermaid';

const mermaid = mermaidAPI as unknown as {
  initialize: ReturnType<typeof vi.fn>;
  render: ReturnType<typeof vi.fn>;
  parse: ReturnType<typeof vi.fn>;
};

describe('Mermaid render resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mermaid.render).mockResolvedValue({ svg: '<svg></svg>' });
    document
      .querySelectorAll('[data-mermaid-render-container]')
      .forEach((element) => element.remove());
  });

  it('serializes overlapping render operations using isolated containers', async () => {
    let resolveFirst: ((value: { svg: string }) => void) | undefined;
    const firstRender = new Promise<{ svg: string }>((resolve) => {
      resolveFirst = resolve;
    });
    vi.mocked(mermaid.render)
      .mockImplementationOnce(() => firstRender)
      .mockResolvedValueOnce({ svg: '<svg id="second"></svg>' });

    const first = renderMermaid('flowchart TD\nA-->B', 'first', { theme: 'dark' });
    const second = renderMermaid('sequenceDiagram\nA->>B: Hi', 'second', {
      theme: 'forest',
    });

    await vi.waitFor(() => expect(mermaid.render).toHaveBeenCalledTimes(1));
    expect(mermaid.render.mock.calls[0][0]).toMatch(/^first-\d+$/);
    expect(mermaid.render.mock.calls[0][2]).toBeInstanceOf(HTMLElement);
    resolveFirst?.({ svg: '<svg id="first"></svg>' });
    await first;
    await second;

    expect(mermaid.render).toHaveBeenCalledTimes(2);
    expect(mermaid.render.mock.calls[1][0]).toMatch(/^second-\d+$/);
    expect(mermaid.render.mock.calls[0][2]).not.toBe(mermaid.render.mock.calls[1][2]);
  });

  it('restores committed config after a rejected render', async () => {
    setCommittedConfig({ theme: 'forest' });
    vi.mocked(mermaid.render).mockRejectedValueOnce(new Error('Parse error'));

    await expect(
      renderMermaid('flowchart TD\nA-->', 'reject', { theme: 'dark' })
    ).rejects.toThrow('Parse error');

    expect(mermaid.initialize.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ theme: 'forest' })
    );
  });

  it('forces rollback when a failed render used the committed config key', async () => {
    initializeMermaid({ theme: 'forest' });
    setCommittedConfig({ theme: 'forest' });
    vi.clearAllMocks();
    vi.mocked(mermaid.render).mockRejectedValueOnce(new Error('Parse error'));

    await expect(
      renderMermaid('flowchart TD\nA-->', 'same-config-reject', {
        theme: 'forest',
      })
    ).rejects.toThrow('Parse error');

    expect(mermaid.initialize).toHaveBeenCalledTimes(1);
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'forest' })
    );
  });

  it('restores committed config when a successful render is superseded', async () => {
    setCommittedConfig({ theme: 'base' });
    vi.mocked(mermaid.render).mockResolvedValueOnce({ svg: '<svg></svg>' });

    await renderMermaid(
      'flowchart TD\nA-->B',
      'superseded',
      { theme: 'dark' },
      { isCurrent: () => false }
    );

    expect(mermaid.initialize.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ theme: 'base' })
    );
  });

  it('always removes detached render containers and orphan nodes', async () => {
    vi.mocked(mermaid.render)
      .mockImplementationOnce(async (id: string) => {
        const orphan = document.createElement('div');
        orphan.id = `d${id}`;
        document.body.appendChild(orphan);
        return { svg: '<svg></svg>' };
      })
      .mockImplementationOnce(async (id: string) => {
        const orphan = document.createElement('div');
        orphan.id = id;
        document.body.appendChild(orphan);
        const iframe = document.createElement('iframe');
        iframe.id = `i${id}`;
        document.body.appendChild(iframe);
        throw new Error('Syntax error');
      });

    await renderMermaid('flowchart TD\nA-->B', 'success-cleanup');
    await expect(renderMermaid('invalid', 'reject-cleanup')).rejects.toThrow(
      'Syntax error'
    );

    expect(document.querySelectorAll('[data-mermaid-render-container]')).toHaveLength(0);
    expect(document.querySelector('[id^="dsuccess-cleanup-"]')).toBeNull();
    expect(document.querySelector('[id^="reject-cleanup-"]')).toBeNull();
    expect(document.querySelector('[id^="ireject-cleanup-"]')).toBeNull();
  });
});

describe('Mermaid diagnostics and context helpers', () => {
  it('uses precise jison locations and converts columns to one-based values', () => {
    const error = {
      message: 'Parse error on line 2',
      hash: { loc: { first_line: 2, first_column: 3, last_column: 6 } },
    };

    expect(extractErrorLocation(error, 'flowchart TD\n  A -->')).toEqual({
      line: 2,
      column: 4,
      endColumn: 7,
    });
  });

  it('uses parse, lexical, and syntax line messages when bounded', () => {
    expect(
      extractErrorLocation(new Error('Lexical error on line 3'), 'a\nb\nc')
    ).toEqual({ line: 3 });
    expect(
      extractErrorLocation(new Error('Syntax error on line 9'), 'a\nb')
    ).toBeNull();
  });

  it('falls back to the zero-based jison hash line', () => {
    expect(
      extractErrorLocation(
        { message: 'Lexical failure', hash: { line: 1 } },
        'flowchart TD\nA -->'
      )
    ).toEqual({ line: 2 });
  });

  it('converts langium offsets across frontmatter and CRLF text', () => {
    const code = '---\r\ntitle: Test\r\n---\r\npacket-beta\r\nbroken';
    const offset = code.indexOf('broken') + 2;

    expect(
      extractErrorLocation(new Error(`Parse failed at offset: ${offset}`), code)
    ).toEqual({ line: 5, column: 3, endColumn: 4 });
  });

  it('returns null when no trustworthy location exists', () => {
    expect(extractErrorLocation(new Error('Unexpected token'), 'flowchart TD')).toBeNull();
  });

  it.each([
    ['graph LR\nA-->B', 'flowchart'],
    ['%% comment\nsequenceDiagram\nA->>B: Hi', 'sequence'],
    ['---\ntitle: Demo\n---\nclassDiagram\nclass A', 'class'],
    ['%%{init: {"theme":"dark"}}%%\nstateDiagram-v2\n[*] --> A', 'state'],
    ['C4Container\nContainer(app, "App")', 'c4'],
    ['architecture-beta\nservice api(server)[API]', 'architecture'],
  ])('detects diagram context from %s', (code, type) => {
    expect(detectDiagramType(code)).toBe(type);
  });

  it('returns null for comments, empty input, and gibberish', () => {
    expect(detectDiagramType('%% only a comment')).toBeNull();
    expect(detectDiagramType('')).toBeNull();
    expect(detectDiagramType('not-a-diagram')).toBeNull();
  });

  it('normalizes equivalent config objects independent of key order', () => {
    expect(
      normalizeConfigKey({ theme: 'dark', flowchart: { padding: 12, curve: 'linear' } })
    ).toBe(
      normalizeConfigKey({ flowchart: { curve: 'linear', padding: 12 }, theme: 'dark' })
    );
  });

  it('classifies dependency loading errors without misclassifying syntax errors', () => {
    expect(
      isDependencyError(new TypeError('Failed to fetch dynamically imported module'))
    ).toBe(true);
    expect(isDependencyError(new Error('ChunkLoadError: Loading chunk 42 failed'))).toBe(
      true
    );
    expect(isDependencyError(new Error('Parse error on line 2'))).toBe(false);
  });
});
