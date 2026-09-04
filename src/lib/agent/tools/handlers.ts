import { Customer, Order, Payment, Ticket, Policy } from "../../db/models";

export async function getCustomer({ customerId }: { customerId: string }) {
  const customer = await Customer.findOne({ customerId }).lean();
  if (!customer) return { error: "Customer not found" };
  return { customer };
}

export async function getOrder({ orderId }: { orderId: string }) {
  const order = await Order.findOne({ orderId }).lean();
  if (!order) return { error: "Order not found" };
  return { order };
}

export async function getPayment({ paymentId }: { paymentId: string }) {
  const payment = await Payment.findOne({ paymentId }).lean();
  if (!payment) return { error: "Payment not found" };
  return { payment };
}

export async function getPaymentsForOrder({ orderId }: { orderId: string }) {
  const payments = await Payment.find({ orderId }).lean();
  if (!payments || payments.length === 0) return { error: "No payments found for this order", payments: [] };
  return { payments };
}

export async function getPreviousTickets({ customerId, currentTicketId }: { customerId: string; currentTicketId?: string }) {
  const query: any = { customerId };
  if (currentTicketId) {
    query.ticketId = { $ne: currentTicketId };
  }
  const tickets = await Ticket.find(query).lean();
  return { tickets };
}

export async function checkRefundEligibility({ orderId, paymentId }: { orderId: string; paymentId: string }) {
  try {
    const order = await Order.findOne({ orderId }).lean();
    if (!order) return { eligible: false, reason: "Order not found", eligibleAmount: 0 };

    const payment = await Payment.findOne({ paymentId }).lean();
    if (!payment) return { eligible: false, reason: "Payment not found", eligibleAmount: 0 };

    if (payment.orderId !== order.orderId) {
      return { eligible: false, reason: "Payment does not belong to the specified order.", eligibleAmount: 0 };
    }

    if (payment.status !== "success") {
      return { eligible: false, reason: `Payment status is ${payment.status}, not success.`, eligibleAmount: 0 };
    }

    if (payment.refundStatus === "refunded") {
      return { eligible: false, reason: `Payment ${payment.paymentId} has already been fully refunded.`, eligibleAmount: 0 };
    }

    // Checking policy (Simplified hardcoded check as per Phase 2 setup)
    // In our seed data, refund requires cancelled order, or duplicate payment scenario.
    // We will check if it's a cancelled order, OR if it's a duplicate payment (order has multiple successful payments).
    
    const allPaymentsForOrder = await Payment.find({ orderId: order.orderId, status: "success" }).lean();
    const isDuplicatePayment = allPaymentsForOrder.length > 1;

    if (order.status === "cancelled" || isDuplicatePayment) {
      return { 
        eligible: true, 
        reason: isDuplicatePayment ? "Duplicate payment detected." : "Order was cancelled, payment succeeded, and no refund has been issued.", 
        eligibleAmount: payment.amount 
      };
    }

    return { 
      eligible: false, 
      reason: `Order is ${order.status}, which is not eligible for refund under standard policy unless cancelled or duplicate.`, 
      eligibleAmount: 0 
    };
    
  } catch (err: any) {
    return { eligible: false, reason: `Error checking eligibility: ${err.message}`, eligibleAmount: 0 };
  }
}
