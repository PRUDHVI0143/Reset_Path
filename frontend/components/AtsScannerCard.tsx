"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  Sparkles,
  ShieldCheck,
  Search,
  Copy,
  Check,
  Zap,
  Filter,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  Target,
  FileCheck,
  Flame
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface AtsScannerCardProps {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  companyName: string;
  jobRole?: string;
  criticalGaps?: string[];
  actionRecommendation?: string;
  onInjectSkill: (skill: string) => void;
}

type TabType = "all" | "matched" | "missing" | "injected";

export default function AtsScannerCard({
  atsScore,
  matchedKeywords = [],
  missingKeywords = [],
  companyName,
  jobRole = "Target Position",
  criticalGaps = [],
  actionRecommendation,
  onInjectSkill
}: AtsScannerCardProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [injectedList, setInjectedList] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [injectAllSuccess, setInjectAllSuccess] = useState(false);

  // Handle single keyword inject / toggle
  const handleInject = (keyword: string) => {
    onInjectSkill(keyword);
    if (!injectedList.includes(keyword)) {
      setInjectedList((prev) => [...prev, keyword]);
    } else {
      setInjectedList((prev) => prev.filter((k) => k !== keyword));
    }
  };

  // Handle Inject All missing keywords
  const handleInjectAll = () => {
    const unadded = missingKeywords.filter((k) => !injectedList.includes(k));
    if (unadded.length === 0) return;
    unadded.forEach((kw) => {
      onInjectSkill(kw);
    });
    setInjectedList((prev) => Array.from(new Set([...prev, ...unadded])));
    setInjectAllSuccess(true);
    setTimeout(() => setInjectAllSuccess(false), 3000);
  };

  // Copy missing keywords to clipboard
  const handleCopyMissing = () => {
    const text = missingKeywords.join(", ");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Combined list with metadata
  const allKeywords = useMemo(() => {
    const list: Array<{
      name: string;
      status: "matched" | "missing";
      isCritical: boolean;
      isInjected: boolean;
    }> = [];

    matchedKeywords.forEach((kw) => {
      list.push({
        name: kw,
        status: "matched",
        isCritical: criticalGaps.includes(kw),
        isInjected: false
      });
    });

    missingKeywords.forEach((kw) => {
      list.push({
        name: kw,
        status: "missing",
        isCritical: criticalGaps.length > 0 ? criticalGaps.includes(kw) : true,
        isInjected: injectedList.includes(kw)
      });
    });

    return list;
  }, [matchedKeywords, missingKeywords, criticalGaps, injectedList]);

  // Filtered keywords based on tab and search
  const filteredKeywords = useMemo(() => {
    return allKeywords.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (activeTab === "matched") return item.status === "matched";
      if (activeTab === "missing") return item.status === "missing" && !item.isInjected;
      if (activeTab === "injected") return item.isInjected;
      return true;
    });
  }, [allKeywords, activeTab, searchQuery]);

  // Score styling logic
  const getScoreVariant = () => {
    if (atsScore >= 80) {
      return {
        badge: "Likely to Pass",
        badgeColor: isLight
          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
        scoreColor: isLight ? "text-emerald-700" : "text-emerald-400",
        progressBar: "from-emerald-500 to-teal-400",
        tier: "Tier 1: Preferred Candidate",
        tierDesc: "Meets or exceeds 80%+ threshold for automated screening."
      };
    }
    if (atsScore >= 60) {
      return {
        badge: "Conditional Match",
        badgeColor: isLight
          ? "bg-amber-100 text-amber-800 border-amber-300"
          : "bg-amber-500/15 text-amber-300 border-amber-500/40",
        scoreColor: isLight ? "text-amber-700" : "text-amber-400",
        progressBar: "from-amber-500 to-orange-400",
        tier: "Tier 2: Review Recommended",
        tierDesc: "Close to threshold. Inject missing keywords to ensure pass."
      };
    }
    return {
      badge: "High Filter Risk",
      badgeColor: isLight
        ? "bg-rose-100 text-rose-800 border-rose-300"
        : "bg-rose-500/15 text-rose-300 border-rose-500/40",
      scoreColor: isLight ? "text-rose-700" : "text-rose-400",
      progressBar: "from-rose-500 to-pink-500",
      tier: "Tier 3: Optimization Required",
      tierDesc: "Critical keyword gaps present. ATS algorithms may reject."
    };
  };

  const scoreVariant = getScoreVariant();
  const totalKeywordsCount = matchedKeywords.length + missingKeywords.length;
  const matchRate = totalKeywordsCount > 0 ? Math.round((matchedKeywords.length / totalKeywordsCount) * 100) : atsScore;
  const remainingMissingCount = missingKeywords.filter((k) => !injectedList.includes(k)).length;

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl ${
        isLight
          ? "bg-white/95 border-slate-200/90 shadow-slate-200/50 text-slate-900"
          : "bg-slate-900/90 border-slate-800/80 shadow-black/70 text-slate-100 backdrop-blur-xl"
      }`}
    >
      {/* SaaS Dashboard Top Bar / Ambient Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />

      {/* Main Container */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-inherit">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Engine Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                  isLight
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                ATS Parser Engine v3.4
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  isLight
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                <Cpu className="w-3 h-3 text-indigo-400" />
                Live Screening Simulation
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border ${
                  isLight
                    ? "bg-emerald-500/10 border-emerald-300 text-emerald-700"
                    : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                }`}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  ATS Resume Keyword Scanner
                </h3>
                <p className={`text-xs md:text-sm mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Real-time screening alignment & keyword density benchmark against{" "}
                  <span className="font-bold text-inherit">{companyName}</span> ({jobRole})
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1-Click Inject All Button */}
            {remainingMissingCount > 0 && (
              <button
                onClick={handleInjectAll}
                className={`group relative px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                  injectAllSuccess
                    ? "bg-emerald-600 text-white shadow-emerald-500/20"
                    : isLight
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30"
                }`}
              >
                {injectAllSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 animate-bounce" />
                    <span>Injected All ({missingKeywords.length})</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-yellow-300 group-hover:scale-110 transition-transform" />
                    <span>1-Click Inject All ({remainingMissingCount})</span>
                  </>
                )}
              </button>
            )}

            {/* Copy Missing Keywords */}
            {missingKeywords.length > 0 && (
              <button
                onClick={handleCopyMissing}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-95 ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300/80"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700"
                }`}
                title="Copy missing keywords to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Gaps</span>
                  </>
                )}
              </button>
            )}

            {/* Tips Accordion Toggle */}
            <button
              onClick={() => setShowTips(!showTips)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                showTips
                  ? isLight
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-indigo-950/50 text-indigo-300 border-indigo-700/50"
                  : isLight
                  ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  : "bg-slate-800/50 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Tips</span>
              {showTips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Modern SaaS KPI Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
          {/* KPI 1: Pass Rate */}
          <div
            className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
              isLight
                ? "bg-slate-50/80 border-slate-200/80 shadow-sm"
                : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                ATS Pass Rate
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${scoreVariant.badgeColor}`}>
                {scoreVariant.badge}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black tracking-tight ${scoreVariant.scoreColor}`}>
                {atsScore}%
              </span>
              <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                / 100%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${scoreVariant.progressBar} transition-all duration-700`}
                style={{ width: `${Math.min(100, atsScore)}%` }}
              />
            </div>
          </div>

          {/* KPI 2: Verified in Repos */}
          <div
            className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
              isLight
                ? "bg-slate-50/80 border-slate-200/80 shadow-sm"
                : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Verified in Code
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-emerald-500">
                {matchedKeywords.length}
              </span>
              <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                of {totalKeywordsCount} tags
              </span>
            </div>
            <div className={`text-[11px] mt-2 font-medium ${isLight ? "text-emerald-700" : "text-emerald-400/90"}`}>
              {matchRate}% coverage in public repos
            </div>
          </div>

          {/* KPI 3: Missing Keyword Gaps */}
          <div
            className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
              isLight
                ? "bg-slate-50/80 border-slate-200/80 shadow-sm"
                : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Screening Gaps
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-amber-500">
                {remainingMissingCount}
              </span>
              <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                pending injection
              </span>
            </div>
            <div className={`text-[11px] mt-2 font-medium ${isLight ? "text-amber-700" : "text-amber-400/90"}`}>
              {injectedList.length > 0 ? `${injectedList.length} injected so far` : "Needs CV injection"}
            </div>
          </div>

          {/* KPI 4: Screening Verdict */}
          <div
            className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
              isLight
                ? "bg-slate-50/80 border-slate-200/80 shadow-sm"
                : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Algorithm Verdict
              </span>
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-extrabold tracking-tight truncate" title={scoreVariant.tier}>
              {scoreVariant.tier}
            </div>
            <div className={`text-[11px] mt-2 font-medium line-clamp-2 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              {scoreVariant.tierDesc}
            </div>
          </div>
        </div>

        {/* Optional Expandable Tips Card */}
        {showTips && (
          <div
            className={`p-4 rounded-2xl border transition-all text-xs space-y-2 animate-fadeIn ${
              isLight
                ? "bg-indigo-50/70 border-indigo-200 text-indigo-950"
                : "bg-indigo-950/40 border-indigo-800/50 text-indigo-200"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>ATS Parser Optimization Recommendations</span>
            </div>
            <p className="leading-relaxed">
              {actionRecommendation ||
                `Enterprise ATS filters (Workday, Greenhouse, Taleo) calculate semantic and keyword density scores. Ensure missing keywords appear naturally in your experience bullet points and skills taxonomy.`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className={`p-2.5 rounded-xl border ${isLight ? "bg-white border-indigo-100" : "bg-slate-900/60 border-indigo-900/40"}`}>
                <div className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="w-3.5 h-3.5" /> Exact Match
                </div>
                <div className={`text-[11px] mt-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Match phrasing from {companyName}&apos;s JD directly.
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? "bg-white border-indigo-100" : "bg-slate-900/60 border-indigo-900/40"}`}>
                <div className="font-bold flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <Flame className="w-3.5 h-3.5" /> Frequency
                </div>
                <div className={`text-[11px] mt-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Mention primary frameworks 2–3 times in bullets.
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? "bg-white border-indigo-100" : "bg-slate-900/60 border-indigo-900/40"}`}>
                <div className="font-bold flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Zap className="w-3.5 h-3.5" /> 1-Click Sync
                </div>
                <div className={`text-[11px] mt-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Click &ldquo;+ Add&rdquo; below to auto-append keywords to CV.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Dashboard Control Bar (Search & Tab Filters) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Segmented Filter Pills */}
          <div
            className={`flex items-center p-1 rounded-2xl border overflow-x-auto ${
              isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800/60 border-slate-800"
            }`}
          >
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "all"
                  ? isLight
                    ? "bg-white text-slate-900 shadow-sm"
                    : "bg-slate-700 text-white shadow-sm"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>All</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-600">
                {allKeywords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("matched")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "matched"
                  ? isLight
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-emerald-600 text-white shadow-sm"
                  : isLight
                  ? "text-emerald-800 hover:text-emerald-950"
                  : "text-emerald-400 hover:text-emerald-300"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified ({matchedKeywords.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("missing")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "missing"
                  ? isLight
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-amber-600 text-white shadow-sm"
                  : isLight
                  ? "text-amber-800 hover:text-amber-950"
                  : "text-amber-400 hover:text-amber-300"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Gaps ({remainingMissingCount})</span>
            </button>

            {injectedList.length > 0 && (
              <button
                onClick={() => setActiveTab("injected")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "injected"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : isLight
                    ? "text-indigo-700 hover:text-indigo-900"
                    : "text-indigo-400 hover:text-indigo-300"
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Injected ({injectedList.length})</span>
              </button>
            )}
          </div>

          {/* Keyword Search Input */}
          <div className="relative w-full sm:w-64">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isLight ? "text-slate-400" : "text-slate-500"
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter keywords..."
              className={`w-full pl-8 pr-8 py-1.5 rounded-xl text-xs border outline-none transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  : "bg-slate-800/60 border-slate-700 text-slate-100 focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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

        {/* Keyword Data Grid / Chips Matrix */}
        <div className="space-y-4">
          {filteredKeywords.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredKeywords.map((item, idx) => {
                const isMatched = item.status === "matched";
                const isInjected = item.isInjected;

                return (
                  <div
                    key={`${item.name}-${idx}`}
                    className={`group relative p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      isMatched
                        ? isLight
                          ? "bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200/80 shadow-xs"
                          : "bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-800/40"
                        : isInjected
                        ? isLight
                          ? "bg-indigo-50/70 hover:bg-indigo-50 border-indigo-200"
                          : "bg-indigo-950/30 hover:bg-indigo-950/50 border-indigo-700/50"
                        : isLight
                        ? "bg-amber-50/40 hover:bg-amber-50/80 border-amber-200/80 shadow-xs"
                        : "bg-amber-950/20 hover:bg-amber-950/40 border-amber-800/40"
                    }`}
                  >
                    {/* Keyword Name & Status Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                          isMatched
                            ? isLight
                              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                              : "bg-emerald-900/60 text-emerald-400 border-emerald-700/50"
                            : isInjected
                            ? isLight
                              ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                              : "bg-indigo-900/60 text-indigo-300 border-indigo-700/50"
                            : isLight
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-amber-900/60 text-amber-300 border-amber-700/50"
                        }`}
                      >
                        {isMatched ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isInjected ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="truncate">
                        <div className="text-xs font-bold tracking-tight truncate flex items-center gap-1.5">
                          <span className="truncate">{item.name}</span>
                          {item.isCritical && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider shrink-0 ${
                                isLight
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-rose-950 text-rose-300 border border-rose-800/60"
                              }`}
                            >
                              Core
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[10px] font-medium truncate ${
                            isMatched
                              ? isLight
                                ? "text-emerald-700"
                                : "text-emerald-400"
                              : isInjected
                              ? isLight
                                ? "text-indigo-700"
                                : "text-indigo-400"
                              : isLight
                              ? "text-amber-800"
                              : "text-amber-400"
                          }`}
                        >
                          {isMatched
                            ? "Verified in GitHub"
                            : isInjected
                            ? "Injected into CV"
                            : "Missing from CV"}
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    {isMatched ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 border ${
                          isLight
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                        }`}
                      >
                        Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInject(item.name)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0 border shadow-xs ${
                          isInjected
                            ? isLight
                              ? "bg-indigo-100 hover:bg-rose-50 text-indigo-800 hover:text-rose-700 border-indigo-300 hover:border-rose-300"
                              : "bg-indigo-900/60 hover:bg-rose-950/60 text-indigo-200 hover:text-rose-300 border-indigo-700/50 hover:border-rose-700/50"
                            : isLight
                            ? "bg-amber-100 hover:bg-emerald-600 text-amber-900 hover:text-white border-amber-300 hover:border-emerald-600"
                            : "bg-amber-900/50 hover:bg-emerald-600 text-amber-200 hover:text-white border-amber-700/60 hover:border-emerald-500"
                        }`}
                        title={isInjected ? "Click to remove from CV" : "Click to inject keyword into CV"}
                      >
                        {isInjected ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>+ Inject</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={`text-center py-10 rounded-2xl border ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-slate-800/30 border-slate-800 text-slate-400"
              }`}
            >
              <Filter className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <div className="text-xs font-bold">No keywords match your filter</div>
              <div className="text-[11px] mt-0.5">Try clearing search or switching tabs</div>
            </div>
          )}
        </div>

        {/* Bottom Status Footer */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 pt-4 border-t text-xs ${
            isLight ? "border-slate-200 text-slate-500" : "border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Target Screening Standard: <strong className="text-inherit">75%+ Match Rate</strong> recommended for {companyName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Total Scanned: <strong className="text-inherit">{totalKeywordsCount}</strong> keywords
            </span>
            <span>•</span>
            <span className={atsScore >= 75 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
              {atsScore >= 75 ? "Filter Status: Optimal" : "Action: Inject Missing Gaps"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
