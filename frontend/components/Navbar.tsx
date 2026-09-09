"use client";

import Link from "next/link";
import { Sparkles, Briefcase, Sun, Moon, Compass } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <nav className="themed-nav sticky top-0 z-50 border-b px-6 py-3.5 flex items-center justify-between">
      {/* Logo: Reset Path */}
      <Link href="/" className="flex items-center gap-3 group">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-105 ${
            isLight
              ? "bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-500 shadow-emerald-500/25"
              : "bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-500 shadow-pink-500/25"
          }`}
        >
          <Compass className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight gradient-text">
            Reset Path
          </span>
          <span
            className={`block text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 ${
              isLight ? "text-emerald-800" : "text-gray-300"
            }`}
          >
            GitHub Career &amp; Interview AI
          </span>
        </div>
      </Link>

      {/* Nav links + Theme Toggle */}
      <div className="flex items-center gap-5 text-sm font-medium">
        <Link
          href="/"
          className={`flex items-center gap-1.5 transition-colors ${
            isLight
              ? "text-emerald-900 hover:text-emerald-700"
              : "text-gray-200 hover:text-white"
          }`}
        >
          <Sparkles
            className={`w-4 h-4 ${isLight ? "text-emerald-600" : "text-pink-400"}`}
          />
          <span className={`font-bold ${isLight ? "text-emerald-900" : "text-pink-300"}`}>
            Rebuild CV
          </span>
        </Link>

        <Link
          href="/career"
          className={`flex items-center gap-1.5 transition-colors ${
            isLight
              ? "text-emerald-900 hover:text-emerald-700"
              : "text-gray-200 hover:text-white"
          }`}
        >
          <Briefcase
            className={`w-4 h-4 ${isLight ? "text-teal-600" : "text-indigo-400"}`}
          />
          <span className={`font-semibold ${isLight ? "text-emerald-900" : "text-slate-300"}`}>
            Interview Prep
          </span>
        </Link>

        {/* ── Theme Toggle (Day / Night) ── */}
        <button
          onClick={toggleTheme}
          className="theme-toggle shadow-md"
          title={isLight ? "Switch to Night Mode" : "Switch to Day Mode"}
        >
          {isLight ? (
            <>
              <Moon className="w-4 h-4 text-emerald-800" />
              <span className="font-bold text-emerald-950">Night Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Day Mode</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
