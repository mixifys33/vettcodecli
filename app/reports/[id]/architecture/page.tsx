"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileCode,
  GitBranch,
  AlertTriangle,
  Layers,
  Network,
  ArrowLeft,
  Shield,
  TrendingUp,
  Database,
  Globe,
  Zap,
  Target,
} from "lucide-react";

interface Blueprint {
  meta: {
    totalFiles: number;
    totalModules: number;
    entryPoints: number;
    externalCalls: number;
    timestamp: string;
  };
  structure: any;
  dependencies: {
    nodes: Array<{ id: string; type: string; path: string }>;
    edges: Array<{ from: string; to: string; type: string }>;
  };
  functions: Array<{
    name: string;
    file: string;
    type: string;
    exported: boolean;
  }>;
  flows: Array<{
    from: string;
    to: string;
    file: string;
    type: string;
  }>;
  riskSurface: Array<{
    file: string;
    tags: string[];
    score: number;
    reasons: string[];
  }>;
  entryPoints: Array<{
    type: string;
    file: string;
    name: string;
    method?: string;
  }>;
  externalCalls: Array<{
    type: string;
    file: string;
    function: string;
  }>;
  hotspots?: Array<{
    file: string;
    connections: number;
    complexity: number;
    riskScore: number;
  }>;
  circularDeps?: string[][];
}

export default function ArchitecturePage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`/api/reports/${reportId}`);
        if (!response.ok) throw new Error("Failed to load report");
        
        const data = await response.json();
        
        if (data.blueprint) {
          setBlueprint(data.blueprint);
        } else {
          setError("No architecture data available for this report");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load architecture data");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading architecture data...</p>
        </div>
      </div>
    );
  }

  if (error || !blueprint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Architecture Data</h2>
          <p className="text-gray-400 mb-6">
            {error || "This report was generated without architecture analysis"}
          </p>
          <button
            onClick={() => router.push(`/reports/${reportId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Report
          </button>
        </div>
      </div>
    );
  }

  const { meta, riskSurface, entryPoints, externalCalls, hotspots, circularDeps, dependencies, functions } = blueprint;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/reports/${reportId}`)}
              className="text-gray-400 hover:text-white flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Report
            </button>
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">Project Architecture</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FileCode className="w-6 h-6" />}
            label="Total Files"
            value={meta.totalFiles}
            color="blue"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Entry Points"
            value={meta.entryPoints}
            color="green"
          />
          <StatCard
            icon={<Globe className="w-6 h-6" />}
            label="External Calls"
            value={meta.externalCalls}
            color="purple"
          />
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="Functions"
            value={functions.length}
            color="yellow"
          />
        </div>

        {/* Entry Points Section */}
        {entryPoints && entryPoints.length > 0 && (
          <Section
            title="Entry Points"
            subtitle="API routes and controllers - your application's attack surface"
            icon={<Target className="w-5 h-5" />}
          >
            <div className="grid gap-3">
              {entryPoints.map((ep, idx) => (
                <EntryPointCard key={idx} entryPoint={ep} />
              ))}
            </div>
          </Section>
        )}

        {/* Risk Surface Section */}
        {riskSurface && riskSurface.length > 0 && (
          <Section
            title="Risk Surface"
            subtitle="High-risk areas ranked by security impact"
            icon={<AlertTriangle className="w-5 h-5" />}
          >
            <div className="grid gap-3">
              {riskSurface.slice(0, 10).map((risk, idx) => (
                <RiskCard key={idx} risk={risk} rank={idx + 1} />
              ))}
            </div>
          </Section>
        )}

        {/* Hotspots Section */}
        {hotspots && hotspots.length > 0 && (
          <Section
            title="Complexity Hotspots"
            subtitle="Highly connected and complex files that need attention"
            icon={<TrendingUp className="w-5 h-5" />}
          >
            <div className="grid gap-3">
              {hotspots.map((hotspot, idx) => (
                <HotspotCard key={idx} hotspot={hotspot} />
              ))}
            </div>
          </Section>
        )}

        {/* External Calls Section */}
        {externalCalls && externalCalls.length > 0 && (
          <Section
            title="External Calls"
            subtitle="Database, HTTP, and filesystem operations"
            icon={<Database className="w-5 h-5" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupExternalCalls(externalCalls).map((group, idx) => (
                <ExternalCallGroup key={idx} group={group} />
              ))}
            </div>
          </Section>
        )}

        {/* Circular Dependencies */}
        {circularDeps && circularDeps.length > 0 && (
          <Section
            title="Circular Dependencies"
            subtitle="Dependency cycles that could cause issues"
            icon={<GitBranch className="w-5 h-5" />}
          >
            <div className="space-y-3">
              {circularDeps.map((cycle, idx) => (
                <CircularDepCard key={idx} cycle={cycle} />
              ))}
            </div>
          </Section>
        )}

        {/* Dependency Graph Stats */}
        {dependencies && (
          <Section
            title="Dependency Graph"
            subtitle="Module relationships and connections"
            icon={<Network className="w-5 h-5" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  {dependencies.nodes.length}
                </div>
                <div className="text-gray-400">Total Modules</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {dependencies.edges.length}
                </div>
                <div className="text-gray-400">Dependencies</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl font-bold text-purple-500 mb-2">
                  {Math.round((dependencies.edges.length / dependencies.nodes.length) * 10) / 10}
                </div>
                <div className="text-gray-400">Avg Connections per Module</div>
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color }: any) {
  const colors = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
  };

  const iconColors = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    yellow: "text-yellow-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colors[color]} rounded-lg p-6 border`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={iconColors[color]}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  );
}

// Section Component
function Section({ title, subtitle, icon, children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-blue-500">{icon}</div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// Entry Point Card
function EntryPointCard({ entryPoint }: any) {
  const typeColors = {
    route: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    controller: "bg-green-500/20 text-green-400 border-green-500/30",
    handler: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    cli: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${typeColors[entryPoint.type as keyof typeof typeColors] || typeColors.handler}`}>
            {entryPoint.type}
          </span>
          {entryPoint.method && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300">
              {entryPoint.method}
            </span>
          )}
        </div>
      </div>
      <div className="font-mono text-sm text-white mb-1">{entryPoint.name}</div>
      <div className="text-xs text-gray-500">{entryPoint.file}</div>
    </div>
  );
}

// Risk Card
function RiskCard({ risk, rank }: any) {
  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-500 bg-red-500/20 border-red-500/30";
    if (score >= 60) return "text-orange-500 bg-orange-500/20 border-orange-500/30";
    if (score >= 40) return "text-yellow-500 bg-yellow-500/20 border-yellow-500/30";
    return "text-blue-500 bg-blue-500/20 border-blue-500/30";
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-orange-500/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-gray-600">#{rank}</div>
          <div>
            <div className="font-mono text-sm text-white mb-1">{risk.file}</div>
            <div className="flex flex-wrap gap-1">
              {risk.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-lg border font-bold ${getRiskColor(risk.score)}`}>
          {risk.score}
        </div>
      </div>
      <div className="space-y-1">
        {risk.reasons.map((reason: string, idx: number) => (
          <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            {reason}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hotspot Card
function HotspotCard({ hotspot }: any) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-red-500/50 transition-colors">
      <div className="font-mono text-sm text-white mb-3">{hotspot.file}</div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Connections</div>
          <div className="text-lg font-bold text-blue-500">{hotspot.connections}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Complexity</div>
          <div className="text-lg font-bold text-yellow-500">{hotspot.complexity}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Risk Score</div>
          <div className="text-lg font-bold text-red-500">{hotspot.riskScore}</div>
        </div>
      </div>
    </div>
  );
}

// External Call Group
function ExternalCallGroup({ group }: any) {
  const typeIcons = {
    database: <Database className="w-4 h-4" />,
    http: <Globe className="w-4 h-4" />,
    filesystem: <FileCode className="w-4 h-4" />,
    process: <Zap className="w-4 h-4" />,
    network: <Network className="w-4 h-4" />,
  };

  const typeColors = {
    database: "text-blue-500 bg-blue-500/20",
    http: "text-green-500 bg-green-500/20",
    filesystem: "text-purple-500 bg-purple-500/20",
    process: "text-yellow-500 bg-yellow-500/20",
    network: "text-pink-500 bg-pink-500/20",
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded ${typeColors[group.type as keyof typeof typeColors]}`}>
          {typeIcons[group.type as keyof typeof typeIcons]}
        </div>
        <div>
          <div className="font-medium text-white capitalize">{group.type}</div>
          <div className="text-xs text-gray-500">{group.count} calls</div>
        </div>
      </div>
    </div>
  );
}

// Circular Dependency Card
function CircularDepCard({ cycle }: any) {
  return (
    <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium text-red-400 mb-2">Circular Dependency Detected</div>
          <div className="space-y-1">
            {cycle.map((file: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-gray-600 text-xs">→</span>
                <span className="font-mono text-xs text-gray-400">{file}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to group external calls
function groupExternalCalls(calls: any[]) {
  const groups = calls.reduce((acc: any, call: any) => {
    if (!acc[call.type]) {
      acc[call.type] = { type: call.type, count: 0, calls: [] };
    }
    acc[call.type].count++;
    acc[call.type].calls.push(call);
    return acc;
  }, {});

  return Object.values(groups);
}
