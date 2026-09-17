"use client";

import React from "react";
import {
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Zap,
  ArrowUpRight,
  Code2,
  FolderGit2,
  Layers,
  Building
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ScoreBreakdownItem {
  category: string;
  score_impact: string;
  reason: string;
}

interface ScoreExplanationCardProps {
  matchScore: number;
  scoreExplanation: string;
  scoreBreakdown: ScoreBreakdownItem[];
  companyName: string;
  jobRole?: string;
}

export default function ScoreExplanationCard({
  matchScore,
  scoreExplanation,
  scoreBreakdown,
  companyName,
  jobRole = "Target Role"
}: ScoreExplanationCardProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes("language") || lower.includes("programming")) {
      return <Code2 className="w-4 h-4 text-emerald-500" />;
    }
    if (lower.includes("repo") || lower.includes("github")) {
      return <FolderGit2 className="w-4 h-4 text-indigo-400" />;
    }
    if (lower.includes("architecture") || lower.includes("system design")) {
      return <Layers className="w-4 h-4 text-pink-400" />;
    }
    return <Building className="w-4 h-4 text-amber-500" />;
  };

  const pointsTo100 = Math.max(0, 100 - matchScore);

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl ${
        isLight
          ? "bg-white/95 border-slate-200/90 shadow-slate-200/50 text-slate-900"
          : "bg-slate-900/90 border-slate-800/80 shadow-black/70 text-slate-100 backdrop-blur-xl"
      }`}
    >
      {/* Top Gradient Banner */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="p-6 md:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-inherit">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                  isLight
                    ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                    : "bg-indigo-950/60 text-indigo-300 border-indigo-800/60"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Scoring Algorithm &amp; Audit Log v2.1
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  isLight
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                <Zap className="w-3 h-3 text-indigo-400" />
                Transparent Weighting Matrix
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border ${
                  isLight
                    ? "bg-indigo-500/10 border-indigo-300 text-indigo-700"
                    : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                }`}
              >
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  Why did you receive a {matchScore}% Match Score?
                </h3>
                <p className={`text-xs md:text-sm mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Transparent algorithmic criteria evaluating your engineering footprint against {companyName}&apos;s bar
                </p>
              </div>
            </div>
          </div>

          {/* Quick Score Capsule */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Current Compatibility
              </span>
              <span className={`text-xs font-semibold ${matchScore >= 75 ? "text-emerald-500" : "text-amber-500"}`}>
                {matchScore >= 75 ? "Above Hiring Benchmark" : "Gap Project Actionable"}
              </span>
            </div>
            <div
              className={`px-4 py-2 rounded-2xl border text-2xl font-black ${
                matchScore >= 75
                  ? isLight ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-emerald-950/80 text-emerald-300 border-emerald-700/50"
                  : isLight ? "bg-amber-50 text-amber-800 border-amber-300" : "bg-amber-950/80 text-amber-300 border-amber-700/50"
              }`}
            >
              {matchScore}%
            </div>
          </div>
        </div>

        {/* Algorithm Rationale Narrative Box */}
        <div
          className={`p-4 rounded-2xl border text-xs leading-relaxed font-medium flex items-start gap-3 ${
            isLight
              ? "bg-slate-50/80 border-slate-200/80 text-slate-800"
              : "bg-slate-800/40 border-slate-800 text-slate-300"
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
          <p className="leading-relaxed">
            {scoreExplanation}
          </p>
        </div>

        {/* Breakdown Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4">
          {scoreBreakdown.map((item, idx) => {
            const isNegative = item.score_impact?.toString().includes("-") || item.score_impact?.toString().includes("−");
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between gap-3 ${
                  isLight
                    ? "bg-white border-slate-200 shadow-xs hover:border-indigo-300"
                    : "bg-slate-800/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      {getCategoryIcon(item.category)}
                    </div>
                    <span className="text-xs font-bold truncate">
                      {item.category}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg border shrink-0 ${
                      isNegative
                        ? isLight
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-rose-950 text-rose-300 border-rose-800"
                        : isLight
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-emerald-950 text-emerald-300 border-emerald-800"
                    }`}
                  >
                    {item.score_impact}
                  </span>
                </div>

                <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  {item.reason}
                </p>
              </div>
            );
          })}
        </div>

        {/* Milestone Booster Callout */}
        {pointsTo100 > 0 && (
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              isLight
                ? "bg-indigo-50/70 border-indigo-200 text-indigo-950"
                : "bg-indigo-950/20 border-indigo-800/50 text-indigo-200"
            }`}
          >
            <div className="flex items-center gap-2.5 font-medium">
              <Award className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <span className="font-bold block">Path to 100% Compatibility (+{pointsTo100} Points):</span>
                <span className={`text-[11px] ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Adding the recommended projects and closing critical keyword gaps below directly bridges this gap.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs font-bold shrink-0">
              <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white shadow-sm">
                Target: 100% Score
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
