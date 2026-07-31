import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/backend/config/database';
import VettcodeDeveloper from '@/backend/models/VettcodeDeveloper';

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

    // Mock data for now - In production, this would fetch from a Reports collection
    // For demonstration purposes, we'll return sample reports based on scan stats
    const mockReports = [];
    
    // Generate mock reports based on scanStats
    const totalScans = developer.scanStats?.totalScans || 0;
    const vulnerabilitiesFound = developer.scanStats?.vulnerabilitiesFound || 0;
    
    if (totalScans > 0) {
      // Create sample reports
      for (let i = 0; i < Math.min(totalScans, 10); i++) {
        const criticalCount = Math.floor(Math.random() * 3);
        const highCount = Math.floor(Math.random() * 5);
        const mediumCount = Math.floor(Math.random() * 8);
        const lowCount = Math.floor(Math.random() * 10);
        const totalFindings = criticalCount + highCount + mediumCount + lowCount;
        
        // Calculate score based on findings
        let score = 100;
        score -= criticalCount * 20;
        score -= highCount * 10;
        score -= mediumCount * 5;
        score -= lowCount * 2;
        score = Math.max(0, Math.min(100, score));
        
        // Determine grade
        let grade = 'F';
        if (score >= 90) grade = 'A';
        else if (score >= 80) grade = 'B';
        else if (score >= 70) grade = 'C';
        else if (score >= 60) grade = 'D';
        
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        mockReports.push({
          id: `report-${developer._id}-${i}`,
          projectName: `Project ${i + 1}`,
          score: score,
          grade: grade,
          summary: `Security scan found ${totalFindings} issue${totalFindings !== 1 ? 's' : ''} across multiple categories.`,
          totalFindings: totalFindings,
          criticalFindings: criticalCount,
          highFindings: highCount,
          mediumFindings: mediumCount,
          lowFindings: lowCount,
          createdAt: date.toISOString(),
          expiresAt: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      reports: mockReports,
      count: mockReports.length,
    });
  } catch (error: any) {
    console.error('List reports error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to list reports' },
      { status: 500 }
    );
  }
}
