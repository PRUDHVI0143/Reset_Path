"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Plus, Sparkles, ShieldCheck } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface AtsScannerCardProps {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  companyName: string;
  onInjectSkill: (skill: string) => void;
}

export default function AtsScannerCard({
  atsScore,
  matchedKeywords,
  missingKeywords,
  companyName,
  onInjectSkill
}: AtsScannerCardProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [injectedList, setInjectedList] = useState<string[]>([]);

  const handleInject = (keyword: string) => {
    onInjectSkill(keyword);
    if (!injectedList.includes(keyword)) {
      setInjectedList([...injectedList, keyword]);
    }
  };

  const getScoreColor = () => {
    if (atsScore >= 80) return isLight ? "text-emerald-700 bg-emerald-100 border-emerald-300" : "text-emerald-400 bg-emerald-950/80 border-emerald-700/50";
    if (atsScore >= 60) return isLight ? "text-amber-800 bg-amber-100 border-amber-300" : "text-amber-400 bg-amber-950/80 border-amber-700/50";
    return isLight ? "text-rose-800 bg-rose-100 border-rose-300" : "text-rose-400 bg-rose-950/80 border-rose-700/50";
  };

  return (
    <div
      className={`p-6 rounded-3xl backdrop-blur-md transition-all border ${
        isLight
          ? "bg-white/80 border-emerald-300/60 shadow-xl shadow-emerald-950/5"
          : "bg-slate-900/80 border-indigo-500/30 shadow-2xl shadow-black/50"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-inherit">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${isLight ? "text-emerald-600" : "text-indigo-400"}`} />
            <h3 className="text-lg font-bold tracking-tight">
              ATS Resume Keyword Scanner
            </h3>
          </div>
          <p className={`text-xs mt-0.5 ${isLight ? "text-emerald-900/70" : "text-slate-400"}`}>
            Automated screening alignment against {companyName}&apos;s required tech keywords
          </p>
        </div>

        {/* ATS Score Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className={`text-xs font-semibold block ${isLight ? "text-emerald-900" : "text-slate-300"}`}>
              ATS Match Pass Rate
            </span>
            <span className={`text-[11px] ${isLight ? "text-emerald-700" : "text-slate-400"}`}>
              {atsScore >= 75 ? "Likely to clear filter" : "Needs keyword injection"}
            </span>
          </div>
          <div className={`px-3.5 py-1.5 rounded-2xl border text-xl font-black ${getScoreColor()}`}>
            {atsScore}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified in Your GitHub Repos ({matchedKeywords.length})</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                    isLight
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300/80 shadow-sm"
                      : "bg-emerald-950/40 text-emerald-300 border-emerald-700/50"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No direct keyword overlap found.</span>
            )}
          </div>
        </div>

        {/* Missing Keywords & 1-Click Inject */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
              <AlertTriangle className="w-4 h-4" />
              <span>Missing from Resume ({missingKeywords.length})</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">1-Click Inject</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {missingKeywords.length > 0 ? (
              missingKeywords.map((kw, i) => {
                const isAdded = injectedList.includes(kw);
                return (
                  <button
                    key={i}
                    onClick={() => handleInject(kw)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isAdded
                        ? isLight
                          ? "bg-emerald-100 text-emerald-800 border-emerald-400"
                          : "bg-emerald-950 text-emerald-300 border-emerald-600"
                        : isLight
                        ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:scale-[1.02]"
                        : "bg-amber-950/40 text-amber-300 border-amber-700/50 hover:bg-amber-900/50 hover:scale-[1.02]"
                    }`}
                  >
                    {isAdded ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>{kw}</span>
                    <span className="text-[10px] opacity-75">
                      {isAdded ? "Added" : "+ Add"}
                    </span>
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-emerald-400 font-semibold">
                🎉 No gaps! All primary keywords matched.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
