"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { API_CONFIG, getApiUrl } from "@/lib/api-config";
import toast, { Toaster } from 'react-hot-toast';
import GoogleSignInButton from "@/components/GoogleSignInButton";

function CLIAuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userCode, setUserCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
    setIsAuthenticated(!!token);

    // Pre-fill code from URL
    const code = searchParams.get("code");
    if (code) {
      setUserCode(code.toUpperCase());
      verifyCode(code);
    }
  }, [searchParams]);

  const verifyCode = async (code: string) => {
    if (!code || code.length < 6) return;

    setVerifying(true);
    try {
      const response = await fetch(
        getApiUrl(`/api/device-auth/verify-code/${code.toUpperCase()}`),
        { method: "GET" }
      );

      const data = await response.json();
      setCodeValid(data.success);

      if (!data.success) {
        toast.error(data.message || "Invalid code");
      }
    } catch (error) {
      console.error("Code verification error:", error);
      setCodeValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleApprove = async () => {
    if (!userCode || userCode.length < 6) {
      toast.error("Please enter a valid code");
      return;
    }

    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
    if (!token) {
      toast.error("Please login first");
      router.push(`/login?redirect=/cli-auth?code=${userCode}`);
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Authorizing device...');

    try {
      const response = await fetch(getApiUrl("/api/device-auth/approve"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userCode: userCode.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve device");
      }

      toast.success('Device authorized successfully! 🎉', { id: loadingToast });
      
      // Show success state
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to approve device";
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!userCode || userCode.length < 6) {
      toast.error("Please enter a valid code");
      return;
    }

    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Rejecting device...');

    try {
      const response = await fetch(getApiUrl("/api/device-auth/reject"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userCode: userCode.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject device");
      }

      toast.success("Device authorization rejected", { id: loadingToast });
      
      // Show rejection message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to reject device";
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center px-4 py-12">
      <Toaster position="top-center" />

      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <span className="text-primary font-bold text-2xl">V</span>
            </div>
            <span className="text-2xl font-bold">
              VETTCODE <span className="text-primary">CLI</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Authorize CLI Access</h1>
          <p className="text-gray-400">
            {isAuthenticated
              ? "Confirm this code to authorize your device"
              : "Please login to authorize your CLI"}
          </p>
        </motion.div>

        {/* Auth Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl border border-primary/20 p-8 backdrop-blur-sm"
        >
          {/* Security Notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">Security Notice</p>
                <p className="text-blue-400">
                  Only approve this code if you initiated a login from VettCode CLI on your device.
                </p>
              </div>
            </div>
          </div>

          {/* Code Input */}
          <div className="mb-6">
            <label htmlFor="code" className="block text-sm font-medium mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={userCode}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                setUserCode(value);
                if (value.length === 7) {
                  verifyCode(value);
                }
              }}
              placeholder="ABC-123"
              maxLength={7}
              className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-center text-2xl font-mono tracking-wider placeholder-gray-500"
              disabled={verifying}
            />
            {verifying && (
              <p className="text-sm text-gray-400 mt-2 text-center">
                Verifying code...
              </p>
            )}
            {codeValid === false && (
              <p className="text-sm text-red-400 mt-2 text-center">
                Invalid or expired code
              </p>
            )}
            {codeValid === true && (
              <p className="text-sm text-green-400 mt-2 text-center flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Valid code
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
            <p className="text-sm text-gray-300 mb-2">
              <span className="font-semibold text-white">How to get your code:</span>
            </p>
            <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
              <li>Run <code className="px-1.5 py-0.5 bg-gray-900 rounded text-primary">vettcode login</code> in your terminal</li>
              <li>Copy the 6-character code displayed</li>
              <li>Enter it above and click "Authorize"</li>
            </ol>
          </div>

          {!isAuthenticated ? (
            <div className="space-y-3">
              <Link
                href={`/login?redirect=/cli-auth${userCode ? `?code=${userCode}` : ''}`}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Login with Email
              </Link>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-sm text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              {/* Google Sign In */}
              <GoogleSignInButton 
                text="signin"
                onError={(error) => toast.error(error)}
              />

              {/* Divider */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-sm text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              <Link
                href={`/signup?redirect=/cli-auth${userCode ? `?code=${userCode}` : ''}`}
                className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2"
              >
                Create Account
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleApprove}
                disabled={loading || !userCode || codeValid === false}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Authorizing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Authorize Device
                  </>
                )}
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="w-full px-6 py-3 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg font-semibold hover:bg-red-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Deny Access
              </button>
            </div>
          )}
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Link href="/" className="text-gray-400 hover:text-primary transition text-sm">
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function CLIAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <CLIAuthContent />
    </Suspense>
  );
}
