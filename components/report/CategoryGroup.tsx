"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, memo } from "react";
import FileGroup from "./FileGroup";

interface CategoryGroupProps {
  category: string;
  fileGroups: Record<string, any[]>;
  isExpanded: boolean;
  onToggle: () => void;
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

function CategoryGroup({ category, fileGroups, isExpanded, onToggle }: CategoryGroupProps) {
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
