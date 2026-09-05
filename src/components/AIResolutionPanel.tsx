import { Sparkles, Check, ChevronRight, FileText, AlertTriangle, Info, BookOpen, User, Ticket } from "lucide-react";

interface AIResolutionPanelProps {
  ticket: any | null;
  investigating: boolean;
  approving: boolean;
  activeInvestigation: any | null;
  activeTrace: any[];
  onInvestigate: () => void;
  onApprove: (approved: boolean) => void;
}

export function AIResolutionPanel({
  ticket,
  investigating,
  approving,
  activeInvestigation,
  activeTrace,
  onInvestigate,
  onApprove
}: AIResolutionPanelProps) {

  if (!ticket) {
    return (
      <aside className="w-[400px] bg-[#0c0c11] border-l border-white/[0.07] shrink-0"></aside>
    );
  }

  // Parse evidence properly
  let investigationData = activeInvestigation;
  if (!investigationData && ticket.aiInvestigation) {
    try {
      // The backend now stores the FULL investigation object in aiInvestigation
      investigationData = JSON.parse(ticket.aiInvestigation);
    } catch (e) {
      investigationData = null;
    }
  }

  const displayApprovalStatus = ticket.approvalStatus;

  // Determine state logic
  const isResolved = ticket.status === "resolved";
  const isEscalated = ticket.status === "escalated";
  const isRejected = displayApprovalStatus === "rejected";
  const isPending = displayApprovalStatus === "pending";

  const decision = investigationData?.decision;

  const renderEvidenceIcon = (type: string) => {
    switch (type) {
      case "ACCOUNT": return <User className="w-3.5 h-3.5 text-zinc-400" />;
      case "ARTICLE": return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />;
      case "TICKET": return <Ticket className="w-3.5 h-3.5 text-zinc-400" />;
      default: return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <aside className="w-[400px] bg-[#0c0c11] border-l border-white/[0.07] flex flex-col shrink-0 relative overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.07] bg-[#0c0c11] flex justify-between items-start">
        <div>
          <h2 className="text-[12px] font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            RESOLUTION ENGINE
          </h2>
          <p className="text-[11px] font-medium text-zinc-500">ResolveIQ Telecom Agent</p>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.07]">
          {investigating ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">WORKING</span>
            </>
          ) : investigationData ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">COMPLETE</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">READY</span>
            </>
          )}
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1">

        {/* IDLE */}
        {!investigationData && !investigating && !isResolved && !isEscalated && (
          <div className="pt-4">
            <h3 className="text-[14px] font-bold text-zinc-200 mb-2">Agent standing by</h3>
            <p className="text-[13px] text-zinc-500 mb-8 leading-relaxed">
              Ready to investigate this case. The agent will inspect the customer account, network status, and support knowledge base.
            </p>
            <button
              onClick={onInvestigate}
              className="w-full py-2.5 bg-indigo-600 text-white text-[13px] font-bold rounded shadow-sm hover:bg-indigo-500 transition-colors"
            >
              RUN INVESTIGATION
            </button>
          </div>
        )}

        {/* INVESTIGATING */}
        {investigating && (
          <div className="pt-4">
            <h3 className="text-[14px] font-bold text-zinc-200 mb-6">Investigating case...</h3>

            <div className="mb-4">
              <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">INVESTIGATION TRACE</h4>
              <ul className="space-y-2 font-mono text-[11px] text-zinc-400">
                <li className="flex items-center gap-2 text-emerald-500">
                  <Check className="w-3.5 h-3.5" /> Loaded customer account
                </li>
                <li className="flex items-center gap-2 text-emerald-500">
                  <Check className="w-3.5 h-3.5" /> Checked billing & connection status
                </li>
                <li className="flex items-center gap-2 text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-1 mr-0.5 animate-pulse"></span> Searching support articles
                </li>
                <li className="flex items-center gap-2 text-zinc-600">
                  <span className="w-1 h-1 rounded-full bg-zinc-600 ml-1.5 mr-1"></span> Validating resolution
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* AFTER INVESTIGATION */}
        {investigationData && !investigating && (
          <div className="flex flex-col gap-6 pt-2">

            {/* Status Headers */}
            {isResolved ? (
              <div>
                <h3 className="text-[14px] font-bold text-emerald-400 flex items-center gap-2 mb-4">
                  ✓ RESOLUTION COMPLETE
                </h3>
                <div className="text-[13px] text-zinc-300 bg-white/[0.02] border border-emerald-500/20 p-4 rounded mb-6">
                  {ticket.resolution}
                </div>
              </div>
            ) : isEscalated ? (
              <div>
                <h3 className="text-[14px] font-bold text-rose-400 flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4" /> TICKET ESCALATED
                </h3>
                <div className="text-[13px] text-zinc-300 bg-rose-500/10 border border-rose-500/20 p-4 rounded mb-6">
                  {ticket.resolution}
                </div>
              </div>
            ) : isRejected ? (
              <div>
                <h3 className="text-[14px] font-bold text-rose-400 mb-2">ACTION REJECTED</h3>
                <p className="text-[13px] text-rose-300/80 p-4 bg-rose-500/10 border border-rose-500/20 rounded">
                  Recommendation rejected. The case remains open for manual follow-up.
                </p>
              </div>
            ) : null}

            {/* Evidence Block */}
            {investigationData.evidence && investigationData.evidence.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">EVIDENCE</h4>
                <div className="space-y-3">
                  {investigationData.evidence.map((ev: any, i: number) => (
                    <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {renderEvidenceIcon(ev.sourceType)}
                        <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase">{ev.sourceType}</span>
                        <span className="text-[11px] font-mono text-zinc-500">{ev.sourceId}</span>
                      </div>
                      <p className="text-[13px] font-semibold text-zinc-200 mb-1">{ev.citation}</p>
                      <p className="text-[12px] text-zinc-400 italic">"{ev.excerpt}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation (Only if pending) */}
            {isPending && (
              <div className="pt-2">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">AI DECISION</h4>

                {/* Visual State Card based on Decision */}
                {decision === "RESOLVE" && (
                  <div className="mb-6">
                    <p className="text-[16px] font-bold text-emerald-400 mb-2">RESOLVE</p>
                    <p className="text-[13px] text-zinc-300 mb-4">{investigationData.recommendation}</p>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-4">
                      <h4 className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-2">DRAFT RESPONSE</h4>
                      <p className="text-[13px] text-emerald-100/90 leading-relaxed">
                        {investigationData.draftResponse}
                      </p>
                    </div>
                  </div>
                )}

                {decision === "ASK_FOR_INFORMATION" && (
                  <div className="mb-6">
                    <p className="text-[16px] font-bold text-amber-400 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" /> INFORMATION REQUIRED
                    </p>
                    <p className="text-[13px] text-zinc-300 mb-4">{investigationData.recommendation}</p>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded p-4 mb-4">
                      <h4 className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mb-2">MISSING INFORMATION</h4>
                      <ul className="list-disc pl-4 space-y-1 text-[13px] text-amber-200/90">
                        {investigationData.missingInformation?.map((info: string, i: number) => (
                          <li key={i}>{info}</li>
                        ))}
                      </ul>
                    </div>

                    {investigationData.draftResponse && (
                      <div className="bg-white/[0.03] border border-white/[0.05] rounded p-4">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">DRAFT REQUEST</h4>
                        <p className="text-[13px] text-zinc-300 leading-relaxed">
                          {investigationData.draftResponse}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {decision === "ESCALATE" && investigationData.escalation && (
                  <div className="mb-6">
                    <p className="text-[16px] font-bold text-rose-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> ESCALATION REQUIRED
                    </p>

                    <div className="bg-rose-500/10 border border-rose-500/20 rounded p-4">
                      <p className="text-[13px] font-bold text-rose-200 mb-4">{investigationData.escalation.summary}</p>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-[10px] font-bold text-rose-400/70 uppercase tracking-widest mb-1.5">ESTABLISHED FACTS</h4>
                          <ul className="list-disc pl-4 space-y-1 text-[12px] text-rose-100/80">
                            {investigationData.escalation.establishedFacts.map((f: string, i: number) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-bold text-rose-400/70 uppercase tracking-widest mb-1.5">ATTEMPTED STEPS</h4>
                          <ul className="list-disc pl-4 space-y-1 text-[12px] text-rose-100/80">
                            {investigationData.escalation.attemptedSteps.map((f: string, i: number) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-bold text-rose-400/70 uppercase tracking-widest mb-1.5">UNKNOWNS</h4>
                          <ul className="list-disc pl-4 space-y-1 text-[12px] text-rose-100/80">
                            {investigationData.escalation.unknowns.map((f: string, i: number) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {investigationData.confidence !== undefined && (
                  <div className="mb-6">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5">
                      <span>Confidence</span>
                      <span className="text-zinc-300">{investigationData.confidence > 0.9 ? 'HIGH' : 'MEDIUM'}</span>
                    </div>
                    <div className="h-1 bg-white/[0.07] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${investigationData.confidence * 100}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 border-t border-white/[0.07] pt-6">
                  <button
                    disabled={approving}
                    onClick={() => onApprove(true)}
                    className={`w-full py-2.5 text-white text-[13px] font-bold rounded shadow-sm transition-colors disabled:opacity-50
                      ${decision === "RESOLVE" ? "bg-emerald-600 hover:bg-emerald-500" :
                        decision === "ASK_FOR_INFORMATION" ? "bg-amber-600 hover:bg-amber-500" :
                          "bg-rose-600 hover:bg-rose-500"}
                    `}
                  >
                    {approving ? "EXECUTING..." :
                      decision === "RESOLVE" ? "APPROVE & SEND" :
                        decision === "ASK_FOR_INFORMATION" ? "APPROVE & ASK CUSTOMER" :
                          "CONFIRM ESCALATION"}
                  </button>
                  <button
                    disabled={approving}
                    onClick={() => onApprove(false)}
                    className="w-full py-2 bg-white/[0.02] text-zinc-300 border border-white/[0.07] text-[13px] font-bold rounded hover:bg-white/[0.05] transition-colors disabled:opacity-50"
                  >
                    REJECT
                  </button>
                </div>
              </div>
            )}

            {/* Trace at bottom */}
            {activeTrace.length > 0 && (
              <div className="pt-6 border-t border-white/[0.07]">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                  RAW TOOL TRACE
                </h4>
                <ul className="space-y-1.5 font-mono text-[11px] text-zinc-400">
                  {activeTrace.map((t, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-white/[0.02] px-3 py-1.5 rounded">
                      <span className="text-zinc-300 truncate mr-2">{t.tool}</span>
                      {t.success ? <span className="text-emerald-500 shrink-0">✓</span> : <span className="text-rose-500 shrink-0">✗</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}
      </div>
    </aside>
  );
}
