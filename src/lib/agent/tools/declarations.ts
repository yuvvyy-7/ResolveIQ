import type Groq from "groq-sdk";

// Tool definitions in OpenAI function-calling format (compatible with Groq)
export const resolveIqTools: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getCustomerAccount",
      description:
        "Retrieves the customer record and their primary account details, including connection status and mobile status.",
      parameters: {
        type: "object",
        properties: {
          customerId: {
            type: "string",
            description: "The unique identifier of the customer (e.g. CUST-001)",
          },
        },
        required: ["customerId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getPlanDetails",
      description:
        "Retrieves details about a specific plan, including speed, data limits, and pricing.",
      parameters: {
        type: "object",
        properties: {
          planId: {
            type: "string",
            description: "The unique identifier of the plan (e.g. PLAN-BB-100)",
          },
        },
        required: ["planId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getBillingStatus",
      description:
        "Retrieves the billing status of a customer, including current bill, outstanding amount, and due date.",
      parameters: {
        type: "object",
        properties: {
          customerId: {
            type: "string",
            description: "The unique identifier of the customer",
          },
        },
        required: ["customerId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getRecentTickets",
      description: "Retrieves previous support tickets for the customer.",
      parameters: {
        type: "object",
        properties: {
          customerId: {
            type: "string",
            description: "The customer's ID",
          },
        },
        required: ["customerId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getConversation",
      description: "Retrieves the full conversation history for a specific ticket.",
      parameters: {
        type: "object",
        properties: {
          ticketId: {
            type: "string",
            description: "The unique identifier of the ticket",
          },
        },
        required: ["ticketId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchSupportArticles",
      description:
        "Searches the internal knowledge base for relevant support articles based on keywords or categories (e.g. BILLING, CONNECTION). Always run this to find grounded evidence before resolving.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query or keywords to find matching articles",
          },
          category: {
            type: "string",
            description:
              "Optional category filter (e.g. 'BILLING', 'CONNECTION', 'PLAN', 'OTHER')",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getSupportArticle",
      description: "Retrieves the full content of a specific support article by its ID.",
      parameters: {
        type: "object",
        properties: {
          articleId: {
            type: "string",
            description: "The unique ID of the article (e.g. KB-CONN-001)",
          },
        },
        required: ["articleId"],
      },
    },
  },
];
