"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Github,
  Building2,
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Code2,
  TrendingUp,
  Cpu,
  Terminal,
  Zap,
  Check,
  ExternalLink,
  Search,
  FileText,
  Clock,
  ChevronRight,
  Flame,
  Target,
  BarChart3,
  Award
} from "lucide-react";
import { analyzeCareerProfile, fetchCareerHistory } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

const PRESET_COMPANIES = [
  {
    name: "Google",
    role: "Software Engineer",
    icon: "🌐",
    tier: "Tier-1 Tech",
    tagColor: "bg-blue-500/10 text-blue-500 border-blue-500/30"
  },
  {
    name: "Razorpay",
    role: "Backend Engineer",
    icon: "💳",
    tier: "FinTech Scaleup",
    tagColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30"
  },
  {
    name: "Stripe",
    role: "Full Stack Engineer",
    icon: "⚡",
    tier: "Global Payments",
    tagColor: "bg-purple-500/10 text-purple-500 border-purple-500/30"
  },
  {
    name: "Microsoft",
    role: "Systems Engineer",
    icon: "💻",
    tier: "Enterprise Cloud",
    tagColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30"
  },
  {
    name: "Amazon",
    role: "SDE-II (Cloud)",
    icon: "📦",
    tier: "AWS Distributed",
    tagColor: "bg-amber-500/10 text-amber-500 border-amber-500/30"
  },
  {
    name: "OpenAI",
    role: "AI / ML Engineer",
    icon: "🤖",
    tier: "Frontier AI",
    tagColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
  }
];

const COMMON_ROLES = [
  "Full Stack Engineer",
  "Backend Systems Engineer",
  "Frontend Engineer",
  "DevOps / Cloud SRE",
  "AI / ML Engineer"
];

export default function CareerInputPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [githubUsername, setGithubUsername] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("Full Stack Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [showJdDrawer, setShowJdDrawer] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchCareerHistory()
      .then((data) => setRecentAnalyses(data.slice(0, 4)))
      .catch((e) => console.log("History error", e));
  }, []);

  const steps = [
    "Analyzing GitHub profile, language breakdown & top repositories...",
    "Gathering target company interview rounds & tech stack intelligence...",
    "Computing 'Is It Your Type?' match score & cultural compatibility...",
    "Synthesizing Skill Ranking Matrix (Mastered vs Skill Gaps)...",
    "Generating tailored CV projects, STAR bullet points & interview defense scripts..."
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername.trim() || !companyName.trim() || loading) return;

    setLoading(true);
    setCurrentStepIndex(0);
    setProgressPercent(15);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev < steps.length - 1 ? prev + 1 : prev;
        setProgressPercent(Math.min(95, Math.round(((next + 1) / steps.length) * 100)));
        return next;
      });
    }, 1400);

    try {
      const data = await analyzeCareerProfile({
        github_username: githubUsername.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, ""),
        company_name: companyName.trim(),
        job_role: jobRole.trim(),
        job_description: jobDescription.trim()
      });
      clearInterval(stepInterval);
      setProgressPercent(100);
      router.push(`/career/${data.id}`);
    } catch (err: any) {
      clearInterval(stepInterval);
      alert(err.message || "Failed to analyze career profile");
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof PRESET_COMPANIES[0]) => {
    setCompanyName(preset.name);
    setJobRole(preset.role);
  };

  const cleanHandle = githubUsername.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HERO HEADER (MODERN SAAS TELEMETRY)                         */}
      {/* ========================================================================= */}
      <div className="text-center space-y-5 max-w-4xl mx-auto">
        {/* Telemetry Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border shadow-sm backdrop-blur-md transition-all text-xs font-mono font-semibold">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className={isLight ? "text-slate-700" : "text-slate-300"}>
            ENTERPRISE CAREER RE-ENGINEERING ENGINE
          </span>
          <span className="text-emerald-500 font-bold">v3.4 LIVE</span>
        </div>

        {/* Hero Title */}
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] transition-colors ${
            isLight ? "text-slate-900" : "text-white"
          }`}
        >
          Match your GitHub with any target company. <br />
          <span className="bg-gradient-to-r from-teal-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
            Get tailored CV projects &amp; interview defense scripts.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed transition-colors ${
            isLight ? "text-slate-600 font-normal" : "text-slate-300 font-normal"
          }`}
        >
          Input your GitHub profile and target company. Reset Path analyzes your code mastery,
          evaluates company fit (&ldquo;Is It Your Type?&rdquo;), details exact interview rounds, and builds customized CV projects with STAR bullet points.
        </p>

        {/* Modern SaaS Metric Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm ${
            isLight ? "bg-white/80 border-slate-200 text-slate-700" : "bg-slate-900/60 border-slate-800 text-slate-300"
          }`}>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Direct GitHub REST Telemetry</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm ${
            isLight ? "bg-white/80 border-slate-200 text-slate-700" : "bg-slate-900/60 border-slate-800 text-slate-300"
          }`}>
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            <span>Instant ATS Keyword Scoring</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm ${
            isLight ? "bg-white/80 border-slate-200 text-slate-700" : "bg-slate-900/60 border-slate-800 text-slate-300"
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero Password / Token Required</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SAAS CONSOLE (THE DASHBOARD CARD)                                 */}
      {/* ========================================================================= */}
      <div
        className={`max-w-4xl mx-auto rounded-3xl overflow-hidden border shadow-2xl transition-all duration-300 ${
          isLight
            ? "bg-white text-slate-900 border-slate-200 shadow-slate-300/60"
            : "bg-slate-950 text-slate-100 border-slate-800 shadow-black/90"
        }`}
      >
        {/* Top Accent Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-indigo-500 to-pink-500" />

        {/* Dashboard Console Header Bar */}
        <div
          className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 text-white shadow-md shadow-indigo-500/20">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm tracking-tight">
                  PROFILE &amp; TARGET SPECIFICATION CONSOLE
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                  READY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Provide public GitHub profile and destination company to run full career tailoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. Runtime: ~5s</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 1: GitHub Username / Profile URL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-indigo-500" />
                  <span>GitHub Username or Profile URL</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">public handle</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g. PRUDHVI0143 or torvalds"
                  className={`w-full rounded-2xl px-4 py-3.5 text-sm font-medium border transition-all focus:outline-none ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 shadow-xs"
                      : "bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-500 focus:bg-slate-950 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  }`}
                  required
                />

                {cleanHandle && (
                  <div className="absolute right-3 top-2.5 flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-mono border backdrop-blur-sm shadow-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                    <img
                      src={`https://github.com/${cleanHandle}.png`}
                      alt="avatar"
                      className="w-4 h-4 rounded-full border border-indigo-400/40"
                      onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                    />
                    <span>@{cleanHandle}</span>
                  </div>
                )}
              </div>

              {/* Quick sample handles */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                <span>Try sample:</span>
                <button
                  type="button"
                  onClick={() => setGithubUsername("PRUDHVI0143")}
                  className="hover:underline text-indigo-500 font-mono font-semibold"
                >
                  PRUDHVI0143
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setGithubUsername("octocat")}
                  className="hover:underline text-indigo-500 font-mono font-semibold"
                >
                  octocat
                </button>
              </div>
            </div>

            {/* Field 2: Target Company */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-500" />
                  <span>Target Company</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">destination org</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Stripe, Razorpay, Amazon"
                  className={`w-full rounded-2xl px-4 py-3.5 text-sm font-medium border transition-all focus:outline-none ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 shadow-xs"
                      : "bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-500 focus:bg-slate-950 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  }`}
                  required
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                <span>Auto-maps interview rounds &amp; technical standards</span>
              </div>
            </div>
          </div>

          {/* Field 3: Target Role / Position with Clickable Quick Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-pink-500" />
                <span>Target Role / Position</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">engineering track</span>
            </div>

            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer / Backend Systems Engineer"
              className={`w-full rounded-2xl px-4 py-3.5 text-sm font-medium border transition-all focus:outline-none ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-pink-600 focus:ring-4 focus:ring-pink-500/10 shadow-xs"
                  : "bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-500 focus:bg-slate-950 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20"
              }`}
              required
            />

            {/* Quick Role Fill Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1">Popular:</span>
              {COMMON_ROLES.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setJobRole(role)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all font-medium ${
                    jobRole.toLowerCase() === role.toLowerCase()
                      ? "bg-pink-500/15 text-pink-500 border-pink-500/40 font-bold shadow-xs"
                      : isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Company Presets (Modern SaaS Micro-Cards) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Company Presets (1-Click Fill)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">benchmarked criteria</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_COMPANIES.map((preset) => {
                const isSelected = companyName.toLowerCase() === preset.name.toLowerCase();
                return (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-2 group ${
                      isSelected
                        ? isLight
                          ? "bg-indigo-50/80 border-indigo-500 shadow-md shadow-indigo-500/15"
                          : "bg-indigo-950/40 border-indigo-500 shadow-xl shadow-indigo-500/20"
                        : isLight
                        ? "bg-slate-50 hover:bg-slate-100/90 border-slate-200 hover:border-slate-300"
                        : "bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{preset.icon}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${preset.tagColor}`}>
                        {preset.tier}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm">{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500 animate-fadeIn" />}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {preset.role}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Job Description Accordion Drawer */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => setShowJdDrawer(!showJdDrawer)}
              className="flex items-center justify-between w-full py-1 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>TARGET JOB DESCRIPTION / SPECIFICATION (OPTIONAL)</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  +15% MATCH ACCURACY
                </span>
              </span>
              <span className="text-[11px] text-indigo-400 font-mono underline">
                {showJdDrawer ? "Hide Drawer ▲" : "Paste JD ▼"}
              </span>
            </button>

            {showJdDrawer && (
              <div className="animate-fadeIn space-y-1.5">
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste specific job description snippets, required cloud stacks (e.g. AWS, Kubernetes, Redis, Kafka), or seniority guidelines for pinpoint ATS tailoring..."
                  className={`w-full rounded-2xl p-4 text-xs leading-relaxed transition-all resize-none focus:outline-none border ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10"
                      : "bg-slate-900/90 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  }`}
                />
                <div className="flex justify-between text-[10px] text-slate-400 px-1 font-mono">
                  <span>Custom JD parsing extracts unwritten company requirements</span>
                  <span>{jobDescription.length} characters</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button & Step Pipeline Tracker */}
          {loading ? (
            <div
              className={`p-6 rounded-3xl border space-y-4 text-center animate-fadeIn ${
                isLight
                  ? "bg-indigo-50/70 border-indigo-200 text-slate-900 shadow-lg"
                  : "bg-slate-900 border-indigo-500/30 text-white shadow-2xl shadow-indigo-950/50"
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-500 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Analyzing GitHub Profile &amp; Company Telemetry...
                  </span>
                </div>
                <span className="text-xs font-mono font-extrabold text-indigo-400">
                  {progressPercent}% Complete
                </span>
              </div>

              {/* Active Pipeline Step */}
              <div className="py-2 space-y-2">
                <p className="text-sm font-bold animate-pulse text-indigo-600 dark:text-indigo-400">
                  {steps[currentStepIndex]}
                </p>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 via-indigo-500 to-pink-500 transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Mini Step Pills */}
              <div className="grid grid-cols-5 gap-1 pt-1">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx <= currentStepIndex
                        ? "bg-gradient-to-r from-teal-500 to-indigo-500"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.99] group ${
                isLight
                  ? "bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white shadow-indigo-600/25"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-indigo-600/30"
              }`}
            >
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
              <span>Analyze Compatibility &amp; Build Tailored CV Prep</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 3. THREE FEATURE METRIC CARDS (MODERN SAAS DASHBOARD CARDS)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Card 1: Fit Score */}
        <div
          className={`p-6 rounded-3xl border space-y-4 transition-all duration-300 hover:translate-y-[-2px] ${
            isLight
              ? "bg-white border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-indigo-300"
              : "bg-slate-950 border-slate-800 shadow-2xl shadow-black/80 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              ALGORITHMIC FIT v2.8
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-black tracking-tight">
              &ldquo;Is It Your Type?&rdquo; Fit Score
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates your GitHub public activity, primary programming languages, and repository depth against the target company&apos;s culture and engineering bar.
            </p>
          </div>

          <div className="pt-2 border-t border-inherit flex flex-wrap gap-1.5 text-[10px] font-mono">
            <span className={`px-2 py-0.5 rounded-md border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-900 text-slate-300 border-slate-800"}`}>
              ✓ Repo Depth Index
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-900 text-slate-300 border-slate-800"}`}>
              ✓ Language Diversity
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-900 text-slate-300 border-slate-800"}`}>
              ✓ Commit Velocity
            </span>
          </div>
        </div>

        {/* Card 2: Interview Rounds */}
        <div
          className={`p-6 rounded-3xl border space-y-4 transition-all duration-300 hover:translate-y-[-2px] ${
            isLight
              ? "bg-white border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-teal-300"
              : "bg-slate-950 border-slate-800 shadow-2xl shadow-black/80 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
              ROUND ROADMAP INTELLIGENCE
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-black tracking-tight">
              Company Interview Rounds
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detailed breakdown of expected interview rounds (OA, DSA, Low-Level Design, High-Level System Design, CV Deep-Dive, Behavioral) with tactical tips.
            </p>
          </div>

          <div className="pt-2 border-t border-inherit flex flex-wrap gap-1.5 text-[10px] font-mono">
            <span className={`px-2 py-0.5 rounded-md border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-900 text-slate-300 border-slate-800"}`}>
              ✓ 5-Stage Pipeline
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-900 text-slate-300 border-slate-800"}`}>
              ✓ System Design HLD
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-900 text-slate-300 border-slate-800"}`}>
              ✓ Behavioral STAR
            </span>
          </div>
        </div>

        {/* Card 3: Tailored CV Projects & Script */}
        <div
          className={`p-6 rounded-3xl border space-y-4 transition-all duration-300 hover:translate-y-[-2px] ${
            isLight
              ? "bg-white border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-pink-300"
              : "bg-slate-950 border-slate-800 shadow-2xl shadow-black/80 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
              <Code2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30">
              STAR RESUME SYNTHESIZER
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-black tracking-tight">
              Tailored CV Projects &amp; Script
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recommends exact portfolio projects customized for the company, ready-to-copy STAR resume bullet points with metrics, and step-by-step interview defense scripts.
            </p>
          </div>

          <div className="pt-2 border-t border-inherit flex flex-wrap gap-1.5 text-[10px] font-mono">
            <span className={`px-2 py-0.5 rounded-md border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-900 text-slate-300 border-slate-800"}`}>
              ✓ Architecture Specs
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-900 text-slate-300 border-slate-800"}`}>
              ✓ 1-Click CV Injection
            </span>
            <span className={`px-2 py-0.5 rounded-md border ${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-900 text-slate-300 border-slate-800"}`}>
              ✓ Defense Scripts
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RECENT ANALYSES (EXECUTIVE SAAS HISTORY)                              */}
      {/* ========================================================================= */}
      {recentAnalyses.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-inherit">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Recent Analysis Dossiers
              </h3>
            </div>
            <button
              onClick={() => router.push("/history")}
              className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Full History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recentAnalyses.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/career/${item.id}`)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 group ${
                  isLight
                    ? "bg-white border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-md"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700 shadow-lg"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm group-hover:text-indigo-500 transition-colors">
                      {item.company_name}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      {item.match_score}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {item.job_role}
                  </div>
                </div>

                <div className="pt-2 border-t border-inherit flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Github className="w-3 h-3" />
                    <span>@{item.github_username}</span>
                  </span>
                  <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                    Open →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
