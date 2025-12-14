/**
 * GraphCanvasEditor - Visual editor for graph-based diagrams
 * 
 * Uses React Flow to provide drag-and-drop node editing for:
 * - Flowchart diagrams
 * - State diagrams (future)
 * - Class diagrams (future)
 * - ER diagrams (future)
 * 
 * Features:
 * - Drag nodes to reposition
 * - Auto-layout with dagre
 * - Pan and zoom
 * - Add/delete nodes and edges (future)
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  type OnNodesChange,
  type OnEdgesChange,
  addEdge,
  Connection,
} from '@xyflow/react';
import dagre from 'dagre';

import type { GraphVisualState, VisualNode, VisualEdge, MermaidShape } from '@/types';
import { FlowchartNode } from './FlowchartNode';
import { FlowchartToolbar } from './FlowchartToolbar';

export interface GraphCanvasEditorProps {
  /** Current visual state */
  state: GraphVisualState;
  /** Callback when state changes */
  onChange: (state: GraphVisualState) => void;
  /** Whether the editor is read-only */
  readOnly?: boolean;
}

// Register custom node types
const nodeTypes = {
  flowchartNode: FlowchartNode,
};

/**
 * Auto-layout nodes using dagre
 */
const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 75,
        y: nodeWithPosition.y - 25,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

/**
 * Convert VisualNode to React Flow Node
 */
const visualNodeToFlowNode = (vNode: VisualNode): Node => ({
  id: vNode.id,
  type: 'flowchartNode',
  position: { x: vNode.x, y: vNode.y },
  data: { label: vNode.label, shape: vNode.shape },
});

/**
 * Convert VisualEdge to React Flow Edge
 */
const visualEdgeToFlowEdge = (vEdge: VisualEdge): Edge => ({
  id: vEdge.id,
  source: vEdge.source,
  target: vEdge.target,
  label: vEdge.label,
  type: vEdge.type === 'dotted' ? 'step' : 'smoothstep',
  animated: vEdge.type === 'thick',
  style: {
    strokeWidth: vEdge.type === 'thick' ? 3 : 2,
    strokeDasharray: vEdge.type === 'dotted' ? '5,5' : undefined,
  },
});

/**
 * GraphCanvasEditor Component
 */
export const GraphCanvasEditor = ({ state, onChange, readOnly = false }: GraphCanvasEditorProps) => {
  // Convert visual state to React Flow format
  const initialNodes = useMemo(
    () => state.nodes.map(visualNodeToFlowNode),
    [state.nodes]
  );
  
  const initialEdges = useMemo(
    () => state.edges.map(visualEdgeToFlowEdge),
    [state.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);

  // Track node counter for unique IDs
  const [nodeCounter, setNodeCounter] = useState(
    Math.max(0, ...state.nodes.map(n => {
      const match = n.id.match(/^node(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    })) + 1
  );

  // Auto-layout on first render if nodes have default positions
  useEffect(() => {
    const hasDefaultPositions = state.nodes.every(
      n => n.x === 100 || n.y === 100 || (n.x % 200 === 100 && n.y % 150 === 100)
    );

    if (hasDefaultPositions && nodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        'TB'
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, []); // Run only on mount

  // Add new node
  const handleAddNode = useCallback((shape: MermaidShape) => {
    const newNodeId = `node${nodeCounter}`;
    setNodeCounter(prev => prev + 1);

    const newNode: Node = {
      id: newNodeId,
      type: 'flowchartNode',
      position: { x: 250, y: 250 }, // Center of viewport
      data: { label: `Node ${nodeCounter}`, shape },
    };

    setNodes((nds) => [...nds, newNode]);

    // Update visual state
    const newVisualNode: VisualNode = {
      id: newNodeId,
      label: `Node ${nodeCounter}`,
      x: 250,
      y: 250,
      shape,
    };

    onChange({
      ...state,
      nodes: [...state.nodes, newVisualNode],
    });
  }, [nodeCounter, state, onChange]);

  // Delete selected nodes and edges
  const handleDeleteSelected = useCallback(() => {
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      // Remove selected nodes
      const updatedNodes = nodes.filter(n => !selectedNodes.includes(n.id));
      setNodes(updatedNodes);

      // Remove selected edges and edges connected to deleted nodes
      const updatedEdges = edges.filter(
        e => !selectedEdges.includes(e.id) && 
             !selectedNodes.includes(e.source) && 
             !selectedNodes.includes(e.target)
      );
      setEdges(updatedEdges);

      // Update visual state
      const visualNodes = updatedNodes.map(n => ({
        id: n.id,
        label: n.data.label,
        x: n.position.x,
        y: n.position.y,
        shape: n.data.shape,
      }));

      const visualEdges = updatedEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label || '',
        type: e.animated ? 'thick' : (e.type === 'step' ? 'dotted' : 'solid'),
      }));

      onChange({
        paradigm: 'graph',
        nodes: visualNodes,
        edges: visualEdges,
      });

      setSelectedNodes([]);
      setSelectedEdges([]);
    }
  }, [selectedNodes, selectedEdges, nodes, edges, onChange]);

  // Auto-layout
  const handleAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      'TB'
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Update visual state with new positions
    const visualNodes = layoutedNodes.map(n => ({
      id: n.id,
      label: n.data.label,
      x: n.position.x,
      y: n.position.y,
      shape: n.data.shape,
    }));

    onChange({
      ...state,
      nodes: visualNodes,
    });
  }, [nodes, edges, state, onChange]);

  // Handle selection changes
  const handleSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    setSelectedNodes(params.nodes.map(n => n.id));
    setSelectedEdges(params.edges.map(e => e.id));
  }, []);

  // Handle edge connections
  const handleConnect = useCallback((connection: Connection) => {
    if (readOnly) return;

    const newEdge: Edge = {
      id: `edge-${connection.source}-${connection.target}`,
      source: connection.source!,
      target: connection.target!,
      type: 'smoothstep',
    };

    setEdges((eds) => addEdge(newEdge, eds));

    // Update visual state
    const visualEdge: VisualEdge = {
      id: newEdge.id,
      source: connection.source!,
      target: connection.target!,
      label: '',
      type: 'solid',
    };

    onChange({
      ...state,
      edges: [...state.edges, visualEdge],
    });
  }, [readOnly, state, onChange]);

  // Handle node position changes
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      // Update visual state with new positions
      const positionChanges = changes.filter(c => c.type === 'position' && 'position' in c && c.position);
      
      if (positionChanges.length > 0 && !readOnly) {
        setNodes((currentNodes) => {
          const updatedVisualNodes = currentNodes.map(node => {
            const vNode = state.nodes.find(n => n.id === node.id);
            if (!vNode) return null;
            
            return {
              ...vNode,
              x: node.position.x,
              y: node.position.y,
            } as VisualNode;
          }).filter((n): n is VisualNode => n !== null);

          onChange({
            ...state,
            nodes: updatedVisualNodes,
          });

          return currentNodes;
        });
      }
    },
    [onNodesChange, onChange, readOnly, state]
  );

  return (
    <div style={{ width: '100%', height: '100%' }} className="flex flex-col">
      {!readOnly && (
        <FlowchartToolbar
          onAddNode={handleAddNode}
          onDeleteSelected={handleDeleteSelected}
          onAutoLayout={handleAutoLayout}
          hasSelection={selectedNodes.length > 0 || selectedEdges.length > 0}
        />
      )}
      
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onSelectionChange={handleSelectionChange}
          connectionMode={ConnectionMode.Loose}
          fitView
          minZoom={0.1}
          maxZoom={4}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
          deleteKeyCode={readOnly ? null : 'Delete'}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};
