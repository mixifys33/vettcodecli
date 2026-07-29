import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/reports/upload
 * Receive report metadata from CLI (report is already on ImageKit)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.reportId || !body.imageKitUrl) {
      return NextResponse.json(
        { error: "Missing required fields: reportId, imageKitUrl" },
        { status: 400 }
      );
    }

    const { reportId, imageKitUrl, projectName, expiresAt } = body;

    // Generate landing page URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vettcodecli.vercel.app";
    const reportUrl = `${baseUrl}/reports/${reportId}`;

    return NextResponse.json({
      success: true,
      reportId,
      reportUrl,
      imageKitUrl,
      expiresAt,
      message: "Report registered successfully",
    });
  } catch (error) {
    console.error("[Report Upload] Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to register report", details: errorMsg },
      { status: 500 }
    );
  }
}

// CORS headers
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
