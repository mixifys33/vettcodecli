"use client";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Scan Your Code",
      description: "Runs static, AST, and data flow analysis on your codebase",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      number: "2",
      title: "Understand Real Risks",
      description: "Identifies real vulnerabilities with context, impact, and root clause",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      number: "3",
      title: "Apply Exact Fixes",
      description: "Get before/after code examples and fix recommendations",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 px-4 bg-dark/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            HOW <span className="text-primary">VETTCODE</span> WORKS
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-1/2"></div>
              )}

              <div className="bg-dark border border-gray-800 rounded-xl p-8 hover:border-primary/30 transition text-center">
                {/* Number badge */}
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary">
                  <span className="text-2xl font-bold text-primary">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="text-primary mb-4 flex justify-center">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Visual flow diagram */}
        <div className="mt-16 bg-[#0d0d0d] border border-gray-800 rounded-xl p-8">
          <div className="font-mono text-sm text-center space-y-2">
            <div className="text-gray-500">Analysis Pipeline:</div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="px-4 py-2 bg-dark border border-primary/30 rounded-lg text-primary">
                Static Analysis
              </span>
              <span className="text-primary">→</span>
              <span className="px-4 py-2 bg-dark border border-primary/30 rounded-lg text-primary">
                350+ Patterns
              </span>
              <span className="text-primary">→</span>
              <span className="px-4 py-2 bg-dark border border-primary/30 rounded-lg text-primary">
                AST Extraction
              </span>
              <span className="text-primary">→</span>
              <span className="px-4 py-2 bg-dark border border-primary/30 rounded-lg text-primary">
                AI Analysis
              </span>
              <span className="text-primary">→</span>
              <span className="px-4 py-2 bg-dark border border-primary/30 rounded-lg text-primary">
                Verification
              </span>
              <span className="text-primary">→</span>
              <span className="px-4 py-2 bg-dark border border-yellow-500/30 rounded-lg text-yellow-500">
                Score + Fixes
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
