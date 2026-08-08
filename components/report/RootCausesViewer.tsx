"use client";

import { motion } from "framer-motion";
import { RootCause } from "@/types/report";

interface RootCausesViewerProps {
  rootCauses: RootCause[];
  onAskAI?: (context: { rootCause: RootCause }) => void;
}

export default function RootCausesViewer({ rootCauses, onAskAI }: RootCausesViewerProps) {
  if (!rootCauses || rootCauses.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getExploitabilityColor = (exploitability: string) => {
    switch (exploitability) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            Root Causes Analysis
          </h2>
          <p className="text-gray-400 mt-1">
            {rootCauses.length} {rootCauses.length === 1 ? 'root cause' : 'root causes'} identified
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-purple-400 font-semibold">Intelligence Layer</span>
        </div>
      </div>

      <div className="grid gap-4">
        {rootCauses.map((rootCause, index) => (
          <motion.div
            key={rootCause.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-dark border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(rootCause.impact?.severity || 'low')}`}>
                    {(rootCause.impact?.severity || 'unknown').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getExploitabilityColor(rootCause.impact?.exploitability || 'low')}`}>
                    {rootCause.impact?.exploitability || 'unknown'} exploitability
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{rootCause.title}</h3>
              </div>
              {onAskAI && (
                <button
                  onClick={() => onAskAI({ rootCause })}
                  className="flex-shrink-0 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition flex items-center gap-2"
                >
                  <span>🤖</span>
                  <span className="hidden sm:inline">Ask AI</span>
                </button>
              )}
            </div>

            {/* Source */}
            <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">Origin Source</div>
              <code className="text-sm text-purple-400">{rootCause.source}</code>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                <div className="text-xs text-gray-500">Attack Paths</div>
                <div className="text-xl font-bold text-red-400">{rootCause.attackPaths?.length || 0}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                <div className="text-xs text-gray-500">Affected Files</div>
                <div className="text-xl font-bold text-orange-400">{rootCause.impact?.affectedFiles?.length || 0}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                <div className="text-xs text-gray-500">Related Issues</div>
                <div className="text-xl font-bold text-yellow-400">{rootCause.relatedIssueIds?.length || 0}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                <div className="text-xs text-gray-500">Criticality</div>
                <div className="text-xl font-bold text-purple-400">{rootCause.impact?.criticalityScore || 0}/100</div>
              </div>
            </div>

            {/* Why It Exists */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Why This Exists
              </div>
              <p className="text-gray-300 text-sm">{rootCause.whyItExists}</p>
            </div>

            {/* Attack Types */}
            {rootCause.impact?.attackTypes && rootCause.impact.attackTypes.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-400 mb-2">Attack Types</div>
                <div className="flex flex-wrap gap-2">
                  {rootCause.impact.attackTypes.map((type, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/30">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Fix Strategy */}
            {rootCause.fixStrategy && rootCause.fixStrategy.length > 0 && (
              <div className="border-t border-gray-800 pt-4">
                <div className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fix Strategy
                </div>
                <ul className="space-y-2">
                  {rootCause.fixStrategy.map((strategy, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sample Attack Path (First one) */}
            {rootCause.attackPaths && rootCause.attackPaths.length > 0 && (
              <details className="mt-4 border-t border-gray-800 pt-4">
                <summary className="text-sm font-semibold text-gray-400 cursor-pointer hover:text-white transition">
                  View Sample Attack Path ({rootCause.attackPaths.length} total)
                </summary>
                <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <span className="text-red-400 font-mono">{rootCause.attackPaths[0]?.source || 'unknown'}</span>
                    <span>→</span>
                    <span className="text-yellow-400">{rootCause.attackPaths[0]?.path?.length || 0} steps</span>
                    <span>→</span>
                    <span className="text-orange-400 font-mono">{rootCause.attackPaths[0]?.sink || 'unknown'}</span>
                  </div>
                  {rootCause.attackPaths[0]?.dataType && (
                    <div className="text-xs text-purple-400">
                      Data Type: <span className="font-mono">{rootCause.attackPaths[0].dataType}</span>
                    </div>
                  )}
                </div>
              </details>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
