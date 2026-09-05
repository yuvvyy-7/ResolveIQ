"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { createTicket } from "../lib/api-client";

const CATEGORIES = ["BILLING", "CONNECTION", "PLAN", "OTHER"] as const;
const PRIORITIES = ["high", "medium", "low"] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NewTicketModal({ isOpen, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    customerId: "",
    subject: "",
    message: "",
    category: "BILLING",
    priority: "medium",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function reset() {
    setForm({ customerId: "", subject: "", message: "", category: "BILLING", priority: "medium" });
    setError(null);
    setSuccess(false);
    setSubmitting(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createTicket(form);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onCreated();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all";
  const labelClass = "block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[440px] bg-[#0c0c11] border-l border-white/[0.07] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <h2 className="text-[14px] font-semibold text-zinc-100">New Support Ticket</h2>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <div>
                <label className={labelClass}>Customer ID *</label>
                <input
                  className={inputClass}
                  placeholder="e.g. CUST-001"
                  value={form.customerId}
                  onChange={e => setForm(f => ({ ...f, customerId: e.target.value.toUpperCase() }))}
                  required
                />
                <p className="text-[11px] text-zinc-600 mt-1">Must match an existing customer in the database</p>
              </div>

              <div>
                <label className={labelClass}>Subject *</label>
                <input
                  className={inputClass}
                  placeholder="Brief description of the issue"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  required
                  maxLength={120}
                />
              </div>

              <div>
                <label className={labelClass}>Message *</label>
                <textarea
                  className={`${inputClass} resize-none h-32`}
                  placeholder="Describe the customer's issue in detail…"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    className={inputClass}
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Priority</label>
                  <select
                    className={inputClass}
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-md"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <p className="text-[13px] text-rose-300">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-[13px] text-emerald-300">Ticket created successfully!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.07] flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2 text-[13px] font-semibold text-zinc-400 border border-white/[0.07] rounded-md hover:bg-white/[0.03] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting || success}
                className="flex-1 py-2 text-[13px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {submitting ? "Creating…" : "Create Ticket"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
