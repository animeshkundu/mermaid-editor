/**
 * URL Sharing utilities for encoding/decoding mermaid diagrams
 * Mermaid.live uses pako (zlib) compression + base64 encoding
 * We'll use a simpler approach with built-in browser APIs
 */

import { MermaidConfig } from '@/types';

export interface ShareableState {
  code: string;
  config?: MermaidConfig;
  panZoom?: {
    x: number;
    y: number;
    zoom: number;
  };
}

/**
 * Compress and encode state to a URL-safe string
 * Uses TextEncoder + btoa for browser compatibility
 */
export const encodeState = (state: ShareableState): string => {
  try {
    const json = JSON.stringify(state);
    const bytes = new TextEncoder().encode(json);
    
    // Convert to base64
    const binary = Array.from(bytes)
      .map((b) => String.fromCharCode(b))
      .join('');
    const base64 = btoa(binary);
    
    // Make URL-safe
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (error) {
    console.error('Failed to encode state:', error);
    return '';
  }
};

/**
 * Decode URL-safe string back to state
 */
export const decodeState = (encoded: string): ShareableState | null => {
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
    return JSON.parse(json) as ShareableState;
  } catch (error) {
    console.error('Failed to decode state:', error);
    return null;
  }
};

/**
 * Generate a shareable URL with the current state
 */
export const generateShareUrl = (state: ShareableState): string => {
  const encoded = encodeState(state);
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  
  if (encoded) {
    url.searchParams.set('code', encoded);
  }
  
  return url.toString();
};

/**
 * Parse state from the current URL
 */
export const parseUrlState = (): ShareableState | null => {
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get('code');
  
  if (!encoded) {
    return null;
  }
  
  return decodeState(encoded);
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
