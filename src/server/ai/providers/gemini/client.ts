import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "~/env";

/**
 * Singleton instance of Gemini AI client
 */
export const geminiClient = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);

/**
 * Available Gemini models
 */
export const GEMINI_MODELS = {
  FLASH_LATEST: "gemini-flash-latest",
  FLASH_LITE_LATEST: "gemini-flash-lite-latest",
  PRO: "gemini-2.5-pro",
  FLASH: "gemini-2.5-flash",
} as const;

export type GeminiModel = typeof GEMINI_MODELS[keyof typeof GEMINI_MODELS];

/**
 * Default model configuration
 */
export const DEFAULT_MODEL_CONFIG = {
  model: GEMINI_MODELS.FLASH_LATEST,
  temperature: 0.1,
  maxOutputTokens: 2000,
} as const;