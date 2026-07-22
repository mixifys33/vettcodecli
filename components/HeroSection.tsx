"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [scanPhase, setScanPhase] = useState<"scanning" | "results">("scanning");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate scanning progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setScanPhase("results"), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

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

          {/* Right: Terminal Demo with Animation */}
          <motion.div 
            className="lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="terminal-window glow-green relative overflow-hidden">
              <div className="terminal-header">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
                <span className="text-xs text-gray-500 ml-2">vettcode scan</span>
              </div>
              
              {/* Scanning Phase */}
              <motion.div 
                className="p-6 font-mono text-sm space-y-2"
                initial={{ opacity: 1 }}
                animate={{ opacity: scanPhase === "scanning" ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  $ vettcode scan
                </motion.div>
                
                <motion.div 
                  className="text-gray-400 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
                  Scanning project...
                </motion.div>
                
                <motion.div
                  className="w-full bg-gray-800 rounded-full h-2 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                {progress > 20 && (
                  <motion.div 
                    className="text-primary"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    ✓ Files analyzed: 128
                  </motion.div>
                )}
                
                {progress > 40 && (
                  <motion.div 
                    className="text-primary"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    ✓ Lines of code: 15,842
                  </motion.div>
                )}
                
                {progress > 60 && (
                  <motion.div 
                    className="text-yellow-400"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    ⚠ Analysis engine: Hybrid (Static + AST + AI)
                  </motion.div>
                )}
              </motion.div>

              {/* Results Phase */}
              <motion.div 
                className="absolute inset-0 p-6 font-mono text-sm space-y-2 bg-[#1a1a1a]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: scanPhase === "results" ? 1 : 0,
                  y: scanPhase === "results" ? 0 : 20
                }}
                transition={{ duration: 0.6 }}
                style={{ top: '44px' }}
              >
                <motion.div 
                  className="text-gray-400 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: scanPhase === "results" ? 1 : 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Issues found:
                </motion.div>
                
                {[
                  { text: "  × 3  Critical", color: "text-red-500", delay: 0.4 },
                  { text: "  × 5  High", color: "text-orange-500", delay: 0.5 },
                  { text: "  × 8  Medium", color: "text-yellow-500", delay: 0.6 },
                  { text: "  × 3  Low", color: "text-gray-500", delay: 0.7 }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    className={item.color}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: scanPhase === "results" ? 1 : 0,
                      x: scanPhase === "results" ? 0 : -20
                    }}
                    transition={{ delay: item.delay }}
                  >
                    {item.text}
                  </motion.div>
                ))}
                
                <motion.div 
                  className="text-primary pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: scanPhase === "results" ? 1 : 0 }}
                  transition={{ delay: 0.9 }}
                >
                  ✓ Report generated: report.html
                </motion.div>

                <motion.a
                  href="#reports"
                  className="inline-block mt-4 px-4 py-2 bg-primary/20 border border-primary/50 rounded-lg text-primary hover:bg-primary/30 transition"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: scanPhase === "results" ? 1 : 0,
                    scale: scanPhase === "results" ? 1 : 0.9
                  }}
                  transition={{ delay: 1.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Demo Report →
                </motion.a>
              </motion.div>
            </div>

            {/* Platform badges */}
            <motion.div 
              className="mt-6 flex items-center justify-center gap-4 text-gray-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: scanPhase === "results" ? 1 : 0 }}
              transition={{ delay: 1.3 }}
            >
              <span>Works on</span>
              <div className="flex gap-3">
                {[0, 1, 2].map((idx) => (
                  <motion.div
                    key={idx}
                    className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: scanPhase === "results" ? 1 : 0, rotate: 0 }}
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
