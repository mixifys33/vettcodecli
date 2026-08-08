"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Report } from "@/types/report";
import RootCausesViewer from "./RootCausesViewer";
import CodeFixesViewer from "./CodeFixesViewer";
import DataFlowViewer from "./DataFlowViewer";
import BlueprintViewer from "./BlueprintViewer";
import HierarchicalReportViewer from "../HierarchicalReportViewer";

interface StructuredReportViewerProps {
  report: Report;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeSeverityFilter: string | null;
  onSeverityFilterChange: (severity: string | null) => void;
  hideHeader?: boolean;
  onAskAI?: (context: any) => void;
}

type TabType = 'overview' | 'rootCauses' | 'fixes' | 'dataFlow' | 'blueprint' | 'allIssues';

interface Tab {
  id: TabType;
  label: string;
  icon: string;
  badge?: number;
  available: boolean;
  isNew?: boolean;
}

export default function StructuredReportViewer({
  report,
  searchQuery,
  onSearchChange,
  activeSeverityFilter,
  onSeverityFilterChange,
  hideHeader,
  onAskAI,
}: StructuredReportViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Check what features are available
  const isStructured = !!(report.format === 'structured' || report.structured || report.rootCauses);
  const hasRootCauses = !!(report.rootCauses && report.rootCauses.length > 0);
  const hasCodeFixes = !!(report.codeFixes && report.codeFixes.length > 0);
  const hasDataFlow = !!(report.dataFlowGraph && report.dataFlowGraph.nodes && report.dataFlowGraph.nodes.length > 0);
  const hasBlueprint = !!(report.blueprint && report.blueprint.nodes);

  // Define tabs
  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      available: true,
    },
    {
      id: 'rootCauses',
      label: 'Root Causes',
      icon: '🎯',
      badge: report.rootCauses?.length,
      available: hasRootCauses,
      isNew: true,
    },
    {
      id: 'fixes',
      label: 'Code Fixes',
      icon: '🔧',
      badge: report.codeFixes?.length,
      available: hasCodeFixes,
      isNew: true,
    },
    {
      id: 'dataFlow',
      label: 'Data Flow',
      icon: '📊',
      badge: report.dataFlowGraph?.stats?.totalFlows,
      available: hasDataFlow,
      isNew: true,
    },
    {
      id: 'blueprint',
      label: 'Blueprint',
      icon: '🏗️',
      available: hasBlueprint,
      isNew: true,
    },
    {
      id: 'allIssues',
      label: 'All Issues',
      icon: '📋',
      badge: report.findings?.length,
      available: true,
    },
  ];

  // Filter to only available tabs
  const availableTabs = tabs.filter(tab => tab.available);

  return (
    <div className="space-y-6">
      {/* Format Badge */}
      {isStructured && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  New Structured Format
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                    v3.0
                  </span>
                </h3>
                <p className="text-sm text-gray-400">
                  Advanced intelligence: Root cause analysis • Code fixes • Data flow tracking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {hasRootCauses && (
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">{report.rootCauses?.length}</div>
                  <div className="text-xs text-gray-400">Root Causes</div>
                </div>
              )}
              {hasCodeFixes && (
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{report.codeFixes?.length}</div>
                  <div className="text-xs text-gray-400">Fixes</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="bg-dark border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {availableTabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-semibold">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {tab.badge}
                </span>
              )}
              {tab.isNew && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                  NEW
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-dark border border-gray-800 rounded-xl p-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {report.projectName || 'Security Analysis Report'}
                </h2>
                
                {/* Score */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                      report.score >= 80
                        ? 'border-green-500 bg-green-500/10'
                        : report.score >= 60
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-red-500 bg-red-500/10'
                    }`}>
                      <span className={`text-3xl font-bold ${
                        report.score >= 80
                          ? 'text-green-400'
                          : report.score >= 60
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {report.score}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">Grade: {report.grade}</div>
                    <div className="text-gray-400">{report.summary}</div>
                  </div>
                </div>

                {/* Executive Verdict */}
                {report.executiveVerdict && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="text-sm font-semibold text-blue-400 mb-2">Executive Verdict</div>
                    <div className="text-gray-300">{report.executiveVerdict}</div>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-dark border border-gray-800 rounded-xl p-6">
                  <div className="text-gray-400 text-sm mb-2">Total Issues</div>
                  <div className="text-3xl font-bold text-white">{report.findings?.length || 0}</div>
                  {report.metadata?.issueDetector && (
                    <div className="text-xs text-gray-500 mt-1">
                      {report.metadata.issueDetector.confirmedIssues} confirmed
                    </div>
                  )}
                </div>
                
                {report.metadata?.rootCauseAnalysis && (
                  <div className="bg-dark border border-purple-500/30 rounded-xl p-6">
                    <div className="text-purple-400 text-sm mb-2">Root Causes</div>
                    <div className="text-3xl font-bold text-white">
                      {report.metadata.rootCauseAnalysis.rootCausesFound}
                    </div>
                    <div className="text-xs text-purple-400 mt-1">
                      {report.metadata.rootCauseAnalysis.reductionRate} reduction
                    </div>
                  </div>
                )}

                {report.metadata?.fixEngine && (
                  <div className="bg-dark border border-green-500/30 rounded-xl p-6">
                    <div className="text-green-400 text-sm mb-2">Code Fixes</div>
                    <div className="text-3xl font-bold text-white">
                      {report.metadata.fixEngine.fixesGenerated}
                    </div>
                    <div className="text-xs text-green-400 mt-1">
                      {report.metadata.fixEngine.validatedFixes} validated
                    </div>
                  </div>
                )}

                <div className="bg-dark border border-gray-800 rounded-xl p-6">
                  <div className="text-gray-400 text-sm mb-2">Files Scanned</div>
                  <div className="text-3xl font-bold text-white">
                    {report.metadata?.filesScanned || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {report.metadata?.linesScanned?.toLocaleString() || 0} lines
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              {isStructured && (
                <div className="bg-dark border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Quick Access</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {hasRootCauses && (
                      <button
                        onClick={() => setActiveTab('rootCauses')}
                        className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition text-left"
                      >
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="text-white font-semibold">Root Causes</div>
                        <div className="text-purple-400 text-sm">{report.rootCauses?.length} found</div>
                      </button>
                    )}
                    {hasCodeFixes && (
                      <button
                        onClick={() => setActiveTab('fixes')}
                        className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition text-left"
                      >
                        <div className="text-2xl mb-2">🔧</div>
                        <div className="text-white font-semibold">Code Fixes</div>
                        <div className="text-green-400 text-sm">{report.codeFixes?.length} available</div>
                      </button>
                    )}
                    {hasDataFlow && (
                      <button
                        onClick={() => setActiveTab('dataFlow')}
                        className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition text-left"
                      >
                        <div className="text-2xl mb-2">📊</div>
                        <div className="text-white font-semibold">Data Flow</div>
                        <div className="text-blue-400 text-sm">{report.dataFlowGraph?.stats?.totalFlows} flows</div>
                      </button>
                    )}
                    {hasBlueprint && (
                      <button
                        onClick={() => setActiveTab('blueprint')}
                        className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition text-left"
                      >
                        <div className="text-2xl mb-2">🏗️</div>
                        <div className="text-white font-semibold">Blueprint</div>
                        <div className="text-indigo-400 text-sm">Architecture</div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rootCauses' && hasRootCauses && (
            <RootCausesViewer rootCauses={report.rootCauses!} onAskAI={onAskAI} />
          )}

          {activeTab === 'fixes' && hasCodeFixes && (
            <CodeFixesViewer fixes={report.codeFixes!} />
          )}

          {activeTab === 'dataFlow' && hasDataFlow && (
            <div className="space-y-4">
              {/* View Full Visualization Button */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Interactive Flow Graph Visualization</h3>
                      <p className="text-sm text-gray-400">
                        See visual connections, animated flows, and vulnerability paths with {report.dataFlowGraph?.stats?.totalFlows} data flows
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/reports/${report.id}/dataflow`}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition flex items-center gap-2"
                  >
                    Open Graph View
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </motion.div>
              
              <DataFlowViewer dataFlowGraph={report.dataFlowGraph!} />
            </div>
          )}

          {activeTab === 'blueprint' && hasBlueprint && (
            <BlueprintViewer blueprint={report.blueprint!} onAskAI={onAskAI} />
          )}

          {activeTab === 'allIssues' && (
            <HierarchicalReportViewer
              report={report}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              activeSeverityFilter={activeSeverityFilter}
              onSeverityFilterChange={onSeverityFilterChange}
              hideHeader={hideHeader}
              onAskAI={onAskAI}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
