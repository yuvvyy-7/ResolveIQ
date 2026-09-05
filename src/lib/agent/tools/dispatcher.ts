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
      case "getCustomerAccount":
        return await handlers.getCustomerAccount(args as any);
      case "getPlanDetails":
        return await handlers.getPlanDetails(args as any);
      case "getBillingStatus":
        return await handlers.getBillingStatus(args as any);
      case "getRecentTickets":
        return await handlers.getRecentTickets(args as any);
      case "getConversation":
        return await handlers.getConversation(args as any);
      case "searchSupportArticles":
        return await handlers.searchSupportArticles(args as any);
      case "getSupportArticle":
        return await handlers.getSupportArticle(args as any);
      default:
        console.warn(`[Dispatcher] Rejected unknown tool: ${toolName}`);
        return { error: `Tool ${toolName} is not recognized or not allowed.` };
    }
  } catch (error: any) {
    console.error(`[Dispatcher] Tool ${toolName} failed:`, error);
    return { error: `Internal execution error for ${toolName}: ${error.message}` };
  }
}
