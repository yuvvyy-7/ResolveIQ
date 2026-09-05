import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db/connection";
import { Ticket } from "../../../lib/db/models";

// Opt out of Next.js static caching to ensure the database is queried on every request
export const dynamic = "force-dynamic";
// Use the standard Node.js runtime (default), as Mongoose does not fully support the Edge runtime.
export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all tickets. Use .lean() to return plain JavaScript objects 
    // instead of heavy Mongoose documents, which is faster and safer for JSON serialization.
    const tickets = await Ticket.find({}).lean();
    
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets from the database" },
      { status: 500 }
    );
  }
}
