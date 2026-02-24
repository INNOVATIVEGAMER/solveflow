import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { buildTypstDocument } from "@/lib/pdf/template";

// Allow up to 60s on Hobby plan — Typst compiles in ~2-3s, buffer for cold start
export const maxDuration = 60;

// ── Pick the correct binary for the current platform ──────────────────────────
function getTypstBinary(): string {
  const binDir = join(process.cwd(), "scripts", "bin");
  if (process.platform === "linux") {
    return join(binDir, "typst-linux-x64");
  }
  // macOS arm64 (local dev)
  return join(binDir, "typst-mac-arm64");
}

// ── Run typst compile ─────────────────────────────────────────────────────────
function runTypst(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const binary = getTypstBinary();
    const proc = spawn(binary, ["compile", inputPath, outputPath], {
      timeout: 45_000,
    });

    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Typst exited with code ${code}:\n${stderr}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn typst: ${err.message}`));
    });
  });
}

// ── POST /api/generate-pdf ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let typPath: string | null = null;
  let pdfPath: string | null = null;

  try {
    const body = await request.json() as { dpp: unknown };
    if (!body?.dpp) {
      return NextResponse.json({ error: "Missing dpp data" }, { status: 400 });
    }

    // Build the Typst source
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typSource = buildTypstDocument(body.dpp as any);

    // Write to /tmp (the only writable dir in serverless)
    const ts = Date.now();
    typPath = join("/tmp", `dpp-${ts}.typ`);
    pdfPath = join("/tmp", `dpp-${ts}.pdf`);

    await writeFile(typPath, typSource, "utf8");

    // Compile
    await runTypst(typPath, pdfPath);

    // Read the PDF
    const pdfBytes = await readFile(pdfPath);

    // Determine filename from dpp data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dpp = body.dpp as any;
    const safeTitle = (dpp.title as string ?? "dpp")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 60);
    const filename = `${safeTitle}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBytes.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF generation failed";
    console.error("[generate-pdf]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    // Clean up /tmp files
    if (typPath) await unlink(typPath).catch(() => null);
    if (pdfPath) await unlink(pdfPath).catch(() => null);
  }
}
