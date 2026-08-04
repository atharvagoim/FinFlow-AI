import OpenAI from "openai";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const openai = new OpenAI({ apiKey: env.openai.apiKey || "sk-placeholder" });

export const isAIConfigured = Boolean(env.openai.apiKey);

if (!isAIConfigured) {
  logger.warn("[ai] OPENAI_API_KEY not set. AI features will return mocked/fallback responses.");
}

// Wraps a chat completion call that expects strict JSON back. Centralizes
// the "ask for JSON, parse it, fall back gracefully" pattern used by every
// AI feature so individual services stay short and consistent.
export async function completeJSON<T>(system: string, user: string, fallback: T): Promise<T> {
  if (!isAIConfigured) return fallback;
  try {
    const response = await openai.chat.completions.create({
      model: env.openai.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) return fallback;
    return JSON.parse(content) as T;
  } catch (err) {
    logger.error(`[ai] OpenAI call failed: ${(err as Error).message}`);
    return fallback;
  }
}

export async function completeText(system: string, user: string, fallback = ""): Promise<string> {
  if (!isAIConfigured) return fallback;
  try {
    const response = await openai.chat.completions.create({
      model: env.openai.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.4,
    });
    return response.choices[0]?.message?.content || fallback;
  } catch (err) {
    logger.error(`[ai] OpenAI call failed: ${(err as Error).message}`);
    return fallback;
  }
}
