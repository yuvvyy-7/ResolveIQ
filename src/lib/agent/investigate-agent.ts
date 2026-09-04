import { ai, GEMINI_MODEL } from "../ai/gemini";
import { resolveIqTools } from "./tools/declarations";
import { dispatchTool } from "./tools/dispatcher";
import { Ticket } from "../db/models";
import { Type, Schema } from "@google/genai";
import { investigationResultSchema, InvestigationResult } from "../ai/schema";

const MAX_ITERATIONS = 5;

// The same structured output schema from Phase 4
const genAiResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      enum: ["refund", "delivery_delay", "duplicate_payment", "insufficient_information", "other"],
      description: "The primary category of the complaint."
    },
    priority: {
      type: Type.STRING,
      enum: ["low", "medium", "high", "urgent"],
      description: "The urgency of the issue based on customer sentiment and financial impact."
    },
    summary: {
      type: Type.STRING,
      description: "A brief, 1-2 sentence summary of what the customer is asking for and what the evidence shows."
    },
    evidence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Specific facts extracted strictly from the tool results."
    },
    recommendation: {
      type: Type.STRING,
      description: "The recommended resolution for the customer, based strictly on policies and evidence."
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score from 0.0 to 1.0 representing how certain the AI is."
    },
    proposedAction: {
      type: Type.STRING,
      enum: ["refund", "investigate", "request_information", "escalate", "no_action"],
      description: "The system action that should be taken next."
    },
    requiresApproval: {
      type: Type.BOOLEAN,
      description: "True if the proposed action is consequential (like issuing a refund) and requires human approval."
    }
  },
  required: ["category", "priority", "summary", "evidence", "recommendation", "confidence", "proposedAction", "requiresApproval"]
};

export async function runInvestigation(ticketId: string): Promise<{ investigation: InvestigationResult | null, trace: any[], error?: string }> {
  const trace: any[] = [];
  
  try {
    // 1. Load the ticket from MongoDB
    const ticket = await Ticket.findOne({ ticketId }).lean();
    if (!ticket) {
      return { investigation: null, trace, error: "Ticket not found" };
    }

    const systemInstruction = `
You are ResolveIQ, an AI customer support resolution assistant.
Your job is to investigate a customer's support ticket autonomously using the provided tools.

STRICT RULES:
1. ALWAYS start by looking up the customer or order mentioned in the ticket.
2. USE TOOLS to verify claims. NEVER invent customer, order, or payment information.
3. Once you have gathered enough evidence, stop calling tools and provide the final structured investigation result.
4. If a payment is eligible for a refund (according to the checkRefundEligibility tool), propose a 'refund' action and set requiresApproval to true.
5. NEVER claim a refund was executed or completed unless the database explicitly shows it.
6. A recommendation to refund is NOT a refund execution.
7. For duplicate payment claims, use getPaymentsForOrder to discover all payments associated with an order, as there may be more than one.
`;

    const prompt = `Please investigate the following customer support case:
Ticket ID: ${ticket.ticketId}
Customer ID: ${ticket.customerId}
Subject: ${ticket.subject}
Message: ${ticket.message}
`;

    // 2. Initialize chat with Gemini
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

    let currentResponse = await chat.sendMessage({ message: prompt });
    let iteration = 0;

    // 3. Tool usage loop
    while (iteration < MAX_ITERATIONS) {
      iteration++;
      
      if (currentResponse.functionCalls && currentResponse.functionCalls.length > 0) {
        const functionResponses: any[] = [];

        // Process all requested tools sequentially
        for (const functionCall of currentResponse.functionCalls) {
          const toolName = functionCall.name as string;
          const toolArgs = functionCall.args as Record<string, any>;
          
          // 4. Dispatch the tool securely
          const toolResult = await dispatchTool(toolName, toolArgs);
          
          // 5. Append to trace
          trace.push({
            iteration,
            tool: toolName,
            arguments: toolArgs,
            success: !toolResult.error,
            resultSummary: Object.keys(toolResult).join(", ")
          });

          // Add to responses array, supporting optional call ID if the SDK uses it
          const functionResponseObj: any = {
            name: toolName,
            response: toolResult
          };
          if ((functionCall as any).id) {
            functionResponseObj.id = (functionCall as any).id;
          }
          
          functionResponses.push({ functionResponse: functionResponseObj });
        }

        // 6. Return all tool results back to Gemini in a single message
        currentResponse = await chat.sendMessage({
          message: functionResponses
        });
      } else {
        // The model did not request a tool, meaning it provided the final structured text
        const resultText = currentResponse.text;
        if (!resultText) {
          throw new Error("Gemini returned an empty response.");
        }
        
        // Validate against Zod
        const parsedData = JSON.parse(resultText);
        const validatedResult = investigationResultSchema.parse(parsedData);
        
        return { investigation: validatedResult, trace };
      }
    }

    // 7. Hit max iterations
    trace.push({
      iteration: MAX_ITERATIONS + 1,
      error: "Maximum tool iterations reached without a final response."
    });
    
    return {
      investigation: {
        category: "other",
        priority: "urgent",
        summary: "The AI agent failed to reach a conclusion within the allowed iteration limit.",
        evidence: ["Agent exhausted tool call limit."],
        recommendation: "Human intervention is required to investigate this case manually.",
        confidence: 0,
        proposedAction: "escalate",
        requiresApproval: false
      },
      trace,
      error: "Maximum tool iterations reached."
    };

  } catch (error: any) {
    console.error("Investigation loop failed:", error);
    return { investigation: null, trace, error: `Investigation loop failed: ${error.message}` };
  }
}
