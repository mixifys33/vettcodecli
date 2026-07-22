"use client";

export default function WhyVettCode() {
  const reasons = [
    {
      icon: "📊",
      title: "Deep Code Analysis",
      description: "AST, control flow, and data flow insights",
    },
    {
      icon: "⚖️",
      title: "2-Powered Insights",
      description: "Deep semantic reasoning beyond patterns",
    },
    {
      icon: "📝",
      title: "Real Fixes",
      description: "Get exact code to apply, not just warnings",
    },
    {
      icon: "🔶",
      title: "Risk Scoring",
      description: "0-100 strict production readiness score",
    },
    {
      icon: "📄",
      title: "Shareable Reports",
      description: "Generate & share reports instantly",
    },
    {
      icon: "🔒",
      title: "Offline & Private",
      description: "Everything stays on your machine",
    },
  ];

  return (
    <section className="py-20 px-4 bg-dark/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, idx) => (
            <div
              key={idx}
              className="bg-dark border border-gray-800 rounded-xl p-6 hover:border-primary/30 transition"
            >
              <div className="text-4xl mb-4">{reason.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{reason.title}</h3>
              <p className="text-gray-400">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
