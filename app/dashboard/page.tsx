"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getDeveloper } from "@/lib/api-config";
import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardPage() {
  const router = useRouter();
  const [developer, setDeveloper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Get developer data
    const devData = getDeveloper();
    setDeveloper(devData);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout developer={developer}>
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl border border-primary/20 p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {developer?.name}!</h1>
          <p className="text-gray-400">Here's your security dashboard overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-400">Total Scans</h3>
            </div>
            <p className="text-3xl font-bold text-white">{developer?.scanStats?.totalScans || 0}</p>
            {developer?.scanStats?.lastScanDate && (
              <p className="text-xs text-gray-500 mt-1">
                Last scan: {new Date(developer.scanStats.lastScanDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-red-500/5 to-transparent rounded-xl border border-red-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-400">Vulnerabilities</h3>
            </div>
            <p className="text-3xl font-bold text-white">{developer?.scanStats?.vulnerabilitiesFound || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Found across all scans</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl border border-blue-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-400">Login Count</h3>
            </div>
            <p className="text-3xl font-bold text-white">{developer?.loginCount || 0}</p>
            {developer?.lastLogin && (
              <p className="text-xs text-gray-500 mt-1">
                Last login: {new Date(developer.lastLogin).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl border border-primary/20 p-8">
          <h2 className="text-2xl font-bold mb-4">Getting Started with VettCode CLI</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Install VettCode CLI</h3>
                <p className="text-gray-400 text-sm mb-2">Install the CLI tool using npm</p>
                <code className="block bg-gray-900 text-gray-300 px-4 py-2 rounded-lg text-sm">
                  npm install -g vettcode-cli
                </code>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Authenticate</h3>
                <p className="text-gray-400 text-sm mb-2">Login to your account</p>
                <code className="block bg-gray-900 text-gray-300 px-4 py-2 rounded-lg text-sm">
                  vettcode login
                </code>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Run Your First Scan</h3>
                <p className="text-gray-400 text-sm mb-2">Scan your project directory</p>
                <code className="block bg-gray-900 text-gray-300 px-4 py-2 rounded-lg text-sm">
                  vettcode scan /path/to/your/project
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
