"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DataFlowGraph, DataFlowNode, DataFlowEdge } from "@/types/report";

export default function DataFlowPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  
  const [dataFlowGraph, setDataFlowGraph] = useState<DataFlowGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<DataFlowNode | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showTainted, setShowTainted] = useState(true);
  const [showSanitized, setShowSanitized] = useState(true);
  const [viewType, setViewType] = useState<'visual' | 'list'>('visual');

  useEffect(() => {
    if (!reportId) return;

    fetch(`/api/reports/${reportId}`)
      .then(res => res.json())
      .then(data => {
        if (data.report?.dataFlowGraph) {
          setDataFlowGraph(data.report.dataFlowGraph);
        } else {
          setError("Data flow graph not available for this report");
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-darker text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-400">Loading data flow graph...</p>
        </div>
      </div>
    );
  }

  if (error || !dataFlowGraph) {
    return (
      <div className="min-h-screen bg-darker text-white flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-dark border border-gray-800 rounded-xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold mb-4">Data Flow Not Available</h1>
          <p className="text-gray-400 mb-6">
            {error || "This report doesn't include data flow analysis."}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const { nodes, edges, stats } = dataFlowGraph;

  // Handle both CLI format (sources/sinks as arrays) and expected format (as numbers)
  const sourcesCount = typeof stats.sources === 'number' ? stats.sources : (Array.isArray(stats.sources) ? stats.sources.length : 0);
  const sinksCount = typeof stats.sinks === 'number' ? stats.sinks : (Array.isArray(stats.sinks) ? stats.sinks.length : 0);
  
  // Calculate tainted/sanitized from edges if not provided
  const taintedFlows = stats.taintedFlows ?? edges.filter(e => e.tainted).length;
  const sanitizedFlows = stats.sanitizedFlows ?? edges.filter(e => e.sanitized).length;
  const totalFlows = stats.totalFlows || edges.length;

  // Filter nodes
  const filteredNodes = nodes.filter(node => {
    if (filterType && node.type !== filterType) return false;
    return true;
  });

  // Filter edges
  const filteredEdges = edges.filter(edge => {
    if (!showTainted && edge.tainted) return false;
    if (!showSanitized && edge.sanitized) return false;
    // Only show edges where both nodes are visible
    const fromVisible = filteredNodes.some(n => n.id === edge.from);
    const toVisible = filteredNodes.some(n => n.id === edge.to);
    return fromVisible && toVisible;
  });

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'source': return { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' };
      case 'sink': return { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' };
      case 'function': return { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400' };
      case 'variable': return { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' };
      default: return { bg: 'bg-gray-500/20', border: 'border-gray-500', text: 'text-gray-400' };
    }
  };

  const getNodeConnections = (nodeId: string) => {
    return {
      incoming: edges.filter(e => e.to === nodeId),
      outgoing: edges.filter(e => e.from === nodeId),
    };
  };

  const taintedRate = totalFlows > 0 ? ((taintedFlows / totalFlows) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-darker text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  Data Flow Visualization
                </h1>
                <p className="text-gray-400 text-sm">
                  Interactive analysis • {totalFlows} flows • {sourcesCount} sources → {sinksCount} sinks
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewType('visual')}
                  className={`px-4 py-2 rounded transition ${
                    viewType === 'visual'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`px-4 py-2 rounded transition ${
                    viewType === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-400 font-semibold">{taintedRate}% Tainted</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Controls */}
        <div className="w-80 border-r border-gray-800 bg-dark overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Stats */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <div className="text-xs text-gray-500">Total Flows</div>
                  <div className="text-xl font-bold text-white">{totalFlows}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-red-500/30">
                  <div className="text-xs text-red-400">Tainted</div>
                  <div className="text-xl font-bold text-red-400">{taintedFlows}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-green-500/30">
                  <div className="text-xs text-green-400">Sanitized</div>
                  <div className="text-xl font-bold text-green-400">{sanitizedFlows}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <div className="text-xs text-gray-500">Nodes</div>
                  <div className="text-xl font-bold text-white">{nodes.length}</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Filters</h3>
              
              {/* Node Type Filter */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Node Type</label>
                <select
                  value={filterType || ''}
                  onChange={(e) => setFilterType(e.target.value || null)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">All Types</option>
                  <option value="source">Sources</option>
                  <option value="sink">Sinks</option>
                  <option value="function">Functions</option>
                  <option value="variable">Variables</option>
                </select>
              </div>

              {/* Flow Type Filters */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTainted}
                    onChange={(e) => setShowTainted(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-900"
                  />
                  <span className="text-sm text-red-400">Show Tainted Flows</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSanitized}
                    onChange={(e) => setShowSanitized(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-900"
                  />
                  <span className="text-sm text-green-400">Show Sanitized Flows</span>
                </label>
              </div>
            </div>

            {/* Legend */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-400">Source (input)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-400">Sink (output)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-400">Function</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-400">Variable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-red-500"></div>
                  <span className="text-gray-400">Tainted path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-green-500"></div>
                  <span className="text-gray-400">Sanitized path</span>
                </div>
              </div>
            </div>

            {/* Node Info */}
            {selectedNode && (
              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-lg font-bold text-white mb-4">Selected Node</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Type</div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getNodeTypeColor(selectedNode.type).bg} ${getNodeTypeColor(selectedNode.type).text}`}>
                      {selectedNode.type}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Label</div>
                    <code className="text-sm text-white">{selectedNode.label}</code>
                  </div>
                  {selectedNode.dataType && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Data Type</div>
                      <code className="text-sm text-purple-400">{selectedNode.dataType}</code>
                    </div>
                  )}
                  {selectedNode.file && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Location</div>
                      <div className="text-xs text-gray-400">
                        {selectedNode.file}{selectedNode.line ? `:${selectedNode.line}` : ''}
                      </div>
                    </div>
                  )}
                  {(() => {
                    const connections = getNodeConnections(selectedNode.id);
                    return (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Connections</div>
                        <div className="text-xs text-gray-400">
                          {connections.incoming.length} incoming • {connections.outgoing.length} outgoing
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Graph Visualization */}
        <div className="flex-1 overflow-auto p-6">
          {viewType === 'visual' ? (
            /* Visual Flow Graph */
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Visual Graph Container */}
              <div className="bg-dark border border-gray-800 rounded-xl p-8 min-h-[600px]">
                {/* SVG Flow Diagram */}
                <div className="w-full h-full relative">
                  {/* Three-Column Layout: Sources → Flow → Sinks */}
                  <div className="grid grid-cols-3 gap-8 h-full">
                    {/* Sources Column */}
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-blue-400 flex items-center justify-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          Sources ({filteredNodes.filter(n => n.type === 'source').length})
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {filteredNodes.filter(n => n.type === 'source').map((node, idx) => {
                          const connections = getNodeConnections(node.id);
                          const colors = getNodeTypeColor(node.type);
                          return (
                            <motion.div
                              key={node.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => setSelectedNode(node)}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition relative ${colors.bg} ${
                                selectedNode?.id === node.id ? colors.border : 'border-transparent hover:border-gray-700'
                              }`}
                              whileHover={{ scale: 1.05, x: 5 }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <code className={`text-xs ${colors.text} font-mono font-bold truncate`}>
                                  {node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label}
                                </code>
                              </div>
                              {node.dataType && (
                                <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded">
                                  {node.dataType}
                                </span>
                              )}
                              {connections.outgoing.length > 0 && (
                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                                  {connections.outgoing.length}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Flow Column (Intermediate Nodes) */}
                    <div className="space-y-4 border-x border-gray-800/50 px-4">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-purple-400">
                          Data Flow ({filteredEdges.length} paths)
                        </h3>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <div className="h-1 w-12 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Show intermediate nodes */}
                      <div className="space-y-2">
                        {filteredNodes.filter(n => n.type === 'function' || n.type === 'variable').slice(0, 10).map((node, idx) => {
                          const connections = getNodeConnections(node.id);
                          const colors = getNodeTypeColor(node.type);
                          const hasTaintedFlow = connections.incoming.some(e => e.tainted) || connections.outgoing.some(e => e.tainted);
                          
                          return (
                            <motion.div
                              key={node.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.03 }}
                              onClick={() => setSelectedNode(node)}
                              className={`p-3 rounded-lg border cursor-pointer transition ${colors.bg} ${
                                selectedNode?.id === node.id ? colors.border + ' border-2' : 'border-transparent hover:border-gray-700'
                              }`}
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <code className={`text-[10px] ${colors.text} font-mono truncate`}>
                                  {node.label.length > 15 ? node.label.substring(0, 15) + '...' : node.label}
                                </code>
                                {hasTaintedFlow && (
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                                <span>{connections.incoming.length}→</span>
                                <span className="text-gray-700">|</span>
                                <span>→{connections.outgoing.length}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                        {filteredNodes.filter(n => n.type === 'function' || n.type === 'variable').length > 10 && (
                          <div className="text-center text-xs text-gray-500 py-2">
                            +{filteredNodes.filter(n => n.type === 'function' || n.type === 'variable').length - 10} more nodes
                          </div>
                        )}
                      </div>

                      {/* Flow Statistics */}
                      <div className="mt-6 space-y-2">
                        <div className="flex items-center justify-between p-2 bg-red-500/10 rounded border border-red-500/30">
                          <span className="text-xs text-red-400">Tainted Flows</span>
                          <span className="text-sm font-bold text-red-400">{taintedFlows}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/30">
                          <span className="text-xs text-green-400">Sanitized Flows</span>
                          <span className="text-sm font-bold text-green-400">{sanitizedFlows}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sinks Column */}
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-red-400 flex items-center justify-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          Sinks ({filteredNodes.filter(n => n.type === 'sink').length})
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {filteredNodes.filter(n => n.type === 'sink').map((node, idx) => {
                          const connections = getNodeConnections(node.id);
                          const colors = getNodeTypeColor(node.type);
                          const hasTaintedInput = connections.incoming.some(e => e.tainted);
                          
                          return (
                            <motion.div
                              key={node.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => setSelectedNode(node)}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition relative ${colors.bg} ${
                                selectedNode?.id === node.id ? colors.border : 'border-transparent hover:border-gray-700'
                              } ${hasTaintedInput ? 'ring-2 ring-red-500/50' : ''}`}
                              whileHover={{ scale: 1.05, x: -5 }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {hasTaintedInput && (
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                )}
                                <code className={`text-xs ${colors.text} font-mono font-bold truncate`}>
                                  {node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label}
                                </code>
                              </div>
                              {hasTaintedInput && (
                                <div className="text-[10px] text-red-400 font-semibold">
                                  ⚠ Receives tainted data
                                </div>
                              )}
                              {connections.incoming.length > 0 && (
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                                  {connections.incoming.length}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flow Path Explorer */}
              <div className="bg-dark border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Flow Path Analysis</h3>
                <div className="space-y-3">
                  {filteredEdges.slice(0, 10).map((edge, idx) => {
                    const fromNode = nodes.find(n => n.id === edge.from);
                    const toNode = nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-lg border ${
                          edge.tainted
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-green-500/10 border-green-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <code className="text-xs text-blue-400 flex-1 truncate">
                            {fromNode.label}
                          </code>
                          <div className="flex items-center gap-1">
                            <div className={`h-1 w-12 ${edge.tainted ? 'bg-red-500' : 'bg-green-500'} rounded-full`}></div>
                            <svg className={`w-4 h-4 ${edge.tainted ? 'text-red-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <code className="text-xs text-red-400 flex-1 truncate">
                            {toNode.label}
                          </code>
                          <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                            edge.tainted ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {edge.tainted ? 'TAINTED' : 'SAFE'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                  {filteredEdges.length > 10 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      +{filteredEdges.length - 10} more flows
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="max-w-6xl mx-auto">
              {/* Node Grid Visualization */}
              <div className="grid gap-6">
                {/* Sources */}
                {filteredNodes.filter(n => n.type === 'source').length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      Sources ({filteredNodes.filter(n => n.type === 'source').length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredNodes.filter(n => n.type === 'source').map(node => {
                        const connections = getNodeConnections(node.id);
                        const colors = getNodeTypeColor(node.type);
                        return (
                          <motion.div
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition ${colors.bg} ${
                              selectedNode?.id === node.id ? colors.border : 'border-transparent hover:border-gray-700'
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <code className={`text-sm ${colors.text} font-mono truncate block`}>
                                  {node.label}
                                </code>
                                {node.dataType && (
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                                    {node.dataType}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {connections.outgoing.length} →
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Flow Indicator */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"></div>
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Sinks */}
                {filteredNodes.filter(n => n.type === 'sink').length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      Sinks ({filteredNodes.filter(n => n.type === 'sink').length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredNodes.filter(n => n.type === 'sink').map(node => {
                        const connections = getNodeConnections(node.id);
                        const colors = getNodeTypeColor(node.type);
                        return (
                          <motion.div
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition ${colors.bg} ${
                              selectedNode?.id === node.id ? colors.border : 'border-transparent hover:border-gray-700'
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <code className={`text-sm ${colors.text} font-mono truncate block`}>
                                  {node.label}
                                </code>
                              </div>
                              <div className="text-xs text-gray-500">
                                ← {connections.incoming.length}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Intermediates (Functions & Variables) */}
                {(filteredNodes.filter(n => n.type === 'function' || n.type === 'variable').length > 0) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-400 mb-3">
                      Intermediate Nodes ({filteredNodes.filter(n => n.type === 'function' || n.type === 'variable').length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {filteredNodes.filter(n => n.type === 'function' || n.type === 'variable').map(node => {
                        const colors = getNodeTypeColor(node.type);
                        return (
                          <motion.div
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition ${colors.bg} ${
                              selectedNode?.id === node.id ? colors.border : 'border-transparent hover:border-gray-700'
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <code className={`text-xs ${colors.text} font-mono truncate block`}>
                              {node.label}
                            </code>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
