/**
 * AI Abstraction Layer — Types
 *
 * Core types and interfaces for the DPP generation AI layer.
 * Providers implement ILLMProvider to ensure a consistent API surface
 * regardless of the underlying model (Gemini, Anthropic, etc.).
 */

// ---------------------------------------------------------------------------
// Provider type discriminant
// ---------------------------------------------------------------------------

export const LLMProviderType = {
  anthropic: "anthropic",
  gemini: "gemini",
  openai: "openai", // placeholder — not yet implemented
  mock: "mock", // placeholder — useful for testing
} as const;

export type LLMProviderType = (typeof LLMProviderType)[keyof typeof LLMProviderType];

// ---------------------------------------------------------------------------
// Options and results
// ---------------------------------------------------------------------------

export interface PDFGenerationOptions {
  /** Maximum tokens the model may generate in the response. */
  maxTokens?: number;
  /** Optional system-level instructions prepended to every request. */
  systemPrompt?: string;
}

export interface ToolCallResult<T> {
  /** The structured data extracted via tool calling. */
  data: T;
  /** Token usage reported by the provider (may be undefined for some providers). */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  /** The model identifier that produced the result. */
  model: string;
}

// ---------------------------------------------------------------------------
// Provider interface
// ---------------------------------------------------------------------------

export interface ILLMProvider {
  /**
   * Parse a PDF and return structured output of type T.
   *
   * @param pdfBase64 - The PDF file contents encoded as a base64 string.
   * @param options   - Optional generation parameters.
   * @returns A promise that resolves with the extracted structured data.
   * @throws {DPPGenerationError} on any provider or API error.
   */
  generateFromPDF<T>(
    pdfBase64: string,
    options?: PDFGenerationOptions
  ): Promise<ToolCallResult<T>>;

  /** Which provider family this instance belongs to. */
  readonly providerType: LLMProviderType;

  /** The exact model identifier used for requests (e.g. "gemini-2.0-flash"). */
  readonly modelId: string;
}

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

export interface LLMProviderConfig {
  /** API key for the provider. Falls back to the LLM_API_KEY env var. */
  apiKey?: string;
  /** Model identifier override. Falls back to the provider's default. */
  model?: string;
  /** Default maximum tokens if not specified per-request. */
  defaultMaxTokens?: number;
  /** Request timeout in milliseconds. */
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class DPPGenerationError extends Error {
  readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = "DPPGenerationError";
    this.context = context;

    // Maintain proper prototype chain across transpilation targets.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
