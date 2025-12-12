import { Editor, OnMount } from '@monaco-editor/react';
import { EditorSettings } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
}

// Mermaid language definition with comprehensive syntax highlighting
const mermaidLanguageDefinition = {
  defaultToken: '',
  ignoreCase: true,

  // Diagram type keywords
  diagramTypes: [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
    'stateDiagram-v2', 'erDiagram', 'gantt', 'pie', 'journey', 'gitGraph',
    'mindmap', 'timeline', 'quadrantChart', 'requirementDiagram', 'C4Context',
    'C4Container', 'C4Component', 'C4Dynamic', 'C4Deployment', 'sankey-beta',
    'xychart-beta', 'block-beta', 'packet-beta', 'kanban', 'architecture-beta',
  ],

  // Block/structure keywords
  blockKeywords: [
    'subgraph', 'end', 'loop', 'alt', 'else', 'opt', 'par', 'and', 'break',
    'critical', 'rect', 'box', 'section', 'autonumber', 'title', 'accTitle',
    'accDescr', 'direction', 'class', 'callback', 'click', 'style', 'linkStyle',
  ],

  // Sequence diagram specific
  sequenceKeywords: [
    'participant', 'actor', 'activate', 'deactivate', 'Note', 'note',
    'over', 'left', 'right', 'of', 'links', 'link', 'destroy', 'create',
  ],

  // Flowchart direction keywords
  directions: ['TD', 'TB', 'BT', 'RL', 'LR'],

  // Class diagram keywords
  classKeywords: [
    'class', 'interface', 'annotation', 'namespace',
  ],

  // Gantt keywords  
  ganttKeywords: [
    'dateFormat', 'axisFormat', 'excludes', 'includes', 'todayMarker',
    'done', 'active', 'crit', 'after', 'milestone',
  ],

  // Git graph keywords
  gitKeywords: [
    'commit', 'branch', 'checkout', 'merge', 'cherry-pick', 'tag',
  ],

  // ER diagram keywords
  erKeywords: [
    'string', 'int', 'float', 'boolean', 'date', 'datetime', 'enum', 'PK', 'FK', 'UK',
  ],

  // State diagram keywords
  stateKeywords: [
    'state', 'fork', 'join', 'choice', 'note',
  ],

  // C4 diagram keywords
  c4Keywords: [
    'Person', 'Person_Ext', 'System', 'System_Ext', 'SystemDb', 'SystemDb_Ext',
    'SystemQueue', 'SystemQueue_Ext', 'Container', 'Container_Ext', 'ContainerDb',
    'ContainerDb_Ext', 'ContainerQueue', 'ContainerQueue_Ext', 'Component',
    'Component_Ext', 'ComponentDb', 'ComponentDb_Ext', 'ComponentQueue',
    'ComponentQueue_Ext', 'Boundary', 'Enterprise_Boundary', 'System_Boundary',
    'Container_Boundary', 'Deployment_Node', 'Node', 'Node_L', 'Node_R',
    'Rel', 'Rel_U', 'Rel_D', 'Rel_L', 'Rel_R', 'Rel_Back', 'BiRel', 'BiRel_U',
    'BiRel_D', 'BiRel_L', 'BiRel_R', 'UpdateElementStyle', 'UpdateRelStyle',
    'UpdateLayoutConfig',
  ],

  // Requirement diagram keywords  
  requirementKeywords: [
    'requirement', 'functionalRequirement', 'interfaceRequirement',
    'performanceRequirement', 'physicalRequirement', 'designConstraint',
    'element', 'satisfies', 'traces', 'contains', 'derives', 'refines',
    'copies', 'verifies',
  ],

  // Architecture diagram keywords
  architectureKeywords: [
    'service', 'group', 'junction', 'database', 'disk', 'server', 'cloud',
    'internet', 'in', 'out', 'L', 'R', 'T', 'B',
  ],

  tokenizer: {
    root: [
      // Comments - highest priority
      [/%%.*$/, 'comment'],
      
      // Diagram type declarations at start of line
      [/^[ \t]*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|quadrantChart|requirementDiagram|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|sankey-beta|xychart-beta|block-beta|packet-beta|kanban|architecture-beta)\b/, 'keyword.diagram'],
      
      // Sequence diagram arrows with messages
      [/(->>|-->>|->|-->|-x|--x|-\)|--\))/, 'operator.arrow'],
      
      // Sequence diagram keywords (before general identifiers)
      [/\b(participant|actor)\b/, 'keyword.sequence'],
      [/\b(activate|deactivate|destroy|create)\b/, 'keyword.sequence'],
      [/\b(Note|note)\s+(left|right|over)\b/, 'keyword.sequence'],
      [/\b(loop|alt|else|opt|par|and|break|critical|rect|box|autonumber)\b/, 'keyword.block'],
      [/\bend\b/, 'keyword.block'],
      
      // Block keywords
      [/\b(subgraph|section)\b/, 'keyword.block'],
      [/\b(title|accTitle|accDescr)\b/, 'keyword.meta'],
      
      // Direction keywords
      [/\b(TD|TB|BT|RL|LR)\b/, 'keyword.direction'],
      
      // Class diagram
      [/\b(class|interface|annotation|namespace)\b/, 'keyword.class'],
      [/(\+|-|#|~)/, 'operator.visibility'],
      [/(\<\<|\>\>)/, 'annotation'],
      
      // Gantt
      [/\b(dateFormat|axisFormat|excludes|includes|todayMarker)\b/, 'keyword.gantt'],
      [/\b(done|active|crit|after|milestone)\b/, 'keyword.gantt.status'],
      
      // Git
      [/\b(commit|branch|checkout|merge|cherry-pick|tag)\b/, 'keyword.git'],
      
      // ER diagram
      [/\b(string|int|float|boolean|date|datetime|enum)\b/, 'type.primitive'],
      [/\b(PK|FK|UK)\b/, 'keyword.er'],
      [/(\|\|--o\{|\}\|--\|\||\|\|--\|\||\}o--o\{|\|\|\.\.o\{)/, 'operator.er'],
      
      // State diagram  
      [/\b(state|fork|join|choice)\b/, 'keyword.state'],
      [/\[\*\]/, 'keyword.state.terminal'],
      
      // C4 diagram
      [/\b(Person|Person_Ext|System|System_Ext|SystemDb|SystemDb_Ext|SystemQueue|SystemQueue_Ext|Container|Container_Ext|ContainerDb|ContainerDb_Ext|ContainerQueue|ContainerQueue_Ext|Component|Component_Ext|ComponentDb|ComponentDb_Ext|ComponentQueue|ComponentQueue_Ext)\b/, 'keyword.c4.element'],
      [/\b(Boundary|Enterprise_Boundary|System_Boundary|Container_Boundary|Deployment_Node|Node|Node_L|Node_R)\b/, 'keyword.c4.boundary'],
      [/\b(Rel|Rel_U|Rel_D|Rel_L|Rel_R|Rel_Back|BiRel|BiRel_U|BiRel_D|BiRel_L|BiRel_R)\b/, 'keyword.c4.rel'],
      
      // Requirement diagram
      [/\b(requirement|functionalRequirement|interfaceRequirement|performanceRequirement|physicalRequirement|designConstraint|element)\b/, 'keyword.requirement'],
      [/\b(satisfies|traces|contains|derives|refines|copies|verifies)\b/, 'keyword.requirement.rel'],
      
      // Architecture diagram
      [/\b(service|group|junction)\b/, 'keyword.architecture'],
      [/\b(database|disk|server|cloud|internet)\b/, 'keyword.architecture.icon'],
      
      // Styling keywords
      [/\b(style|linkStyle|classDef|class)\b/, 'keyword.style'],
      [/\b(fill|stroke|stroke-width|color|font-size|font-weight)\b/, 'attribute'],
      
      // Color values
      [/#[0-9a-fA-F]{3,8}\b/, 'constant.color'],
      [/\brgb\s*\([^)]+\)/, 'constant.color'],
      [/\brgba\s*\([^)]+\)/, 'constant.color'],
      [/\bhsl\s*\([^)]+\)/, 'constant.color'],
      
      // Strings in quotes
      [/"[^"]*"/, 'string'],
      [/'[^']*'/, 'string'],
      
      // Node shapes with text - capture the whole thing
      [/\[\[[^\]]*\]\]/, 'node.subroutine'],   // [[subroutine]]
      [/\[\([^\)]*\)\]/, 'node.cylinder'],      // [(cylinder)]
      [/\[\{[^\}]*\}\]/, 'node.trapezoid'],     // [{trapezoid}]
      [/\(\[[^\]]*\]\)/, 'node.stadium'],       // ([stadium])
      [/\(\([^\)]*\)\)/, 'node.circle'],        // ((circle))
      [/\{\{[^\}]*\}\}/, 'node.hexagon'],       // {{hexagon}}
      [/\{[^\}]*\}/, 'node.rhombus'],           // {rhombus/decision}
      [/\[[^\]]*\]/, 'node.rect'],              // [rectangle]
      [/\([^\)]*\)/, 'node.rounded'],           // (rounded)
      [/>[^\]]*\]/, 'node.asymmetric'],         // >asymmetric]
      
      // Flowchart arrows and links
      [/(-->|---|-\.-|==>|==|~~~|-.->|-\.-)/, 'operator.arrow'],
      [/--[^-]/, 'operator.arrow'],
      
      // Link labels |text|
      [/\|[^|]*\|/, 'string.link-label'],
      
      // Numbers
      [/\b\d+(\.\d+)?\b/, 'number'],
      
      // Dates (for Gantt)
      [/\b\d{4}-\d{2}-\d{2}\b/, 'number.date'],
      
      // Identifiers (actors, nodes, etc.) - generic catch-all
      [/[A-Za-z_][A-Za-z0-9_]*/, 'identifier'],
      
      // Punctuation
      [/[{}()\[\]]/, 'delimiter.bracket'],
      [/[;,:]/, 'delimiter'],
      [/&|@/, 'operator'],
    ],
  },
};

// Custom theme for mermaid with colors similar to MermaidChart
const defineMermaidTheme = (monaco: any) => {
  monaco.editor.defineTheme('mermaid-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // Diagram type - magenta/pink like MermaidChart
      { token: 'keyword.diagram', foreground: 'C586C0', fontStyle: 'bold' },
      
      // Block keywords - magenta/pink
      { token: 'keyword.block', foreground: 'C586C0' },
      { token: 'keyword.meta', foreground: 'C586C0' },
      
      // Sequence keywords - magenta/pink
      { token: 'keyword.sequence', foreground: 'C586C0' },
      
      // Direction keywords - cyan
      { token: 'keyword.direction', foreground: '4EC9B0' },
      
      // Arrows - cyan/teal
      { token: 'operator.arrow', foreground: '4EC9B0' },
      { token: 'operator', foreground: '4EC9B0' },
      
      // Identifiers (actors, nodes) - golden/yellow like MermaidChart
      { token: 'identifier', foreground: 'DCDCAA' },
      
      // Node shapes - light blue
      { token: 'node.rect', foreground: '9CDCFE' },
      { token: 'node.rounded', foreground: '9CDCFE' },
      { token: 'node.circle', foreground: '9CDCFE' },
      { token: 'node.rhombus', foreground: '9CDCFE' },
      { token: 'node.stadium', foreground: '9CDCFE' },
      { token: 'node.subroutine', foreground: '9CDCFE' },
      { token: 'node.cylinder', foreground: '9CDCFE' },
      { token: 'node.trapezoid', foreground: '9CDCFE' },
      { token: 'node.hexagon', foreground: '9CDCFE' },
      { token: 'node.asymmetric', foreground: '9CDCFE' },
      
      // Strings - orange
      { token: 'string', foreground: 'CE9178' },
      { token: 'string.link-label', foreground: 'CE9178' },
      
      // Comments - green
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      
      // Numbers and dates - light green
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'number.date', foreground: 'B5CEA8' },
      
      // Colors - show in their actual color would be nice, but let's use a distinct color
      { token: 'constant.color', foreground: 'CE9178' },
      
      // Types
      { token: 'type.primitive', foreground: '4EC9B0' },
      
      // Class diagram
      { token: 'keyword.class', foreground: 'C586C0' },
      { token: 'operator.visibility', foreground: '4EC9B0' },
      { token: 'annotation', foreground: '4EC9B0', fontStyle: 'italic' },
      
      // Gantt
      { token: 'keyword.gantt', foreground: 'C586C0' },
      { token: 'keyword.gantt.status', foreground: '4EC9B0' },
      
      // Git
      { token: 'keyword.git', foreground: 'C586C0' },
      
      // ER
      { token: 'keyword.er', foreground: 'C586C0' },
      { token: 'operator.er', foreground: '4EC9B0' },
      
      // State
      { token: 'keyword.state', foreground: 'C586C0' },
      { token: 'keyword.state.terminal', foreground: 'C586C0', fontStyle: 'bold' },
      
      // C4
      { token: 'keyword.c4.element', foreground: 'C586C0' },
      { token: 'keyword.c4.boundary', foreground: 'C586C0' },
      { token: 'keyword.c4.rel', foreground: '4EC9B0' },
      
      // Requirement
      { token: 'keyword.requirement', foreground: 'C586C0' },
      { token: 'keyword.requirement.rel', foreground: '4EC9B0' },
      
      // Architecture
      { token: 'keyword.architecture', foreground: 'C586C0' },
      { token: 'keyword.architecture.icon', foreground: '9CDCFE' },
      
      // Styling
      { token: 'keyword.style', foreground: 'C586C0' },
      { token: 'attribute', foreground: '9CDCFE' },
      
      // Delimiters
      { token: 'delimiter.bracket', foreground: 'D4D4D4' },
      { token: 'delimiter', foreground: 'D4D4D4' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
    },
  });

  monaco.editor.defineTheme('mermaid-light', {
    base: 'vs',
    inherit: true,
    rules: [
      // Diagram type - magenta/pink
      { token: 'keyword.diagram', foreground: 'AF00DB', fontStyle: 'bold' },
      
      // Block keywords - magenta/pink
      { token: 'keyword.block', foreground: 'AF00DB' },
      { token: 'keyword.meta', foreground: 'AF00DB' },
      
      // Sequence keywords - magenta/pink  
      { token: 'keyword.sequence', foreground: 'AF00DB' },
      
      // Direction keywords - teal
      { token: 'keyword.direction', foreground: '008080' },
      
      // Arrows - teal
      { token: 'operator.arrow', foreground: '008080' },
      { token: 'operator', foreground: '008080' },
      
      // Identifiers (actors, nodes) - dark goldenrod
      { token: 'identifier', foreground: '795E26' },
      
      // Node shapes - navy blue
      { token: 'node.rect', foreground: '001080' },
      { token: 'node.rounded', foreground: '001080' },
      { token: 'node.circle', foreground: '001080' },
      { token: 'node.rhombus', foreground: '001080' },
      { token: 'node.stadium', foreground: '001080' },
      { token: 'node.subroutine', foreground: '001080' },
      { token: 'node.cylinder', foreground: '001080' },
      { token: 'node.trapezoid', foreground: '001080' },
      { token: 'node.hexagon', foreground: '001080' },
      { token: 'node.asymmetric', foreground: '001080' },
      
      // Strings - brown/rust
      { token: 'string', foreground: 'A31515' },
      { token: 'string.link-label', foreground: 'A31515' },
      
      // Comments - green
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      
      // Numbers - dark green
      { token: 'number', foreground: '098658' },
      { token: 'number.date', foreground: '098658' },
      
      // Colors
      { token: 'constant.color', foreground: 'A31515' },
      
      // Types
      { token: 'type.primitive', foreground: '008080' },
      
      // Class diagram
      { token: 'keyword.class', foreground: 'AF00DB' },
      { token: 'operator.visibility', foreground: '008080' },
      { token: 'annotation', foreground: '008080', fontStyle: 'italic' },
      
      // Gantt
      { token: 'keyword.gantt', foreground: 'AF00DB' },
      { token: 'keyword.gantt.status', foreground: '008080' },
      
      // Git
      { token: 'keyword.git', foreground: 'AF00DB' },
      
      // ER
      { token: 'keyword.er', foreground: 'AF00DB' },
      { token: 'operator.er', foreground: '008080' },
      
      // State
      { token: 'keyword.state', foreground: 'AF00DB' },
      { token: 'keyword.state.terminal', foreground: 'AF00DB', fontStyle: 'bold' },
      
      // C4
      { token: 'keyword.c4.element', foreground: 'AF00DB' },
      { token: 'keyword.c4.boundary', foreground: 'AF00DB' },
      { token: 'keyword.c4.rel', foreground: '008080' },
      
      // Requirement
      { token: 'keyword.requirement', foreground: 'AF00DB' },
      { token: 'keyword.requirement.rel', foreground: '008080' },
      
      // Architecture
      { token: 'keyword.architecture', foreground: 'AF00DB' },
      { token: 'keyword.architecture.icon', foreground: '001080' },
      
      // Styling
      { token: 'keyword.style', foreground: 'AF00DB' },
      { token: 'attribute', foreground: '001080' },
      
      // Delimiters  
      { token: 'delimiter.bracket', foreground: '000000' },
      { token: 'delimiter', foreground: '000000' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
    },
  });
};

export const CodeEditor = ({ value, onChange, settings }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Map editor settings theme to our custom mermaid themes
  const editorTheme = settings.theme === 'vs-dark' ? 'mermaid-dark' : 'mermaid-light';

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    try {
      // Register mermaid language
      monaco.languages.register({ id: 'mermaid' });
      
      // Set up comprehensive tokenizer
      monaco.languages.setMonarchTokensProvider('mermaid', mermaidLanguageDefinition);
      
      // Define custom themes
      defineMermaidTheme(monaco);
      
      // Apply the theme after defining it
      monaco.editor.setTheme(settings.theme === 'vs-dark' ? 'mermaid-dark' : 'mermaid-light');
    } catch (error) {
      console.warn('Monaco language registration skipped:', error);
    }

    setIsEditorReady(true);
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      editorRef.current.updateOptions({
        fontSize: settings.fontSize,
        wordWrap: settings.wordWrap,
        minimap: { enabled: settings.minimap },
      });
    }
  }, [settings, isEditorReady]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language="mermaid"
        theme={editorTheme}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="h-full w-full bg-[var(--editor-bg)] p-4">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-6 w-5/6 mb-4" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        }
        options={{
          fontSize: settings.fontSize,
          wordWrap: settings.wordWrap,
          minimap: { enabled: settings.minimap },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};
