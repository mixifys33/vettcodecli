"use client";

import { useState } from "react";

export default function InstallSection() {
  const [copied, setCopied] = useState(false);

  const commands = [
    { label: "npm", cmd: "npm install -g vettcode-cli" },
    { label: "pnpm", cmd: "pnpm install -g vettcode-cli" },
    { label: "yarn", cmd: "yarn global add vettcode-cli" },
    { label: "bun", cmd: "bun install -g vettcode-cli" },
  ];

  const [activeTab, setActiveTab] = useState(0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="install" className="py-20 px-4 bg-dark/30">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Install in <span className="text-primary">seconds</span>
        </h2>
        <p className="text-gray-400 mb-8">
          Works locally, keeps you in control. No config required.
        </p>

        {/* Package manager tabs */}
        <div className="flex justify-center gap-2 mb-4">
          {commands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === idx
                  ? "bg-primary text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {cmd.label}
            </button>
          ))}
        </div>

        {/* Command display */}
        <div className="relative bg-[#0d0d0d] border border-gray-800 rounded-lg p-6 flex items-center justify-between group">
          <code className="text-primary text-lg font-mono flex-1 text-left">
            {commands[activeTab].cmd}
          </code>
          <button
            onClick={() => copyToClipboard(commands[activeTab].cmd)}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg transition flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Run your first scan */}
        <div className="mt-8 text-left max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-primary">Run your first scan</h3>
          <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4 space-y-2 font-mono text-sm">
            <div className="text-gray-500"># Navigate to your project</div>
            <div className="text-primary">cd /path/to/project</div>
            <div className="text-gray-500 mt-4"># Run scan</div>
            <div className="text-primary">vettcode scan</div>
            <div className="text-gray-500 mt-4"># Upload & share report</div>
            <div className="text-primary">vettcode scan --upload</div>
          </div>
        </div>
      </div>
    </section>
  );
}
