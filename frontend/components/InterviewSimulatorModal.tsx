"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Send,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface Question {
  id: string;
  round: string;
  question: string;
  context: string;
  key_points_to_mention: string[];
  model_answer: string;
}

interface InterviewSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  companyName: string;
}

export default function InterviewSimulatorModal({
  isOpen,
  onClose,
  questions,
  companyName
}: InterviewSimulatorModalProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const recognitionRef = useRef<any>(null);

  const currentQ = questions[currentIndex] || questions[0];

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
          setAnswer((prev) => `${prev} ${transcript}`.trim());
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

  if (!isOpen || !currentQ) return null;

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your answer below.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsTimerRunning(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setIsTimerRunning(true);
      } catch (e) {
        console.error("Mic start error:", e);
      }
    }
  };

  const handleEvaluate = () => {
    if (!answer.trim()) return;

    setIsEvaluating(true);
    setIsTimerRunning(false);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    // Local instant AI evaluator simulating comprehensive STAR analysis
    setTimeout(() => {
      const words = answer.trim().split(/\s+/).length;
      const lower = answer.toLowerCase();

      // Check STAR components
      const hasSituation = lower.includes("when") || lower.includes("project") || lower.includes("problem") || lower.includes("built");
      const hasTask = lower.includes("needed") || lower.includes("task") || lower.includes("goal") || lower.includes("challenge");
      const hasAction = lower.includes("implemented") || lower.includes("used") || lower.includes("designed") || lower.includes("chose") || lower.includes("optimized");
      const hasResult = lower.includes("result") || lower.includes("reduced") || lower.includes("%") || lower.includes("latency") || lower.includes("improved") || lower.includes("achieved");

      let starCount = 0;
      if (hasSituation) starCount++;
      if (hasTask) starCount++;
      if (hasAction) starCount++;
      if (hasResult) starCount++;

      let score = 55 + starCount * 10;
      if (words > 40) score += 5;
      if (words > 80) score += 5;
      score = Math.min(96, Math.max(50, score));

      setEvaluation({
        score,
        wordCount: words,
        starCompliance: `${starCount}/4 (Situation, Task, Action, Result)`,
        strengths: [
          hasAction ? "Clear technical actions and engineering choices articulated." : "Good foundational attempt.",
          words >= 45 ? "Sufficient depth and explanation of technical context." : "Concise and direct response."
        ],
        improvements: [
          !hasResult ? "Include a quantified metric (e.g. reduced p99 latency by 35%, sustained 10K QPS)." : "Elaborate more on trade-offs you considered before finalizing this choice.",
          !hasSituation ? "Set the context up front: mention the repo name and specific engineering objective." : "Great structure!"
        ]
      });
      setIsEvaluating(false);
    }, 1200);
  };

  const handleNext = () => {
    setEvaluation(null);
    setAnswer("");
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl border transition-all ${
          isLight
            ? "bg-white text-emerald-950 border-emerald-300 shadow-emerald-950/20"
            : "bg-slate-950 text-white border-pink-500/30 shadow-black/80"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isLight ? "bg-emerald-100 text-emerald-700" : "bg-pink-950/80 text-pink-400 border border-pink-700/50"
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                AI Technical Interview Defense Simulator
              </h2>
              <p className={`text-xs ${isLight ? "text-emerald-800/70" : "text-slate-400"}`}>
                Simulating {companyName} • {currentQ.round}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${
              isLight ? "hover:bg-slate-100 text-slate-500" : "hover:bg-slate-800 text-slate-400"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Card */}
        <div
          className={`p-5 rounded-2xl border space-y-3 ${
            isLight
              ? "bg-emerald-50/70 border-emerald-200"
              : "bg-slate-900/90 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span
              className={`px-2.5 py-1 rounded-full ${
                isLight ? "bg-emerald-200/80 text-emerald-900" : "bg-purple-900/60 text-purple-300"
              }`}
            >
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className={`text-[11px] font-mono ${isLight ? "text-emerald-800" : "text-slate-400"}`}>
              {currentQ.context}
            </span>
          </div>

          <h3 className="text-base font-extrabold leading-snug">
            &ldquo;{currentQ.question}&rdquo;
          </h3>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Key talking points:</span>
            {currentQ.key_points_to_mention.map((pt, i) => (
              <span
                key={i}
                className={`text-[10px] px-2 py-0.5 rounded-md border ${
                  isLight
                    ? "bg-white text-emerald-800 border-emerald-200"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                ✓ {pt}
              </span>
            ))}
          </div>
        </div>

        {/* User Input & Audio Recorder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Your Answer (Speak or Type)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
              <button
                type="button"
                onClick={toggleRecording}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  isRecording
                    ? "bg-rose-500 text-white animate-pulse"
                    : isLight
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    : "bg-purple-900/60 text-purple-300 border border-purple-700 hover:bg-purple-800/60"
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? "Listening..." : "Speak Answer"}</span>
              </button>
            </div>
          </div>

          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (!isTimerRunning && e.target.value.length > 0) setIsTimerRunning(true);
            }}
            placeholder="Explain your approach using the STAR framework (Situation, Task, Action, Result)..."
            rows={4}
            className={`w-full rounded-2xl p-4 text-sm font-medium border focus:outline-none transition-all ${
              isLight
                ? "bg-white border-emerald-300 text-emerald-950 placeholder-emerald-800/40 focus:border-emerald-500 shadow-sm"
                : "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-pink-500"
            }`}
          />

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleNext}
              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                isLight ? "text-emerald-800 hover:text-emerald-950" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Skip Question</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleEvaluate}
              disabled={!answer.trim() || isEvaluating}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all disabled:opacity-50 ${
                isLight
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gradient-to-r from-pink-500 to-indigo-600 text-white hover:opacity-95"
              }`}
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating STAR Response...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Evaluate My Answer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Evaluation Output Card */}
        {evaluation && (
          <div
            className={`p-6 rounded-2xl border space-y-4 animate-slideUp ${
              isLight
                ? "bg-emerald-50/90 border-emerald-300"
                : "bg-slate-900 border-pink-500/40 shadow-xl"
            }`}
          >
            <div className="flex items-center justify-between border-b border-inherit pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h4 className="font-extrabold text-sm">AI Interview Feedback</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">STAR Score:</span>
                <span className="text-lg font-black text-emerald-500">{evaluation.score}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  What You Did Well
                </span>
                <ul className="space-y-1 list-disc list-inside text-slate-300">
                  {evaluation.strengths.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  How to Improve for {companyName}
                </span>
                <ul className="space-y-1 list-disc list-inside text-slate-300">
                  {evaluation.improvements.map((im: string, i: number) => (
                    <li key={i}>{im}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Model Answer */}
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                isLight ? "bg-white border-emerald-200" : "bg-slate-950 border-slate-800"
              }`}
            >
              <span className="font-bold text-indigo-400 block">Exemplary Model Answer:</span>
              <p className={isLight ? "text-emerald-950" : "text-slate-200"}>
                {currentQ.model_answer}
              </p>
            </div>

            <div className="text-right pt-2">
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-all"
              >
                Next Question →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
