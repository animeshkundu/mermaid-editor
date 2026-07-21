import {
  DEFAULT_DIAGRAM_LIMITS,
  DEFAULT_MERMAID_CONFIG,
  FIXED_SECURITY_LEVEL,
  HARD_DIAGRAM_CEILING,
  MIN_DIAGRAM_LIMITS,
} from '@/lib/constants';
import type { MermaidConfig } from '@/types';

let committedConfig: MermaidConfig | null = null;

const clampLimit = (
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number
): number => {
  const numericValue = typeof value === 'number' && Number.isFinite(value)
    ? Math.floor(value)
    : fallback;
  return Math.min(Math.max(numericValue, minimum), maximum);
};

export const createEffectiveConfig = (
  config: MermaidConfig = DEFAULT_MERMAID_CONFIG
): MermaidConfig => ({
  ...config,
  startOnLoad: false,
  theme: config.theme || DEFAULT_MERMAID_CONFIG.theme || 'base',
  look: config.look || DEFAULT_MERMAID_CONFIG.look || 'classic',
  fontFamily:
    config.fontFamily ||
    DEFAULT_MERMAID_CONFIG.fontFamily ||
    '"Inter", "Segoe UI", sans-serif',
  maxEdges: clampLimit(
    config.maxEdges,
    DEFAULT_DIAGRAM_LIMITS.maxEdges,
    MIN_DIAGRAM_LIMITS.maxEdges,
    HARD_DIAGRAM_CEILING.maxEdges
  ),
  maxTextSize: clampLimit(
    config.maxTextSize,
    DEFAULT_DIAGRAM_LIMITS.maxTextSize,
    MIN_DIAGRAM_LIMITS.maxTextSize,
    HARD_DIAGRAM_CEILING.maxTextSize
  ),
  securityLevel: FIXED_SECURITY_LEVEL,
  themeVariables: config.themeVariables || DEFAULT_MERMAID_CONFIG.themeVariables || {},
});

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`);
    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value) ?? 'undefined';
};

export const normalizeConfigKey = (
  config: MermaidConfig = DEFAULT_MERMAID_CONFIG
): string => stableStringify(createEffectiveConfig(config));

export const setCommittedConfig = (config: MermaidConfig): void => {
  committedConfig = createEffectiveConfig(config);
};

export const getCommittedConfig = (): MermaidConfig | null => committedConfig;
