import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db/connection";
import { Ticket } from "../../../../../lib/db/models";
import { executeApprovedRefund } from "../../../../../lib/resolution/refund";
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
    if (ticket.status === "resolved") {
      return NextResponse.json(
        { error: "Ticket is already resolved.", status: "resolved" },
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

    // Approved: Execute specific backend logic based on proposed action
    if (ticket.proposedAction === "refund") {
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

      // Execute authoritative backend refund validation
      const result = await executeApprovedRefund(ticketId);
      return NextResponse.json(result);
    }

    // If proposedAction is something else, we reject it as not implemented
    return NextResponse.json(
      { error: `Backend execution for action '${ticket.proposedAction}' is not implemented.` },
      { status: 501 }
    );

  } catch (error: any) {
    console.error("POST /api/tickets/[ticketId]/approve error:", error);
    
    // Check if it's a known error regarding already refunded states
    if (error.message.includes("Payment was already refunded")) {
      return NextResponse.json(
        { error: "already_refunded", message: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Approval execution failed", details: error.message },
      { status: 500 }
    );
  }
}
