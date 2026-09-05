export async function fetchTickets() {
  const res = await fetch("/api/tickets");
  if (!res.ok) throw new Error("Failed to load tickets");
  const data = await res.json();
  return data.tickets || [];
}

export async function fetchCustomer(id: string) {
  const res = await fetch(`/api/customers/${id}`);
  if (!res.ok) throw new Error("Failed to load customer");
  const data = await res.json();
  return data.customer || null;
}

// Removed obsolete fetchOrder, fetchPayment, fetchPaymentsByOrder

export async function runInvestigation(ticketId: string) {
  const res = await fetch("/api/agent/investigate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Investigation failed");
  return data;
}

export async function approveTicketAction(ticketId: string, approved: boolean) {
  const res = await fetch(`/api/tickets/${ticketId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Approval failed");
  return data;
}
