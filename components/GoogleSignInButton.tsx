"use client";

import { useEffect, useState } from "react";
import { API_CONFIG, getApiUrl } from "@/lib/api-config";

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  text?: "signin" | "signup";
}

export default function GoogleSignInButton({ 
  onSuccess, 
  onError,
  text = "signin" 
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInButton"),
          {
            theme: "filled_black",
            size: "large",
            text: text === "signin" ? "signin_with" : "signup_with",
            width: "100%",
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/google-auth/verify"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google sign-in failed");
      }

      // Store token and developer data
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.DEVELOPER, JSON.stringify(data.developer));
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.AUTHENTICATED, "true");

      if (onSuccess) {
        onSuccess(data);
      } else {
        // Default: redirect to dashboard
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred with Google sign-in";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center py-3 bg-gray-800 rounded-lg">
          <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
      <div 
        id="googleSignInButton" 
        className={loading ? "hidden" : ""}
        style={{ width: "100%" }}
      />
    </div>
  );
}
