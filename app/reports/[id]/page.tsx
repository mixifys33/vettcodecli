"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import HierarchicalReportViewer from "@/components/HierarchicalReportViewer";
import StructuredReportViewer from "@/components/report/StructuredReportViewer";
import CompactReportHeader from "@/components/CompactReportHeader";
import AIAssistant from "@/components/AIAssistant";
import ResizablePanel from "@/components/ResizablePanel";
import { useReportFilters } from "@/hooks/useReportFilters";
import { getLocalReportById } from "@/lib/localReportStorage";

interface Report {
  id: string;
  projectName: string;
  findings: any[];
  score: number;
  grade: string;
  summary: string;
  metadata: any;
  expiresAt: string;
  createdAt: string;
}

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id as string;
  
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [isLocalReport, setIsLocalReport] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [aiInitialMessage, setAiInitialMessage] = useState<string | undefined>(undefined);
  const [aiContext, setAiContext] = useState<any>(undefined);

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

  // Handle AI assistant with context
  const handleAskAI = (context: {
    severity?: string;
    category?: string;
    file?: string;
    issue?: any;
  }) => {
    let message = "";
    let contextData: any = { section: "findings" };

    if (context.issue) {
      // Specific issue
      message = `I need help with this security issue:

**Issue:** ${context.issue.title}
**Severity:** ${context.issue.severity}
**Category:** ${context.issue.category}
**File:** ${context.issue.file}
${context.issue.line ? `**Line:** ${context.issue.line}` : ""}

**Description:** ${context.issue.description}

What should I do to fix this issue, and what are the security implications?`;
      
      contextData.focusItem = {
        type: "finding",
        data: context.issue
      };
    } else if (context.file) {
      // File-level context
      const fileIssues = report?.findings.filter((f: any) => f.file === context.file) || [];
      message = `I have security issues in this file:

**File:** ${context.file}
**Category:** ${context.category || "Multiple categories"}
**Total Issues:** ${fileIssues.length}
**Severity:** ${context.severity || "Mixed"}

What are the main security concerns in this file and how should I prioritize fixes?`;
      
      contextData.focusItem = {
        type: "file",
        data: { file: context.file, issues: fileIssues }
      };
    } else if (context.category) {
      // Category-level context
      const categoryIssues = report?.findings.filter((f: any) => 
        f.category === context.category && (!context.severity || f.severity === context.severity)
      ) || [];
      
      message = `I have multiple security issues in this category:

**Category:** ${context.category}
${context.severity ? `**Severity:** ${context.severity}` : ""}
**Total Issues:** ${categoryIssues.length}

What are the common patterns and how should I approach fixing these issues?`;
      
      contextData.focusItem = {
        type: "category",
        data: { category: context.category, issues: categoryIssues }
      };
    } else if (context.severity) {
      // Severity-level context
      const severityIssues = report?.findings.filter((f: any) => f.severity === context.severity) || [];
      
      message = `I have ${severityIssues.length} ${context.severity} severity issues:

**Severity Level:** ${context.severity}
**Total Issues:** ${severityIssues.length}
**Categories:** ${[...new Set(severityIssues.map((f: any) => f.category))].join(", ")}

How should I prioritize and address these ${context.severity} severity issues?`;
      
      contextData.focusItem = {
        type: "severity",
        data: { severity: context.severity, issues: severityIssues }
      };
    }

    setAiInitialMessage(message);
    setAiContext(contextData);
    setShowAI(true);
  };

  // Track scroll position to show/hide compact header
  useEffect(() => {
    const handleScroll = () => {
      // Show compact header after scrolling 300px
      setIsScrolled(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!reportId) return;

    // Check if this is a local report (ID starts with "local_")
    if (reportId.startsWith('local_')) {
      try {
        const localReport = getLocalReportById(reportId);
        
        if (localReport) {
          setReport({
            ...localReport.report,
            id: localReport.id,
            projectName: localReport.projectName,
            createdAt: localReport.savedAt,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Local reports don't expire
          });
          setIsLocalReport(true);
          setLoading(false);
          return;
        } else {
          setError("Local report not found");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error loading local report:", err);
        setError("Failed to load local report");
        setLoading(false);
        return;
      }
    }

    // Fetch CLI report from API
    fetch(`/api/reports/${reportId}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 410) {
            setExpired(true);
            throw new Error("Report has expired");
          }
          throw new Error("Report not found");
        }
        return res.json();
      })
      .then(data => {
        setReport(data.report);
        setIsLocalReport(false);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [reportId]);

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

  if (expired) {
    return (
      <div className="min-h-screen bg-darker text-white flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-dark border border-red-500/30 rounded-xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold mb-4">Report Expired</h1>
          <p className="text-gray-400 mb-6">
            This report link has expired for security reasons. Reports are automatically deleted after 7 days.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition"
          >
            Go to Homepage
          </a>
        </motion.div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-darker text-white flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-dark border border-gray-800 rounded-xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || "This report doesn't exist or the link is invalid."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition"
          >
            Go to Homepage
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darker text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <a href="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                  <span className="text-primary font-bold">V</span>
                </div>
                <span className="font-bold hidden sm:inline">VettCode</span>
              </a>
              
              {/* Show compact header when scrolled */}
              <AnimatePresence>
                {isScrolled && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 min-w-0"
                  >
                    <CompactReportHeader
                      report={report}
                      severityCounts={severityCounts}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      activeSeverity={activeSeverityFilter}
                      onSeverityClick={handleSeverityClick}
                      onClearFilters={clearFilters}
                      hasActiveFilters={hasActiveFilters}
                      filteredCount={filteredFindings.length}
                      totalCount={report.findings.length}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!isScrolled && (
                <>
                  <span className="text-gray-500">/</span>
                  <span className="text-gray-400 truncate">{report.projectName}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Architecture Button - Only show if blueprint exists */}
              {(report as any).blueprint && (
                <a
                  href={`/reports/${reportId}/architecture`}
                  className="relative px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 group"
                  title="View project architecture analysis"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="hidden sm:inline">Architecture</span>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </a>
              )}
              
              <motion.button
                onClick={() => setShowAI(!showAI)}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  showAI 
                    ? "bg-purple-500 text-white" 
                    : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>🤖</span>
                <span className="hidden sm:inline">AI Assistant</span>
              </motion.button>
              <a
                href="https://vetted-xi.vercel.app/"
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition hidden md:block"
              >
                New Scan
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Architecture Available Banner */}
        {(report as any).blueprint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    Architecture Analysis Available
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                      New
                    </span>
                  </h3>
                  <p className="text-sm text-gray-400">
                    View project structure, entry points, risk surface, and dependency graph
                  </p>
                </div>
              </div>
              <a
                href={`/reports/${reportId}/architecture`}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition flex items-center gap-2 flex-shrink-0"
              >
                View Architecture
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </motion.div>
        )}
        
        <div className={showAI ? "" : ""}>
          {/* Report Content - Use Structured Viewer for new format, Legacy for old */}
          <div>
            {report.format === 'structured' || report.structured || report.rootCauses ? (
              <StructuredReportViewer 
                report={report}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeSeverityFilter={activeSeverityFilter}
                onSeverityFilterChange={setActiveSeverityFilter}
                hideHeader={isScrolled}
                onAskAI={handleAskAI}
              />
            ) : (
              <HierarchicalReportViewer 
                report={report}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeSeverityFilter={activeSeverityFilter}
                onSeverityFilterChange={setActiveSeverityFilter}
                hideHeader={isScrolled}
                onAskAI={handleAskAI}
              />
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Resizable Panel */}
      <AnimatePresence>
        {showAI && (
          <ResizablePanel
            defaultWidth={450}
            minWidth={350}
            maxWidth={900}
            onClose={() => setShowAI(false)}
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

      {/* Expiration Notice */}
      <div className={`fixed bottom-4 ${showAI ? "right-[470px]" : "right-4"} bg-dark border border-yellow-500/30 rounded-lg p-3 max-w-sm transition-all duration-300 z-30`}>
        <div className="flex items-start gap-3">
          <span className="text-yellow-500">⏰</span>
          <div className="text-sm">
            <p className="font-semibold text-yellow-500">Secure Link</p>
            <p className="text-gray-400">
              Expires: {new Date(report.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
