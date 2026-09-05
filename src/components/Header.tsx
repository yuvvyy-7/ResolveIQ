import { Search, RefreshCw, LayoutGrid, Inbox, BarChart2, Settings2 } from "lucide-react";

type View = "inbox" | "analytics";

interface HeaderProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onRefresh: () => void;
  inboxCount: number;
}

export function Header({ activeView, onViewChange, onRefresh, inboxCount }: HeaderProps) {
  const navBtn = (view: View, label: string, Icon: any, count?: number) => {
    const active = activeView === view;
    return (
      <button
        onClick={() => onViewChange(view)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
          active
            ? "bg-white/[0.07] text-zinc-100 border border-white/[0.07]"
            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
        {count !== undefined && count > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] ml-1">
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <header className="flex items-center justify-between px-5 h-[60px] bg-[#09090b] border-b border-white/[0.07] shrink-0">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-[15px] text-zinc-100 tracking-tight flex items-center gap-2">
            ResolveIQ
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-white/[0.05] border border-white/[0.07] text-zinc-400">
              v2.0
            </span>
          </h1>
        </div>

        <nav className="flex items-center gap-1">
          {navBtn("inbox", "Inbox", Inbox, inboxCount)}
          {navBtn("analytics", "Analytics", BarChart2)}
          <button className="flex items-center gap-2 px-3 py-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] rounded-md text-[13px] font-medium transition-colors">
            <Settings2 className="w-4 h-4" />
            Settings
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[12px] font-bold text-emerald-400/90 tracking-wide">12 agents online</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          <button className="w-8 h-8 flex items-center justify-center hover:text-zinc-100 hover:bg-white/[0.05] rounded-md transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onRefresh}
            className="w-8 h-8 flex items-center justify-center hover:text-zinc-100 hover:bg-white/[0.05] rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
