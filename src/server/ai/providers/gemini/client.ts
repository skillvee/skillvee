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

/**
 * Retry configuration for Gemini API calls
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if an error is a rate limit error
 */
function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('quota')
    );
  }
  return false;
}

/**
 * Check if an error is retryable (503, network errors, but NOT rate limits)
 */
function isRetryableError(error: unknown): boolean {
  // Rate limit errors should not be retried immediately
  if (isRateLimitError(error)) {
    return false;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('503') ||
      message.includes('overloaded') ||
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('etimedout')
    );
  }
  return false;
}

/**
 * Executes a Gemini API call with exponential backoff retry logic
 * @param fn - The async function to execute
 * @param context - Optional context string for logging
 * @returns The result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  context = 'Gemini API call'
): Promise<T> {
  let lastError: unknown;
  let delay = RETRY_CONFIG.initialDelayMs;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(
          `[${context}] Retry attempt ${attempt}/${RETRY_CONFIG.maxRetries} after ${delay}ms delay`
        );
        await sleep(delay);
      }

      const result = await fn();

      if (attempt > 0) {
        console.log(`[${context}] Succeeded on retry attempt ${attempt}`);
      }

      return result;
    } catch (error) {
      lastError = error;

      // Check for rate limit errors specifically
      if (isRateLimitError(error)) {
        console.error(`[${context}] Rate limit exceeded:`, error);
        const rateLimitError = new Error(
          `Gemini API rate limit exceeded. Please wait 60 seconds before trying again. ` +
          `Gemini Pro allows 5 requests per minute on the free tier.`
        );
        (rateLimitError as any).originalError = error;
        (rateLimitError as any).isRateLimit = true;
        throw rateLimitError;
      }

      // Check if we should retry
      if (!isRetryableError(error)) {
        console.error(`[${context}] Non-retryable error:`, error);
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === RETRY_CONFIG.maxRetries) {
        console.error(
          `[${context}] Max retries (${RETRY_CONFIG.maxRetries}) exceeded`,
          error
        );
        break;
      }

      console.warn(
        `[${context}] Attempt ${attempt + 1} failed with retryable error:`,
        error instanceof Error ? error.message : error
      );

      // Calculate next delay with exponential backoff
      delay = Math.min(
        delay * RETRY_CONFIG.backoffMultiplier,
        RETRY_CONFIG.maxDelayMs
      );
    }
  }

  // If we get here, all retries failed
  throw lastError;
}