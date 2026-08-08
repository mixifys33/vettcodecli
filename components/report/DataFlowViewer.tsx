"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DataFlowGraph, DataFlowNode, DataFlowEdge } from "@/types/report";

interface DataFlowViewerProps {
  dataFlowGraph: DataFlowGraph;
}

export default function DataFlowViewer({ dataFlowGraph }: DataFlowViewerProps) {
  const [selectedNode, setSelectedNode] = useState<DataFlowNode | null>(null);
  const [viewMode, setViewMode] = useState<'stats' | 'list'>('stats');

  if (!dataFlowGraph || !dataFlowGraph.nodes || dataFlowGraph.nodes.length === 0) {
    return null;
  }

  const { nodes, edges, stats } = dataFlowGraph;

  // Handle both CLI format (sources/sinks as arrays) and expected format (as numbers)
  const sourcesCount = typeof stats.sources === 'number' ? stats.sources : (stats.sources?.length || 0);
  const sinksCount = typeof stats.sinks === 'number' ? stats.sinks : (stats.sinks?.length || 0);
  
  // Calculate tainted/sanitized from edges if not provided
  const taintedFlows = stats.taintedFlows ?? edges.filter(e => e.tainted).length;
  const sanitizedFlows = stats.sanitizedFlows ?? edges.filter(e => e.sanitized).length;
  const totalFlows = stats.totalFlows || edges.length;

  // Group nodes by type
  const nodesByType = {
    source: nodes.filter(n => n.type === 'source'),
    sink: nodes.filter(n => n.type === 'sink'),
    function: nodes.filter(n => n.type === 'function'),
    variable: nodes.filter(n => n.type === 'variable'),
  };

  // Get edges for selected node
  const getNodeEdges = (nodeId: string) => {
    return {
      incoming: edges.filter(e => e.to === nodeId),
      outgoing: edges.filter(e => e.from === nodeId),
    };
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'source': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'sink': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'function': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'variable': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'source':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      case 'sink':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        );
      case 'function':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'variable':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const taintedRate = totalFlows > 0 ? ((taintedFlows / totalFlows) * 100).toFixed(1) : '0';
  const sanitizedRate = totalFlows > 0 ? ((sanitizedFlows / totalFlows) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">📊</span>
            Data Flow Analysis
          </h2>
          <p className="text-gray-400 mt-1">
            {totalFlows} data flows tracked • {sourcesCount} sources → {sinksCount} sinks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('stats')}
            className={`px-4 py-2 rounded-lg transition ${
              viewMode === 'stats'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Nodes
          </button>
        </div>
      </div>

      {viewMode === 'stats' ? (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark border border-blue-500/30 rounded-xl p-6">
              <div className="text-blue-400 text-sm mb-2">Total Flows</div>
              <div className="text-3xl font-bold text-white">{totalFlows}</div>
            </div>
            <div className="bg-dark border border-red-500/30 rounded-xl p-6">
              <div className="text-red-400 text-sm mb-2">Tainted</div>
              <div className="text-3xl font-bold text-white">{taintedFlows}</div>
              <div className="text-xs text-red-400 mt-1">{taintedRate}%</div>
            </div>
            <div className="bg-dark border border-green-500/30 rounded-xl p-6">
              <div className="text-green-400 text-sm mb-2">Sanitized</div>
              <div className="text-3xl font-bold text-white">{sanitizedFlows}</div>
              <div className="text-xs text-green-400 mt-1">{sanitizedRate}%</div>
            </div>
            <div className="bg-dark border border-purple-500/30 rounded-xl p-6">
              <div className="text-purple-400 text-sm mb-2">Nodes</div>
              <div className="text-3xl font-bold text-white">{nodes.length}</div>
              <div className="text-xs text-purple-400 mt-1">{edges.length} edges</div>
            </div>
          </div>

          {/* Flow Visualization */}
          <div className="bg-dark border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Flow Summary</h3>
            <div className="flex items-center gap-4 justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-blue-400">{sourcesCount}</span>
                </div>
                <div className="text-sm text-blue-400">Sources</div>
              </div>
              
              <div className="flex-1 flex items-center justify-center gap-2">
                <div className="flex-1 h-1 bg-gradient-to-r from-blue-500/30 to-red-500/30 rounded-full"></div>
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-red-400">{sinksCount}</span>
                </div>
                <div className="text-sm text-red-400">Sinks</div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-400">Tainted Paths: {taintedFlows}</span>
                </div>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-400">Sanitized Paths: {sanitizedFlows}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Node Type Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`border rounded-xl p-4 ${getNodeTypeColor('source')}`}>
              <div className="flex items-center gap-2 mb-2">
                {getNodeTypeIcon('source')}
                <span className="font-semibold">Sources</span>
              </div>
              <div className="text-2xl font-bold">{nodesByType.source.length}</div>
            </div>
            <div className={`border rounded-xl p-4 ${getNodeTypeColor('sink')}`}>
              <div className="flex items-center gap-2 mb-2">
                {getNodeTypeIcon('sink')}
                <span className="font-semibold">Sinks</span>
              </div>
              <div className="text-2xl font-bold">{nodesByType.sink.length}</div>
            </div>
            <div className={`border rounded-xl p-4 ${getNodeTypeColor('function')}`}>
              <div className="flex items-center gap-2 mb-2">
                {getNodeTypeIcon('function')}
                <span className="font-semibold">Functions</span>
              </div>
              <div className="text-2xl font-bold">{nodesByType.function.length}</div>
            </div>
            <div className={`border rounded-xl p-4 ${getNodeTypeColor('variable')}`}>
              <div className="flex items-center gap-2 mb-2">
                {getNodeTypeIcon('variable')}
                <span className="font-semibold">Variables</span>
              </div>
              <div className="text-2xl font-bold">{nodesByType.variable.length}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Node List by Type */}
          {Object.entries(nodesByType).map(([type, typeNodes]) => (
            typeNodes.length > 0 && (
              <div key={type} className="bg-dark border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  {getNodeTypeIcon(type)}
                  <span className="capitalize">{type}s</span>
                  <span className="text-gray-500 text-sm font-normal">({typeNodes.length})</span>
                </h3>
                <div className="grid gap-2">
                  {typeNodes.map((node) => {
                    const nodeEdges = getNodeEdges(node.id);
                    const isSelected = selectedNode?.id === node.id;
                    
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(isSelected ? null : node)}
                        className={`p-4 rounded-lg border cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-500/20 border-blue-500/50'
                            : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm text-white mb-1 truncate">
                              {node.label}
                            </div>
                            {node.dataType && (
                              <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                                {node.dataType}
                              </span>
                            )}
                            {node.file && (
                              <div className="text-xs text-gray-500 mt-1">
                                {node.file}{node.line ? `:${node.line}` : ''}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{nodeEdges.incoming.length} in</span>
                            <span>•</span>
                            <span>{nodeEdges.outgoing.length} out</span>
                          </div>
                        </div>
                        
                        {isSelected && nodeEdges.outgoing.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mt-3 pt-3 border-t border-gray-800"
                          >
                            <div className="text-xs text-gray-400 mb-2">Flows to:</div>
                            <div className="space-y-1">
                              {nodeEdges.outgoing.map((edge, idx) => {
                                const targetNode = nodes.find(n => n.id === edge.to);
                                return (
                                  <div
                                    key={idx}
                                    className={`text-xs p-2 rounded ${
                                      edge.tainted
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                        : 'bg-green-500/10 text-green-400 border border-green-500/30'
                                    }`}
                                  >
                                    → {targetNode?.label || edge.to}
                                    {edge.label && ` (${edge.label})`}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-400">Source (input)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-400">Sink (output)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-400">Function</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-400">Variable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
