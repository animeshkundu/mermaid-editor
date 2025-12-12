import * as mermaidAPI from 'mermaid';
import { MermaidConfig } from '@/types';
import { MUTED_PALETTE } from './constants';

const mermaid = mermaidAPI.default || mermaidAPI;

let isInitialized = false;

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
const SEQUENCE_TEXT_COLORS = [
  '#FFFFFF',  // white on slateBlue
  '#2D2A26',  // dark on sage
  '#FFFFFF',  // white on terracotta
  '#2D2A26',  // dark on dustyBlue
  '#2D2A26',  // dark on dustyRose
  '#2D2A26',  // dark on golden
  '#FFFFFF',  // white on warmGray
  '#FFFFFF',  // white on olive
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
    // Debug: log what we have
    console.log('No actor rects found. SVG structure:', doc.documentElement.innerHTML.substring(0, 500));
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
    if (textEl) {
      textEl.setAttribute('style', `${textEl.getAttribute('style') || ''}; fill: ${textColor};`);
    }
  });
  
  // Serialize back to string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
};

export const initializeMermaid = (config: MermaidConfig = {}) => {
  mermaid.initialize({
    startOnLoad: false,
    theme: config.theme || 'base',
    look: config.look || 'classic',
    fontFamily: config.fontFamily || '"Inter", "Segoe UI", sans-serif',
    themeVariables: config.themeVariables || {},
    ...config,
  } as any);
  isInitialized = true;
};

export const renderMermaid = async (
  code: string,
  elementId: string,
  config?: MermaidConfig
): Promise<{ svg: string }> => {
  if (!isInitialized || config) {
    initializeMermaid(config);
  }

  try {
    const { svg } = await mermaid.render(elementId, code);
    // Post-process to auto-color sequence diagram actors
    const processedSvg = postProcessSequenceDiagramSvg(svg, code);
    return { svg: processedSvg };
  } catch (error) {
    throw error;
  }
};

export const validateMermaidSyntax = async (code: string): Promise<boolean> => {
  try {
    await mermaid.parse(code);
    return true;
  } catch (error) {
    return false;
  }
};

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};
