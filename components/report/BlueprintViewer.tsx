"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Blueprint } from "@/types/report";

interface BlueprintViewerProps {
  blueprint: Blueprint;
  onAskAI?: (context: { area: any }) => void;
}

export default function BlueprintViewer({ blueprint, onAskAI }: BlueprintViewerProps) {
  const [selectedRiskArea, setSelectedRiskArea] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'risks' | 'entries'>('overview');

  if (!blueprint) {
    return null;
  }

  const { nodes, edges, entryPoints, riskAreas, meta } = blueprint;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const riskAreasBySeverity = {
    critical: riskAreas.filter(r => r.severity === 'critical'),
    high: riskAreas.filter(r => r.severity === 'high'),
    medium: riskAreas.filter(r => r.severity === 'medium'),
    low: riskAreas.filter(r => r.severity === 'low'),
  };

  const analysisTimeSeconds = (meta.analysisTime / 1000).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🏗️</span>
            Project Blueprint
          </h2>
          <p className="text-gray-400 mt-1">
            Architecture analysis • {meta.totalFiles} files • {meta.totalFunctions} functions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              viewMode === 'overview'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('risks')}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              viewMode === 'risks'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Risk Areas
          </button>
          <button
            onClick={() => setViewMode('entries')}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              viewMode === 'entries'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Entry Points
          </button>
        </div>
      </div>

      {viewMode === 'overview' && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark border border-blue-500/30 rounded-xl p-6">
              <div className="text-blue-400 text-sm mb-2">Total Files</div>
              <div className="text-3xl font-bold text-white">{meta.totalFiles}</div>
            </div>
            <div className="bg-dark border border-purple-500/30 rounded-xl p-6">
              <div className="text-purple-400 text-sm mb-2">Functions</div>
              <div className="text-3xl font-bold text-white">{meta.totalFunctions}</div>
            </div>
            <div className="bg-dark border border-green-500/30 rounded-xl p-6">
              <div className="text-green-400 text-sm mb-2">Entry Points</div>
              <div className="text-3xl font-bold text-white">{entryPoints.length}</div>
            </div>
            <div className="bg-dark border border-red-500/30 rounded-xl p-6">
              <div className="text-red-400 text-sm mb-2">Risk Areas</div>
              <div className="text-3xl font-bold text-white">{riskAreas.length}</div>
            </div>
          </div>

          {/* Architecture Summary */}
          <div className="bg-dark border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Architecture Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400">Files Analyzed</div>
                  <div className="text-2xl font-bold text-white">{meta.totalFiles}</div>
                </div>
                <svg className="w-12 h-12 text-blue-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400">Dependencies</div>
                  <div className="text-2xl font-bold text-white">{edges.length}</div>
                </div>
                <svg className="w-12 h-12 text-purple-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400">Analysis Time</div>
                  <div className="text-2xl font-bold text-white">{analysisTimeSeconds}s</div>
                </div>
                <svg className="w-12 h-12 text-green-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Risk Summary */}
          <div className="bg-dark border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Risk Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-red-400 text-xs mb-1">Critical</div>
                <div className="text-2xl font-bold text-white">{riskAreasBySeverity.critical.length}</div>
              </div>
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="text-orange-400 text-xs mb-1">High</div>
                <div className="text-2xl font-bold text-white">{riskAreasBySeverity.high.length}</div>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="text-yellow-400 text-xs mb-1">Medium</div>
                <div className="text-2xl font-bold text-white">{riskAreasBySeverity.medium.length}</div>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-blue-400 text-xs mb-1">Low</div>
                <div className="text-2xl font-bold text-white">{riskAreasBySeverity.low.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'risks' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{riskAreas.length} risk areas identified</span>
          </div>
          {riskAreas.length === 0 ? (
            <div className="p-8 text-center bg-dark border border-gray-800 rounded-xl">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-white font-semibold">No Risk Areas Found</div>
              <div className="text-gray-400 text-sm">Your architecture looks clean!</div>
            </div>
          ) : (
            <div className="grid gap-3">
              {riskAreas.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`p-4 rounded-xl border cursor-pointer transition ${getSeverityColor(area.severity)} ${
                    selectedRiskArea === area ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedRiskArea(selectedRiskArea === area ? null : area)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(area.severity)}`}>
                          {area.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="font-mono text-sm text-white mb-2 truncate">
                        {area.file}
                      </div>
                      <div className="text-sm text-gray-300">
                        {area.reason}
                      </div>
                    </div>
                    {onAskAI && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskAI({ area });
                        }}
                        className="flex-shrink-0 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition text-xs"
                      >
                        🤖 Ask AI
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'entries' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{entryPoints.length} entry points detected</span>
          </div>
          <div className="grid gap-2">
            {entryPoints.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="p-4 bg-dark border border-gray-800 rounded-xl hover:border-green-500/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <code className="text-sm text-white truncate block">{entry}</code>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Blueprint generated in {analysisTimeSeconds}s
          </span>
          <div className="flex items-center gap-2 text-blue-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Architecture Analyzed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
