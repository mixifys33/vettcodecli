"use client";

import { useState, useEffect } from "react";

interface Report {
  filename: string;
  projectName: string;
  timestamp: string;
}

export default function ReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch reports from the manifest
    fetch("./reports/index.json")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section id="reports" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            📊 AVAILABLE <span className="text-primary">REPORTS</span>
          </h2>
          <p className="text-xl text-gray-400">
            Browse shared security scan reports
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-2xl font-semibold mb-4">No reports yet</h3>
            <p className="text-gray-400 mb-8">
              Reports uploaded with <code className="px-2 py-1 bg-primary/10 rounded">vettcode scan --upload</code> will appear here
            </p>
            <div className="inline-block bg-dark border border-gray-800 rounded-lg p-6 text-left">
              <div className="font-mono text-sm space-y-2">
                <div className="text-primary">$ npm install -g vettcode-cli</div>
                <div className="text-primary">$ vettcode scan --upload</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report, idx) => (
              <a
                key={idx}
                href={`./reports/${report.filename}`}
                className="bg-dark border border-gray-800 rounded-xl p-6 hover:border-primary/30 hover:bg-dark/70 transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-2xl">
                    📊
                  </div>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-primary transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition">
                  {report.projectName}
                </h3>
                <div className="text-sm text-gray-400">
                  {new Date(report.timestamp).toLocaleString()}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
