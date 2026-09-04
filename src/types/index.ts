/**
 * Shared TypeScript types for ResolveIQ.
 */

export interface ICustomer {
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
}

export type OrderStatus = "active" | "cancelled" | "delivered" | "refunded";
export type DeliveryStatus = "pending" | "shipped" | "delivered" | "failed";

export interface IOrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface IOrder {
  orderId: string;
  customerId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  cancelledAt: Date | null;
  deliveryStatus: DeliveryStatus;
  createdAt: Date;
}

export type PaymentStatus = "success" | "failed" | "pending";
export type PaymentMethod = "credit_card" | "upi" | "net_banking" | "wallet";
export type RefundStatus = "none" | "pending" | "refunded";

export interface IPayment {
  paymentId: string;
  orderId: string;
  customerId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionDate: Date;
  refundStatus: RefundStatus;
  refundAmount?: number;
  refundDate?: Date | null;
  refundReference?: string | null;
}

export type TicketCategory = "refund" | "delay" | "duplicate" | "general" | "unknown";
export type TicketPriority = "high" | "medium" | "low";
export type TicketStatus = "open" | "investigating" | "awaiting_approval" | "approved" | "rejected" | "escalated" | "resolved";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated";

export interface ITicket {
  ticketId: string;
  customerId: string;
  subject: string;
  message: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  aiInvestigation?: Record<string, any> | string; // Tool call trace or notes
  aiRecommendation?: string;
  confidence?: number;
  proposedAction?: string;
  approvalStatus?: ApprovalStatus;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPolicy {
  policyId: string;
  category: string;
  title: string;
  rules: string[]; // Simplest structured field for rules
  active: boolean;
}
