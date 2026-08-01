import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import jwt from 'jsonwebtoken';
import connectDB from '@/backend/config/database';
import Report from '@/backend/models/Report';

// Initialize ImageKit with validation
function getImageKitInstance() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  console.log('[ImageKit Init] Config check:', {
    hasPublicKey: !!publicKey,
    hasPrivateKey: !!privateKey,
    hasUrlEndpoint: !!urlEndpoint,
    publicKeyLength: publicKey?.length,
    privateKeyLength: privateKey?.length,
  });

  if (!publicKey || !privateKey || !urlEndpoint) {
    console.error('[ImageKit Init] Missing credentials!', {
      publicKey: publicKey ? 'present' : 'MISSING',
      privateKey: privateKey ? 'present' : 'MISSING',
      urlEndpoint: urlEndpoint ? 'present' : 'MISSING',
    });
    throw new Error('ImageKit credentials not configured');
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
}

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
    let imagekitError = null;
    
    try {
      const imagekit = getImageKitInstance();
      console.log('[Report Delete] ImageKit instance created successfully');
      
      console.log('[Report Delete] Searching for file in ImageKit...');
      
      // Method 1: Search by name
      const files = await imagekit.listFiles({
        path: "/vettcode-reports",
        searchQuery: `name="${reportId}.json"`,
      });

      console.log('[Report Delete] ImageKit search result:', {
        filesFound: files?.length || 0,
        files: files?.map((f: any) => ({ fileId: f.fileId, name: f.name, filePath: f.filePath }))
      });

      if (files && files.length > 0) {
        console.log('[Report Delete] Attempting to delete file:', files[0].fileId);
        const deleteResult = await imagekit.deleteFile(files[0].fileId);
        imagekitDeleted = true;
        console.log('[Report Delete] Successfully deleted from ImageKit:', deleteResult);
      } else {
        // Method 2: Try searching without path restriction
        console.log('[Report Delete] Trying broader search without path...');
        const allFiles = await imagekit.listFiles({
          searchQuery: `name="${reportId}.json"`,
        });
        
        console.log('[Report Delete] Broader search result:', {
          filesFound: allFiles?.length || 0,
          files: allFiles?.map((f: any) => ({ fileId: f.fileId, name: f.name, filePath: f.filePath }))
        });
        
        if (allFiles && allFiles.length > 0) {
          console.log('[Report Delete] Attempting to delete file (broader search):', allFiles[0].fileId);
          const deleteResult = await imagekit.deleteFile(allFiles[0].fileId);
          imagekitDeleted = true;
          console.log('[Report Delete] Successfully deleted from ImageKit (broader search):', deleteResult);
        } else {
          // Method 3: Try listing all files in folder and filtering
          console.log('[Report Delete] Trying to list all files in folder...');
          const folderFiles = await imagekit.listFiles({
            path: "/vettcode-reports",
            limit: 1000,
          });
          
          console.log('[Report Delete] Folder listing result:', {
            filesFound: folderFiles?.length || 0,
            sampleFiles: folderFiles?.slice(0, 5).map((f: any) => ({ name: f.name, fileId: f.fileId }))
          });
          
          const matchingFile = folderFiles?.find((f: any) => f.name === `${reportId}.json`);
          
          if (matchingFile) {
            console.log('[Report Delete] Found matching file in folder listing:', matchingFile.fileId);
            const deleteResult = await imagekit.deleteFile(matchingFile.fileId);
            imagekitDeleted = true;
            console.log('[Report Delete] Successfully deleted from ImageKit (folder listing):', deleteResult);
          } else {
            console.log('[Report Delete] File not found in ImageKit after all attempts');
            console.log('[Report Delete] Searched for:', `${reportId}.json`);
          }
        }
      }
    } catch (error: any) {
      imagekitError = error;
      console.error('[Report Delete] ImageKit deletion error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        response: error.response?.data || error.response,
        help: error.help,
      });
    }

    // Delete from MongoDB
    await Report.deleteOne({ _id: report._id });
    console.log('[Report Delete] Deleted from MongoDB');

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
      imagekitDeleted,
      imagekitError: imagekitError ? {
        message: imagekitError.message,
        name: imagekitError.name,
      } : null,
    });
  } catch (error) {
    console.error("[Report Delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete report", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
