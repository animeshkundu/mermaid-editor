/**
 * URL Sharing utilities for encoding/decoding mermaid diagrams
 * Mermaid.live uses pako (zlib) compression + base64 encoding
 * We'll use a simpler approach with built-in browser APIs
 */

import { HARD_DIAGRAM_CEILING } from '@/lib/constants';
import type { MermaidConfig } from '@/types';

export const MAX_SHARE_ENCODED_SIZE = 1_000_000;
export const MAX_SHARE_CONFIG_SIZE = 100_000;
const FORBIDDEN_CONFIG_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  'securityLevel',
  'secure',
]);
const SHARE_STATE_KEYS = new Set(['code', 'config', 'panZoom']);

export interface ShareableState {
  code: string;
  config?: MermaidConfig;
  panZoom?: {
    x: number;
    y: number;
    zoom: number;
  };
}

export type UrlStateParseResult =
  | { status: 'absent' }
  | { status: 'invalid'; reason: 'malformed' | 'oversized' }
  | { status: 'valid'; state: ShareableState };

type ShareStateValidationResult = Exclude<UrlStateParseResult, { status: 'absent' }>;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const sanitizeConfigValue = (
  value: unknown,
  depth: number = 0
): unknown => {
  if (depth > 8) {
    return undefined;
  }
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .slice(0, 1_000)
      .map((entry) => sanitizeConfigValue(entry, depth + 1))
      .filter((entry) => entry !== undefined);
  }
  if (!isPlainObject(value)) {
    return undefined;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value).slice(0, 1_000)) {
    if (FORBIDDEN_CONFIG_KEYS.has(key)) {
      continue;
    }
    const safeEntry = sanitizeConfigValue(entry, depth + 1);
    if (safeEntry !== undefined) {
      sanitized[key] = safeEntry;
    }
  }
  return sanitized;
};

export const sanitizeImportedConfig = (
  config: unknown
): MermaidConfig | undefined => {
  if (!isPlainObject(config)) {
    return undefined;
  }
  const sanitized = sanitizeConfigValue(config);
  if (!isPlainObject(sanitized)) {
    return undefined;
  }
  return sanitized as MermaidConfig;
};

const validateShareState = (value: unknown): ShareStateValidationResult => {
  if (
    !isPlainObject(value) ||
    Object.keys(value).some((key) => !SHARE_STATE_KEYS.has(key)) ||
    typeof value.code !== 'string'
  ) {
    return { status: 'invalid', reason: 'malformed' };
  }
  if (value.code.length > HARD_DIAGRAM_CEILING.maxTextSize) {
    return { status: 'invalid', reason: 'oversized' };
  }

  const state: ShareableState = { code: value.code };
  if (value.config !== undefined) {
    const config = sanitizeImportedConfig(value.config);
    if (!config) {
      return { status: 'invalid', reason: 'malformed' };
    }
    if (JSON.stringify(config).length > MAX_SHARE_CONFIG_SIZE) {
      return { status: 'invalid', reason: 'oversized' };
    }
    state.config = config;
  }
  if (value.panZoom !== undefined) {
    if (
      !isPlainObject(value.panZoom) ||
      !['x', 'y', 'zoom'].every(
        (key) => typeof value.panZoom?.[key] === 'number' && Number.isFinite(value.panZoom[key])
      ) ||
      Object.keys(value.panZoom).some((key) => !['x', 'y', 'zoom'].includes(key))
    ) {
      return { status: 'invalid', reason: 'malformed' };
    }
    state.panZoom = {
      x: value.panZoom.x as number,
      y: value.panZoom.y as number,
      zoom: Math.min(Math.max(value.panZoom.zoom as number, 0.1), 16),
    };
  }
  return { status: 'valid', state };
};

const normalizeShareState = (value: unknown): ShareableState | null => {
  const result = validateShareState(value);
  return result.status === 'valid' ? result.state : null;
};

/**
 * Compress and encode state to a URL-safe string
 * Uses TextEncoder + btoa for browser compatibility
 */
export const encodeState = (state: ShareableState): string => {
  try {
    const normalized = normalizeShareState(state);
    if (!normalized) {
      return '';
    }
    const json = JSON.stringify(normalized);
    const bytes = new TextEncoder().encode(json);
    
    // Convert to base64
    const binary = Array.from(bytes)
      .map((b) => String.fromCharCode(b))
      .join('');
    const base64 = btoa(binary);
    
    // Make URL-safe
    const encoded = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return encoded.length <= MAX_SHARE_ENCODED_SIZE ? encoded : '';
  } catch (error) {
    console.error('Failed to encode state:', error);
    return '';
  }
};

/**
 * Decode URL-safe string back to state
 */
const decodeStateResult = (encoded: string): ShareStateValidationResult => {
  if (encoded.length > MAX_SHARE_ENCODED_SIZE) {
    return { status: 'invalid', reason: 'oversized' };
  }
  if (!encoded || !/^[A-Za-z\d_-]+$/.test(encoded)) {
    return { status: 'invalid', reason: 'malformed' };
  }

  try {
    // Restore base64 padding
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const json = new TextDecoder().decode(bytes);
    return validateShareState(JSON.parse(json));
  } catch {
    return { status: 'invalid', reason: 'malformed' };
  }
};

export const decodeState = (encoded: string): ShareableState | null => {
  const result = decodeStateResult(encoded);
  return result.status === 'valid' ? result.state : null;
};

/**
 * Generate a shareable URL with the current state
 * Uses URL hash instead of query params to avoid 431 header size errors
 * Hash fragments are never sent to the server
 */
export const generateShareUrl = (state: ShareableState): string => {
  const encoded = encodeState(state);
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  
  if (encoded) {
    url.hash = encoded;
  }
  
  return url.toString();
};

/**
 * Parse state from the current URL
 * Supports both hash (new) and query param (legacy) formats
 */
export const parseUrlStateResult = (): UrlStateParseResult => {
  const url = new URL(window.location.href);
  
  // Try hash first (new format - avoids 431 errors)
  const hashEncoded = url.hash.slice(1); // Remove leading #
  if (hashEncoded) {
    return decodeStateResult(hashEncoded);
  }
  
  // Fall back to query param (legacy format)
  const queryEncoded = url.searchParams.get('code');
  if (queryEncoded) {
    return decodeStateResult(queryEncoded);
  }
  
  return { status: 'absent' };
};

export const parseUrlState = (): ShareableState | null => {
  const result = parseUrlStateResult();
  return result.status === 'valid' ? result.state : null;
};

/**
 * Copy share URL to clipboard
 */
export const copyShareUrl = async (state: ShareableState): Promise<void> => {
  const url = generateShareUrl(state);
  await navigator.clipboard.writeText(url);
};

/**
 * Update URL without triggering navigation
 */
export const updateUrlWithState = (state: ShareableState): void => {
  const url = generateShareUrl(state);
  window.history.replaceState(null, '', url);
};

/**
 * Clear state from URL
 */
export const clearUrlState = (): void => {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  window.history.replaceState(null, '', url.toString());
};
