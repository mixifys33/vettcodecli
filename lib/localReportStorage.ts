/**
 * Local Report Storage Utility
 * Manages browser-based report storage using localStorage
 * Reports stored here are NEVER uploaded to any server
 */

export interface LocalReport {
  id: string; // Format: local_<timestamp>_<random>
  projectName: string;
  report: any; // Full VettReport structure
  savedAt: string;
  scanMode: "quick" | "deep";
  source: "web-scanner"; // Distinguish from CLI reports
}

const STORAGE_KEY = "vettcode_local_reports";
const MAX_REPORTS = 50;

/**
 * Get all local reports from localStorage
 */
export function getLocalReports(): LocalReport[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const reports = JSON.parse(stored) as LocalReport[];
    
    if (!Array.isArray(reports)) {
      console.error("Invalid local reports data");
      return [];
    }
    
    // Validate and filter valid reports
    const validReports = reports.filter(r => 
      r && 
      typeof r === 'object' &&
      typeof r.id === 'string' &&
      r.id.startsWith('local_') &&
      typeof r.projectName === 'string' &&
      r.report &&
      typeof r.savedAt === 'string' &&
      r.source === 'web-scanner'
    );
    
    // Sort by most recent first
    return validReports.sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
  } catch (error) {
    console.error("Error loading local reports:", error);
    return [];
  }
}

/**
 * Save a new local report
 */
export function saveLocalReport(
  projectName: string,
  report: any,
  scanMode: "quick" | "deep" = "quick"
): LocalReport {
  if (typeof window === "undefined") {
    throw new Error("Cannot save reports on server");
  }
  
  const localReport: LocalReport = {
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectName,
    report,
    savedAt: new Date().toISOString(),
    scanMode,
    source: "web-scanner",
  };
  
  try {
    const existingReports = getLocalReports();
    const updatedReports = [localReport, ...existingReports];
    const limitedReports = updatedReports.slice(0, MAX_REPORTS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedReports));
    
    return localReport;
  } catch (error) {
    console.error("Error saving local report:", error);
    throw error;
  }
}

/**
 * Get a specific local report by ID
 */
export function getLocalReportById(reportId: string): LocalReport | null {
  if (typeof window === "undefined") return null;
  if (!reportId.startsWith('local_')) return null;
  
  const reports = getLocalReports();
  return reports.find(r => r.id === reportId) || null;
}

/**
 * Delete a local report by ID
 */
export function deleteLocalReport(reportId: string): boolean {
  if (typeof window === "undefined") return false;
  if (!reportId.startsWith('local_')) return false;
  
  try {
    const reports = getLocalReports();
    const filtered = reports.filter(r => r.id !== reportId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting local report:", error);
    return false;
  }
}

/**
 * Update local report project name
 */
export function updateLocalReportName(reportId: string, newName: string): boolean {
  if (typeof window === "undefined") return false;
  if (!reportId.startsWith('local_')) return false;
  
  try {
    const reports = getLocalReports();
    const updated = reports.map(r => 
      r.id === reportId ? { ...r, projectName: newName } : r
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Error updating local report name:", error);
    return false;
  }
}

/**
 * Clear all local reports
 */
export function clearAllLocalReports(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing local reports:", error);
    return false;
  }
}

/**
 * Export local report as downloadable JSON file
 */
export function exportLocalReport(reportId: string): void {
  const report = getLocalReportById(reportId);
  if (!report) {
    throw new Error("Report not found");
  }
  
  const dataStr = JSON.stringify(report, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.projectName}_${report.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Get storage usage info
 */
export function getLocalStorageInfo(): { 
  count: number; 
  maxReports: number;
  estimatedSize: number; // in bytes
} {
  const reports = getLocalReports();
  const stored = localStorage.getItem(STORAGE_KEY);
  const estimatedSize = stored ? new Blob([stored]).size : 0;
  
  return {
    count: reports.length,
    maxReports: MAX_REPORTS,
    estimatedSize,
  };
}
