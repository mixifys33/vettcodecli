"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface CompactReportHeaderProps {
  report: any;
  severityCounts: Record<string, number>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeSeverity: string | null;
  onSeverityClick: (severity: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  filteredCount: number;
  totalCount: number;
}

const severityConfig = {
  critical: { icon: "🔴", color: "red" },
  high: { icon: "🟠", color: "orange" },
  medium: { icon: "🟡", color: "yellow" },
  low: { icon: "🟢", color: "blue" },
};

export default function CompactReportHeader({
  report,
  severityCounts,
  searchQuery,
  onSearchChange,
  activeSeverity,
  onSeverityClick,
  onClearFilters,
  hasActiveFilters,
  filteredCount,
  totalCount,
}: CompactReportHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-4 flex-1 min-w-0">
      {/* Score Badge */}
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-900/80 rounded-lg border border-gray-700 flex-shrink-0">
        <span className={`text-lg font-bold ${getScoreColor(report.score)}`}>
          {report.score}
        </span>
        <span className="text-xs text-gray-500">/</span>
        <span className="text-sm font-semibold text-gray-400">{report.grade}</span>
      </div>

      {/* Severity Counts */}
      <div className="hidden lg:flex items-center gap-2">
        {Object.entries(severityConfig).map(([severity, config]) => {
          const count = severityCounts[severity] || 0;
          if (count === 0) return null;
          
          const isActive = activeSeverity === severity;
          
          return (
            <button
              key={severity}
              onClick={() => onSeverityClick(severity)}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                isActive
                  ? `bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/50`
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-transparent"
              }`}
            >
              <span className="text-sm">{config.icon}</span>
              <span>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search Toggle & Input */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {!showSearch ? (
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
            title="Search"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        ) : (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            className="flex-1 relative"
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="w-full px-3 py-1.5 bg-gray-900 text-white text-sm border border-gray-700 rounded-lg focus:border-primary focus:outline-none placeholder-gray-500"
            />
            <button
              onClick={() => {
                setShowSearch(false);
                onSearchChange("");
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              ×
            </button>
          </motion.div>
        )}
      </div>

      {/* Results Count */}
      {hasActiveFilters && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="hidden md:flex items-center gap-2 text-xs text-gray-500 px-2 py-1 bg-gray-900/50 rounded-md flex-shrink-0"
        >
          <span>{filteredCount} / {totalCount}</span>
        </motion.div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={onClearFilters}
          className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition whitespace-nowrap flex-shrink-0"
        >
          Clear
        </motion.button>
      )}
    </div>
  );
}
