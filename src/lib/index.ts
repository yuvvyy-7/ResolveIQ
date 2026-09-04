/**
 * ResolveIQ — Server-side library modules.
 *
 * This directory contains all server-only logic. Nothing here should
 * ever be imported by client components (no "use client" files here).
 *
 * Subdirectory layout (populated phase by phase):
 *
 *   lib/db/
 *     connection.ts   ← Mongoose connection singleton     (Phase 2)
 *     models/         ← Mongoose model definitions         (Phase 2)
 *
 *   lib/ai/
 *     gemini.ts       ← Gemini client + model config       (Phase 4)
 *     prompts.ts      ← System prompts for the agent       (Phase 4)
 *
 *   lib/agent/
 *     tools.ts        ← Tool definitions & implementations (Phase 5)
 *     loop.ts         ← Agent investigation loop           (Phase 6)
 *
 *   lib/utils/
 *     validation.ts   ← Input validation helpers           (Phase 3+)
 *
 * SECURITY: All Gemini API calls and MongoDB queries happen in this
 * directory. Never import lib/* files from client components.
 */

// This file is a documentation placeholder only.
export {};
