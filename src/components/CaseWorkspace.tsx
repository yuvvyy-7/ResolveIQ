import { User, Mail, MessageSquare, Network, CreditCard } from "lucide-react";

interface CaseWorkspaceProps {
  ticket: any | null;
  customer: any | null;
  account: any | null;
}

export function CaseWorkspace({ ticket, customer, account }: CaseWorkspaceProps) {
  if (!ticket) {
    return (
      <main className="flex-1 overflow-y-auto flex items-center justify-center p-8 bg-[#09090b]">
        <p className="text-sm font-medium text-zinc-600">Select a case from the inbox</p>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto flex flex-col bg-[#09090b]">
      
      {/* Top Header */}
      <div className="px-10 pt-10 pb-8 border-b border-white/[0.07]">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
            {ticket.ticketId}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
          <span className={`text-[11px] font-bold uppercase tracking-widest ${ticket.priority === 'high' ? 'text-red-400' : ticket.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
            {ticket.priority} PRIORITY
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            {ticket.status === 'resolved' ? 'RESOLVED' : ticket.status === 'escalated' ? 'ESCALATED' : 'OPEN'}
          </span>
        </div>
        
        <h2 className="text-3xl font-bold text-zinc-100 tracking-tight leading-tight mb-8">
          {ticket.subject}
        </h2>
        
        {customer && (
          <div className="flex items-center gap-4 text-[13px]">
            <div className="w-8 h-8 rounded bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-zinc-400 font-bold uppercase">
              {customer.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-zinc-200">{customer.name}</p>
              <a href={`mailto:${customer.email}`} className="text-indigo-400 hover:underline">{customer.email}</a>
            </div>
            <div className="ml-auto text-[11px] font-mono text-zinc-500 flex flex-col items-end">
              <span>ID: {customer.customerId}</span>
              <span className="text-zinc-400">Type: {customer.serviceType}</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-10 py-10 max-w-4xl flex flex-col gap-10">
        
        {/* Message Block */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Customer Message</h3>
          </div>
          <div className="text-[15px] leading-relaxed text-zinc-300 bg-white/[0.02] border border-white/[0.05] p-5 rounded">
            &quot;{ticket.message}&quot;
          </div>
        </section>

        {/* Structured Context */}
        {account && (
          <div className="grid grid-cols-2 gap-8">
            <section className="pt-2 border-t border-white/[0.07]">
              <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Network className="w-3.5 h-3.5" /> Services
              </h3>
              <div className="space-y-3">
                {account.broadbandPlan && (
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-0.5">Broadband Plan</p>
                    <p className="text-[13px] font-mono font-bold text-zinc-200">{account.broadbandPlan}</p>
                    <p className={`text-[12px] font-bold mt-1 uppercase tracking-wider ${account.connectionStatus === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {account.connectionStatus}
                    </p>
                  </div>
                )}
                {account.mobilePlan && (
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-0.5 mt-2">Mobile Plan</p>
                    <p className="text-[13px] font-mono font-bold text-zinc-200">{account.mobilePlan}</p>
                    <p className={`text-[12px] font-bold mt-1 uppercase tracking-wider ${account.mobileStatus === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {account.mobileStatus}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="pt-2 border-t border-white/[0.07]">
              <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" /> Billing
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-0.5">Current Bill</p>
                  <p className="text-[13px] font-bold text-zinc-200">₹{account.currentBill}</p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-0.5">Status</p>
                  <p className={`text-[12px] font-bold uppercase tracking-wider ${account.billingStatus === 'current' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {account.billingStatus}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        <section className="pt-6 border-t border-white/[0.07]">
          <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Customer History</h3>
          <p className="text-[13px] font-medium text-zinc-400">Previous tickets available to AI agent.</p>
        </section>
        
      </div>
    </main>
  );
}
