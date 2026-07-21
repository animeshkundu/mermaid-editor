import {
  HARD_DIAGRAM_CEILING,
  INTERACTIVE_RENDER_THRESHOLD,
  RENDER_TIMEOUT_MS,
} from '@/lib/constants';
import type { DiagramLimits, MermaidConfig } from '@/types';

export type DiagramMetrics = {
  textSize: number;
  estimatedEdges: number;
  estimatedNodes: number;
  lines: number;
};

type LimitKind = 'edges' | 'text';

const EDGE_PATTERN =
  /(?:<-->|-\.-|-.->|==>|-->>|->>|-->|---|~~~|--x|-x|--\)|-\)|<\|--|\*--|o--|\|\|--|}o--|}\|--)/g;
const NODE_PATTERN = /\b[A-Za-z_][A-Za-z\d_-]*\b/g;

export class DiagramLimitError extends Error {
  readonly kind: LimitKind;
  readonly metrics: DiagramMetrics;
  readonly limit: number;

  constructor(kind: LimitKind, metrics: DiagramMetrics, limit: number) {
    const measured = kind === 'edges' ? metrics.estimatedEdges : metrics.textSize;
    const label = kind === 'edges' ? 'connections' : 'characters';
    const setting = kind === 'edges' ? 'maxEdges' : 'maxTextSize';
    const ceiling =
      kind === 'edges'
        ? HARD_DIAGRAM_CEILING.maxEdges
        : HARD_DIAGRAM_CEILING.maxTextSize;
    super(
      `Rendering was not started: this diagram contains about ${measured.toLocaleString()} ${label}, ` +
        `above the configured ${setting} limit of ${limit.toLocaleString()}. ` +
        `Simplify the source or raise ${setting} in Configuration up to the safe ceiling of ` +
        `${ceiling.toLocaleString()}. Your source and last valid preview were preserved.`
    );
    this.name = 'DiagramLimitError';
    this.kind = kind;
    this.metrics = metrics;
    this.limit = limit;
  }
}

export class RenderTimeoutError extends Error {
  constructor(timeoutMs: number = RENDER_TIMEOUT_MS) {
    super(
      `Rendering did not finish within ${Math.round(timeoutMs / 1_000)} seconds. ` +
        'The source and last valid preview were preserved. Simplify the diagram and try again.'
    );
    this.name = 'RenderTimeoutError';
  }
}

export const getDiagramMetrics = (code: string): DiagramMetrics => {
  const nodeTokens = code.match(NODE_PATTERN) ?? [];
  return {
    textSize: code.length,
    estimatedEdges: (code.match(EDGE_PATTERN) ?? []).length,
    estimatedNodes: new Set(nodeTokens).size,
    lines: code ? code.split(/\r?\n/).length : 0,
  };
};

const getLimits = (config: MermaidConfig): DiagramLimits => ({
  maxEdges:
    typeof config.maxEdges === 'number'
      ? Math.min(config.maxEdges, HARD_DIAGRAM_CEILING.maxEdges)
      : HARD_DIAGRAM_CEILING.maxEdges,
  maxTextSize:
    typeof config.maxTextSize === 'number'
      ? Math.min(config.maxTextSize, HARD_DIAGRAM_CEILING.maxTextSize)
      : HARD_DIAGRAM_CEILING.maxTextSize,
});

export const assertDiagramWithinLimits = (
  code: string,
  config: MermaidConfig
): DiagramMetrics => {
  const metrics = getDiagramMetrics(code);
  const limits = getLimits(config);

  if (metrics.textSize > limits.maxTextSize) {
    throw new DiagramLimitError('text', metrics, limits.maxTextSize);
  }
  if (metrics.estimatedEdges > limits.maxEdges) {
    throw new DiagramLimitError('edges', metrics, limits.maxEdges);
  }

  return metrics;
};

export const requiresManualRender = (code: string): boolean => {
  const metrics = getDiagramMetrics(code);
  return (
    metrics.estimatedEdges > INTERACTIVE_RENDER_THRESHOLD.maxEdges ||
    metrics.textSize > INTERACTIVE_RENDER_THRESHOLD.maxTextSize
  );
};

export const withRenderTimeout = async <T>(
  operation: Promise<T>,
  timeoutMs: number = RENDER_TIMEOUT_MS
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new RenderTimeoutError(timeoutMs)), timeoutMs);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export const isRenderLimitError = (
  error: unknown
): error is DiagramLimitError | RenderTimeoutError =>
  error instanceof DiagramLimitError || error instanceof RenderTimeoutError;
