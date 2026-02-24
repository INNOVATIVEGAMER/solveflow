/**
 * Gemini Provider
 *
 * ILLMProvider implementation using the Google GenAI SDK (@google/genai).
 * Sends the PDF as an inline base64 part alongside a user message, then
 * uses function calling (tool calling) to force structured JSON output.
 *
 * Environment variables:
 *   LLM_API_KEY  — Google AI API key (required)
 *   LLM_MODEL    — Model override (default: "gemini-2.0-flash")
 */

import { FunctionCallingConfigMode, GoogleGenAI, Type } from "@google/genai";

import { DPP_TOOL } from "../schema";
import type {
  ILLMProvider,
  LLMProviderConfig,
  PDFGenerationOptions,
  ToolCallResult,
} from "../types";
import { DPPGenerationError, LLMProviderType } from "../types";
import { SYSTEM_PROMPT } from "../prompts";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MODEL = "gemini-2.0-flash";
const DEFAULT_MAX_TOKENS = 8192;
const DEFAULT_TIMEOUT_MS = 120_000; // 2 minutes
const DEFAULT_MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 2_000; // 2 s, doubles each attempt

// ---------------------------------------------------------------------------
// Schema conversion: JSON Schema → Gemini function declaration schema
//
// Zod v4 generates flat inline JSON Schema (no $defs / definitions).
// This converter handles: object, array, string (with enum), number/integer,
// boolean — which covers all types used in the DPP schema.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySchema = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertToGeminiSchema(jsonSchema: AnySchema): AnySchema {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function convertSchema(schema: AnySchema): AnySchema {
    if (schema.type === "object" && schema.properties) {
      const properties: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(schema.properties)) {
        properties[key] = convertSchema(value as AnySchema);
      }
      return {
        type: Type.OBJECT,
        properties,
        required: schema.required ?? [],
        ...(schema.description && { description: schema.description }),
      };
    }

    if (schema.type === "array" && schema.items) {
      return {
        type: Type.ARRAY,
        items: convertSchema(schema.items as AnySchema),
        ...(schema.description && { description: schema.description }),
      };
    }

    if (schema.type === "string") {
      const result: AnySchema = {
        type: Type.STRING,
        ...(schema.description && { description: schema.description }),
      };
      if (schema.enum) {
        result.enum = schema.enum;
      }
      return result;
    }

    if (schema.type === "number" || schema.type === "integer") {
      return {
        type: Type.NUMBER,
        ...(schema.description && { description: schema.description }),
      };
    }

    if (schema.type === "boolean") {
      return {
        type: Type.BOOLEAN,
        ...(schema.description && { description: schema.description }),
      };
    }

    // Fallback: treat unknown types as strings
    return {
      type: Type.STRING,
      ...(schema.description && { description: schema.description }),
    };
  }

  return convertSchema(jsonSchema);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export class GeminiProvider implements ILLMProvider {
  private readonly client: GoogleGenAI;
  private readonly config: {
    model: string;
    defaultMaxTokens: number;
    timeoutMs: number;
  };

  readonly providerType = LLMProviderType.gemini;

  get modelId(): string {
    return this.config.model;
  }

  constructor(config: LLMProviderConfig = {}) {
    const apiKey = config.apiKey ?? process.env.LLM_API_KEY;

    if (!apiKey) {
      throw new DPPGenerationError(
        "Gemini API key is required. Provide via config.apiKey or the LLM_API_KEY environment variable.",
        { provider: "gemini" },
      );
    }

    this.client = new GoogleGenAI({ apiKey });

    this.config = {
      model: config.model ?? process.env.LLM_MODEL ?? DEFAULT_MODEL,
      defaultMaxTokens: config.defaultMaxTokens ?? DEFAULT_MAX_TOKENS,
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    };
  }

  async generateFromPDF<T>(
    pdfBase64: string,
    options: PDFGenerationOptions = {},
  ): Promise<ToolCallResult<T>> {
    const maxTokens = options.maxTokens ?? this.config.defaultMaxTokens;
    const systemPrompt = options.systemPrompt ?? SYSTEM_PROMPT;

    // Convert the DPP JSON Schema to Gemini's proprietary format
    const geminiSchema = convertToGeminiSchema(
      DPP_TOOL.input_schema as AnySchema,
    );

    const functionDeclaration = {
      name: DPP_TOOL.name,
      description: DPP_TOOL.description,
      parameters: geminiSchema,
    };

    const requestConfig = {
      model: this.config.model,
      contents: [
        {
          role: "user",
          parts: [
            // Attach the PDF as inline binary data
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64,
              },
            },
            // User instruction text
            {
              text: systemPrompt,
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: maxTokens,
        tools: [{ functionDeclarations: [functionDeclaration] }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: [DPP_TOOL.name],
          },
        },
      },
    };

    let lastError: unknown;

    for (let attempt = 0; attempt <= DEFAULT_MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `[GeminiProvider] Rate limited — retrying in ${delay}ms (attempt ${attempt}/${DEFAULT_MAX_RETRIES})`,
        );
        await new Promise((res) => setTimeout(res, delay));
      }

      // Create fresh promises for each attempt
      const generatePromise = this.client.models.generateContent(requestConfig);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new DPPGenerationError(
              `Gemini request timed out after ${this.config.timeoutMs}ms`,
              { provider: "gemini", timeoutMs: this.config.timeoutMs },
            ),
          );
        }, this.config.timeoutMs);
      });

      try {
        const response = await Promise.race([generatePromise, timeoutPromise]);

        const candidate = response.candidates?.[0];
        const functionCall = candidate?.content?.parts?.[0]?.functionCall;

        if (!functionCall) {
          throw new DPPGenerationError(
            "Tool calling failed: no function call in Gemini response",
            {
              provider: "gemini",
              model: this.config.model,
              finishReason: candidate?.finishReason,
              candidateCount: response.candidates?.length ?? 0,
            },
          );
        }

        if (functionCall.name !== DPP_TOOL.name) {
          throw new DPPGenerationError(
            `Tool calling failed: unexpected function name "${functionCall.name}"`,
            { provider: "gemini", model: this.config.model },
          );
        }

        const usageMetadata = response.usageMetadata;

        return {
          data: functionCall.args as T,
          usage: usageMetadata
            ? {
                inputTokens: usageMetadata.promptTokenCount ?? 0,
                outputTokens: usageMetadata.candidatesTokenCount ?? 0,
              }
            : undefined,
          model: this.config.model,
        };
      } catch (error) {
        // Re-throw errors we already own (non-retryable)
        if (error instanceof DPPGenerationError) {
          throw error;
        }

        if (error instanceof Error) {
          const message = error.message.toLowerCase();
          console.error("[GeminiProvider] API error:", error.message);

          if (
            message.includes("401") ||
            message.includes("403") ||
            message.includes("api key") ||
            message.includes("invalid")
          ) {
            // Auth errors are never retryable
            throw new DPPGenerationError(
              "Gemini authentication failed: invalid or missing API key",
              { provider: "gemini" },
            );
          }

          if (
            message.includes("429") ||
            message.includes("rate limit") ||
            message.includes("quota") ||
            message.includes("resource exhausted")
          ) {
            // Save and retry on next iteration
            lastError = error;
            continue;
          }

          if (
            message.includes("500") ||
            message.includes("503") ||
            message.includes("unavailable")
          ) {
            // Transient server errors — also worth retrying
            lastError = error;
            continue;
          }

          throw new DPPGenerationError(`Gemini API error: ${error.message}`, {
            provider: "gemini",
          });
        }

        console.error("[GeminiProvider] Unknown error:", error);
        throw new DPPGenerationError("An unexpected error occurred", {
          provider: "gemini",
        });
      }
    }

    // All retries exhausted
    const exhaustedMsg =
      lastError instanceof Error ? lastError.message : String(lastError);
    throw new DPPGenerationError(
      `Gemini rate limit exceeded after ${DEFAULT_MAX_RETRIES} retries — please try again later`,
      { provider: "gemini", lastError: exhaustedMsg },
    );
  }
}
