"use client";

import React, { useState } from "react";
import { X, Copy, Check, Share2, Sparkles, Linkedin, Twitter } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  candidateName: string;
  companyName: string;
  matchScore: number;
}

export default function ShareReportModal({
  isOpen,
  onClose,
  reportId,
  candidateName,
  companyName,
  matchScore
}: ShareReportModalProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://reset-path-v01.vercel.app";
  const shareUrl = `${origin}/career/${reportId}`;

  const linkedInText = `Just evaluated my GitHub engineering profile against ${companyName}'s hiring bar on Reset Path — got a ${matchScore}% compatibility score! 🚀 Check out my tailored project and interview defense roadmap:`;
  const twitterText = `Matched my GitHub projects with ${companyName} on Reset Path! Got ${matchScore}% compatibility score. Check it out:`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openLinkedIn = () => {
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
      `${linkedInText} ${shareUrl}`
    )}`;
    window.open(url, "_blank");
  };

  const openTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      twitterText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl border transition-all ${
          isLight
            ? "bg-white text-emerald-950 border-emerald-300 shadow-emerald-950/20"
            : "bg-slate-950 text-white border-purple-500/30 shadow-black/80"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-inherit">
          <div className="flex items-center gap-2">
            <Share2 className={`w-5 h-5 ${isLight ? "text-emerald-600" : "text-pink-400"}`} />
            <h3 className="text-lg font-bold tracking-tight">Share Your Match Report</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-all ${
              isLight ? "hover:bg-slate-100 text-slate-500" : "hover:bg-slate-800 text-slate-400"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Card */}
        <div
          className={`p-4 rounded-2xl border text-center space-y-2 ${
            isLight
              ? "bg-emerald-50/80 border-emerald-200"
              : "bg-slate-900 border-purple-500/30"
          }`}
        >
          <div className="text-3xl font-black gradient-text">{matchScore}% Match</div>
          <div className="text-xs font-semibold">
            {candidateName}&apos;s GitHub Mastery vs. {companyName}
          </div>
        </div>

        {/* Copyable Link */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Shareable Report Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border focus:outline-none ${
                isLight
                  ? "bg-slate-50 border-emerald-300 text-emerald-950"
                  : "bg-slate-900 border-slate-800 text-purple-300"
              }`}
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all ${
                copied
                  ? "bg-emerald-600 text-white"
                  : isLight
                  ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                  : "bg-purple-900/80 text-purple-200 hover:bg-purple-800"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1-Click Social Share
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={openLinkedIn}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-[#0A66C2] text-white hover:bg-[#004182] transition-all"
            >
              <Linkedin className="w-4 h-4" />
              <span>Share on LinkedIn</span>
            </button>

            <button
              onClick={openTwitter}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 text-white hover:bg-black border border-slate-700 transition-all"
            >
              <Twitter className="w-4 h-4" />
              <span>Share on X / Twitter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
