import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/connection";
import { Ticket } from "../../../../lib/db/models";
import { runInvestigation } from "../../../../lib/agent/investigate-agent";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  ticketId: z.string().min(1, "ticketId is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = requestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parseResult.error }, { status: 400 });
    }
    
    const { ticketId } = parseResult.data;

    await connectDB();
    
    // Delegate to the reusable investigation agent loop
    const result = await runInvestigation(ticketId);

    if (result.error && !result.investigation) {
      if (result.error === "Ticket not found") {
        return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      }
      return NextResponse.json({ error: result.error, trace: result.trace }, { status: 500 });
    }

    if (result.investigation) {
      const approvalStatus = result.investigation.requiresApproval ? "pending" : "not_required";
      
      // Update the ticket to persist the investigation results
      await Ticket.updateOne(
        { ticketId },
        {
          $set: {
            aiInvestigation: JSON.stringify(result.investigation.evidence),
            aiRecommendation: result.investigation.recommendation,
            confidence: result.investigation.confidence,
            proposedAction: result.investigation.proposedAction,
            approvalStatus: approvalStatus,
            category: result.investigation.category,
            priority: result.investigation.priority,
            status: approvalStatus === "pending" ? "awaiting_approval" : "resolved"
          }
        }
      );

      return NextResponse.json({ 
        investigation: result.investigation,
        approvalStatus: approvalStatus,
        ticketId: ticketId,
        trace: result.trace
      });
    }

    return NextResponse.json({ error: "No investigation result generated" }, { status: 500 });
    
  } catch (error: any) {
    console.error("POST /api/agent/investigate error:", error);
    return NextResponse.json(
      { error: "Investigation failed", details: error.message },
      { status: 502 }
    );
  }
}
