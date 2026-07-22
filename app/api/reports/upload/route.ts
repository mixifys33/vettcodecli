import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * POST /api/reports/upload
 * Upload a new report from CLI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.report || !body.projectName) {
      return NextResponse.json(
        { error: "Missing required fields: report, projectName" },
        { status: 400 }
      );
    }

    const { report, projectName, scanMode } = body;

    // Generate unique report ID
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create reports directory
    const reportsDir = path.join(process.cwd(), "data", "reports");
    await fs.mkdir(reportsDir, { recursive: true });
    
    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const reportData = {
      id: reportId,
      projectName,
      ...report,
      scanMode: scanMode || "quick",
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    
    // Save report
    const reportPath = path.join(reportsDir, `${reportId}.json`);
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2), "utf-8");

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vettcodecli.vercel.app";
    const reportUrl = `${baseUrl}/reports/${reportId}`;

    return NextResponse.json({
      success: true,
      reportId,
      reportUrl,
      expiresAt: expiresAt.toISOString(),
      message: "Report uploaded successfully",
    });
  } catch (error) {
    console.error("[Report Upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload report" },
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
