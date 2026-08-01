"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface DependencyGraphProps {
  nodes: Array<{ id: string; type: string; path: string }>;
  edges: Array<{ from: string; to: string; type: string }>;
}

export default function DependencyGraph({ nodes, edges }: DependencyGraphProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Calculate node positions using a simple force-directed layout
  const nodePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    const width = 800;
    const height = 600;
    
    // Simple circular layout for demo
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      positions.set(node.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });
    
    return positions;
  }, [nodes]);

  // Filter nodes based on selection
  const visibleNodes = useMemo(() => {
    if (!selectedNode) return nodes;
    
    const connected = new Set<string>([selectedNode]);
    edges.forEach(edge => {
      if (edge.from === selectedNode) connected.add(edge.to);
      if (edge.to === selectedNode) connected.add(edge.from);
    });
    
    return nodes.filter(n => connected.has(n.id));
  }, [nodes, edges, selectedNode]);

  const visibleEdges = useMemo(() => {
    if (!selectedNode) return edges;
    return edges.filter(e => e.from === selectedNode || e.to === selectedNode);
  }, [edges, selectedNode]);

  // Calculate node importance (number of connections)
  const nodeImportance = useMemo(() => {
    const importance = new Map<string, number>();
    nodes.forEach(node => {
      const connections = edges.filter(e => e.from === node.id || e.to === node.id).length;
      importance.set(node.id, connections);
    });
    return importance;
  }, [nodes, edges]);

  const maxImportance = Math.max(...Array.from(nodeImportance.values()));

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      {/* Controls */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Interactive Dependency Graph</h3>
          <p className="text-sm text-gray-400">
            {selectedNode ? `Showing connections for ${selectedNode}` : `${nodes.length} modules, ${edges.length} dependencies`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.2))}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {selectedNode && (
            <button
              onClick={() => setSelectedNode(null)}
              className="ml-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition"
            >
              Show All
            </button>
          )}
        </div>
      </div>

      {/* Graph SVG */}
      <div className="relative bg-gray-950 overflow-auto" style={{ height: '600px' }}>
        <svg
          width={800 * zoom}
          height={600 * zoom}
          className="mx-auto"
          style={{ minWidth: '100%', minHeight: '100%' }}
        >
          {/* Draw edges */}
          <g>
            {visibleEdges.map((edge, idx) => {
              const fromPos = nodePositions.get(edge.from);
              const toPos = nodePositions.get(edge.to);
              
              if (!fromPos || !toPos) return null;
              
              return (
                <motion.line
                  key={idx}
                  x1={fromPos.x * zoom}
                  y1={fromPos.y * zoom}
                  x2={toPos.x * zoom}
                  y2={toPos.y * zoom}
                  stroke="#374151"
                  strokeWidth={1.5 * zoom}
                  opacity={0.6}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 0.5, delay: idx * 0.01 }}
                />
              );
            })}
          </g>

          {/* Draw nodes */}
          <g>
            {visibleNodes.map((node, idx) => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;
              
              const importance = nodeImportance.get(node.id) || 0;
              const nodeSize = 8 + (importance / maxImportance) * 12;
              const isSelected = selectedNode === node.id;
              
              return (
                <g key={node.id}>
                  <motion.circle
                    cx={pos.x * zoom}
                    cy={pos.y * zoom}
                    r={nodeSize * zoom}
                    fill={isSelected ? "#3b82f6" : importance > maxImportance * 0.5 ? "#ef4444" : "#10b981"}
                    stroke={isSelected ? "#60a5fa" : "#1f2937"}
                    strokeWidth={2 * zoom}
                    className="cursor-pointer"
                    onClick={() => setSelectedNode(isSelected ? null : node.id)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.3, delay: idx * 0.02 }}
                  />
                  {(importance > maxImportance * 0.7 || isSelected) && (
                    <motion.text
                      x={pos.x * zoom}
                      y={(pos.y - nodeSize - 5) * zoom}
                      textAnchor="middle"
                      fill="#9ca3af"
                      fontSize={11 * zoom}
                      className="pointer-events-none select-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {node.path.split('/').pop()}
                    </motion.text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-800 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-400">Low connections</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-400">High connections</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-400">Selected</span>
        </div>
        <div className="ml-auto text-gray-500">Click nodes to filter connections</div>
      </div>
    </div>
  );
}
