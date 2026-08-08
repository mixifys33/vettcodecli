"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DataFlowGraph, DataFlowNode } from "@/types/report";
import InteractiveFlowGraph from "@/components/report/InteractiveFlowGraph";

export default function DataFlowVisualizationPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  
  const [dataFlowGraph, setDataFlowGraph] = useState<DataFlowGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<DataFlowNode | null>(null);
  const [selectedPath, setSelectedPath] = useState<any>(null);

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
          <p className="text-gray-400">Loading data flow visualization...</p>
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
  const taintedFlows = stats.taintedFlows ?? edges.filter(e => e.tainted && !e.sanitized).length;
  const sanitizedFlows = stats.sanitizedFlows ?? edges.filter(e => e.sanitized).length;
  const totalFlows = stats.totalFlows || edges.length;
  const taintedRate = totalFlows > 0 ? ((taintedFlows / totalFlows) * 100).toFixed(1) : '0';

  // Get vulnerable paths (tainted sources to sinks)
  const vulnerablePaths = edges
    .filter(e => e.tainted && !e.sanitized)
    .map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.from);
      const sinkNode = nodes.find(n => n.id === edge.to);
      return {
        edge,
        source: sourceNode,
        sink: sinkNode,
      };
    })
    .filter(p => p.source && p.sink);

  return (
    <div className="min-h-screen bg-darker text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
                  <span className="text-3xl">🔍</span>
                  Interactive Data Flow Analysis
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Visual security analysis • {totalFlows} flows • {sourcesCount} entry points → {sinksCount} danger zones
                </p>
              </div>
            </div>

            {/* Stats Pills */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-red-400">{taintedFlows} Vulnerable</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-green-400">{sanitizedFlows} Safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sidebar - Analysis & Details */}
          <div className="xl:col-span-1 space-y-6">
            {/* Security Summary */}
            <div className="bg-dark border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Security Status
              </h3>
              
              
              {/* Risk Level */}
              <div className={`p-4 rounded-lg mb-4 ${
                taintedFlows > 10 ? 'bg-red-500/20 border border-red-500/30' :
                taintedFlows > 0 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                'bg-green-500/20 border border-green-500/30'
              }`}>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    taintedFlows > 10 ? 'text-red-400' :
                    taintedFlows > 0 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {taintedRate}%
                  </div>
                  <div className="text-sm text-gray-400">Risk Level</div>
                  <div className={`text-xs font-semibold mt-2 ${
                    taintedFlows > 10 ? 'text-red-400' :
                    taintedFlows > 0 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {taintedFlows > 10 ? 'CRITICAL' :
                     taintedFlows > 0 ? 'MODERATE' :
                     'SECURE'}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-400">{sourcesCount}</div>
                  <div className="text-xs text-gray-400">Entry Points</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-400">{sinksCount}</div>
                  <div className="text-xs text-gray-400">Danger Zones</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-400">{taintedFlows}</div>
                  <div className="text-xs text-gray-400">Vulnerable</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">{sanitizedFlows}</div>
                  <div className="text-xs text-gray-400">Protected</div>
                </div>
              </div>
            </div>

            {/* Vulnerable Paths List */}
            {vulnerablePaths.length > 0 && (
              <div className="bg-dark border border-gray-800 rounded-xl p-6 max-h-[500px] overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 sticky top-0 bg-dark pb-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Vulnerable Paths ({vulnerablePaths.length})
                </h3>

                <div className="space-y-3">
                  {vulnerablePaths.map((path, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedPath(path)}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        selectedPath === path
                          ? 'bg-red-500/20 border-red-500'
                          : 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-red-400 mb-1">Path #{idx + 1}</div>
                          <div className="space-y-1">
                            <div>
                              <span className="text-xs text-gray-500">From:</span>
                              <code className="text-xs text-blue-400 ml-1 block truncate">{path.source?.label}</code>
                              {path.source?.dataType && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded">
                                  {path.source.dataType}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-red-500">
                              <div className="h-px flex-1 bg-red-500"></div>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">To:</span>
                              <code className="text-xs text-red-400 ml-1 block truncate">{path.sink?.label}</code>
                            </div>
                          </div>
                        </div>
                      </div>
                      {path.edge.label && (
                        <div className="mt-2 text-xs text-gray-400 bg-gray-900/50 rounded p-2">
                          {path.edge.label}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Node Details */}
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-dark border border-gray-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Node Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Type</div>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                      selectedNode.type === 'source' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      selectedNode.type === 'sink' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      selectedNode.type === 'function' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {selectedNode.type.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Identifier</div>
                    <code className="text-sm text-white bg-gray-900/50 rounded px-3 py-2 block break-all">
                      {selectedNode.label}
                    </code>
                  </div>

                  {selectedNode.dataType && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Sensitive Data Type</div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-sm font-semibold text-purple-400">{selectedNode.dataType}</span>
                      </div>
                    </div>
                  )}

                  {selectedNode.file && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Location</div>
                      <div className="bg-gray-900/50 rounded px-3 py-2">
                        <div className="text-xs text-gray-400 break-all">
                          {selectedNode.file}
                          {selectedNode.line && <span className="text-blue-400">:{selectedNode.line}</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Legend */}
            <div className="bg-dark border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Legend</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-semibold text-gray-300 mb-2">Node Types:</div>
                  <div className="space-y-2 ml-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-blue-400">Source (Entry Point)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-red-400">Sink (Danger Zone)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span className="text-purple-400">Function</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span className="text-yellow-400">Variable</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-300 mb-2">Flow Types:</div>
                  <div className="space-y-2 ml-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-red-500"></div>
                      <span className="text-red-400">Vulnerable (Tainted)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-green-500" style={{backgroundImage: 'repeating-linear-gradient(90deg, #10b981 0, #10b981 3px, transparent 3px, transparent 6px)'}}></div>
                      <span className="text-green-400">Safe (Sanitized)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Graph Area */}
          <div className="xl:col-span-3">
            <div className="bg-dark border border-gray-800 rounded-xl p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-2">Interactive Flow Graph</h2>
                <p className="text-sm text-gray-400">
                  Click nodes for details • Zoom and pan • Red arrows = vulnerable paths
                </p>
              </div>

              {/* Graph */}
              <InteractiveFlowGraph
                nodes={nodes}
                edges={edges}
                onNodeClick={setSelectedNode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
