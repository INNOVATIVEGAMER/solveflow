/**
 * AI Abstraction Layer — DPP Schema
 *
 * Zod schema mirroring the exact structure of public/demo/dpp.json.
 * We use z.toJSONSchema() (Zod v4) to derive a JSON Schema that is then
 * passed as a tool definition to the LLM, forcing structured output.
 *
 * Color values map to Tailwind color classes used in the UI.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

const OptionSchema = z.object({
  key: z
    .enum(["A", "B", "C", "D"])
    .describe("Option identifier — one of A, B, C, or D"),
  text: z
    .string()
    .describe(
      "Option text; may contain inline LaTeX delimited by $...$"
    ),
});

const QuestionSchema = z.object({
  id: z
    .string()
    .describe(
      "Unique question identifier. Use a subject-prefix + number, e.g. P1, C3, B2."
    ),
  topic: z
    .string()
    .describe("Topic or chapter name this question belongs to"),
  text: z
    .string()
    .describe(
      "Full question text. Use $...$ for inline LaTeX and $$...$$ for display LaTeX."
    ),
  options: z
    .array(OptionSchema)
    .length(4)
    .describe("Exactly four answer options labelled A through D"),
  correct: z
    .enum(["A", "B", "C", "D"])
    .describe("The key of the correct option"),
  marks: z
    .number()
    .int()
    .describe("Marks awarded for a correct answer (default 4)"),
  solution: z
    .string()
    .describe(
      "Step-by-step solution. Use $...$ for inline LaTeX and $$...$$ for display LaTeX."
    ),
});

const SubjectColorSchema = z
  .enum(["cyan", "purple", "green", "blue", "orange", "red", "yellow"])
  .describe(
    "Tailwind color class used for this subject's UI accent. " +
      "Convention: Physics → cyan, Chemistry → purple, Biology → green. " +
      "Choose the most fitting color for other subjects."
  );

const SubjectSchema = z.object({
  name: z.string().describe("Subject name, e.g. Physics, Chemistry, Biology"),
  color: SubjectColorSchema,
  icon: z
    .string()
    .describe("A single emoji that represents the subject, e.g. ⚛ 🧪 🧬"),
  questions: z
    .array(QuestionSchema)
    .min(1)
    .describe("All MCQ questions extracted from the PDF for this subject"),
});

// ---------------------------------------------------------------------------
// Root DPP schema
// ---------------------------------------------------------------------------

export const DPPSchema = z.object({
  title: z
    .string()
    .describe(
      "Title of the practice paper, e.g. 'DPP #1 — Mixed Revision'"
    ),
  subtitle: z
    .string()
    .describe(
      "Subtitle listing the subjects covered, e.g. 'Physics · Chemistry · Biology'"
    ),
  target: z
    .string()
    .describe(
      "Target exam and year, e.g. 'NEET 2025' or 'JEE Advanced 2026'"
    ),
  class: z
    .string()
    .describe("Class or grade level, e.g. '12' or '11'"),
  date: z
    .string()
    .describe("ISO 8601 date this DPP was generated, e.g. '2026-02-24'"),
  instructions: z
    .string()
    .describe(
      "Exam instructions shown to the student, e.g. marking scheme details"
    ),
  subjects: z
    .array(SubjectSchema)
    .min(1)
    .describe(
      "All subjects found in the PDF, each containing their extracted questions"
    ),
});

export type DPP = z.infer<typeof DPPSchema>;

// ---------------------------------------------------------------------------
// JSON Schema + Tool definition
// ---------------------------------------------------------------------------

/**
 * JSON Schema derived from the Zod schema.
 * Passed as the `input_schema` / `parameters` of the LLM tool definition.
 *
 * Note: Zod v4's toJSONSchema() produces a flat, inline schema (no $defs)
 * which is compatible with both Anthropic's and Gemini's tool calling APIs.
 */
export const DPP_JSON_SCHEMA = z.toJSONSchema(DPPSchema) as Record<
  string,
  unknown
>;

/**
 * Tool definition passed to LLM providers.
 * The `input_schema` field satisfies Anthropic's Tool interface.
 * The `name` and `description` are also used by the Gemini function declaration.
 */
export const DPP_TOOL = {
  name: "generate_dpp",
  description:
    "Extract all MCQ questions from the provided PDF and return a fully structured " +
    "Daily Practice Paper (DPP) JSON. Group questions by subject. " +
    "Preserve all mathematical expressions using LaTeX notation.",
  input_schema: DPP_JSON_SCHEMA,
} as const;
