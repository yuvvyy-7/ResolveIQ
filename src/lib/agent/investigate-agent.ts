import { ai, GEMINI_MODEL } from "../ai/gemini";
import { resolveIqTools } from "./tools/declarations";
import { dispatchTool } from "./tools/dispatcher";
import { Ticket } from "../db/models";
import { Type, Schema } from "@google/genai";
import { investigationResultSchema, InvestigationResult } from "../ai/schema";

const MAX_ITERATIONS = 6;

const genAiResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    decision: {
      type: Type.STRING,
      enum: ["RESOLVE", "ASK_FOR_INFORMATION", "ESCALATE"]
    },
    confidence: { type: Type.NUMBER },
    recommendation: { type: Type.STRING },
    draftResponse: { type: Type.STRING },
    evidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sourceType: { type: Type.STRING, enum: ["ACCOUNT", "TICKET", "ARTICLE", "CONVERSATION"] },
          sourceId: { type: Type.STRING },
          citation: { type: Type.STRING },
          excerpt: { type: Type.STRING }
        },
        required: ["sourceType", "sourceId", "citation", "excerpt"]
      }
    },
    missingInformation: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    escalation: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        establishedFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
        attemptedSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        unknowns: { type: Type.ARRAY, items: { type: Type.STRING } },
        reason: { type: Type.STRING }
      },
      required: ["summary", "establishedFacts", "attemptedSteps", "unknowns", "reason"]
    }
  },
  required: ["decision", "confidence", "recommendation", "evidence"]
};

// Retry a Gemini API call with exponential backoff on 503 (UNAVAILABLE) errors
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const is503 = err?.message?.includes("503") || err?.status === 503 ||
        err?.message?.includes("UNAVAILABLE") || err?.message?.includes("high demand");
      if (is503 && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(`Gemini 503 on attempt ${attempt + 1}, retrying in ${delay}ms…`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("retryWithBackoff: unreachable");
}

export async function runInvestigation(ticketId: string): Promise<{ investigation: InvestigationResult | null, trace: any[], error?: string }> {
  const trace: any[] = [];
  
  try {
    const ticket = await Ticket.findOne({ ticketId }).lean();
    if (!ticket) {
      return { investigation: null, trace, error: "Ticket not found" };
    }

    const systemInstruction = `
You are ResolveIQ, an AI customer support resolution assistant for a broadband and mobile provider.
Your job is to investigate a customer's support ticket autonomously using the provided tools.

STRICT RULES:
1. Use getConversation to read the full context of the current ticket, and getRecentTickets to see the customer's history.
2. Look up the customer's account context using getCustomerAccount and getBillingStatus.
3. Search for relevant knowledge base articles using searchSupportArticles, and fetch the full article using getSupportArticle. DO NOT guess the resolution steps.
4. If the article requires specific information that is missing from the conversation or account, choose ASK_FOR_INFORMATION. Ask ONLY for the specific missing information required.
5. If the case is complex, contradictory, exhausted troubleshooting, or uncovered by any article, choose ESCALATE.
6. If the case is routine and covered by an article, draft a resolution grounded in that article and choose RESOLVE.
7. Provide specific evidence citing the tools you used. Your evidence MUST use real sourceIds retrieved during your investigation (e.g. articleId, ticketId, customerId).
8. NEVER invent information or article IDs.
`;

    const prompt = `Please investigate the following customer support case:
Ticket ID: ${ticket.ticketId}
Customer ID: ${ticket.customerId}
Subject: ${ticket.subject}
Category: ${ticket.category}
Message: ${ticket.message}
`;

    const chat = ai.chats.create({
      model: GEMINI_MODEL,
      config: {
        systemInstruction,
        tools: [resolveIqTools],
        responseMimeType: "application/json",
        responseSchema: genAiResponseSchema,
        temperature: 0.1,
      },
    });

    let currentResponse = await retryWithBackoff(() => chat.sendMessage({ message: prompt }));
    let iteration = 0;

    while (iteration < MAX_ITERATIONS) {
      iteration++;
      
      if (currentResponse.functionCalls && currentResponse.functionCalls.length > 0) {
        const functionResponses: any[] = [];

        for (const functionCall of currentResponse.functionCalls) {
          const toolName = functionCall.name as string;
          const toolArgs = functionCall.args as Record<string, any>;
          
          const toolResult = await dispatchTool(toolName, toolArgs);
          
          trace.push({
            iteration,
            tool: toolName,
            arguments: toolArgs,
            success: !toolResult.error,
            resultSummary: Object.keys(toolResult).join(", ")
          });

          const functionResponseObj: any = {
            name: toolName,
            response: toolResult
          };
          if ((functionCall as any).id) {
            functionResponseObj.id = (functionCall as any).id;
          }
          
          functionResponses.push({ functionResponse: functionResponseObj });
        }

        currentResponse = await retryWithBackoff(() => chat.sendMessage({
          message: functionResponses
        }));
      } else {
        const resultText = currentResponse.text;
        if (!resultText) {
          throw new Error("Gemini returned an empty response.");
        }
        
        const parsedData = JSON.parse(resultText);
        let validatedResult = investigationResultSchema.parse(parsedData);
        
        // DETERMINISTIC GROUNDING CHECK
        if (validatedResult.decision === "RESOLVE") {
          let hasInvalidEvidence = false;
          let failedReason = "";
          
          if (!validatedResult.evidence || validatedResult.evidence.length === 0) {
            hasInvalidEvidence = true;
            failedReason = "No evidence provided for RESOLVE decision.";
          }
          
          // Verify each piece of evidence was actually retrieved
          for (const ev of validatedResult.evidence) {
            let foundInTrace = false;
            for (const step of trace) {
              if (step.resultSummary.includes(ev.sourceId) || 
                  JSON.stringify(step.arguments).includes(ev.sourceId)) {
                foundInTrace = true;
                break;
              }
            }
            if (!foundInTrace) {
              hasInvalidEvidence = true;
              failedReason = `Evidence sourceId ${ev.sourceId} was never retrieved.`;
              break;
            }
          }
          
          if (hasInvalidEvidence) {
            // Fail safely
            validatedResult = {
              decision: "ESCALATE",
              confidence: 0,
              recommendation: "AI safety system rejected the resolution due to unverified evidence.",
              evidence: validatedResult.evidence,
              escalation: {
                summary: "The AI agent proposed a resolution but cited unverified or fabricated evidence.",
                establishedFacts: ["Agent attempted to resolve ticket."],
                attemptedSteps: ["Safety check"],
                unknowns: ["Why agent hallucinated"],
                reason: failedReason
              }
            };
          }
        }
        
        return { investigation: validatedResult, trace };
      }
    }

    trace.push({
      iteration: MAX_ITERATIONS + 1,
      error: "Maximum tool iterations reached without a final response."
    });
    
    return {
      investigation: {
        decision: "ESCALATE",
        confidence: 0,
        recommendation: "Agent failed to complete investigation.",
        evidence: [],
        escalation: {
          summary: "The AI agent failed to reach a conclusion within the allowed iteration limit.",
          establishedFacts: [],
          attemptedSteps: ["Automated investigation"],
          unknowns: ["Reason for iteration loop"],
          reason: "Max iterations reached"
        }
      },
      trace,
      error: "Maximum tool iterations reached."
    };

  } catch (error: any) {
    console.error("Investigation loop failed:", error);
    return { investigation: null, trace, error: `Investigation loop failed: ${error.message}` };
  }
}
