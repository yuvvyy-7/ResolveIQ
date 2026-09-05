import { Search, Filter, CircleAlert, Circle, CheckCircle2, Clock, RefreshCw } from "lucide-react";

interface TicketQueueProps {
  tickets: any[];
  activeTicket: any;
  setActiveTicket: (ticket: any) => void;
  loading: boolean;
}

function PriorityIndicator({ priority }: { priority: string }) {
  if (priority === "high") return <span className="w-2 h-2 rounded-full bg-red-500 block" />;
  if (priority === "medium") return <span className="w-2 h-2 rounded-full bg-amber-500 block" />;
  return <span className="w-2 h-2 rounded-full bg-emerald-500 block" />;
}

export function TicketQueue({ tickets, activeTicket, setActiveTicket, loading }: TicketQueueProps) {
  return (
    <aside className="w-[280px] bg-[#0b0b0f] border-r border-white/[0.07] flex flex-col shrink-0">
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.07]">
        <h2 className="text-[12px] font-bold text-zinc-100 uppercase tracking-widest mb-3">INBOX</h2>
        
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
          <input 
            type="text" 
            placeholder="Search tickets" 
            className="w-full bg-white/[0.03] border border-white/[0.07] rounded text-[12px] pl-8 pr-3 py-1.5 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        <div className="flex gap-4 text-[12px] font-medium text-zinc-500">
          <span className="text-zinc-100 cursor-pointer">All</span>
          <span className="hover:text-zinc-300 cursor-pointer">Open</span>
          <span className="hover:text-zinc-300 cursor-pointer">Closed</span>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-zinc-600 text-xs flex justify-center items-center gap-2">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Loading...
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {tickets.map(t => {
            const isActive = activeTicket?.ticketId === t.ticketId;
            return (
              <li 
                key={t.ticketId}
                onClick={() => setActiveTicket(t)}
                className={`group px-4 py-3 border-b border-white/[0.03] cursor-pointer transition-colors relative ${isActive ? 'bg-indigo-500/[0.03]' : 'hover:bg-white/[0.01]'}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                )}
                
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-mono font-bold ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`}>
                      {t.ticketId}
                    </span>
                    <PriorityIndicator priority={t.priority} />
                  </div>
                  
                  <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">
                    {t.status === 'resolved' ? 'RESOLVED' : t.approvalStatus === 'pending' ? 'PENDING' : 'OPEN'}
                  </span>
                </div>
                
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-0.5 ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {t.category}
                </p>
                <h3 className={`text-[13px] font-medium leading-snug mb-1 truncate ${isActive ? 'text-zinc-100' : 'text-zinc-300'}`}>
                  {t.subject}
                </h3>
                <p className="text-[11px] text-zinc-500 truncate">
                  {t.customerId}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
