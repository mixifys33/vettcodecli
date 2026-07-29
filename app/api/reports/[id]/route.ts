import { NextRequest, NextResponse } from "next/server";

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
