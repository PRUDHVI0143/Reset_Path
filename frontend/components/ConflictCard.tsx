"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";

interface ConflictProps {
  reason: string;
  resolutionNote?: string;
}

export default function ConflictCard({ reason, resolutionNote }: ConflictProps) {
  return (
    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-amber-300 text-sm">Flagged Evidence Conflict</h4>
          <p className="text-xs text-amber-100/90 leading-relaxed font-mono">{reason}</p>
          
          {resolutionNote && (
            <div className="pt-2 border-t border-amber-500/20 flex items-start gap-2 text-xs text-amber-200/80">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-300">Resolution Note: </span>
                {resolutionNote}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
