"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Search, ArrowRight, Clock, CheckCircle2, Loader2, AlertCircle, Filter } from "lucide-react";
import { fetchResearchHistory } from "@/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchResearchHistory()
      .then((data) => setHistory(data))
      .catch((e) => console.error("Error loading history", e))
      .finally(() => setLoading(false));
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesQuery = item.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Research History</h1>
            <p className="text-xs text-slate-400">View and export past research projects</p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past questions..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          {['all', 'completed', 'running', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${filter === st ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* History Items */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
          <p className="text-sm">Loading research history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-2xl border border-white/10 space-y-3">
          <Clock className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Research Found</h3>
          <p className="text-xs text-slate-400">Try starting a new research prompt on the home page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(item.status === 'completed' ? `/report/${item.id}` : `/dashboard/${item.id}`)}
              className="p-5 rounded-2xl glass-card flex items-center justify-between cursor-pointer hover:border-indigo-500/50"
            >
              <div className="space-y-2 max-w-2xl">
                <h3 className="font-bold text-white text-base hover:text-indigo-300 transition-colors">
                  {item.question}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                  <span>Sources: {item.sources_count}</span>
                  <span>Claims: {item.claims_count} (Verified: {item.verified_claims_count})</span>
                  <span>Conflicts: {item.conflicts_count}</span>
                  <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  {item.status}
                </span>
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
