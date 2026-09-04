import mongoose, { Schema } from "mongoose";
import { ITicket } from "../../../types";

const ticketSchema = new Schema<ITicket>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ["refund", "delay", "duplicate", "general", "unknown"],
      default: "unknown",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },
    status: {
      type: String,
      enum: [
        "open",
        "investigating",
        "awaiting_approval",
        "approved",
        "rejected",
        "escalated",
        "resolved",
      ],
      default: "open",
    },
    aiInvestigation: { type: Schema.Types.Mixed }, // Can store a string or structured tool trace object
    aiRecommendation: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    proposedAction: { type: String },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "escalated"],
    },
    resolution: { type: String },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export const Ticket =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", ticketSchema);
