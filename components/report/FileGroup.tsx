"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, memo } from "react";
import IssueItem from "./IssueItem";

interface FileGroupProps {
  fileName: string;
  issues: any[];
  isExpanded: boolean;
  onToggle: () => void;
  severity?: string;
  category?: string;
  onAskAI?: (context: {
    severity?: string;
    category?: string;
    file?: string;
    issue?: any;
  }) => void;
}

function FileGroup({ fileName, issues, isExpanded, onToggle, severity, category, onAskAI }: FileGroupProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedIssues = showAll ? issues : issues.slice(0, 5);
  const hasMore = issues.length > 5;

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      {/* File Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-900 transition-colors group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.svg
            className="w-5 h-5 text-gray-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </motion.svg>
          <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <span className="font-mono text-sm truncate group-hover:text-primary transition-colors">
            {fileName}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Ask AI Button */}
          {onAskAI && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAskAI({ severity, category, file: fileName });
              }}
              className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded border border-purple-500/30 transition flex items-center gap-1 text-xs font-medium"
              title="Ask AI about this file"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
            {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
          </span>
        </div>
      </button>

      {/* Issues List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-2 bg-gray-900/20">
              {displayedIssues.map((issue, idx) => (
                <IssueItem key={idx} finding={issue} index={idx} />
              ))}
              
              {/* Show More Button */}
              {hasMore && !showAll && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(true);
                  }}
                  className="w-full py-3 text-sm text-primary hover:text-secondary border border-gray-800 hover:border-primary/50 rounded-lg transition-all"
                >
                  Show {issues.length - 5} more issues
                </button>
              )}
              
              {showAll && hasMore && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(false);
                  }}
                  className="w-full py-3 text-sm text-gray-400 hover:text-gray-300 border border-gray-800 hover:border-gray-700 rounded-lg transition-all"
                >
                  Show less
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(FileGroup);
