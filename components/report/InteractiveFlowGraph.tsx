"use client";

import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { DataFlowNode, DataFlowEdge } from '@/types/report';

interface InteractiveFlowGraphProps {
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  onNodeClick?: (node: DataFlowNode) => void;
}

// Custom node component for sources
const SourceNode = ({ data }: any) => (
  <div className="px-4 py-3 bg-blue-500/20 border-2 border-blue-500 rounded-lg shadow-lg min-w-[200px]">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      <div className="text-xs font-semibold text-blue-400 uppercase">Source</div>
    </div>
    <code className="text-sm font-bold text-white block truncate">{data.label}</code>
    {data.dataType && (
      <div className="mt-2">
        <span className="px-2 py-1 bg-purple-500/30 text-purple-300 text-xs rounded border border-purple-500/50">
          🔐 {data.dataType}
        </span>
      </div>
    )}
    {data.file && (
      <div className="text-xs text-gray-400 mt-2 truncate">
        📄 {data.file.split('/').pop()}:{data.line}
      </div>
    )}
  </div>
);

// Custom node component for sinks
const SinkNode = ({ data }: any) => {
  const isVulnerable = data.hasTaintedInput;
  
  return (
    <div className={`px-4 py-3 ${isVulnerable ? 'bg-red-500/30 border-red-600 animate-pulse' : 'bg-red-500/20 border-red-500'} border-2 rounded-lg shadow-lg min-w-[200px]`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 ${isVulnerable ? 'bg-red-600' : 'bg-red-500'} rounded-full animate-pulse`}></div>
        <div className="text-xs font-semibold text-red-400 uppercase">Danger Zone</div>
      </div>
      <code className="text-sm font-bold text-white block truncate">{data.label}</code>
      {isVulnerable && (
        <div className="mt-2 flex items-center gap-1">
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-red-400 font-bold">VULNERABLE</span>
        </div>
      )}
      {data.file && (
        <div className="text-xs text-gray-400 mt-2 truncate">
          📄 {data.file.split('/').pop()}:{data.line}
        </div>
      )}
    </div>
  );
};

// Custom node component for intermediate nodes (functions/variables)
const IntermediateNode = ({ data }: any) => {
  const isFunction = data.type === 'function';
  const hasTaintedFlow = data.hasTaintedFlow;
  
  return (
    <div className={`px-3 py-2 ${isFunction ? 'bg-purple-500/20 border-purple-500' : 'bg-yellow-500/20 border-yellow-500'} border rounded-lg shadow min-w-[150px]`}>
      <div className="flex items-center gap-2">
        {isFunction ? (
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
        <code className={`text-xs font-semibold ${isFunction ? 'text-purple-300' : 'text-yellow-300'} truncate`}>
          {data.label}
        </code>
      </div>
      {hasTaintedFlow && (
        <div className="mt-1 w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></div>
      )}
    </div>
  );
};

const nodeTypes = {
  source: SourceNode,
  sink: SinkNode,
  function: IntermediateNode,
  variable: IntermediateNode,
};

export default function InteractiveFlowGraph({ nodes: dataNodes, edges: dataEdges, onNodeClick }: InteractiveFlowGraphProps) {
  // Create a dagre graph for automatic layout
  const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ 
      rankdir: 'LR', // Left to Right
      nodesep: 100,
      ranksep: 200,
      edgesep: 50,
    });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 250, height: 100 });
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
          x: nodeWithPosition.x - 125,
          y: nodeWithPosition.y - 50,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }, []);

  // Convert data to ReactFlow format
  const initialNodes: Node[] = useMemo(() => {
    return dataNodes.map((node) => {
      // Check if this node has tainted flows
      const hasTaintedFlow = dataEdges.some(
        (edge) => (edge.from === node.id || edge.to === node.id) && edge.tainted && !edge.sanitized
      );
      
      // Check if this is a sink with tainted input
      const hasTaintedInput = node.type === 'sink' && dataEdges.some(
        (edge) => edge.to === node.id && edge.tainted && !edge.sanitized
      );

      return {
        id: node.id,
        type: node.type,
        data: {
          ...node,
          hasTaintedFlow,
          hasTaintedInput,
        },
        position: { x: 0, y: 0 }, // Will be set by dagre
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [dataNodes, dataEdges]);

  const initialEdges: Edge[] = useMemo(() => {
    return dataEdges.map((edge, idx) => {
      const isTainted = edge.tainted && !edge.sanitized;
      const isSanitized = edge.sanitized;

      return {
        id: `edge-${idx}`,
        source: edge.from,
        target: edge.to,
        label: edge.label,
        animated: isTainted, // Animate dangerous flows
        style: {
          stroke: isTainted ? '#ef4444' : isSanitized ? '#10b981' : '#6b7280',
          strokeWidth: isTainted ? 3 : 2,
          strokeDasharray: isSanitized ? '5,5' : 'none',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isTainted ? '#ef4444' : isSanitized ? '#10b981' : '#6b7280',
          width: 20,
          height: 20,
        },
        labelStyle: {
          fill: isTainted ? '#ef4444' : '#ffffff',
          fontSize: 11,
          fontWeight: 'bold',
        },
        labelBgStyle: {
          fill: '#1f2937',
          fillOpacity: 0.9,
        },
      };
    });
  }, [dataEdges]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges, getLayoutedElements]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getLayoutedElements(initialNodes, initialEdges);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [initialNodes, initialEdges, getLayoutedElements, setNodes, setEdges]);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      const originalNode = dataNodes.find(n => n.id === node.id);
      if (originalNode) {
        onNodeClick(originalNode);
      }
    }
  }, [dataNodes, onNodeClick]);

  return (
    <div style={{ width: '100%', height: '800px' }} className="bg-darker rounded-xl border border-gray-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-darker"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="#374151" gap={16} />
        <Controls className="bg-dark border border-gray-700" />
        <MiniMap 
          className="bg-dark border border-gray-700" 
          nodeColor={(node) => {
            switch (node.type) {
              case 'source': return '#3b82f6';
              case 'sink': return '#ef4444';
              case 'function': return '#a855f7';
              case 'variable': return '#eab308';
              default: return '#6b7280';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}
