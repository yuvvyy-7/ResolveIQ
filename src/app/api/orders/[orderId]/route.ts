import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/connection";
import { Order } from "../../../../lib/db/models";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    await connectDB();
    
    const order = await Order.findOne({ orderId }).lean();
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error(`GET /api/orders error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch order from the database" },
      { status: 500 }
    );
  }
}
