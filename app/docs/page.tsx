"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  Package, 
  Zap, 
  Terminal, 
  Search, 
  FileOutput, 
  Monitor, 
  Lightbulb, 
  Wrench,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  FolderTree,
  FileCode,
  Rocket,
  Microscope,
  Gauge,
  ChevronRight,
  AlertTriangle,
  XCircle,
  Info,
  HelpCircle
} from "lucide-react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("installation");

  const sections = [
    { id: "what-is-vettcode", title: "What is VettCode?", icon: HelpCircle },
    { id: "installation", title: "Installation", icon: Package },
    { id: "quick-start", title: "Quick Start Guide", icon: Rocket },
    { id: "step-by-step", title: "Step-by-Step Tutorial", icon: Zap },
    { id: "scan-modes", title: "Scan Modes", icon: Search },
    { id: "commands", title: "All Commands", icon: Terminal },
    { id: "output-options", title: "Output Options", icon: FileOutput },
    { id: "interactive-ui", title: "Interactive UI", icon: Monitor },
    { id: "examples", title: "Real Examples", icon: Lightbulb },
    { id: "troubleshooting", title: "Troubleshooting", icon: Wrench },
  ];

  return (
    <main className="min-h-screen bg-darker text-white">
      <div className="grid-background">
        <Navbar />
        
        {/* Header */}
        <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-secondary transition mb-6">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            <h1 className="text-5xl font-bold mb-4">
              VettCode CLI <span className="text-primary">Documentation</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl">
              Complete guide to installing, configuring, and using VettCode CLI for security analysis
            </p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto flex gap-8">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 self-start">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">On This Page</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                        activeSection === section.id
                          ? 'bg-primary/20 text-primary'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <section.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-12">
              {/* What is VettCode Section */}
              <section id="what-is-vettcode" className="doc-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <HelpCircle className="w-8 h-8 text-primary" /> What is VettCode?
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-6">
                    <p className="text-lg text-gray-300 mb-4">
                      VettCode CLI is a powerful security scanner that helps you find vulnerabilities in your code <strong className="text-white">before they become problems</strong>.
                    </p>
                    <p className="text-gray-300">
                      Think of it as a security expert that reviews your code automatically, checking for common mistakes and security issues that hackers could exploit.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-primary">Why Use VettCode?</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white mb-1">Find Security Issues Early</h4>
                            <p className="text-sm text-gray-400">Catch vulnerabilities before your code goes to production</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white mb-1">AI-Powered Analysis</h4>
                            <p className="text-sm text-gray-400">Advanced AI detects complex security patterns</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white mb-1">Easy to Use</h4>
                            <p className="text-sm text-gray-400">Just one command to scan your entire project</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white mb-1">Detailed Reports</h4>
                            <p className="text-sm text-gray-400">Get clear, actionable reports you can share with your team</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-blue-400 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Perfect For
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Developers who want to write secure code</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Teams preparing for security audits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Projects that need automated security checks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Anyone who cares about application security</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Installation Section */}
              <section id="installation" className="doc-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Package className="w-8 h-8 text-primary" /> Installation
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Prerequisites</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      <li>Node.js 16.0.0 or higher</li>
                      <li>npm or yarn package manager</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Install via npm</h3>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                      <code className="text-green-400">npm install -g vettcode-cli</code>
                    </div>
                    <p className="text-gray-400 mt-2 text-sm">
                      The <code className="text-primary">-g</code> flag installs VettCode CLI globally, making it available system-wide.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Verify Installation</h3>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4 space-y-2">
                      <div><code className="text-green-400">vettcode --version</code></div>
                      <div className="text-gray-500"># Output: 2.6.x</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Update to Latest Version</h3>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                      <code className="text-green-400">npm update -g vettcode-cli</code>
                    </div>
                  </div>
                </div>
              </section>
              {/* Quick Start Section */}
              <section id="quick-start" className="doc-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Rocket className="w-8 h-8 text-primary" /> Quick Start Guide
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Get Started in 3 Steps</h3>
                    
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">Open Your Terminal</h4>
                          <p className="text-gray-300 mb-3">
                            Open your command line/terminal application:
                          </p>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li>• Windows: Press <kbd className="bg-gray-800 px-2 py-1 rounded">Win + R</kbd>, type <code className="text-primary">cmd</code></li>
                            <li>• Mac: Press <kbd className="bg-gray-800 px-2 py-1 rounded">Cmd + Space</kbd>, type <code className="text-primary">terminal</code></li>
                            <li>• Linux: Press <kbd className="bg-gray-800 px-2 py-1 rounded">Ctrl + Alt + T</kbd></li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                          2
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">Navigate to Your Project</h4>
                          <p className="text-gray-300 mb-3">
                            Use the <code className="text-primary bg-gray-800 px-2 py-1 rounded">cd</code> command to go to your project folder:
                          </p>
                          <div className="bg-gray-950 rounded p-3">
                            <code className="text-green-400">cd /path/to/your/project</code>
                          </div>
                          <p className="text-sm text-gray-400 mt-2">
                            Example: <code className="text-primary bg-gray-800 px-1 rounded">cd C:\Users\YourName\Projects\my-app</code>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                          3
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">Run VettCode</h4>
                          <p className="text-gray-300 mb-3">
                            Type this command and press Enter:
                          </p>
                          <div className="bg-gray-950 rounded p-3">
                            <code className="text-green-400">vettcode .</code>
                          </div>
                          <p className="text-sm text-gray-400 mt-2">
                            The <code className="text-primary bg-gray-800 px-1 rounded">.</code> means "scan the current folder"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">What Happens Next?</h3>
                    <div className="space-y-3 text-gray-300">
                      <div className="flex items-start gap-3">
                        <FolderTree className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">File Collection:</strong> VettCode scans your directory and identifies all code files
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Search className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">Static Analysis:</strong> Detects known vulnerability patterns using 350+ security rules
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Microscope className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">Deep Analysis:</strong> AI reviews code behavior, data flow, and execution paths
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">Validation:</strong> Cross-references findings to eliminate false positives
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileOutput className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">Report:</strong> Generates interactive report with shareable link
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      That's It!
                    </h3>
                    <p className="text-gray-300">
                      VettCode will scan your code and give you a report showing any security issues it found. 
                      You'll get a link to view the full report in your browser.
                    </p>
                  </div>
                </div>
              </section>

              {/* Step-by-Step Tutorial Section */}
              <section id="step-by-step" className="doc-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-primary" /> Step-by-Step Tutorial
                </h2>
                
                <div className="space-y-6">
                  <p className="text-lg text-gray-300">
                    Follow this detailed walkthrough to perform your first security scan.
                  </p>

                  {/* Step 1 */}
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">Prepare Your Project</h3>
                        <p className="text-gray-300">
                          Make sure you have a code project ready to scan. VettCode works with:
                        </p>
                      </div>
                    </div>
                    <div className="ml-16 space-y-3">
                      <div className="bg-gray-950 rounded p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="text-gray-300">✓ JavaScript (.js)</div>
                          <div className="text-gray-300">✓ TypeScript (.ts)</div>
                          <div className="text-gray-300">✓ Python (.py)</div>
                          <div className="text-gray-300">✓ Java (.java)</div>
                          <div className="text-gray-300">✓ React (.jsx, .tsx)</div>
                          <div className="text-gray-300">✓ PHP (.php)</div>
                          <div className="text-gray-300">✓ Ruby (.rb)</div>
                          <div className="text-gray-300">✓ And more!</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">Open Terminal in Your Project</h3>
                        <p className="text-gray-300 mb-3">
                          Navigate to your project folder using one of these methods:
                        </p>
                      </div>
                    </div>
                    <div className="ml-16 space-y-4">
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Method 1: Using File Explorer (Easiest)</h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                          <li>• Open your project folder in File Explorer (Windows) or Finder (Mac)</li>
                          <li>• Right-click in an empty space</li>
                          <li>• Select "Open in Terminal" or "Open Command Window Here"</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Method 2: Using cd Command</h4>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">cd C:\Users\YourName\Projects\my-app</code>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Method 3: VS Code Users</h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                          <li>• Open your project in VS Code</li>
                          <li>• Press <kbd className="bg-gray-800 px-2 py-1 rounded">Ctrl + `</kbd> (backtick) to open terminal</li>
                          <li>• Terminal opens in your project folder automatically</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">Choose Your Scan Mode</h3>
                        <p className="text-gray-300 mb-3">
                          Pick the scan type that fits your needs:
                        </p>
                      </div>
                    </div>
                    <div className="ml-16 space-y-3">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
                        <h4 className="font-semibold text-blue-400 mb-2">Quick Scan (Recommended for First Time)</h4>
                        <div className="bg-gray-950 rounded p-3 mb-2">
                          <code className="text-green-400">vettcode .</code>
                        </div>
                        <p className="text-sm text-gray-400">Takes ~30 seconds. Good for regular checks.</p>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded p-4">
                        <h4 className="font-semibold text-purple-400 mb-2">Deep Scan (Most Thorough)</h4>
                        <div className="bg-gray-950 rounded p-3 mb-2">
                          <code className="text-green-400">vettcode . --mode deep</code>
                        </div>
                        <p className="text-sm text-gray-400">Takes ~2-3 minutes. Scans every file in detail.</p>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
                        <h4 className="font-semibold text-green-400 mb-2">Fast Scan (No AI, Offline)</h4>
                        <div className="bg-gray-950 rounded p-3 mb-2">
                          <code className="text-green-400">vettcode . --no-ai</code>
                        </div>
                        <p className="text-sm text-gray-400">Takes ~30 seconds. Works without internet.</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">Wait for Scan to Complete</h3>
                        <p className="text-gray-300 mb-3">
                          You'll see progress updates as VettCode scans your code:
                        </p>
                      </div>
                    </div>
                    <div className="ml-16">
                      <div className="bg-gray-950 rounded p-4 font-mono text-sm space-y-1">
                        <div className="text-blue-400">🔍 Scanning files...</div>
                        <div className="text-yellow-400">⚡ Running static analysis...</div>
                        <div className="text-purple-400">🤖 AI analyzing code...</div>
                        <div className="text-green-400">✓ Generating report...</div>
                        <div className="text-primary">📊 Uploading report...</div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                        5
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">View Your Report</h3>
                        <p className="text-gray-300 mb-3">
                          When the scan finishes, you'll get:
                        </p>
                      </div>
                    </div>
                    <div className="ml-16 space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                        <div>
                          <strong className="text-white">A shareable web link</strong>
                          <p className="text-sm text-gray-400">Click to view your report in the browser</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                        <div>
                          <strong className="text-white">Local HTML file</strong>
                          <p className="text-sm text-gray-400">Saved in <code className="text-primary bg-gray-800 px-1 rounded">.vettcode-reports</code> folder</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                        <div>
                          <strong className="text-white">Summary in terminal</strong>
                          <p className="text-sm text-gray-400">Quick overview of findings</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sample Report */}
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      See a Sample Report
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Not sure what to expect? Check out this example report:
                    </p>
                    <a 
                      href="https://vettcode.com/report/samplereport" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg transition font-semibold"
                    >
                      <FileOutput className="w-5 h-5" />
                      Open Sample Report
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </section>

              {/* Scan Modes Section */}
              <section id="scan-modes" className="doc-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Terminal className="w-8 h-8 text-primary" /> Commands
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                      <code className="bg-gray-800 px-2 py-1 rounded">vettcode [directory]</code>
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Scan a specific directory for security vulnerabilities.
                    </p>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Example:</span>
                        <div className="bg-gray-950 rounded p-2 mt-1">
                          <code className="text-green-400">vettcode /path/to/project</code>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Current directory:</span>
                        <div className="bg-gray-950 rounded p-2 mt-1">
                          <code className="text-green-400">vettcode .</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                      <code className="bg-gray-800 px-2 py-1 rounded">vettcode --help</code>
                    </h3>
                    <p className="text-gray-300">
                      Display help information with all available commands and options.
                    </p>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                      <code className="bg-gray-800 px-2 py-1 rounded">vettcode --version</code>
                    </h3>
                    <p className="text-gray-300">
                      Show the currently installed version of VettCode CLI.
                    </p>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                      <code className="bg-gray-800 px-2 py-1 rounded">vettcode</code>
                      <span className="text-sm text-gray-500">(no arguments)</span>
                    </h3>
                    <p className="text-gray-300">
                      Launch the interactive terminal UI with menu navigation and visual scan progress.
                    </p>
                  </div>
                </div>
              </section>
              {/* Scan Modes Section */}
              <section id="scan-modes" className="doc-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Search className="w-8 h-8 text-primary" /> Understanding Scan Modes
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-6 h-6 text-blue-400" /> Quick Mode (Default)
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <code className="text-green-400">vettcode .</code>
                      </div>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">✓</span>
                          <span>Balanced speed and coverage (~30 seconds)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">✓</span>
                          <span>Scans priority files intelligently selected</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">✓</span>
                          <span>AI analysis on high-risk code sections</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">✓</span>
                          <span>Best for: Regular development checks</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Microscope className="w-6 h-6 text-purple-400" /> Deep Mode
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <code className="text-green-400">vettcode . --mode deep</code>
                      </div>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-secondary">✓</span>
                          <span>Comprehensive analysis of ALL files (~2-3 minutes)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-secondary">✓</span>
                          <span>Maximum coverage and detailed insights</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-secondary">✓</span>
                          <span>AI analysis on entire codebase</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-secondary">✓</span>
                          <span>Best for: Pre-production validation, security audits</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Gauge className="w-6 h-6 text-green-400" /> Static-Only Mode
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <code className="text-green-400">vettcode . --no-ai</code>
                      </div>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          <span>Fastest scan (~30 seconds)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          <span>No AI required (works offline)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          <span>Enhanced static analysis with 350+ patterns</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          <span>Best for: CI/CD pipelines, quick checks, no API keys</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
              {/* Output Options Section */}
              <section id="output-options" className="doc-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <FileOutput className="w-8 h-8 text-primary" /> Output Options
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">
                      <code className="bg-gray-800 px-2 py-1 rounded">-o, --output &lt;file&gt;</code>
                    </h3>
                    <p className="text-gray-300 mb-3">Save scan results to a JSON file.</p>
                    <div className="bg-gray-950 rounded p-3 space-y-2">
                      <div><code className="text-green-400">vettcode . -o results.json</code></div>
                      <div className="text-gray-500 text-sm"># Saves JSON report locally + uploads to web</div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">
                      <code className="bg-gray-800 px-2 py-1 rounded">--json</code>
                    </h3>
                    <p className="text-gray-300 mb-3">Output results in JSON format to stdout.</p>
                    <div className="bg-gray-950 rounded p-3 space-y-2">
                      <div><code className="text-green-400">vettcode . --json</code></div>
                      <div className="text-gray-500 text-sm"># Prints JSON to console + uploads to web</div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">
                      <code className="bg-gray-800 px-2 py-1 rounded">--no-upload</code>
                    </h3>
                    <p className="text-gray-300 mb-3">Skip uploading report to web (save locally only).</p>
                    <div className="bg-gray-950 rounded p-3 space-y-2">
                      <div><code className="text-green-400">vettcode . --no-upload</code></div>
                      <div className="text-gray-500 text-sm"># Only saves HTML report locally, no web link</div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">
                      <code className="bg-gray-800 px-2 py-1 rounded">-i, --ignore &lt;patterns&gt;</code>
                    </h3>
                    <p className="text-gray-300 mb-3">Comma-separated list of patterns to ignore.</p>
                    <div className="bg-gray-950 rounded p-3 space-y-2">
                      <div><code className="text-green-400">vettcode . -i "node_modules,dist,build"</code></div>
                      <div className="text-gray-500 text-sm"># Ignores specified directories</div>
                      <div className="mt-2"><code className="text-green-400">vettcode . -i "*.test.js,*.spec.ts"</code></div>
                      <div className="text-gray-500 text-sm"># Ignores test files</div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">
                      <code className="bg-gray-800 px-2 py-1 rounded">--verbose</code>
                    </h3>
                    <p className="text-gray-300 mb-3">Show detailed internal logs (batches, API calls, models).</p>
                    <div className="bg-gray-950 rounded p-3 space-y-2">
                      <div><code className="text-green-400">vettcode . --verbose</code></div>
                      <div className="text-gray-500 text-sm"># Shows debug information for troubleshooting</div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Interactive UI Section */}
              <section id="interactive-ui" className="doc-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Monitor className="w-8 h-8 text-primary" /> Interactive UI Mode
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3">Launch Interactive UI</h3>
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4 mb-4">
                      <code className="text-green-400">vettcode</code>
                    </div>
                    <p className="text-gray-300">
                      Running <code className="text-primary bg-gray-800 px-2 py-1 rounded">vettcode</code> without arguments launches a full-screen interactive terminal UI.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-primary">Keyboard Shortcuts</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Start Scan</span>
                          <kbd className="bg-gray-800 px-3 py-1 rounded text-primary border border-gray-700">S</kbd>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">View Settings</span>
                          <kbd className="bg-gray-800 px-3 py-1 rounded text-primary border border-gray-700">Shift+S</kbd>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Navigate Menu</span>
                          <kbd className="bg-gray-800 px-3 py-1 rounded text-primary border border-gray-700">↑ ↓</kbd>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Select Option</span>
                          <kbd className="bg-gray-800 px-3 py-1 rounded text-primary border border-gray-700">Enter</kbd>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Go Back</span>
                          <kbd className="bg-gray-800 px-3 py-1 rounded text-primary border border-gray-700">B</kbd>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Help</span>
                          <kbd className="bg-gray-800 px-3 py-1 rounded text-primary border border-gray-700">H</kbd>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Quit</span>
                          <kbd className="bg-gray-800 px-3 py-1 rounded text-primary border border-gray-700">Q</kbd>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Cancel/Escape</span>
                          <kbd className="bg-gray-800 px-3 py-1 rounded text-primary border border-gray-700">Esc</kbd>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-primary">Features</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <span className="text-primary">✓</span>
                        <span><strong className="text-white">Visual Progress:</strong> Real-time scan progress with stage-based display</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary">✓</span>
                        <span><strong className="text-white">Menu Navigation:</strong> Easy keyboard-driven interface</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary">✓</span>
                        <span><strong className="text-white">Configuration:</strong> Toggle AI mode, select scan mode (quick/deep)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary">✓</span>
                        <span><strong className="text-white">Results View:</strong> Interactive results display with top issues</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary">✓</span>
                        <span><strong className="text-white">Report Upload:</strong> Automatic upload with shareable link generation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              {/* Examples Section */}
              <section id="examples" className="doc-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-primary" /> Real World Examples
                </h2>
                
                <div className="space-y-6">
                  {/* Folder Structure Example */}
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                      <FolderTree className="w-5 h-5" />
                      Example Project Structure
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Here's a typical project structure that VettCode will scan:
                    </p>
                    <div className="bg-gray-950 rounded p-4 font-mono text-sm text-gray-300">
                      <div className="space-y-1">
                        <div>my-project/</div>
                        <div className="ml-4">├── src/</div>
                        <div className="ml-8">│   ├── index.js</div>
                        <div className="ml-8">│   ├── auth.js</div>
                        <div className="ml-8">│   └── utils/</div>
                        <div className="ml-12">│       └── helpers.js</div>
                        <div className="ml-4">├── config/</div>
                        <div className="ml-8">│   └── database.js</div>
                        <div className="ml-4">├── package.json</div>
                        <div className="ml-4">└── node_modules/ <span className="text-gray-500">(auto-ignored)</span></div>
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-900/50 rounded p-3">
                      <code className="text-green-400">cd my-project && vettcode .</code>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Basic Usage</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Scan current directory with default settings:</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode .</code>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Scan specific directory:</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode ./backend</code>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Scan without web upload:</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode . --no-upload</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Scan Modes</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Quick scan (default, ~30s):</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode .</code>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Deep scan (comprehensive, ~2-3 min):</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode . --mode deep</code>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Fast static-only scan (no AI, ~30s):</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode . --no-ai</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Output Options</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Upload to web + save JSON locally:</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode . -o results.json</code>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Upload to web + print JSON to stdout:</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode . --json</code>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Local only (no web upload) + save JSON:</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode . --no-upload -o report.json</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Filtering</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Ignore specific directories:</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode . -i "node_modules,dist"</code>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Ignore test files:</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode . -i "*.test.js,*.spec.ts"</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Combined Examples</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Comprehensive pre-deployment scan:</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode . --mode deep -o detailed.json</code>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Quick CI/CD check (no AI):</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode . --no-ai -o results.json</code>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Development scan with debug info:</p>
                        <div className="bg-gray-950 rounded p-3">
                          <code className="text-green-400">vettcode . --verbose</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sample Report */}
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      View Sample Report
                    </h3>
                    <p className="text-gray-300 mb-4">
                      See what a VettCode security report looks like:
                    </p>
                    <a 
                      href="https://vettcodecli.vercel.app/reports/report_1785403535357_6z9r8dp6w" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg transition font-semibold"
                    >
                      <FileOutput className="w-5 h-5" />
                      Open Sample Report
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <p className="text-gray-400 text-sm mt-3">
                      This interactive report shows vulnerabilities, severity levels, code snippets, and fix recommendations.
                    </p>
                  </div>
                </div>
              </section>
              {/* Troubleshooting Section */}
              <section id="troubleshooting" className="doc-section">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Wrench className="w-8 h-8 text-primary" /> Troubleshooting
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Command not found: vettcode
                    </h3>
                    <p className="text-gray-300 mb-3">
                      If you get "command not found" after installation:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                      <li>Ensure you installed globally: <code className="text-primary bg-gray-800 px-2 py-1 rounded">npm install -g vettcode-cli</code></li>
                      <li>Check your npm global bin path is in PATH: <code className="text-primary bg-gray-800 px-2 py-1 rounded">npm config get prefix</code></li>
                      <li>Try restarting your terminal</li>
                      <li>On Windows, you may need to run as Administrator</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-yellow-400 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Upload failed / Network errors
                    </h3>
                    <p className="text-gray-300 mb-3">
                      If report upload fails:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                      <li>Check your internet connection</li>
                      <li>Check if firewall is blocking the connection</li>
                      <li>Use <code className="text-primary bg-gray-800 px-2 py-1 rounded">--no-upload</code> flag to skip upload and work offline</li>
                      <li>Report is always saved locally even if upload fails</li>
                    </ul>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-blue-400 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      No code files found
                    </h3>
                    <p className="text-gray-300 mb-3">
                      If the scanner reports no files found:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                      <li>Ensure you're in the correct directory</li>
                      <li>Check that your project has supported file types (.js, .ts, .jsx, .tsx, .py, .java, etc.)</li>
                      <li>Verify ignore patterns aren't excluding all files</li>
                      <li>Try running with <code className="text-primary bg-gray-800 px-2 py-1 rounded">--verbose</code> flag for more details</li>
                    </ul>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-purple-400 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      AI analysis failed
                    </h3>
                    <p className="text-gray-300 mb-3">
                      If AI analysis fails but you want results:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                      <li>The scan automatically falls back to enhanced static analysis</li>
                      <li>You still get comprehensive results (85% coverage)</li>
                      <li>Or explicitly use <code className="text-primary bg-gray-800 px-2 py-1 rounded">--no-ai</code> flag for fast static-only scan</li>
                      <li>Static analysis works completely offline</li>
                    </ul>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-green-400 flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Interactive UI crashes
                    </h3>
                    <p className="text-gray-300 mb-3">
                      If the interactive UI has issues:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                      <li>Use CLI mode instead: <code className="text-primary bg-gray-800 px-2 py-1 rounded">vettcode .</code></li>
                      <li>Ensure your terminal supports UTF-8 encoding</li>
                      <li>Try resizing your terminal window</li>
                      <li>Update to the latest version: <code className="text-primary bg-gray-800 px-2 py-1 rounded">npm update -g vettcode-cli</code></li>
                    </ul>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-primary/30 p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Getting Help
                    </h3>
                    <div className="space-y-3 text-gray-300">
                      <p>If you encounter other issues:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>
                          Run with <code className="text-primary bg-gray-800 px-2 py-1 rounded">--verbose</code> flag to see detailed logs
                        </li>
                        <li>
                          Check the <a href="https://github.com/mixifys33/vettcode-cli" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary underline">GitHub repository</a> for known issues
                        </li>
                        <li>
                          Report bugs on <a href="https://github.com/mixifys33/vettcode-cli/issues" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary underline">GitHub Issues</a>
                        </li>
                        <li>
                          Include version info: <code className="text-primary bg-gray-800 px-2 py-1 rounded">vettcode --version</code>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx global>{`
        .doc-section {
          scroll-margin-top: 100px;
        }

        code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
        }

        kbd {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.85em;
          font-weight: 600;
        }

        .grid-background {
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </main>
  );
}
