"use client";

import React, { useState } from "react";
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Target,
  CheckCircle2,
  HelpCircle,
  Zap,
  BookOpen
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface InterviewRound {
  round_number: number;
  title: string;
  focus: string;
  duration: string;
  key_topics?: string[];
  preparation_tips?: string;
}

interface InterviewRoundsSectionProps {
  rounds: InterviewRound[];
  companyName: string;
  jobRole?: string;
}

export default function InterviewRoundsSection({
  rounds,
  companyName,
  jobRole = "Target Position"
}: InterviewRoundsSectionProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [openRoundIndex, setOpenRoundIndex] = useState<number | null>(0);

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl ${
        isLight
          ? "bg-white/95 border-slate-200/90 shadow-slate-200/50 text-slate-900"
          : "bg-slate-900/90 border-slate-800/80 shadow-black/70 text-slate-100 backdrop-blur-xl"
      }`}
    >
      {/* Top Gradient Banner */}
      <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

      <div className="p-6 md:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-inherit">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                  isLight
                    ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                    : "bg-cyan-950/60 text-cyan-300 border-cyan-800/60"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Interview Intelligence &amp; Roadmap v2.4
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  isLight
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                <Target className="w-3 h-3 text-cyan-400" />
                Verified Loop Structure
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border ${
                  isLight
                    ? "bg-cyan-500/10 border-cyan-300 text-cyan-700"
                    : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                }`}
              >
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  {companyName} — Expected Interview Rounds Breakdown
                </h3>
                <p className={`text-xs md:text-sm mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Chronological stages, duration, core evaluation rubrics, and tactical preparation tips for {jobRole}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                isLight ? "bg-cyan-50 text-cyan-900 border-cyan-200" : "bg-cyan-950/40 text-cyan-300 border-cyan-700/50"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              {rounds.length} Total Rounds
            </span>
          </div>
        </div>

        {/* Visual Roadmap Stepper Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {rounds.map((round, idx) => {
            const isSelected = openRoundIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setOpenRoundIndex(idx)}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? isLight
                      ? "bg-cyan-50/90 border-cyan-300 shadow-sm"
                      : "bg-cyan-950/40 border-cyan-600/80 shadow-inner"
                    : isLight
                    ? "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    : "bg-slate-800/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      isSelected
                        ? "bg-cyan-600 text-white border-cyan-600"
                        : isLight
                        ? "bg-slate-200 text-slate-700 border-slate-300"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    R{round.round_number || idx + 1}
                  </span>
                  <span className={`text-[10px] flex items-center gap-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    <Clock className="w-2.5 h-2.5" />
                    {round.duration}
                  </span>
                </div>
                <div className="text-xs font-bold truncate" title={round.title}>
                  {round.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Rounds Accordion Cards */}
        <div className="space-y-3">
          {rounds.map((round, idx) => {
            const isOpen = openRoundIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? isLight
                      ? "bg-white border-cyan-300/80 shadow-md"
                      : "bg-slate-800/60 border-cyan-500/40 shadow-inner"
                    : isLight
                    ? "bg-white border-slate-200/80 hover:border-slate-300"
                    : "bg-slate-800/30 border-slate-800 hover:border-slate-700"
                }`}
              >
                <button
                  onClick={() => setOpenRoundIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
                        isOpen
                          ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                          : isLight
                          ? "bg-slate-100 text-slate-800 border-slate-200"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      R{round.round_number || idx + 1}
                    </div>
                    <div className="truncate">
                      <div className={`text-sm md:text-base font-extrabold tracking-tight truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                        {round.title}
                      </div>
                      <div className={`text-xs flex items-center gap-2 mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-cyan-400" /> Duration: {round.duration}
                        </span>
                        <span>•</span>
                        <span className="truncate">{round.focus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`hidden sm:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                        isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {isOpen ? "Collapse Details" : "View Details"}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div
                    className={`p-5 pt-0 border-t space-y-4 text-xs ${
                      isLight ? "border-slate-100" : "border-slate-800/80"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      {/* Focus Description */}
                      <div
                        className={`p-4 rounded-xl border space-y-1 ${
                          isLight ? "bg-slate-50/80 border-slate-200 text-slate-800" : "bg-slate-900/60 border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="font-bold uppercase tracking-wider text-[10px] text-cyan-500 flex items-center gap-1.5">
                          <Target className="w-3 h-3" />
                          <span>Evaluation Focus</span>
                        </div>
                        <p className={`leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                          {round.focus}
                        </p>
                      </div>

                      {/* Key Topics */}
                      <div
                        className={`p-4 rounded-xl border space-y-2 ${
                          isLight ? "bg-slate-50/80 border-slate-200" : "bg-slate-900/60 border-slate-800"
                        }`}
                      >
                        <div className="font-bold uppercase tracking-wider text-[10px] text-blue-400 flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3" />
                          <span>Key Technical Topics Evaluated</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {round.key_topics && round.key_topics.length > 0 ? (
                            round.key_topics.map((topic, tIdx) => (
                              <span
                                key={tIdx}
                                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                                  isLight
                                    ? "bg-white text-slate-800 border-slate-200 shadow-2xs"
                                    : "bg-slate-800 text-cyan-300 border-slate-700"
                                }`}
                              >
                                {topic}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">Standard technical competencies.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tactical Preparation Tips Callout */}
                    {round.preparation_tips && (
                      <div
                        className={`p-4 rounded-xl border flex items-start gap-3 ${
                          isLight
                            ? "bg-cyan-50/80 border-cyan-200 text-cyan-950"
                            : "bg-cyan-950/30 border-cyan-800/50 text-cyan-200"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 shrink-0 text-cyan-500 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold block">
                            Tactical Preparation Strategy for {companyName}:
                          </span>
                          <p className="leading-relaxed opacity-95">
                            {round.preparation_tips}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
