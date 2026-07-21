import * as mermaidAPI from 'mermaid';
import { DEFAULT_MERMAID_CONFIG } from '@/lib/constants';
import {
  createEffectiveConfig,
  getCommittedConfig,
  normalizeConfigKey,
  setCommittedConfig,
} from '@/lib/mermaid-config';
import {
  extractErrorLocation,
  extractErrorMessage,
  isDependencyError,
} from '@/lib/mermaid-diagnostics';
import {
  assertDiagramWithinLimits,
  withRenderTimeout,
} from '@/lib/render-guard';
import {
  sanitizeMermaidSource,
  sanitizeRenderedSvg,
} from '@/lib/sanitize-source';
import type { MermaidConfig } from '@/types';

export { normalizeConfigKey, setCommittedConfig };
export { extractErrorLocation, extractErrorMessage, isDependencyError };
export { detectContextType as detectDiagramType } from '@/lib/completions';

const mermaid = mermaidAPI.default || mermaidAPI;

let renderChain: Promise<unknown> = Promise.resolve();
let lastAppliedConfigKey: string | null = null;
let renderSequence = 0;

type RenderOptions = {
  isCurrent?: () => boolean;
};

const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
  const result = renderChain.then(task, task);

  // Keep the queue closed for one microtask after publishing a result so the
  // successful preview committer can advance the rollback baseline.
  renderChain = result.then(
    async () => {
      await Promise.resolve();
    },
    async () => {
      await Promise.resolve();
    }
  );

  return result;
};

const applyConfig = (config: MermaidConfig): void => {
  const effectiveConfig = createEffectiveConfig(config);
  mermaid.initialize(effectiveConfig as any);
  lastAppliedConfigKey = normalizeConfigKey(effectiveConfig);
};

const applyConfigIfNeeded = (config: MermaidConfig): void => {
  if (normalizeConfigKey(config) !== lastAppliedConfigKey) {
    applyConfig(config);
  }
};

const restoreCommittedConfig = (): void => {
  applyConfig(getCommittedConfig() || DEFAULT_MERMAID_CONFIG);
};

// Elegant colors for auto-coloring sequence diagram participants
// Hex format for SVG fill attributes
const SEQUENCE_COLORS = [
  '#5E6B80',  // slateBlue
  '#8B9A7C',  // sage
  '#B38274',  // terracotta
  '#A7C4C2',  // dustyBlue
  '#C9A5A5',  // dustyRose
  '#E5C07B',  // golden
  '#7A6F6A',  // warmGray
  '#5E6338',  // olive
];

// Text colors that contrast with each background
// Using pure white for better legibility on medium/dark backgrounds
const SEQUENCE_TEXT_COLORS = [
  '#FFFFFF',  // white on slateBlue (dark)
  '#FFFFFF',  // white on sage (medium) - white has better contrast than dark
  '#FFFFFF',  // white on terracotta (medium-dark)
  '#1a1a1a',  // near-black on dustyBlue (light)
  '#1a1a1a',  // near-black on dustyRose (light)
  '#1a1a1a',  // near-black on golden (light)
  '#FFFFFF',  // white on warmGray (dark)
  '#FFFFFF',  // white on olive (dark)
];

/**
 * Post-processes sequence diagram SVG to auto-color actor rectangles.
 * 
 * This respects user choices - if the code contains box directives,
 * we don't modify the SVG (user has taken control).
 */
export const postProcessSequenceDiagramSvg = (svg: string, code: string): string => {
  const trimmed = code.trim();
  
  // Only process sequence diagrams
  if (!trimmed.toLowerCase().startsWith('sequencediagram')) {
    return svg;
  }
  
  // If user has defined ANY box, respect their choices entirely
  if (/^\s*box\s/m.test(code)) {
    return svg;
  }
  
  // Parse the SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  
  // Mermaid sequence diagrams structure actors in different ways depending on version
  // Try multiple selectors to find actor rectangles
  
  // Method 1: Look for rect elements with class "actor"
  let actorRects = doc.querySelectorAll('rect.actor');
  
  // Method 2: If not found, look for groups with class "actor" containing rects
  if (actorRects.length === 0) {
    const actorGroups = doc.querySelectorAll('g.actor');
    if (actorGroups.length > 0) {
      const rects: Element[] = [];
      actorGroups.forEach(g => {
        const rect = g.querySelector('rect');
        if (rect) rects.push(rect);
      });
      actorRects = rects as unknown as NodeListOf<Element>;
    }
  }
  
  // Method 3: Look for rects that are direct children of actor-related groups
  if (actorRects.length === 0) {
    actorRects = doc.querySelectorAll('[class*="actor"] rect, rect[class*="actor"]');
  }
  
  if (actorRects.length === 0) {
    return svg;
  }
  
  // Track which actor index we're on
  // In sequence diagrams, each actor appears twice (top and bottom boxes)
  const actorColors = new Map<string, number>();
  let colorIndex = 0;
  
  actorRects.forEach((rect) => {
    // Find associated text to identify the actor
    // The text might be a sibling or in a nearby group
    const parent = rect.parentElement;
    let actorName = '';
    
    // Try to find text in same group
    const textEl = parent?.querySelector('text');
    if (textEl) {
      actorName = textEl.textContent?.trim() || '';
    }
    
    // If no text found, use rect's position/id as identifier
    if (!actorName) {
      actorName = rect.getAttribute('x') || String(colorIndex);
    }
    
    // Assign color index based on first appearance of this actor
    if (!actorColors.has(actorName)) {
      actorColors.set(actorName, colorIndex);
      colorIndex++;
    }
    
    const idx = actorColors.get(actorName)! % SEQUENCE_COLORS.length;
    const bgColor = SEQUENCE_COLORS[idx];
    const textColor = SEQUENCE_TEXT_COLORS[idx];
    
    // Apply color using inline style (higher specificity than CSS rules)
    rect.setAttribute('style', `fill: ${bgColor}; stroke: ${bgColor};`);
    
    // Update text color for contrast using inline style
    // Must also style <tspan> elements since CSS rule `text.actor>tspan` overrides text fill
    if (textEl) {
      textEl.setAttribute('style', `${textEl.getAttribute('style') || ''}; fill: ${textColor};`);
      // Also apply to all tspan children
      const tspans = textEl.querySelectorAll('tspan');
      tspans.forEach(tspan => {
        tspan.setAttribute('style', `fill: ${textColor};`);
      });
    }
  });
  
  // Serialize back to string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
};

export const initializeMermaid = (config: MermaidConfig = {}) => {
  applyConfig(config);
};

export const renderMermaid = async (
  code: string,
  elementId: string,
  config: MermaidConfig = DEFAULT_MERMAID_CONFIG,
  options?: RenderOptions
): Promise<{ svg: string }> => {
  const effectiveConfig = createEffectiveConfig(config);
  const sanitizedCode = sanitizeMermaidSource(code);
  assertDiagramWithinLimits(sanitizedCode, effectiveConfig);

  return enqueue(async () => {
    const supportsRenderContainer = mermaid.render.length >= 3;
    const renderId = supportsRenderContainer
      ? `${elementId}-${++renderSequence}`
      : elementId;
    const container = document.createElement('div');
    container.dataset.mermaidRenderContainer = renderId;
    Object.assign(container.style, {
      position: 'absolute',
      left: '-99999px',
      top: '0',
      visibility: 'hidden',
    });

    let renderError: unknown;
    let rollbackError: unknown;
    let result: { svg: string } | undefined;
    let shouldRestoreConfig = true;

    document.body.appendChild(container);

    try {
      applyConfigIfNeeded(effectiveConfig);
      const renderOperation = supportsRenderContainer
        ? mermaid.render(renderId, sanitizedCode, container)
        : mermaid.render(renderId, sanitizedCode);
      const { svg } = await withRenderTimeout(renderOperation);
      const processedSvg = sanitizeRenderedSvg(
        postProcessSequenceDiagramSvg(svg, sanitizedCode)
      );
      shouldRestoreConfig = options?.isCurrent ? !options.isCurrent() : false;
      result = { svg: processedSvg };
    } catch (error) {
      renderError = error;
    } finally {
      container.remove();
      document.getElementById(`d${renderId}`)?.remove();
      document.getElementById(renderId)?.remove();
      document.getElementById(`i${renderId}`)?.remove();
    }

    if (shouldRestoreConfig) {
      try {
        restoreCommittedConfig();
      } catch (error) {
        rollbackError = error;
      }
    }

    if (renderError !== undefined) {
      if (rollbackError !== undefined) {
        console.error('Failed to restore Mermaid configuration after render failure', rollbackError);
      }
      throw renderError;
    }
    if (rollbackError !== undefined) {
      throw rollbackError;
    }
    if (!result) {
      throw new Error('Mermaid render completed without SVG output');
    }

    return result;
  });
};

export const validateMermaidSyntax = async (code: string): Promise<boolean> => {
  try {
    await mermaid.parse(code);
    return true;
  } catch {
    return false;
  }
};
