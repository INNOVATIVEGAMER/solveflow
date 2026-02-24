/**
 * AI Abstraction Layer — Provider Factory
 *
 * Reads provider selection and configuration from environment variables
 * and returns the appropriate ILLMProvider instance.
 *
 * Environment variables:
 *   LLM_PROVIDER  — "gemini" | "anthropic" | "openai" | "mock" (default: "gemini")
 *   LLM_API_KEY   — API key for the selected provider (required)
 *   LLM_MODEL     — Optional model identifier override
 */

import type { ILLMProvider } from "./types";
import { DPPGenerationError, LLMProviderType } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { AnthropicProvider } from "./providers/anthropic";

/**
 * Create an LLM provider from environment variables.
 *
 * @returns A configured ILLMProvider ready to accept generateFromPDF calls.
 * @throws {DPPGenerationError} if the provider type is unsupported or no API key is set.
 */
export function createProviderFromEnv(): ILLMProvider {
  const providerName = process.env.LLM_PROVIDER ?? LLMProviderType.gemini;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;

  if (!apiKey) {
    throw new DPPGenerationError(
      "LLM_API_KEY environment variable is required but was not set.",
      { provider: providerName }
    );
  }

  const config = { apiKey, ...(model && { model }) };

  switch (providerName) {
    case LLMProviderType.gemini:
      return new GeminiProvider(config);

    case LLMProviderType.anthropic:
      return new AnthropicProvider(config);

    case LLMProviderType.openai:
      throw new DPPGenerationError(
        "The OpenAI provider is not yet implemented.",
        { provider: providerName }
      );

    case LLMProviderType.mock:
      throw new DPPGenerationError(
        "The mock provider is not yet implemented.",
        { provider: providerName }
      );

    default:
      throw new DPPGenerationError(
        `Unknown LLM provider "${providerName}". Supported values: gemini, anthropic.`,
        { provider: providerName }
      );
  }
}
