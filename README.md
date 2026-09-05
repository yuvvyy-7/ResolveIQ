# ResolveIQ — Customer Support Resolution Assistant

A hackathon-winning AI support resolution assistant built with Next.js, React, Tailwind CSS, MongoDB, and the Gemini API.

## Problem
Routine requests clog support queues while complex cases wait behind them, and every handover loses context.

## Solution
ResolveIQ acts as a first-line support resolution assistant for a broadband and mobile provider. It autonomously investigates cases by pulling customer account context, billing status, and support knowledge base articles. 

Crucially, **ResolveIQ does not hallucinate resolutions**. It requires grounded evidence, and places a human in the loop for approval before any consequential action is taken.

## Architecture
- **Frontend**: Next.js App Router (React, Tailwind CSS, Framer Motion)
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Mongoose)
- **AI**: Google Gemini Pro (Function Calling)

## Features
- **3 Decision States**: RESOLVE (routine cases), ASK_FOR_INFORMATION (missing context), ESCALATE (complex cases)
- **Grounded AI**: The agent must retrieve articles and account data; it cannot guess.
- **Evidence Citations**: The UI displays exactly which database records and articles led to the decision.
- **Human-in-the-loop**: Support agents must click "Approve" before simulated emails/actions are triggered.

## Local Setup

### 1. Environment Variables
Create a `.env.local` file in the root directory:
```
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=AIza...
```

### 2. Install & Seed
```bash
npm install
npx tsx scratch/seed-db.ts
```

### 3. Run
```bash
npm run dev
```

Navigate to `http://localhost:3000`.

## Demo Scenarios (Included in Seed)
- **TICK-001 (Billing)**: Routine billing complaint. AI resolves it using an article explaining router rental fees.
- **TICK-002 (Connection)**: Broadband down. AI asks for router WAN indicator status.
- **TICK-003 (Complex)**: Persistent outage despite troubleshooting. AI automatically escalates with established facts.
- **TICK-004 (Plan)**: Plan upgrade request. AI explains prorated billing and resolves.
- **TICK-005 (Missing Info)**: Intermittent connection. AI asks which mobile number is affected.

## Known Limitations
- SMS and email sending are simulated.
- Analytics and Saved Views are purely visual/deferred for the core demo experience.