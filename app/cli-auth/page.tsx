"use client";

import { useState, useEffect } from "react";
import { isAuthenticated, getDeveloper } from "@/lib/api-config";
import { useRouter } from "next/navigation";

export default function CLIAuthPage() {
  const router = useRouter();
  const [userCode, setUserCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [developer, setDeveloper] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Redirect to login with return URL
      router.push(`/login?returnTo=/cli-auth`);
      return;
    }

    setDeveloper(getDeveloper());
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userCode.trim()) {
      setError("Please enter the code from your CLI");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("vettcode_cli_token");
      
      if (!token) {
        setError("You must be logged in to authorize a device");
        router.push(`/login?returnTo=/cli-auth`);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/cli/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_code: userCode.toUpperCase().trim(),
          developer_token: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify code");
      }

      setSuccess(true);
      setUserCode("");
    } catch (err: any) {
      setError(err.message || "Failed to authorize device");
    } finally {
      setLoading(false);
    }
  };

  if (!developer) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-darker text-white">
      <div className="grid-background">
        {/* Header */}
        <header className="border-b border-gray-800 bg-darker/80 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                  <span className="text-primary font-bold text-xl">V</span>
                </div>
                <span className="text-xl font-bold">
                  VETTCODE <span className="text-primary">CLI</span>
                </span>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-gray-400 hover:text-primary transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!success ? (
            <div className="bg-surface border border-gray-800 rounded-2xl p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-center mb-2">
                Authorize VettCode CLI
              </h1>
              <p className="text-center text-gray-400 mb-8">
                Enter the code displayed in your terminal to connect your CLI
              </p>

              {/* User Info */}
              <div className="bg-darker border border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  {developer.profile?.avatar ? (
                    <img
                      src={developer.profile.avatar}
                      alt={developer.name}
                      className="w-12 h-12 rounded-full border-2 border-primary/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {developer.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{developer.name}</p>
                    <p className="text-sm text-gray-400">{developer.email}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="userCode" className="block text-sm font-medium text-gray-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="userCode"
                    type="text"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                    placeholder="ABC-123"
                    maxLength={7}
                    className="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary text-center text-2xl font-mono tracking-widest"
                    disabled={loading}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Format: XXX-XXX (6 characters)
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !userCode.trim()}
                  className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    "Authorize Device"
                  )}
                </button>
              </form>

              {/* Info */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-semibold mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Your CLI will be authorized to access your account
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    You can revoke access anytime from your dashboard
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Your authentication is secure and encrypted
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-gray-800 rounded-2xl p-8 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold mb-2">Device Authorized!</h2>
              <p className="text-gray-400 mb-8">
                Your CLI is now connected. You can close this window and return to your terminal.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setUserCode("");
                  }}
                  className="px-6 py-2 border border-gray-700 hover:border-primary text-white rounded-lg transition"
                >
                  Authorize Another Device
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
