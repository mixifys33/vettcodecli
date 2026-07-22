"use client";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                <span className="text-primary font-bold text-xl">V</span>
              </div>
              <span className="text-xl font-bold">
                VETTCODE <span className="text-primary">CLI</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Enterprise-Grade Code Security Scanner
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#features" className="hover:text-primary transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#install" className="hover:text-primary transition">
                  Installation
                </a>
              </li>
              <li>
                <a href="#reports" className="hover:text-primary transition">
                  Reports
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#docs" className="hover:text-primary transition">
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/mixifys33/vettcode-cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/mixifys33/vettcode-cli/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition"
                >
                  Issues
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a
                  href="https://github.com/mixifys33/vettcode-cli/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition"
                >
                  Discussions
                </a>
              </li>
              <li>
                <a href="mailto:contact@vettcode.dev" className="hover:text-primary transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div>© 2024 VettCode. All rights reserved.</div>
          <div>
            Powered by <span className="text-primary">AD-Technologies</span> and <span className="text-primary">AI Enterprises</span>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Special thanks to Masereka Adorable and Hacker X
        </div>
      </div>
    </footer>
  );
}
