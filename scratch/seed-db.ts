import { config } from "dotenv";
config({ path: ".env.local" });
import { connectDB } from "../src/lib/db/connection";
import { Customer, Account, Plan, Ticket, SupportArticle } from "../src/lib/db/models";

async function seed() {
  await connectDB();
  console.log("Connected to MongoDB.");

  // Clear existing
  await Customer.deleteMany({});
  await Account.deleteMany({});
  await Plan.deleteMany({});
  await Ticket.deleteMany({});
  await SupportArticle.deleteMany({});
  console.log("Cleared existing data.");

  // 1. Create Plans
  const plans = [
    { planId: "PLAN-BB-100", type: "broadband", name: "100 Mbps Essential", price: 999, speed: "100 Mbps" },
    { planId: "PLAN-BB-200", type: "broadband", name: "200 Mbps Premium", price: 1499, speed: "200 Mbps" },
    { planId: "PLAN-BB-500", type: "broadband", name: "500 Mbps Ultra", price: 2499, speed: "500 Mbps" },
    { planId: "PLAN-MOB-2G", type: "mobile", name: "2 GB/day Smart", price: 399, dataLimit: "2 GB/day" },
    { planId: "PLAN-MOB-UNL", type: "mobile", name: "Unlimited 5G", price: 999, dataLimit: "Unlimited" },
  ];
  await Plan.insertMany(plans);

  // 2. Create Customers
  const customers = [
    { customerId: "CUST-001", name: "Aarav Sharma", email: "aarav@example.com", phone: "9876543210", serviceType: "broadband", accountStatus: "active" },
    { customerId: "CUST-002", name: "Riya Mehta", email: "riya@example.com", phone: "9876543211", serviceType: "both", accountStatus: "active" },
    { customerId: "CUST-003", name: "Kunal Singh", email: "kunal@example.com", phone: "9876543212", serviceType: "broadband", accountStatus: "active" },
    { customerId: "CUST-004", name: "Neha Gupta", email: "neha@example.com", phone: "9876543213", serviceType: "mobile", accountStatus: "active" },
    { customerId: "CUST-005", name: "Vikram Reddy", email: "vikram@example.com", phone: "9876543214", serviceType: "broadband", accountStatus: "active" },
    { customerId: "CUST-006", name: "Aditi Rao", email: "aditi@example.com", phone: "9876543215", serviceType: "mobile", accountStatus: "active" },
  ];
  await Customer.insertMany(customers);

  // 3. Create Accounts
  const accounts = [
    { accountId: "ACC-001", customerId: "CUST-001", broadbandPlan: "PLAN-BB-200", billingStatus: "current", currentBill: 1699, outstandingAmount: 0, dueDate: new Date(Date.now() + 864000000), connectionStatus: "online", mobileStatus: "inactive", serviceAddress: "123 MG Road, Bangalore" }, // Bill includes a valid 200 router rental charge (1499+200)
    { accountId: "ACC-002", customerId: "CUST-002", broadbandPlan: "PLAN-BB-100", mobilePlan: "PLAN-MOB-UNL", billingStatus: "current", currentBill: 1998, outstandingAmount: 0, dueDate: new Date(Date.now() + 864000000), connectionStatus: "offline", mobileStatus: "active", serviceAddress: "456 Andheri West, Mumbai" },
    { accountId: "ACC-003", customerId: "CUST-003", broadbandPlan: "PLAN-BB-500", billingStatus: "current", currentBill: 2499, outstandingAmount: 0, dueDate: new Date(Date.now() + 864000000), connectionStatus: "offline", mobileStatus: "inactive", serviceAddress: "789 Koramangala, Bangalore" },
    { accountId: "ACC-004", customerId: "CUST-004", mobilePlan: "PLAN-MOB-2G", billingStatus: "current", currentBill: 399, outstandingAmount: 0, dueDate: new Date(Date.now() + 864000000), connectionStatus: "online", mobileStatus: "active", serviceAddress: "12 Jubilee Hills, Hyderabad" },
    { accountId: "ACC-005", customerId: "CUST-005", broadbandPlan: "PLAN-BB-200", billingStatus: "current", currentBill: 1499, outstandingAmount: 0, dueDate: new Date(Date.now() + 864000000), connectionStatus: "intermittent", mobileStatus: "inactive", serviceAddress: "34 Indiranagar, Bangalore" },
    { accountId: "ACC-006", customerId: "CUST-006", mobilePlan: "PLAN-MOB-2G", billingStatus: "current", currentBill: 399, outstandingAmount: 0, dueDate: new Date(Date.now() + 864000000), connectionStatus: "online", mobileStatus: "active", serviceAddress: "56 Vasant Kunj, Delhi" },
  ];
  await Account.insertMany(accounts);

  // 4. Create Support Articles
  const articles = [
    {
      articleId: "KB-BILL-001",
      title: "Understanding Additional Router Rental Charges",
      category: "BILLING",
      content: "Customers may see a charge higher than their base plan if they have opted for a premium router rental. The premium router rental fee is ₹200/month. This is a valid charge and applies to all Premium and Ultra broadband plans if the customer requested the advanced router during installation.",
      sections: ["Overview", "Rental Fees"],
      applicableConditions: ["Account has broadband", "Bill is exactly base + 200"],
      resolutionSteps: ["Explain that the additional ₹200 is for the premium router rental.", "Confirm this is a valid recurring charge."],
      escalationConditions: ["Customer disputes requesting the router"]
    },
    {
      articleId: "KB-CONN-001",
      title: "Standard Broadband Troubleshooting",
      category: "CONNECTION",
      content: "For broadband offline issues, first check if the WAN indicator on the router is red, green, or off. If red, it's a line fault requiring escalation. If off, verify power/cables. If green, restart the router.",
      sections: ["Initial Check", "WAN Indicator"],
      applicableConditions: ["Broadband service offline"],
      resolutionSteps: ["Ask the customer for the WAN indicator color if unknown.", "If green, ask them to restart."],
      escalationConditions: ["WAN indicator is red", "Troubleshooting already attempted but issue persists"]
    },
    {
      articleId: "KB-PLAN-001",
      title: "Broadband Plan Upgrades",
      category: "PLAN",
      content: "Customers can upgrade their broadband plan at any time. Upgrades take effect within 2 hours. The customer will be charged prorated amounts in the next billing cycle. Available plans: 100 Mbps Essential (₹999), 200 Mbps Premium (₹1499), 500 Mbps Ultra (₹2499).",
      sections: ["Upgrade Process", "Available Plans"],
      applicableConditions: ["Customer asking for plan upgrade"],
      resolutionSteps: ["Confirm the requested plan.", "Explain the timeline (2 hours) and prorated billing."],
      escalationConditions: ["Customer account is suspended due to non-payment"]
    },
    {
      articleId: "KB-CONN-002",
      title: "Intermittent Mobile Connection",
      category: "CONNECTION",
      content: "If mobile connection is intermittent, verify the exact mobile number affected. Check for local cell tower outages. If no outage, recommend resetting network settings.",
      sections: ["Verification", "Troubleshooting"],
      applicableConditions: ["Mobile connection issue"],
      resolutionSteps: ["Ask for the affected mobile number if not provided.", "Recommend resetting network settings."],
      escalationConditions: ["Customer has already reset network settings"]
    }
  ];
  await SupportArticle.insertMany(articles);

  // 5. Create Tickets (Scenarios 1-6)
  const tickets = [
    {
      ticketId: "TICK-001",
      customerId: "CUST-001", // Billing resolution (Approve & Send)
      category: "BILLING",
      priority: "high",
      status: "open",
      subject: "Unexpected monthly charge",
      message: "I was charged ₹1699 this month but my 200 Mbps plan is only ₹1499. Why was I charged more than my usual monthly bill?",
    },
    {
      ticketId: "TICK-002",
      customerId: "CUST-002", // Connection problem (Ask for information)
      category: "CONNECTION",
      priority: "high",
      status: "open",
      subject: "Broadband stopped working",
      message: "My broadband stopped working this morning. I work from home and need this fixed urgently.",
    },
    {
      ticketId: "TICK-003",
      customerId: "CUST-003", // Complex connection (Escalate)
      category: "CONNECTION",
      priority: "high",
      status: "open",
      subject: "Internet down for 2 days despite restarts",
      message: "My internet has been down for two days. I restarted the router multiple times, checked the cables, and it still doesn't work. The WAN light is red.",
    },
    {
      ticketId: "TICK-004",
      customerId: "CUST-001", // Plan question (Resolve) - re-using CUST-001 for convenience, wait no, let's use CUST-004 or 001. CUST-004 is mobile. Let's make CUST-004 ask about broadband upgrade? No, they only have mobile. Let's make CUST-001 ask for upgrade to 500.
      category: "PLAN",
      priority: "medium",
      status: "open",
      subject: "Can I upgrade my plan?",
      message: "Can I upgrade my broadband from 200 Mbps to 500 Mbps?",
    },
    {
      ticketId: "TICK-005",
      customerId: "CUST-005", // Missing info (Ask for info)
      category: "CONNECTION",
      priority: "medium",
      status: "open",
      subject: "Intermittent connection dropping",
      message: "My connection keeps dropping every few hours. It happens mostly on one device.",
    },
    {
      ticketId: "TICK-006",
      customerId: "CUST-006", // Uncovered case (Escalate)
      category: "OTHER",
      priority: "low",
      status: "open",
      subject: "Partnership inquiry",
      message: "I represent a local housing society. We would like to bulk-purchase connections for 50 flats. Do you have a partnership program?",
    }
  ];
  
  // TICK-004 should probably be CUST-002 (since they have 100Mbps plan)
  tickets[3].customerId = "CUST-002";
  tickets[3].message = "Can I upgrade my broadband from 100 Mbps to 500 Mbps?";

  // TICK-005 let's make it about Mobile missing number
  tickets[4].category = "CONNECTION";
  tickets[4].message = "My mobile connection is dropping constantly. Can you check my number?";
  tickets[4].customerId = "CUST-002"; // CUST-002 has both mobile and broadband, so AI needs to know WHICH number.

  await Ticket.insertMany(tickets);
  
  // Also create previous ticket for CUST-003 to support escalation context
  await Ticket.create({
    ticketId: "TICK-019",
    customerId: "CUST-003",
    category: "CONNECTION",
    priority: "high",
    status: "resolved",
    subject: "Internet issues yesterday",
    message: "Internet was slow yesterday.",
    resolution: "Customer restarted router, connection restored."
  });

  console.log("Seeded Telecom Demo Data Successfully.");
  process.exit(0);
}

seed().catch(console.error);
