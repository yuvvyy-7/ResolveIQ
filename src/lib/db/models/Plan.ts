import mongoose, { Schema } from "mongoose";
import { IPlan } from "../../../types";

const planSchema = new Schema<IPlan>(
  {
    planId: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["broadband", "mobile"], required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    dataLimit: { type: String },
    speed: { type: String },
  },
  { timestamps: true }
);

export const Plan = mongoose.models.Plan || mongoose.model<IPlan>("Plan", planSchema);
