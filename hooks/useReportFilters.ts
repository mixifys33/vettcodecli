import { useState, useMemo } from "react";

export function useReportFilters(findings: any[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<string | null>(null);

  // Calculate severity counts
  const severityCounts = useMemo(() => {
    return {
      critical: findings.filter((f: any) => f.severity === "critical").length,
      high: findings.filter((f: any) => f.severity === "high").length,
      medium: findings.filter((f: any) => f.severity === "medium").length,
      low: findings.filter((f: any) => f.severity === "low").length,
    };
  }, [findings]);

  // Filter findings based on search and severity
  const filteredFindings = useMemo(() => {
    return findings.filter((finding: any) => {
      // Severity filter
      if (activeSeverityFilter && finding.severity !== activeSeverityFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          finding.title?.toLowerCase().includes(query) ||
          finding.description?.toLowerCase().includes(query) ||
          finding.file?.toLowerCase().includes(query) ||
          finding.category?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [findings, activeSeverityFilter, searchQuery]);

  const hasActiveFilters = Boolean(activeSeverityFilter || searchQuery);

  const handleSeverityClick = (severity: string) => {
    if (activeSeverityFilter === severity) {
      setActiveSeverityFilter(null);
    } else {
      setActiveSeverityFilter(severity);
    }
  };

  const clearFilters = () => {
    setActiveSeverityFilter(null);
    setSearchQuery("");
  };

  return {
    searchQuery,
    setSearchQuery,
    activeSeverityFilter,
    setActiveSeverityFilter,
    severityCounts,
    filteredFindings,
    hasActiveFilters,
    handleSeverityClick,
    clearFilters,
  };
}
