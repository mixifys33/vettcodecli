"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loopCount, setLoopCount] = useState(0);

  // 7 fast stages - 10 second total loop
  const scanStages = [
    { 
      type: "init", 
      text: "$ vettcode scan", 
      delay: 800,
      showProgress: false 
    },
    { 
      type: "progress", 
      text: "🔬 Static analysis + AST...", 
      progress: 25, 
      delay: 1200,
      showProgress: true,
      subtext: "350+ patterns • 247 files"
    },
    { 
      type: "progress", 
      text: "🔄 Data flow tracking...", 
      progress: 50, 
      delay: 1200,
      showProgress: true,
      subtext: "Input → output analysis"
    },
    { 
      type: "progress", 
      text: "🔐 Security vulnerabilities...", 
      progress: 75, 
      delay: 1200,
      showProgress: true,
      subtext: "SQL, XSS, auth checks"
    },
    { 
      type: "ai", 
      text: "🤖 AI deep analysis...", 
      progress: 90, 
      delay: 1400,
      showProgress: true,
      subtext: "GPT-4 + Claude verification"
    },
    { 
      type: "progress", 
      text: "📊 Generating report...", 
      progress: 100, 
      delay: 1200,
      showProgress: true
    },
    { 
      type: "complete", 
      text: "✓ Scan complete!", 
      delay: 1500,
      showProgress: false 
    },
  ];

  const issuesData = [
    { severity: "Critical", count: 3, color: "text-red-500", icon: "🔴" },
    { severity: "High", count: 5, color: "text-orange-500", icon: "🟠" },
    { severity: "Medium", count: 8, color: "text-yellow-500", icon: "🟡" },
    { severity: "Low", count: 3, color: "text-gray-500", icon: "⚪" },
  ];

  useEffect(() => {
    const currentStage = scanStages[stage];
    
    if (stage >= scanStages.length) {
      // Loop completed, restart after showing results briefly
      setTimeout(() => {
        setStage(0);
        setProgress(0);
        setLoopCount(prev => prev + 1);
      }, 2500); // Show results for 2.5s then restart
      return;
    }

    const timer = setTimeout(() => {
      if (currentStage.showProgress && currentStage.progress) {
        setProgress(currentStage.progress);
      }
      setStage(prev => prev + 1);
    }, currentStage.delay);

    return () => clearTimeout(timer);
  }, [stage]);

  const isScanning = stage < scanStages.length - 1;
  const showResults = stage >= scanStages.length - 1;

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-semibold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              AI-POWERED CODE ANALYSIS
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block"
              >
                Find Real Vulnerabilities.
              </motion.span>
              <br />
              <motion.span 
                className="text-primary inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Not Just Warnings.
              </motion.span>
            </h1>

            <motion.p 
              className="text-xl text-gray-400 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              VettCode CLI scans your codebase, explains real risks, and gives exact fixes — instantly.
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.button 
                className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition flex items-center gap-2 glow-green"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(16, 185, 129, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Install CLI
              </motion.button>
              <motion.button 
                className="px-8 py-4 border border-primary/30 text-primary rounded-lg font-semibold hover:bg-primary/10 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Sample Report
              </motion.button>
            </motion.div>

            {/* Features badges */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {[
                { label: "Zero Config", delay: 1.1 },
                { label: "AI-Powered", delay: 1.2 },
                { label: "Real Fixes", delay: 1.3 },
                { label: "Private & Local", delay: 1.4 }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  className="flex items-center gap-2 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: item.delay }}
                >
                  <motion.div 
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                  />
                  <span className="text-gray-400">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Advanced Terminal Demo with Continuous Loop */}
          <motion.div 
            className="lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="terminal-window glow-green relative overflow-hidden min-h-[500px]">
              <div className="terminal-header">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
                <span className="text-xs text-gray-500 ml-2">vettcode scan</span>
              </div>
              
              <div className="p-6 font-mono text-sm space-y-2 min-h-[450px]">
                <AnimatePresence mode="wait">
                  {scanStages.slice(0, stage + 1).map((item, idx) => (
                    <motion.div
                      key={`${loopCount}-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Main text */}
                      <div className={`flex items-center gap-2 ${
                        item.type === 'success' ? 'text-primary' :
                        item.type === 'ai' ? 'text-purple-400' :
                        item.type === 'complete' ? 'text-green-400' :
                        'text-gray-300'
                      }`}>
                        {item.type === 'progress' && (
                          <motion.div
                            className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                        {item.text}
                      </div>
                      
                      {/* Subtext */}
                      {item.subtext && (
                        <motion.div
                          className="text-gray-500 text-xs ml-5 mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {item.subtext}
                        </motion.div>
                      )}
                      
                      {/* Progress bar */}
                      {item.showProgress && item.progress && (
                        <motion.div
                          className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mt-2 ml-5"
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className={`h-full ${
                              item.type === 'ai' 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                : 'bg-gradient-to-r from-primary to-secondary'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Results Section */}
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6 space-y-3"
                  >
                    <div className="text-yellow-400 font-semibold">📋 Issues Found:</div>
                    
                    {issuesData.map((issue, idx) => (
                      <motion.div
                        key={idx}
                        className={`flex items-center gap-3 ${issue.color}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.15 }}
                      >
                        <span>{issue.icon}</span>
                        <span className="font-semibold">{issue.count}</span>
                        <span>{issue.severity}</span>
                      </motion.div>
                    ))}

                    <motion.div
                      className="text-primary pt-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      ✓ Report generated: vettcode-report-2024.html
                    </motion.div>

                    <motion.a
                      href="#reports"
                      className="inline-block mt-4 px-4 py-2 bg-primary/20 border border-primary/50 rounded-lg text-primary hover:bg-primary/30 transition"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📊 View Full Demo Report →
                    </motion.a>

                    {/* Loop counter */}
                    <motion.div
                      className="text-gray-600 text-xs pt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      Loop #{loopCount + 1} • Restarting scan...
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Platform badges */}
            <motion.div 
              className="mt-6 flex items-center justify-center gap-4 text-gray-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: showResults ? 1 : 0 }}
              transition={{ delay: 1.3 }}
            >
              <span>Works on</span>
              <div className="flex gap-3">
                {[0, 1, 2].map((idx) => (
                  <motion.div
                    key={idx}
                    className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: showResults ? 1 : 0, rotate: 0 }}
                    transition={{ delay: 1.4 + idx * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      {idx === 0 && <path d="M0 0h11v11H0zm13 0h11v11H13zM0 13h11v11H0zm13 0h11v11H13z" />}
                      {idx === 1 && <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" />}
                      {idx === 2 && <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm0 2.5l8.892 5.154v10.692L12 23.5l-8.892-5.154V7.654L12 2.5z" />}
                    </svg>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
