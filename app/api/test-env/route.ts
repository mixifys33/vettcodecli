import { NextResponse } from "next/server";

export async function GET() {
  const hasApiKey = !!process.env.OPENROUTER_API_KEY;
  const apiKeyPrefix = process.env.OPENROUTER_API_KEY?.substring(0, 15) || "NOT_SET";

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    openRouterConfigured: hasApiKey,
    apiKeyPrefix: apiKeyPrefix,
    availableEnvVars: {
      OPENROUTER_API_KEY: hasApiKey ? "✅ SET" : "❌ NOT SET",
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "❌ NOT SET",
    }
  });
}
