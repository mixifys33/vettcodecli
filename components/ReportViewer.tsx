"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface ReportViewerProps {
  report: any;
}

export default function ReportViewer({ report }: ReportViewerProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const severityColors: Record<string, string> = {
    critical: "text-red-500 bg-red-500/10 border-red-500/30",
    high: "text-orange-500 bg-orange-500/10 border-orange-500/30",
    medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
    low: "text-gray-500 bg-gray-500/10 border-gray-500/30",
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const filteredFindings = report.findings.filter((finding: any) => {
    const matchesSeverity = filterSeverity === "all" || finding.severity === filterSeverity;
    const matchesSearch = finding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         finding.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const severityCounts = {
    critical: report.findings.filter((f: any) => f.severity === "critical").length,
    high: report.findings.filter((f: any) => f.severity === "high").length,
    medium: report.findings.filter((f: any) => f.severity === "medium").length,
    low: report.findings.filter((f: any) => f.severity === "low").length,
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <motion.div
        className="bg-dark border border-gray-800 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{report.projectName}</h1>
            <p className="text-gray-400">{report.summary}</p>
          </div>
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(report.score)}`}>
              {report.score}
            </div>
            <div className="text-2xl font-semibold text-gray-400">{report.grade}</div>
          </div>
        </div>
      </motion.div>

      {/* Severity Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(severityCounts).map(([severity, count], idx) => (
          <motion.div
            key={severity}
            className={`border rounded-xl p-4 cursor-pointer transition ${
              filterSeverity === severity 
                ? severityColors[severity as keyof typeof severityColors]
                : "bg-dark/50 border-gray-800 hover:border-gray-700"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setFilterSeverity(filterSeverity === severity ? "all" : severity)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-3xl font-bold">{count as number}</div>
            <div className="text-sm capitalize mt-1">{severity}</div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 bg-dark border border-gray-800 rounded-lg focus:border-primary focus:outline-none"
        />
        <button
          onClick={() => {
            setFilterSeverity("all");
            setSearchQuery("");
          }}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
        >
          Clear
        </button>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Issues Found ({filteredFindings.length})
          </h2>
        </div>

        {filteredFindings.map((finding: any, idx: number) => (
          <motion.div
            key={idx}
            className="bg-dark border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="flex items-start gap-4 mb-4">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                severityColors[finding.severity as keyof typeof severityColors]
              }`}>
                {finding.severity}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{finding.title}</h3>
                <p className="text-gray-400 text-sm">{finding.description}</p>
              </div>
            </div>

            {finding.file && (
              <div className="text-sm text-gray-500 mb-3 font-mono">
                📄 {finding.file}:{finding.line}
              </div>
            )}

            {finding.evidence && (
              <div className="bg-darker border border-gray-800 rounded-lg p-4 mb-4">
                <div className="text-xs text-gray-500 mb-2">Code:</div>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{finding.evidence}</code>
                </pre>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {finding.mitigation && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                    <span>🔧</span> Mitigation
                  </div>
                  <p className="text-sm text-gray-300">{finding.mitigation}</p>
                </div>
              )}
              {finding.prevention && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <div className="text-primary font-semibold mb-2 flex items-center gap-2">
                    <span>🛡️</span> Prevention
                  </div>
                  <p className="text-sm text-gray-300">{finding.prevention}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {filteredFindings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <p>No issues found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
