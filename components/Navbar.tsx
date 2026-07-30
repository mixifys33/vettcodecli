"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isAuthenticated, getDeveloper, logout } from "@/lib/api-config";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [developer, setDeveloper] = useState<any>(null);

  useEffect(() => {
    // Check authentication status
    setIsLoggedIn(isAuthenticated());
    if (isAuthenticated()) {
      setDeveloper(getDeveloper());
    }
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setDeveloper(null);
  };

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
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-gray-300 hover:text-primary transition">
              Features
            </Link>
            <Link href="/docs" className="text-gray-300 hover:text-primary transition">
              Docs
            </Link>
            <a
              href="https://vetted-xi.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-primary transition flex items-center gap-1"
            >
              Web Scanner
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
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
            
            {/* Auth Buttons or User Menu */}
            {isLoggedIn && developer ? (
              <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-700">
                <div className="flex items-center gap-2">
                  {developer.profile?.avatar ? (
                    <img 
                      src={developer.profile.avatar} 
                      alt={developer.name}
                      className="w-8 h-8 rounded-full border border-primary/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {developer.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-300 font-medium">{developer.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-300 hover:text-primary transition font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-700">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-primary transition font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
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
              <Link href="/#features" className="text-gray-300 hover:text-primary transition">
                Features
              </Link>
              <Link href="/docs" className="text-gray-300 hover:text-primary transition">
                Docs
              </Link>
              <a
                href="https://vetted-xi.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition"
              >
                Web Scanner ↗
              </a>
              <a
                href="https://github.com/mixifys33/vettcode-cli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition"
              >
                GitHub ↗
              </a>
              
              {/* Mobile Auth Buttons or User Info */}
              {isLoggedIn && developer ? (
                <div className="pt-4 border-t border-gray-700 flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-lg">
                    {developer.profile?.avatar ? (
                      <img 
                        src={developer.profile.avatar} 
                        alt={developer.name}
                        className="w-10 h-10 rounded-full border border-primary/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {developer.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold">{developer.name}</p>
                      <p className="text-gray-400 text-sm">{developer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition font-semibold text-center"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-700 flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition font-semibold text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition font-semibold text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
