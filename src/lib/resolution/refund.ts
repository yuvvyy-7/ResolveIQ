import { Ticket, Order, Payment } from "../db/models";

export async function executeApprovedRefund(ticketId: string) {
  // 1. Ticket validation
  const ticket = await Ticket.findOne({ ticketId });
  if (!ticket) throw new Error("Ticket not found.");
  
  if (ticket.approvalStatus !== "approved") {
    throw new Error(`Ticket is not approved. Current status: ${ticket.approvalStatus}`);
  }
  if (ticket.proposedAction !== "refund") {
    throw new Error(`Ticket proposed action is ${ticket.proposedAction}, not refund.`);
  }
  if (ticket.status === "resolved") {
    throw new Error("Ticket is already resolved.");
  }

  // Find the exact payment that needs refunding.
  // The ticket context gives us the customerId, but we need to find the payment.
  // In a real system, the exact payment ID should ideally be persisted on the ticket.
  // However, since it isn't currently, we will re-query the order and payments just like the AI did,
  // to deterministically find the eligible payment.
  
  const orders = await Order.find({ customerId: ticket.customerId });
  const orderIds = orders.map(o => o.orderId);
  const payments = await Payment.find({ orderId: { $in: orderIds }, status: "success", refundStatus: { $ne: "refunded" } });
  
  if (payments.length === 0) {
    throw new Error("No successful, unrefunded payments found for this customer.");
  }

  // Find the first payment that meets the strict refund criteria.
  // Since we don't have the exact paymentId explicitly saved on the ticket from the AI, 
  // we use the same backend business rules.
  let eligiblePayment = null;
  let associatedOrder = null;

  for (const payment of payments) {
    const order = orders.find(o => o.orderId === payment.orderId);
    if (!order) continue;

    // Rule: Cancelled order
    if (order.status === "cancelled") {
      eligiblePayment = payment;
      associatedOrder = order;
      break;
    }

    // Rule: Duplicate payment
    const allPaymentsForOrder = await Payment.find({ orderId: order.orderId, status: "success" });
    if (allPaymentsForOrder.length > 1) {
      // It's a duplicate, we can refund this one.
      eligiblePayment = payment;
      associatedOrder = order;
      break;
    }
  }

  if (!eligiblePayment || !associatedOrder) {
    throw new Error("No payment found that is currently eligible for a refund.");
  }

  // Execute Simulated Refund
  const refundReference = `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const refundAmount = eligiblePayment.amount;

  // Update Payment (Idempotent safe check via MongoDB condition)
  const paymentUpdateResult = await Payment.updateOne(
    { paymentId: eligiblePayment.paymentId, refundStatus: { $ne: "refunded" } },
    {
      $set: {
        refundStatus: "refunded",
        refundAmount: refundAmount,
        refundDate: new Date(),
        refundReference: refundReference
      }
    }
  );

  if (paymentUpdateResult.modifiedCount === 0) {
    throw new Error("Payment was already refunded or modified concurrently.");
  }

  // Generate Customer Response
  const customerResponse = `Your refund of ₹${refundAmount} has been successfully initiated for order ${associatedOrder.orderId}. Your refund reference is ${refundReference}.`;

  // Update Ticket
  await Ticket.updateOne(
    { ticketId },
    {
      $set: {
        status: "resolved",
        resolution: customerResponse
      }
    }
  );

  return {
    success: true,
    status: "resolved",
    action: "refund",
    refundAmount,
    refundReference,
    customerResponse,
    message: "Refund processed successfully."
  };
}
