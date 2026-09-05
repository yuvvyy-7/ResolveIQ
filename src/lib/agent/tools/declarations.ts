import { Type, FunctionDeclaration, Tool } from "@google/genai";

export const getCustomerAccountDeclaration: FunctionDeclaration = {
  name: "getCustomerAccount",
  description: "Retrieves the customer record and their primary account details, including connection status and mobile status.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerId: { type: Type.STRING, description: "The unique identifier of the customer (e.g. CUST-001)" },
    },
    required: ["customerId"],
  },
};

export const getPlanDetailsDeclaration: FunctionDeclaration = {
  name: "getPlanDetails",
  description: "Retrieves details about a specific plan, including speed, data limits, and pricing.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      planId: { type: Type.STRING, description: "The unique identifier of the plan (e.g. PLAN-BB-100)" },
    },
    required: ["planId"],
  },
};

export const getBillingStatusDeclaration: FunctionDeclaration = {
  name: "getBillingStatus",
  description: "Retrieves the billing status of a customer, including current bill, outstanding amount, and due date.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerId: { type: Type.STRING, description: "The unique identifier of the customer" },
    },
    required: ["customerId"],
  },
};

export const getRecentTicketsDeclaration: FunctionDeclaration = {
  name: "getRecentTickets",
  description: "Retrieves previous support tickets for the customer.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerId: { type: Type.STRING, description: "The customer's ID" },
    },
    required: ["customerId"],
  },
};

export const getConversationDeclaration: FunctionDeclaration = {
  name: "getConversation",
  description: "Retrieves the full conversation history for a specific ticket.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      ticketId: { type: Type.STRING, description: "The unique identifier of the ticket" },
    },
    required: ["ticketId"],
  },
};

export const searchSupportArticlesDeclaration: FunctionDeclaration = {
  name: "searchSupportArticles",
  description: "Searches the internal knowledge base for relevant support articles based on keywords or categories (e.g. BILLING, CONNECTION). Always run this to find grounded evidence before resolving.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "Search query or keywords to find matching articles" },
      category: { type: Type.STRING, description: "Optional category filter (e.g. 'BILLING', 'CONNECTION', 'PLAN', 'OTHER')" },
    },
    required: ["query"],
  },
};

export const getSupportArticleDeclaration: FunctionDeclaration = {
  name: "getSupportArticle",
  description: "Retrieves the full content of a specific support article by its ID.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      articleId: { type: Type.STRING, description: "The unique ID of the article (e.g. KB-CONN-001)" },
    },
    required: ["articleId"],
  },
};

// Bundle all declarations into a single GenAI Tool object
export const resolveIqTools: Tool = {
  functionDeclarations: [
    getCustomerAccountDeclaration,
    getPlanDetailsDeclaration,
    getBillingStatusDeclaration,
    getRecentTicketsDeclaration,
    getConversationDeclaration,
    searchSupportArticlesDeclaration,
    getSupportArticleDeclaration,
  ],
};
