"use client";

import React, { useState, useMemo } from "react";
import {
  Award,
  Check,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Zap,
  Filter
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface SkillItem {
  skill_name: string;
  category: string;
  mastery_level: string;
  status: string;
  company_relevance: string;
}

interface SkillMatrixTableProps {
  skills: SkillItem[];
  addedSkills: string[];
  onToggleSkill: (skill: string) => void;
  companyName: string;
  jobRole?: string;
}

export default function SkillMatrixTable({
  skills,
  addedSkills,
  onToggleSkill,
  companyName,
  jobRole = "Target Position"
}: SkillMatrixTableProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "mastered" | "gaps">("all");

  const masteredCount = skills.filter((s) => s.status === "Mastered").length;
  const gapsCount = skills.filter((s) => s.status !== "Mastered").length;

  const filteredSkills = useMemo(() => {
    return skills.filter((item) => {
      const matchesSearch =
        item.skill_name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.company_relevance.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (statusFilter === "mastered") return item.status === "Mastered";
      if (statusFilter === "gaps") return item.status !== "Mastered";
      return true;
    });
  }, [skills, searchQuery, statusFilter]);

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl ${
        isLight
          ? "bg-white/95 border-slate-200/90 shadow-slate-200/50 text-slate-900"
          : "bg-slate-900/90 border-slate-800/80 shadow-black/70 text-slate-100 backdrop-blur-xl"
      }`}
    >
      {/* Top Gradient Banner */}
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
                Competency Heatmap &amp; Gap Matrix v3.1
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  isLight
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                <Layers className="w-3 h-3 text-teal-400" />
                Screening Rubric Alignment
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
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  Skill Matrix &amp; Suggested Additions
                </h3>
                <p className={`text-xs md:text-sm mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Granular capability evaluation against {companyName}&apos;s expectations. Click &ldquo;+ Add&rdquo; to insert any skill into your live CV.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                isLight ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-emerald-950/40 text-emerald-300 border-emerald-700/50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {masteredCount} Mastered
            </span>
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                gapsCount > 0
                  ? isLight ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-amber-950/40 text-amber-300 border-amber-700/50"
                  : isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {gapsCount} Gaps to Fill
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div
            className={`flex items-center p-1 rounded-2xl border overflow-x-auto ${
              isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800/60 border-slate-800"
            }`}
          >
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === "all"
                  ? isLight ? "bg-white text-slate-900 shadow-sm" : "bg-teal-600 text-white shadow-sm"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              All Skills ({skills.length})
            </button>
            <button
              onClick={() => setStatusFilter("mastered")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === "mastered"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : isLight ? "text-emerald-800 hover:text-emerald-950" : "text-emerald-400 hover:text-emerald-300"
              }`}
            >
              <Check className="w-3 h-3" />
              Mastered ({masteredCount})
            </button>
            <button
              onClick={() => setStatusFilter("gaps")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === "gaps"
                  ? "bg-amber-600 text-white shadow-sm"
                  : isLight ? "text-amber-800 hover:text-amber-950" : "text-amber-400 hover:text-amber-300"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Gaps ({gapsCount})
            </button>
          </div>

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
              placeholder="Search skills, category..."
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

        {/* Modern SaaS Table */}
        <div
          className={`rounded-2xl border overflow-hidden ${
            isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900/60"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`uppercase tracking-wider font-bold border-b ${
                  isLight
                    ? "bg-slate-50 text-slate-700 border-slate-200"
                    : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                <tr>
                  <th className="p-4">Skill / Technology</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Mastery Level</th>
                  <th className="p-4">Fit Status</th>
                  <th className="p-4">Company Relevance</th>
                  <th className="p-4 text-right">Add to CV</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isLight ? "divide-slate-100 text-slate-900" : "divide-slate-800/60 text-slate-200"
                }`}
              >
                {filteredSkills.length > 0 ? (
                  filteredSkills.map((item, idx) => {
                    const isAdded = addedSkills.includes(item.skill_name);
                    const isMastered = item.status === "Mastered";

                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="p-4 font-bold flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isMastered ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          <span className="font-mono text-xs">{item.skill_name}</span>
                        </td>
                        <td className={`p-4 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                          {item.category}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              item.mastery_level === "Advanced"
                                ? isLight
                                  ? "bg-purple-50 text-purple-800 border-purple-200"
                                  : "bg-purple-950/60 text-purple-300 border-purple-800/60"
                                : item.mastery_level === "Intermediate"
                                ? isLight
                                  ? "bg-teal-50 text-teal-800 border-teal-200"
                                  : "bg-teal-950/60 text-teal-300 border-teal-800/60"
                                : isLight
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-amber-950/60 text-amber-300 border-amber-800/60"
                            }`}
                          >
                            {item.mastery_level}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isMastered
                                ? isLight
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                                : isLight
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-amber-950/60 text-amber-300 border-amber-800/60"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className={`p-4 text-xs font-medium max-w-xs ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                          {item.company_relevance}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => onToggleSkill(item.skill_name)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-95 border ${
                              isAdded
                                ? isLight
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-emerald-900/60 text-emerald-300 border-emerald-700/50"
                                : isLight
                                ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600 shadow-sm"
                                : "bg-teal-600/30 hover:bg-teal-600 text-teal-200 border-teal-500/50"
                            }`}
                          >
                            {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Plus className="w-3.5 h-3.5" />}
                            <span>{isAdded ? "Added" : "+ Add"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No skills match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
