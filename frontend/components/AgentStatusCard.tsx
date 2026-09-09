"use client";

import { CheckCircle2, Loader2, Circle, AlertCircle, Sparkles } from "lucide-react";

interface AgentProps {
  name: string;
  role: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  detail?: string;
  icon?: any;
}

export default function AgentStatusCard({ name, role, status, detail, icon: Icon }: AgentProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
        );
      case 'in_progress':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Active</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Circle className="w-3.5 h-3.5" />
            <span>Queued</span>
          </div>
        );
    }
  };

  return (
    <div className={`p-4 rounded-xl glass-card transition-all ${status === 'in_progress' ? 'ring-2 ring-indigo-500/50 bg-indigo-950/20' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-white text-sm">{name}</h4>
            <p className="text-xs text-slate-400">{role}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {detail && (
        <p className="mt-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 font-mono">
          {detail}
        </p>
      )}
    </div>
  );
}
