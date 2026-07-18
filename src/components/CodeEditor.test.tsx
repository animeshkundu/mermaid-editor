import { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeEditor } from '@/components/CodeEditor';
import { DEFAULT_EDITOR_SETTINGS } from '@/lib/constants';

const monacoMocks = vi.hoisted(() => {
  const model = {
    getValue: vi.fn(() => 'sequenceDiagram\nA->>B: Hi'),
    getWordUntilPosition: vi.fn(() => ({ startColumn: 1, endColumn: 1 })),
    getLineCount: vi.fn(() => 3),
    getLineMaxColumn: vi.fn(() => 20),
  };
  const editor = {
    getModel: vi.fn(() => model),
    updateOptions: vi.fn(),
  };
  const monaco = {
    languages: {
      register: vi.fn(),
      setMonarchTokensProvider: vi.fn(),
      registerCompletionItemProvider: vi.fn(),
      CompletionItemKind: { Keyword: 1, Snippet: 2 },
      CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
    },
    editor: {
      defineTheme: vi.fn(),
      setTheme: vi.fn(),
      setModelMarkers: vi.fn(),
    },
    MarkerSeverity: { Error: 8 },
  };
  return { model, editor, monaco };
});

vi.mock('@monaco-editor/react', () => ({
  Editor: ({
    onMount,
  }: {
    onMount?: (editor: typeof monacoMocks.editor, monaco: typeof monacoMocks.monaco) => void;
  }) => {
    useEffect(() => {
      onMount?.(monacoMocks.editor, monacoMocks.monaco);
    }, [onMount]);
    return <div data-testid="mock-monaco-editor" />;
  },
}));

describe('CodeEditor Monaco integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers completions once and publishes at most one complete marker', async () => {
    const diagnostic = {
      message: 'Parse error on line 2\nExpected an arrow',
      location: { line: 2, column: 3, endColumn: 8 },
      kind: 'syntax' as const,
    };
    const { rerender } = render(
      <CodeEditor
        value="sequenceDiagram"
        onChange={vi.fn()}
        settings={DEFAULT_EDITOR_SETTINGS}
        errorMarker={diagnostic}
      />
    );

    await waitFor(() => {
      expect(monacoMocks.monaco.languages.registerCompletionItemProvider).toHaveBeenCalledTimes(
        1
      );
      expect(monacoMocks.monaco.editor.setModelMarkers).toHaveBeenCalledWith(
        monacoMocks.model,
        'mermaid',
        [
          expect.objectContaining({
            message: diagnostic.message,
            startLineNumber: 2,
            startColumn: 3,
            endColumn: 8,
          }),
        ]
      );
    });

    const provider =
      monacoMocks.monaco.languages.registerCompletionItemProvider.mock.calls[0][1];
    const result = provider.provideCompletionItems(monacoMocks.model, {
      lineNumber: 2,
      column: 1,
    });
    expect(result.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'participant' }),
        expect.objectContaining({
          label: 'Sequence Diagram starter',
          additionalTextEdits: [
            {
              range: {
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: 2,
                endColumn: 1,
              },
              text: '',
            },
            {
              range: {
                startLineNumber: 2,
                startColumn: 1,
                endLineNumber: 3,
                endColumn: 20,
              },
              text: '',
            },
          ],
        }),
      ])
    );

    rerender(
      <CodeEditor
        value="sequenceDiagram"
        onChange={vi.fn()}
        settings={DEFAULT_EDITOR_SETTINGS}
        errorMarker={{
          message: 'Unexpected end of line',
          location: { line: 2, column: 999, endColumn: 1000 },
          kind: 'syntax',
        }}
      />
    );
    await waitFor(() => {
      expect(monacoMocks.monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(
        monacoMocks.model,
        'mermaid',
        [
          expect.objectContaining({
            startLineNumber: 2,
            startColumn: 19,
            endColumn: 20,
          }),
        ]
      );
    });

    rerender(
      <CodeEditor
        value="sequenceDiagram"
        onChange={vi.fn()}
        settings={DEFAULT_EDITOR_SETTINGS}
        errorMarker={null}
      />
    );
    await waitFor(() => {
      expect(monacoMocks.monaco.editor.setModelMarkers).toHaveBeenLastCalledWith(
        monacoMocks.model,
        'mermaid',
        []
      );
    });

    render(
      <CodeEditor
        value="flowchart TD"
        onChange={vi.fn()}
        settings={DEFAULT_EDITOR_SETTINGS}
      />
    );
    expect(
      monacoMocks.monaco.languages.registerCompletionItemProvider
    ).toHaveBeenCalledTimes(1);
  });
});
