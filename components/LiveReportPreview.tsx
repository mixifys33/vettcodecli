"use client";

export default function LiveReportPreview() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            LIVE <span className="text-primary">REPORT</span> PREVIEW
          </h2>
          <p className="text-xl text-gray-400">
            Interactive, Actionable, Developer-Friendly
          </p>
        </div>

        <div className="bg-dark/50 border border-gray-800 rounded-xl overflow-hidden">
          {/* Mock report preview */}
          <div className="bg-[#0d0d0d] p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold">72</span>
                </div>
                <div>
                  <div className="text-yellow-500 font-semibold">MODERATE RISK</div>
                  <div className="text-sm text-gray-500">Grade: C</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition">
                Open Full Sample Report →
              </button>
            </div>
          </div>

          {/* Severity breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-red-500">1</div>
              <div className="text-sm text-gray-400">Critical</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-500">3</div>
              <div className="text-sm text-gray-400">High</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-500">5</div>
              <div className="text-sm text-gray-400">Medium</div>
            </div>
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-gray-400">3</div>
              <div className="text-sm text-gray-400">Low</div>
            </div>
          </div>

          {/* Sample finding */}
          <div className="p-6 border-t border-gray-800">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded">
                  CRITICAL
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">SQL Injection</h3>
                  <p className="text-gray-400 mb-4">
                    User input is directly concatenated into SQL query without proper sanitization
                  </p>
                  <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4 font-mono text-sm">
                    <div className="text-gray-500 mb-2">// Vulnerable code:</div>
                    <div className="text-red-400">
                      const query = `SELECT * FROM users WHERE id = ${"{userId}"}`;
                    </div>
                  </div>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="text-blue-400 font-semibold mb-2">🔧 Mitigation</div>
                      <div className="text-sm text-gray-400">Use parameterized queries or ORM</div>
                    </div>
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                      <div className="text-primary font-semibold mb-2">🛡️ Prevention</div>
                      <div className="text-sm text-gray-400">Implement input validation layer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
