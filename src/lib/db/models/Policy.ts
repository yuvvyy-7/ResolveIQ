import mongoose, { Schema } from "mongoose";
import { IPolicy } from "../../../types";

const policySchema = new Schema<IPolicy>(
  {
    policyId: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    title: { type: String, required: true },
    rules: [{ type: String }], // Array of strings describing the policy rules
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Policy =
  mongoose.models.Policy || mongoose.model<IPolicy>("Policy", policySchema);
