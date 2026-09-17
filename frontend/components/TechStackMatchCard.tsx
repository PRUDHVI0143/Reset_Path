"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Search,
  Check,
  X,
  Target,
  Cpu,
  Star
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface TechStackMatchCardProps {
  overlapSummary: {
    company_type?: string;
    display_required_tech?: string[];
    must_have_tech?: string[];
    nice_to_have_tech?: string[];
    matched_tech?: string[];
    missing_tech?: string[];
    critical_matched?: string[];
    critical_missing?: string[];
    bonus_matched?: string[];
    bonus_missing?: string[];
    match_percentage?: number;
  };
  companyName: string;
  jobRole?: string;
}

export default function TechStackMatchCard({
  overlapSummary,
  companyName,
  jobRole = "Target Role"
}: TechStackMatchCardProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "matched" | "missing" | "bonus">("all");

  const mustHaves = overlapSummary.must_have_tech || overlapSummary.display_required_tech || [];
  const niceToHaves = overlapSummary.nice_to_have_tech || [];
  const criticalMatched = overlapSummary.critical_matched || overlapSummary.matched_tech || [];
  const criticalMissing = overlapSummary.critical_missing || overlapSummary.missing_tech || [];
  const bonusMatched = overlapSummary.bonus_matched || [];
  const bonusMissing = overlapSummary.bonus_missing || [];

  const matchScore = overlapSummary.match_percentage || (
    mustHaves.length > 0 ? Math.round((criticalMatched.length / mustHaves.length) * 100) : 75
  );

  // Filtered lists based on search and tab
  const filteredMustHaves = useMemo(() => {
    return mustHaves.filter((tech) => {
      const isMatched = criticalMatched.includes(tech);
      const matchesSearch = tech.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (filterType === "matched") return isMatched;
      if (filterType === "missing") return !isMatched;
      if (filterType === "bonus") return false;
      return true;
    });
  }, [mustHaves, criticalMatched, searchQuery, filterType]);

  const filteredNiceToHaves = useMemo(() => {
    if (filterType === "matched") {
      return niceToHaves.filter((tech) => bonusMatched.includes(tech) && tech.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    }
    if (filterType === "missing") {
      return niceToHaves.filter((tech) => !bonusMatched.includes(tech) && tech.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    }
    if (filterType === "all" || filterType === "bonus") {
      return niceToHaves.filter((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    }
    return [];
  }, [niceToHaves, bonusMatched, searchQuery, filterType]);

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl ${
        isLight
          ? "bg-white/95 border-slate-200/90 shadow-slate-200/50 text-slate-900"
          : "bg-slate-900/90 border-slate-800/80 shadow-black/70 text-slate-100 backdrop-blur-xl"
      }`}
    >
      {/* Top Gradient Accent Banner */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500" />

      <div className="p-6 md:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-inherit">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                  isLight
                    ? "bg-teal-50 text-teal-800 border-teal-200"
                    : "bg-teal-950/60 text-teal-300 border-teal-800/60"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Tech Compatibility Engine v2.8
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  isLight
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                <Cpu className="w-3 h-3 text-teal-400" />
                JD Overlap Matrix
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border ${
                  isLight
                    ? "bg-teal-500/10 border-teal-300 text-teal-700"
                    : "bg-teal-500/10 border-teal-500/30 text-teal-400"
                }`}
              >
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  Tech Stack Match Analysis
                </h3>
                <p className={`text-xs md:text-sm mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Candidate&apos;s verified GitHub languages vs. <span className="font-bold text-inherit">{companyName}</span>&apos;s required tech stack
                </p>
              </div>
            </div>
          </div>

          {/* Quick Overall Badges */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                isLight
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-sm"
                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              {criticalMatched.length + bonusMatched.length} Matched
            </span>
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                criticalMissing.length > 0
                  ? isLight
                    ? "bg-amber-100 text-amber-900 border-amber-300 shadow-sm"
                    : "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : isLight
                  ? "bg-slate-100 text-slate-700 border-slate-200"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {criticalMissing.length} Critical Gaps
            </span>
          </div>
        </div>

        {/* Executive KPI Stat Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight
                ? "bg-slate-50/80 border-slate-200/80 shadow-sm"
                : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Stack Overlap
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                matchScore >= 75
                  ? isLight ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : isLight ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}>
                {matchScore >= 75 ? "Strong Fit" : "Target Alignment"}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-teal-500">
                {matchScore}%
              </span>
              <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                compatibility
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${Math.min(100, matchScore)}%` }}
              />
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight
                ? "bg-slate-50/80 border-slate-200/80 shadow-sm"
                : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Critical Skills
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-emerald-500">
                {criticalMatched.length}
              </span>
              <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                / {mustHaves.length} Must-Have
              </span>
            </div>
            <div className={`text-[11px] mt-2 font-medium ${isLight ? "text-emerald-700" : "text-emerald-400/90"}`}>
              {mustHaves.length > 0 ? Math.round((criticalMatched.length / mustHaves.length) * 100) : 100}% of core tech covered
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight
                ? "bg-slate-50/80 border-slate-200/80 shadow-sm"
                : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Core Tech Gaps
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-amber-500">
                {criticalMissing.length}
              </span>
              <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                missing tech
              </span>
            </div>
            <div className={`text-[11px] mt-2 font-medium ${isLight ? "text-amber-700" : "text-amber-400/90"}`}>
              {criticalMissing.length === 0 ? "Zero core gaps" : "Needs project highlight"}
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight
                ? "bg-slate-50/80 border-slate-200/80 shadow-sm"
                : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Bonus Competencies
              </span>
              <Star className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-indigo-400">
                {bonusMatched.length}
              </span>
              <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                / {niceToHaves.length || 0} Nice-to-Have
              </span>
            </div>
            <div className={`text-[11px] mt-2 font-medium ${isLight ? "text-indigo-700" : "text-indigo-300"}`}>
              {bonusMatched.length > 0 ? "Positive differentiating factor" : "Optional boost"}
            </div>
          </div>
        </div>

        {/* Interactive Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div
            className={`flex items-center p-1 rounded-2xl border overflow-x-auto ${
              isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800/60 border-slate-800"
            }`}
          >
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === "all"
                  ? isLight ? "bg-white text-slate-900 shadow-sm" : "bg-slate-700 text-white shadow-sm"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              All Tech ({mustHaves.length + niceToHaves.length})
            </button>
            <button
              onClick={() => setFilterType("matched")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filterType === "matched"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : isLight ? "text-emerald-800 hover:text-emerald-950" : "text-emerald-400 hover:text-emerald-300"
              }`}
            >
              <Check className="w-3 h-3" />
              Verified ({criticalMatched.length + bonusMatched.length})
            </button>
            <button
              onClick={() => setFilterType("missing")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filterType === "missing"
                  ? "bg-amber-600 text-white shadow-sm"
                  : isLight ? "text-amber-800 hover:text-amber-950" : "text-amber-400 hover:text-amber-300"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Gaps ({criticalMissing.length})
            </button>
            {niceToHaves.length > 0 && (
              <button
                onClick={() => setFilterType("bonus")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  filterType === "bonus"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : isLight ? "text-indigo-700 hover:text-indigo-900" : "text-indigo-400 hover:text-indigo-300"
                }`}
              >
                <Star className="w-3 h-3" />
                Bonus ({niceToHaves.length})
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-60">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isLight ? "text-slate-400" : "text-slate-500"
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stack..."
              className={`w-full pl-8 pr-8 py-1.5 rounded-xl text-xs border outline-none transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                  : "bg-slate-800/60 border-slate-700 text-slate-100 focus:bg-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Section A: Must-Have Critical Tech Grid */}
        {filteredMustHaves.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
                Must-Have Critical Requirements for {companyName}
              </div>
              <span className={`text-[11px] font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Core screening criteria
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredMustHaves.map((tech, idx) => {
                const isMatched = criticalMatched.includes(tech);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                      isMatched
                        ? isLight
                          ? "bg-emerald-50/60 border-emerald-200/90 shadow-xs"
                          : "bg-emerald-950/25 border-emerald-800/40"
                        : isLight
                        ? "bg-rose-50/50 border-rose-200/80 shadow-xs"
                        : "bg-rose-950/20 border-rose-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                          isMatched
                            ? isLight ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-emerald-900/60 text-emerald-400 border-emerald-700/50"
                            : isLight ? "bg-rose-100 text-rose-700 border-rose-300" : "bg-rose-900/60 text-rose-300 border-rose-700/50"
                        }`}
                      >
                        {isMatched ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold font-mono truncate">{tech}</div>
                        <div className={`text-[10px] font-medium ${isMatched ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {isMatched ? "Verified in GitHub" : "Critical Gap to Fill"}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                        isMatched
                          ? isLight ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : isLight ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-rose-950 text-rose-300 border-rose-800"
                      }`}
                    >
                      {isMatched ? "Matched" : "Action Req"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section B: Nice-To-Have Skills Grid */}
        {filteredNiceToHaves.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${isLight ? "text-slate-800" : "text-slate-300"}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                Nice-to-Have / Bonus Stack Alignment
              </div>
              <span className={`text-[11px] font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Seniority differentiator
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredNiceToHaves.map((tech, idx) => {
                const isBonusMatched = bonusMatched.includes(tech);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                      isBonusMatched
                        ? isLight
                          ? "bg-teal-50/60 border-teal-200 shadow-xs"
                          : "bg-indigo-950/25 border-indigo-800/40"
                        : isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-slate-800/30 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                          isBonusMatched
                            ? isLight ? "bg-teal-100 text-teal-700 border-teal-300" : "bg-indigo-900/60 text-indigo-300 border-indigo-700/50"
                            : isLight ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {isBonusMatched ? <Star className="w-3.5 h-3.5" /> : <span className="text-xs">○</span>}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold font-mono truncate">{tech}</div>
                        <div className={`text-[10px] font-medium ${isBonusMatched ? "text-teal-600 dark:text-indigo-400" : "text-slate-400"}`}>
                          {isBonusMatched ? "Bonus Covered" : "Optional Enhancement"}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                        isBonusMatched
                          ? isLight ? "bg-teal-100 text-teal-800 border-teal-200 font-bold" : "bg-indigo-950 text-indigo-300 border-indigo-800 font-bold"
                          : isLight ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {isBonusMatched ? "Bonus" : "Optional"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strategy Guidance Footer */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            criticalMissing.length > 0
              ? isLight
                ? "bg-amber-50/70 border-amber-200 text-amber-950"
                : "bg-amber-950/20 border-amber-800/40 text-amber-200"
              : isLight
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
              : "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              {criticalMissing.length > 0
                ? `Strategic Recommendation: Add the ${criticalMissing.length} missing technologies into your CV via the tailored projects below to unlock 100% compatibility.`
                : `100% Critical Tech Alignment: All mandatory competencies for ${companyName} are confirmed in your profile.`}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] shrink-0 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Verified ({criticalMatched.length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Gaps ({criticalMissing.length})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
