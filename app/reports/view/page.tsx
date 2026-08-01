"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import HierarchicalReportViewer from "@/components/HierarchicalReportViewer";
import AIAssistant from "@/components/AIAssistant";
import ResizablePanel from "@/components/ResizablePanel";
import { useReportFilters } from "@/hooks/useReportFilters";
import { saveLocalReport } from "@/lib/localReportStorage";
import { toast } from "sonner";
import { decode } from "js-base64";

/**
 * External Report Viewer
 * 
 * This page receives report data from external sources (like the web scanner)
 * via URL parameters and displays it in the unified report viewer.
 * 
 * Users can optionally save the report locally for future access.
 */

function ReportViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [aiInitialMessage, setAiInitialMessage] = useState<string | undefined>(undefined);
  const [aiContext, setAiContext] = useState<any>(undefined);
  const [isSaved, setIsSaved] = useState(false);

  // Use report filters hook
  const {
    searchQuery,
    setSearchQuery,
    activeSeverityFilter,
    setActiveSeverityFilter,
    severityCounts,
    filteredFindings,
    hasActiveFilters,
    handleSeverityClick,
    clearFilters,
  } = useReportFilters(report?.findings || []);

  // Handle AI assistant
  const handleAskAI = (context: any) => {
    // Same logic as in report detail page
    let message = "";
    let contextData: any = { section: "findings" };

    if (context.issue) {
      message = `I need help with this security issue:\n\n**Issue:** ${context.issue.title}\n**Severity:** ${context.issue.severity}\n**File:** ${context.issue.file}\n\nWhat should I do to fix this?`;
      contextData.focusItem = { type: "finding", data: context.issue };
    } else if (context.file) {
      const fileIssues = report?.findings.filter((f: any) => f.file === context.file) || [];
      message = `I have ${fileIssues.length} security issues in ${context.file}. What should I prioritize?`;
      contextData.focusItem = { type: "file", data: { file: context.file, issues: fileIssues } };
    } else if (context.category) {
      const categoryIssues = report?.findings.filter((f: any) => 
        f.category === context.category && (!context.severity || f.severity === context.severity)
      ) || [];
      message = `I have ${categoryIssues.length} ${context.category} issues. How should I approach fixing them?`;
      contextData.focusItem = { type: "category", data: { category: context.category, issues: categoryIssues } };
    } else if (context.severity) {
      const severityIssues = report?.findings.filter((f: any) => f.severity === context.severity) || [];
      message = `I have ${severityIssues.length} ${context.severity} severity issues. How should I prioritize these?`;
      contextData.focusItem = { type: "severity", data: { severity: context.severity, issues: severityIssues } };
    }

    setAiInitialMessage(message);
    setAiContext(contextData);
    setShowAI(true);
  };

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load report from URL parameters
  useEffect(() => {
    try {
      const reportData = searchParams.get('data');
      
      if (!reportData) {
        setError("No report data provided");
        setLoading(false);
        return;
      }

      // Decode base64 report data (Unicode-safe with js-base64)
      const decodedData = decode(reportData);
      const parsedReport = JSON.parse(decodedData);

      // Validate report structure
      if (!parsedReport || !parsedReport.findings || !parsedReport.score) {
        throw new Error("Invalid report format");
      }

      setReport(parsedReport);
      setLoading(false);
    } catch (err: any) {
      console.error("Failed to load report:", err);
      setError("Failed to load report data. The link may be invalid or corrupted.");
      setLoading(false);
    }
  }, [searchParams]);

  const handleSaveLocally = () => {
    if (!report) return;

    try {
      const projectName = report.metadata?.projectName || report.projectName || "Unnamed Project";
      const scanMode = report.metadata?.scanMode || "quick";
      
      const savedReport = saveLocalReport(projectName, report, scanMode as any);
      
      setIsSaved(true);
      toast.success("Report saved locally!", {
        description: "You can access it anytime from the Reports page",
        action: {
          label: "View Reports",
          onClick: () => router.push("/reports"),
        },
      });
    } catch (error: any) {
      console.error("Failed to save report:", error);
      toast.error("Failed to save report", {
        description: error.message || "Please try again",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darker text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-400">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-darker text-white flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-dark border border-red-500/30 rounded-xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Failed to Load Report</h1>
          <p className="text-gray-400 mb-6">{error || "Unknown error occurred"}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition"
          >
            Go to Home
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darker text-white">
      {/* Sticky Compact Header (shows on scroll) */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-gray-800 shadow-lg"
          >
            <div className="container mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    report.score >= 80 ? 'bg-green-500/20 text-green-400' :
                    report.score >= 60 ? 'bg-blue-500/20 text-blue-400' :
                    report.score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {report.score}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{report.metadata?.projectName || report.projectName || "Report"}</h2>
                    <p className="text-sm text-gray-400">Grade {report.grade} • {report.findings?.length || 0} issues</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAI(!showAI)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  showAI 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {showAI ? 'Hide' : 'Show'} AI Assistant
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Notice Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-300 mb-1">External Report View</h3>
              <p className="text-sm text-gray-400 mb-3">
                This report was generated from an external scanner and is being displayed temporarily. 
                Save it locally to access it later from your Reports page.
              </p>
              <button
                onClick={handleSaveLocally}
                disabled={isSaved}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                  isSaved
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-secondary'
                }`}
              >
                {isSaved ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved Locally
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Locally
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Report Viewer */}
        <HierarchicalReportViewer
          report={report}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeSeverityFilter={activeSeverityFilter}
          onSeverityFilterChange={setActiveSeverityFilter}
          onAskAI={handleAskAI}
        />
      </div>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {showAI && (
          <ResizablePanel
            onClose={() => setShowAI(false)}
            defaultWidth={450}
            minWidth={350}
            maxWidth={800}
          >
            <AIAssistant
              report={report}
              onClose={() => setShowAI(false)}
              initialMessage={aiInitialMessage}
              context={aiContext}
            />
          </ResizablePanel>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExternalReportViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-darker text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ReportViewerContent />
    </Suspense>
  );
}
