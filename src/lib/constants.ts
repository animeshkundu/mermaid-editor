import { DiagramExample, MermaidConfig, EditorSettings } from '@/types';

export const DEFAULT_DIAGRAM_CODE = `flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]`;

export const DEFAULT_MERMAID_CONFIG: MermaidConfig = {
  theme: 'base',
  look: 'classic',
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  themeVariables: {
    // Modern, beautiful color palette inspired by MermaidChart
    primaryColor: '#4f46e5',       // Indigo - main nodes
    primaryTextColor: '#ffffff',    // White text on primary
    primaryBorderColor: '#3730a3',  // Darker indigo border
    secondaryColor: '#f0abfc',      // Pink/fuchsia for secondary
    secondaryTextColor: '#1e1e1e',  // Dark text on secondary
    secondaryBorderColor: '#c026d3', // Fuchsia border
    tertiaryColor: '#fef3c7',       // Warm amber for tertiary/subgraphs
    tertiaryTextColor: '#1e1e1e',   // Dark text
    tertiaryBorderColor: '#f59e0b', // Amber border
    lineColor: '#6366f1',           // Indigo for lines
    textColor: '#1e1e1e',           // Main text color
    mainBkg: '#4f46e5',             // Main background
    nodeBorder: '#3730a3',          // Node borders
    clusterBkg: '#fef3c7',          // Subgraph background
    clusterBorder: '#f59e0b',       // Subgraph border
    titleColor: '#1e1e1e',          // Title color
    edgeLabelBackground: '#ffffff', // Edge label background
    // Note styling
    noteBkgColor: '#fef9c3',        // Light yellow
    noteTextColor: '#1e1e1e',
    noteBorderColor: '#facc15',
    // Actor/participant styling for sequence diagrams
    actorBkg: '#4f46e5',
    actorBorder: '#3730a3',
    actorTextColor: '#ffffff',
    actorLineColor: '#94a3b8',
    // Sequence diagram specific
    signalColor: '#1e1e1e',
    signalTextColor: '#1e1e1e',
    labelBoxBkgColor: '#4f46e5',
    labelBoxBorderColor: '#3730a3',
    labelTextColor: '#ffffff',
    loopTextColor: '#1e1e1e',
    activationBorderColor: '#c026d3',
    activationBkgColor: '#f5d0fe',
    sequenceNumberColor: '#ffffff',
  },
  flowchart: {
    curve: 'basis',
    padding: 20,
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
    box rgb(79, 70, 229) Users
    participant Alice
    participant John
    end
    box rgb(16, 185, 129) Services
    participant Bob
    end
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
  {
    id: 'requirement',
    name: 'Requirement Diagram',
    type: 'requirement',
    description: 'Requirements and their relationships',
    code: `requirementDiagram
    requirement test_req {
    id: 1
    text: the test text.
    risk: high
    verifymethod: test
    }

    element test_entity {
    type: simulation
    }

    test_entity - satisfies -> test_req`,
  },
  {
    id: 'c4-context',
    name: 'C4 Context Diagram',
    type: 'c4',
    description: 'C4 model system context diagram',
    code: `C4Context
    title System Context diagram for Internet Banking System
    Enterprise_Boundary(b0, "BankBoundary") {
        Person(customerA, "Banking Customer A", "A customer of the bank")
        Person(customerB, "Banking Customer B")
        System(SystemAA, "Internet Banking System", "Allows customers to view account")
    }
    
    System_Ext(SystemC, "E-mail system", "Sends e-mails")
    
    Rel(customerA, SystemAA, "Uses")
    Rel(SystemAA, SystemC, "Sends e-mails")`,
  },
  {
    id: 'sankey',
    name: 'Sankey Diagram',
    type: 'sankey',
    description: 'Flow diagram showing quantities',
    code: `sankey-beta

Agricultural 'waste',Bio-conversion,124.729
Bio-conversion,Liquid,0.597
Bio-conversion,Losses,26.862
Bio-conversion,Solid,280.322
Bio-conversion,Gas,81.144
Electricity grid,Over generation / exports,104.453
Electricity grid,Heating and cooling - Loss,113.726
Electricity grid,H2 conversion,27.14`,
  },
  {
    id: 'xychart',
    name: 'XY Chart',
    type: 'xychart',
    description: 'Line and bar charts with XY data',
    code: `xychart-beta
    title "Sales Revenue"
    x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
    y-axis "Revenue (in $)" 4000 --> 11000
    bar [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]
    line [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]`,
  },
  {
    id: 'block',
    name: 'Block Diagram',
    type: 'block',
    description: 'Block-based architecture diagram',
    code: `block-beta
columns 1
  db(("DB"))
  blockArrowId6<["&nbsp;&nbsp;&nbsp;"]>(down)
  block:ID
    A
    B["A wide one in the middle"]
    C
  end
  space
  D
  ID --> D
  C --> D
  style B fill:#969,stroke:#333,stroke-width:4px`,
  },
  {
    id: 'packet',
    name: 'Packet Diagram',
    type: 'packet',
    description: 'Network packet structure diagram',
    code: `packet-beta
0-15: "Source Port"
16-31: "Destination Port"
32-63: "Sequence Number"
64-95: "Acknowledgment Number"
96-99: "Data Offset"
100-105: "Reserved"
106: "URG"
107: "ACK"
108: "PSH"
109: "RST"
110: "SYN"
111: "FIN"
112-127: "Window Size"
128-143: "Checksum"
144-159: "Urgent Pointer"
160-191: "(Options and Padding)"
192-255: "Data (variable length)"`,
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    type: 'kanban',
    description: 'Kanban board for task management',
    code: `kanban
  Todo
    id1[Design new feature]
    id2[Refactor code]
  "In Progress"
    id3[Write tests]
  Done
    id4[Deploy to staging]`,
  },
  {
    id: 'architecture',
    name: 'Architecture Diagram',
    type: 'architecture',
    description: 'System architecture with icons',
    code: `architecture-beta
    group api(cloud)[API]

    service db(database)[Database] in api
    service disk1(disk)[Storage] in api
    service disk2(disk)[Storage] in api
    service server(server)[Server] in api

    db:L -- R:server
    disk1:T -- B:server
    disk2:T -- B:db`,
  },
];

// Keyboard shortcut definitions for help/documentation
export const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl', 'Z'], action: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
  { keys: ['Ctrl', 'Y'], action: 'Redo (alternative)' },
  { keys: ['Ctrl', 'S'], action: 'Export as PNG' },
  { keys: ['Ctrl', 'Shift', 'C'], action: 'Copy code' },
  { keys: ['Ctrl', ','], action: 'Open configuration' },
  { keys: ['?'], action: 'Show keyboard shortcuts' },
  { keys: ['F11'], action: 'Toggle fullscreen preview' },
  { keys: ['Escape'], action: 'Exit fullscreen' },
  { keys: ['Ctrl', '\\'], action: 'Toggle layout direction' },
];

