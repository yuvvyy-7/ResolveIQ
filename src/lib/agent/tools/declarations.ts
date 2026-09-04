import { Type, FunctionDeclaration, Tool } from "@google/genai";

export const getCustomerDeclaration: FunctionDeclaration = {
  name: "getCustomer",
  description: "Retrieves the customer record including email and phone.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerId: {
        type: Type.STRING,
        description: "The unique identifier of the customer (e.g. CUST-001)",
      },
    },
    required: ["customerId"],
  },
};

export const getOrderDeclaration: FunctionDeclaration = {
  name: "getOrder",
  description: "Retrieves the order record including items, totalAmount, status, and deliveryStatus.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: {
        type: Type.STRING,
        description: "The unique identifier of the order (e.g. ORDER-001)",
      },
    },
    required: ["orderId"],
  },
};

export const getPaymentDeclaration: FunctionDeclaration = {
  name: "getPayment",
  description: "Retrieves a specific payment record including amount, status, and refundStatus.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      paymentId: {
        type: Type.STRING,
        description: "The unique identifier of the payment (e.g. PAY-001)",
      },
    },
    required: ["paymentId"],
  },
};

export const getPaymentsForOrderDeclaration: FunctionDeclaration = {
  name: "getPaymentsForOrder",
  description: "Retrieves all payments associated with a specific order. Use this to check for duplicate payments.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: {
        type: Type.STRING,
        description: "The unique identifier of the order (e.g. ORDER-001)",
      },
    },
    required: ["orderId"],
  },
};

export const getPreviousTicketsDeclaration: FunctionDeclaration = {
  name: "getPreviousTickets",
  description: "Retrieves previous support tickets for the customer.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerId: {
        type: Type.STRING,
        description: "The customer's ID",
      },
      currentTicketId: {
        type: Type.STRING,
        description: "The current ticket ID to exclude from the results, if applicable.",
      },
    },
    required: ["customerId"],
  },
};

export const checkRefundEligibilityDeclaration: FunctionDeclaration = {
  name: "checkRefundEligibility",
  description: "Independently inspects the database to determine whether a refund is currently eligible based on policies. It does NOT execute a refund.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: {
        type: Type.STRING,
        description: "The order ID involved.",
      },
      paymentId: {
        type: Type.STRING,
        description: "The specific payment ID being checked for refund.",
      },
    },
    required: ["orderId", "paymentId"],
  },
};

// Bundle all declarations into a single GenAI Tool object
export const resolveIqTools: Tool = {
  functionDeclarations: [
    getCustomerDeclaration,
    getOrderDeclaration,
    getPaymentDeclaration,
    getPaymentsForOrderDeclaration,
    getPreviousTicketsDeclaration,
    checkRefundEligibilityDeclaration,
  ],
};
