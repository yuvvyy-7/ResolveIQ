import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db/connection";
import { Ticket, Customer } from "../../../lib/db/models";

// Use the standard Node.js runtime (default), as Mongoose does not fully support the Edge runtime.
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await connectDB();
    const tickets = await Ticket.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets from the database" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { customerId, subject, message, category, priority } = body;

    // Validate required fields
    if (!customerId || !subject || !message || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate customer exists
    const customer = await Customer.findOne({ customerId }).lean();
    if (!customer) {
      return NextResponse.json({ error: `Customer ${customerId} not found` }, { status: 404 });
    }

    // Auto-generate a unique ticketId
    const lastTicket = await Ticket.findOne({}, { ticketId: 1 }).sort({ createdAt: -1 }).lean();
    let nextNum = 1;
    if (lastTicket?.ticketId) {
      const match = lastTicket.ticketId.match(/TICK-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const ticketId = `TICK-${String(nextNum).padStart(3, "0")}`;

    const ticket = await Ticket.create({
      ticketId,
      customerId,
      subject,
      message,
      category,
      priority: priority || "medium",
      status: "open",
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/tickets error:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}

