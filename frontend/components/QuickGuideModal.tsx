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
  Bot,
  Layers,
  Cpu,
  Terminal,
  Activity,
  CheckCircle2,
  Lock
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function QuickGuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"architecture" | "pipeline" | "specs">("architecture");
  const { theme } = useTheme();
  const isLight = theme === "light";

  const pipelineSteps = [
    {
      step: "01",
      icon: <Github className="w-4 h-4 text-purple-400" />,
      title: "GitHub Ingestion & Repository Parsing",
      desc: "Connect your public GitHub username. Reset Path traverses commit trees, extracts language frequency, language distributions, and analyzes real system engineering complexity.",
      tag: "Live Ingest"
    },
    {
      step: "02",
      icon: <Building2 className="w-4 h-4 text-teal-400" />,
      title: "Target Company Intelligence Alignment",
      desc: "Our engine maps your repositories against hiring rubrics and interview loop structures of top tech firms (Google, OpenAI, Stripe, Amazon, Meta).",
      tag: "JD Matching"
    },
    {
      step: "03",
      icon: <Target className="w-4 h-4 text-indigo-400" />,
      title: "ATS Keyword Scanner & 5-Axis Radar",
      desc: "Simulate enterprise screening algorithms (Workday, Taleo). Identify critical keyword gaps and calculate your 5-axis competency radar score.",
      tag: "Screening Audit"
    },
    {
      step: "04",
      icon: <Mic className="w-4 h-4 text-pink-400" />,
      title: "AI Voice Mock Interview & STAR Defense",
      desc: "Defend your actual code in real-time conversational AI audio mock interviews with follow-ups on system bottlenecks and trade-offs.",
      tag: "Audio Simulation"
    }
  ];

  const engineFeatures = [
    {
      icon: <Target className="w-4 h-4 text-pink-400" />,
      title: "5-Axis Company Radar",
      badge: "Real-time Telemetry",
      desc: "Evaluates your code footprint across Architecture, System Design, Testing & CI/CD, Stack Alignment, and Domain Mastery."
    },
    {
      icon: <Cpu className="w-4 h-4 text-teal-400" />,
      title: "ATS Parser v3.4 Engine",
      badge: "Pass Rate Simulation",
      desc: "Simulates Fortune 500 applicant screening filters to reveal exact missing tech keywords and allows 1-click CV injection."
    },
    {
      icon: <Bot className="w-4 h-4 text-purple-400" />,
      title: "AI Voice Mock Interviewer",
      badge: "Web Speech API",
      desc: "Generates tailored multi-round interview questions targeting your specific GitHub projects with speech synthesis & STAR scoring."
    },
    {
      icon: <FileText className="w-4 h-4 text-indigo-400" />,
      title: "Classic ATS Resume Studio",
      badge: "Export Ready",
      desc: "Builds clean single-column machine-readable resumes with bullet points quantified by impact metrics, latency, and throughput."
    }
  ];

  const systemSpecs = [
    { label: "Platform Version", value: "Reset Path v3.4 Enterprise SaaS" },
    { label: "GitHub Ingestion API", value: "REST v3 + Public Commit Analyzer" },
    { label: "ATS Filter Algorithm", value: "Semantic & Exact Match Keyword Density" },
    { label: "Privacy Standard", value: "100% Client-Safe, Zero Credentials Stored" },
    { label: "Interview Engine", value: "Targeted Project Defense & Rubric Evaluation" },
    { label: "Export Formats", value: "Standard ATS Markdown, Clean Print PDF" }
  ];

  return (
    <>
      {/* Floating SaaS Widget Button (Command Pill) */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="About Reset Path & Quick Guide"
        className={`fixed right-4 md:right-6 bottom-6 md:bottom-7 z-40 h-13 px-4 md:px-5 rounded-full flex items-center gap-3 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group border backdrop-blur-xl ${
          isLight
            ? "bg-white/95 text-slate-900 border-slate-200/90 shadow-slate-300/50 hover:border-indigo-400"
            : "bg-slate-950/95 text-white border-slate-800/90 shadow-black/80 hover:border-indigo-500/60"
        }`}
        style={{ minWidth: "190px" }}
      >
        {/* Pulsing indicator */}
        <div className="relative shrink-0">
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12 ${
              isLight
                ? "bg-slate-100 text-indigo-600 border border-slate-200"
                : "bg-slate-900 text-indigo-400 border border-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
            About Reset Path
          </span>
          <span
            className={`text-[10px] font-semibold flex items-center gap-1 ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}
          >
            <span>SaaS Overview</span>
            <span>•</span>
            <span className="text-emerald-500">v3.4</span>
          </span>
        </div>
      </button>

      {/* Pop Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border transition-all shadow-2xl overflow-hidden ${
              isLight
                ? "bg-white text-slate-900 border-slate-200 shadow-slate-300/60"
                : "bg-slate-950 text-slate-100 border-slate-800 shadow-black/90"
            }`}
          >
            {/* Top Multi-Color Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-pink-500" />

            <div className="p-6 md:p-8 space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-inherit">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                      isLight
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                        : "bg-indigo-950/80 text-indigo-400 border border-indigo-800/60"
                    }`}
                  >
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg md:text-xl font-extrabold tracking-tight">
                        About Reset Path
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                        v3.4 LIVE
                      </span>
                    </div>
                    <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      Autonomous AI Career Acceleration &amp; Screening Telemetry Platform
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

              {/* Segmented Tab Navigation */}
              <div
                className={`flex rounded-2xl p-1 border ${
                  isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-800"
                }`}
              >
                <button
                  onClick={() => setActiveTab("architecture")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "architecture"
                      ? isLight
                        ? "bg-white text-slate-900 shadow-sm"
                        : "bg-indigo-600 text-white shadow-md"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Core Architecture
                </button>
                <button
                  onClick={() => setActiveTab("pipeline")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "pipeline"
                      ? isLight
                        ? "bg-white text-slate-900 shadow-sm"
                        : "bg-indigo-600 text-white shadow-md"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  4-Step Pipeline
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "specs"
                      ? isLight
                        ? "bg-white text-slate-900 shadow-sm"
                        : "bg-indigo-600 text-white shadow-md"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Platform Specs
                </button>
              </div>

              {/* Tab 1: Core Architecture */}
              {activeTab === "architecture" && (
                <div className="space-y-4 animate-fadeIn">
                  <div
                    className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      isLight
                        ? "bg-slate-50 border-slate-200 text-slate-800"
                        : "bg-slate-900/60 border-slate-800 text-slate-300"
                    }`}
                  >
                    <p className="font-bold text-sm text-indigo-400 mb-1">
                      Reverse-Engineering Software Engineering Hiring
                    </p>
                    <p>
                      <strong>Reset Path</strong> benchmarks candidate codebases against the real engineering bars of world-class tech firms. By indexing public GitHub repositories, simulating enterprise ATS screening parsers, and conducting AI mock interviews, Reset Path transforms passive projects into quantified, interview-ready career assets.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {engineFeatures.map((f, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border space-y-1.5 transition-all ${
                          isLight
                            ? "bg-white border-slate-200 shadow-2xs hover:border-indigo-300"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${isLight ? "bg-slate-100" : "bg-slate-800"}`}>
                              {f.icon}
                            </div>
                            <span className="font-bold text-xs">{f.title}</span>
                          </div>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            isLight ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            {f.badge}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                          {f.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: 4-Step Pipeline */}
              {activeTab === "pipeline" && (
                <div className="space-y-3 animate-fadeIn">
                  {pipelineSteps.map((s, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                        isLight
                          ? "bg-slate-50 border-slate-200 hover:bg-white"
                          : "bg-slate-900/60 border-slate-800 hover:bg-slate-900"
                      }`}
                    >
                      <div
                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                          isLight
                            ? "bg-white text-indigo-700 border border-slate-200 shadow-2xs"
                            : "bg-slate-800 text-indigo-300 border border-slate-700"
                        }`}
                      >
                        {s.step}
                      </div>
                      <div className="space-y-1 text-xs min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold truncate">{s.title}</div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                            isLight ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-indigo-950 text-indigo-300 border-indigo-800"
                          }`}>
                            {s.tag}
                          </span>
                        </div>
                        <p className={`leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Platform Specs */}
              {activeTab === "specs" && (
                <div className="space-y-4 animate-fadeIn">
                  <div
                    className={`rounded-2xl border overflow-hidden ${
                      isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900/60"
                    }`}
                  >
                    <table className="w-full text-left text-xs">
                      <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-slate-800"}`}>
                        {systemSpecs.map((spec, idx) => (
                          <tr key={idx} className={isLight ? "hover:bg-slate-50" : "hover:bg-slate-800/40"}>
                            <td className={`p-3 font-semibold ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                              {spec.label}
                            </td>
                            <td className="p-3 font-mono font-bold text-right text-indigo-400">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                      isLight ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-emerald-950/30 border-emerald-800/50 text-emerald-200"
                    }`}
                  >
                    <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      Zero GitHub Token or private key required. Only public repositories and commit logs are queried.
                    </span>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-lg hover:opacity-95 transition-all"
                >
                  Explore Reset Path Dashboard &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
