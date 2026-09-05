import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db/connection";
import { Ticket } from "../../../../../lib/db/models";
import { z } from "zod";

export const runtime = "nodejs";

const approvalSchema = z.object({
  approved: z.boolean(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    if (!ticketId) {
      return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }

    const body = await request.json();
    const parseResult = approvalSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parseResult.error },
        { status: 400 }
      );
    }

    const { approved } = parseResult.data;

    await connectDB();

    // Re-load ticket
    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Idempotency / Already Resolved checks
    if (ticket.status === "resolved" || ticket.status === "escalated") {
      return NextResponse.json(
        { error: "Ticket is already resolved or escalated.", status: ticket.status },
        { status: 400 }
      );
    }

    if (ticket.approvalStatus === "approved" || ticket.approvalStatus === "rejected") {
      return NextResponse.json(
        { error: "Approval already consumed.", status: ticket.approvalStatus },
        { status: 400 }
      );
    }

    if (ticket.approvalStatus !== "pending") {
      return NextResponse.json(
        { error: "Ticket does not require approval.", status: ticket.approvalStatus },
        { status: 400 }
      );
    }

    if (!approved) {
      // Human rejected the recommendation
      await Ticket.updateOne(
        { ticketId },
        {
          $set: {
            approvalStatus: "rejected",
            status: "open",
            resolution: "AI recommendation rejected by support agent",
          },
        }
      );
      
      return NextResponse.json({
        success: true,
        status: "rejected",
        action: ticket.proposedAction,
        message: "AI recommendation rejected.",
      });
    }

    // Approved: Execute specific backend logic based on proposed action (Decision)
    // First update ticket approval status securely
    const approvalUpdate = await Ticket.updateOne(
      { ticketId, approvalStatus: "pending" }, // Optimistic concurrency check
      { $set: { approvalStatus: "approved" } }
    );

    if (approvalUpdate.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to acquire approval lock or already approved." },
        { status: 409 }
      );
    }

    // Simulate backend resolution actions based on decision
    let newStatus = "resolved";
    let simulatedResolution = "Issue resolved successfully.";
    
    if (ticket.proposedAction === "RESOLVE") {
      newStatus = "resolved";
      simulatedResolution = "Response sent to customer.";
    } else if (ticket.proposedAction === "ASK_FOR_INFORMATION") {
      newStatus = "open"; // Or 'awaiting_customer' if we had that state
      simulatedResolution = "Information request sent to customer.";
    } else if (ticket.proposedAction === "ESCALATE") {
      newStatus = "escalated";
      simulatedResolution = "Ticket escalated to Tier 2 Support.";
    }

    // Finalize the ticket update
    await Ticket.updateOne(
      { ticketId },
      {
        $set: {
          status: newStatus,
          resolution: simulatedResolution,
        },
      }
    );

    return NextResponse.json({
      success: true,
      status: "approved",
      action: ticket.proposedAction,
      message: simulatedResolution,
      newTicketStatus: newStatus
    });

  } catch (error: any) {
    console.error("POST /api/tickets/[ticketId]/approve error:", error);
    
    return NextResponse.json(
      { error: "Approval execution failed", details: error.message },
      { status: 500 }
    );
  }
}
