/**
 * Anthropic Provider
 *
 * ILLMProvider implementation using the Anthropic Claude API.
 * Sends the PDF as a base64-encoded document content block, then
 * uses tool calling to force structured JSON output.
 *
 * Environment variables:
 *   LLM_API_KEY  — Anthropic API key (required)
 *   LLM_MODEL    — Model override (default: "claude-3-5-haiku-20241022")
 */

import Anthropic from "@anthropic-ai/sdk";

import { DPP_TOOL } from "../schema";
import type { ILLMProvider, LLMProviderConfig, PDFGenerationOptions, ToolCallResult } from "../types";
import { DPPGenerationError, LLMProviderType } from "../types";
import { SYSTEM_PROMPT } from "../prompts";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MODEL = "claude-3-5-haiku-20241022";
const DEFAULT_MAX_TOKENS = 8192;
const DEFAULT_TIMEOUT_MS = 120_000; // 2 minutes

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export class AnthropicProvider implements ILLMProvider {
  private readonly client: Anthropic;
  private readonly config: {
    model: string;
    defaultMaxTokens: number;
    timeoutMs: number;
  };

  readonly providerType = LLMProviderType.anthropic;

  get modelId(): string {
    return this.config.model;
  }

  constructor(config: LLMProviderConfig = {}) {
    const apiKey = config.apiKey ?? process.env.LLM_API_KEY;

    if (!apiKey) {
      throw new DPPGenerationError(
        "Anthropic API key is required. Provide via config.apiKey or the LLM_API_KEY environment variable.",
        { provider: "anthropic" }
      );
    }

    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    this.client = new Anthropic({
      apiKey,
      timeout: timeoutMs,
    });

    this.config = {
      model: config.model ?? process.env.LLM_MODEL ?? DEFAULT_MODEL,
      defaultMaxTokens: config.defaultMaxTokens ?? DEFAULT_MAX_TOKENS,
      timeoutMs,
    };
  }

  async generateFromPDF<T>(
    pdfBase64: string,
    options: PDFGenerationOptions = {}
  ): Promise<ToolCallResult<T>> {
    const maxTokens = options.maxTokens ?? this.config.defaultMaxTokens;
    const systemPrompt = options.systemPrompt ?? SYSTEM_PROMPT;

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        tools: [DPP_TOOL as Anthropic.Tool],
        tool_choice: {
          type: "tool",
          name: DPP_TOOL.name,
        },
        messages: [
          {
            role: "user",
            content: [
              // PDF as a base64-encoded document block
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              } as Anthropic.Messages.DocumentBlockParam,
              // Follow-up text instruction
              {
                type: "text",
                text: "Extract all MCQ questions from this PDF and call the generate_dpp tool with the complete structured DPP JSON.",
              },
            ],
          },
        ],
      });

      // Extract the tool_use block from the response content
      const toolUseBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      if (!toolUseBlock) {
        throw new DPPGenerationError(
          "Tool calling failed: no tool_use block in Anthropic response",
          {
            provider: "anthropic",
            model: this.config.model,
            stopReason: response.stop_reason,
            contentTypes: response.content.map((b) => b.type),
          }
        );
      }

      if (toolUseBlock.name !== DPP_TOOL.name) {
        throw new DPPGenerationError(
          `Tool calling failed: unexpected tool name "${toolUseBlock.name}"`,
          { provider: "anthropic", model: this.config.model }
        );
      }

      return {
        data: toolUseBlock.input as T,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        model: response.model,
      };
    } catch (error) {
      // Re-throw errors we already own
      if (error instanceof DPPGenerationError) {
        throw error;
      }

      // Anthropic-specific typed errors
      if (error instanceof Anthropic.APIConnectionTimeoutError) {
        console.error("[AnthropicProvider] Request timed out:", error.message);
        throw new DPPGenerationError(
          `Anthropic request timed out after ${this.config.timeoutMs}ms`,
          { provider: "anthropic", timeoutMs: this.config.timeoutMs }
        );
      }

      if (error instanceof Anthropic.APIConnectionError) {
        console.error("[AnthropicProvider] Connection error:", error.message);
        throw new DPPGenerationError(
          "Failed to connect to the Anthropic API",
          { provider: "anthropic" }
        );
      }

      if (error instanceof Anthropic.APIError) {
        console.error(
          "[AnthropicProvider] API error:",
          error.status,
          error.message
        );

        if (error.status === 401) {
          throw new DPPGenerationError(
            "Anthropic authentication failed: invalid or missing API key",
            { provider: "anthropic", status: error.status }
          );
        }

        if (error.status === 403) {
          throw new DPPGenerationError(
            "Anthropic authorization failed: insufficient permissions",
            { provider: "anthropic", status: error.status }
          );
        }

        if (error.status === 429) {
          throw new DPPGenerationError(
            "Anthropic rate limit exceeded — please retry later",
            { provider: "anthropic", status: error.status }
          );
        }

        if (error.status === 500 || error.status === 503) {
          throw new DPPGenerationError(
            "Anthropic service unavailable — please retry later",
            { provider: "anthropic", status: error.status }
          );
        }

        throw new DPPGenerationError(
          `Anthropic API error: ${error.message}`,
          { provider: "anthropic", status: error.status }
        );
      }

      console.error("[AnthropicProvider] Unknown error:", error);
      throw new DPPGenerationError(
        error instanceof Error ? error.message : "An unexpected error occurred",
        { provider: "anthropic" }
      );
    }
  }
}
