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
import TechStackMatchCard from "@/components/TechStackMatchCard";
import ScoreExplanationCard from "@/components/ScoreExplanationCard";
import RealGithubReposSection from "@/components/RealGithubReposSection";
import RecommendedProjectsSection from "@/components/RecommendedProjectsSection";
import SkillMatrixTable from "@/components/SkillMatrixTable";
import InterviewRoundsSection from "@/components/InterviewRoundsSection";
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
  const [injectedBullets, setInjectedBullets] = useState<string[]>([]);
  const [injectedToast, setInjectedToast] = useState<string | null>(null);

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

  const handleInjectResumeBullet = (bullet: string) => {
    setInjectedBullets((prev) => [...prev, bullet]);
    setResumeContent((prev) => {
      const trimmed = prev.trim();
      const header = "## Technical Interview Defense & Key Architecture Proof Points";
      if (trimmed.includes(header)) {
        return trimmed.replace(header, `${header}\n- ${bullet}`);
      }
      return `${trimmed}\n\n${header}\n- ${bullet}\n`;
    });
    setInjectedToast("Appended technical proof point to your Live Resume!");
    setTimeout(() => setInjectedToast(null), 4500);
  };

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
        jobRole={jobRole}
        criticalGaps={result.ats_scanner?.critical_gap_keywords || []}
        actionRecommendation={result.ats_scanner?.action_recommendation}
        onInjectSkill={toggleSkillInResume}
      />

      {/* TECH STACK MATCH ANALYSIS (MODERN SAAS DASHBOARD) */}
      <TechStackMatchCard
        overlapSummary={overlapSummary}
        companyName={companyName}
        jobRole={jobRole}
      />

      {/* WHY YOU RECEIVED THIS SCORE EXPLANATION (MODERN SAAS DASHBOARD) */}
      <ScoreExplanationCard
        matchScore={matchScore}
        scoreExplanation={scoreExplanation}
        scoreBreakdown={scoreBreakdown}
        companyName={companyName}
        jobRole={jobRole}
      />


      {/* TAB 1: RECOMMENDED PROJECTS & PREPARATION */}
      {activeTab === "prep" && (
        <div className="space-y-10">
          {/* SECTION 1A: REAL CANDIDATE UPLOADED GITHUB PROJECTS (MODERN SAAS DASHBOARD) */}
          {realGithubProjects.length > 0 && (
            <RealGithubReposSection
              repos={realGithubProjects}
              username={github.username}
              companyName={companyName}
              addedProjects={addedProjects}
              onAddProject={addProjectToResume}
            />
          )}

          {/* SECTION 1B: RECOMMENDED GAP PROJECTS (MODERN SAAS DASHBOARD) */}
          <RecommendedProjectsSection
            projects={projects}
            companyName={companyName}
            jobRole={jobRole}
            addedProjects={addedProjects}
            onAddProject={addProjectToResume}
          />

          {/* SECTION 2: SKILL MATRIX & GAPS TO FILL (MODERN SAAS DASHBOARD) */}
          <SkillMatrixTable
            skills={skillMatrix}
            addedSkills={addedSkills}
            onToggleSkill={toggleSkillInResume}
            companyName={companyName}
            jobRole={jobRole}
          />

          {/* SECTION 3: COMPANY INTERVIEW ROUNDS ROADMAP (MODERN SAAS DASHBOARD) */}
          <InterviewRoundsSection
            rounds={rounds}
            companyName={companyName}
            jobRole={jobRole}
          />
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
                  ...(injectedBullets.length > 0
                    ? [
                        {
                          title: `Technical Interview Defense & Architecture Highlights (${companyName})`,
                          date: "Verified Defense",
                          bullets: injectedBullets
                        }
                      ]
                    : []),
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
        onInjectResumeBullet={handleInjectResumeBullet}
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

      {/* Live Resume Injection Toast Notification */}
      {injectedToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-950/50 border border-emerald-400/40 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            <span>{injectedToast}</span>
            <button
              onClick={() => {
                setActiveTab("resume");
                setInjectedToast(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] underline transition-colors"
            >
              View in Live CV →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
