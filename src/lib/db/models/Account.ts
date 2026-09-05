import mongoose, { Schema } from "mongoose";
import { IAccount } from "../../../types";

const accountSchema = new Schema<IAccount>(
  {
    accountId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    broadbandPlan: { type: String },
    mobilePlan: { type: String },
    billingStatus: { type: String, enum: ["current", "overdue", "suspended"], required: true },
    currentBill: { type: Number, required: true },
    outstandingAmount: { type: Number, required: true, default: 0 },
    dueDate: { type: Date, required: true },
    connectionStatus: { type: String, enum: ["online", "offline", "intermittent"], required: true },
    mobileStatus: { type: String, enum: ["active", "inactive"], required: true },
    serviceAddress: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Account = mongoose.models.Account || mongoose.model<IAccount>("Account", accountSchema);
