import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/connection";
import { Payment } from "../../../../lib/db/models";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;

    await connectDB();
    
    // Payments lookup could be by paymentId, or maybe there are multiple payments per order.
    // The requirement says GET /api/payments/[paymentId], so we return a single payment.
    const payment = await Payment.findOne({ paymentId }).lean();
    
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error(`GET /api/payments error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch payment from the database" },
      { status: 500 }
    );
  }
}
