"use client";

import { useState } from "react";

export default function ShareableReports() {
  const [copied, setCopied] = useState(false);

  const exampleUrl = "https://mixifys33.github.io/vettcode-cli/reports/abc123";

  const copyLink = () => {
    navigator.clipboard.writeText(exampleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 px-4 bg-dark/30">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          SHAREABLE <span className="text-primary">REPORTS</span>
        </h2>
        <p className="text-xl text-gray-400 mb-12">
          Generate reports you can share with your team or anywhere
        </p>

        <div className="bg-dark border border-gray-800 rounded-xl p-8">
          <div className="mb-6">
            <div className="text-gray-400 mb-2">Generated Report URL:</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0d0d0d] border border-primary/30 rounded-lg p-4 font-mono text-sm text-primary text-left">
                {exampleUrl}
              </div>
              <button
                onClick={copyLink}
                className="px-6 py-4 bg-primary hover:bg-secondary text-white rounded-lg transition font-semibold flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="text-primary font-semibold mb-2">✓ Interactive</div>
              <div className="text-sm text-gray-400">HTML report with search & filters</div>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="text-primary font-semibold mb-2">✓ Works Offline</div>
              <div className="text-sm text-gray-400">No backend required</div>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="text-primary font-semibold mb-2">✓ No Login Required</div>
              <div className="text-sm text-gray-400">Direct share via URL</div>
            </div>
          </div>

          <button className="mt-8 px-8 py-4 bg-primary hover:bg-secondary text-white rounded-lg transition font-semibold">
            Open Report →
          </button>
        </div>
      </div>
    </section>
  );
}
