"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchTicketStats } from "../lib/api-client";
import {
  BarChart2, TrendingUp, Clock, CheckCircle2,
  AlertTriangle, Inbox, ArrowUpRight, RefreshCw
} from "lucide-react";

interface Stats {
  total: number;
  open: number;
  investigating: number;
  awaiting_approval: number;
  resolved: number;
  escalated: number;
  rejected: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  resolutionRate: number;
}

interface RecentActivity {
  ticketId: string;
  subject: string;
  status: string;
  customerId: string;
  category: string;
  updatedAt: string;
}

function StatCard({
  label, value, icon: Icon, color, delay
}: {
  label: string; value: number; icon: any; color: string; delay: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-white/[0.03] border border-white/[0.07] rounded-lg p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-500 uppercase tracking-widest">{label}</span>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${color}`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <span className="text-[32px] font-bold text-zinc-100 tabular-nums leading-none">{display}</span>
    </motion.div>
  );
}

function CategoryBar({ label, value, max, color, delay }: {
  label: string; value: number; max: number; color: string; delay: number;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3"
    >
      <span className="text-[12px] text-zinc-400 w-24 shrink-0 font-medium">{label}</span>
      <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: delay + 0.1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-[12px] font-bold text-zinc-300 w-6 text-right tabular-nums">{value}</span>
    </motion.div>
  );
}

function ResolutionRing({ rate }: { rate: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(rate), 200);
    return () => clearTimeout(timer);
  }, [rate]);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke="rgb(99,102,241)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (circ * progress) / 100}
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="16" fontWeight="700">
          {progress}%
        </text>
      </svg>
      <span className="text-[12px] text-zinc-500 uppercase tracking-widest">Resolution Rate</span>
    </div>
  );
}

export function AnalyticsView() {
  const [data, setData] = useState<{ stats: Stats; recentActivity: RecentActivity[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await fetchTicketStats();
      setData(result);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600">
        <div className="flex flex-col items-center gap-3">
          <BarChart2 className="w-8 h-8 animate-pulse" />
          <span className="text-[13px]">Loading analytics…</span>
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { stats, recentActivity } = data;
  const maxCategory = Math.max(...Object.values(stats.byCategory || {}), 1);

  const statusMap = [
    { label: "Open", value: stats.open, icon: Inbox, color: "bg-indigo-500" },
    { label: "Investigating", value: stats.investigating, icon: Clock, color: "bg-amber-500" },
    { label: "Awaiting Approval", value: stats.awaiting_approval, icon: AlertTriangle, color: "bg-orange-500" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "bg-emerald-500" },
    { label: "Escalated", value: stats.escalated, icon: ArrowUpRight, color: "bg-rose-500" },
  ];

  const categoryColors: Record<string, string> = {
    BILLING: "bg-indigo-500",
    CONNECTION: "bg-amber-500",
    PLAN: "bg-emerald-500",
    OTHER: "bg-zinc-500",
  };

  const priorityColors: Record<string, string> = {
    high: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };

  const statusBadge: Record<string, string> = {
    resolved: "text-emerald-400",
    escalated: "text-rose-400",
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-zinc-100">Operations Analytics</h2>
          <p className="text-[13px] text-zinc-500 mt-0.5">Live data from MongoDB · {stats.total} total tickets</p>
        </div>
        <button
          onClick={() => load(true)}
          className={`flex items-center gap-2 px-3 py-1.5 text-[12px] text-zinc-400 border border-white/[0.07] rounded-md hover:text-zinc-100 hover:bg-white/[0.03] transition-colors ${refreshing ? "opacity-50" : ""}`}
          disabled={refreshing}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4">
        {statusMap.map((s, i) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} delay={i * 0.06} />
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-lg p-6 space-y-5">
          <h3 className="text-[13px] font-semibold text-zinc-300 uppercase tracking-widest">Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.byCategory || {}).map(([cat, count], i) => (
              <CategoryBar
                key={cat}
                label={cat}
                value={count as number}
                max={maxCategory}
                color={categoryColors[cat] || "bg-zinc-500"}
                delay={i * 0.08}
              />
            ))}
          </div>

          <div className="pt-4 border-t border-white/[0.05] flex items-center gap-3">
            <span className="text-[12px] text-zinc-500 uppercase tracking-widest">Priority</span>
            <div className="flex gap-2">
              {["high", "medium", "low"].map(p => (
                <span key={p} className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${priorityColors[p] || ""}`}>
                  {p.toUpperCase()} · {stats.byPriority?.[p] || 0}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Resolution Ring */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-lg p-6 flex items-center justify-center">
            <ResolutionRing rate={stats.resolutionRate} />
          </div>

          {/* Recent Activity */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-lg p-4 space-y-3">
            <h3 className="text-[12px] font-semibold text-zinc-500 uppercase tracking-widest">Recent Activity</h3>
            {recentActivity.length === 0 && (
              <p className="text-[12px] text-zinc-600">No resolved or escalated tickets yet.</p>
            )}
            {recentActivity.map((t, i) => (
              <motion.div
                key={t.ticketId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-[12px] text-zinc-300 truncate font-medium">{t.subject}</p>
                  <p className="text-[11px] text-zinc-600">{t.ticketId} · {t.customerId}</p>
                </div>
                <span className={`text-[11px] font-bold shrink-0 ${statusBadge[t.status] || "text-zinc-400"}`}>
                  {t.status.toUpperCase()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
