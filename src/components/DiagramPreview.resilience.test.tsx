import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagramPreview } from '@/components/DiagramPreview';
import { DEFAULT_MERMAID_CONFIG } from '@/lib/constants';
import { renderMermaid } from '@/lib/mermaid';

vi.mock('@/lib/mermaid', () => ({
  renderMermaid: vi.fn(),
}));

describe('DiagramPreview render resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(renderMermaid).mockResolvedValue({
      svg: '<svg><text>Test Diagram</text></svg>',
    });
  });

  it('shows the complete blocking syntax error on cold start', async () => {
    vi.mocked(renderMermaid).mockRejectedValueOnce(
      new Error('Syntax error in diagram')
    );

    render(
      <DiagramPreview
        code="invalid mermaid"
        config={DEFAULT_MERMAID_CONFIG}
      />
    );

    expect(await screen.findByText('Syntax Error', {}, { timeout: 2000 })).toBeVisible();
    expect(screen.getByText('Syntax error in diagram')).toBeVisible();
  });

  it('retains and dims a compatible last-good diagram after a syntax error', async () => {
    const onDiagnostic = vi.fn();
    const onStaleChange = vi.fn();
    vi.mocked(renderMermaid)
      .mockResolvedValueOnce({ svg: '<svg><text>Last good</text></svg>' })
      .mockRejectedValueOnce(new Error('Parse error on line 2'));

    const { rerender } = render(
      <DiagramPreview
        code={'flowchart TD\nA --> B'}
        config={DEFAULT_MERMAID_CONFIG}
        onDiagnostic={onDiagnostic}
        onStaleChange={onStaleChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('mermaid-diagram')).toContainHTML('Last good');
    });

    rerender(
      <DiagramPreview
        code={'flowchart TD\nA -->'}
        config={DEFAULT_MERMAID_CONFIG}
        onDiagnostic={onDiagnostic}
        onStaleChange={onStaleChange}
      />
    );

    expect(
      await screen.findByText(
        'Rendering paused — showing last valid diagram',
        {},
        { timeout: 2000 }
      )
    ).toBeVisible();
    expect(screen.getByTestId('mermaid-diagram')).toHaveClass('opacity-[0.45]');
    expect(screen.getByTestId('mermaid-diagram').querySelector('svg')).toBeTruthy();
    expect(onStaleChange).toHaveBeenLastCalledWith(true);
    expect(onDiagnostic).toHaveBeenLastCalledWith(
      expect.objectContaining({ message: 'Parse error on line 2', kind: 'syntax' })
    );
  });

  it('clears retained output when the diagram type changes', async () => {
    vi.mocked(renderMermaid)
      .mockResolvedValueOnce({ svg: '<svg><text>Flowchart</text></svg>' })
      .mockRejectedValueOnce(new Error('Syntax error on line 2'));

    const { rerender } = render(
      <DiagramPreview
        code={'flowchart TD\nA --> B'}
        config={DEFAULT_MERMAID_CONFIG}
      />
    );
    await screen.findByText('Flowchart', {}, { timeout: 2000 });

    rerender(
      <DiagramPreview
        code={'sequenceDiagram\nA ->>'}
        config={DEFAULT_MERMAID_CONFIG}
      />
    );

    expect(await screen.findByText('Syntax Error', {}, { timeout: 2000 })).toBeVisible();
    expect(screen.queryByTestId('mermaid-diagram')).not.toBeInTheDocument();
  });

  it('clears last-good state on empty source before a later invalid edit', async () => {
    vi.mocked(renderMermaid)
      .mockResolvedValueOnce({ svg: '<svg><text>Flowchart</text></svg>' })
      .mockRejectedValueOnce(new Error('Syntax error'));

    const { rerender } = render(
      <DiagramPreview
        code={'flowchart TD\nA --> B'}
        config={DEFAULT_MERMAID_CONFIG}
      />
    );
    await screen.findByText('Flowchart', {}, { timeout: 2000 });

    rerender(<DiagramPreview code="" config={DEFAULT_MERMAID_CONFIG} />);
    expect(await screen.findByText('Start typing to see your diagram')).toBeVisible();
    expect(screen.queryByTestId('mermaid-diagram')).not.toBeInTheDocument();

    rerender(
      <DiagramPreview code={'flowchart TD\nA -->'} config={DEFAULT_MERMAID_CONFIG} />
    );
    expect(await screen.findByText('Syntax Error', {}, { timeout: 2000 })).toBeVisible();
  });

  it('allows only the newest in-flight render to commit', async () => {
    let resolveFirst: ((value: { svg: string }) => void) | undefined;
    let resolveSecond: ((value: { svg: string }) => void) | undefined;
    vi.mocked(renderMermaid)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          })
      );
    const onSvgRendered = vi.fn();

    const { rerender } = render(
      <DiagramPreview
        code={'flowchart TD\nA --> B'}
        config={DEFAULT_MERMAID_CONFIG}
        onSvgRendered={onSvgRendered}
      />
    );
    await waitFor(() => expect(renderMermaid).toHaveBeenCalledTimes(1), {
      timeout: 2000,
    });

    rerender(
      <DiagramPreview
        code={'flowchart TD\nB --> C'}
        config={DEFAULT_MERMAID_CONFIG}
        onSvgRendered={onSvgRendered}
      />
    );
    await waitFor(() => expect(renderMermaid).toHaveBeenCalledTimes(2), {
      timeout: 2000,
    });

    await act(async () => {
      resolveSecond?.({ svg: '<svg><text>Newest</text></svg>' });
    });
    await screen.findByText('Newest');

    await act(async () => {
      resolveFirst?.({ svg: '<svg><text>Stale</text></svg>' });
    });

    expect(screen.getByTestId('mermaid-diagram')).toContainHTML('Newest');
    expect(screen.queryByText('Stale')).not.toBeInTheDocument();
    expect(onSvgRendered).toHaveBeenLastCalledWith(
      '<svg><text>Newest</text></svg>'
    );
  });

  it('coalesces rapid edits into one render after the 300 ms debounce', async () => {
    vi.useFakeTimers();
    const { rerender, unmount } = render(
      <DiagramPreview
        code={'flowchart TD\nA --> B'}
        config={DEFAULT_MERMAID_CONFIG}
      />
    );

    try {
      rerender(
        <DiagramPreview
          code={'flowchart TD\nB --> C'}
          config={DEFAULT_MERMAID_CONFIG}
        />
      );
      rerender(
        <DiagramPreview
          code={'flowchart TD\nC --> D'}
          config={DEFAULT_MERMAID_CONFIG}
        />
      );

      await act(async () => {
        vi.advanceTimersByTime(299);
      });
      expect(renderMermaid).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(1);
        await Promise.resolve();
      });
      expect(renderMermaid).toHaveBeenCalledTimes(1);
      expect(renderMermaid).toHaveBeenCalledWith(
        'flowchart TD\nC --> D',
        expect.any(String),
        DEFAULT_MERMAID_CONFIG,
        expect.objectContaining({ isCurrent: expect.any(Function) })
      );
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });

  it('reuses exact A input and rejects a superseded B commit in an A-to-B-to-A sequence', async () => {
    let resolveB: ((value: { svg: string }) => void) | undefined;
    vi.mocked(renderMermaid)
      .mockResolvedValueOnce({ svg: '<svg><text>Diagram A</text></svg>' })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveB = resolve;
          })
      );
    const onSvgRendered = vi.fn();
    const codeA = 'flowchart TD\nA --> B';

    const { rerender } = render(
      <DiagramPreview
        code={codeA}
        config={DEFAULT_MERMAID_CONFIG}
        onSvgRendered={onSvgRendered}
      />
    );
    await screen.findByText('Diagram A', {}, { timeout: 2000 });

    rerender(
      <DiagramPreview
        code={'flowchart TD\nB --> C'}
        config={DEFAULT_MERMAID_CONFIG}
        onSvgRendered={onSvgRendered}
      />
    );
    await waitFor(() => expect(renderMermaid).toHaveBeenCalledTimes(2), {
      timeout: 2000,
    });

    rerender(
      <DiagramPreview
        code={codeA}
        config={DEFAULT_MERMAID_CONFIG}
        onSvgRendered={onSvgRendered}
      />
    );
    await waitFor(() => {
      expect(onSvgRendered).toHaveBeenLastCalledWith(
        '<svg><text>Diagram A</text></svg>'
      );
    }, { timeout: 2000 });

    await act(async () => {
      resolveB?.({ svg: '<svg><text>Diagram B</text></svg>' });
    });

    expect(renderMermaid).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Diagram B')).not.toBeInTheDocument();
  });

  it('prevents in-flight work from committing after unmount', async () => {
    let resolveRender: ((value: { svg: string }) => void) | undefined;
    vi.mocked(renderMermaid).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRender = resolve;
        })
    );
    const onSvgRendered = vi.fn();
    const onDiagnostic = vi.fn();
    const onStaleChange = vi.fn();

    const { unmount } = render(
      <DiagramPreview
        code={'flowchart TD\nA --> B'}
        config={DEFAULT_MERMAID_CONFIG}
        onSvgRendered={onSvgRendered}
        onDiagnostic={onDiagnostic}
        onStaleChange={onStaleChange}
      />
    );
    await waitFor(() => expect(renderMermaid).toHaveBeenCalledTimes(1), {
      timeout: 2000,
    });
    unmount();

    await act(async () => {
      resolveRender?.({ svg: '<svg><text>Too late</text></svg>' });
    });

    expect(onSvgRendered).not.toHaveBeenCalled();
    expect(onDiagnostic).not.toHaveBeenCalled();
    expect(onStaleChange).not.toHaveBeenCalled();
  });

  it('shows a retry action for dependency failures and can recover', async () => {
    vi.mocked(renderMermaid)
      .mockRejectedValueOnce(
        new TypeError('Failed to fetch dynamically imported module')
      )
      .mockResolvedValueOnce({ svg: '<svg><text>Recovered</text></svg>' });

    render(
      <DiagramPreview
        code={'flowchart TD\nA --> B'}
        config={DEFAULT_MERMAID_CONFIG}
      />
    );

    expect(
      await screen.findByText('Preview dependency unavailable', {}, { timeout: 2000 })
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry rendering' }));
    expect(await screen.findByText('Recovered', {}, { timeout: 2000 })).toBeVisible();
  });
});
