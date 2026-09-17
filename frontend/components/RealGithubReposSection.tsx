"use client";

import React, { useState, useMemo } from "react";
import {
  Github,
  Award,
  Check,
  Plus,
  Copy,
  ExternalLink,
  Search,
  Star,
  FolderGit2,
  Cpu,
  Layers
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface RealRepo {
  repo_name: string;
  repo_url: string;
  language: string;
  stars: number;
  description: string;
  cv_star_bullets: string[];
}

interface RealGithubReposSectionProps {
  repos: RealRepo[];
  username: string;
  companyName: string;
  addedProjects: string[];
  onAddProject: (title: string, bullets: string[]) => void;
}

export default function RealGithubReposSection({
  repos,
  username,
  companyName,
  addedProjects,
  onAddProject
}: RealGithubReposSectionProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [copiedBullet, setCopiedBullet] = useState<string | null>(null);

  // Available unique languages
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return ["All", ...Array.from(set)];
  }, [repos]);

  // Filtered repos
  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      const matchesSearch =
        repo.repo_name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (selectedLanguage !== "All" && repo.language !== selectedLanguage) {
        return false;
      }
      return true;
    });
  }, [repos, searchQuery, selectedLanguage]);

  const handleCopyBullet = (bullet: string) => {
    navigator.clipboard.writeText(bullet);
    setCopiedBullet(bullet);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const totalBullets = repos.reduce((acc, r) => acc + (r.cv_star_bullets?.length || 0), 0);
  const totalAdded = repos.filter((r) => addedProjects.includes(r.repo_name)).length;

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl ${
        isLight
          ? "bg-white/95 border-slate-200/90 shadow-slate-200/50 text-slate-900"
          : "bg-slate-900/90 border-slate-800/80 shadow-black/70 text-slate-100 backdrop-blur-xl"
      }`}
    >
      {/* Top Gradient Banner */}
      <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500" />

      <div className="p-6 md:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-inherit">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                  isLight
                    ? "bg-purple-50 text-purple-800 border-purple-200"
                    : "bg-purple-950/60 text-purple-300 border-purple-800/60"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                Verified GitHub Artifacts
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  isLight
                    ? "bg-slate-100 text-slate-700 border-slate-200"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                <FolderGit2 className="w-3 h-3 text-purple-400" />
                @{username} Public Repos
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border ${
                  isLight
                    ? "bg-purple-500/10 border-purple-300 text-purple-700"
                    : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                }`}
              >
                <Github className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  Your Real Uploaded GitHub Repositories
                </h3>
                <p className={`text-xs md:text-sm mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Real repositories indexed directly from your GitHub profile, aligned with {companyName}&apos;s engineering bar
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                isLight
                  ? "bg-purple-50 text-purple-900 border-purple-200"
                  : "bg-purple-950/40 text-purple-300 border-purple-700/50"
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              {repos.length} Repositories Indexed
            </span>
          </div>
        </div>

        {/* Executive KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight ? "bg-slate-50/80 border-slate-200/80 shadow-sm" : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Verified Repos
            </span>
            <div className="text-3xl font-black text-purple-500">{repos.length}</div>
            <div className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-slate-500"}`}>From public profile</div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight ? "bg-slate-50/80 border-slate-200/80 shadow-sm" : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              STAR Bullets
            </span>
            <div className="text-3xl font-black text-emerald-500">{totalBullets}</div>
            <div className={`text-[11px] mt-1 ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>CV-ready metrics</div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight ? "bg-slate-50/80 border-slate-200/80 shadow-sm" : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Code Languages
            </span>
            <div className="text-3xl font-black text-teal-500">{availableLanguages.length - 1}</div>
            <div className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-slate-500"}`}>Polyglot tech stack</div>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight ? "bg-slate-50/80 border-slate-200/80 shadow-sm" : "bg-slate-800/40 border-slate-800 shadow-inner"
            }`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Added to CV
            </span>
            <div className="text-3xl font-black text-indigo-400">{totalAdded}</div>
            <div className={`text-[11px] mt-1 ${isLight ? "text-indigo-700" : "text-indigo-300"}`}>{totalAdded > 0 ? "Synced to live resume" : "Ready to insert"}</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Language Pills */}
          <div
            className={`flex items-center p-1 rounded-2xl border overflow-x-auto ${
              isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800/60 border-slate-800"
            }`}
          >
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedLanguage === lang
                    ? isLight
                      ? "bg-white text-slate-900 shadow-sm"
                      : "bg-purple-600 text-white shadow-sm"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Search Box */}
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
              placeholder="Search repositories..."
              className={`w-full pl-8 pr-8 py-1.5 rounded-xl text-xs border outline-none transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                  : "bg-slate-800/60 border-slate-700 text-slate-100 focus:bg-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
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

        {/* Repository Cards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredRepos.map((repo, idx) => {
            const isAdded = addedProjects.includes(repo.repo_name);
            return (
              <div
                key={`${repo.repo_name}-${idx}`}
                className={`p-6 rounded-2xl border transition-all space-y-4 ${
                  isLight
                    ? "bg-white border-slate-200/90 shadow-sm hover:border-purple-300"
                    : "bg-slate-800/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Repo Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          isLight
                            ? "bg-purple-100 text-purple-900 border-purple-300"
                            : "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        }`}
                      >
                        {repo.language || "Polyglot"}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border flex items-center gap-1 ${
                          isLight
                            ? "bg-amber-100/80 text-amber-950 border-amber-300"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        <Star className="w-3 h-3 text-amber-500" />
                        {repo.stars} Stars
                      </span>
                    </div>

                    <a
                      href={repo.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-lg font-black transition-colors inline-flex items-center gap-1.5 group ${
                        isLight ? "text-slate-900 hover:text-purple-700" : "text-white hover:text-purple-300"
                      }`}
                    >
                      <span>{repo.repo_name}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </a>

                    <p className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      {repo.description || "Public open-source repository on GitHub."}
                    </p>
                  </div>

                  {/* Add to CV Button */}
                  <button
                    onClick={() => onAddProject(repo.repo_name, repo.cv_star_bullets)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-sm ${
                      isAdded
                        ? isLight
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : isLight
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/20"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30"
                    }`}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAdded ? "Added to Live CV ✓" : "+ Add to My CV"}</span>
                  </button>
                </div>

                {/* STAR Bullets Card */}
                {repo.cv_star_bullets?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-inherit">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold flex items-center gap-1.5 ${isLight ? "text-purple-900" : "text-purple-300"}`}>
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        <span>Quantified STAR Resume Bullets Generated for {companyName}</span>
                      </span>
                      <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                        Click icon to copy
                      </span>
                    </div>

                    <div className="space-y-2">
                      {repo.cv_star_bullets.map((bullet, bIdx) => (
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
