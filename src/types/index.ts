export type DiagramType = 
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'state'
  | 'er'
  | 'gantt'
  | 'pie'
  | 'journey'
  | 'gitGraph'
  | 'mindmap'
  | 'timeline'
  | 'quadrant'
  | 'requirement'
  | 'c4'
  | 'sankey'
  | 'xychart'
  | 'block'
  | 'packet'
  | 'kanban'
  | 'architecture';

export type ExportFormat = 'svg' | 'png' | 'markdown';

export type PNGScale = 1 | 2 | 3 | 4;

export const PNG_SCALE_OPTIONS: { value: PNGScale; label: string }[] = [
  { value: 1, label: '1x (Normal)' },
  { value: 2, label: '2x (High)' },
  { value: 3, label: '3x (Very High)' },
  { value: 4, label: '4x (Ultra)' },
];

export type MermaidTheme = 'default' | 'forest' | 'dark' | 'neutral' | 'base';

export const MERMAID_THEMES: { value: MermaidTheme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'forest', label: 'Forest' },
  { value: 'dark', label: 'Dark' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'base', label: 'Base' },
];

export type MermaidLook = 'classic' | 'handDrawn';

export const MERMAID_LOOKS: { value: MermaidLook; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'handDrawn', label: 'Hand Drawn' },
];

export interface MermaidConfig {
  theme?: MermaidTheme;
  look?: MermaidLook;
  themeVariables?: Record<string, string>;
  fontFamily?: string;
  flowchart?: {
    curve?: string;
    padding?: number;
  };
  sequence?: {
    actorMargin?: number;
    width?: number;
    height?: number;
  };
  gantt?: {
    titleTopMargin?: number;
    barHeight?: number;
  };
  [key: string]: unknown;
}

export interface EditorSettings {
  theme: 'vs-dark' | 'vs-light';
  fontSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
}

export interface AppState {
  code: string;
  config: MermaidConfig;
  editorSettings: EditorSettings;
  panelSizes: number[];
}

export interface DiagramExample {
  id: string;
  name: string;
  type: DiagramType;
  code: string;
  description: string;
}
