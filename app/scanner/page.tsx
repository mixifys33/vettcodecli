"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebScanner from "@/components/scanner/WebScanner";

export default function ScannerPage() {
  return (
    <main className="min-h-screen bg-darker text-white">
      <div className="grid-background">
        <Navbar />
        
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Web-Based Scanner
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Scan your code directly in the browser. No installation required. 
                Reports stay private and are stored locally on your device.
              </p>
              
              <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <span className="text-2xl">🔒</span>
                  <span className="text-sm text-gray-300">100% Private - Nothing Uploaded</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-2xl">⚡</span>
                  <span className="text-sm text-gray-300">Fast Browser-Based Scanning</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <span className="text-2xl">💾</span>
                  <span className="text-sm text-gray-300">Reports Saved Locally</span>
                </div>
              </div>
            </div>

            <WebScanner />
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
