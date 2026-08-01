/**
 * Web Scanner Component - Placeholder
 * 
 * TODO: Copy the scanning logic from C:\Users\USER\Desktop\VETTCODE\Vettcode-scanner
 * 
 * Required files to copy:
 * 1. /src/lib/static-analyzer.ts
 * 2. /src/lib/file-collector.ts
 * 3. /src/lib/ast-extractor.ts
 * 4. /src/lib/enhanced-patterns.ts
 * 5. /src/lib/verification-layer.ts
 * 6. /src/lib/zip-collector.ts
 * 7. /src/components/UploadZone.tsx
 * 8. /src/components/ScanProgress.tsx
 * 9. All related types from /src/lib/types.ts
 * 
 * Integration points:
 * - Use saveLocalReport() from @/lib/localReportStorage to save reports
 * - Navigate to /reports/[id] after scan completes
 * - Show proper loading states and error handling
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveLocalReport } from "@/lib/localReportStorage";
import { toast } from "sonner";

export default function WebScanner() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScanComplete = (projectName: string, reportData: any) => {
    try {
      // Save report locally
      const savedReport = saveLocalReport(projectName, reportData, "quick");
      
      toast.success("Scan complete!", {
        description: `Report saved locally. View it now.`,
      });
      
      // Navigate to report page
      router.push(`/reports/${savedReport.id}`);
    } catch (error: any) {
      console.error("Failed to save report:", error);
      toast.error("Failed to save report", {
        description: error.message || "Please try again",
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-dark to-darker rounded-2xl border border-primary/20 p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-3xl font-bold mb-2">Web Scanner Coming Soon</h2>
        <p className="text-gray-400">
          The web-based scanner component is currently being integrated.
        </p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
        <h3 className="font-semibold text-blue-300 mb-3">For Now, Use the CLI:</h3>
        <div className="bg-dark rounded-lg p-4 font-mono text-sm text-gray-300">
          <div className="mb-2">$ npm install -g vettcode</div>
          <div>$ vettcode scan</div>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Reports uploaded via CLI will appear in the "CLI Reports" tab.
        </p>
      </div>

      {/* TODO: Replace this with actual scanner UI */}
      <div className="mt-8 space-y-4">
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-500">Drag & drop code files or ZIP here</p>
          <p className="text-sm text-gray-600 mt-2">(Feature coming soon)</p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition"
        >
          Learn About VettCode CLI
        </a>
      </div>
    </div>
  );
}
