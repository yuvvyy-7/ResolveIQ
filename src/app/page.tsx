"use client";

import { useEffect, useState } from "react";
import { fetchTickets, fetchCustomer, runInvestigation, approveTicketAction } from "../lib/api-client";
import { Header } from "../components/Header";
import { TicketQueue } from "../components/TicketQueue";
import { CaseWorkspace } from "../components/CaseWorkspace";
import { AIResolutionPanel } from "../components/AIResolutionPanel";

export default function Dashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [account, setAccount] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeInvestigation, setActiveInvestigation] = useState<any | null>(null);
  const [activeTrace, setActiveTrace] = useState<any[]>([]);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (activeTicket) {
      loadContext(activeTicket);
      setActiveInvestigation(null);
      setActiveTrace([]);
      setError(null);
    }
  }, [activeTicket?.ticketId]);

  async function loadTickets() {
    try {
      setLoading(true);
      const data = await fetchTickets();
      setTickets(data);
      const initialTicket = data.find((t: any) => t.ticketId === "TICK-001") || data[0];
      if (initialTicket && !activeTicket) {
        setActiveTicket(initialTicket);
      }
    } catch (err: any) {
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }

  async function loadContext(ticket: any) {
    try {
      const custData = await fetchCustomer(ticket.customerId);
      setCustomer(custData);
      
      const res = await fetch(`/api/accounts/${ticket.customerId}`);
      const accData = await res.json();
      setAccount(accData.account);
    } catch (err) {
      console.error("Failed to load context", err);
    }
  }

  async function handleInvestigate() {
    if (!activeTicket) return;
    try {
      setInvestigating(true);
      setError(null);
      const res = await runInvestigation(activeTicket.ticketId);

      setActiveInvestigation(res.investigation);
      setActiveTrace(res.trace || []);
      
      setTickets(prev => prev.map(t => 
        t.ticketId === activeTicket.ticketId 
          ? { ...t, ...res.investigation, approvalStatus: res.approvalStatus, status: res.approvalStatus === "pending" ? "awaiting_approval" : "resolved" } 
          : t
      ));
      
      setActiveTicket((prev: any) => ({
        ...prev,
        ...res.investigation,
        approvalStatus: res.approvalStatus,
        status: res.approvalStatus === "pending" ? "awaiting_approval" : "resolved"
      }));

    } catch (err: any) {
      setError(err.message || "AI investigation is temporarily unavailable. Please try again later.");
    } finally {
      setInvestigating(false);
    }
  }

  async function handleApproval(approved: boolean) {
    if (!activeTicket) return;
    try {
      setApproving(true);
      setError(null);
      
      await approveTicketAction(activeTicket.ticketId, approved);
      
      const updatedData = await fetchTickets();
      setTickets(updatedData);
      
      const updatedTicket = updatedData.find((t: any) => t.ticketId === activeTicket.ticketId);
      if (updatedTicket) {
        setActiveTicket(updatedTicket);
      }
      
    } catch (err: any) {
      setError(err.message || "Approval action failed.");
    } finally {
      setApproving(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <TicketQueue 
          tickets={tickets} 
          activeTicket={activeTicket} 
          setActiveTicket={setActiveTicket} 
          loading={loading} 
        />
        
        <div className="flex-1 flex flex-col min-w-0 bg-[#09090b] relative">
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-3 bg-red-950 border border-red-900/50 rounded text-red-200 text-sm shadow-lg">
              <span>{error}</span>
            </div>
          )}
          
          <CaseWorkspace 
            ticket={activeTicket} 
            customer={customer} 
            account={account}
          />
        </div>

        <AIResolutionPanel 
          ticket={activeTicket}
          investigating={investigating}
          approving={approving}
          activeInvestigation={activeInvestigation}
          activeTrace={activeTrace}
          onInvestigate={handleInvestigate}
          onApprove={handleApproval}
        />
      </div>
    </div>
  );
}
