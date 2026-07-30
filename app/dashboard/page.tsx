"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getDeveloper, logout } from "@/lib/api-config";
import Link from "next/link";

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

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pt-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl border border-primary/20 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {developer?.profile?.avatar ? (
                <img
                  src={developer.profile.avatar}
                  alt={developer.name}
                  className="w-20 h-20 rounded-full border-2 border-primary/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                  <span className="text-primary font-bold text-3xl">
                    {developer?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold mb-1">Welcome, {developer?.name}!</h1>
                <p className="text-gray-400">{developer?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    developer?.subscription?.plan === 'pro' ? 'bg-primary/20 text-primary border border-primary/30' :
                    developer?.subscription?.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    'bg-gray-700/50 text-gray-400 border border-gray-600'
                  }`}>
                    {developer?.subscription?.plan?.toUpperCase() || 'FREE'}
                  </span>
                  {developer?.isEmailVerified && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition"
            >
              Logout
            </button>
          </div>
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
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl border border-primary/20 p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center gap-4 p-4 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition group"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Go to Home</h3>
                <p className="text-sm text-gray-400">Back to landing page</p>
              </div>
            </Link>

            <Link
              href="/docs"
              className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition group"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Documentation</h3>
                <p className="text-sm text-gray-400">Learn how to use VettCode</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
