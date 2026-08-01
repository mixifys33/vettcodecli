"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import ReportSummary from "./report/ReportSummary";
import SeverityGroup from "./report/SeverityGroup";

interface HierarchicalReportViewerProps {
  report: any;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeSeverityFilter?: string | null;
  onSeverityFilterChange?: (severity: string | null) => void;
  hideHeader?: boolean;
}

// Transform flat findings into hierarchical structure
function transformFindings(findings: any[]) {
  const hierarchy: Record<string, Record<string, Record<string, any[]>>> = {};
  
  findings.forEach((finding) => {
    const severity = finding.severity || "low";
    const category = finding.category || "uncategorized";
    const file = finding.file || "unknown";
    
    if (!hierarchy[severity]) {
      hierarchy[severity] = {};
    }
    if (!hierarchy[severity][category]) {
      hierarchy[severity][category] = {};
    }
    if (!hierarchy[severity][category][file]) {
      hierarchy[severity][category][file] = [];
    }
    
    hierarchy[severity][category][file].push(finding);
  });
  
  return hierarchy;
}

export default function HierarchicalReportViewer({ 
  report,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  activeSeverityFilter: externalSeverityFilter,
  onSeverityFilterChange: externalOnSeverityFilterChange,
  hideHeader = false,
}: HierarchicalReportViewerProps) {
  const [expandedSeverities, setExpandedSeverities] = useState<Set<string>>(new Set());
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalSeverityFilter, setInternalSeverityFilter] = useState<string | null>(null);

  // Use external state if provided, otherwise use internal state
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = externalOnSearchChange || setInternalSearchQuery;
  
  const activeSeverityFilter = externalSeverityFilter !== undefined ? externalSeverityFilter : internalSeverityFilter;
  const setActiveSeverityFilter = externalOnSeverityFilterChange || setInternalSeverityFilter;

  // Calculate severity counts
  const severityCounts = useMemo(() => {
    return {
      critical: report.findings.filter((f: any) => f.severity === "critical").length,
      high: report.findings.filter((f: any) => f.severity === "high").length,
      medium: report.findings.filter((f: any) => f.severity === "medium").length,
      low: report.findings.filter((f: any) => f.severity === "low").length,
    };
  }, [report.findings]);

  // Filter findings based on search and severity
  const filteredFindings = useMemo(() => {
    return report.findings.filter((finding: any) => {
      // Severity filter
      if (activeSeverityFilter && finding.severity !== activeSeverityFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          finding.title?.toLowerCase().includes(query) ||
          finding.description?.toLowerCase().includes(query) ||
          finding.file?.toLowerCase().includes(query) ||
          finding.category?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [report.findings, activeSeverityFilter, searchQuery]);

  // Transform filtered findings into hierarchy
  const hierarchy = useMemo(() => {
    return transformFindings(filteredFindings);
  }, [filteredFindings]);

  // Toggle severity expansion
  const toggleSeverity = useCallback((severity: string) => {
    const newExpanded = new Set(expandedSeverities);
    if (newExpanded.has(severity)) {
      newExpanded.delete(severity);
    } else {
      newExpanded.add(severity);
    }
    setExpandedSeverities(newExpanded);
  }, [expandedSeverities]);

  // Handle severity filter click from summary
  const handleSeverityClick = useCallback((severity: string) => {
    if (activeSeverityFilter === severity) {
      setActiveSeverityFilter(null);
      setExpandedSeverities(new Set());
    } else {
      setActiveSeverityFilter(severity);
      setExpandedSeverities(new Set([severity]));
    }
  }, [activeSeverityFilter]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveSeverityFilter(null);
    setSearchQuery("");
    setExpandedSeverities(new Set());
  }, []);

  const severityOrder = ["critical", "high", "medium", "low"];
  const hasActiveFilters = activeSeverityFilter || searchQuery;

  return (
    <div className="space-y-6">
      {/* Summary Header - Only show if not hidden */}
      {!hideHeader && (
        <>
          <ReportSummary
            report={report}
            severityCounts={severityCounts}
            onSeverityClick={handleSeverityClick}
            activeSeverity={activeSeverityFilter}
          />

          {/* Search & Filter Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark border border-gray-800 rounded-xl p-4"
          >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
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
              <input
                type="text"
                placeholder="Search by title, file, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 text-white border border-gray-800 rounded-lg focus:border-primary focus:outline-none placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={clearFilters}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition whitespace-nowrap"
              >
                Clear Filters
              </motion.button>
            )}
            <button
              onClick={() => {
                const allExpanded = severityOrder.every(s => expandedSeverities.has(s));
                if (allExpanded) {
                  setExpandedSeverities(new Set());
                } else {
                  setExpandedSeverities(new Set(severityOrder.filter(s => hierarchy[s])));
                }
              }}
              className="px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg transition whitespace-nowrap"
            >
              {expandedSeverities.size === Object.keys(hierarchy).length ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-gray-800"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {activeSeverityFilter && (
                <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full border border-primary/30 flex items-center gap-2">
                  Severity: {activeSeverityFilter}
                  <button
                    onClick={() => setActiveSeverityFilter(null)}
                    className="hover:text-secondary"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30 flex items-center gap-2">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-blue-300"
                  >
                    ×
                  </button>
                </span>
              )}
              <span className="text-sm text-gray-500">
                ({filteredFindings.length} of {report.findings.length} issues)
              </span>
            </div>
          </motion.div>
        )}
      </>
      )}

      {/* Hierarchical Groups */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark border border-gray-800 rounded-xl p-12 text-center"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Issues Found</h3>
            <p className="text-gray-400">
              {hasActiveFilters
                ? "Try adjusting your filters or search query"
                : "Great job! No security issues detected."}
            </p>
          </motion.div>
        ) : (
          <>
            {severityOrder.map((severity) => {
              if (!hierarchy[severity]) return null;
              
              return (
                <SeverityGroup
                  key={severity}
                  severity={severity}
                  categories={hierarchy[severity]}
                  isExpanded={expandedSeverities.has(severity)}
                  onToggle={() => toggleSeverity(severity)}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Keyboard Shortcuts Info */}
      {filteredFindings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-dark/50 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="font-semibold">💡 Tip:</span>
            <span>Click on any level to expand or collapse. Use search to quickly find specific issues.</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
