import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/connection";
import { Customer } from "../../../../lib/db/models";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    await connectDB();
    
    const customer = await Customer.findOne({ customerId }).lean();
    
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error(`GET /api/customers error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch customer from the database" },
      { status: 500 }
    );
  }
}
