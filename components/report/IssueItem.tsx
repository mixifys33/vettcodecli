"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, memo } from "react";

interface IssueItemProps {
  finding: any;
  index: number;
}

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

function IssueItem({ finding, index }: IssueItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className="border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
    >
      {/* Collapsed View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
            severityColors[finding.severity] || severityColors.low
          }`}>
            {finding.severity}
          </span>
          <span className="font-medium truncate">{finding.title}</span>
          {finding.file && finding.line && (
            <span className="text-xs text-gray-500 font-mono truncate">
              {finding.file.split('/').pop()}:{finding.line}
            </span>
          )}
        </div>
        <motion.svg
          className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
              {/* Description */}
              {finding.description && (
                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-2">Description</div>
                  <p className="text-sm text-gray-300">{finding.description}</p>
                </div>
              )}

              {/* File Location */}
              {finding.file && (
                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-2">Location</div>
                  <div className="font-mono text-sm bg-gray-900 px-3 py-2 rounded border border-gray-800">
                    📄 {finding.file}
                    {finding.line && <span className="text-gray-500"> (Line {finding.line})</span>}
                  </div>
                </div>
              )}

              {/* Code Evidence */}
              {finding.evidence && (
                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-2">Code Snippet</div>
                  <pre className="text-xs bg-gray-900 border border-gray-800 rounded p-3 overflow-x-auto">
                    <code className="text-gray-300">{finding.evidence}</code>
                  </pre>
                </div>
              )}

              {/* Mitigation & Prevention */}
              <div className="grid md:grid-cols-2 gap-4">
                {finding.mitigation && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <div className="text-blue-400 font-semibold text-sm mb-2 flex items-center gap-2">
                      <span>🔧</span> How to Fix
                    </div>
                    <p className="text-xs text-gray-300">{finding.mitigation}</p>
                  </div>
                )}
                {finding.prevention && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="text-primary font-semibold text-sm mb-2 flex items-center gap-2">
                      <span>🛡️</span> Prevention
                    </div>
                    <p className="text-xs text-gray-300">{finding.prevention}</p>
                  </div>
                )}
              </div>

              {/* Category Badge */}
              {finding.category && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Category:</span>
                  <span className="text-xs px-2 py-1 bg-gray-800 rounded">
                    {finding.category}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(IssueItem);
