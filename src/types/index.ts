/**
 * Shared TypeScript types for ResolveIQ - Telecom Domain
 */

export interface ICustomer {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  serviceType: "broadband" | "mobile" | "both";
  accountStatus: "active" | "suspended" | "closed";
  createdAt: Date;
}

export type ConnectionStatus = "online" | "offline" | "intermittent";
export type BillingStatus = "current" | "overdue" | "suspended";

export interface IAccount {
  accountId: string;
  customerId: string;
  broadbandPlan?: string;
  mobilePlan?: string;
  billingStatus: BillingStatus;
  currentBill: number;
  outstandingAmount: number;
  dueDate: Date;
  connectionStatus: ConnectionStatus;
  mobileStatus: "active" | "inactive";
  serviceAddress: string;
  createdAt: Date;
}

export interface IPlan {
  planId: string;
  type: "broadband" | "mobile";
  name: string;
  price: number;
  dataLimit?: string;
  speed?: string;
}

export type TicketCategory = "BILLING" | "CONNECTION" | "PLAN" | "OTHER";
export type TicketPriority = "high" | "medium" | "low";
export type TicketStatus = "open" | "investigating" | "awaiting_approval" | "approved" | "rejected" | "escalated" | "resolved";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated" | "not_required";

export interface ITicket {
  ticketId: string;
  customerId: string;
  subject: string;
  message: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  
  // Investigation state
  aiInvestigation?: string; // Stringified JSON of the structured investigation
  aiRecommendation?: string;
  confidence?: number;
  proposedAction?: string;
  
  approvalStatus?: ApprovalStatus;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupportArticle {
  articleId: string;
  title: string;
  category: TicketCategory;
  content: string;
  sections: string[];
  applicableConditions: string[];
  resolutionSteps: string[];
  escalationConditions: string[];
}
