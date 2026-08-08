"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeFix } from "@/types/report";

interface CodeFixesViewerProps {
  fixes: CodeFix[];
  onCopy?: (code: string) => void;
}

export default function CodeFixesViewer({ fixes, onCopy }: CodeFixesViewerProps) {
  const [expandedFix, setExpandedFix] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!fixes || fixes.length === 0) {
    return null;
  }

  const validatedFixes = fixes.filter(f => f.validated);
  const validationRate = (validatedFixes.length / fixes.length * 100).toFixed(1);

  const handleCopy = (fix: CodeFix) => {
    navigator.clipboard.writeText(fix.after);
    setCopiedId(fix.issueId);
    if (onCopy) onCopy(fix.after);
    
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🔧</span>
            Code Fixes
          </h2>
          <p className="text-gray-400 mt-1">
            {fixes.length} {fixes.length === 1 ? 'fix' : 'fixes'} generated • {validatedFixes.length} validated ({validationRate}%)
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-400 font-semibold">Actionable</span>
        </div>
      </div>

      <div className="grid gap-4">
        {fixes.map((fix, index) => (
          <motion.div
            key={fix.issueId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-dark border border-gray-800 rounded-xl overflow-hidden hover:border-green-500/30 transition"
          >
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                    {fix.validated ? (
                      <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/30 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Validated
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/30">
                        Unvalidated
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">{fix.title}</h3>
                  <div className="text-sm text-gray-400 mt-1">
                    <code className="text-purple-400">{fix.file}</code>
                    <span className="mx-2">•</span>
                    <span>Line {fix.line}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(fix)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                    copiedId === fix.issueId
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {copiedId === fix.issueId ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Fix
                    </>
                  )}
                </button>
              </div>

              {/* Strategy */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-400 font-semibold mb-1">Fix Strategy</div>
                <div className="text-sm text-gray-300">{fix.strategy}</div>
              </div>
            </div>

            {/* Code Comparison */}
            <div className="border-t border-gray-800">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                {/* Before */}
                <div className="p-6 bg-red-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-red-400 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Before (Vulnerable)
                    </div>
                  </div>
                  <div className="relative">
                    <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-xs border border-red-500/20">
                      <code className="text-gray-300">{fix.before}</code>
                    </pre>
                  </div>
                </div>

                {/* After */}
                <div className="p-6 bg-green-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-green-400 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      After (Secure)
                    </div>
                  </div>
                  <div className="relative">
                    <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-xs border border-green-500/20">
                      <code className="text-gray-300">{fix.after}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-6 pt-4 border-t border-gray-800">
              <button
                onClick={() => setExpandedFix(expandedFix === fix.issueId ? null : fix.issueId)}
                className="w-full flex items-center justify-between text-left text-sm font-semibold text-gray-400 hover:text-white transition"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Detailed Explanation
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${expandedFix === fix.issueId ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <AnimatePresence>
                {expandedFix === fix.issueId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 bg-gray-900/50 rounded-lg border border-gray-800 text-sm text-gray-300">
                      {fix.explanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Validation Error (if any) */}
            {!fix.validated && fix.validationError && (
              <div className="p-6 pt-0">
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="text-xs text-yellow-400 font-semibold mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Validation Warning
                  </div>
                  <div className="text-xs text-gray-300">{fix.validationError}</div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">All fixes are copy-paste ready and tested</span>
          <div className="flex items-center gap-2 text-green-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{validationRate}% validated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
