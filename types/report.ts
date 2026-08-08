/**
 * VettCode Report Types
 * Supports BOTH old and new structured formats
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingCategory = 'security' | 'quality' | 'performance' | 'production' | 'best-practices';

export interface Finding {
  id: string;
  severity: Severity;
  category: FindingCategory;
  title: string;
  description: string;
  file: string;
  line?: number;
  evidence?: string;
  mitigation?: string;
  prevention?: string;
  source?: string;
}

// ============================================================================
// NEW STRUCTURED FORMAT TYPES
// ============================================================================

/**
 * Root Cause (Collapsed causal origin)
 */
export interface RootCause {
  id: string;
  title: string;
  type: string;
  source: string;
  relatedIssueIds: string[];
  attackPaths: Array<{
    source: string;
    path: string[];
    sink: string;
    dataType?: string;
  }>;
  impact: {
    severity: Severity;
    exploitability: 'high' | 'medium' | 'low';
    affectedFiles: string[];
    attackTypes: string[];
    consequences: string[];
    criticalityScore: number;
  };
  whyItExists: string;
  fixStrategy: string[];
}

/**
 * Code Fix (Exact transformation)
 */
export interface CodeFix {
  issueId: string;
  title: string;
  file: string;
  line: number;
  strategy: string;
  before: string;
  after: string;
  explanation: string;
  validated: boolean;
  validationError?: string;
}

/**
 * Data Flow Graph (Visualization)
 */
export interface DataFlowNode {
  id: string;
  label: string;
  type: 'source' | 'sink' | 'variable' | 'function';
  dataType?: string;
  file?: string;
  line?: number;
}

export interface DataFlowEdge {
  from: string;
  to: string;
  tainted: boolean;
  sanitized: boolean;
  label?: string;
}

export interface DataFlowGraph {
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  stats: {
    totalFlows: number;
    taintedFlows: number;
    sanitizedFlows: number;
    sources: number;
    sinks: number;
  };
}

/**
 * Blueprint (Architecture map)
 */
export interface BlueprintNode {
  path: string;
  type: 'file' | 'directory';
  riskScore?: number;
  functions?: string[];
}

export interface BlueprintEdge {
  from: string;
  to: string;
  type: 'import' | 'call' | 'export';
}

export interface Blueprint {
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
  entryPoints: string[];
  riskAreas: Array<{
    file: string;
    reason: string;
    severity: Severity;
  }>;
  meta: {
    totalFiles: number;
    totalFunctions: number;
    analysisTime: number;
  };
}

/**
 * Issue Group (Prioritized cluster)
 */
export interface IssueGroup {
  groupId: string;
  rootCauseId?: string;
  title: string;
  severity: Severity;
  issueCount: number;
  affectedFiles: string[];
  issues: Finding[];
  fixId?: string;
  priority: number;
  riskScore: number;
}

/**
 * Report Summary
 */
export interface ReportSummary {
  totalIssues: number;
  confirmedIssues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  rootCauses: number;
  fixesAvailable: number;
  topRisks: string[];
  score: number;
  grade: string;
}

/**
 * Structured Report (NEW FORMAT)
 */
export interface StructuredReport {
  summary: ReportSummary;
  rootCauses: RootCause[];
  groups: IssueGroup[];
  fixes: CodeFix[];
  metadata: {
    scannedAt: string;
    filesScanned: number;
    linesScanned: number;
    analysisTime?: number;
  };
}

// ============================================================================
// LEGACY FORMAT
// ============================================================================

export interface LegacyReport {
  id: string;
  projectName: string;
  score: number;
  grade: string;
  summary: string;
  executiveVerdict?: string;
  findings: Finding[];
  strengths?: string[];
  criticalBlockers?: string[];
  metadata?: {
    projectName?: string;
    scannedAt?: string;
    filesScanned?: number;
    linesScanned?: number;
    staticFindings?: number;
    aiFindings?: number;
    verifiedFindings?: number;
    reportConfidence?: number;
    reportConfidenceGrade?: string;
    issueDetector?: {
      totalIssues: number;
      confirmedIssues: number;
      confirmationRate: string;
    };
    rootCauseAnalysis?: {
      rootCausesFound: number;
      issuesGrouped: number;
      reductionRate: string;
      highExploitability: number;
    };
    fixEngine?: {
      fixesGenerated: number;
      validatedFixes: number;
      fixRate: string;
    };
  };
  expiresAt: string;
  createdAt: string;
}

// ============================================================================
// UNIFIED REPORT (Supports both formats)
// ============================================================================

export interface Report extends LegacyReport {
  // NEW FORMAT FIELDS (optional for backward compatibility)
  structured?: StructuredReport;
  blueprint?: Blueprint;
  dataFlowGraph?: DataFlowGraph;
  rootCauses?: RootCause[];
  codeFixes?: CodeFix[];
  
  // Format flag
  format?: 'legacy' | 'structured';
}

// ============================================================================
// UPLOAD RESPONSE
// ============================================================================

export interface UploadResponse {
  reportId: string;
  url: string;
  webUrl: string;
  dataFlowUrl?: string;
  blueprintUrl?: string;
  format?: 'legacy' | 'structured';
  features?: {
    rootCauses: number;
    codeFixes: number;
    dataFlowGraph: boolean;
    blueprint: boolean;
  };
}
