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
  | 'c4';

export type ExportFormat = 'svg' | 'png' | 'markdown';

export interface MermaidConfig {
  theme?: 'default' | 'forest' | 'dark' | 'neutral' | 'base';
  themeVariables?: Record<string, string>;
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
