import { DiagramExample, MermaidConfig, EditorSettings, DiagramLimits } from '@/types';

export const DEFAULT_DIAGRAM_CODE = `flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]`;

export const MIN_DIAGRAM_LIMITS: DiagramLimits = {
  maxEdges: 1,
  maxTextSize: 1_000,
};

export const DEFAULT_DIAGRAM_LIMITS: DiagramLimits = {
  maxEdges: 1_000,
  maxTextSize: 200_000,
};

export const HARD_DIAGRAM_CEILING: DiagramLimits = {
  maxEdges: 1_000,
  maxTextSize: 250_000,
};

export const INTERACTIVE_RENDER_THRESHOLD: DiagramLimits = {
  maxEdges: 300,
  maxTextSize: 100_000,
};

export const FIXED_SECURITY_LEVEL = 'strict' as const;
export const RENDER_TIMEOUT_MS = 15_000;

/**
 * Minimalist Beige/Neutral Theme for Mermaid Diagrams
 * 
 * Design Philosophy:
 * - Let the diagram STRUCTURE speak, not the colors
 * - Use warm, neutral tones for most elements
 * - Only apply distinct colors where REQUIRED for distinction (pie slices, git branches)
 * - Never override user-supplied colors (Mermaid handles this natively)
 * 
 * When to use colors:
 * ✅ Pie charts - slices MUST be distinguishable
 * ✅ Git graphs - branches MUST be distinguishable
 * ✅ Mindmaps/Timelines - depth levels need visual separation
 * ❌ Flowcharts - single neutral node style is cleaner
 * ❌ Sequence diagrams - actors don't need colors
 * ❌ Class/State/ER - technical diagrams are better monochrome
 */

// ===========================================
// BEIGE/WARM NEUTRAL BASE PALETTE
// ===========================================
export const NEUTRAL_PALETTE = {
  // Backgrounds (light to dark)
  bg50: '#FDFCFB',     // Near white, warm
  bg100: '#F5F2ED',    // Cream (from palette row 1)
  bg200: '#EFEBE7',    // Light beige (node backgrounds)
  bg300: '#E3DED8',    // Medium-light beige
  
  // Borders & accents
  border300: '#D4CEC6', // Light border
  border400: '#B8B0A4', // Medium border (node borders)
  border500: '#9C9488', // Darker border
  
  // Text colors
  text600: '#6B635A',   // Muted text
  text700: '#4A453E',   // Body text
  text800: '#2D2A26',   // Headings, emphasis
  text900: '#1A1816',   // Maximum contrast
} as const;

// ===========================================
// MUTED ELEGANT PALETTE - Based on Apartment Therapy palette
// 9 sophisticated, distinguishable colors
// Each color has a TEXT color that ensures legibility
// ===========================================
export const MUTED_PALETTE = {
  cream: '#F5F2ED',      // Row 1: Cream/off-white
  warmGray: '#7A6F6A',   // Row 1: Warm gray/taupe
  dustyBlue: '#A7C4C2',  // Row 1: Light dusty blue/teal
  slateBlue: '#5E6B80',  // Row 2: Muted navy/slate blue
  sage: '#8B9A7C',       // Row 2: Sage green
  olive: '#5E6338',      // Row 2: Olive/army green
  dustyRose: '#C9A5A5',  // Row 3: Dusty rose/pink
  terracotta: '#B38274', // Row 3: Terracotta/clay
  golden: '#E5C07B',     // Row 3: Golden yellow/mustard
} as const;

// Text colors for each muted color (ensures contrast/legibility)
// Dark text (#2D2A26) for light backgrounds, white (#FFFFFF) for dark backgrounds
export const MUTED_PALETTE_TEXT = {
  cream: '#2D2A26',      // Dark text on light cream
  warmGray: '#FFFFFF',   // White text on medium gray
  dustyBlue: '#2D2A26',  // Dark text on light blue
  slateBlue: '#FFFFFF',  // White text on dark slate
  sage: '#2D2A26',       // Dark text on medium sage
  olive: '#FFFFFF',      // White text on dark olive
  dustyRose: '#2D2A26',  // Dark text on light rose
  terracotta: '#FFFFFF', // White text on medium terracotta
  golden: '#2D2A26',     // Dark text on light golden
} as const;

// Darker variants for borders
export const MUTED_PALETTE_DARK = {
  cream: '#E5E2DD',
  warmGray: '#5A4F4A',
  dustyBlue: '#87A4A2',
  slateBlue: '#4E5B70',
  sage: '#6B7A5C',
  olive: '#4E5328',
  dustyRose: '#A98585',
  terracotta: '#936254',
  golden: '#C5A05B',
} as const;

export const DEFAULT_MERMAID_CONFIG: MermaidConfig = {
  theme: 'base',
  look: 'classic',
  maxEdges: DEFAULT_DIAGRAM_LIMITS.maxEdges,
  maxTextSize: DEFAULT_DIAGRAM_LIMITS.maxTextSize,
  securityLevel: FIXED_SECURITY_LEVEL,
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  themeVariables: {
    // ===========================================
    // BASE COLORS - Neutral beige for all diagrams
    // ===========================================
    background: '#ffffff',
    primaryColor: NEUTRAL_PALETTE.bg200,        // Subtle beige nodes
    primaryTextColor: NEUTRAL_PALETTE.text800,  // Dark text for contrast
    primaryBorderColor: NEUTRAL_PALETTE.border400,
    secondaryColor: NEUTRAL_PALETTE.bg100,
    secondaryTextColor: NEUTRAL_PALETTE.text800,
    secondaryBorderColor: NEUTRAL_PALETTE.border300,
    tertiaryColor: NEUTRAL_PALETTE.bg300,
    tertiaryTextColor: NEUTRAL_PALETTE.text800,
    tertiaryBorderColor: NEUTRAL_PALETTE.border500,
    
    // ===========================================
    // GENERAL TEXT & LINES
    // ===========================================
    lineColor: NEUTRAL_PALETTE.border500,
    textColor: NEUTRAL_PALETTE.text800,
    mainBkg: NEUTRAL_PALETTE.bg200,
    nodeBorder: NEUTRAL_PALETTE.border400,
    
    // ===========================================
    // FLOWCHART - Neutral styling
    // ===========================================
    clusterBkg: NEUTRAL_PALETTE.bg100,
    clusterBorder: NEUTRAL_PALETTE.border400,
    titleColor: NEUTRAL_PALETTE.text800,
    edgeLabelBackground: NEUTRAL_PALETTE.bg50,
    
    // ===========================================
    // NOTE STYLING - Subtle highlight
    // ===========================================
    noteBkgColor: '#FDF9F3',  // Warm off-white
    noteTextColor: NEUTRAL_PALETTE.text800,
    noteBorderColor: NEUTRAL_PALETTE.border400,
    
    // ===========================================
    // SEQUENCE DIAGRAM
    // Mermaid only supports ONE actorBkg (no per-actor colors)
    // Using dusty blue for actors - professional & calming
    // Users can use `box rgb(...)` directive for grouping
    // ===========================================
    actorBkg: MUTED_PALETTE.dustyBlue,
    actorBorder: MUTED_PALETTE_DARK.dustyBlue,
    actorTextColor: MUTED_PALETTE_TEXT.dustyBlue,
    actorLineColor: NEUTRAL_PALETTE.border400,
    signalColor: NEUTRAL_PALETTE.text700,
    signalTextColor: NEUTRAL_PALETTE.text800,
    labelBoxBkgColor: MUTED_PALETTE.sage,
    labelBoxBorderColor: MUTED_PALETTE_DARK.sage,
    labelTextColor: MUTED_PALETTE_TEXT.sage,
    loopTextColor: NEUTRAL_PALETTE.text700,
    activationBorderColor: MUTED_PALETTE_DARK.dustyRose,
    activationBkgColor: '#EDE5E5',  // Light dusty rose
    sequenceNumberColor: '#ffffff',
    
    // ===========================================
    // PIE CHART - NEEDS distinct colors for slices
    // Using muted elegant palette with proper text contrast
    // ===========================================
    pie1: MUTED_PALETTE.dustyBlue,
    pie2: MUTED_PALETTE.terracotta,
    pie3: MUTED_PALETTE.sage,
    pie4: MUTED_PALETTE.dustyRose,
    pie5: MUTED_PALETTE.golden,
    pie6: MUTED_PALETTE.slateBlue,
    pie7: MUTED_PALETTE.warmGray,
    pie8: MUTED_PALETTE.olive,
    pie9: MUTED_PALETTE.cream,
    pie10: MUTED_PALETTE.dustyBlue,
    pie11: MUTED_PALETTE.terracotta,
    pie12: MUTED_PALETTE.sage,
    pieStrokeColor: '#ffffff',
    pieStrokeWidth: '2px',
    pieOuterStrokeWidth: '2px',
    pieOuterStrokeColor: NEUTRAL_PALETTE.border300,
    pieOpacity: '0.9',
    pieTitleTextColor: NEUTRAL_PALETTE.text800,
    pieSectionTextColor: '#ffffff',
    pieLegendTextColor: NEUTRAL_PALETTE.text800,
    
    // ===========================================
    // USER JOURNEY - Needs section differentiation
    // ===========================================
    fillType0: MUTED_PALETTE.dustyBlue,
    fillType1: MUTED_PALETTE.terracotta,
    fillType2: MUTED_PALETTE.sage,
    fillType3: MUTED_PALETTE.dustyRose,
    fillType4: MUTED_PALETTE.golden,
    fillType5: MUTED_PALETTE.slateBlue,
    fillType6: MUTED_PALETTE.warmGray,
    fillType7: MUTED_PALETTE.olive,
    
    // ===========================================
    // GIT GRAPH - NEEDS distinct branch colors
    // ===========================================
    git0: MUTED_PALETTE.dustyBlue,
    git1: MUTED_PALETTE.terracotta,
    git2: MUTED_PALETTE.sage,
    git3: MUTED_PALETTE.dustyRose,
    git4: MUTED_PALETTE.golden,
    git5: MUTED_PALETTE.warmGray,
    git6: MUTED_PALETTE.slateBlue,
    git7: MUTED_PALETTE.olive,
    gitBranchLabel0: MUTED_PALETTE_TEXT.dustyBlue,
    gitBranchLabel1: MUTED_PALETTE_TEXT.terracotta,
    gitBranchLabel2: MUTED_PALETTE_TEXT.sage,
    gitBranchLabel3: MUTED_PALETTE_TEXT.dustyRose,
    gitBranchLabel4: MUTED_PALETTE_TEXT.golden,
    gitBranchLabel5: MUTED_PALETTE_TEXT.warmGray,
    gitBranchLabel6: MUTED_PALETTE_TEXT.slateBlue,
    gitBranchLabel7: MUTED_PALETTE_TEXT.olive,
    gitInv0: '#ffffff',
    gitInv1: '#ffffff',
    gitInv2: '#ffffff',
    gitInv3: '#ffffff',
    commitLabelColor: NEUTRAL_PALETTE.text800,
    commitLabelBackground: NEUTRAL_PALETTE.bg200,
    
    // ===========================================
    // GANTT CHART - Neutral with subtle distinction
    // ===========================================
    sectionBkgColor: NEUTRAL_PALETTE.bg100,
    altSectionBkgColor: NEUTRAL_PALETTE.bg50,
    sectionBkgColor2: NEUTRAL_PALETTE.bg200,
    excludeBkgColor: NEUTRAL_PALETTE.bg100,
    taskBorderColor: NEUTRAL_PALETTE.border400,
    taskBkgColor: MUTED_PALETTE.dustyBlue,
    activeTaskBorderColor: MUTED_PALETTE_DARK.dustyBlue,
    activeTaskBkgColor: MUTED_PALETTE.sage,
    gridColor: NEUTRAL_PALETTE.border300,
    doneTaskBkgColor: NEUTRAL_PALETTE.border400,
    doneTaskBorderColor: NEUTRAL_PALETTE.border500,
    critBorderColor: MUTED_PALETTE_DARK.terracotta,
    critBkgColor: MUTED_PALETTE.terracotta,
    todayLineColor: MUTED_PALETTE.warmGray,
    taskTextColor: MUTED_PALETTE_TEXT.dustyBlue,
    taskTextDarkColor: NEUTRAL_PALETTE.text800,
    taskTextLightColor: '#ffffff',
    taskTextOutsideColor: NEUTRAL_PALETTE.text800,
    taskTextClickableColor: MUTED_PALETTE.slateBlue,
    
    // ===========================================
    // STATE DIAGRAM - Neutral
    // ===========================================
    labelColor: NEUTRAL_PALETTE.text800,
    altBackground: NEUTRAL_PALETTE.bg50,
    stateBkg: NEUTRAL_PALETTE.bg200,
    stateLabelColor: NEUTRAL_PALETTE.text800,
    
    // ===========================================
    // CLASS DIAGRAM - Neutral (technical)
    // ===========================================
    classText: NEUTRAL_PALETTE.text800,
    
    // ===========================================
    // ER DIAGRAM - Neutral (technical)
    // ===========================================
    attributeBackgroundColorOdd: NEUTRAL_PALETTE.bg100,
    attributeBackgroundColorEven: NEUTRAL_PALETTE.bg50,
    
    // ===========================================
    // QUADRANT CHART - Earth tone quadrants
    // Each quadrant gets a subtle tint for visual separation
    // ===========================================
    quadrant1Fill: '#E8EFF2',  // Light dusty blue (top-right: expand)
    quadrant2Fill: '#EBF2E8',  // Light sage (top-left: promote)
    quadrant3Fill: '#F2EDE8',  // Light terracotta (bottom-left: re-evaluate)
    quadrant4Fill: '#F0EBE8',  // Light sand (bottom-right: improve)
    quadrant1TextFill: NEUTRAL_PALETTE.text800,
    quadrant2TextFill: NEUTRAL_PALETTE.text800,
    quadrant3TextFill: NEUTRAL_PALETTE.text800,
    quadrant4TextFill: NEUTRAL_PALETTE.text800,
    quadrantPointFill: MUTED_PALETTE.dustyBlue,
    quadrantPointTextFill: '#ffffff',
    quadrantTitleFill: NEUTRAL_PALETTE.text800,
    quadrantInternalBorderStrokeFill: NEUTRAL_PALETTE.border300,
    quadrantExternalBorderStrokeFill: NEUTRAL_PALETTE.border400,
    
    // ===========================================
    // REQUIREMENT DIAGRAM - Neutral
    // ===========================================
    requirementBackground: NEUTRAL_PALETTE.bg200,
    requirementBorderColor: NEUTRAL_PALETTE.border400,
    requirementTextColor: NEUTRAL_PALETTE.text800,
    relationColor: NEUTRAL_PALETTE.border500,
    relationLabelBackground: NEUTRAL_PALETTE.bg50,
    relationLabelColor: NEUTRAL_PALETTE.text800,
    
    // ===========================================
    // MINDMAP & TIMELINE - Need depth distinction
    // Using muted palette, cycling through 9 colors
    // ===========================================
    cScale0: MUTED_PALETTE.dustyBlue,
    cScale1: MUTED_PALETTE.terracotta,
    cScale2: MUTED_PALETTE.sage,
    cScale3: MUTED_PALETTE.dustyRose,
    cScale4: MUTED_PALETTE.golden,
    cScale5: MUTED_PALETTE.slateBlue,
    cScale6: MUTED_PALETTE.warmGray,
    cScale7: MUTED_PALETTE.olive,
    cScale8: MUTED_PALETTE.cream,
    cScale9: MUTED_PALETTE.dustyBlue,
    cScale10: MUTED_PALETTE.terracotta,
    cScale11: MUTED_PALETTE.sage,
    cScalePeer0: MUTED_PALETTE_DARK.dustyBlue,
    cScalePeer1: MUTED_PALETTE_DARK.terracotta,
    cScalePeer2: MUTED_PALETTE_DARK.sage,
    cScalePeer3: MUTED_PALETTE_DARK.dustyRose,
    cScalePeer4: MUTED_PALETTE_DARK.golden,
    cScalePeer5: MUTED_PALETTE_DARK.slateBlue,
    cScalePeer6: MUTED_PALETTE_DARK.warmGray,
    cScalePeer7: MUTED_PALETTE_DARK.olive,
    cScalePeer8: MUTED_PALETTE_DARK.cream,
    cScalePeer9: MUTED_PALETTE_DARK.dustyBlue,
    cScalePeer10: MUTED_PALETTE_DARK.terracotta,
    cScalePeer11: MUTED_PALETTE_DARK.sage,
    cScaleInv0: MUTED_PALETTE_TEXT.dustyBlue,
    cScaleInv1: MUTED_PALETTE_TEXT.terracotta,
    cScaleInv2: MUTED_PALETTE_TEXT.sage,
    cScaleInv3: MUTED_PALETTE_TEXT.dustyRose,
    cScaleInv4: MUTED_PALETTE_TEXT.golden,
    cScaleInv5: MUTED_PALETTE_TEXT.slateBlue,
    cScaleInv6: MUTED_PALETTE_TEXT.warmGray,
    cScaleInv7: MUTED_PALETTE_TEXT.olive,
    cScaleInv8: MUTED_PALETTE_TEXT.cream,
    cScaleInv9: MUTED_PALETTE_TEXT.dustyBlue,
    cScaleInv10: MUTED_PALETTE_TEXT.terracotta,
    cScaleInv11: MUTED_PALETTE_TEXT.sage,
    cScaleLabel0: MUTED_PALETTE_TEXT.dustyBlue,
    cScaleLabel1: MUTED_PALETTE_TEXT.terracotta,
    cScaleLabel2: MUTED_PALETTE_TEXT.sage,
    cScaleLabel3: MUTED_PALETTE_TEXT.dustyRose,
    cScaleLabel4: MUTED_PALETTE_TEXT.golden,
    cScaleLabel5: MUTED_PALETTE_TEXT.slateBlue,
    cScaleLabel6: MUTED_PALETTE_TEXT.warmGray,
    cScaleLabel7: MUTED_PALETTE_TEXT.olive,
    cScaleLabel8: MUTED_PALETTE_TEXT.cream,
    cScaleLabel9: MUTED_PALETTE_TEXT.dustyBlue,
    cScaleLabel10: MUTED_PALETTE_TEXT.terracotta,
    cScaleLabel11: MUTED_PALETTE_TEXT.sage,
    
    // ===========================================
    // XY CHART - Muted colors for data series
    // ===========================================
    xyChart: {
      backgroundColor: '#ffffff',
      titleColor: NEUTRAL_PALETTE.text800,
      xAxisTitleColor: NEUTRAL_PALETTE.text800,
      xAxisLabelColor: NEUTRAL_PALETTE.text600,
      xAxisTickColor: NEUTRAL_PALETTE.border400,
      xAxisLineColor: NEUTRAL_PALETTE.border300,
      yAxisTitleColor: NEUTRAL_PALETTE.text800,
      yAxisLabelColor: NEUTRAL_PALETTE.text600,
      yAxisTickColor: NEUTRAL_PALETTE.border400,
      yAxisLineColor: NEUTRAL_PALETTE.border300,
      plotColorPalette: `${MUTED_PALETTE.dustyBlue},${MUTED_PALETTE.terracotta},${MUTED_PALETTE.sage},${MUTED_PALETTE.dustyRose},${MUTED_PALETTE.golden},${MUTED_PALETTE.slateBlue},${MUTED_PALETTE.warmGray},${MUTED_PALETTE.olive},${MUTED_PALETTE.cream}`,
    },
    
    // ===========================================
    // C4 DIAGRAM - Semantic earth tones
    // Person = terracotta (warm, human)
    // Container = sage (growth, development) 
    // System = dusty blue (technical, stable)
    // External = stone (outside, muted)
    // ===========================================
    personBkg: MUTED_PALETTE.terracotta,
    personBorder: MUTED_PALETTE_DARK.terracotta,
    containerBkg: '#E8F2EE',  // Light sage
    containerBorder: MUTED_PALETTE.sage,
    external_containerBkg: '#F0EEEB',  // Light stone
    external_containerBorder: MUTED_PALETTE.warmGray,
    systemBkg: '#E8EFF2',  // Light dusty blue
    systemBorder: MUTED_PALETTE.dustyBlue,
    external_systemBkg: '#F5F3F0',  // Very light stone
    external_systemBorder: NEUTRAL_PALETTE.border400,
    boundaryColor: MUTED_PALETTE.dustyRose,
    boundaryTextColor: NEUTRAL_PALETTE.text700,
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
    participant Alice
    participant John
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
