import { DiagramExample, MermaidConfig, EditorSettings } from '@/types';

export const DEFAULT_DIAGRAM_CODE = `flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]`;

export const DEFAULT_MERMAID_CONFIG: MermaidConfig = {
  theme: 'default',
  themeVariables: {},
  flowchart: {
    curve: 'basis',
  },
};

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  theme: 'vs-dark',
  fontSize: 14,
  wordWrap: 'off',
  minimap: false,
};

export const DIAGRAM_EXAMPLES: DiagramExample[] = [
  {
    id: 'flowchart-basic',
    name: 'Basic Flowchart',
    type: 'flowchart',
    description: 'Simple flowchart with decision nodes',
    code: `flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]`,
  },
  {
    id: 'flowchart-complex',
    name: 'Complex Flowchart',
    type: 'flowchart',
    description: 'Advanced flowchart with subgraphs',
    code: `flowchart TB
    subgraph one
    a1-->a2
    end
    subgraph two
    b1-->b2
    end
    subgraph three
    c1-->c2
    end
    one --> two
    three --> two
    two --> c2`,
  },
  {
    id: 'sequence-basic',
    name: 'Sequence Diagram',
    type: 'sequence',
    description: 'Basic sequence diagram showing interactions',
    code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop HealthCheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`,
  },
  {
    id: 'class-diagram',
    name: 'Class Diagram',
    type: 'class',
    description: 'Object-oriented class relationships',
    code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }`,
  },
  {
    id: 'state-diagram',
    name: 'State Diagram',
    type: 'state',
    description: 'State machine representation',
    code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,
  },
  {
    id: 'er-diagram',
    name: 'Entity Relationship',
    type: 'er',
    description: 'Database entity relationships',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
    CUSTOMER {
        string name
        string custNumber
        string sector
    }
    ORDER {
        int orderNumber
        string deliveryAddress
    }
    LINE-ITEM {
        string productCode
        int quantity
        float pricePerUnit
    }`,
  },
  {
    id: 'gantt-chart',
    name: 'Gantt Chart',
    type: 'gantt',
    description: 'Project timeline visualization',
    code: `gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    section Section
        A task           :a1, 2014-01-01, 30d
        Another task     :after a1, 20d
    section Another
        Task in Another  :2014-01-12, 12d
        another task     :24d`,
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    type: 'pie',
    description: 'Data distribution pie chart',
    code: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,
  },
  {
    id: 'journey',
    name: 'User Journey',
    type: 'journey',
    description: 'User experience journey map',
    code: `journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me`,
  },
  {
    id: 'gitgraph',
    name: 'Git Graph',
    type: 'gitGraph',
    description: 'Git branch visualization',
    code: `gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    commit`,
  },
  {
    id: 'mindmap',
    name: 'Mindmap',
    type: 'mindmap',
    description: 'Hierarchical mind mapping',
    code: `mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid`,
  },
  {
    id: 'timeline',
    name: 'Timeline',
    type: 'timeline',
    description: 'Historical timeline diagram',
    code: `timeline
    title History of Social Media Platform
    2002 : LinkedIn
    2004 : Facebook
         : Google
    2005 : Youtube
    2006 : Twitter`,
  },
  {
    id: 'quadrant',
    name: 'Quadrant Chart',
    type: 'quadrant',
    description: 'Four-quadrant analysis chart',
    code: `quadrantChart
    title Reach and engagement of campaigns
    x-axis Low Reach --> High Reach
    y-axis Low Engagement --> High Engagement
    quadrant-1 We should expand
    quadrant-2 Need to promote
    quadrant-3 Re-evaluate
    quadrant-4 May be improved
    Campaign A: [0.3, 0.6]
    Campaign B: [0.45, 0.23]
    Campaign C: [0.57, 0.69]
    Campaign D: [0.78, 0.34]
    Campaign E: [0.40, 0.34]
    Campaign F: [0.35, 0.78]`,
  },
];
