import mongoose, { Schema } from "mongoose";
import { IPayment } from "../../../types";

const paymentSchema = new Schema<IPayment>(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "upi", "net_banking", "wallet"],
      required: true,
    },
    transactionDate: { type: Date, default: Date.now },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "refunded"],
      default: "none",
    },
    refundAmount: { type: Number },
    refundDate: { type: Date, default: null },
    refundReference: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);
