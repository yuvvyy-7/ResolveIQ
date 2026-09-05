import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY && process.env.NODE_ENV !== "production") {
  console.warn("GROQ_API_KEY is not set. AI investigations will fail.");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy-key-for-build",
});

export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
