import mongoose, { Schema } from "mongoose";
import { ICustomer } from "../../../types";

const customerSchema = new Schema<ICustomer>(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    // We explicitly define createdAt to match our interface, though timestamps: true also handles it
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Protect against Next.js hot reload issues (OverwriteModelError)
// by checking if the model already exists before compiling it.
export const Customer =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", customerSchema);
