import { connectDB } from "../src/lib/db/connection";
import { Ticket } from "../src/lib/db/models";
import { ai, GEMINI_MODEL } from "../src/lib/ai/gemini";
import { resolveIqTools } from "../src/lib/agent/tools/declarations";
import { dispatchTool } from "../src/lib/agent/tools/dispatcher";

async function runTest(ticketId: string) {
  console.log(`\n================ Testing ${ticketId} ================`);
  await connectDB();
  const ticket = await Ticket.findOne({ ticketId }).lean();
  if (!ticket) {
    console.log(`Error: Ticket ${ticketId} not found.`);
    return;
  }

  const systemInstruction = `
You are a customer support agent. You have access to database tools.
Analyze the following support ticket and use your tools to look up the relevant customer, order, and payment information to investigate it.
You MUST use your tools to discover the database context. Do not invent details.
Always start by looking up the customer or order mentioned or associated with the ticket.
The ticket ID is ${ticketId} and the customer ID is ${ticket.customerId}.
  `;

  const prompt = `Ticket Subject: ${ticket.subject}\nTicket Message: ${ticket.message}`;

  try {
    // Start a chat session with the model and tools configured
    const chat = ai.chats.create({
      model: GEMINI_MODEL,
      config: {
        systemInstruction,
        tools: [resolveIqTools],
        temperature: 0.1,
      },
    });

    console.log("[User] -> [Gemini]: Please investigate this ticket.");
    let response = await chat.sendMessage({ message: prompt });
    
    // We will loop a few times to allow multi-step tool calls if the model wants
    for (let turn = 0; turn < 5; turn++) {
      if (response.functionCalls && response.functionCalls.length > 0) {
        // The model requested to call a tool
        const functionCall = response.functionCalls[0];
        const toolName = functionCall.name as string;
        const toolArgs = functionCall.args as Record<string, any>;
        
        console.log(`[Gemini] -> [Tool]: Requesting ${toolName}(${JSON.stringify(toolArgs)})`);
        
        // Execute the tool
        const toolResult = await dispatchTool(toolName, toolArgs);
        console.log(`[Tool] -> [Gemini]: Result returned (keys: ${Object.keys(toolResult).join(",")})`);
        
        // Send the result back to Gemini
        response = await chat.sendMessage({
          message: [{
            functionResponse: {
              name: toolName,
              response: toolResult
            }
          }]
        });
      } else {
        // The model provided a text response
        console.log(`\n[Gemini] Final Response:\n${response.text}`);
        break;
      }
    }
  } catch (err: any) {
    console.error("Test failed with error:", err.message);
  }
}

async function main() {
  await runTest("TICK-001");
  await runTest("TICK-003");
  await runTest("TICK-005");
  process.exit(0);
}

main();
