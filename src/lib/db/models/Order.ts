import mongoose, { Schema } from "mongoose";
import { IOrder } from "../../../types";

const orderItemSchema = new Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false } // Avoid generating subdocument ObjectIds since they aren't needed
);

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true }, // Simple string relationship
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "cancelled", "delivered", "refunded"],
      required: true,
    },
    cancelledAt: { type: Date, default: null },
    deliveryStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered", "failed"],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
