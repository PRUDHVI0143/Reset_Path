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
  Info,
  ShieldCheck,
  Zap,
  Target,
  Bot
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function QuickGuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "guide">("about");
  const { theme } = useTheme();
  const isLight = theme === "light";

  const steps = [
    {
      step: "01",
      icon: <Github className="w-4 h-4 text-purple-400" />,
      title: "Input Your GitHub & Target Company",
      desc: "Paste your GitHub profile link and choose your dream company (e.g. OpenAI, Google, Stripe) or type any target company."
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

  const features = [
    {
      icon: <Target className="w-4 h-4 text-pink-400" />,
      title: "5-Axis Company Radar",
      desc: "Evaluates your code against specific engineering bars (Architecture, System Design, Testing, Tech Stack, & Impact)."
    },
    {
      icon: <Bot className="w-4 h-4 text-emerald-400" />,
      title: "AI Voice Mock Interviewer",
      desc: "Simulates realistic interview loops using real-time speech synthesis and evaluates your STAR method answers."
    },
    {
      icon: <FileText className="w-4 h-4 text-blue-400" />,
      title: "Classic ATS Resume Studio",
      desc: "Generates high-converting, single-column ATS resumes with instant keyword gap closing."
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-purple-400" />,
      title: "100% Privacy & Open Intelligence",
      desc: "Only analyzes public GitHub repositories with zero credentials required and client-safe encryption."
    }
  ];

  return (
    <>
      {/* Floating 'About & Guide' Pop Pill — Positioned to Cover Watermark */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="About Reset Path & Quick Guide"
        className={`fixed right-4 md:right-6 bottom-6 md:bottom-7 z-40 h-13 md:h-14 px-4 md:px-5 rounded-full flex items-center gap-3 shadow-2xl transition-all duration-300 hover:scale-105 group border ${
          isLight
            ? "bg-white text-emerald-950 border-emerald-400 shadow-emerald-950/20 hover:border-emerald-600 hover:shadow-emerald-950/30"
            : "bg-slate-950 text-white border-pink-500/50 shadow-pink-500/25 hover:border-pink-400 hover:shadow-pink-500/40"
        } backdrop-blur-xl animate-float`}
        style={{ minWidth: "185px" }}
      >
        {/* Pulsing notification dot */}
        <div className="relative shrink-0">
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500 border-2 border-slate-950"></span>
          </span>
          <div
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12 ${
              isLight
                ? "bg-emerald-100 text-emerald-700"
                : "bg-pink-950/80 text-pink-400 border border-pink-700/50"
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Button Text */}
        <div className="flex flex-col text-left">
          <span className="text-[11px] md:text-xs font-black uppercase tracking-wider flex items-center gap-1">
            About Reset Path
          </span>
          <span
            className={`text-[9px] md:text-[10px] font-semibold ${
              isLight ? "text-emerald-800/80" : "text-slate-400"
            }`}
          >
            Guide &amp; Overview
          </span>
        </div>
      </button>

      {/* Pop Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl border transition-all ${
              isLight
                ? "bg-white text-emerald-950 border-emerald-300 shadow-emerald-950/20"
                : "bg-slate-950 text-white border-indigo-500/30 shadow-black/80"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                    isLight
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gradient-to-br from-purple-900 to-pink-900 text-pink-300 border border-pink-700/40"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base md:text-lg font-extrabold tracking-tight">
                      About Reset Path
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      v1.0 AI
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? "text-emerald-800/70" : "text-slate-400"}`}>
                    Autonomous AI Career Accelerator &amp; ATS Match Engine
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-xl transition-all ${
                  isLight ? "hover:bg-slate-100 text-slate-500" : "hover:bg-slate-800 text-slate-400"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div
              className={`flex rounded-xl p-1 border ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-800"
              }`}
            >
              <button
                onClick={() => setActiveTab("about")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "about"
                    ? isLight
                      ? "bg-white text-emerald-950 shadow-sm"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                About Platform
              </button>
              <button
                onClick={() => setActiveTab("guide")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "guide"
                    ? isLight
                      ? "bg-white text-emerald-950 shadow-sm"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Quick Guide (4 Steps)
              </button>
            </div>

            {/* Tab 1: About Platform */}
            {activeTab === "about" && (
              <div className="space-y-4 animate-fadeIn">
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    isLight
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : "bg-slate-900/90 border-slate-800 text-slate-300"
                  }`}
                >
                  <p className="font-semibold text-[13px] mb-1 text-pink-400">
                    What is Reset Path?
                  </p>
                  <p>
                    <strong>Reset Path</strong> is an intelligent career acceleration platform designed to reverse-engineer your dream job. It analyzes your public GitHub repositories, benchmarks your codebase against hiring requirements of top tech firms, simulates real AI technical interviews, and builds tailor-made, ATS-compliant CVs.
                  </p>
                </div>

                {/* Core Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {features.map((f, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border flex items-start gap-3 transition-all ${
                        isLight
                          ? "bg-white border-slate-200 shadow-sm"
                          : "bg-slate-900/60 border-slate-800"
                      }`}
                    >
                      <div
                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                          isLight ? "bg-slate-100" : "bg-slate-800"
                        }`}
                      >
                        {f.icon}
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <div className="font-bold text-slate-100">{f.title}</div>
                        <p className={`text-[11px] leading-snug ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Quick Guide */}
            {activeTab === "guide" && (
              <div className="space-y-3 animate-fadeIn">
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
            )}

            {/* Pro Tips Box */}
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                isLight ? "bg-amber-50/80 border-amber-300 text-amber-950" : "bg-amber-950/30 border-amber-700/50 text-amber-200"
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Pro Tip for 100% Match:
              </span>
              <p className="leading-relaxed opacity-90 text-[11px]">
                On your report page, check the <strong>ATS Keyword Scanner</strong>. Clicking <strong>&quot;+ Add&quot;</strong> on any missing keyword automatically injects it into your live resume editor!
              </p>
            </div>

            {/* Modal Footer Action */}
            <div className="pt-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-lg hover:opacity-95 transition-all"
              >
                Got It, Close &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
