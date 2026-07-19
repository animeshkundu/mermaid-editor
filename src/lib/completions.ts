import { DIAGRAM_EXAMPLES } from '@/lib/constants';
import type { DiagramType } from '@/types';

export const DIAGRAM_TYPES: readonly DiagramType[] = [
  'flowchart',
  'sequence',
  'class',
  'state',
  'er',
  'gantt',
  'pie',
  'journey',
  'gitGraph',
  'mindmap',
  'timeline',
  'quadrant',
  'requirement',
  'c4',
  'sankey',
  'xychart',
  'block',
  'packet',
  'kanban',
  'architecture',
];

export const MERMAID_LANGUAGE_KEYWORDS = {
  diagramTypes: [
    'graph',
    'flowchart',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'stateDiagram-v2',
    'erDiagram',
    'gantt',
    'pie',
    'journey',
    'gitGraph',
    'mindmap',
    'timeline',
    'quadrantChart',
    'requirementDiagram',
    'C4Context',
    'C4Container',
    'C4Component',
    'C4Dynamic',
    'C4Deployment',
    'sankey-beta',
    'xychart-beta',
    'block-beta',
    'packet-beta',
    'kanban',
    'architecture-beta',
  ],
  blockKeywords: [
    'subgraph',
    'end',
    'loop',
    'alt',
    'else',
    'opt',
    'par',
    'and',
    'break',
    'critical',
    'rect',
    'box',
    'section',
    'autonumber',
    'title',
    'accTitle',
    'accDescr',
    'direction',
    'class',
    'callback',
    'click',
    'style',
    'linkStyle',
  ],
  sequenceKeywords: [
    'participant',
    'actor',
    'activate',
    'deactivate',
    'Note',
    'note',
    'over',
    'left',
    'right',
    'of',
    'links',
    'link',
    'destroy',
    'create',
  ],
  directions: ['TD', 'TB', 'BT', 'RL', 'LR'],
  classKeywords: ['class', 'interface', 'annotation', 'namespace'],
  ganttKeywords: [
    'dateFormat',
    'axisFormat',
    'excludes',
    'includes',
    'todayMarker',
    'done',
    'active',
    'crit',
    'after',
    'milestone',
  ],
  gitKeywords: ['commit', 'branch', 'checkout', 'merge', 'cherry-pick', 'tag'],
  erKeywords: [
    'string',
    'int',
    'float',
    'boolean',
    'date',
    'datetime',
    'enum',
    'PK',
    'FK',
    'UK',
  ],
  stateKeywords: ['state', 'fork', 'join', 'choice', 'note'],
  c4Keywords: [
    'Person',
    'Person_Ext',
    'System',
    'System_Ext',
    'SystemDb',
    'SystemDb_Ext',
    'SystemQueue',
    'SystemQueue_Ext',
    'Container',
    'Container_Ext',
    'ContainerDb',
    'ContainerDb_Ext',
    'ContainerQueue',
    'ContainerQueue_Ext',
    'Component',
    'Component_Ext',
    'ComponentDb',
    'ComponentDb_Ext',
    'ComponentQueue',
    'ComponentQueue_Ext',
    'Boundary',
    'Enterprise_Boundary',
    'System_Boundary',
    'Container_Boundary',
    'Deployment_Node',
    'Node',
    'Node_L',
    'Node_R',
    'Rel',
    'Rel_U',
    'Rel_D',
    'Rel_L',
    'Rel_R',
    'Rel_Back',
    'BiRel',
    'BiRel_U',
    'BiRel_D',
    'BiRel_L',
    'BiRel_R',
    'UpdateElementStyle',
    'UpdateRelStyle',
    'UpdateLayoutConfig',
  ],
  requirementKeywords: [
    'requirement',
    'functionalRequirement',
    'interfaceRequirement',
    'performanceRequirement',
    'physicalRequirement',
    'designConstraint',
    'element',
    'satisfies',
    'traces',
    'contains',
    'derives',
    'refines',
    'copies',
    'verifies',
  ],
  architectureKeywords: [
    'service',
    'group',
    'junction',
    'database',
    'disk',
    'server',
    'cloud',
    'internet',
    'in',
    'out',
    'L',
    'R',
    'T',
    'B',
  ],
  nodeShapes: ['[text]', '(text)', '{text}', '[[text]]', '[(text)]', '((text))', '{{text}}'],
  arrows: ['-->', '---', '-.->', '==>', '->>', '-->>', '-x', '--x'],
} as const;

const starterFor = (type: DiagramType): string => {
  const example = DIAGRAM_EXAMPLES.find((candidate) => candidate.type === type);
  if (!example) {
    throw new Error(`Missing starter example for diagram type: ${type}`);
  }
  return example.code;
};

export const STARTER_SNIPPETS: Record<DiagramType, string> = {
  flowchart: starterFor('flowchart'),
  sequence: starterFor('sequence'),
  class: starterFor('class'),
  state: starterFor('state'),
  er: starterFor('er'),
  gantt: starterFor('gantt'),
  pie: starterFor('pie'),
  journey: starterFor('journey'),
  gitGraph: starterFor('gitGraph'),
  mindmap: starterFor('mindmap'),
  timeline: starterFor('timeline'),
  quadrant: starterFor('quadrant'),
  requirement: starterFor('requirement'),
  c4: starterFor('c4'),
  sankey: starterFor('sankey'),
  xychart: starterFor('xychart'),
  block: starterFor('block'),
  packet: starterFor('packet'),
  kanban: starterFor('kanban'),
  architecture: starterFor('architecture'),
};

const DIAGRAM_TYPE_PATTERNS: ReadonlyArray<[RegExp, DiagramType]> = [
  [/^(?:graph|flowchart)\b/i, 'flowchart'],
  [/^sequenceDiagram\b/i, 'sequence'],
  [/^classDiagram\b/i, 'class'],
  [/^stateDiagram(?:-v2)?\b/i, 'state'],
  [/^erDiagram\b/i, 'er'],
  [/^gantt\b/i, 'gantt'],
  [/^pie\b/i, 'pie'],
  [/^journey\b/i, 'journey'],
  [/^gitGraph\b/i, 'gitGraph'],
  [/^mindmap\b/i, 'mindmap'],
  [/^timeline\b/i, 'timeline'],
  [/^quadrantChart\b/i, 'quadrant'],
  [/^requirementDiagram\b/i, 'requirement'],
  [/^C4(?:Context|Container|Component|Dynamic|Deployment)\b/i, 'c4'],
  [/^sankey-beta\b/i, 'sankey'],
  [/^xychart-beta\b/i, 'xychart'],
  [/^block-beta\b/i, 'block'],
  [/^packet-beta\b/i, 'packet'],
  [/^kanban\b/i, 'kanban'],
  [/^architecture-beta\b/i, 'architecture'],
];

const firstDiagramLine = (code: string): string | null => {
  const lines = code.split(/\r?\n/);
  let inFrontmatter = false;
  let frontmatterSeen = false;
  let inDirective = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!frontmatterSeen && line === '---') {
      frontmatterSeen = true;
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter) {
      if (line === '---') {
        inFrontmatter = false;
      }
      continue;
    }
    if (inDirective) {
      if (line.includes('}%%')) {
        inDirective = false;
      }
      continue;
    }
    if (line.startsWith('%%{')) {
      inDirective = !line.includes('}%%');
      continue;
    }
    if (!line || line.startsWith('%%')) {
      continue;
    }

    return line;
  }

  return null;
};

export const detectContextType = (code: string): DiagramType | null => {
  const firstLine = firstDiagramLine(code);
  if (!firstLine) {
    return null;
  }

  return DIAGRAM_TYPE_PATTERNS.find(([pattern]) => pattern.test(firstLine))?.[1] || null;
};

const shared = MERMAID_LANGUAGE_KEYWORDS;
const CONTEXT_KEYWORDS: Record<DiagramType, readonly string[]> = {
  flowchart: [
    'flowchart',
    'graph',
    ...shared.directions,
    ...shared.blockKeywords,
    ...shared.nodeShapes,
    ...shared.arrows,
  ],
  sequence: [
    'sequenceDiagram',
    ...shared.sequenceKeywords,
    ...shared.blockKeywords,
    ...shared.arrows,
  ],
  class: ['classDiagram', ...shared.classKeywords, ...shared.blockKeywords, '<|--', '*--', 'o--'],
  state: ['stateDiagram-v2', ...shared.stateKeywords, 'direction', '[*]', '-->'],
  er: ['erDiagram', ...shared.erKeywords, '||--o{', '}|..|{', 'identifying', 'non-identifying'],
  gantt: ['gantt', 'title', 'section', ...shared.ganttKeywords],
  pie: ['pie', 'title', 'showData'],
  journey: ['journey', 'title', 'section'],
  gitGraph: ['gitGraph', ...shared.gitKeywords],
  mindmap: ['mindmap', 'root', 'icon', 'class'],
  timeline: ['timeline', 'title', 'section', 'period'],
  quadrant: [
    'quadrantChart',
    'title',
    'x-axis',
    'y-axis',
    'quadrant-1',
    'quadrant-2',
    'quadrant-3',
    'quadrant-4',
  ],
  requirement: ['requirementDiagram', ...shared.requirementKeywords],
  c4: ['C4Context', 'C4Container', 'C4Component', ...shared.c4Keywords],
  sankey: ['sankey-beta'],
  xychart: ['xychart-beta', 'title', 'x-axis', 'y-axis', 'bar', 'line'],
  block: ['block-beta', 'columns', 'block', 'end', 'space', ...shared.arrows],
  packet: ['packet-beta'],
  kanban: ['kanban'],
  architecture: ['architecture-beta', ...shared.architectureKeywords],
};

const unique = (values: readonly string[]): string[] => [...new Set(values)];

const snippetFor = (type: DiagramType) => {
  const example = DIAGRAM_EXAMPLES.find((candidate) => candidate.type === type);
  return {
    label: `${example?.name || type} starter`,
    insertText: STARTER_SNIPPETS[type],
  };
};

export const buildCompletions = (
  code: string
): { keywords: string[]; snippets: { label: string; insertText: string }[] } => {
  const type = detectContextType(code);
  if (type) {
    return {
      keywords: unique(CONTEXT_KEYWORDS[type]),
      snippets: [snippetFor(type)],
    };
  }

  return {
    keywords: unique([
      ...shared.diagramTypes,
      ...shared.blockKeywords,
      ...shared.directions,
      ...shared.nodeShapes,
      ...shared.arrows,
    ]),
    snippets: DIAGRAM_TYPES.map(snippetFor),
  };
};
