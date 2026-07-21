import { isRenderLimitError } from '@/lib/render-guard';
import type { ErrorLocation, RenderDiagnostic } from '@/types';

type MermaidErrorShape = {
  message?: unknown;
  hash?: {
    loc?: {
      first_line?: unknown;
      first_column?: unknown;
      last_column?: unknown;
    };
    line?: unknown;
  };
};

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

const getErrorShape = (error: unknown): MermaidErrorShape | null =>
  error && typeof error === 'object' ? (error as MermaidErrorShape) : null;

const getBoundedLine = (line: number, code: string): number | null => {
  const lineCount = code.split(/\r?\n/).length;
  return Number.isInteger(line) && line >= 1 && line <= lineCount ? line : null;
};

const locationFromOffset = (offset: number, code: string): ErrorLocation | null => {
  if (!Number.isInteger(offset) || offset < 0 || offset > code.length) {
    return null;
  }

  let line = 1;
  let column = 1;

  for (let index = 0; index < offset; index += 1) {
    if (code[index] === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column, endColumn: column + 1 };
};

export const extractErrorLocation = (error: unknown, code: string): ErrorLocation | null => {
  const shape = getErrorShape(error);
  const loc = shape?.hash?.loc;

  if (
    typeof loc?.first_line === 'number' &&
    typeof loc.first_column === 'number'
  ) {
    const line = getBoundedLine(loc.first_line, code);
    if (line !== null && loc.first_column >= 0) {
      const column = loc.first_column + 1;
      const lastColumn =
        typeof loc.last_column === 'number' && loc.last_column >= loc.first_column
          ? loc.last_column + 1
          : column + 1;
      return { line, column, endColumn: Math.max(column + 1, lastColumn) };
    }
  }

  const message = extractErrorMessage(error);
  const reportedLine = message.match(/(?:Parse|Lexical|Syntax) error on line (\d+)/i);
  if (reportedLine) {
    const line = getBoundedLine(Number(reportedLine[1]), code);
    if (line !== null) {
      return { line };
    }
  }

  if (typeof shape?.hash?.line === 'number') {
    const line = getBoundedLine(shape.hash.line + 1, code);
    if (line !== null) {
      return { line };
    }
  }

  const reportedOffset = message.match(/offset:?\s*(\d+)/i);
  if (reportedOffset) {
    return locationFromOffset(Number(reportedOffset[1]), code);
  }

  return null;
};

export const isDependencyError = (error: unknown): boolean => {
  const message = extractErrorMessage(error);
  return /(?:failed to fetch dynamically imported module|error loading dynamically imported module|chunkloaderror|loading chunk \S+ failed|importing a module script failed|cannot find module|module initialization)/i.test(
    message
  );
};

export const createRenderDiagnostic = (
  error: unknown,
  code: string
): RenderDiagnostic => ({
  message: extractErrorMessage(error),
  location: isRenderLimitError(error) ? null : extractErrorLocation(error, code),
  kind: isRenderLimitError(error)
    ? 'limit'
    : isDependencyError(error)
      ? 'dependency'
      : 'syntax',
});
