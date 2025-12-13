/**
 * Visual Editor Service Initialization
 * 
 * This file registers all parsers and generators with the MermaidASTService.
 * Import this early in the app lifecycle to ensure services are ready.
 */

import { astService } from './MermaidASTService';
import { FlowchartParser } from './parsers/FlowchartParser';
import { FlowchartGenerator } from './generators/FlowchartGenerator';

/**
 * Initialize visual editor services
 * Registers all parsers and generators
 */
export function initializeVisualEditorServices(): void {
  // Register Flowchart parser and generator
  const flowchartParser = new FlowchartParser();
  const flowchartGenerator = new FlowchartGenerator();
  
  astService.registerParser(['flowchart'], flowchartParser);
  astService.registerGenerator(['flowchart'], flowchartGenerator);

  // TODO: Register parsers/generators for other diagram types (Phase 2+)
  
  console.log('[Visual Editor] Services initialized');
  console.log('[Visual Editor] Supported diagrams:', astService.getSupportedDiagramTypes());
}
