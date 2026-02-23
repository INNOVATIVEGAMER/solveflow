"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MathMarkdown from "@/components/shared/math-markdown";
import { Navbar } from "@/components/layout/navbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option { key: string; text: string; }
interface Question {
  id: string; topic: string; text: string;
  options: Option[]; correct: string; marks: number; solution: string;
}
interface Subject { name: string; color: string; icon: string; questions: Question[]; }
interface DppData {
  title: string; subtitle: string; target: string;
  class: string; date: string; instructions: string; subjects: Subject[];
}

type QuestionStatus =
  | "pending"       // not reviewed yet
  | "approved"      // teacher approved AI answer as-is
  | "uploading"     // handwritten image uploaded, fake pipeline running
  | "parsing"       // pipeline done, parsed solution shown, awaiting teacher decision
  | "corrected"     // teacher approved parsed handwritten solution
  | "reported";     // teacher reported failure

interface QuestionState {
  status: QuestionStatus;
  uploadedImageUrl?: string;    // object URL of uploaded image
  parsedSolution?: string;      // "pipeline result" (we reuse AI solution as demo)
  parseProgress?: number;       // 0-100 fake progress
}

interface TeacherReviewProps { initialData: DppData | null; }

// ─── Pipeline stages copy ─────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  "Preprocessing image…",
  "Running OCR…",
  "Parsing LaTeX expressions…",
  "Structuring solution steps…",
  "Finalising…",
];

// ─── Colour map ───────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  cyan:   { bg: "bg-cyan-500/10",   border: "border-cyan-500/30",   text: "text-cyan-400",   badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  green:  { bg: "bg-green-500/10",  border: "border-green-500/30",  text: "text-green-400",  badge: "bg-green-500/20 text-green-300 border-green-500/30" },
};

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: QuestionStatus }) {
  const map: Record<QuestionStatus, { label: string; cls: string }> = {
    pending:   { label: "Pending",    cls: "bg-white/10 text-white/40 border-white/10" },
    approved:  { label: "Approved",   cls: "bg-green-500/20 text-green-400 border-green-500/30" },
    uploading: { label: "Processing", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    parsing:   { label: "Parsed — review", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    corrected: { label: "Corrected",  cls: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    reported:  { label: "Reported",   cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Pipeline progress bar ────────────────────────────────────────────────────

function PipelineProgress({ progress }: { progress: number }) {
  const stageIndex = Math.min(Math.floor(progress / 20), PIPELINE_STAGES.length - 1);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
          {PIPELINE_STAGES[stageIndex]}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── Single question review card ──────────────────────────────────────────────

function QuestionReviewCard({
  q,
  index,
  qState,
  colors,
  onApprove,
  onImageUpload,
  onApproveParsed,
  onReport,
}: {
  q: Question;
  index: number;
  qState: QuestionState;
  colors: (typeof colorMap)[string];
  onApprove: () => void;
  onImageUpload: (file: File) => void;
  onApproveParsed: () => void;
  onReport: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status } = qState;

  const isDone = status === "approved" || status === "corrected" || status === "reported";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-xl border bg-white/[0.03] overflow-hidden transition-all ${
        status === "approved" || status === "corrected"
          ? "border-green-500/20"
          : status === "reported"
          ? "border-red-500/20"
          : status === "parsing"
          ? "border-blue-500/30"
          : status === "uploading"
          ? "border-yellow-500/20"
          : colors.border
      }`}
    >
      {/* ── Card header ── */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${colors.badge}`}>
          {q.id}
        </span>
        <span className="text-xs text-white/50 flex-shrink-0 hidden sm:block">{q.topic}</span>
        <p className="flex-1 text-sm text-white/70 truncate min-w-0">{q.text.replace(/\$[^$]+\$/g, "…")}</p>
        <StatusBadge status={status} />
        <span className="text-white/30 text-xs ml-1">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* ── Expanded body ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`border-t ${colors.border} px-4 py-4 space-y-4`}>

              {/* Question text */}
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Question</p>
                <div className="text-sm text-white/85 leading-relaxed">
                  <MathMarkdown content={q.text} />
                </div>
                {q.options.length > 0 && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {q.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                          opt.key === q.correct
                            ? "border-green-500/40 bg-green-500/10 text-green-300"
                            : "border-white/10 text-white/50"
                        }`}
                      >
                        <span className={`font-bold flex-shrink-0 ${opt.key === q.correct ? "text-green-400" : "text-white/40"}`}>
                          {opt.key}
                        </span>
                        <MathMarkdown content={opt.text} />
                        {opt.key === q.correct && <span className="flex-shrink-0 text-green-400 ml-auto">✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI-generated solution */}
              <div className={`rounded-lg border ${colors.border} ${colors.bg} px-4 py-3`}>
                <div className="flex items-center gap-2 mb-2">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
                    AI-Generated Solution
                  </p>
                  <span className="text-xs text-white/30">· auto-generated by SolveFlow</span>
                </div>
                <div className="text-sm text-white/75 leading-relaxed">
                  <MathMarkdown content={q.solution} />
                </div>
              </div>

              {/* ── Pipeline progress (uploading state) ── */}
              {status === "uploading" && qState.parseProgress !== undefined && (
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
                  <p className="text-xs font-semibold text-yellow-400 mb-2">Processing handwritten solution…</p>
                  {qState.uploadedImageUrl && (
                    <img
                      src={qState.uploadedImageUrl}
                      alt="Uploaded solution"
                      className="w-full max-h-48 object-contain rounded-lg border border-white/10 mb-3 bg-white/5"
                    />
                  )}
                  <PipelineProgress progress={qState.parseProgress} />
                </div>
              )}

              {/* ── Parsed result (parsing state) — awaiting teacher decision ── */}
              {status === "parsing" && (
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-blue-400">Pipeline complete — parsed solution</p>
                    <span className="text-xs text-white/30">· from your handwritten upload</span>
                  </div>
                  {qState.uploadedImageUrl && (
                    <div className="flex gap-3 items-start">
                      <img
                        src={qState.uploadedImageUrl}
                        alt="Uploaded solution"
                        className="w-24 h-24 object-cover rounded-lg border border-white/10 bg-white/5 flex-shrink-0"
                      />
                      <div className="flex-1 text-sm text-white/80 leading-relaxed">
                        <MathMarkdown content={qState.parsedSolution ?? q.solution} />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={onApproveParsed}
                      className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black font-semibold text-sm transition-colors"
                    >
                      Approve this solution
                    </button>
                    <button
                      onClick={onReport}
                      className="flex-1 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold text-sm transition-colors"
                    >
                      Report issue
                    </button>
                  </div>
                </div>
              )}

              {/* ── Corrected badge ── */}
              {status === "corrected" && (
                <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-3 flex items-center gap-3">
                  {qState.uploadedImageUrl && (
                    <img
                      src={qState.uploadedImageUrl}
                      alt="Teacher solution"
                      className="w-14 h-14 object-cover rounded border border-white/10 flex-shrink-0"
                    />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-purple-400">Teacher correction applied</p>
                    <p className="text-xs text-white/40 mt-0.5">Handwritten solution parsed and approved</p>
                  </div>
                </div>
              )}

              {/* ── Reported badge ── */}
              {status === "reported" && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-xs font-semibold text-red-400">Reported — sent to SolveFlow support</p>
                  <p className="text-xs text-white/40 mt-0.5">Our team will review this question and re-process.</p>
                </div>
              )}

              {/* ── Action buttons (pending state only) ── */}
              {status === "pending" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={onApprove}
                    className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black font-semibold text-sm transition-colors"
                  >
                    Approve AI solution
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 font-semibold text-sm transition-colors flex items-center gap-2"
                  >
                    ✏️ Upload handwritten correction
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

              {/* ── Re-upload option when already approved or corrected ── */}
              {isDone && status !== "reported" && (
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-white/30 hover:text-white/50 transition-colors"
                  >
                    Upload new correction
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

type PagePhase = "upload" | "processing" | "review" | "published";

export default function TeacherReview({ initialData }: TeacherReviewProps) {
  const [dpp, setDpp] = useState<DppData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<PagePhase>("upload");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeSubject, setActiveSubject] = useState(0);

  // Per-question state keyed by question id
  const [qStates, setQStates] = useState<Record<string, QuestionState>>({});

  // Fake PDF upload file name
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Client-side fetch fallback
  useEffect(() => {
    if (!dpp) {
      fetch("/demo/dpp.json")
        .then((r) => r.json())
        .then((data) => { setDpp(data); setLoading(false); })
        .catch(() => { setError("Failed to load demo data."); setLoading(false); });
    }
  }, [dpp]);

  // ── Fake upload pipeline simulation ──
  function startFakeUpload(fileName: string) {
    setUploadedFileName(fileName);
    setPhase("processing");
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase("review"), 400);
          return 100;
        }
        return p + 2;
      });
    }, 80); // ~4 seconds total
  }

  // ── Per-question pipeline simulation ──
  function startQuestionPipeline(qId: string, file: File) {
    const imageUrl = URL.createObjectURL(file);
    setQStates((prev) => ({
      ...prev,
      [qId]: { status: "uploading", uploadedImageUrl: imageUrl, parseProgress: 0 },
    }));

    const interval = setInterval(() => {
      setQStates((prev) => {
        const cur = prev[qId];
        if (!cur || cur.status !== "uploading") { clearInterval(interval); return prev; }
        const next = (cur.parseProgress ?? 0) + 3.5;
        if (next >= 100) {
          clearInterval(interval);
          // get parsed solution from dpp data
          const parsedSolution = dpp?.subjects
            .flatMap((s) => s.questions)
            .find((q) => q.id === qId)?.solution ?? "";
          return {
            ...prev,
            [qId]: { ...cur, status: "parsing", parseProgress: 100, parsedSolution },
          };
        }
        return { ...prev, [qId]: { ...cur, parseProgress: next } };
      });
    }, 60); // ~3 seconds
  }

  function approveQuestion(qId: string) {
    setQStates((prev) => ({ ...prev, [qId]: { status: "approved" } }));
  }

  function approveParsedQuestion(qId: string) {
    setQStates((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], status: "corrected" },
    }));
  }

  function reportQuestion(qId: string) {
    setQStates((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], status: "reported" },
    }));
  }

  function handlePublish() {
    setPhase("published");
  }

  // ── Helpers ──
  function allQuestions() {
    return dpp?.subjects.flatMap((s) => s.questions) ?? [];
  }

  function reviewedCount() {
    return allQuestions().filter((q) => {
      const s = qStates[q.id]?.status;
      return s === "approved" || s === "corrected" || s === "reported";
    }).length;
  }

  // ─── Loading / error ──

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error || !dpp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-400 text-sm">{error ?? "Something went wrong."}</p>
      </div>
    );
  }

  const total = allQuestions().length;
  const reviewed = reviewedCount();
  const currentSubject = dpp.subjects[activeSubject];
  const colors = colorMap[currentSubject.color] ?? colorMap.cyan;

  // ─── Phase: Upload ────────────────────────────────────────────────────────

  if (phase === "upload") {
    return (
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <div className="h-14" />

        <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
          {/* Step indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            {["Upload PDF", "AI Processing", "Review & Publish"].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${
                  i === 0 ? "border-cyan-500 bg-cyan-500/20 text-cyan-400" : "border-white/20 text-white/30"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-sm ${i === 0 ? "text-white" : "text-white/30"}`}>{step}</span>
                {i < 2 && <span className="text-white/20 text-xs mx-1">→</span>}
              </div>
            ))}
          </div>

          {/* Upload zone */}
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Upload DPP Sheet</h2>
            <p className="text-white/50 text-sm mb-6">
              Upload the PDF of your Daily Practice Paper. Our AI pipeline will parse all questions and generate detailed solutions automatically.
            </p>

            <div
              className="rounded-2xl border-2 border-dashed border-white/20 hover:border-cyan-500/50 bg-white/[0.02] hover:bg-cyan-500/5 transition-all cursor-pointer p-6 sm:p-12 text-center"
              onClick={() => pdfInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) startFakeUpload(file.name);
              }}
            >
              <div className="text-4xl mb-3">📄</div>
              <p className="text-white font-semibold mb-1">Drop your DPP PDF here</p>
              <p className="text-white/40 text-sm mb-4">or click to browse</p>
              <button className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors">
                Browse PDF
              </button>
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) startFakeUpload(file.name);
                  e.target.value = "";
                }}
              />
            </div>

            <p className="text-center mt-4 text-xs text-white/30">
              Supported: PDF only · Max 50 MB · Multi-page supported
            </p>
          </div>

          {/* What happens next */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 space-y-3">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">What happens after upload</p>
            {[
              { icon: "🔍", title: "OCR & Parsing", desc: "Questions, options and marks are extracted from the PDF" },
              { icon: "🤖", title: "AI Solution Generation", desc: "Step-by-step solutions generated for every question" },
              { icon: "✅", title: "Teacher Review", desc: "You review each answer, approve or upload a handwritten correction" },
              { icon: "🚀", title: "Publish to Students", desc: "Solutions unlock for students once you hit Publish" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Demo shortcut */}
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 flex items-center gap-3">
            <span className="text-yellow-400 text-lg">⚡</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-yellow-400">Demo shortcut</p>
              <p className="text-xs text-white/40">Skip the upload — jump straight to the review stage with pre-loaded data.</p>
            </div>
            <button
              onClick={() => startFakeUpload("NEET_DPP_1_Class12.pdf")}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs font-semibold transition-colors"
            >
              Skip to review →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Phase: Processing ────────────────────────────────────────────────────

  if (phase === "processing") {
    const stages = [
      { label: "Uploading PDF", threshold: 10 },
      { label: "Extracting pages & images", threshold: 25 },
      { label: "Running OCR on questions", threshold: 45 },
      { label: "Parsing options & marks", threshold: 60 },
      { label: "Generating AI solutions", threshold: 80 },
      { label: "Structuring final JSON", threshold: 95 },
      { label: "Ready for review", threshold: 100 },
    ];
    const currentStage = stages.filter((s) => uploadProgress >= s.threshold).at(-1);

    return (
      <div className="min-h-screen bg-background text-white flex flex-col px-4">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-xl font-bold text-white mb-1">Processing your DPP</h2>
            <p className="text-white/50 text-sm">{uploadedFileName}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
                {currentStage?.label ?? "Starting…"}
              </span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Stage checklist */}
          <div className="space-y-2">
            {stages.slice(0, -1).map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                {uploadProgress >= s.threshold ? (
                  <span className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 text-xs">✓</span>
                  </span>
                ) : uploadProgress >= s.threshold - 15 ? (
                  <span className="w-4 h-4 rounded-full border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0" />
                )}
                <span className={uploadProgress >= s.threshold ? "text-white/70" : "text-white/25"}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-white/25">
            This usually takes 30–90 seconds depending on DPP length
          </p>
        </div>
        </div>
      </div>
    );
  }

  // ─── Phase: Published ────────────────────────────────────────────────────

  if (phase === "published") {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="text-6xl">🚀</div>
          <div>
            <h2 className="text-2xl font-bold text-white">DPP Published!</h2>
            <p className="text-white/50 text-sm mt-2">Solutions are now live for your students.</p>
          </div>
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-left space-y-2">
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">Summary</p>
            {dpp.subjects.map((subj) => {
              const c = colorMap[subj.color] ?? colorMap.cyan;
              const approved = subj.questions.filter((q) => {
                const s = qStates[q.id]?.status;
                return s === "approved" || s === "corrected";
              }).length;
              const corrected = subj.questions.filter((q) => qStates[q.id]?.status === "corrected").length;
              return (
                <div key={subj.name} className="flex items-center justify-between">
                  <span className={`text-sm ${c.text}`}>{subj.icon} {subj.name}</span>
                  <span className="text-xs text-white/50">
                    {approved}/{subj.questions.length} approved
                    {corrected > 0 && <span className="text-purple-400 ml-1">({corrected} corrected)</span>}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <a
              href="/demo/student"
              className="flex-1 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors text-center"
            >
              View student side →
            </a>
            <button
              onClick={() => setPhase("review")}
              className="flex-1 py-2.5 rounded-lg border border-white/20 text-white/60 hover:text-white hover:border-white/40 font-semibold text-sm transition-colors"
            >
              Back to review
            </button>
          </div>
        </motion.div>
        </div>
      </div>
    );
  }

  // ─── Phase: Review ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />

      {/* ── Top bar ── */}
      <header className="sticky top-14 z-30 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate">{dpp.title}</h1>
            <p className="text-xs text-white/40">{dpp.target} · Class {dpp.class} · {uploadedFileName}</p>
          </div>
          {/* Progress */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-white/40 mb-0.5">Reviewed</p>
            <span className={`text-sm font-bold ${reviewed === total ? "text-green-400" : "text-white"}`}>
              {reviewed}/{total}
            </span>
          </div>
          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={reviewed === 0}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold text-xs transition-colors"
          >
            Publish DPP
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-green-500"
            animate={{ width: `${total > 0 ? (reviewed / total) * 100 : 0}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── Review summary banner ── */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{dpp.title}</h2>
              <p className="text-white/50 text-sm mt-0.5">AI parsing complete · ready for review</p>
            </div>
            <div className="flex gap-4 text-center">
              {[
                { label: "Total", value: total, cls: "text-white" },
                { label: "Approved", value: allQuestions().filter((q) => qStates[q.id]?.status === "approved").length, cls: "text-green-400" },
                { label: "Corrected", value: allQuestions().filter((q) => qStates[q.id]?.status === "corrected").length, cls: "text-purple-400" },
                { label: "Pending", value: total - reviewed, cls: "text-yellow-400" },
              ].map(({ label, value, cls }) => (
                <div key={label}>
                  <p className="text-xs text-white/40">{label}</p>
                  <p className={`text-xl font-bold ${cls}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/30 mt-3 border-t border-white/10 pt-3">
            Approve AI answers as-is, or upload a handwritten correction. The solution goes through our pipeline and comes back parsed — you then approve or report.
          </p>
        </div>

        {/* ── Subject tabs ── */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {dpp.subjects.map((subj, i) => {
            const c = colorMap[subj.color] ?? colorMap.cyan;
            const isActive = i === activeSubject;
            const done = subj.questions.filter((q) => {
              const s = qStates[q.id]?.status;
              return s === "approved" || s === "corrected" || s === "reported";
            }).length;
            return (
              <button
                key={subj.name}
                onClick={() => setActiveSubject(i)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive ? `${c.bg} ${c.text} border ${c.border}` : "text-white/50 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <span className="hidden sm:inline">{subj.icon}</span>
                <span>{subj.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? `${c.badge} border` : "bg-white/10 text-white/40"
                }`}>
                  {done}/{subj.questions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Quick actions ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white/30">Quick actions:</span>
          <button
            onClick={() => {
              const pending = currentSubject.questions.filter(
                (q) => !qStates[q.id] || qStates[q.id].status === "pending"
              );
              const updates: Record<string, QuestionState> = {};
              pending.forEach((q) => { updates[q.id] = { status: "approved" }; });
              setQStates((prev) => ({ ...prev, ...updates }));
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
          >
            Approve all in {currentSubject.name}
          </button>
          <button
            onClick={() => {
              const allQ = dpp.subjects.flatMap((s) => s.questions);
              const updates: Record<string, QuestionState> = {};
              allQ.forEach((q) => {
                if (!qStates[q.id] || qStates[q.id].status === "pending") {
                  updates[q.id] = { status: "approved" };
                }
              });
              setQStates((prev) => ({ ...prev, ...updates }));
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-white/40 hover:text-white/60 hover:border-white/30 transition-colors"
          >
            Approve all pending
          </button>
        </div>

        {/* ── Question cards ── */}
        <div className="space-y-3">
          {currentSubject.questions.map((q, i) => (
            <QuestionReviewCard
              key={q.id}
              q={q}
              index={i}
              qState={qStates[q.id] ?? { status: "pending" }}
              colors={colors}
              onApprove={() => approveQuestion(q.id)}
              onImageUpload={(file) => startQuestionPipeline(q.id, file)}
              onApproveParsed={() => approveParsedQuestion(q.id)}
              onReport={() => reportQuestion(q.id)}
            />
          ))}
        </div>

        {/* ── Bottom publish bar ── */}
        <div className="sticky bottom-0 pb-4 pt-2">
          <div className="rounded-xl border border-white/10 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-4">
            <div className="text-sm text-white/50">
              <span className="text-white font-medium">{reviewed}</span> of{" "}
              <span className="text-white font-medium">{total}</span> reviewed
              {reviewed < total && (
                <span className="text-white/30 ml-1">· {total - reviewed} pending</span>
              )}
            </div>
            <button
              onClick={handlePublish}
              disabled={reviewed === 0}
              className="px-5 py-2 rounded-lg bg-green-500 hover:bg-green-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors"
            >
              {reviewed < total ? `Publish anyway (${reviewed}/${total})` : "Publish DPP 🚀"}
            </button>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
