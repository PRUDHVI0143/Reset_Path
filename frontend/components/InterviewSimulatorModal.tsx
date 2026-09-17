"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Filter,
  Plus,
  Compass,
  FileCode,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import {
  InterviewQuestion,
  AnswerEvaluationResult,
  evaluateInterviewAnswer,
  generateComprehensiveQuestionBank
} from "@/lib/interview-engine";

interface InterviewSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: any[];
  companyName: string;
}

export default function InterviewSimulatorModal({
  isOpen,
  onClose,
  questions: initialQuestions,
  companyName
}: InterviewSimulatorModalProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  // Build full question pool merging initial questions with comprehensive bank
  const baseQuestions = useMemo<InterviewQuestion[]>(() => {
    const fallbackBank = generateComprehensiveQuestionBank(companyName, []);
    if (!initialQuestions || initialQuestions.length === 0) {
      return fallbackBank;
    }

    // Merge and ensure all questions have required fields
    const merged: InterviewQuestion[] = initialQuestions.map((q, idx) => ({
      id: q.id || `q_init_${idx}`,
      round: q.round || `Round ${idx + 1}`,
      category: q.category || (q.round?.includes("System Design")
        ? "System Design"
        : q.round?.includes("Coding") || q.round?.includes("Concurrency")
        ? "Coding & Concurrency"
        : q.round?.includes("Deep-Dive") || q.round?.includes("Project")
        ? "Project Defense"
        : q.round?.includes("Leadership")
        ? "Leadership & Culture"
        : "Behavioral & STAR"),
      difficulty: q.difficulty || "Senior",
      question: q.question,
      context: q.context || `Simulating interview requirements for ${companyName}`,
      expected_concepts: q.expected_concepts || ["architecture", "trade-off", "performance"],
      anti_patterns_to_watch: q.anti_patterns_to_watch || [],
      key_points_to_mention: q.key_points_to_mention || [
        "Clearly explain the context and baseline.",
        "Detail your technical trade-offs and alternatives.",
        "Highlight testing methodology and quantified metrics."
      ],
      model_answer: q.model_answer || "State problem clearly, detail trade-offs, and summarize quantitative impact.",
      follow_up_prompts: q.follow_up_prompts || [
        "What is the single biggest failure risk in this architecture?",
        "How would you monitor and measure this in production?"
      ]
    }));

    // Add any unique categories from fallback bank
    for (const fb of fallbackBank) {
      if (!merged.some((m) => m.question.toLowerCase() === fb.question.toLowerCase())) {
        merged.push(fb);
      }
    }

    return merged;
  }, [initialQuestions, companyName]);

  const [questionList, setQuestionList] = useState<InterviewQuestion[]>(baseQuestions);

  useEffect(() => {
    setQuestionList(baseQuestions);
  }, [baseQuestions]);

  // Filtering state
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");

  const filteredQuestions = useMemo(() => {
    return questionList.filter((q) => {
      const matchCat = selectedCategory === "ALL" || q.category === selectedCategory;
      const matchDiff = selectedDifficulty === "ALL" || q.difficulty === selectedDifficulty;
      return matchCat && matchDiff;
    });
  }, [questionList, selectedCategory, selectedDifficulty]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<"rewrite" | "model" | "star">("rewrite");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Custom question generation modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [customCategory, setCustomCategory] = useState<InterviewQuestion["category"]>("System Design");

  // Session scorecard
  const [sessionCompletedAnswers, setSessionCompletedAnswers] = useState<
    Array<{ questionId: string; question: string; score: number; verdictLabel: string }>
  >([]);
  const [showScorecard, setShowScorecard] = useState(false);

  const recognitionRef = useRef<any>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0] || questionList[0];

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = "en-US";

        recog.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setAnswer((prev) => `${prev} ${transcript}`.trim());
          }
        };

        recog.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setIsRecording(false);
        };

        recog.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, []);

  // Response Timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Cleanup TTS on close or question change
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex, isOpen]);

  if (!isOpen || !currentQ) return null;

  // Toggle audio speech synthesis (Text-to-Speech)
  const toggleSpeechReadout = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = `${currentQ.round}. ${currentQ.question}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechUtteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle mic voice recording (Speech-to-Text)
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. You can type your answer in the box below.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        if (!isTimerRunning) setIsTimerRunning(true);
      } catch (e) {
        console.error("Mic start error:", e);
      }
    }
  };

  // Evaluate candidate answer with semantic correctness engine
  const handleEvaluate = async () => {
    if (!answer.trim()) return;

    setIsEvaluating(true);
    setIsTimerRunning(false);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (isSpeaking && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Evaluate using our rich correctness engine
    try {
      // Simulate realistic AI thought processing latency (600ms)
      await new Promise((r) => setTimeout(r, 600));

      const result = evaluateInterviewAnswer(currentQ, answer, timerSeconds);
      setEvaluation(result);

      // Track into session scorecard
      setSessionCompletedAnswers((prev) => {
        const filtered = prev.filter((p) => p.questionId !== currentQ.id);
        return [
          ...filtered,
          {
            questionId: currentQ.id,
            question: currentQ.question,
            score: result.overallScore,
            verdictLabel: result.verdictLabel
          }
        ];
      });
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Retry allows candidate to revise their draft based on the feedback
  const handleRetry = () => {
    setEvaluation(null);
    setIsTimerRunning(true);
  };

  // Reset and navigate to next question
  const handleNext = () => {
    setEvaluation(null);
    setAnswer("");
    setTimerSeconds(0);
    setIsTimerRunning(false);
    if (isSpeaking && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length);
  };

  const handlePrev = () => {
    setEvaluation(null);
    setAnswer("");
    setTimerSeconds(0);
    setIsTimerRunning(false);
    if (isSpeaking && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setCurrentIndex((prev) => (prev === 0 ? filteredQuestions.length - 1 : prev - 1));
  };

  // Pivot to answer the interviewer's adaptive follow-up question
  const handleAnswerFollowUp = (followUpPrompt: string) => {
    const followUpQuestion: InterviewQuestion = {
      id: `followup_${Date.now()}`,
      round: `Follow-Up to ${currentQ.round}`,
      category: currentQ.category,
      difficulty: "Senior",
      question: followUpPrompt,
      context: `Interviewer drill-down following up on: "${currentQ.question}"`,
      expected_concepts: currentQ.expected_concepts,
      anti_patterns_to_watch: currentQ.anti_patterns_to_watch,
      key_points_to_mention: [
        "Directly answer the targeted failure condition or edge case.",
        "Demonstrate deep operational knowledge and resilience patterns.",
        "Explain mitigation trade-offs."
      ],
      model_answer: `In response to this follow-up, the key mitigation is introducing circuit breakers and fallback caches. If the primary service or cache cluster encounters a failover event, traffic sheds non-critical operations and serves cached stale data with explicit TTL warnings rather than cascading 500 errors to clients.`,
      follow_up_prompts: []
    };

    setQuestionList((prev) => [followUpQuestion, ...prev]);
    setSelectedCategory("ALL");
    setSelectedDifficulty("ALL");
    setCurrentIndex(0);
    setEvaluation(null);
    setAnswer("");
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  // Create a custom targeted interview question
  const handleCreateCustomQuestion = () => {
    if (!customTopic.trim()) return;

    const newQ: InterviewQuestion = {
      id: `custom_${Date.now()}`,
      round: `Custom Defense: ${customTopic}`,
      category: customCategory,
      difficulty: "Senior",
      question: `At ${companyName}, how would you architect and implement ${customTopic.trim()} to ensure production reliability, low latency, and zero regressions?`,
      context: `Candidate-requested custom interview defense on ${customTopic}`,
      expected_concepts: [customTopic.toLowerCase(), "scalability", "trade-off", "resilience", "testing"],
      anti_patterns_to_watch: ["ignoring error cases", "not mentioning monitoring"],
      key_points_to_mention: [
        `Define the architectural approach for ${customTopic.trim()}.`,
        "Identify the primary engineering trade-offs and alternatives.",
        "Explain your testing and production telemetry plan."
      ],
      model_answer: `When deploying ${customTopic.trim()} at ${companyName}, I establish clear architectural boundaries and comprehensive observability. The system prioritizes fault isolation, bounded retries, and automated integration benchmarks to maintain high availability under peak load.`,
      follow_up_prompts: [
        `What telemetry metrics would you watch first after rolling out ${customTopic.trim()}?`
      ]
    };

    setQuestionList((prev) => [newQ, ...prev]);
    setSelectedCategory("ALL");
    setCurrentIndex(0);
    setEvaluation(null);
    setAnswer("");
    setShowCustomModal(false);
    setCustomTopic("");
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Average session score
  const sessionAvgScore = sessionCompletedAnswers.length > 0
    ? Math.round(
        sessionCompletedAnswers.reduce((acc, curr) => acc + curr.score, 0) /
          sessionCompletedAnswers.length
      )
    : 0;

  const categories = [
    "ALL",
    "System Design",
    "Coding & Concurrency",
    "Project Defense",
    "Behavioral & STAR",
    "Leadership & Culture"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border transition-all ${
          isLight
            ? "bg-white text-emerald-950 border-emerald-300 shadow-emerald-950/20"
            : "bg-slate-950 text-white border-pink-500/30 shadow-black/90"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? "bg-emerald-50/70 border-emerald-200" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                isLight
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                  : "bg-gradient-to-br from-pink-500 to-indigo-600 text-white shadow-pink-500/20"
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black tracking-tight">
                  AI Technical Interview Defense & Correcting Engine
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isLight ? "bg-emerald-200 text-emerald-900" : "bg-pink-900/60 text-pink-300 border border-pink-700/50"
                  }`}
                >
                  Live Simulator
                </span>
              </div>
              <p className={`text-xs ${isLight ? "text-emerald-800/70" : "text-slate-400"}`}>
                Targeting <span className="font-bold text-inherit">{companyName}</span> • Real-Time Answer Correctness & STAR Grading
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sessionCompletedAnswers.length > 0 && (
              <button
                onClick={() => setShowScorecard(true)}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isLight
                    ? "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Scorecard ({sessionCompletedAnswers.length})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${
                isLight ? "hover:bg-slate-100 text-slate-500" : "hover:bg-slate-800 text-slate-400"
              }`}
              title="Close Simulator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter & Navigation Bar */}
        <div
          className={`px-6 py-2.5 border-b flex items-center justify-between gap-3 overflow-x-auto text-xs shrink-0 ${
            isLight ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-900/40 border-slate-800/70"
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Round:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentIndex(0);
                    setEvaluation(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                    active
                      ? isLight
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-pink-600 text-white shadow-sm shadow-pink-500/30"
                      : isLight
                      ? "text-emerald-900/70 hover:bg-emerald-100"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {cat === "ALL" ? "All Rounds" : cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCustomModal(true)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                isLight
                  ? "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                  : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
              }`}
              title="Add a custom interview defense question"
            >
              <Plus className="w-3 h-3 text-emerald-500" />
              <span>Custom Q</span>
            </button>
          </div>
        </div>

        {/* Scrollable Main Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Question Card */}
          <div
            className={`p-5 rounded-2xl border space-y-3 relative overflow-hidden ${
              isLight
                ? "bg-emerald-50/80 border-emerald-200 shadow-sm"
                : "bg-slate-900/90 border-slate-800 shadow-lg"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold ${
                    isLight ? "bg-emerald-200 text-emerald-900" : "bg-purple-900/70 text-purple-300"
                  }`}
                >
                  Question {currentIndex + 1} of {filteredQuestions.length}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                    currentQ.difficulty === "Staff / Lead"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : currentQ.difficulty === "Senior"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {currentQ.difficulty} Tier
                </span>

                <span
                  className={`text-[11px] font-semibold ${
                    isLight ? "text-emerald-800" : "text-slate-400"
                  }`}
                >
                  {currentQ.round}
                </span>
              </div>

              {/* Read Aloud Button (TTS) */}
              <button
                type="button"
                onClick={toggleSpeechReadout}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  isSpeaking
                    ? "bg-indigo-600 text-white border-indigo-500 animate-pulse"
                    : isLight
                    ? "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
                title="Read question out loud like a real interviewer"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? "Mute Voice" : "Read Aloud"}</span>
              </button>
            </div>

            {/* Question Text */}
            <h3 className="text-base md:text-lg font-black leading-snug">
              &ldquo;{currentQ.question}&rdquo;
            </h3>

            {/* Question Context */}
            <p className={`text-xs ${isLight ? "text-emerald-900/70" : "text-slate-400"}`}>
              {currentQ.context}
            </p>

            {/* Talking Points Preview */}
            <div className="pt-2 border-t border-inherit space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>Interviewer Evaluation Rubric (Points to Cover):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentQ.key_points_to_mention.map((pt, i) => (
                  <span
                    key={i}
                    className={`text-[10px] px-2.5 py-1 rounded-md border ${
                      isLight
                        ? "bg-white text-emerald-900 border-emerald-200"
                        : "bg-slate-800/90 text-slate-300 border-slate-700"
                    }`}
                  >
                    • {pt}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* User Input & Audio Recorder Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span>Your Verbal or Written Defense</span>
                <span className={`text-[11px] font-normal lowercase ${isLight ? "text-emerald-800/60" : "text-slate-500"}`}>
                  ({answer.trim().split(/\s+/).filter(Boolean).length} words)
                </span>
              </label>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(timerSeconds)}</span>
                </div>

                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isRecording
                      ? "bg-rose-500 text-white animate-pulse"
                      : isLight
                      ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                      : "bg-purple-900/60 text-purple-300 border border-purple-700 hover:bg-purple-800/60"
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? "Listening (Click to Stop)" : "Speak Answer (Mic)"}</span>
                </button>
              </div>
            </div>

            <textarea
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (!isTimerRunning && e.target.value.length > 0) setIsTimerRunning(true);
              }}
              placeholder="State your technical approach using the STAR framework: Situation, Task, Action, and Quantified Result (e.g. 'In my repository, we needed to optimize... I implemented Redis caching and asynchronous queues, which dropped p99 latency by 45%...')."
              rows={5}
              className={`w-full rounded-2xl p-4 text-sm font-medium border focus:outline-none transition-all leading-relaxed ${
                isLight
                  ? "bg-white border-emerald-300 text-emerald-950 placeholder-emerald-800/40 focus:border-emerald-500 shadow-sm"
                  : "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-pink-500"
              }`}
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    isLight
                      ? "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNext}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    isLight
                      ? "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <span>Skip / Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleEvaluate}
                disabled={!answer.trim() || isEvaluating}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all disabled:opacity-50 ${
                  isLight
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30"
                    : "bg-gradient-to-r from-pink-500 to-indigo-600 text-white hover:opacity-95 shadow-pink-500/30"
                }`}
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading Correctness & Accuracy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Evaluate & Grade Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Correctness Evaluation & AI Correcting Process */}
          {evaluation && (
            <div
              className={`p-6 rounded-3xl border space-y-6 animate-slideUp ${
                isLight
                  ? "bg-emerald-50/90 border-emerald-300 shadow-xl"
                  : "bg-slate-900/95 border-pink-500/40 shadow-2xl shadow-black/80"
              }`}
            >
              {/* Verdict Header & Score Gauges */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-inherit">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-extrabold ${evaluation.verdictBadgeColor}`}>
                      {evaluation.verdictLabel}
                    </span>
                    <span className={`text-xs ${isLight ? "text-emerald-800/70" : "text-slate-400"}`}>
                      {companyName} Interview Standards
                    </span>
                  </div>
                  <h4 className="text-lg font-black">AI Correctness & Technical Diagnostic</h4>
                </div>

                <div className="flex items-center gap-4">
                  {/* Overall Score */}
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Overall Score</span>
                    <span
                      className={`text-2xl font-black ${
                        evaluation.overallScore >= 80
                          ? "text-emerald-500"
                          : evaluation.overallScore >= 60
                          ? "text-amber-500"
                          : "text-rose-500"
                      }`}
                    >
                      {evaluation.overallScore}%
                    </span>
                  </div>

                  <button
                    onClick={handleRetry}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isLight
                        ? "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                        : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                    }`}
                    title="Revise your answer and re-evaluate to improve your score"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry with Corrections</span>
                  </button>
                </div>
              </div>

              {/* Sub-Scores Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div
                  className={`p-3 rounded-xl border ${
                    isLight ? "bg-white border-emerald-200" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Concept Accuracy</span>
                  <span className="text-base font-extrabold text-indigo-400">{evaluation.accuracyScore}%</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Core domain terminology</p>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    isLight ? "bg-white border-emerald-200" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Key Points Covered</span>
                  <span className="text-base font-extrabold text-emerald-500">
                    {evaluation.coveredKeyPointsCount} / {evaluation.totalKeyPointsCount}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Required talking points</p>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    isLight ? "bg-white border-emerald-200" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">STAR Structure</span>
                  <span className="text-base font-extrabold text-amber-400">{evaluation.starScore}%</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{evaluation.starBreakdown.starScore} of 4 components</p>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    isLight ? "bg-white border-emerald-200" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Pacing & Depth</span>
                  <span className="text-base font-extrabold text-teal-400">{evaluation.depthScore}%</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{evaluation.wordCount} words spoken/typed</p>
                </div>
              </div>

              {/* Point-by-Point Key Points Checklist */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Key Points Evaluation Checklist</span>
                </h5>

                <div className="space-y-1.5">
                  {evaluation.keyPointsAnalysis.map((kp, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                        kp.status === "covered"
                          ? isLight
                            ? "bg-emerald-100/60 border-emerald-300"
                            : "bg-emerald-950/40 border-emerald-800/60 text-emerald-200"
                          : kp.status === "partial"
                          ? isLight
                            ? "bg-amber-100/60 border-amber-300"
                            : "bg-amber-950/40 border-amber-800/60 text-amber-200"
                          : isLight
                          ? "bg-rose-50 border-rose-200 text-rose-900"
                          : "bg-rose-950/30 border-rose-900/50 text-rose-300"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {kp.status === "covered" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                        {kp.status === "partial" && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                        {kp.status === "missed" && <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}

                        <div>
                          <p className="font-semibold">{kp.point}</p>
                          <p className="text-[11px] opacity-80 mt-0.5">{kp.feedback}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                          kp.status === "covered"
                            ? "bg-emerald-500 text-white"
                            : kp.status === "partial"
                            ? "bg-amber-500 text-slate-950"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {kp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths vs. Critical Mistakes & Anti-Patterns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Strengths */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isLight ? "bg-white border-emerald-200" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <span className="font-bold text-emerald-500 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    What You Did Well
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-inherit">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="leading-relaxed">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What Was Incorrect or Needs Revision */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isLight ? "bg-white border-rose-200" : "bg-slate-950 border-rose-900/40"
                  }`}
                >
                  <span className="font-bold text-rose-400 flex items-center gap-1.5 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    What Was Incorrect or Missing
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-inherit">
                    {evaluation.criticalMistakesAndGaps.map((im, i) => (
                      <li key={i} className="leading-relaxed">
                        {im}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improved Rewrite & Model Answer Tabs */}
              <div className="space-y-2 pt-2 border-t border-inherit">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveFeedbackTab("rewrite")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeFeedbackTab === "rewrite"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : isLight
                          ? "bg-white text-emerald-900 hover:bg-emerald-100"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      AI-Refined Rewrite of YOUR Answer
                    </button>

                    <button
                      onClick={() => setActiveFeedbackTab("model")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeFeedbackTab === "model"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : isLight
                          ? "bg-white text-emerald-900 hover:bg-emerald-100"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      Exemplary Staff Benchmark
                    </button>

                    <button
                      onClick={() => setActiveFeedbackTab("star")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeFeedbackTab === "star"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : isLight
                          ? "bg-white text-emerald-900 hover:bg-emerald-100"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      STAR Structure Analysis
                    </button>
                  </div>
                </div>

                {/* Tab 1: AI Improved Candidate Rewrite */}
                {activeFeedbackTab === "rewrite" && (
                  <div
                    className={`p-4 rounded-2xl border text-xs space-y-2 animate-fadeIn relative ${
                      isLight ? "bg-white border-indigo-200" : "bg-slate-950 border-indigo-900/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Staff-Level Polish of Your Exact Response:
                      </span>

                      <button
                        onClick={() => copyToClipboard(evaluation.improvedCandidateRewrite, "rewrite")}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white"
                      >
                        {copiedKey === "rewrite" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "rewrite" ? "Copied" : "Copy Rewrite"}</span>
                      </button>
                    </div>

                    <p className="leading-relaxed font-sans text-sm italic">
                      &ldquo;{evaluation.improvedCandidateRewrite}&rdquo;
                    </p>

                    <p className={`text-[11px] pt-2 border-t border-inherit ${isLight ? "text-emerald-800/70" : "text-slate-400"}`}>
                      💡 <span className="font-semibold">Why this works:</span> {evaluation.rewriteExplanation}
                    </p>
                  </div>
                )}

                {/* Tab 2: Exemplary Model Answer */}
                {activeFeedbackTab === "model" && (
                  <div
                    className={`p-4 rounded-2xl border text-xs space-y-2 animate-fadeIn relative ${
                      isLight ? "bg-white border-emerald-200" : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        Official Engineering Standard Answer:
                      </span>

                      <button
                        onClick={() => copyToClipboard(currentQ.model_answer, "model")}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white"
                      >
                        {copiedKey === "model" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "model" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <p className="leading-relaxed font-sans text-sm">
                      {currentQ.model_answer}
                    </p>
                  </div>
                )}

                {/* Tab 3: STAR Framework Analysis */}
                {activeFeedbackTab === "star" && (
                  <div
                    className={`p-4 rounded-2xl border text-xs space-y-3 animate-fadeIn ${
                      isLight ? "bg-white border-emerald-200" : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <h6 className="font-bold text-slate-300">STAR Breakdown Detected in Your Text:</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="p-2.5 rounded-xl border border-inherit space-y-1">
                        <span className="font-bold text-indigo-400">Situation (Context)</span>
                        <p>{evaluation.starBreakdown.situation.feedback}</p>
                        {evaluation.starBreakdown.situation.snippet && (
                          <p className="italic text-slate-400 mt-1">&ldquo;{evaluation.starBreakdown.situation.snippet}&rdquo;</p>
                        )}
                      </div>

                      <div className="p-2.5 rounded-xl border border-inherit space-y-1">
                        <span className="font-bold text-teal-400">Task (Engineering Goal)</span>
                        <p>{evaluation.starBreakdown.task.feedback}</p>
                        {evaluation.starBreakdown.task.snippet && (
                          <p className="italic text-slate-400 mt-1">&ldquo;{evaluation.starBreakdown.task.snippet}&rdquo;</p>
                        )}
                      </div>

                      <div className="p-2.5 rounded-xl border border-inherit space-y-1">
                        <span className="font-bold text-amber-400">Action (Implementation & Trade-offs)</span>
                        <p>{evaluation.starBreakdown.action.feedback}</p>
                        {evaluation.starBreakdown.action.snippet && (
                          <p className="italic text-slate-400 mt-1">&ldquo;{evaluation.starBreakdown.action.snippet}&rdquo;</p>
                        )}
                      </div>

                      <div className="p-2.5 rounded-xl border border-inherit space-y-1">
                        <span className="font-bold text-emerald-400">Result (Metrics & Production Impact)</span>
                        <p>{evaluation.starBreakdown.result.feedback}</p>
                        {evaluation.starBreakdown.result.snippet && (
                          <p className="italic text-slate-400 mt-1">&ldquo;{evaluation.starBreakdown.result.snippet}&rdquo;</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Adaptive Interviewer Follow-Up Probe */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isLight
                    ? "bg-indigo-50 border-indigo-200 text-indigo-950"
                    : "bg-indigo-950/40 border-indigo-800/60 text-indigo-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-indigo-400">
                    <Compass className="w-4 h-4" />
                    <span>Adaptive Live Follow-Up Probe</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                    Interviewer Deep-Dive
                  </span>
                </div>

                <p className="text-sm font-semibold leading-snug">
                  &ldquo;{evaluation.adaptiveFollowUpQuestion}&rdquo;
                </p>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] opacity-75">
                    Real interviewers challenge edge cases and trade-offs.
                  </span>

                  <button
                    onClick={() => handleAnswerFollowUp(evaluation.adaptiveFollowUpQuestion)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md transition-all"
                  >
                    <span>Answer Follow-Up Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Next Question Navigation */}
              <div className="text-right pt-2">
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs hover:opacity-95 shadow-lg transition-all"
                >
                  Proceed to Next Question →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Question Modal Sub-dialog */}
        {showCustomModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
                isLight ? "bg-white text-emerald-950 border-emerald-300" : "bg-slate-900 text-white border-pink-500/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>Add Custom Interview Question</span>
                </h3>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Target Topic or Technology:</label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Kafka partition rebalancing, PostgreSQL indexing, GraphQL vs REST"
                    className={`w-full p-3 rounded-xl border focus:outline-none ${
                      isLight ? "bg-slate-50 border-slate-300" : "bg-slate-950 border-slate-700 text-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Interview Round Category:</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className={`w-full p-3 rounded-xl border focus:outline-none ${
                      isLight ? "bg-slate-50 border-slate-300" : "bg-slate-950 border-slate-700 text-white"
                    }`}
                  >
                    <option value="System Design">System Design</option>
                    <option value="Coding & Concurrency">Coding & Concurrency</option>
                    <option value="Project Defense">Project Defense</option>
                    <option value="Behavioral & STAR">Behavioral & STAR</option>
                    <option value="Leadership & Culture">Leadership & Culture</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomQuestion}
                  disabled={!customTopic.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  Generate Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scorecard Modal Sub-dialog */}
        {showScorecard && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div
              className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl space-y-5 ${
                isLight ? "bg-white text-emerald-950 border-emerald-300" : "bg-slate-900 text-white border-pink-500/40"
              }`}
            >
              <div className="flex items-center justify-between border-b border-inherit pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-base">Practice Session Scorecard</h3>
                </div>
                <button
                  onClick={() => setShowScorecard(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-around p-4 rounded-2xl bg-slate-950/40 border border-inherit text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions Completed</span>
                  <span className="text-xl font-black text-indigo-400">{sessionCompletedAnswers.length}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Accuracy</span>
                  <span className="text-xl font-black text-emerald-400">{sessionAvgScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Readiness Rating</span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    {sessionAvgScore >= 80 ? "Interview Ready" : "In Progress"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {sessionCompletedAnswers.map((s, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-inherit text-xs flex items-center justify-between gap-3"
                  >
                    <p className="font-medium truncate max-w-[280px]">{s.question}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-emerald-400">{s.score}%</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {s.verdictLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-right pt-2">
                <button
                  onClick={() => setShowScorecard(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
                >
                  Close Scorecard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
