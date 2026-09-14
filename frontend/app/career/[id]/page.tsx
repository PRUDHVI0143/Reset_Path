"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Github,
  Building2,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  Layers,
  Code2,
  FileText,
  MessageSquare,
  Plus,
  Eye,
  Edit3,
  HelpCircle,
  TrendingUp,
  Rocket,
  Share2,
  Printer,
  Mic
} from "lucide-react";
import dynamic from "next/dynamic";
import { fetchCareerAnalysisById, exportCareerGuide } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";
import AtsScannerCard from "@/components/AtsScannerCard";
import ShareReportModal from "@/components/ShareReportModal";
import ClassicAtsResume from "@/components/ClassicAtsResume";

const SkillRadarChart = dynamic(() => import("@/components/SkillRadarChart"), {
  ssr: false,
  loading: () => <div className="h-72 rounded-3xl animate-pulse bg-slate-800/30 flex items-center justify-center text-xs text-slate-400">Loading skill benchmark radar...</div>
});

const InterviewSimulatorModal = dynamic(() => import("@/components/InterviewSimulatorModal"), {
  ssr: false
});

export default function CareerAnalysisDetailPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"prep" | "resume">("prep");
  const [resumeViewMode, setResumeViewMode] = useState<"classic" | "markdown">("classic");
  const [copiedBullet, setCopiedBullet] = useState<string | null>(null);
  const [openRoundIndex, setOpenRoundIndex] = useState<number | null>(0);
  const [exporting, setExporting] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Live Resume Studio state
  const [resumeContent, setResumeContent] = useState<string>("");
  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const [addedProjects, setAddedProjects] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchCareerAnalysisById(id)
      .then((res) => {
        setData(res);
        if (res.result?.rebuilt_resume_markdown) {
          setResumeContent(res.result.rebuilt_resume_markdown);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(text);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  const handleExport = async () => {
    if (!data) return;
    try {
      setExporting(true);
      await exportCareerGuide(id, data.company_name);
    } catch (err: any) {
      alert(err.message || "Failed to export guide");
    } finally {
      setExporting(false);
    }
  };

  const addProjectToResume = (projectTitle: string, bullets: string[]) => {
    if (addedProjects.includes(projectTitle)) return;
    setAddedProjects([...addedProjects, projectTitle]);
    const projectBlock = `\n\n### ${projectTitle}\n- ${bullets.join("\n- ")}`;
    setResumeContent((prev) => `${prev}${projectBlock}`);
    setActiveTab("resume");
  };

  const toggleSkillInResume = (skillName: string) => {
    if (addedSkills.includes(skillName)) {
      setAddedSkills(addedSkills.filter((s) => s !== skillName));
    } else {
      setAddedSkills([...addedSkills, skillName]);
      setResumeContent((prev) => `${prev}\n- Added Skill: ${skillName}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 text-pink-400 mx-auto flex items-center justify-center animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="text-base font-bold text-white">Generating Resume Tailoring & Project Suggestions...</div>
      </div>
    );
  }

  if (!data || !data.result) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <div className="text-xl font-bold text-red-400">Analysis Not Found</div>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700"
        >
          Return to CV Rebuilder
        </button>
      </div>
    );
  }

  const result = data.result;
  const github = result.github_profile || {};
  const companyName = data.company_name || result.company_intel?.company_name || "Target Company";
  const jobRole = data.job_role || result.company_intel?.job_role || "Full Stack Engineer";
  const matchScore = result.match_score || 75;
  const skillMatrix = result.skill_matrix || [];
  const rounds = result.interview_rounds || [];

  // Guaranteed Project Suggestions (Never empty)
  const projects = (result.project_recommendations && result.project_recommendations.length > 0)
    ? result.project_recommendations
    : [
        {
          project_title: `High-Throughput Distributed Microservice for ${companyName}`,
          domain_tag: "Backend & System Design",
          difficulty: "Advanced",
          tech_stack: ["Python / Go", "FastAPI", "Redis Caching", "PostgreSQL", "Docker"],
          architecture_overview: `A high-performance REST API handling 10,000+ QPS with Redis caching, PostgreSQL pooling, and Docker deployment tailored for ${companyName}.`,
          cv_star_bullets: [
            `Architected a scalable backend service handling 10K+ QPS with sub-50ms p99 latency using FastAPI, Redis caching, and PostgreSQL pooling for ${companyName}.`,
            "Implemented asynchronous event processing with Redis pub/sub, reducing database write bottlenecks by 45%.",
            "Designed secure REST endpoints with JWT auth, rate limiting (100 req/min), and automated CI/CD containerization via GitHub Actions."
          ],
          interview_explanation_script: {
            elevator_pitch: `I built this project to solve real-world high-concurrency challenges similar to those at ${companyName}. It decouples API ingest from heavy processing using Redis queues.`,
            key_technical_tradeoff: "I chose Redis read-through caching instead of write-through caching to prioritize low read latencies while keeping database sync async.",
            quantified_result: "Maintained 99.9% uptime under 12,000 concurrent virtual users in load testing with Locust."
          }
        },
        {
          project_title: `Real-Time Analytics & Rate Limiting Engine for ${companyName}`,
          domain_tag: "API & Infrastructure",
          difficulty: "Intermediate",
          tech_stack: ["TypeScript / Node.js", "Redis Sliding Window", "WebSockets", "Docker"],
          architecture_overview: "A low-latency API gateway middleware that enforces distributed sliding-window rate limiting and streams live usage telemetry via WebSockets.",
          cv_star_bullets: [
            "Engineered a distributed sliding-window rate limiter in Node.js & Redis capable of evaluating 15K req/sec with <2ms overhead.",
            "Built real-time telemetry dashboards using WebSockets, reducing API abuse attempts by 80%.",
            "Containerized application with multi-stage Docker builds, reducing image footprint by 60%."
          ],
          interview_explanation_script: {
            elevator_pitch: `This project implements distributed rate limiting to protect microservices at ${companyName} from DDoS spikes using Redis Lua scripts.`,
            key_technical_tradeoff: "Used Redis Lua scripts for atomic sliding window evaluation without acquiring heavy database locks.",
            quantified_result: "Processed 15,000 requests per second with under 2 milliseconds latency overhead."
          }
        },
        {
          project_title: `Autonomous Multi-Agent AI Workflow Engine for ${companyName}`,
          domain_tag: "AI Engineering & Automation",
          difficulty: "Advanced",
          tech_stack: ["LangGraph", "Python", "FastAPI", "Vector DB", "Next.js"],
          architecture_overview: "Autonomous multi-agent pipeline that breaks complex tasks into sub-graph execution, verifies data, and streams real-time status updates.",
          cv_star_bullets: [
            "Developed a multi-agent AI pipeline using LangGraph and FastAPI to execute automated research and data extraction across live web sources.",
            "Integrated vector similarity search with pgvector for low-latency RAG retrieval, achieving 92%+ answer grounding accuracy.",
            "Built a responsive Next.js frontend with WebSocket status streaming, cutting perceived user wait time by 60%."
          ],
          interview_explanation_script: {
            elevator_pitch: "This is an autonomous multi-agent platform where specialized AI agents collaborate via stateful graphs to perform complex automated tasks.",
            key_technical_tradeoff: "Used LangGraph stateful state graphs rather than simple linear chains to allow dynamic loopbacks when confidence scores fell below 80%.",
            quantified_result: "Cut task processing time to 6.4 seconds while maintaining strict compliance with token budgets."
          }
        }
      ];

  const scoreExplanation = result.score_explanation || `Your GitHub profile shows active coding experience. Your current score of ${matchScore}% reflects your language match and public repositories. Adding the 3 tailored projects below to your resume will boost your match to 100% for ${companyName}.`;

  const scoreBreakdown = result.score_breakdown || [
    { category: "Programming Languages Match", score_impact: "+40 Points", reason: `Your GitHub repositories use ${github.primary_languages?.join(', ') || 'Python/TypeScript'}, matching ${companyName}'s core stack.` },
    { category: "Public GitHub Repositories", score_impact: "+28 Points", reason: `You have ${github.public_repos || 5}+ public repos showing hands-on coding experience.` },
    { category: "System Design & Architecture Projects", score_impact: "+15 Points", reason: "Needs explicit high-concurrency microservices project on CV." },
    { category: "Company Domain Alignment", score_impact: "+10 Points", reason: `Add the 3 recommended projects below to your CV to complete 100% preparation for ${companyName}.` }
  ];

  const overlapSummary = result.tech_overlap_summary || {
    company_type: "Target Company Tech Stack",
    display_required_tech: ["Java / Python", "Spring / FastAPI", "SQL / Databases", "Microservices", "Docker / Cloud"],
    matched_tech: github.primary_languages?.slice(0, 2) || [],
    missing_tech: ["Enterprise Microservices", "Spring Boot / Systems", "Docker / Cloud Deployments"]
  };

  const realGithubProjects = result.real_github_projects || [];



  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => router.push("/")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card text-xs font-semibold transition-all ${
            isLight
              ? "text-emerald-950 hover:text-emerald-700 border-emerald-400/30 hover:border-emerald-500 shadow-sm"
              : "text-slate-300 hover:text-white hover:border-pink-500/40"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CV Builder</span>
        </button>

        {/* View Mode Tabs */}
        <div
          className={`flex items-center p-1 rounded-2xl border ${
            isLight
              ? "bg-white/80 border-emerald-400/30 shadow-sm"
              : "bg-slate-900 border-slate-800"
          }`}
        >
          <button
            onClick={() => setActiveTab("prep")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "prep"
                ? isLight
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20"
                  : "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/20"
                : isLight
                  ? "text-emerald-800 hover:text-emerald-950"
                  : "text-slate-400 hover:text-white"
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>Recommended Projects &amp; Prep</span>
          </button>
          <button
            onClick={() => setActiveTab("resume")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "resume"
                ? isLight
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20"
                  : "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/20"
                : isLight
                  ? "text-emerald-800 hover:text-emerald-950"
                  : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Live Rebuilt Resume Studio</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsInterviewModalOpen(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-[1.02] ${
              isLight
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-emerald-700/20"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-pink-500/25"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>AI Mock Interview</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-white/20 tracking-wider">
              Speech
            </span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isLight
                ? "bg-white text-emerald-950 border-emerald-300 hover:bg-emerald-50"
                : "bg-slate-900 text-purple-200 border-purple-600/50 hover:bg-slate-800"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("resume");
              setTimeout(() => window.print(), 350);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isLight
                ? "bg-white text-emerald-950 border-emerald-300 hover:bg-emerald-50"
                : "bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800"
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF Resume</span>
          </button>

          <button
            onClick={handleExport}
            disabled={exporting}
            className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md disabled:opacity-50 ${
              isLight
                ? "bg-emerald-700 hover:bg-emerald-800"
                : "bg-slate-800 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? "..." : "Guide (.MD)"}</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Header */}
      <div
        className={`glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden space-y-6 ${
          isLight ? "border border-emerald-500/30" : "border border-pink-500/30"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                  isLight
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-slate-900 border-slate-700 text-purple-300"
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                <span>@{github.username}</span>
              </span>
              <span className={`font-bold ${isLight ? "text-emerald-600" : "text-slate-500"}`}>→</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                  isLight
                    ? "bg-teal-500/15 border-teal-500/30 text-teal-800"
                    : "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{companyName}</span>
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                  isLight
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-800"
                    : "bg-pink-500/20 border-pink-500/40 text-pink-300"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{jobRole}</span>
              </span>
            </div>

            <h1 className={`text-3xl font-extrabold ${isLight ? "text-emerald-950" : "text-white"}`}>
              Tailored CV Projects &amp; Interview Roadmap
            </h1>
            <p className={`text-xs ${isLight ? "text-emerald-900/80 font-medium" : "text-slate-400"}`}>
              Primary Skills:{" "}
              <span className={`font-semibold ${isLight ? "text-emerald-800" : "text-pink-300"}`}>
                {github.primary_languages?.join(", ")}
              </span>{" "}
              | GitHub Repositories:{" "}
              <span className={`font-semibold ${isLight ? "text-teal-800" : "text-indigo-300"}`}>
                {github.public_repos}
              </span>
            </p>
          </div>

          {/* Match Score Circle */}
          <div
            className={`shrink-0 flex items-center gap-4 p-4 rounded-2xl border shadow-xl ${
              isLight
                ? "bg-white/90 border-emerald-400/30"
                : "bg-slate-900/90 border-slate-700"
            }`}
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className={isLight ? "text-emerald-100" : "text-slate-800"}
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={isLight ? "text-emerald-600" : "text-pink-500"}
                  strokeDasharray={`${matchScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-lg font-black ${isLight ? "text-emerald-950" : "text-white"}`}>
                  {matchScore}%
                </span>
                <span
                  className={`text-[8px] font-bold uppercase ${
                    isLight ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  Match
                </span>
              </div>
            </div>

            <div className="space-y-0.5 max-w-[160px]">
              <div
                className={`text-xs font-extrabold ${
                  isLight ? "text-emerald-800" : "text-pink-300"
                }`}
              >
                {result.verdict_badge || "High Compatibility Match"}
              </div>
              <div
                className={`text-[10px] ${
                  isLight ? "text-emerald-700/80" : "text-slate-400"
                }`}
              >
                Target Role Alignment
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-AXIS RADAR CHART BENCHMARK */}
      {result.radar_data && (
        <SkillRadarChart
          data={result.radar_data}
          companyName={companyName}
        />
      )}

      {/* ATS RESUME KEYWORD SCANNER CARD */}
      <AtsScannerCard
        atsScore={result.ats_scanner?.ats_score || Math.min(95, Math.round(matchScore * 0.95))}
        matchedKeywords={result.ats_scanner?.matched_keywords || overlapSummary.matched_tech || []}
        missingKeywords={result.ats_scanner?.missing_keywords || overlapSummary.missing_tech || []}
        companyName={companyName}
        onInjectSkill={toggleSkillInResume}
      />

      {/* VISUAL TECH STACK OVERLAP COMPARISON CARD */}
      <div
        className={`glass-panel p-6 rounded-3xl space-y-6 shadow-2xl transition-all ${
          isLight
            ? "border border-emerald-400/40 bg-white/95 text-emerald-950"
            : "border border-indigo-500/30 bg-slate-900/80 text-white"
        }`}
      >
        <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 ${isLight ? "border-emerald-200/60" : "border-slate-800"}`}>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${isLight ? "text-emerald-700" : "text-pink-400"}`} />
            <div>
              <h3 className={`text-base font-extrabold ${isLight ? "text-emerald-950" : "text-white"}`}>
                Tech Stack Match Analysis
              </h3>
              <p className={`text-xs ${isLight ? "text-emerald-800 font-medium" : "text-slate-400"}`}>
                Your GitHub skills vs. {companyName}'s requirements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isLight
                  ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                  : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
              }`}
            >
              ✓ {overlapSummary.matched_tech?.length || 0} Matched
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isLight
                  ? "bg-red-50 text-red-900 border-red-200"
                  : "bg-red-500/20 border border-red-500/40 text-red-300"
              }`}
            >
              ✗ {overlapSummary.missing_tech?.length || 0} Gaps
            </span>
          </div>
        </div>

        {/* MUST-HAVE Skills Section */}
        <div className="space-y-3">
          <div className={`text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 ${isLight ? "text-emerald-950" : "text-white"}`}>
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            Must-Have Critical Skills for {companyName}
          </div>
          <div className="flex flex-wrap gap-2">
            {(overlapSummary.must_have_tech || overlapSummary.display_required_tech || []).map((tech: string, idx: number) => {
              const isMatched = (overlapSummary.critical_matched || overlapSummary.matched_tech || []).includes(tech);
              return (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono flex items-center gap-1.5 border ${
                    isMatched
                      ? isLight
                        ? "bg-emerald-100 text-emerald-950 border-emerald-300 shadow-sm"
                        : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : isLight
                        ? "bg-red-50 text-red-900 border-red-200"
                        : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  {isMatched ? "✓" : "✗"} {tech}
                </span>
              );
            })}
          </div>
        </div>

        {/* NICE-TO-HAVE Skills Section */}
        {(overlapSummary.nice_to_have_tech || []).length > 0 && (
          <div className="space-y-3">
            <div className={`text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 ${isLight ? "text-emerald-900" : "text-slate-400"}`}>
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              Bonus / Nice-to-Have Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {(overlapSummary.nice_to_have_tech || []).map((tech: string, idx: number) => {
                const isBonusMatched = (overlapSummary.bonus_matched || []).includes(tech);
                return (
                  <span
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono flex items-center gap-1.5 border ${
                      isBonusMatched
                        ? isLight
                          ? "bg-teal-100 text-teal-950 border-teal-300 font-bold"
                          : "bg-blue-500/20 border-blue-500/40 text-blue-300 font-bold"
                        : isLight
                          ? "bg-slate-100 text-slate-700 border-slate-200"
                          : "bg-slate-800/80 border-slate-700 text-slate-400"
                    }`}
                  >
                    {isBonusMatched ? "✓" : "○"} {tech}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Legend */}
        <div className={`flex flex-wrap gap-4 pt-2 border-t text-[10px] ${isLight ? "border-emerald-200/60 text-emerald-800 font-medium" : "border-slate-800 text-slate-500"}`}>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block"></span>You have this skill</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block"></span>Critical gap — add a project using this</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-teal-500 inline-block"></span>Bonus skill — you have it!</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-400 inline-block"></span>Bonus skill — not required but helps</span>
        </div>
      </div>

      {/* WHY YOU RECEIVED THIS SCORE EXPLANATION CARD */}
      <div
        className={`glass-panel p-6 rounded-2xl border space-y-4 transition-all ${
          isLight
            ? "border-emerald-400/40 bg-emerald-50/75 text-emerald-950 shadow-md"
            : "border-indigo-500/30 bg-indigo-950/20 text-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <HelpCircle className={`w-5 h-5 shrink-0 ${isLight ? "text-emerald-700" : "text-indigo-400"}`} />
          <h3 className={`text-base font-bold ${isLight ? "text-emerald-950" : "text-white"}`}>
            Why did you receive a {matchScore}% Match Score?
          </h3>
        </div>

        <p className={`text-xs leading-relaxed font-semibold ${isLight ? "text-emerald-900" : "text-slate-300"}`}>
          {scoreExplanation}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {scoreBreakdown.map((item: any, idx: number) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border space-y-1 text-xs transition-all ${
                isLight
                  ? "bg-white border-emerald-200/90 shadow-sm"
                  : "bg-slate-900/80 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className={isLight ? "text-emerald-950" : "text-white"}>{item.category}</span>
                <span className={`font-mono ${item.score_impact?.toString().startsWith('−') || item.score_impact?.toString().startsWith('-') ? 'text-red-500' : 'text-emerald-600 font-bold'}`}>{item.score_impact}</span>
              </div>
              <p className={`text-[11px] leading-tight ${isLight ? "text-emerald-800/90 font-medium" : "text-slate-400"}`}>{item.reason}</p>
            </div>
          ))}
        </div>
      </div>


      {/* TAB 1: RECOMMENDED PROJECTS & PREPARATION */}
      {activeTab === "prep" && (
        <div className="space-y-10">
          {/* SECTION 1A: REAL CANDIDATE UPLOADED GITHUB PROJECTS */}
          {realGithubProjects.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Github className="w-6 h-6 text-purple-400" />
                  <div>
                    <h2 className="text-2xl font-black text-white">📦 Your Real Uploaded GitHub Repositories</h2>
                    <p className="text-xs text-slate-400">
                      Matched from your public GitHub profile (@{github.username}) and formatted for {companyName}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-full">
                  {realGithubProjects.length} Repositories Found
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {realGithubProjects.map((repo: any, idx: number) => {
                  const isAdded = addedProjects.includes(repo.repo_name);
                  return (
                    <div
                      key={idx}
                      className={`glass-panel p-6 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden transition-all ${
                        isLight
                          ? "border border-emerald-400/40 bg-white/95 text-emerald-950"
                          : "border border-purple-500/40 bg-slate-900/80 text-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                                isLight
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              }`}
                            >
                              {repo.language}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${
                                isLight
                                  ? "bg-amber-100/90 text-amber-950 border-amber-300"
                                  : "bg-slate-800 text-slate-300 border-slate-700"
                              }`}
                            >
                              ⭐ {repo.stars} Stars
                            </span>
                          </div>
                          <a
                            href={repo.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xl font-black transition-colors flex items-center gap-2 group ${
                              isLight
                                ? "text-emerald-950 hover:text-emerald-700"
                                : "text-white hover:text-purple-300"
                            }`}
                          >
                            <span>{repo.repo_name}</span>
                            <span className={`text-xs group-hover:translate-x-0.5 transition-transform ${isLight ? "text-emerald-600" : "text-slate-500"}`}>↗</span>
                          </a>
                          <p className={`text-xs ${isLight ? "text-emerald-900 font-medium" : "text-slate-400"}`}>
                            {repo.description}
                          </p>
                        </div>

                        <button
                          onClick={() => addProjectToResume(repo.repo_name, repo.cv_star_bullets)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shrink-0 ${
                            isAdded
                              ? isLight
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-400"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : isLight
                                ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20 border border-emerald-600"
                                : "bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/50 shadow-purple-600/20"
                          }`}
                        >
                          {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          <span>{isAdded ? "Added to Live Resume" : "+ Add My GitHub Repo to CV"}</span>
                        </button>
                      </div>

                      {/* STAR Resume Bullets for Real Repo */}
                      <div className="space-y-2 text-xs">
                        <div className={`font-bold flex items-center justify-between ${isLight ? "text-emerald-950" : "text-white"}`}>
                          <span className="flex items-center gap-1.5">
                            <Award className={`w-4 h-4 ${isLight ? "text-emerald-700" : "text-purple-400"}`} />
                            <span>STAR Resume Bullets Generated for this Uploaded Repo</span>
                          </span>
                          <span className={`text-[10px] font-normal ${isLight ? "text-emerald-800 font-semibold" : "text-slate-500"}`}>
                            Click icon to copy
                          </span>
                        </div>

                        <div className="space-y-2">
                          {repo.cv_star_bullets?.map((bullet: string, bIdx: number) => (
                            <div
                              key={bIdx}
                              className={`p-3.5 rounded-xl flex items-start justify-between gap-3 border transition-all ${
                                isLight
                                  ? "bg-emerald-50/90 border-emerald-200/90 shadow-sm"
                                  : "bg-slate-950/70 border-slate-800"
                              }`}
                            >
                              <div className={`leading-relaxed font-semibold ${isLight ? "text-emerald-950" : "text-slate-200 font-medium"}`}>
                                • {bullet}
                              </div>
                              <button
                                onClick={() => handleCopy(bullet)}
                                className={`p-2 rounded-lg transition-all shrink-0 border ${
                                  isLight
                                    ? "bg-white hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 border-emerald-300 shadow-sm"
                                    : "bg-slate-800 hover:bg-purple-600/30 text-slate-400 hover:text-purple-300 border-slate-700"
                                }`}
                                title="Copy bullet point"
                              >
                                {copiedBullet === bullet ? (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 1B: PROMINENT RECOMMENDED GAP PROJECTS TO ADD TO CV */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Rocket className="w-6 h-6 text-pink-400" />
                <div>
                  <h2 className={`text-2xl font-black ${isLight ? "text-emerald-950" : "text-white"}`}>
                    🚀 Recommended Gap-Filling Projects to Add
                  </h2>
                  <p className={`text-xs ${isLight ? "text-emerald-900 font-medium" : "text-slate-400"}`}>
                    Add these tailored projects to fill your tech stack gaps specifically for {companyName}
                  </p>
                </div>
              </div>

              <div
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  isLight
                    ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                    : "text-pink-300 bg-pink-500/10 border-pink-500/30"
                }`}
              >
                Click "+ Add Project to My Resume" on any project below
              </div>
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 gap-6">
              {projects.map((proj: any, idx: number) => {
                const isAdded = addedProjects.includes(proj.project_title);
                return (
                  <div
                    key={idx}
                    className={`glass-panel p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden transition-all ${
                      isLight
                        ? "border border-emerald-500/35 bg-white/95 text-emerald-950"
                        : "border border-pink-500/30 bg-slate-900/60 text-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              isLight
                                ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                                : "bg-pink-500/20 border-pink-500/40 text-pink-300"
                            }`}
                          >
                            {proj.domain_tag}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${
                              isLight
                                ? "bg-slate-100 text-slate-800 border-slate-300"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            Difficulty: {proj.difficulty}
                          </span>
                        </div>
                        <h3 className={`text-xl font-black ${isLight ? "text-emerald-950" : "text-white"}`}>
                          {proj.project_title}
                        </h3>
                        <p className={`text-xs font-semibold ${isLight ? "text-teal-900" : "text-indigo-300 font-medium"}`}>
                          🎯 {proj.target_company_relevance}
                        </p>
                      </div>

                      {/* Add to Resume Action Button */}
                      <button
                        onClick={() => addProjectToResume(proj.project_title, proj.cv_star_bullets)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shrink-0 ${
                          isAdded
                            ? isLight
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-400"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : isLight
                              ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white shadow-emerald-600/20 hover:opacity-95"
                              : "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-pink-600/30"
                        }`}
                      >
                        {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{isAdded ? "Added to Live Resume" : "+ Add Project to My Resume"}</span>
                      </button>
                    </div>

                    {/* Tech Stack Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className={`text-xs font-bold mr-2 self-center ${isLight ? "text-emerald-900" : "text-slate-400"}`}>
                        Tech Stack:
                      </span>
                      {proj.tech_stack?.map((tech: string, tIdx: number) => (
                        <span
                          key={tIdx}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${
                            isLight
                              ? "bg-emerald-50 text-emerald-950 border-emerald-300 shadow-sm"
                              : "bg-slate-950 border-slate-700 text-pink-300"
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Target Architecture */}
                    <div
                      className={`p-4 rounded-xl border space-y-1.5 text-xs ${
                        isLight
                          ? "bg-emerald-50/75 border-emerald-200/90 text-emerald-950"
                          : "bg-slate-950/80 border-slate-800 text-slate-300"
                      }`}
                    >
                      <div className={`font-bold flex items-center gap-1.5 ${isLight ? "text-emerald-950" : "text-slate-300"}`}>
                        <FileText className={`w-4 h-4 ${isLight ? "text-teal-700" : "text-indigo-400"}`} />
                        <span>Architecture Overview</span>
                      </div>
                      <p className={`leading-relaxed ${isLight ? "text-emerald-900/90 font-medium" : "text-slate-400"}`}>
                        {proj.architecture_overview}
                      </p>
                    </div>

                    {/* Copyable STAR Resume Bullet Points */}
                    <div className="space-y-3 text-xs">
                      <div className={`font-bold flex items-center justify-between ${isLight ? "text-emerald-950" : "text-white"}`}>
                        <span className="flex items-center gap-1.5">
                          <Award className={`w-4 h-4 ${isLight ? "text-emerald-700" : "text-pink-400"}`} />
                          <span>STAR Resume Bullet Points (Ready to Copy to Resume)</span>
                        </span>
                        <span className={`text-[10px] font-normal ${isLight ? "text-emerald-800 font-semibold" : "text-slate-400"}`}>
                          Click icon to copy
                        </span>
                      </div>

                      <div className="space-y-2">
                        {proj.cv_star_bullets?.map((bullet: string, bIdx: number) => (
                          <div
                            key={bIdx}
                            className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 group ${
                              isLight
                                ? "bg-white border-emerald-200/90 shadow-sm hover:border-emerald-400"
                                : "bg-slate-950/60 border-slate-800 hover:border-pink-500/40"
                            }`}
                          >
                            <div className={`leading-relaxed font-semibold ${isLight ? "text-emerald-950" : "text-slate-200 font-medium"}`}>
                              • {bullet}
                            </div>
                            <button
                              onClick={() => handleCopy(bullet)}
                              className={`p-2 rounded-lg transition-all shrink-0 border ${
                                isLight
                                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 border-emerald-300 shadow-sm"
                                  : "bg-slate-800 hover:bg-pink-600/30 text-slate-400 hover:text-pink-300 border-slate-700"
                              }`}
                              title="Copy bullet point"
                            >
                              {copiedBullet === bullet ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interview Defense Script */}
                    <div
                      className={`p-5 rounded-2xl border space-y-3 text-xs ${
                        isLight
                          ? "bg-teal-50/80 border-teal-300/70 text-emerald-950 shadow-sm"
                          : "bg-indigo-950/30 border-indigo-500/30 text-slate-300"
                      }`}
                    >
                      <div className={`font-extrabold flex items-center gap-2 text-sm ${isLight ? "text-teal-950" : "text-indigo-300"}`}>
                        <MessageSquare className={`w-4 h-4 ${isLight ? "text-teal-700" : "text-indigo-400"}`} />
                        <span>How to Explain this Project in {companyName} Technical Interviews</span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className={`font-bold ${isLight ? "text-emerald-950" : "text-white"}`}>1. Elevator Pitch: </span>
                          <p className={`italic pt-0.5 ${isLight ? "text-emerald-900 font-medium" : "text-slate-400"}`}>
                            "{proj.interview_explanation_script?.elevator_pitch}"
                          </p>
                        </div>

                        <div>
                          <span className={`font-bold ${isLight ? "text-emerald-950" : "text-white"}`}>2. Key Technical Trade-off Made: </span>
                          <p className={`italic pt-0.5 ${isLight ? "text-emerald-900 font-medium" : "text-slate-400"}`}>
                            "{proj.interview_explanation_script?.key_technical_tradeoff}"
                          </p>
                        </div>

                        <div>
                          <span className={`font-bold ${isLight ? "text-emerald-950" : "text-white"}`}>3. Quantified Impact Metric: </span>
                          <p className={`italic pt-0.5 ${isLight ? "text-emerald-900 font-medium" : "text-slate-400"}`}>
                            "{proj.interview_explanation_script?.quantified_result}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: SKILL MATRIX & GAPS TO FILL */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className={`w-5 h-5 ${isLight ? "text-emerald-700" : "text-pink-400"}`} />
                <h2 className={`text-xl font-bold ${isLight ? "text-emerald-950" : "text-white"}`}>
                  Skill Matrix &amp; Suggested Additions
                </h2>
              </div>
              <span className={`text-xs ${isLight ? "text-emerald-800 font-semibold" : "text-slate-400"}`}>
                Click "+ Add" to append skill to live CV
              </span>
            </div>

            <div
              className={`glass-panel rounded-2xl overflow-hidden shadow-xl border ${
                isLight ? "border-emerald-300/80 bg-white/95 text-emerald-950" : "border-slate-800"
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead
                    className={`uppercase tracking-wider font-bold border-b ${
                      isLight
                        ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                        : "bg-slate-900/90 text-slate-400 border-slate-800"
                    }`}
                  >
                    <tr>
                      <th className="p-4">Skill / Technology</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Mastery Level</th>
                      <th className="p-4">Fit Status</th>
                      <th className="p-4">Company Relevance</th>
                      <th className="p-4 text-right">Add to Resume</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y font-medium ${
                      isLight
                        ? "divide-emerald-100 text-emerald-950"
                        : "divide-slate-800/60 text-slate-300"
                    }`}
                  >
                    {skillMatrix.map((item: any, idx: number) => {
                      const isAdded = addedSkills.includes(item.skill_name);
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isLight ? "hover:bg-emerald-50/70" : "hover:bg-slate-800/40"
                          }`}
                        >
                          <td className="p-4 font-bold flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isLight ? "bg-emerald-600" : "bg-pink-500"
                              }`}
                            />
                            <span className={isLight ? "text-emerald-950" : "text-white"}>
                              {item.skill_name}
                            </span>
                          </td>
                          <td className={`p-4 ${isLight ? "text-emerald-800 font-medium" : "text-slate-400"}`}>
                            {item.category}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                                item.mastery_level === "Advanced"
                                  ? isLight
                                    ? "bg-purple-100 text-purple-900 border-purple-300"
                                    : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                  : item.mastery_level === "Intermediate"
                                  ? isLight
                                    ? "bg-teal-100 text-teal-900 border-teal-300"
                                    : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                  : isLight
                                  ? "bg-amber-100 text-amber-950 border-amber-300"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {item.mastery_level}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                item.status === "Mastered"
                                  ? isLight
                                    ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                                    : "bg-emerald-500/20 text-emerald-300"
                                  : item.status === "Skill Gap to Fill"
                                  ? isLight
                                    ? "bg-red-50 text-red-900 border border-red-200"
                                    : "bg-red-500/20 text-red-300"
                                  : isLight
                                  ? "bg-amber-100 text-amber-950 border border-amber-300"
                                  : "bg-amber-500/20 text-amber-300"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className={`p-4 font-semibold ${isLight ? "text-emerald-950" : "text-slate-200"}`}>
                            {item.company_relevance}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => toggleSkillInResume(item.skill_name)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ml-auto transition-all border ${
                                isAdded
                                  ? isLight
                                    ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : isLight
                                  ? "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-600 shadow-sm"
                                  : "bg-pink-600/20 hover:bg-pink-600/40 text-pink-300 border border-pink-500/40"
                              }`}
                            >
                              {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                              <span>{isAdded ? "Added" : "+ Add"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION 3: COMPANY INTERVIEW ROUNDS ROADMAP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className={`w-5 h-5 ${isLight ? "text-teal-700" : "text-indigo-400"}`} />
              <h2 className={`text-xl font-bold ${isLight ? "text-emerald-950" : "text-white"}`}>
                {companyName} — Expected Interview Rounds Breakdown
              </h2>
            </div>

            <div className="space-y-3">
              {rounds.map((round: any, idx: number) => {
                const isOpen = openRoundIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`glass-panel rounded-2xl overflow-hidden transition-all border ${
                      isLight ? "border-emerald-300/80 bg-white/95 text-emerald-950 shadow-md" : "border-slate-800"
                    }`}
                  >
                    <button
                      onClick={() => setOpenRoundIndex(isOpen ? null : idx)}
                      className={`w-full p-5 text-left flex items-center justify-between transition-colors ${
                        isLight ? "hover:bg-emerald-50/70" : "hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 border ${
                            isLight
                              ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                              : "bg-pink-600/20 border-pink-500/40 text-pink-300"
                          }`}
                        >
                          R{round.round_number}
                        </div>
                        <div>
                          <div className={`text-base font-bold ${isLight ? "text-emerald-950" : "text-white"}`}>
                            {round.title}
                          </div>
                          <div className={`text-xs ${isLight ? "text-emerald-800 font-medium" : "text-slate-400"}`}>
                            Duration: {round.duration}
                          </div>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className={`w-5 h-5 ${isLight ? "text-emerald-700" : "text-slate-400"}`} />
                      ) : (
                        <ChevronDown className={`w-5 h-5 ${isLight ? "text-emerald-700" : "text-slate-400"}`} />
                      )}
                    </button>

                    {isOpen && (
                      <div
                        className={`p-5 pt-0 border-t space-y-4 text-xs ${
                          isLight ? "border-emerald-100" : "border-slate-800/60"
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div className="space-y-1">
                            <div
                              className={`font-bold uppercase tracking-wider text-[10px] ${
                                isLight ? "text-emerald-800" : "text-indigo-300"
                              }`}
                            >
                              Round Focus
                            </div>
                            <div className={isLight ? "text-emerald-950 font-medium" : "text-slate-300"}>
                              {round.focus}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div
                              className={`font-bold uppercase tracking-wider text-[10px] ${
                                isLight ? "text-teal-800" : "text-pink-300"
                              }`}
                            >
                              Key Technical Topics
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {round.key_topics?.map((topic: string, tIdx: number) => (
                                <span
                                  key={tIdx}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                    isLight
                                      ? "bg-emerald-50 text-emerald-950 border-emerald-200 font-bold"
                                      : "bg-slate-800 text-slate-300 border-slate-700"
                                  }`}
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-3.5 rounded-xl border flex items-start gap-2 ${
                            isLight
                              ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                              : "bg-slate-900 border-pink-500/20 text-slate-300"
                          }`}
                        >
                          <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? "text-emerald-700" : "text-pink-400"}`} />
                          <div>
                            <span className={`font-bold ${isLight ? "text-emerald-950" : "text-white"}`}>
                              Tactical Preparation Tip:{" "}
                            </span>
                            <span className={isLight ? "text-emerald-900 font-medium" : "text-slate-300"}>
                              {round.preparation_tips}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE REBUILT RESUME STUDIO */}
      {activeTab === "resume" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? "text-emerald-950" : "text-white"}`}>
                <Edit3 className={`w-5 h-5 ${isLight ? "text-emerald-700" : "text-pink-400"}`} />
                <span>Live Interactive Rebuilt Resume Studio</span>
              </h2>
              <p className={`text-xs ${isLight ? "text-emerald-800 font-medium" : "text-slate-400"}`}>
                Tailored specifically for {companyName} ({jobRole}). Edit directly or click "+ Add Project" to insert projects.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              {/* Template Switcher */}
              <div
                className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
                  isLight ? "bg-white border-emerald-300 shadow-sm" : "bg-slate-900 border-slate-700"
                }`}
              >
                <button
                  onClick={() => setResumeViewMode("classic")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    resumeViewMode === "classic"
                      ? "bg-[#1D4ED8] text-white shadow-sm"
                      : isLight
                      ? "text-slate-600 hover:text-emerald-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Classic ATS Template (Image Layout)
                </button>
                <button
                  onClick={() => setResumeViewMode("markdown")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    resumeViewMode === "markdown"
                      ? isLight
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-pink-600 text-white shadow-sm"
                      : isLight
                      ? "text-slate-600 hover:text-emerald-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Split Markdown Editor
                </button>
              </div>

              <button
                onClick={() => window.print()}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  isLight
                    ? "bg-white text-emerald-950 border border-emerald-300 hover:bg-emerald-50"
                    : "bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800"
                }`}
              >
                <Printer className="w-4 h-4 text-emerald-500" />
                <span>Print / Save as PDF (ATS Ready)</span>
              </button>

              <button
                onClick={handleExport}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  isLight
                    ? "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20"
                    : "bg-pink-600 hover:bg-pink-500 shadow-pink-600/20"
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Download (.MD)</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: CLASSIC ATS RESUME (EXACT MATCH FOR USER IMAGE TEMPLATE) */}
          {resumeViewMode === "classic" && (
            <div className="resume-print-container py-4">
              <ClassicAtsResume
                name={github.name || github.username}
                githubUsername={github.username}
                targetCompany={companyName}
                jobRole={jobRole}
                primaryLanguages={github.primary_languages || ["Python", "TypeScript"]}
                skills={{
                  languages: github.primary_languages?.join(", ") || "Python, C++, Java",
                  frameworks: "HTML, CSS, React.js, Next.js, Node.js, Tailwind CSS",
                  tools: "Git, GitHub Actions, Docker, Linux, SQLite, PostgreSQL, Data Structures & Algorithms",
                  backend: "Python, FastAPI, Node.js, REST APIs, Microservices",
                  softSkills: "Technical Leadership, Problem Solving, Clean Architecture, Adaptability"
                }}
                projects={[
                  ...(result.real_github_projects || []).map((p: any) => ({
                    title: p.repo_name,
                    githubUrl: p.repo_url,
                    date: "Nov 2025",
                    bullets: p.cv_star_bullets || [p.description]
                  })),
                  ...(result.project_recommendations || []).map((p: any) => ({
                    title: p.project_title,
                    date: "Tailored Project",
                    bullets: p.cv_star_bullets || []
                  }))
                ]}
              />
            </div>
          )}

          {/* VIEW 2: SPLIT MARKDOWN EDITOR */}
          {resumeViewMode === "markdown" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Live Editable Markdown Editor */}
              <div
                className={`glass-panel p-5 rounded-2xl space-y-3 border no-print ${
                  isLight ? "border-emerald-300/80 bg-white/95 text-emerald-950 shadow-lg" : "border-slate-800"
                }`}
              >
                <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-emerald-200/60" : "border-slate-800"}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-emerald-900" : "text-pink-300"}`}>
                    <Edit3 className="w-4 h-4" />
                    <span>Resume Content Editor</span>
                  </span>
                  <span className={`text-[10px] font-mono ${isLight ? "text-emerald-700" : "text-slate-500"}`}>
                    Markdown Format
                  </span>
                </div>

                <textarea
                  value={resumeContent}
                  onChange={(e) => setResumeContent(e.target.value)}
                  className={`w-full h-[600px] rounded-xl p-4 text-xs font-mono focus:outline-none leading-relaxed resize-none border ${
                    isLight
                      ? "bg-emerald-50/40 border-emerald-300 text-emerald-950 focus:border-emerald-600 shadow-inner"
                      : "bg-slate-950 border-slate-800 text-slate-200 focus:border-pink-500/60"
                  }`}
                />
              </div>

              {/* Right Column: Real-time Rendered CV Preview Card */}
              <div
                className={`glass-panel p-6 rounded-2xl space-y-4 border ${
                  isLight ? "border-emerald-300/80 bg-white/95 text-emerald-950 shadow-xl" : "border-slate-800 bg-slate-950/80"
                }`}
              >
                <div className={`flex items-center justify-between border-b pb-3 no-print ${isLight ? "border-emerald-200/60" : "border-slate-800"}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-teal-900" : "text-indigo-300"}`}>
                    <Eye className="w-4 h-4" />
                    <span>Live Rendered Resume Preview</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isLight
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {companyName} Optimized
                  </span>
                </div>

                <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-4 overflow-y-auto max-h-[580px] pr-2">
                  <div
                    className={`whitespace-pre-wrap font-sans ${
                      isLight ? "text-emerald-950 font-medium" : "text-slate-300"
                    }`}
                  >
                    {resumeContent}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Mock Technical Interview Defense Simulator Modal */}
      <InterviewSimulatorModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        questions={result.mock_interview_questions || []}
        companyName={companyName}
      />

      {/* Share Report Modal */}
      <ShareReportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        reportId={id}
        candidateName={github.name || github.username}
        companyName={companyName}
        matchScore={matchScore}
      />
    </div>
  );
}
