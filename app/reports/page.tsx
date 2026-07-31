"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getDeveloper, getApiUrl, API_CONFIG } from "@/lib/api-config";
import Link from "next/link";
import { motion } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';
import DashboardLayout from "@/components/DashboardLayout";

interface ScanReport {
  id: string;
  projectName: string;
  score: number;
  grade: string;
  summary: string;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  createdAt: string;
  expiresAt: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [developer, setDeveloper] = useState<any>(null);
  const [reports, setReports] = useState<ScanReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'passed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const devData = getDeveloper();
    setDeveloper(devData);
    fetchReports();
  }, [router]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
      const response = await fetch(getApiUrl("/api/reports/list"), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch reports");
      }

      setReports(data.reports || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'B': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'C': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'D': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'F': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'critical') return report.criticalFindings > 0;
    if (filter === 'high') return report.highFindings > 0;
    if (filter === 'passed') return report.grade === 'A' || report.grade === 'B';
    return true;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'score') {
      return b.score - a.score;
    }
    if (sortBy === 'name') {
      return a.projectName.localeCompare(b.projectName);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout developer={developer}>
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Scan Reports</h1>
          <p className="text-gray-400">View and manage your security scan reports</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-400">Total Reports</h3>
            </div>
            <p className="text-3xl font-bold text-white">{reports.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/5 to-transparent rounded-xl border border-green-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-400">Passed</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {reports.filter(r => r.grade === 'A' || r.grade === 'B').length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-500/5 to-transparent rounded-xl border border-red-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-400">Critical Issues</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {reports.reduce((sum, r) => sum + r.criticalFindings, 0)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/5 to-transparent rounded-xl border border-yellow-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-400">Avg Score</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length) : 0}
            </p>
          </div>
        </motion.div>

        {/* Filters and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl border border-primary/20 p-6 mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 mr-2">Filter:</span>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === 'critical'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === 'high'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                High
              </button>
              <button
                onClick={() => setFilter('passed')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === 'passed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Passed
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 mr-2">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-primary transition"
              >
                <option value="date">Date (Newest)</option>
                <option value="score">Score (Highest)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Reports List */}
        {sortedReports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl border border-primary/20 p-12 text-center"
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-2">No Reports Yet</h3>
            <p className="text-gray-400 mb-6">
              {filter !== 'all' 
                ? `No reports found with the selected filter.`
                : `Run your first security scan to see reports here.`
              }
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition"
            >
              Run Your First Scan
            </a>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sortedReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Link
                  href={`/reports/${report.id}`}
                  className="block bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl border border-primary/20 p-6 hover:border-primary/40 transition group"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold group-hover:text-primary transition">
                          {report.projectName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(report.grade)}`}>
                          Grade {report.grade}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {report.summary}
                      </p>

                      {/* Findings Summary */}
                      <div className="flex flex-wrap items-center gap-4">
                        {report.criticalFindings > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                            <span className="text-sm text-red-400 font-semibold">
                              {report.criticalFindings} Critical
                            </span>
                          </div>
                        )}
                        {report.highFindings > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                            <span className="text-sm text-orange-400 font-semibold">
                              {report.highFindings} High
                            </span>
                          </div>
                        )}
                        {report.mediumFindings > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                            <span className="text-sm text-yellow-400 font-semibold">
                              {report.mediumFindings} Medium
                            </span>
                          </div>
                        )}
                        {report.lowFindings > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            <span className="text-sm text-blue-400 font-semibold">
                              {report.lowFindings} Low
                            </span>
                          </div>
                        )}
                        {report.totalFindings === 0 && (
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="text-sm text-green-400 font-semibold">
                              No Issues Found
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="text-right">
                      <div className="text-4xl font-bold text-white mb-2">
                        {report.score}
                      </div>
                      <div className="text-xs text-gray-500 mb-4">
                        Security Score
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
