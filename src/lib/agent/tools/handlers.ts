import { connectDB } from "../../db/connection";
import { Customer, Account, Plan, Ticket, SupportArticle } from "../../db/models";

export async function getCustomerAccount({ customerId }: { customerId: string }) {
  await connectDB();
  const customer = await Customer.findOne({ customerId }).lean();
  if (!customer) return { error: `Customer ${customerId} not found` };
  
  const account = await Account.findOne({ customerId }).lean();
  return { customer, account };
}

export async function getPlanDetails({ planId }: { planId: string }) {
  await connectDB();
  const plan = await Plan.findOne({ planId }).lean();
  if (!plan) return { error: `Plan ${planId} not found` };
  return { plan };
}

export async function getBillingStatus({ customerId }: { customerId: string }) {
  await connectDB();
  const account = await Account.findOne({ customerId }, { billingStatus: 1, currentBill: 1, outstandingAmount: 1, dueDate: 1 }).lean();
  if (!account) return { error: `Account for customer ${customerId} not found` };
  return { billing: account };
}

export async function getRecentTickets({ customerId }: { customerId: string }) {
  await connectDB();
  const tickets = await Ticket.find({ customerId }).sort({ createdAt: -1 }).limit(5).lean();
  return { tickets };
}

export async function getConversation({ ticketId }: { ticketId: string }) {
  await connectDB();
  const ticket = await Ticket.findOne({ ticketId }).lean();
  if (!ticket) return { error: `Ticket ${ticketId} not found` };
  return { subject: ticket.subject, message: ticket.message };
}

export async function searchSupportArticles({ query, category }: { query: string, category?: string }) {
  await connectDB();
  // Very simple text-based retrieval for demonstration (simulating basic RAG)
  const filter: any = {};
  if (category) {
    filter.category = category;
  }
  
  const articles = await SupportArticle.find(filter).lean();
  
  // Basic filtering by string matching for demo purposes
  const q = query.toLowerCase();
  const matched = articles.filter(a => 
    a.title.toLowerCase().includes(q) || 
    a.content.toLowerCase().includes(q) || 
    a.category.toLowerCase().includes(q)
  );

  // If strict matching fails, just return everything in the category as "retrieved documents"
  const results = matched.length > 0 ? matched : articles;
  
  return {
    results: results.map(r => ({
      articleId: r.articleId,
      title: r.title,
      category: r.category,
      snippet: r.content.substring(0, 150) + "..."
    }))
  };
}

export async function getSupportArticle({ articleId }: { articleId: string }) {
  await connectDB();
  const article = await SupportArticle.findOne({ articleId }).lean();
  if (!article) return { error: `Article ${articleId} not found` };
  return { article };
}
