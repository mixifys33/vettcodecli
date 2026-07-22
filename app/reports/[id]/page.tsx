"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReportViewer from "@/components/ReportViewer";
import AIAssistant from "@/components/AIAssistant";

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
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (!reportId) return;

    // Fetch report from API
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                  <span className="text-primary font-bold">V</span>
                </div>
                <span className="font-bold">VettCode</span>
              </a>
              <span className="text-gray-500">/</span>
              <span className="text-gray-400">Report</span>
            </div>
            
            <div className="flex items-center gap-3">
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
                AI Assistant
              </motion.button>
              <a
                href="/"
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition"
              >
                New Scan
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report Content */}
          <div className={showAI ? "lg:col-span-2" : "lg:col-span-3"}>
            <ReportViewer report={report} />
          </div>

          {/* AI Assistant Sidebar */}
          <AnimatePresence>
            {showAI && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="lg:col-span-1"
              >
                <AIAssistant report={report} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expiration Notice */}
      <div className="fixed bottom-4 right-4 bg-dark border border-yellow-500/30 rounded-lg p-4 max-w-sm">
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
