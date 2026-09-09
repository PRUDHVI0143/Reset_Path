"use client";

import { useState } from "react";
import { Download, FileText, FileCode, File, Loader2 } from "lucide-react";
import { exportReport } from "@/lib/api";

interface ExportModalProps {
  researchId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ researchId, isOpen, onClose }: ExportModalProps) {
  const [loadingFormat, setLoadingFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (format: 'pdf' | 'docx' | 'markdown') => {
    try {
      setLoadingFormat(format);
      await exportReport(researchId, format);
    } catch (e) {
      alert("Failed to export report. Please try again.");
    } finally {
      setLoadingFormat(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Export Research Report</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleExport('pdf')}
            disabled={loadingFormat !== null}
            className="w-full p-4 rounded-xl glass-card flex items-center justify-between hover:border-indigo-500/50 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">PDF Document</h4>
                <p className="text-xs text-slate-400">Formatted styled report with data tables</p>
              </div>
            </div>
            {loadingFormat === 'pdf' ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400" /> : <Download className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => handleExport('docx')}
            disabled={loadingFormat !== null}
            className="w-full p-4 rounded-xl glass-card flex items-center justify-between hover:border-indigo-500/50 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <File className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Word Document (.docx)</h4>
                <p className="text-xs text-slate-400">Editable Microsoft Word format</p>
              </div>
            </div>
            {loadingFormat === 'docx' ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400" /> : <Download className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => handleExport('markdown')}
            disabled={loadingFormat !== null}
            className="w-full p-4 rounded-xl glass-card flex items-center justify-between hover:border-indigo-500/50 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Markdown Document (.md)</h4>
                <p className="text-xs text-slate-400">Raw markdown with embedded source links</p>
              </div>
            </div>
            {loadingFormat === 'markdown' ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400" /> : <Download className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>
    </div>
  );
}
