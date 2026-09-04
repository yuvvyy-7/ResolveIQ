import * as handlers from "./handlers";

// Define an interface for the dispatcher context/arguments
export type ToolArguments = Record<string, any>;

/**
 * Executes a tool by name securely.
 * Rejects unknown tools and catches any internal errors.
 */
export async function dispatchTool(toolName: string, args: ToolArguments): Promise<any> {
  console.log(`[Dispatcher] Executing tool: ${toolName}`, args);
  
  try {
    switch (toolName) {
      case "getCustomer":
        return await handlers.getCustomer(args as any);
      case "getOrder":
        return await handlers.getOrder(args as any);
      case "getPayment":
        return await handlers.getPayment(args as any);
      case "getPaymentsForOrder":
        return await handlers.getPaymentsForOrder(args as any);
      case "getPreviousTickets":
        return await handlers.getPreviousTickets(args as any);
      case "checkRefundEligibility":
        return await handlers.checkRefundEligibility(args as any);
      default:
        console.warn(`[Dispatcher] Rejected unknown tool: ${toolName}`);
        return { error: `Tool ${toolName} is not recognized or not allowed.` };
    }
  } catch (error: any) {
    console.error(`[Dispatcher] Tool ${toolName} failed:`, error);
    return { error: `Internal execution error for ${toolName}: ${error.message}` };
  }
}
