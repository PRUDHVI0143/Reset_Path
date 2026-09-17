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
  SlidersHorizontal,
  Eye,
  EyeOff,
  Zap,
  BookOpen,
  Send,
  HelpCircle,
  FileText
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
  onInjectResumeBullet?: (bullet: string) => void;
}

export default function InterviewSimulatorModal({
  isOpen,
  onClose,
  questions: initialQuestions,
  companyName,
  onInjectResumeBullet
}: InterviewSimulatorModalProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  // Build full question pool merging initial questions with comprehensive bank
  const baseQuestions = useMemo<InterviewQuestion[]>(() => {
    const fallbackBank = generateComprehensiveQuestionBank(companyName, []);
    if (!initialQuestions || initialQuestions.length === 0) {
      return fallbackBank;
    }

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
      model_answer: q.model_answer || "State problem clearly, detail trade-offs, and summarize quantitative impact with verified latency and throughput metrics.",
      follow_up_prompts: q.follow_up_prompts || [
        "What is the single biggest failure risk in this architecture?",
        "How would you monitor and measure this in production?"
      ]
    }));

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
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isSpeakingModelAnswer, setIsSpeakingModelAnswer] = useState(false);
  const [peekAnswer, setPeekAnswer] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [injectedKey, setInjectedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"model" | "compare" | "rewrite" | "star">("model");

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

  // Toggle audio speech synthesis for question
  const toggleQuestionSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeakingModelAnswer(false);
      const textToSpeak = `${currentQ.round}. ${currentQ.question}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeakingQuestion(false);
      utterance.onerror = () => setIsSpeakingQuestion(false);
      speechUtteranceRef.current = utterance;
      setIsSpeakingQuestion(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle audio speech synthesis for Model Answer
  const toggleModelAnswerSpeech = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeakingModelAnswer) {
      window.speechSynthesis.cancel();
      setIsSpeakingModelAnswer(false);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onend = () => setIsSpeakingModelAnswer(false);
      utterance.onerror = () => setIsSpeakingModelAnswer(false);
      speechUtteranceRef.current = utterance;
      setIsSpeakingModelAnswer(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle mic voice recording
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

  // Evaluate candidate answer
  const handleEvaluate = async () => {
    if (!answer.trim()) return;

    setIsEvaluating(true);
    setIsTimerRunning(false);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      setIsSpeakingModelAnswer(false);
    }

    try {
      await new Promise((r) => setTimeout(r, 600));

      const result = evaluateInterviewAnswer(currentQ, answer, timerSeconds);
      setEvaluation(result);
      setActiveTab("model"); // Immediately show the model answer tab!

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

  const handleRetry = () => {
    setEvaluation(null);
    setIsTimerRunning(true);
  };

  const handleNext = () => {
    setEvaluation(null);
    setAnswer("");
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setPeekAnswer(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      setIsSpeakingModelAnswer(false);
    }
    setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length);
  };

  const handlePrev = () => {
    setEvaluation(null);
    setAnswer("");
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setPeekAnswer(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      setIsSpeakingModelAnswer(false);
    }
    setCurrentIndex((prev) => (prev === 0 ? filteredQuestions.length - 1 : prev - 1));
  };

  // Inject answer/bullet directly into live resume
  const handleInjectToLiveResume = (text: string, key: string) => {
    if (onInjectResumeBullet) {
      onInjectResumeBullet(text);
    }
    setInjectedKey(key);
    setTimeout(() => setInjectedKey(null), 3000);
  };

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
        "Directly address the failure condition or scale bottleneck.",
        "Explain mitigation trade-offs and operational telemetry.",
        "Demonstrate resilience and circuit breaker patterns."
      ],
      model_answer: `In response to this follow-up, the primary mitigation is implementing distributed rate limiting with sliding-window Redis counters alongside circuit breakers. If latency exceeds our 200ms SLO, non-essential calls gracefully degrade and serve cached fallback responses, preserving system availability under high concurrency.`,
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
    setPeekAnswer(false);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border transition-all ${
          isLight
            ? "bg-white text-slate-900 border-slate-200 shadow-slate-300/60"
            : "bg-slate-950 text-slate-100 border-slate-800 shadow-black/90"
        }`}
      >
        {/* Top Accent Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-indigo-500 to-pink-500" />

        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                isLight
                  ? "bg-gradient-to-br from-indigo-500 to-teal-600 text-white"
                  : "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-500/20"
              }`}
            >
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black tracking-tight">
                  AI Technical Interview Simulator &amp; Defense Engine
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider font-mono">
                  v3.4 LIVE
                </span>
              </div>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Real-time speech evaluation, instant model answer reveal, and live resume synchronization for {companyName}
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2">
            {sessionCompletedAnswers.length > 0 && (
              <button
                onClick={() => setShowScorecard(!showScorecard)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isLight
                    ? "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    : "bg-indigo-950/40 text-indigo-300 border-indigo-700/50 hover:bg-indigo-900/40"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Session Score: {sessionAvgScore}%</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${
                isLight ? "hover:bg-slate-200 text-slate-500" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category & Filter Navigation Bar */}
        <div
          className={`px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900/40 border-slate-800"
          }`}
        >
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-2xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                  setEvaluation(null);
                  setAnswer("");
                  setPeekAnswer(false);
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap border ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : isLight
                    ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCustomModal(true)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              }`}
            >
              <Plus className="w-3 h-3 text-emerald-400" />
              <span>Custom Topic</span>
            </button>
            <span className={`text-[11px] font-medium ${isLight ? "text-slate-400" : "text-slate-500"}`}>
              {currentIndex + 1} of {filteredQuestions.length}
            </span>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Question Card */}
          <div
            className={`p-6 rounded-3xl border space-y-4 shadow-sm transition-all ${
              isLight
                ? "bg-slate-50/80 border-slate-200 text-slate-900"
                : "bg-slate-900/60 border-slate-800 text-slate-100"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {currentQ.round}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-inherit text-slate-400">
                  {currentQ.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {currentQ.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Peek Answer Toggle */}
                <button
                  type="button"
                  onClick={() => setPeekAnswer(!peekAnswer)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                    peekAnswer
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : isLight
                      ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                  title="Toggle peek at model solution before answering"
                >
                  {peekAnswer ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{peekAnswer ? "Hide Guide" : "Peek Model Answer"}</span>
                </button>

                {/* Read aloud question */}
                <button
                  type="button"
                  onClick={toggleQuestionSpeech}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                    isSpeakingQuestion
                      ? "bg-indigo-600 text-white animate-pulse"
                      : isLight
                      ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {isSpeakingQuestion ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{isSpeakingQuestion ? "Mute Voice" : "Hear Interviewer"}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-lg md:text-xl font-black leading-snug tracking-tight">
              &ldquo;{currentQ.question}&rdquo;
            </h3>

            {/* Context */}
            <p className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              {currentQ.context}
            </p>

            {/* Talking Points & Peek Answer Panel */}
            {peekAnswer ? (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2.5 animate-fadeIn ${
                  isLight ? "bg-amber-50/70 border-amber-200 text-amber-950" : "bg-amber-950/30 border-amber-700/50 text-amber-200"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Model Answer Guide &amp; Key Concepts:
                  </span>
                  <button
                    onClick={() => toggleModelAnswerSpeech(currentQ.model_answer)}
                    className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 hover:underline"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Listen</span>
                  </button>
                </div>
                <p className="leading-relaxed font-sans text-xs italic">
                  &ldquo;{currentQ.model_answer}&rdquo;
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {currentQ.key_points_to_mention.map((pt, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/60 dark:bg-black/40 text-[10px] font-medium border border-inherit">
                      • {pt}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-inherit space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Evaluation Rubric (Points to hit):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentQ.key_points_to_mention.map((pt, i) => (
                    <span
                      key={i}
                      className={`text-[10px] px-2.5 py-0.5 rounded-lg border ${
                        isLight
                          ? "bg-white text-slate-700 border-slate-200 shadow-2xs"
                          : "bg-slate-800/80 text-slate-300 border-slate-700"
                      }`}
                    >
                      • {pt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Input & Audio Recorder Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span>Your Verbal or Written Defense</span>
                <span className={`text-[11px] font-normal lowercase ${isLight ? "text-slate-500" : "text-slate-400"}`}>
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
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                    isRecording
                      ? "bg-rose-500 text-white animate-pulse"
                      : isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-500" />}
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
              placeholder="State your technical approach using the STAR framework: Situation, Task, Action, and Quantified Result (e.g. 'In my repository, we needed to optimize query latency... I designed a Redis sliding-window cache with background worker queues, cutting p99 latency by 45%...')."
              rows={4}
              className={`w-full rounded-2xl p-4 text-sm font-medium border focus:outline-none transition-all leading-relaxed ${
                isLight
                  ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-sm"
                  : "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              }`}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    isLight
                      ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNext}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    isLight
                      ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  <span>Skip / Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleEvaluate}
                disabled={!answer.trim() || isEvaluating}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                  isLight
                    ? "bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white shadow-indigo-600/20"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30"
                }`}
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading &amp; Generating Model Solution...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Evaluate &amp; Reveal Model Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* AFTER ANSWERING: COMPREHENSIVE ANSWER REVEAL & DIAGNOSTIC SECTION        */}
          {/* ========================================================================= */}
          {evaluation && (
            <div
              className={`p-6 rounded-3xl border space-y-6 animate-slideUp ${
                isLight
                  ? "bg-white border-slate-200 shadow-xl"
                  : "bg-slate-900 border-slate-800 shadow-2xl shadow-black/80"
              }`}
            >
              {/* Verdict Header & Score Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-inherit">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-extrabold ${evaluation.verdictBadgeColor}`}>
                      {evaluation.verdictLabel}
                    </span>
                    <span className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      {companyName} Technical Standard
                    </span>
                  </div>
                  <h4 className="text-lg font-black tracking-tight">Answer Diagnostic &amp; Model Solution</h4>
                </div>

                <div className="flex items-center gap-4">
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
                        ? "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
                        : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Answer</span>
                  </button>
                </div>
              </div>

              {/* Quick 4-Metric Diagnostic Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Concept Accuracy</span>
                  <span className="text-base font-extrabold text-indigo-400">{evaluation.accuracyScore}%</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Core domain terminology</p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Key Points Covered</span>
                  <span className="text-base font-extrabold text-emerald-500">
                    {evaluation.coveredKeyPointsCount} / {evaluation.totalKeyPointsCount}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Required talking points</p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">STAR Structure</span>
                  <span className="text-base font-extrabold text-amber-400">{evaluation.starScore}%</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{evaluation.starBreakdown.starScore} of 4 components</p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Pacing &amp; Depth</span>
                  <span className="text-base font-extrabold text-teal-400">{evaluation.depthScore}%</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{evaluation.wordCount} words analyzed</p>
                </div>
              </div>

              {/* ================================================================= */}
              {/* PROMINENT MODEL ANSWER & COMPARISON TAB BAR                        */}
              {/* ================================================================= */}
              <div className="space-y-3">
                <div
                  className={`flex rounded-2xl p-1 border ${
                    isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800/60 border-slate-800"
                  }`}
                >
                  <button
                    onClick={() => setActiveTab("model")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "model"
                        ? "bg-indigo-600 text-white shadow-md"
                        : isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Official Model Answer</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("compare")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "compare"
                        ? "bg-indigo-600 text-white shadow-md"
                        : isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Side-by-Side Comparison</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("rewrite")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "rewrite"
                        ? "bg-indigo-600 text-white shadow-md"
                        : isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Polish of Your Answer</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("star")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "star"
                        ? "bg-indigo-600 text-white shadow-md"
                        : isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>STAR Breakdown</span>
                  </button>
                </div>

                {/* TAB 1: OFFICIAL MODEL ANSWER (HIGHLIGHTED PROMINENTLY) */}
                {activeTab === "model" && (
                  <div
                    className={`p-5 rounded-2xl border space-y-4 animate-fadeIn relative ${
                      isLight ? "bg-emerald-50/70 border-emerald-300/80" : "bg-slate-950 border-emerald-800/50"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-inherit">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                            Exemplary Staff-Level Model Answer
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                            The exact technical phrasing, trade-offs, and metrics expected by {companyName}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons on Model Answer */}
                      <div className="flex items-center gap-2">
                        {/* Audio TTS Readout */}
                        <button
                          onClick={() => toggleModelAnswerSpeech(currentQ.model_answer)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            isSpeakingModelAnswer
                              ? "bg-emerald-600 text-white animate-pulse"
                              : isLight
                              ? "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                              : "bg-slate-800 text-emerald-300 border-emerald-700/60 hover:bg-slate-700"
                          }`}
                        >
                          {isSpeakingModelAnswer ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>{isSpeakingModelAnswer ? "Mute" : "Listen to Model Answer"}</span>
                        </button>

                        {/* Copy */}
                        <button
                          onClick={() => copyToClipboard(currentQ.model_answer, "model")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                            isLight
                              ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                              : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          {copiedKey === "model" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === "model" ? "Copied" : "Copy"}</span>
                        </button>

                        {/* LIVE UPDATE BUTTON: Inject into Live CV */}
                        <button
                          onClick={() => handleInjectToLiveResume(currentQ.model_answer, "model_inject")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                            injectedKey === "model_inject"
                              ? "bg-emerald-600 text-white shadow-emerald-500/20"
                              : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 shadow-emerald-600/25"
                          }`}
                          title="Inject this exemplary answer directly into your live resume markdown"
                        >
                          {injectedKey === "model_inject" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                              <span>Injected to Live CV!</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-yellow-300" />
                              <span>+ Inject to Live CV</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Model Answer Body */}
                    <p className="leading-relaxed font-sans text-sm md:text-base font-normal">
                      &ldquo;{currentQ.model_answer}&rdquo;
                    </p>

                    {/* Core Architectural Pillars */}
                    <div className="pt-2 border-t border-inherit flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-500 dark:text-slate-400">Core Concepts Evaluated:</span>
                      {currentQ.expected_concepts?.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold"
                        >
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: SIDE-BY-SIDE COMPARISON */}
                {activeTab === "compare" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn text-xs">
                    {/* What You Answered */}
                    <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                      <div className="flex items-center justify-between pb-2 border-b border-inherit">
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                          Your Submitted Response:
                        </span>
                        <span className="text-[10px] text-slate-400">{evaluation.wordCount} words</span>
                      </div>
                      <p className="leading-relaxed text-sm italic">
                        &ldquo;{answer}&rdquo;
                      </p>
                    </div>

                    {/* Exemplary Model Answer */}
                    <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? "bg-emerald-50/80 border-emerald-200" : "bg-slate-950 border-emerald-900/50"}`}>
                      <div className="flex items-center justify-between pb-2 border-b border-inherit">
                        <span className="font-bold text-emerald-500 uppercase tracking-wider text-[11px] flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          Exemplary Staff Model Answer:
                        </span>
                        <button
                          onClick={() => handleInjectToLiveResume(currentQ.model_answer, "compare_inject")}
                          className="text-[10px] font-bold text-emerald-500 hover:underline flex items-center gap-1"
                        >
                          {injectedKey === "compare_inject" ? "✓ Injected!" : "+ Add to CV"}
                        </button>
                      </div>
                      <p className="leading-relaxed text-sm">
                        &ldquo;{currentQ.model_answer}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: AI POLISHED REWRITE OF YOUR EXACT ANSWER */}
                {activeTab === "rewrite" && (
                  <div
                    className={`p-5 rounded-2xl border space-y-3 animate-fadeIn relative ${
                      isLight ? "bg-indigo-50/70 border-indigo-200" : "bg-slate-950 border-indigo-900/50"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-inherit">
                      <span className="font-extrabold text-sm text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Staff-Level Polish of YOUR Response (STAR Formatted):
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(evaluation.improvedCandidateRewrite, "rewrite")}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white border border-slate-700 flex items-center gap-1"
                        >
                          {copiedKey === "rewrite" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === "rewrite" ? "Copied" : "Copy"}</span>
                        </button>

                        <button
                          onClick={() => handleInjectToLiveResume(evaluation.improvedCandidateRewrite, "rewrite_inject")}
                          className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                            injectedKey === "rewrite_inject"
                              ? "bg-indigo-600 text-white"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                          }`}
                        >
                          {injectedKey === "rewrite_inject" ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Injected to Live CV!</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 text-yellow-300" />
                              <span>+ Inject Rewrite to Live CV</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="leading-relaxed font-sans text-sm md:text-base italic">
                      &ldquo;{evaluation.improvedCandidateRewrite}&rdquo;
                    </p>

                    <p className={`text-[11px] pt-2 border-t border-inherit ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      💡 <span className="font-semibold">Why this works:</span> {evaluation.rewriteExplanation}
                    </p>
                  </div>
                )}

                {/* TAB 4: STAR FRAMEWORK ANALYSIS */}
                {activeTab === "star" && (
                  <div
                    className={`p-4 rounded-2xl border text-xs space-y-3 animate-fadeIn ${
                      isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <h6 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                      STAR Structure Detected in Your Response:
                    </h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="p-3 rounded-xl border border-inherit space-y-1">
                        <span className="font-bold text-indigo-400 block">Situation (Context)</span>
                        <p>{evaluation.starBreakdown.situation.feedback}</p>
                        {evaluation.starBreakdown.situation.snippet && (
                          <p className="italic text-slate-400 mt-1">&ldquo;{evaluation.starBreakdown.situation.snippet}&rdquo;</p>
                        )}
                      </div>

                      <div className="p-3 rounded-xl border border-inherit space-y-1">
                        <span className="font-bold text-teal-400 block">Task (Engineering Goal)</span>
                        <p>{evaluation.starBreakdown.task.feedback}</p>
                        {evaluation.starBreakdown.task.snippet && (
                          <p className="italic text-slate-400 mt-1">&ldquo;{evaluation.starBreakdown.task.snippet}&rdquo;</p>
                        )}
                      </div>

                      <div className="p-3 rounded-xl border border-inherit space-y-1">
                        <span className="font-bold text-amber-400 block">Action (Implementation &amp; Trade-offs)</span>
                        <p>{evaluation.starBreakdown.action.feedback}</p>
                        {evaluation.starBreakdown.action.snippet && (
                          <p className="italic text-slate-400 mt-1">&ldquo;{evaluation.starBreakdown.action.snippet}&rdquo;</p>
                        )}
                      </div>

                      <div className="p-3 rounded-xl border border-inherit space-y-1">
                        <span className="font-bold text-emerald-400 block">Result (Metrics &amp; Production Impact)</span>
                        <p>{evaluation.starBreakdown.result.feedback}</p>
                        {evaluation.starBreakdown.result.snippet && (
                          <p className="italic text-slate-400 mt-1">&ldquo;{evaluation.starBreakdown.result.snippet}&rdquo;</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Point-by-Point Rubric Checklist */}
              <div className="space-y-2 pt-2 border-t border-inherit">
                <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Evaluation Checklist (Required Concepts)</span>
                </h5>

                <div className="space-y-1.5">
                  {evaluation.keyPointsAnalysis.map((kp, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                        kp.status === "covered"
                          ? isLight ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-emerald-950/30 border-emerald-800/50 text-emerald-200"
                          : kp.status === "partial"
                          ? isLight ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-amber-950/30 border-amber-800/50 text-amber-200"
                          : isLight ? "bg-rose-50 border-rose-200 text-rose-900" : "bg-rose-950/30 border-rose-900/50 text-rose-300"
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

              {/* Strengths vs Critical Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                  <span className="font-bold text-emerald-500 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    What You Did Well
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="leading-relaxed">{s}</li>
                    ))}
                  </ul>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-rose-900/40"}`}>
                  <span className="font-bold text-rose-400 flex items-center gap-1.5 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    What Was Missing or Needs Revision
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside">
                    {evaluation.criticalMistakesAndGaps.map((im, i) => (
                      <li key={i} className="leading-relaxed">{im}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Adaptive Interviewer Follow-Up Probe */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isLight
                    ? "bg-indigo-50/70 border-indigo-200 text-indigo-950"
                    : "bg-indigo-950/30 border-indigo-800/50 text-indigo-200"
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
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md transition-all active:scale-95"
                  >
                    <span>Answer Follow-Up Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Next Question CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-inherit">
                <span className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  Ready for the next round?
                </span>

                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
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
                isLight ? "bg-white text-slate-900 border-slate-200" : "bg-slate-900 text-white border-slate-700"
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
                    placeholder="e.g. Distributed Caching, Kafka, WebSockets"
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800 border-slate-700 text-white"
                    }`}
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Category:</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800 border-slate-700 text-white"
                    }`}
                  >
                    <option value="System Design">System Design</option>
                    <option value="Coding & Concurrency">Coding &amp; Concurrency</option>
                    <option value="Project Defense">Project Defense</option>
                    <option value="Behavioral & STAR">Behavioral &amp; STAR</option>
                    <option value="Leadership & Culture">Leadership &amp; Culture</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomQuestion}
                  disabled={!customTopic.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
