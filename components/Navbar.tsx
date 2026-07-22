"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-darker/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
              <span className="text-primary font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold">
              VETTCODE <span className="text-primary">CLI</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-300 hover:text-primary transition">
              Features
            </Link>
            <Link href="#docs" className="text-gray-300 hover:text-primary transition">
              Docs
            </Link>
            <a
              href="https://github.com/mixifys33/vettcode-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-primary transition flex items-center gap-1"
            >
              GitHub
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <Link
              href="#reports"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold"
            >
              Try Sample Report
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-4">
              <Link href="#features" className="text-gray-300 hover:text-primary transition">
                Features
              </Link>
              <Link href="#docs" className="text-gray-300 hover:text-primary transition">
                Docs
              </Link>
              <a
                href="https://github.com/mixifys33/vettcode-cli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition"
              >
                GitHub
              </a>
              <Link
                href="#reports"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold text-center"
              >
                Try Sample Report
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
