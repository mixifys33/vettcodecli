"use client";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-semibold">
              AI-POWERED CODE ANALYSIS
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Find Real Vulnerabilities.
              <br />
              <span className="text-primary">Not Just Warnings.</span>
            </h1>

            <p className="text-xl text-gray-400 leading-relaxed">
              VettCode CLI scans your codebase, explains real risks, and gives exact fixes — instantly.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition flex items-center gap-2 glow-green">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Install CLI
              </button>
              <button className="px-8 py-4 border border-primary/30 text-primary rounded-lg font-semibold hover:bg-primary/10 transition">
                View Sample Report
              </button>
            </div>

            {/* Features badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-gray-400">Zero Config</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-gray-400">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-gray-400">Real Fixes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-gray-400">Private & Local</span>
              </div>
            </div>
          </div>

          {/* Right: Terminal Demo */}
          <div className="lg:block">
            <div className="terminal-window glow-green">
              <div className="terminal-header">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
                <span className="text-xs text-gray-500 ml-2">vettcode scan</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-2">
                <div className="text-primary">$ vettcode scan</div>
                <div className="text-gray-400">Scanning project...</div>
                <div className="text-primary">✓ Files analyzed: 128</div>
                <div className="text-primary">✓ Lines of code: 15,842</div>
                <div className="text-yellow-400">⚠ Analysis engine: Hybrid (Static + AST + AI)</div>
                <div className="text-gray-400 pt-2">Issues found:</div>
                <div className="text-red-500">  × 3  Critical</div>
                <div className="text-orange-500">  × 5  High</div>
                <div className="text-yellow-500">  × 8  Medium</div>
                <div className="text-gray-500">  × 3  Low</div>
                <div className="text-primary pt-2">✓ Report generated: report.html</div>
                <div className="text-gray-400 pt-4 flex items-center gap-2">
                  <div className="animate-pulse">▋</div>
                </div>
              </div>
            </div>

            {/* Platform badges */}
            <div className="mt-6 flex items-center justify-center gap-4 text-gray-500 text-sm">
              <span>Works on</span>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 0h11v11H0zm13 0h11v11H13zM0 13h11v11H0zm13 0h11v11H13z" />
                  </svg>
                </div>
                <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" />
                  </svg>
                </div>
                <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm0 2.5l8.892 5.154v10.692L12 23.5l-8.892-5.154V7.654L12 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
