import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db/connection";
import { Ticket } from "../../../../lib/db/models";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await connectDB();

    const total = await Ticket.countDocuments();

    // Status breakdown
    const statusGroups = await Ticket.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const byStatus: Record<string, number> = {};
    for (const g of statusGroups) byStatus[g._id] = g.count;

    // Category breakdown
    const categoryGroups = await Ticket.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const byCategory: Record<string, number> = {};
    for (const g of categoryGroups) byCategory[g._id] = g.count;

    // Priority breakdown
    const priorityGroups = await Ticket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);
    const byPriority: Record<string, number> = {};
    for (const g of priorityGroups) byPriority[g._id] = g.count;

    // Resolution rate
    const resolved = byStatus["resolved"] || 0;
    const escalated = byStatus["escalated"] || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Recent resolved/escalated tickets
    const recentActivity = await Ticket.find(
      { status: { $in: ["resolved", "escalated"] } },
      { ticketId: 1, subject: 1, status: 1, customerId: 1, updatedAt: 1, category: 1 }
    ).sort({ updatedAt: -1 }).limit(5).lean();

    return NextResponse.json({
      stats: {
        total,
        open: byStatus["open"] || 0,
        investigating: byStatus["investigating"] || 0,
        awaiting_approval: byStatus["awaiting_approval"] || 0,
        resolved,
        escalated,
        rejected: byStatus["rejected"] || 0,
        byCategory,
        byPriority,
        resolutionRate,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("GET /api/tickets/stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket stats" },
      { status: 500 }
    );
  }
}
