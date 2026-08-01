"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, memo } from "react";
import FileGroup from "./FileGroup";

interface CategoryGroupProps {
  category: string;
  fileGroups: Record<string, any[]>;
  isExpanded: boolean;
  onToggle: () => void;
  severity?: string;
  onAskAI?: (context: {
    severity?: string;
    category?: string;
    file?: string;
    issue?: any;
  }) => void;
}

const categoryIcons: Record<string, string> = {
  security: "🔒",
  authentication: "🔑",
  injection: "💉",
  "sql-injection": "🗄️",
  xss: "⚠️",
  csrf: "🎭",
  "sensitive-data": "🔐",
  cryptography: "🔐",
  authorization: "👮",
  "input-validation": "✅",
  "file-upload": "📤",
  default: "🐛",
};

function CategoryGroup({ category, fileGroups, isExpanded, onToggle, severity, onAskAI }: CategoryGroupProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  
  const totalIssues = Object.values(fileGroups).reduce((sum, issues) => sum + issues.length, 0);
  const fileCount = Object.keys(fileGroups).length;
  
  const icon = categoryIcons[category.toLowerCase()] || categoryIcons.default;

  const toggleFile = (fileName: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileName)) {
      newExpanded.delete(fileName);
    } else {
      newExpanded.add(fileName);
    }
    setExpandedFiles(newExpanded);
  };

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.svg
            className="w-6 h-6 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </motion.svg>
          <span className="text-xl flex-shrink-0">{icon}</span>
          <span className="font-semibold text-lg capitalize truncate group-hover:text-primary transition-colors">
            {category.replace(/-/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Ask AI Button */}
          {onAskAI && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAskAI({ severity, category });
              }}
              className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded border border-purple-500/30 transition flex items-center gap-1.5 text-xs font-medium"
              title="Ask AI about this category"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden lg:inline">AI</span>
            </button>
          )}
          <span className="text-sm text-gray-400">
            {fileCount} {fileCount === 1 ? 'file' : 'files'}
          </span>
          <span className="text-xs px-3 py-1 bg-gray-700 rounded-full font-semibold">
            {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'}
          </span>
        </div>
      </button>

      {/* Files List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 bg-gray-900/30">
              {Object.entries(fileGroups)
                .sort(([, issuesA], [, issuesB]) => issuesB.length - issuesA.length)
                .map(([fileName, issues]) => (
                  <FileGroup
                    key={fileName}
                    fileName={fileName}
                    issues={issues}
                    isExpanded={expandedFiles.has(fileName)}
                    onToggle={() => toggleFile(fileName)}
                    severity={severity}
                    category={category}
                    onAskAI={onAskAI}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(CategoryGroup);
