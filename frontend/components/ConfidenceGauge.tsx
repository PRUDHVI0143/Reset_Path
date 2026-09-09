"use client";

import { ShieldCheck, Info } from "lucide-react";

interface GaugeProps {
  score: number; // 0.0 to 1.0
  method?: string;
}

export default function ConfidenceGauge({ score, method }: GaugeProps) {
  const percentage = Math.round(score * 100);
  
  const getScoreColor = () => {
    if (percentage >= 80) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (percentage >= 60) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-red-400 border-red-500/40 bg-red-500/10";
  };

  const getProgressGradient = () => {
    if (percentage >= 80) return "from-emerald-500 to-teal-400";
    if (percentage >= 60) return "from-amber-500 to-yellow-400";
    return "from-red-500 to-orange-400";
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Fact-Check Confidence Score</h3>
            <p className="text-xs text-slate-400">Independent Source Agreement & LLM-as-Judge</p>
          </div>
        </div>

        <div className={`px-4 py-2 rounded-xl font-extrabold text-2xl border ${getScoreColor()}`}>
          {percentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-3 mb-3 overflow-hidden border border-white/5">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient()} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-400 mb-4 font-mono">
        <span>0% Unverified</span>
        <span>50% Moderate</span>
        <span>80% Verified Threshold</span>
        <span>100% High Certainty</span>
      </div>

      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5 flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Stated Method: </span>
          {method || "Formula: 0.50 * Source Agreement Ratio + 0.25 * Domain Reliability + 0.25 * LLM-as-Judge semantic consistency evaluation."}
        </div>
      </div>
    </div>
  );
}
