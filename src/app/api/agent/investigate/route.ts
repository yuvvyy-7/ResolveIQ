import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/connection";
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

    return NextResponse.json({ 
      investigation: result.investigation,
      trace: result.trace
    });
    
  } catch (error: any) {
    console.error("POST /api/agent/investigate error:", error);
    return NextResponse.json(
      { error: "Investigation failed", details: error.message },
      { status: 502 }
    );
  }
}
