import { groq, GROQ_MODEL } from "../ai/groq";
import { resolveIqTools } from "./tools/declarations";
import { dispatchTool } from "./tools/dispatcher";
import { Ticket } from "../db/models";
import { investigationResultSchema, InvestigationResult } from "../ai/schema";
import type Groq from "groq-sdk";

const MAX_ITERATIONS = 8;

// Retry on transient 503/429 errors with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isTransient =
        err?.status === 503 || err?.status === 429 ||
        err?.message?.includes("503") || err?.message?.includes("429") ||
        err?.message?.includes("UNAVAILABLE") || err?.message?.includes("high demand") ||
        err?.message?.includes("rate limit");
      if (isTransient && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Groq transient error on attempt ${attempt + 1}, retrying in ${delay}ms…`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("retryWithBackoff: unreachable");
}

// The JSON schema we want the AI to produce as its final answer.
// Sent as a system instruction since Groq doesn't support responseSchema natively.
const RESPONSE_SCHEMA_INSTRUCTION = `
You MUST respond with ONLY a valid JSON object (no markdown, no explanation, no code fences) matching this exact schema:

{
  "decision": "RESOLVE" | "ASK_FOR_INFORMATION" | "ESCALATE",
  "confidence": <number 0-1>,
  "recommendation": "<string: what you recommend the agent do>",
  "draftResponse": "<string: the exact message to send to the customer (optional)>",
  "evidence": [
    {
      "sourceType": "ACCOUNT" | "TICKET" | "ARTICLE" | "CONVERSATION",
      "sourceId": "<real ID retrieved from tools>",
      "citation": "<brief source description>",
      "excerpt": "<relevant excerpt from the source>"
    }
  ],
  "missingInformation": ["<what info is missing if ASK_FOR_INFORMATION>"],
  "escalation": {
    "summary": "<escalation summary if ESCALATE>",
    "establishedFacts": ["<fact>"],
    "attemptedSteps": ["<step>"],
    "unknowns": ["<unknown>"],
    "reason": "<reason for escalation>"
  }
}

REQUIRED fields: decision, confidence, recommendation, evidence.
escalation is required if decision is ESCALATE.
missingInformation is required if decision is ASK_FOR_INFORMATION.
`;

export async function runInvestigation(ticketId: string): Promise<{ investigation: InvestigationResult | null; trace: any[]; error?: string }> {
  const trace: any[] = [];

  try {
    const ticket = await Ticket.findOne({ ticketId }).lean();
    if (!ticket) {
      return { investigation: null, trace, error: "Ticket not found" };
    }

    const systemMessage = `You are ResolveIQ, an AI customer support resolution assistant for a broadband and mobile provider.
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
9. When you have finished all investigation, produce your final JSON response.

${RESPONSE_SCHEMA_INSTRUCTION}`;

    const userMessage = `Please investigate the following customer support case:
Ticket ID: ${ticket.ticketId}
Customer ID: ${ticket.customerId}
Subject: ${ticket.subject}
Category: ${ticket.category}
Message: ${ticket.message}`;

    // Maintain conversation history in OpenAI message format
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ];

    let iteration = 0;

    while (iteration < MAX_ITERATIONS) {
      iteration++;

      const response = await retryWithBackoff(() =>
        groq.chat.completions.create({
          model: GROQ_MODEL,
          messages,
          tools: resolveIqTools,
          tool_choice: "auto",
          temperature: 0.1,
          max_tokens: 4096,
        })
      );

      const choice = response.choices[0];
      const assistantMessage = choice.message;

      // Append assistant turn to message history
      messages.push(assistantMessage as Groq.Chat.ChatCompletionMessageParam);

      // Check if model wants to call tools
      if (choice.finish_reason === "tool_calls" && assistantMessage.tool_calls?.length) {
        const toolResultMessages: Groq.Chat.ChatCompletionToolMessageParam[] = [];

        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          let toolArgs: Record<string, any> = {};
          try {
            toolArgs = JSON.parse(toolCall.function.arguments || "{}");
          } catch {
            toolArgs = {};
          }

          const toolResult = await dispatchTool(toolName, toolArgs);

          trace.push({
            iteration,
            tool: toolName,
            arguments: toolArgs,
            success: !toolResult.error,
            resultSummary: Object.keys(toolResult).join(", "),
          });

          toolResultMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }

        // Append all tool results to message history
        messages.push(...toolResultMessages);
        continue; // next iteration
      }

      // Model finished — extract the JSON response
      const resultText = assistantMessage.content;
      if (!resultText) {
        throw new Error("Groq returned an empty response.");
      }

      // Strip markdown code fences if the model wrapped the JSON
      const cleaned = resultText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      const parsedData = JSON.parse(cleaned);
      let validatedResult = investigationResultSchema.parse(parsedData);

      // DETERMINISTIC GROUNDING CHECK: RESOLVE must cite real evidence from the trace
      if (validatedResult.decision === "RESOLVE") {
        let hasInvalidEvidence = false;
        let failedReason = "";

        if (!validatedResult.evidence || validatedResult.evidence.length === 0) {
          hasInvalidEvidence = true;
          failedReason = "No evidence provided for RESOLVE decision.";
        }

        for (const ev of validatedResult.evidence) {
          let foundInTrace = false;
          for (const step of trace) {
            if (
              step.resultSummary.includes(ev.sourceId) ||
              JSON.stringify(step.arguments).includes(ev.sourceId)
            ) {
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
              reason: failedReason,
            },
          };
        }
      }

      return { investigation: validatedResult, trace };
    }

    // Max iterations reached
    trace.push({
      iteration: MAX_ITERATIONS + 1,
      error: "Maximum tool iterations reached without a final response.",
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
          reason: "Max iterations reached",
        },
      },
      trace,
      error: "Maximum tool iterations reached.",
    };
  } catch (error: any) {
    console.error("Investigation loop failed:", error.message || error);
    return { investigation: null, trace, error: `Investigation loop failed: ${error.message}` };
  }
}
