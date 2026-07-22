"use client";

export default function CLIOutputPreview() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            CLI <span className="text-primary">OUTPUT</span> PREVIEW
          </h2>
        </div>

        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot red"></div>
            <div className="terminal-dot yellow"></div>
            <div className="terminal-dot green"></div>
            <span className="text-xs text-gray-500 ml-2">terminal</span>
          </div>
          <div className="p-6 font-mono text-sm space-y-1">
            <div className="text-primary">$ vettcode scan</div>
            <div className="text-gray-400">Scanning project...</div>
            <div className="text-primary">✓ Files analyzed: 128</div>
            <div className="text-primary">✓ Lines of code: 15,842</div>
            <div className="text-yellow-400">⚠ Analysis engine: Hybrid (Static + AST + AI)</div>
            <div className="text-gray-400 mt-4">Issues found:</div>
            <div className="text-red-500">  × 3  Critical</div>
            <div className="text-orange-500">  × 5  High</div>
            <div className="text-yellow-500">  × 8  Medium</div>
            <div className="text-gray-500">  × 3  Low</div>
            <div className="text-gray-400 mt-4">Top Priority Issues:</div>
            <div className="text-red-500">    1. SQL Injection</div>
            <div className="text-gray-500">       src/api/users.ts:42</div>
            <div className="text-red-500">    2. XSS Input Check</div>
            <div className="text-gray-500">       src/components/Content.tsx:27</div>
            <div className="text-red-500">    3. Hardcoded Secret</div>
            <div className="text-gray-500">       src/config/index.ts:18</div>
            <div className="text-primary mt-4">✓ Report generated: report.html</div>
            <div className="text-primary">✓ Report uploaded: https://vettcode-cli.dev/reports/abc123</div>
            <div className="text-gray-400 mt-4 flex items-center gap-2">
              <div className="animate-pulse">▋</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
