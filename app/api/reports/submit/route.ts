import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(req: NextRequest) {
  try {
    // Verify token
    const authResult = await verifyToken(req);
    if (!authResult.authenticated || !authResult.developer) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const {
      projectName,
      score,
      grade,
      summary,
      findings = [],
      metadata = {},
      reportUrl,
    } = body;

    // Validate required fields
    if (!projectName || score === undefined || !grade || !summary) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Count findings by severity
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

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create report
    const report = await Report.create({
      developerId: authResult.developer.id,
      projectName,
      score,
      grade,
      summary,
      findings,
      totalFindings,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings,
      infoFindings,
      metadata,
      reportUrl,
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
      success: true,
      message: 'Report submitted successfully',
      report: {
        id: report._id,
        projectName: report.projectName,
        score: report.score,
        grade: report.grade,
        totalFindings: report.totalFindings,
        expiresAt: report.expiresAt,
        createdAt: report.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Submit report error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to submit report' },
      { status: 500 }
    );
  }
}
