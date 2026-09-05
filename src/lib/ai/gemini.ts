import { GoogleGenAI } from "@google/genai";

// Note: The key is read from the environment by the GoogleGenAI constructor automatically.
// We avoid throwing here to prevent Next.js static build crashes.
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-build",
});

// Export the configured model name so it can be changed centrally
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
