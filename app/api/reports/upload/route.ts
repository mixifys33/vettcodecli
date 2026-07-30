import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

// Initialize ImageKit client
function getImageKitClient() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("ImageKit credentials not configured");
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
}

/**
 * POST /api/reports/upload
 * Upload report to ImageKit from CLI (secure backend proxy)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.reportData || !body.reportId || !body.projectName) {
      return NextResponse.json(
        { error: "Missing required fields: reportData, reportId, projectName" },
        { status: 400 }
      );
    }

    const { reportData, reportId, projectName } = body;

    // Upload to ImageKit
    const imagekit = getImageKitClient();
    const fileName = `${reportId}.json`;
    const fileContent = JSON.stringify(reportData, null, 2);
    
    // Convert to base64 for ImageKit
    const base64Content = Buffer.from(fileContent, 'utf-8').toString('base64');
    
    const uploadResponse = await imagekit.upload({
      file: base64Content,
      fileName: fileName,
      folder: '/vettcode-reports',
      useUniqueFileName: false,
      tags: ['report', 'vettcode', 'cli', projectName],
    });

    // Generate web URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vettcodecli.vercel.app";
    const webUrl = `${baseUrl}/reports/${reportId}`;

    return NextResponse.json({
      reportId,
      url: uploadResponse.url,
      webUrl,
      message: "Report uploaded successfully",
    });
    
  } catch (error) {
    console.error("[Report Upload] Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to upload report", details: errorMsg },
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
