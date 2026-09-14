"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  X,
  Sparkles,
  Github,
  Building2,
  Mic,
  FileText,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function QuickGuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === "light";

  const steps = [
    {
      step: "01",
      icon: <Github className="w-4 h-4 text-purple-400" />,
      title: "Input Your GitHub & Target Company",
      desc: "Paste your GitHub profile link and choose your dream company (e.g. OpenAI, Google, Stripe) or type any company."
    },
    {
      step: "02",
      icon: <Building2 className="w-4 h-4 text-emerald-400" />,
      title: "Get Real-Time Intelligence & Match Score",
      desc: "Reset Path analyzes your real code mastery, checks company interview rounds, and calculates your 5-Axis Radar & ATS Match Score."
    },
    {
      step: "03",
      icon: <Mic className="w-4 h-4 text-pink-400" />,
      title: "Practice AI Mock Interviews with Voice",
      desc: "Click 'AI Mock Interview' to practice defense questions on your real repositories using voice or text with instant STAR scoring."
    },
    {
      step: "04",
      icon: <FileText className="w-4 h-4 text-blue-400" />,
      title: "Export Your ATS-Ready Classic Resume",
      desc: "Switch to 'Live Resume Studio', click '+ Add' on any tailored project, and hit 'Print / Save as PDF' for a verified ATS resume."
    }
  ];

  return (
    <>
      {/* Floating Pop Button on the Right — Circular & Prominent */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="How to use Reset Path guide"
        className={`fixed right-6 bottom-8 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 group border ${
          isLight
            ? "bg-white/95 text-emerald-950 border-emerald-400 shadow-emerald-950/20 hover:border-emerald-600 hover:shadow-emerald-950/30"
            : "bg-slate-900/95 text-white border-pink-500/50 shadow-pink-500/25 hover:border-pink-400 hover:shadow-pink-500/40"
        } backdrop-blur-md animate-float`}
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-80"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500 border-2 border-slate-900"></span>
        </span>
        <HelpCircle className={`w-6 h-6 transition-transform group-hover:rotate-12 ${isLight ? "text-emerald-700" : "text-pink-400"}`} />
        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-90">
          Guide
        </span>
      </button>

      {/* Pop Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl border transition-all ${
              isLight
                ? "bg-white text-emerald-950 border-emerald-300 shadow-emerald-950/20"
                : "bg-slate-950 text-white border-indigo-500/30 shadow-black/80"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isLight ? "bg-emerald-100 text-emerald-700" : "bg-purple-950 text-purple-300 border border-purple-700/50"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">
                    Quick Guide — How Reset Path Works
                  </h3>
                  <p className={`text-xs ${isLight ? "text-emerald-800/70" : "text-slate-400"}`}>
                    Your autonomous AI career accelerator &amp; CV match engine
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-xl transition-all ${
                  isLight ? "hover:bg-slate-100 text-slate-500" : "hover:bg-slate-800 text-slate-400"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simple Steps */}
            <div className="space-y-3.5">
              {steps.map((s, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3.5 transition-all hover:scale-[1.01] ${
                    isLight
                      ? "bg-emerald-50/70 border-emerald-200"
                      : "bg-slate-900/90 border-slate-800"
                  }`}
                >
                  <div
                    className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      isLight
                        ? "bg-white text-emerald-900 border border-emerald-300 shadow-sm"
                        : "bg-slate-800 text-purple-300 border border-slate-700"
                    }`}
                  >
                    {s.icon}
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-extrabold flex items-center gap-1.5">
                      <span className="text-[10px] text-pink-500 font-mono">STEP {s.step}:</span>
                      <span>{s.title}</span>
                    </div>
                    <p className={isLight ? "text-emerald-900/80 leading-relaxed" : "text-slate-300 leading-relaxed"}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Tips Box */}
            <div
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                isLight ? "bg-amber-50/80 border-amber-300 text-amber-950" : "bg-amber-950/30 border-amber-700/50 text-amber-200"
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                💡 Pro Tip for 100% Match:
              </span>
              <p className="leading-relaxed opacity-90">
                Check the <strong>ATS Keyword Scanner</strong> on your report page. Clicking <strong>&quot;+ Add&quot;</strong> on any missing keyword automatically injects it into your live resume editor!
              </p>
            </div>

            <div className="text-right pt-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-lg hover:opacity-95 transition-all"
              >
                Got It, Let&apos;s Go! →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
