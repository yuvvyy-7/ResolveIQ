import { z } from "zod";

export const investigationResultSchema = z.object({
  decision: z.enum(["RESOLVE", "ASK_FOR_INFORMATION", "ESCALATE"])
    .describe("The final decision of the AI assistant."),
    
  confidence: z.number().min(0).max(1)
    .describe("Confidence score from 0.0 to 1.0"),
    
  recommendation: z.string()
    .describe("Internal recommendation or reasoning summary for the human agent."),
    
  draftResponse: z.string().optional()
    .describe("The drafted response to send to the customer if decision is RESOLVE or ASK_FOR_INFORMATION."),
    
  evidence: z.array(
    z.object({
      sourceType: z.enum(["ACCOUNT", "TICKET", "ARTICLE", "CONVERSATION"]),
      sourceId: z.string(),
      citation: z.string(),
      excerpt: z.string()
    })
  ).describe("Array of evidence citing exactly where the AI got its information."),
  
  missingInformation: z.array(z.string()).optional()
    .describe("List of exactly what information is missing, if decision is ASK_FOR_INFORMATION."),
    
  escalation: z.object({
    summary: z.string(),
    establishedFacts: z.array(z.string()),
    attemptedSteps: z.array(z.string()),
    unknowns: z.array(z.string()),
    reason: z.string()
  }).optional().describe("Detailed escalation handoff context, if decision is ESCALATE."),
});

export type InvestigationResult = z.infer<typeof investigationResultSchema>;
