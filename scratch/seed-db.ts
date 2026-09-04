import mongoose from "mongoose";
import { connectDB } from "../src/lib/db/connection";
import { Customer, Order, Payment, Ticket, Policy } from "../src/lib/db/models";

async function seedDatabase() {
  console.log("Connecting to MongoDB...");
  await connectDB();
  console.log("Connected successfully.");

  // Clear existing data
  console.log("Clearing existing data...");
  await Customer.deleteMany({});
  await Order.deleteMany({});
  await Payment.deleteMany({});
  await Ticket.deleteMany({});
  await Policy.deleteMany({});

  // -------------------------------------------------------------
  // CUSTOMERS
  // -------------------------------------------------------------
  const customers = [
    { customerId: "CUST-001", name: "Rahul Sharma", email: "rahul.s@example.in", phone: "+919876543210" },
    { customerId: "CUST-002", name: "Priya Patel", email: "priya.p@example.in", phone: "+919876543211" },
    { customerId: "CUST-003", name: "Amit Kumar", email: "amit.k@example.in", phone: "+919876543212" },
    { customerId: "CUST-004", name: "Sneha Gupta", email: "sneha.g@example.in", phone: "+919876543213" },
    { customerId: "CUST-005", name: "Vikram Singh", email: "vikram.s@example.in", phone: "+919876543214" },
  ];
  await Customer.insertMany(customers);

  // -------------------------------------------------------------
  // POLICIES
  // -------------------------------------------------------------
  const policies = [
    {
      policyId: "POL-001",
      category: "refund",
      title: "Cancelled Order Refund Policy",
      rules: [
        "If an order is cancelled by the customer or the system, a full refund must be issued.",
        "Refunds should only be processed if the original payment was successful.",
        "Check if a refund has already been issued before processing a new one."
      ],
      active: true,
    },
    {
      policyId: "POL-002",
      category: "delay",
      title: "Delivery Delay Compensation",
      rules: [
        "If delivery is delayed by more than 3 days, offer a flat ₹200 wallet credit.",
        "Do not issue a full refund for delivery delays unless the customer explicitly cancels the order."
      ],
      active: true,
    },
    {
      policyId: "POL-003",
      category: "duplicate",
      title: "Duplicate Payment Policy",
      rules: [
        "If multiple successful payments exist for the same order ID, the most recent payment should be fully refunded.",
        "Always retain at least one successful payment for an active order."
      ],
      active: true,
    },
  ];
  await Policy.insertMany(policies);

  // -------------------------------------------------------------
  // SCENARIO 1: Refund Eligible
  // Customer: CUST-001 | Order Cancelled | Payment Success | No Refund
  // -------------------------------------------------------------
  await Order.create({
    orderId: "ORDER-001",
    customerId: "CUST-001",
    items: [{ name: "Wireless Earbuds", qty: 1, price: 2499 }],
    totalAmount: 2499,
    status: "cancelled",
    cancelledAt: new Date(Date.now() - 86400000), // 1 day ago
    deliveryStatus: "failed",
  });
  await Payment.create({
    paymentId: "PAY-001",
    orderId: "ORDER-001",
    customerId: "CUST-001",
    amount: 2499,
    status: "success",
    paymentMethod: "upi",
    transactionDate: new Date(Date.now() - 172800000), // 2 days ago
    refundStatus: "none",
  });
  await Ticket.create({
    ticketId: "TICK-001",
    customerId: "CUST-001",
    subject: "Refund not received",
    message: "I paid ₹2,499 for my order but the order was cancelled and I still haven't received my refund. Please help.",
    category: "refund",
    priority: "high",
    status: "open",
  });

  // -------------------------------------------------------------
  // SCENARIO 2: Delivery Delay
  // Customer: CUST-002 | Order Active | Delivery Pending
  // -------------------------------------------------------------
  await Order.create({
    orderId: "ORDER-002",
    customerId: "CUST-002",
    items: [{ name: "Smartwatch", qty: 1, price: 3999 }],
    totalAmount: 3999,
    status: "active",
    deliveryStatus: "pending",
  });
  await Payment.create({
    paymentId: "PAY-002",
    orderId: "ORDER-002",
    customerId: "CUST-002",
    amount: 3999,
    status: "success",
    paymentMethod: "credit_card",
    transactionDate: new Date(Date.now() - 432000000), // 5 days ago
    refundStatus: "none",
  });
  await Ticket.create({
    ticketId: "TICK-002",
    customerId: "CUST-002",
    subject: "Order is delayed",
    message: "I placed this order 5 days ago and it is still showing as pending. When will I get it?",
    category: "delay",
    priority: "medium",
    status: "open",
  });

  // -------------------------------------------------------------
  // SCENARIO 3: Duplicate Payment
  // Customer: CUST-003 | 1 Order | 2 Success Payments
  // -------------------------------------------------------------
  await Order.create({
    orderId: "ORDER-003",
    customerId: "CUST-003",
    items: [{ name: "Running Shoes", qty: 1, price: 1500 }],
    totalAmount: 1500,
    status: "active",
    deliveryStatus: "shipped",
  });
  // First payment
  await Payment.create({
    paymentId: "PAY-003A",
    orderId: "ORDER-003",
    customerId: "CUST-003",
    amount: 1500,
    status: "success",
    paymentMethod: "net_banking",
    transactionDate: new Date(Date.now() - 200000000), 
    refundStatus: "none",
  });
  // Duplicate payment
  await Payment.create({
    paymentId: "PAY-003B",
    orderId: "ORDER-003",
    customerId: "CUST-003",
    amount: 1500,
    status: "success",
    paymentMethod: "upi",
    transactionDate: new Date(Date.now() - 190000000), 
    refundStatus: "none",
  });
  await Ticket.create({
    ticketId: "TICK-003",
    customerId: "CUST-003",
    subject: "Money deducted twice",
    message: "I was trying to pay for my order and the app crashed, so I paid again via UPI. But my bank shows money was deducted both times! Please refund the extra ₹1500.",
    category: "duplicate",
    priority: "high",
    status: "open",
  });

  // -------------------------------------------------------------
  // SCENARIO 4: Insufficient Information
  // Customer: CUST-004 | Order Success | Vague Ticket
  // -------------------------------------------------------------
  await Order.create({
    orderId: "ORDER-004",
    customerId: "CUST-004",
    items: [{ name: "Office Chair", qty: 1, price: 5999 }],
    totalAmount: 5999,
    status: "delivered",
    deliveryStatus: "delivered",
  });
  await Payment.create({
    paymentId: "PAY-004",
    orderId: "ORDER-004",
    customerId: "CUST-004",
    amount: 5999,
    status: "success",
    paymentMethod: "credit_card",
    transactionDate: new Date(Date.now() - 864000000),
    refundStatus: "none",
  });
  await Ticket.create({
    ticketId: "TICK-004",
    customerId: "CUST-004",
    subject: "Issue with order",
    message: "This is completely unacceptable. Fix this right now.",
    category: "unknown",
    priority: "low",
    status: "open",
  });

  // -------------------------------------------------------------
  // SCENARIO 5: Already Refunded
  // Customer: CUST-005 | Cancelled Order | Refunded Payment
  // -------------------------------------------------------------
  await Order.create({
    orderId: "ORDER-005",
    customerId: "CUST-005",
    items: [{ name: "Bluetooth Speaker", qty: 1, price: 1999 }],
    totalAmount: 1999,
    status: "cancelled",
    cancelledAt: new Date(Date.now() - 259200000), // 3 days ago
    deliveryStatus: "failed",
  });
  await Payment.create({
    paymentId: "PAY-005",
    orderId: "ORDER-005",
    customerId: "CUST-005",
    amount: 1999,
    status: "success",
    paymentMethod: "wallet",
    transactionDate: new Date(Date.now() - 345600000), // 4 days ago
    refundStatus: "refunded",
    refundAmount: 1999,
    refundDate: new Date(Date.now() - 172800000), // 2 days ago
    refundReference: "REF-998877",
  });
  await Ticket.create({
    ticketId: "TICK-005",
    customerId: "CUST-005",
    subject: "Where is my money?",
    message: "I cancelled my Bluetooth Speaker 3 days ago and I am still waiting for my money. Send it back immediately.",
    category: "refund",
    priority: "medium",
    status: "open",
  });

  // -------------------------------------------------------------
  // VERIFICATION & SUMMARY
  // -------------------------------------------------------------
  const customerCount = await Customer.countDocuments();
  const orderCount = await Order.countDocuments();
  const paymentCount = await Payment.countDocuments();
  const ticketCount = await Ticket.countDocuments();
  const policyCount = await Policy.countDocuments();

  console.log("\nSeed completed successfully.");
  console.log(`Customers: ${customerCount}`);
  console.log(`Orders: ${orderCount}`);
  console.log(`Payments: ${paymentCount}`);
  console.log(`Tickets: ${ticketCount}`);
  console.log(`Policies: ${policyCount}\n`);

  await mongoose.disconnect();
  console.log("Connection closed.");
  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error("Failed to seed database:", error);
  process.exit(1);
});
