"use client";

import React, { useState, useMemo } from "react";
import {
  Rocket,
  Check,
  Plus,
  Copy,
  Award,
  FileText,
  MessageSquare,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  Cpu
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface InterviewScript {
  elevator_pitch?: string;
  key_technical_tradeoff?: string;
  quantified_result?: string;
}

interface ProjectRecommendation {
  project_title: string;
  domain_tag?: string;
  difficulty?: string;
  target_company_relevance?: string;
  tech_stack?: string[];
  architecture_overview?: string;
  cv_star_bullets?: string[];
  interview_explanation_script?: InterviewScript;
}

interface RecommendedProjectsSectionProps {
  projects: ProjectRecommendation[];
  companyName: string;
  jobRole?: string;
  addedProjects: string[];
  onAddProject: (title: string, bullets: string[]) => void;
}

export default function RecommendedProjectsSection({
  projects,
  companyName,
  jobRole = "Target Role",
  addedProjects,
  onAddProject
}: RecommendedProjectsSectionProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [copiedBullet, setCopiedBullet] = useState<string | null>(null);
  const [expandedScriptIndex, setExpandedScriptIndex] = useState<number | null>(0);

  // Available unique domain tags
  const domains = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.domain_tag) set.add(p.domain_tag);
    });
    return ["All", ...Array.from(set)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedDomain === "All") return projects;
    return projects.filter((p) => p.domain_tag === selectedDomain);
  }, [projects, selectedDomain]);

  const handleCopyBullet = (bullet: string) => {
    navigator.clipboard.writeText(bullet);
    setCopiedBullet(bullet);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const addedCount = projects.filter((p) => addedProjects.includes(p.project_title)).length;

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl ${
        isLight
          ? "bg-white/95 border-slate-200/90 shadow-slate-200/50 text-slate-900"
          : "bg-slate-900/90 border-slate-800/80 shadow-black/70 text-slate-100 backdrop-blur-xl"
      }`}
    >
      {/* Top Gradient Accent Banner */}
      <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

      <div className="p-6 md:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-inherit">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                  isLight
                    ? "bg-pink-50 text-pink-800 border-pink-200"
                    : "bg-pink-950/60 text-pink-300 border-pink-800/60"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
                Portfolio Accelerator v3.0
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  isLight
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                <Target className="w-3 h-3 text-pink-400" />
                Targeted for {companyName}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border ${
                  isLight
                    ? "bg-pink-500/10 border-pink-300 text-pink-700"
                    : "bg-pink-500/10 border-pink-500/30 text-pink-400"
                }`}
              >
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  Recommended Gap-Filling Projects to Add
                </h3>
                <p className={`text-xs md:text-sm mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Production-grade system architectures custom-tailored to bridge your tech stack gaps for {companyName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                isLight
                  ? "bg-pink-50 text-pink-900 border-pink-200"
                  : "bg-pink-950/40 text-pink-300 border-pink-700/50"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              {projects.length} Tailored Blueprints
            </span>
          </div>
        </div>

        {/* Executive KPI Stat Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight ? "bg-slate-50/80 border-slate-200/80 shadow-sm" : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Suggested Projects
            </span>
            <div className="text-3xl font-black text-pink-500">{projects.length}</div>
            <div className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-slate-500"}`}>Engineered for {companyName}</div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight ? "bg-slate-50/80 border-slate-200/80 shadow-sm" : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Match Impact
            </span>
            <div className="text-3xl font-black text-emerald-500">+35%</div>
            <div className={`text-[11px] mt-1 ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>Unlocks 100% standing</div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight ? "bg-slate-50/80 border-slate-200/80 shadow-sm" : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Focus Domains
            </span>
            <div className="text-3xl font-black text-indigo-400">{domains.length - 1}</div>
            <div className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-slate-500"}`}>Core architectural areas</div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight ? "bg-slate-50/80 border-slate-200/80 shadow-sm" : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Inserted into CV
            </span>
            <div className="text-3xl font-black text-teal-500">{addedCount}</div>
            <div className={`text-[11px] mt-1 ${isLight ? "text-teal-700" : "text-teal-400"}`}>
              {addedCount > 0 ? `${addedCount} active in resume` : "Click '+ Add' to sync"}
            </div>
          </div>
        </div>

        {/* Domain Filter Pills */}
        {domains.length > 2 && (
          <div
            className={`flex items-center p-1 rounded-2xl border overflow-x-auto ${
              isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800/60 border-slate-800"
            }`}
          >
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedDomain === dom
                    ? isLight
                      ? "bg-white text-slate-900 shadow-sm"
                      : "bg-pink-600 text-white shadow-sm"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        )}

        {/* Project Cards List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredProjects.map((proj, idx) => {
            const isAdded = addedProjects.includes(proj.project_title);
            const isScriptOpen = expandedScriptIndex === idx;

            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all space-y-5 ${
                  isLight
                    ? "bg-white border-slate-200/90 shadow-sm hover:border-pink-300"
                    : "bg-slate-800/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isLight
                            ? "bg-pink-50 text-pink-900 border-pink-200"
                            : "bg-pink-500/20 text-pink-300 border-pink-500/40"
                        }`}
                      >
                        {proj.domain_tag || "System Architecture"}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                          isLight
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        Difficulty: {proj.difficulty || "Advanced"}
                      </span>
                    </div>

                    <h4 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                      {proj.project_title}
                    </h4>

                    {proj.target_company_relevance && (
                      <p className={`text-xs font-semibold ${isLight ? "text-indigo-900" : "text-indigo-300"}`}>
                        🎯 {proj.target_company_relevance}
                      </p>
                    )}
                  </div>

                  {/* Add to Resume Action */}
                  <button
                    onClick={() => onAddProject(proj.project_title, proj.cv_star_bullets || [])}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-sm ${
                      isAdded
                        ? isLight
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : isLight
                        ? "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-pink-600/20"
                        : "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white shadow-pink-600/30"
                    }`}
                  >
                    {isAdded ? <Check className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4" />}
                    <span>{isAdded ? "Added to Live CV ✓" : "+ Add Project to My Resume"}</span>
                  </button>
                </div>

                {/* Tech Stack Chips */}
                {proj.tech_stack && proj.tech_stack.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className={`text-xs font-bold mr-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      Tech Stack:
                    </span>
                    {proj.tech_stack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className={`px-2.5 py-0.5 rounded-lg border text-xs font-mono font-bold ${
                          isLight
                            ? "bg-slate-100 text-slate-800 border-slate-200"
                            : "bg-slate-900 text-pink-300 border-slate-700"
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Architecture Overview */}
                {proj.architecture_overview && (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-1 ${
                      isLight
                        ? "bg-slate-50/80 border-slate-200 text-slate-800"
                        : "bg-slate-900/60 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-indigo-500">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Architecture Overview</span>
                    </div>
                    <p className={`leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      {proj.architecture_overview}
                    </p>
                  </div>
                )}

                {/* STAR Bullets */}
                {proj.cv_star_bullets && proj.cv_star_bullets.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-inherit">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                        <Award className="w-3.5 h-3.5 text-pink-400" />
                        <span>STAR Resume Bullet Points (Ready to Copy)</span>
                      </span>
                      <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                        Click icon to copy
                      </span>
                    </div>

                    <div className="space-y-2">
                      {proj.cv_star_bullets.map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${
                            isLight
                              ? "bg-slate-50/70 border-slate-200/90 text-slate-800"
                              : "bg-slate-900/60 border-slate-800/80 text-slate-300"
                          }`}
                        >
                          <div className="leading-relaxed font-medium">
                            • {bullet}
                          </div>
                          <button
                            onClick={() => handleCopyBullet(bullet)}
                            className={`p-1.5 rounded-lg border shrink-0 transition-all ${
                              isLight
                                ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-600"
                                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400"
                            }`}
                            title="Copy bullet"
                          >
                            {copiedBullet === bullet ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Interview Defense Script (Collapsible Accordion) */}
                {proj.interview_explanation_script && (
                  <div
                    className={`rounded-xl border overflow-hidden transition-all text-xs ${
                      isLight
                        ? "bg-indigo-50/50 border-indigo-200/80"
                        : "bg-indigo-950/20 border-indigo-800/40"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedScriptIndex(isScriptOpen ? null : idx)}
                      className="w-full p-3.5 flex items-center justify-between font-bold text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        <span className={isLight ? "text-indigo-950 font-extrabold" : "text-indigo-300 font-extrabold"}>
                          How to Explain this Project in {companyName} Interviews
                        </span>
                      </div>
                      {isScriptOpen ? (
                        <ChevronUp className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-indigo-400" />
                      )}
                    </button>

                    {isScriptOpen && (
                      <div className={`p-4 pt-0 space-y-2.5 border-t ${isLight ? "border-indigo-100 text-slate-800" : "border-indigo-900/40 text-slate-300"}`}>
                        {proj.interview_explanation_script.elevator_pitch && (
                          <div className="pt-2">
                            <span className={`font-bold block ${isLight ? "text-slate-900" : "text-white"}`}>
                              1. Elevator Pitch:
                            </span>
                            <p className="italic pt-0.5 leading-relaxed opacity-90">
                              &ldquo;{proj.interview_explanation_script.elevator_pitch}&rdquo;
                            </p>
                          </div>
                        )}

                        {proj.interview_explanation_script.key_technical_tradeoff && (
                          <div>
                            <span className={`font-bold block ${isLight ? "text-slate-900" : "text-white"}`}>
                              2. Key Technical Trade-off:
                            </span>
                            <p className="italic pt-0.5 leading-relaxed opacity-90">
                              &ldquo;{proj.interview_explanation_script.key_technical_tradeoff}&rdquo;
                            </p>
                          </div>
                        )}

                        {proj.interview_explanation_script.quantified_result && (
                          <div>
                            <span className={`font-bold block ${isLight ? "text-slate-900" : "text-white"}`}>
                              3. Quantified Impact Metric:
                            </span>
                            <p className="italic pt-0.5 leading-relaxed opacity-90">
                              &ldquo;{proj.interview_explanation_script.quantified_result}&rdquo;
                            </p>
                          </div>
                        )}
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
