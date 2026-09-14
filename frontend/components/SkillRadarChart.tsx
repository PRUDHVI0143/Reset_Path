"use client";

import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from "recharts";
import { useTheme } from "./ThemeProvider";

interface RadarItem {
  dimension: string;
  candidateScore: number;
  companyBar: number;
  fullMark: number;
}

interface SkillRadarChartProps {
  data: RadarItem[];
  companyName: string;
}

export default function SkillRadarChart({ data, companyName }: SkillRadarChartProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  if (!data || data.length === 0) return null;

  return (
    <div
      className={`p-6 rounded-3xl backdrop-blur-md transition-all border ${
        isLight
          ? "bg-white/80 border-emerald-300/60 shadow-xl shadow-emerald-950/5"
          : "bg-slate-900/80 border-purple-500/30 shadow-2xl shadow-black/50"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">
              {isLight ? "🌿" : "⚡"} Engineering Skill Benchmark
            </span>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                isLight
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-purple-950/80 text-purple-300 border border-purple-700/50 font-mono"
              }`}
            >
              5-Axis Radar
            </span>
          </div>
          <p
            className={`text-xs mt-1 ${
              isLight ? "text-emerald-900/70" : "text-slate-400"
            }`}
          >
            Candidate Verified Level vs. {companyName} Target Engineering Bar
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-3 h-3 rounded-full ${
                isLight ? "bg-emerald-600" : "bg-pink-500 shadow-sm shadow-pink-500/50"
              }`}
            />
            <span className={isLight ? "text-emerald-950" : "text-white"}>
              Your Verified Level
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-3 h-3 rounded-full border-2 border-dashed ${
                isLight ? "border-amber-600 bg-amber-100" : "border-indigo-400 bg-indigo-950"
              }`}
            />
            <span className={isLight ? "text-amber-900" : "text-slate-300"}>
              {companyName} Bar
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid
              stroke={isLight ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.12)"}
            />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{
                fill: isLight ? "#064e3b" : "#cbd5e1",
                fontSize: 11,
                fontWeight: 600
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: isLight ? "#047857" : "#94a3b8", fontSize: 10 }}
              stroke={isLight ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.1)"}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as RadarItem;
                  return (
                    <div
                      className={`p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md ${
                        isLight
                          ? "bg-white/95 border-emerald-300 text-emerald-950"
                          : "bg-slate-900/95 border-purple-500/40 text-white"
                      }`}
                    >
                      <div className="font-bold text-sm mb-1">{item.dimension}</div>
                      <div className="flex items-center justify-between gap-4">
                        <span className={isLight ? "text-emerald-700" : "text-pink-400"}>
                          Your Score:
                        </span>
                        <span className="font-bold">{item.candidateScore}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className={isLight ? "text-amber-700" : "text-indigo-400"}>
                          {companyName} Target Bar:
                        </span>
                        <span className="font-bold">{item.companyBar}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Candidate Radar */}
            <Radar
              name="Your Verified Level"
              dataKey="candidateScore"
              stroke={isLight ? "#059669" : "#ec4899"}
              fill={isLight ? "#10b981" : "#ec4899"}
              fillOpacity={isLight ? 0.35 : 0.4}
            />
            {/* Company Target Bar Radar */}
            <Radar
              name={`${companyName} Bar`}
              dataKey="companyBar"
              stroke={isLight ? "#d97706" : "#818cf8"}
              fill={isLight ? "#f59e0b" : "#6366f1"}
              fillOpacity={0.15}
              strokeDasharray="4 4"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
