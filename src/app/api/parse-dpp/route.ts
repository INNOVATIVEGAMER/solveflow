import { type NextRequest } from "next/server";
import { createProviderFromEnv } from "@/lib/ai/factory";
import { DPPSchema } from "@/lib/ai/schema";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { DPPGenerationError } from "@/lib/ai/types";
import type { DPP } from "@/lib/ai/schema";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid multipart/form-data request" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No PDF file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return Response.json({ error: "Only PDF files are accepted" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return Response.json({ error: "File too large. Maximum size is 50MB." }, { status: 400 });
  }

  let provider;
  try {
    provider = createProviderFromEnv();
  } catch (err) {
    if (err instanceof DPPGenerationError && err.message.includes("LLM_API_KEY")) {
      return Response.json({ error: "AI service not configured" }, { status: 503 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  let pdfBase64: string;
  try {
    const arrayBuffer = await file.arrayBuffer();
    pdfBase64 = Buffer.from(arrayBuffer).toString("base64");
  } catch {
    return Response.json({ error: "Failed to read uploaded file" }, { status: 400 });
  }

  let result;
  try {
    result = await provider.generateFromPDF<DPP>(pdfBase64, {
      systemPrompt: SYSTEM_PROMPT,
    });
  } catch (err) {
    if (err instanceof DPPGenerationError) {
      return Response.json({ error: err.message }, { status: 500 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  const parseResult = DPPSchema.safeParse(result.data);

  if (!parseResult.success) {
    console.error("[parse-dpp] AI returned invalid data structure:", parseResult.error.message);
    return Response.json(
      { error: "AI returned invalid data structure", details: parseResult.error.message },
      { status: 422 }
    );
  }

  return Response.json(
    { dpp: parseResult.data, model: result.model, usage: result.usage },
    { status: 200 }
  );
}
