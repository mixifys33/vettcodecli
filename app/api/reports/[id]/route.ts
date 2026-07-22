import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * GET /api/reports/[id]
 * Fetch a report by ID with expiration check
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

    // Load report from storage
    const reportsDir = path.join(process.cwd(), "data", "reports");
    const reportPath = path.join(reportsDir, `${reportId}.json`);
    
    try {
      const fileContent = await fs.readFile(reportPath, "utf-8");
      const reportData = JSON.parse(fileContent);
      
      // Check expiration (7 days)
      const expiresAt = new Date(reportData.expiresAt);
      if (new Date() > expiresAt) {
        // Delete expired report
        await fs.unlink(reportPath);
        return NextResponse.json(
          { error: "Report has expired" },
          { status: 410 } // 410 Gone
        );
      }
      
      return NextResponse.json({
        success: true,
        report: reportData,
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[Report Fetch] Error:", error);
    return NextResponse.json(
      { error: "Failed to load report" },
      { status: 500 }
    );
  }
}
