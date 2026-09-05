import mongoose, { Schema } from "mongoose";
import { ISupportArticle } from "../../../types";

const supportArticleSchema = new Schema<ISupportArticle>(
  {
    articleId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, enum: ["BILLING", "CONNECTION", "PLAN", "OTHER"], required: true },
    content: { type: String, required: true },
    sections: { type: [String] },
    applicableConditions: { type: [String] },
    resolutionSteps: { type: [String] },
    escalationConditions: { type: [String] },
  },
  { timestamps: true }
);

export const SupportArticle = mongoose.models.SupportArticle || mongoose.model<ISupportArticle>("SupportArticle", supportArticleSchema);
