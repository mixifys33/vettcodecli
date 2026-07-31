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

export async function GET(req: NextRequest) {
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

    // Find developer
    const developer = await VettcodeDeveloper.findById(authResult.developer.id);
    if (!developer) {
      return NextResponse.json(
        { success: false, message: 'Developer not found' },
        { status: 404 }
      );
    }

    // Fetch reports from database
    const reports = await Report.find({
      developerId: authResult.developer.id,
      expiresAt: { $gt: new Date() }, // Only get non-expired reports
    })
      .sort({ createdAt: -1 }) // Newest first
      .limit(100) // Limit to 100 most recent reports
      .select('-findings') // Exclude findings array for performance
      .lean();

    // Format reports for frontend
    const formattedReports = reports.map((report: any) => ({
      id: report._id.toString(),
      projectName: report.projectName,
      score: report.score,
      grade: report.grade,
      summary: report.summary,
      totalFindings: report.totalFindings,
      criticalFindings: report.criticalFindings,
      highFindings: report.highFindings,
      mediumFindings: report.mediumFindings,
      lowFindings: report.lowFindings,
      infoFindings: report.infoFindings,
      createdAt: report.createdAt,
      expiresAt: report.expiresAt,
      reportUrl: report.reportUrl,
    }));

    return NextResponse.json({
      success: true,
      reports: formattedReports,
      count: formattedReports.length,
    });
  } catch (error: any) {
    console.error('List reports error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to list reports' },
      { status: 500 }
    );
  }
}
