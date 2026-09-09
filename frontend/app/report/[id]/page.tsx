"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText, Download, ShieldCheck, AlertTriangle, ExternalLink, CheckCircle, HelpCircle, ArrowLeft, RefreshCw
} from "lucide-react";

import ConfidenceGauge from "@/components/ConfidenceGauge";
import DataCharts from "@/components/DataCharts";
import ConflictCard from "@/components/ConflictCard";
import ExportModal from "@/components/ExportModal";
import { fetchReport, fetchResearchStatus } from "@/lib/api";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [projectStatus, setProjectStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchReport(id), fetchResearchStatus(id)])
      .then(([repData, statData]) => {
        setReport(repData);
        setProjectStatus(statData);
      })
      .catch((e) => console.error("Error fetching report", e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-4">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-white">Loading Research Report...</h2>
        <p className="text-slate-400 text-sm">Fetching verified claims, extracted data, and citation indices...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Report Generation In Progress</h2>
        <p className="text-slate-400">The agents are still compiling your report or state is pending.</p>
        <button
          onClick={() => router.push(`/dashboard/${id}`)}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm"
        >
          View Live Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Question</span>
        </button>

        <button
          onClick={() => setExportOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:opacity-90 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Report (PDF / DOCX / MD)</span>
        </button>
      </div>

      {/* Header & Title */}
      <div className="space-y-4 border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold font-mono border border-indigo-500/20">
          <span>REPORT ID: {id.substring(0, 8)}</span>
          <span>•</span>
          <span>DATE: {report.date || "2026-08-27"}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
          {report.title}
        </h1>

        <p className="text-slate-300 text-base italic font-serif bg-slate-900/60 p-4 rounded-xl border border-white/5">
          "{report.question}"
        </p>
      </div>

      {/* Confidence Gauge */}
      <ConfidenceGauge score={report.confidence_score || 0.88} />

      {/* Executive Summary */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span>Executive Summary</span>
        </h3>
        <p className="text-slate-300 text-base leading-relaxed">{report.executive_summary}</p>
      </div>

      {/* Key Findings */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>Key Findings & Empirical Benchmarks</span>
        </h3>
        <ul className="space-y-3">
          {report.key_findings?.map((finding: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3 text-slate-200 text-sm leading-relaxed">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-2" />
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recharts Data Visualizations */}
      {report.charts && report.charts.length > 0 && (
        <DataCharts charts={report.charts} />
      )}

      {/* Claim Verification & Conflicts Section */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span>Verified Claims & Evidence Stance</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {report.claims?.length || 0} Claims Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {report.claims?.map((claim: any) => (
            <div key={claim.id} className="p-4 rounded-xl glass-card space-y-2">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-slate-100 font-medium leading-relaxed">{claim.claim_text_cited || claim.claim_text}</p>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${claim.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  {claim.status} ({Math.round(claim.confidence_score * 100)}%)
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-4 pt-1">
                <span>Method: {claim.verification_method}</span>
                <span>Supports: {claim.supports_count || 2}</span>
                <span>Contradicts: {claim.contradicts_count || 0}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Flagged Conflicts if any */}
        {report.conflicts && report.conflicts.length > 0 && (
          <div className="pt-4 space-y-3">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Flagged Evidence Conflicts (&gt;15% Numeric Variance)</span>
            </h4>
            {report.conflicts.map((conf: any) => (
              <ConflictCard key={conf.id} reason={conf.reason} resolutionNote={conf.resolution_note} />
            ))}
          </div>
        )}
      </div>

      {/* Numbered References & Sources */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-indigo-400" />
          <span>Numbered References & Cited Web Sources</span>
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {report.sources?.map((src: any, idx: number) => (
            <div key={src.id} className="p-4 rounded-xl glass-card flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    [{idx + 1}]
                  </span>
                  <h4 className="font-semibold text-white text-sm">{src.title}</h4>
                </div>
                <p className="text-xs text-slate-400">Publisher: {src.publisher || "Web Publisher"} • Date: {src.date || "2026"}</p>
              </div>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
              >
                <span>View Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations Section */}
      {report.limitations && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-400 space-y-1">
          <span className="font-bold text-slate-300 uppercase tracking-wider">Limitations & Token Ceiling Note:</span>
          <p>{report.limitations}</p>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal researchId={id} isOpen={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
