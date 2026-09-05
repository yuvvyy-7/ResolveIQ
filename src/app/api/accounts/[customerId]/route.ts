import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/connection";
import { Account } from "../../../../lib/db/models";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    if (!customerId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await connectDB();
    const account = await Account.findOne({ customerId }).lean();
    
    if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ account });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
