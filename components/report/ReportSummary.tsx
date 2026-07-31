"use client";

import { motion } from "framer-motion";

interface ReportSummaryProps {
  report: any;
  severityCounts: Record<string, number>;
  onSeverityClick: (severity: string) => void;
  activeSeverity: string | null;
}

const severityConfig = {
  critical: { icon: "🔴", color: "red", label: "Critical" },
  high: { icon: "🟠", color: "orange", label: "High" },
  medium: { icon: "🟡", color: "yellow", label: "Medium" },
  low: { icon: "🟢", color: "blue", label: "Low" },
};

export default function ReportSummary({ 
  report, 
  severityCounts, 
  onSeverityClick, 
  activeSeverity 
}: ReportSummaryProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (grade.startsWith('B')) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (grade.startsWith('C')) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (grade.startsWith('D')) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  return (
    <div className="sticky top-0 z-30 bg-darker/95 backdrop-blur-lg border-b border-gray-800 pb-6">
      {/* Score Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{report.projectName}</h1>
            <p className="text-gray-400 text-sm">{report.summary}</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="text-xs text-gray-500">
                Scanned: {new Date(report.createdAt).toLocaleString()}
              </div>
              {report.metadata?.filesScanned && (
                <div className="text-xs text-gray-500">
                  Files: {report.metadata.filesScanned}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(report.score)}`}>
                {report.score}
              </div>
              <div className="text-sm text-gray-500 mt-1">Security Score</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold px-6 py-3 rounded-xl border ${getGradeColor(report.grade)}`}>
                {report.grade}
              </div>
              <div className="text-sm text-gray-500 mt-1">Grade</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Severity Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(severityConfig).map(([severity, config], idx) => {
          const count = severityCounts[severity] || 0;
          const isActive = activeSeverity === severity;
          
          return (
            <motion.button
              key={severity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSeverityClick(severity)}
              className={`relative overflow-hidden rounded-xl p-4 border-2 transition-all ${
                isActive
                  ? `bg-${config.color}-500/20 border-${config.color}-500`
                  : count > 0
                  ? `bg-${config.color}-500/5 border-gray-700 hover:border-${config.color}-500/50`
                  : "bg-gray-800/50 border-gray-800 opacity-50"
              }`}
              whileHover={count > 0 ? { scale: 1.03 } : {}}
              whileTap={count > 0 ? { scale: 0.98 } : {}}
              disabled={count === 0}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{config.icon}</span>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold">{count}</div>
                <div className="text-sm text-gray-400 capitalize mt-1">{config.label}</div>
              </div>
              {count > 0 && !isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
