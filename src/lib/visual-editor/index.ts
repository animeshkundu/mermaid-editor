/**
 * Visual Editor Service Initialization
 * 
 * This file registers all parsers and generators with the MermaidASTService.
 * Import this early in the app lifecycle to ensure services are ready.
 */

import { astService } from './MermaidASTService';
import { FlowchartParser } from './parsers/FlowchartParser';

/**
 * Initialize visual editor services
 * Registers all parsers and generators
 */
export function initializeVisualEditorServices(): void {
  // Register Flowchart parser
  const flowchartParser = new FlowchartParser();
  astService.registerParser(['flowchart'], flowchartParser);

  // TODO: Register FlowchartGenerator when implemented
  // TODO: Register parsers/generators for other diagram types (Phase 2+)
  
  console.log('[Visual Editor] Services initialized');
  console.log('[Visual Editor] Supported diagrams:', astService.getSupportedDiagramTypes());
}
