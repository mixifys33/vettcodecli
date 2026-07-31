import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import jwt from 'jsonwebtoken';
import connectDB from '@/backend/config/database';
import VettcodeDeveloper from '@/backend/models/VettcodeDeveloper';
import Report from '@/backend/models/Report';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

async function verifyToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, developer: null };
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024'
    ) as JwtPayload;

    return { authenticated: true, developer: { id: decoded.id } };
  } catch (error) {
    return { authenticated: false, developer: null };
  }
}

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
 * Upload report to ImageKit from CLI (secure backend proxy) AND save to database
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.authenticated || !authResult.developer) {
      return NextResponse.json(
        { error: "Unauthorized - please login using 'vettcode login'" },
        { status: 401 }
      );
    }

    await connectDB();

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

    // Extract report details for database
    const findings = reportData.findings || [];
    let criticalFindings = 0;
    let highFindings = 0;
    let mediumFindings = 0;
    let lowFindings = 0;
    let infoFindings = 0;

    findings.forEach((finding: any) => {
      const severity = finding.severity?.toLowerCase();
      if (severity === 'critical') criticalFindings++;
      else if (severity === 'high') highFindings++;
      else if (severity === 'medium') mediumFindings++;
      else if (severity === 'low') lowFindings++;
      else if (severity === 'info' || severity === 'informational') infoFindings++;
    });

    const totalFindings = findings.length;
    const expiresAt = new Date(reportData.expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Save report to database
    const report = await Report.create({
      _id: reportId, // Use the reportId as the MongoDB _id
      developerId: authResult.developer.id,
      projectName,
      score: reportData.score || 0,
      grade: reportData.grade || 'F',
      summary: reportData.summary || `Security scan completed with ${totalFindings} findings.`,
      findings,
      totalFindings,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings,
      infoFindings,
      metadata: {
        cliVersion: reportData.metadata?.cliVersion,
        scanDuration: reportData.metadata?.scanDuration,
        filesScanned: reportData.metadata?.filesScanned,
        linesOfCode: reportData.metadata?.linesScanned,
        technologies: reportData.metadata?.technologies || [],
      },
      reportUrl: webUrl,
      expiresAt,
    });

    // Update developer's scan stats
    const developer = await VettcodeDeveloper.findById(authResult.developer.id);
    if (developer) {
      developer.scanStats.totalScans = (developer.scanStats.totalScans || 0) + 1;
      developer.scanStats.vulnerabilitiesFound = (developer.scanStats.vulnerabilitiesFound || 0) + totalFindings;
      developer.scanStats.lastScanDate = new Date();
      await developer.save();
    }

    return NextResponse.json({
      reportId,
      url: uploadResponse.url,
      webUrl,
      message: "Report uploaded successfully and saved to your account",
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
