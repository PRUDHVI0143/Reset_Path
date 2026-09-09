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
  Cpu
} from "lucide-react";
import { analyzeCareerProfile, fetchCareerHistory } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

const PRESET_COMPANIES = [
  { name: "Google", role: "Software Engineer", icon: "🌐", color: "from-blue-600 to-emerald-500" },
  { name: "Razorpay", role: "Backend Engineer", icon: "💳", color: "from-blue-600 to-indigo-600" },
  { name: "Stripe", role: "Full Stack Engineer", icon: "⚡", color: "from-purple-600 to-indigo-600" },
  { name: "Microsoft", role: "Systems Engineer", icon: "💻", color: "from-cyan-600 to-blue-600" },
  { name: "Amazon", role: "SDE-II (Cloud)", icon: "📦", color: "from-amber-500 to-orange-600" },
  { name: "OpenAI", role: "AI / ML Engineer", icon: "🤖", color: "from-emerald-500 to-teal-700" }
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
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchCareerHistory()
      .then((data) => setRecentAnalyses(data.slice(0, 5)))
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

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const data = await analyzeCareerProfile({
        github_username: githubUsername,
        company_name: companyName,
        job_role: jobRole,
        job_description: jobDescription
      });
      clearInterval(stepInterval);
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* Hero Header with subtle frosted glass backing */}
      <div
        className={`text-center space-y-4 py-8 px-6 max-w-4xl mx-auto rounded-3xl backdrop-blur-md transition-all ${
          isLight
            ? "bg-white/55 border border-emerald-400/40 shadow-xl shadow-emerald-950/5"
            : "bg-slate-950/50 border border-white/10 shadow-2xl shadow-black/50"
        }`}
      >
        <div
          className={`badge-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            isLight
              ? "bg-emerald-600/15 border border-emerald-600/35 text-emerald-950 shadow-sm"
              : "bg-pink-500/15 border border-pink-500/35 text-pink-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Reset Path • GitHub + Target Company Match &amp; CV AI</span>
        </div>

        <h1
          className={`hero-heading text-4xl md:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight transition-colors duration-500 ${
            isLight ? "text-emerald-950" : "text-white"
          }`}
        >
          Match your GitHub with any target company. <br />
          <span className="gradient-text">Get tailored CV projects &amp; interview defense scripts.</span>
        </h1>

        <p
          className={`hero-subtext text-base max-w-2xl mx-auto leading-relaxed transition-colors ${
            isLight ? "text-emerald-950 font-semibold" : "text-slate-200"
          }`}
        >
          Input your GitHub profile and target company. Reset Path analyzes your code mastery, 
          evaluates company fit ("Is It Your Type?"), details exact interview rounds, and builds customized CV projects with STAR bullet points.
        </p>
      </div>

      {/* Main Input Form */}
      <div
        className={`max-w-3xl mx-auto glass-panel p-8 rounded-3xl shadow-2xl space-y-6 ${
          isLight ? "border border-emerald-500/30" : "border border-indigo-500/30"
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GitHub Username / Profile */}
            <div className="space-y-2">
              <label
                className={`input-label flex items-center gap-2 ${
                  isLight ? "text-emerald-950" : "text-slate-300"
                }`}
              >
                <Github className={`w-4 h-4 ${isLight ? "text-emerald-600" : "text-purple-400"}`} />
                <span>GitHub Username / Profile URL</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g. prudhviraj or octocat"
                  className={`w-full border rounded-xl px-4 py-3 font-medium text-sm transition-all focus:outline-none ${
                    isLight
                      ? "bg-white/80 border-emerald-400/40 text-emerald-950 placeholder-emerald-800/40 focus:border-emerald-600 shadow-sm"
                      : "bg-slate-900/80 border-slate-700/60 text-white placeholder-slate-500 focus:border-pink-500 font-mono text-xs"
                  }`}
                  required
                />
                {githubUsername && (
                  <div
                    className={`absolute right-3 top-2.5 flex items-center gap-2 px-2 py-1 rounded text-[11px] font-mono border ${
                      isLight
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-slate-800 text-purple-300 border-slate-700"
                    }`}
                  >
                    <img
                      src={`https://github.com/${githubUsername.trim().split("/").pop()}.png`}
                      alt="avatar"
                      className="w-4 h-4 rounded-full"
                      onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                    />
                    <span>@{githubUsername.trim().split("/").pop()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Target Company Name */}
            <div className="space-y-2">
              <label
                className={`input-label flex items-center gap-2 ${
                  isLight ? "text-emerald-950" : "text-slate-300"
                }`}
              >
                <Building2 className={`w-4 h-4 ${isLight ? "text-teal-600" : "text-indigo-400"}`} />
                <span>Target Company</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Razorpay, Google, Stripe"
                className={`w-full border rounded-xl px-4 py-3 font-medium text-sm transition-all focus:outline-none ${
                  isLight
                    ? "bg-white/80 border-emerald-400/40 text-emerald-950 placeholder-emerald-800/40 focus:border-emerald-600 shadow-sm"
                    : "bg-slate-900/80 border-slate-700/60 text-white placeholder-slate-500 focus:border-pink-500"
                }`}
                required
              />
            </div>
          </div>

          {/* Job Role */}
          <div className="space-y-2">
            <label
              className={`input-label flex items-center gap-2 ${
                isLight ? "text-emerald-950" : "text-slate-300"
              }`}
            >
              <Briefcase className={`w-4 h-4 ${isLight ? "text-emerald-600" : "text-pink-400"}`} />
              <span>Target Role / Position</span>
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer / Backend Systems Engineer"
              className={`w-full border rounded-xl px-4 py-3 font-medium text-sm transition-all focus:outline-none ${
                isLight
                  ? "bg-white/80 border-emerald-400/40 text-emerald-950 placeholder-emerald-800/40 focus:border-emerald-600 shadow-sm"
                  : "bg-slate-900/80 border-slate-700/60 text-white placeholder-slate-500 focus:border-pink-500"
              }`}
              required
            />
          </div>

          {/* Preset Company Selector */}
          <div className="space-y-3 pt-2">
            <div
              className={`input-label ${
                isLight ? "text-emerald-900" : "text-slate-400"
              }`}
            >
              Quick Company Presets:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_COMPANIES.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                    companyName.toLowerCase() === preset.name.toLowerCase()
                      ? isLight
                        ? "bg-emerald-600/20 border-emerald-500/70 text-emerald-950 shadow-lg shadow-emerald-500/15"
                        : "bg-indigo-600/30 border-indigo-500/80 text-white shadow-lg shadow-indigo-500/20"
                      : isLight
                        ? "bg-white/70 border-emerald-300/40 text-emerald-900 hover:border-emerald-500/60 hover:bg-white/90"
                        : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{preset.icon}</span>
                  <div>
                    <div className="text-xs font-bold">{preset.name}</div>
                    <div className={`text-[10px] truncate ${isLight ? "text-emerald-700" : "text-slate-400"}`}>
                      {preset.role}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Job Description */}
          <div className="space-y-2">
            <label
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? "text-emerald-900" : "text-slate-400"
              }`}
            >
              Target Job Description / Key Requirements (Optional)
            </label>
            <textarea
              rows={2}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description snippets or tech requirements for pin-point tailoring..."
              className={`w-full rounded-xl p-3 text-xs transition-all resize-none focus:outline-none ${
                isLight
                  ? "bg-white/80 border border-emerald-300/40 text-emerald-950 placeholder-emerald-800/40 focus:border-emerald-600"
                  : "bg-slate-900/60 border border-slate-800 text-slate-200 placeholder-slate-600 focus:border-pink-500"
              }`}
            />
          </div>

          {/* Submit Button & Step Tracker */}
          {loading ? (
            <div
              className={`p-6 rounded-2xl border space-y-4 text-center ${
                isLight
                  ? "bg-emerald-50/80 border-emerald-500/40 text-emerald-950"
                  : "bg-indigo-950/40 border-indigo-500/30 text-white"
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl border animate-pulse ${
                  isLight
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-700"
                    : "bg-indigo-600/20 border-indigo-500/40 text-indigo-400"
                }`}
              >
                <Cpu className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold">Analyzing GitHub &amp; Company Intelligence...</div>
                <div
                  className={`text-xs font-mono animate-fade-in ${
                    isLight ? "text-emerald-700 font-semibold" : "text-pink-300"
                  }`}
                >
                  {steps[currentStepIndex]}
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center justify-center gap-1.5 pt-2">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx <= currentStepIndex
                        ? isLight
                          ? "w-8 bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "w-8 bg-gradient-to-r from-pink-500 to-indigo-500"
                        : isLight
                          ? "w-3 bg-emerald-200"
                          : "w-3 bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-xl ${
                isLight
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white shadow-emerald-600/25 hover:from-emerald-700 hover:to-green-700"
                  : "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-pink-600/20 hover:from-pink-700 hover:to-indigo-700"
              }`}
            >
              <Sparkles className="w-5 h-5 text-emerald-100" />
              <span>Analyze Compatibility &amp; Build Tailored CV Prep</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div
          className={`glass-card p-6 rounded-2xl border space-y-3 ${
            isLight ? "border-emerald-500/25" : "border-indigo-500/20"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isLight
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700"
                : "bg-pink-500/20 border-pink-500/40 text-pink-300"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className={`text-lg font-bold ${isLight ? "text-emerald-950" : "text-white"}`}>
            "Is It Your Type?" Fit Score
          </h3>
          <p className={`text-xs leading-relaxed ${isLight ? "text-emerald-900/80 font-medium" : "text-slate-400"}`}>
            Evaluates your GitHub public activity, primary programming languages, and repository depth against the target company's culture and engineering bar.
          </p>
        </div>

        <div
          className={`glass-card p-6 rounded-2xl border space-y-3 ${
            isLight ? "border-emerald-500/25" : "border-indigo-500/20"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isLight
                ? "bg-teal-500/15 border-teal-500/30 text-teal-700"
                : "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <h3 className={`text-lg font-bold ${isLight ? "text-emerald-950" : "text-white"}`}>
            Company Interview Rounds
          </h3>
          <p className={`text-xs leading-relaxed ${isLight ? "text-emerald-900/80 font-medium" : "text-slate-400"}`}>
            Detailed breakdown of expected interview rounds (OA, DSA, Low-Level Design, High-Level System Design, CV Deep-Dive, Behavioral) with tactical tips.
          </p>
        </div>

        <div
          className={`glass-card p-6 rounded-2xl border space-y-3 ${
            isLight ? "border-emerald-500/25" : "border-indigo-500/20"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isLight
                ? "bg-green-500/15 border-green-500/30 text-green-700"
                : "bg-purple-500/20 border-purple-500/40 text-purple-300"
            }`}
          >
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className={`text-lg font-bold ${isLight ? "text-emerald-950" : "text-white"}`}>
            Tailored CV Projects &amp; Script
          </h3>
          <p className={`text-xs leading-relaxed ${isLight ? "text-emerald-900/80 font-medium" : "text-slate-400"}`}>
            Recommends exact portfolio projects customized for the company, ready-to-copy STAR resume bullet points with metrics, and step-by-step interview defense scripts.
          </p>
        </div>
      </div>

      {/* Recent Career Analyses */}
      {recentAnalyses.length > 0 && (
        <div className="space-y-4 pt-6">
          <h3
            className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? "text-emerald-900" : "text-slate-400"
            }`}
          >
            <Briefcase className={`w-4 h-4 ${isLight ? "text-emerald-600" : "text-pink-400"}`} />
            <span>Recent Career Analyses</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAnalyses.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/career/${item.id}`)}
                className={`glass-card p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                  isLight
                    ? "border-emerald-400/30 hover:border-emerald-500 shadow-sm hover:shadow-md"
                    : "border-slate-800 hover:border-pink-500/50"
                }`}
              >
                <div className="space-y-1">
                  <div
                    className={`text-sm font-bold transition-colors flex items-center gap-2 ${
                      isLight
                        ? "text-emerald-950 group-hover:text-emerald-700"
                        : "text-white group-hover:text-pink-300"
                    }`}
                  >
                    <span>{item.company_name}</span>
                    <span className={`text-xs font-normal ${isLight ? "text-emerald-700/70" : "text-slate-400"}`}>
                      — {item.job_role}
                    </span>
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${isLight ? "text-emerald-800/70" : "text-slate-500"}`}>
                    <Github className="w-3.5 h-3.5" />
                    <span>@{item.github_username}</span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    isLight
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-800"
                      : "bg-pink-500/10 border border-pink-500/30 text-pink-300"
                  }`}
                >
                  {item.match_score}% Match
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
