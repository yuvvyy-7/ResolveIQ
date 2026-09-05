import mongoose, { Schema } from "mongoose";
import { ICustomer } from "../../../types";

const customerSchema = new Schema<ICustomer>(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    serviceType: { type: String, enum: ["broadband", "mobile", "both"], required: true },
    accountStatus: { type: String, enum: ["active", "suspended", "closed"], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", customerSchema);
