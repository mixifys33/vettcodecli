import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/test-env
 * Test endpoint to check which environment variables are set
 * REMOVE THIS IN PRODUCTION!
 */
export async function GET(request: NextRequest) {
  const envCheck = {
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    IMAGEKIT_PRIVATE_KEY: !!process.env.IMAGEKIT_PRIVATE_KEY,
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: !!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
  };

  return NextResponse.json({
    message: "Environment variables check (true = set, false = missing)",
    variables: envCheck,
    allSet: Object.values(envCheck).every(v => v === true),
  });
}
