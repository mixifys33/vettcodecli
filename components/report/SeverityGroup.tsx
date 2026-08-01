"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, memo } from "react";
import CategoryGroup from "./CategoryGroup";

interface SeverityGroupProps {
  severity: string;
  categories: Record<string, Record<string, any[]>>;
  isExpanded: boolean;
  onToggle: () => void;
  onAskAI?: (context: {
    severity?: string;
    category?: string;
    file?: string;
    issue?: any;
  }) => void;
}

const severityConfig: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  critical: {
    icon: "🔴",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  high: {
    icon: "🟠",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  medium: {
    icon: "🟡",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  low: {
    icon: "🟢",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
};

function SeverityGroup({ severity, categories, isExpanded, onToggle, onAskAI }: SeverityGroupProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const config = severityConfig[severity] || severityConfig.low;
  
  // Calculate totals
  const categoryCount = Object.keys(categories).length;
  const totalFiles = Object.values(categories).reduce(
    (sum, fileGroups) => sum + Object.keys(fileGroups).length,
    0
  );
  const totalIssues = Object.values(categories).reduce(
    (sum, fileGroups) => sum + Object.values(fileGroups).reduce((s, issues) => s + issues.length, 0),
    0
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 rounded-xl overflow-hidden ${config.border} ${config.bg}`}
    >
      {/* Severity Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-5 hover:bg-gray-900/30 transition-colors group`}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <motion.svg
            className={`w-7 h-7 flex-shrink-0 ${config.color}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </motion.svg>
          <span className="text-2xl flex-shrink-0">{config.icon}</span>
          <div className="text-left flex-1 min-w-0">
            <h2 className={`text-xl font-bold capitalize ${config.color} group-hover:text-primary transition-colors`}>
              {severity} Priority
            </h2>
            <p className="text-sm text-gray-400">
              {categoryCount} {categoryCount === 1 ? 'category' : 'categories'} • {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Ask AI Button */}
          {onAskAI && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAskAI({ severity });
              }}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg border border-purple-500/30 transition flex items-center gap-2 text-sm font-medium"
              title="Ask AI about these issues"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden md:inline">Ask AI</span>
            </button>
          )}
          <div className={`text-3xl font-bold ${config.color}`}>
            {totalIssues}
          </div>
          <span className="text-sm text-gray-500">issues</span>
        </div>
      </button>

      {/* Categories List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-gray-800"
          >
            <div className="p-5 space-y-4 bg-darker/50">
              {Object.entries(categories)
                .sort(([, filesA], [, filesB]) => {
                  const issuesA = Object.values(filesA).reduce((sum, issues) => sum + issues.length, 0);
                  const issuesB = Object.values(filesB).reduce((sum, issues) => sum + issues.length, 0);
                  return issuesB - issuesA;
                })
                .map(([category, fileGroups]) => (
                  <CategoryGroup
                    key={category}
                    category={category}
                    fileGroups={fileGroups}
                    isExpanded={expandedCategories.has(category)}
                    onToggle={() => toggleCategory(category)}
                    severity={severity}
                    onAskAI={onAskAI}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(SeverityGroup);
