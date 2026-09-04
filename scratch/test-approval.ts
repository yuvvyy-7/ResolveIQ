import { connectDB } from "../src/lib/db/connection";
import { Ticket, Payment } from "../src/lib/db/models";

async function testApproval() {
  await connectDB();

  console.log("================ Setup ================");
  // Reset TICK-001 to a state ready for approval
  await Ticket.updateOne({ ticketId: "TICK-001" }, {
    $set: {
      status: "awaiting_approval",
      approvalStatus: "pending",
      proposedAction: "refund",
      resolution: ""
    }
  });
  // Reset payment PAY-001 to not refunded
  await Payment.updateOne({ paymentId: "PAY-001" }, {
    $set: { refundStatus: "none", refundAmount: 0 },
    $unset: { refundDate: "", refundReference: "" }
  });
  
  // Set TICK-002 as ready for rejection test
  await Ticket.updateOne({ ticketId: "TICK-002" }, {
    $set: {
      status: "awaiting_approval",
      approvalStatus: "pending",
      proposedAction: "refund",
      resolution: ""
    }
  });

  console.log("\n================ Test C: Rejection (TICK-002) ================");
  let res = await fetch("http://localhost:3000/api/tickets/TICK-002/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: false })
  });
  let data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);

  console.log("\n================ Test A: Approval (TICK-001) ================");
  res = await fetch("http://localhost:3000/api/tickets/TICK-001/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true })
  });
  data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);

  console.log("\n================ Test B: Duplicate Approval (TICK-001) ================");
  res = await fetch("http://localhost:3000/api/tickets/TICK-001/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true })
  });
  data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);

  console.log("\n================ Test E: Invalid Ticket (TICK-999) ================");
  res = await fetch("http://localhost:3000/api/tickets/TICK-999/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true })
  });
  data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
  
  process.exit(0);
}

testApproval();
