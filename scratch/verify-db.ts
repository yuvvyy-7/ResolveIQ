import { connectDB } from "../src/lib/db/connection";
import { Customer, Order, Payment, Ticket } from "../src/lib/db/models";

async function verify() {
  await connectDB();
  console.log("Verifying Database Scenarios...\n");

  const verifyTicket = async (ticketId: string) => {
    const t = await Ticket.findOne({ ticketId });
    if (!t) return console.log(`Missing Ticket ${ticketId}`);
    const c = await Customer.findOne({ customerId: t.customerId });
    const o = await Order.findOne({ customerId: t.customerId });
    const p = await Payment.find({ orderId: o?.orderId });
    console.log(`--- ${ticketId} ---`);
    console.log(`Customer: ${c?.customerId}`);
    console.log(`Order: ${o?.orderId} | Status: ${o?.status} | Delivery: ${o?.deliveryStatus}`);
    console.log(`Payments: ${p.length} found`);
    p.forEach(pay => {
      console.log(`  -> ${pay.paymentId} | Amount: ${pay.amount} | Status: ${pay.status} | RefundStatus: ${pay.refundStatus}`);
    });
    console.log(`Ticket Subject: ${t.subject}`);
    console.log("");
  };

  await verifyTicket("TICK-001");
  await verifyTicket("TICK-002");
  await verifyTicket("TICK-003");
  await verifyTicket("TICK-004");
  await verifyTicket("TICK-005");

  process.exit(0);
}

verify();
