import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import jwt from 'jsonwebtoken';
import connectDB from '@/backend/config/database';
import Report from '@/backend/models/Report';

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

async function verifyToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, developerId: null };
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'vettcode-jwt-secret-key-2024'
    ) as JwtPayload;

    return { authenticated: true, developerId: decoded.id };
  } catch (error) {
    return { authenticated: false, developerId: null };
  }
}

/**
 * GET /api/reports/[id]
 * Fetch report directly from ImageKit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    
    if (!reportId || !reportId.startsWith("report_")) {
      return NextResponse.json(
        { error: "Invalid report ID" },
        { status: 400 }
      );
    }

    // Construct ImageKit URL from report ID
    const imageKitUrl = `https://ik.imagekit.io/HackerX1234567/vettcode-reports/${reportId}.json`;
    
    console.log('[Report Fetch] Fetching from ImageKit:', imageKitUrl);
    
    // Fetch report from ImageKit with retry
    let response;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch(imageKitUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store', // Don't cache to get latest
        });
        
        if (response.ok) break;
        
        lastError = new Error(`ImageKit returned ${response.status}`);
        
        // Wait before retry
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Fetch failed');
      }
    }
    
    if (!response || !response.ok) {
      console.error('[Report Fetch] Failed to fetch from ImageKit:', lastError);
      
      if (response?.status === 404) {
        return NextResponse.json(
          { error: "Report not found or expired", details: "The report may have been deleted or the URL is incorrect" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to load report", details: lastError?.message || 'Unknown error' },
        { status: 500 }
      );
    }
    
    const reportData = await response.json();
    
    // Check expiration
    if (reportData.expiresAt && new Date() > new Date(reportData.expiresAt)) {
      return NextResponse.json(
        { error: "Report has expired" },
        { status: 410 }
      );
    }
    
    console.log('[Report Fetch] Successfully loaded report:', reportId);
    
    return NextResponse.json({
      success: true,
      report: reportData,
    });
  } catch (error) {
    console.error("[Report Fetch] Error:", error);
    return NextResponse.json(
      { error: "Failed to load report", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/[id]
 * Delete report from both MongoDB and ImageKit
 * Requires authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    
    if (!reportId || !reportId.startsWith("report_")) {
      return NextResponse.json(
        { error: "Invalid report ID" },
        { status: 400 }
      );
    }

    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.authenticated || !authResult.developerId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    console.log('[Report Delete] User:', authResult.developerId, 'Report:', reportId);

    await connectDB();

    // Find report in MongoDB and verify ownership
    const report = await Report.findOne({
      reportId: reportId,
      developerId: authResult.developerId,
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    console.log('[Report Delete] Found report, deleting from ImageKit and MongoDB');

    // Delete from ImageKit - try multiple approaches
    let imagekitDeleted = false;
    try {
      console.log('[Report Delete] Searching for file in ImageKit...');
      
      // Method 1: Search by name
      const files = await imagekit.listFiles({
        path: "/vettcode-reports",
        searchQuery: `name="${reportId}.json"`,
      });

      console.log('[Report Delete] ImageKit search result:', files?.length || 0, 'files found');

      if (files && files.length > 0) {
        console.log('[Report Delete] Found file:', files[0].fileId, files[0].name);
        await imagekit.deleteFile(files[0].fileId);
        imagekitDeleted = true;
        console.log('[Report Delete] Successfully deleted from ImageKit');
      } else {
        // Method 2: Try searching without path restriction
        console.log('[Report Delete] Trying broader search...');
        const allFiles = await imagekit.listFiles({
          searchQuery: `name="${reportId}.json"`,
        });
        
        console.log('[Report Delete] Broader search found:', allFiles?.length || 0, 'files');
        
        if (allFiles && allFiles.length > 0) {
          console.log('[Report Delete] Found file in broader search:', allFiles[0].fileId);
          await imagekit.deleteFile(allFiles[0].fileId);
          imagekitDeleted = true;
          console.log('[Report Delete] Successfully deleted from ImageKit (broader search)');
        } else {
          // Method 3: Try listing all files in folder and filtering
          console.log('[Report Delete] Trying to list all files in folder...');
          const folderFiles = await imagekit.listFiles({
            path: "/vettcode-reports",
            limit: 1000,
          });
          
          const matchingFile = folderFiles?.find((f: any) => f.name === `${reportId}.json`);
          
          if (matchingFile) {
            console.log('[Report Delete] Found file via folder listing:', matchingFile.fileId);
            await imagekit.deleteFile(matchingFile.fileId);
            imagekitDeleted = true;
            console.log('[Report Delete] Successfully deleted from ImageKit (folder listing)');
          } else {
            console.log('[Report Delete] File not found in ImageKit after all attempts');
          }
        }
      }
    } catch (imagekitError: any) {
      console.error('[Report Delete] ImageKit deletion error:', {
        message: imagekitError.message,
        stack: imagekitError.stack,
        response: imagekitError.response?.data || imagekitError.response,
      });
      // Continue with MongoDB deletion even if ImageKit fails
    }

    // Delete from MongoDB
    await Report.deleteOne({ _id: report._id });
    console.log('[Report Delete] Deleted from MongoDB');

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
      imagekitDeleted, // Return whether ImageKit deletion succeeded
    });
  } catch (error) {
    console.error("[Report Delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete report", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
