"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MathMarkdown from "@/components/shared/math-markdown";
import { Navbar } from "@/components/layout/navbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
  key: string;
  text: string;
}

interface Question {
  id: string;
  topic: string;
  text: string;
  options: Option[];
  correct: string;
  marks: number;
  solution: string;
}

interface Subject {
  name: string;
  color: string;
  icon: string;
  questions: Question[];
}

interface DppData {
  title: string;
  subtitle: string;
  target: string;
  class: string;
  date: string;
  instructions: string;
  subjects: Subject[];
}

interface StudentDppProps {
  initialData: DppData | null;
}

// ─── LocalStorage key ─────────────────────────────────────────────────────────

const LS_KEY = "solveflow_demo_dpp_state";

interface PersistedState {
  answers: Record<string, string>;
  revealedIds: string[];
  submitted: boolean;
  teacherVerified: boolean;
}

function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function saveState(s: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {
    // quota exceeded — ignore
  }
}

// ─── Colour map ───────────────────────────────────────────────────────────────

const colorMap: Record<
  string,
  { bg: string; border: string; text: string; badge: string; ring: string }
> = {
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    ring: "ring-cyan-500",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    ring: "ring-purple-500",
  },
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    badge: "bg-green-500/20 text-green-300 border-green-500/30",
    ring: "ring-green-500",
  },
};

// ─── QuestionCard ─────────────────────────────────────────────────────────────

function QuestionCard({
  q,
  index,
  selected,
  revealed,
  locked,        // true if solution revealed — answer cannot change
  onSelect,
  colors,
}: {
  q: Question;
  index: number;
  selected: string | null;
  revealed: boolean;
  locked: boolean;
  onSelect: (key: string) => void;
  colors: (typeof colorMap)[string];
}) {
  const isCorrect = selected === q.correct;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border bg-white/[0.03] ${colors.border} overflow-hidden`}
    >
      {/* Question header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b ${colors.border} ${colors.bg}`}>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}>
          {q.id}
        </span>
        <span className="text-xs text-white/50">{q.topic}</span>
        {locked && (
          <span className="text-xs text-white/30 flex items-center gap-1">
            🔒 <span>locked</span>
          </span>
        )}
        <span className="ml-auto text-xs text-white/40">{q.marks} marks</span>
      </div>

      {/* Question text */}
      <div className="px-4 pt-4 pb-3 text-sm text-white/90 leading-relaxed">
        <MathMarkdown content={q.text} />
      </div>

      {/* Options */}
      <div className="px-4 pb-4 space-y-2">
        {q.options.map((opt) => {
          const isSelected = selected === opt.key;
          const isThisCorrect = opt.key === q.correct;

          let optClass =
            "flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-all duration-200 text-sm ";

          if (revealed) {
            // After reveal — show correct/wrong
            if (isThisCorrect) {
              optClass += "border-green-500 bg-green-500/10 cursor-default ";
            } else if (isSelected && !isThisCorrect) {
              optClass += "border-red-500 bg-red-500/10 cursor-default ";
            } else {
              optClass += "border-white/10 opacity-50 cursor-default ";
            }
          } else if (locked) {
            // Locked (submitted) but not yet revealed — greyed, no hover
            optClass += isSelected
              ? "border-white/40 bg-white/10 cursor-default "
              : "border-white/10 opacity-60 cursor-default ";
          } else {
            // Normal selectable state
            optClass += isSelected
              ? "border-white/50 bg-white/10 cursor-pointer "
              : "border-white/10 hover:border-white/25 hover:bg-white/5 cursor-pointer ";
          }

          return (
            <div
              key={opt.key}
              className={optClass}
              onClick={() => !locked && !revealed && onSelect(opt.key)}
            >
              {/* Key bubble */}
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold mt-0.5 ${
                  revealed && isThisCorrect
                    ? "border-green-400 text-green-400 bg-green-400/20"
                    : revealed && isSelected && !isThisCorrect
                    ? "border-red-400 text-red-400 bg-red-400/20"
                    : isSelected
                    ? "border-white text-white bg-white/20"
                    : "border-white/20 text-white/50"
                }`}
              >
                {opt.key}
              </span>

              <div className="flex-1 text-white/80 leading-relaxed">
                <MathMarkdown content={opt.text} />
              </div>

              {revealed && isThisCorrect && (
                <span className="flex-shrink-0 text-green-400 mt-0.5">✓</span>
              )}
              {revealed && isSelected && !isThisCorrect && (
                <span className="flex-shrink-0 text-red-400 mt-0.5">✗</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Solution panel */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className={`mx-4 mb-4 rounded-lg border ${colors.border} ${colors.bg} px-4 py-3`}>
              <p className={`text-xs font-semibold mb-2 ${colors.text} uppercase tracking-wider`}>
                Solution
              </p>
              <div className="text-sm text-white/75 leading-relaxed">
                <MathMarkdown content={q.solution} />
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
                {selected === null ? (
                  <>
                    <span className="text-white/40 text-xs font-semibold">0 marks</span>
                    <span className="text-white/30 text-xs">
                      Not attempted · correct answer was {q.correct}
                    </span>
                  </>
                ) : isCorrect ? (
                  <>
                    <span className="text-green-400 text-xs font-semibold">+4 marks</span>
                    <span className="text-white/30 text-xs">Correct!</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-400 text-xs font-semibold">−1 mark</span>
                    <span className="text-white/30 text-xs">Correct answer was {q.correct}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function StudentDpp({ initialData }: StudentDppProps) {
  const [dpp, setDpp] = useState<DppData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const [activeSubject, setActiveSubject] = useState(0);

  // Core state — all persisted to localStorage
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [teacherVerified, setTeacherVerified] = useState(false);

  // Score shown in header/info — only computed after submission
  const [frozenScore, setFrozenScore] = useState<{
    score: number; attempted: number; correct: number; wrong: number; total: number;
  } | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setAnswers(saved.answers ?? {});
      setRevealedIds(new Set(saved.revealedIds ?? []));
      setSubmitted(saved.submitted ?? false);
      setTeacherVerified(saved.teacherVerified ?? false);
    }
  }, []);

  // Client-side DPP fetch fallback
  useEffect(() => {
    if (!dpp) {
      fetch("/demo/dpp.json")
        .then((r) => r.json())
        .then((data) => { setDpp(data); setLoading(false); })
        .catch(() => { setError("Failed to load DPP. Please refresh."); setLoading(false); });
    }
  }, [dpp]);

  // Persist to localStorage whenever state changes
  const persist = useCallback(
    (
      a: Record<string, string>,
      r: Set<string>,
      sub: boolean,
      tv: boolean,
    ) => {
      saveState({ answers: a, revealedIds: [...r], submitted: sub, teacherVerified: tv });
    },
    [],
  );

  // Recompute frozenScore whenever submitted + answers + dpp are ready
  useEffect(() => {
    if (!submitted || !dpp) return;
    let score = 0, attempted = 0, correct = 0, wrong = 0, total = 0;
    for (const subj of dpp.subjects) {
      for (const q of subj.questions) {
        total++;
        const ans = answers[q.id];
        if (ans) {
          attempted++;
          if (ans === q.correct) { score += 4; correct++; }
          else { score -= 1; wrong++; }
        }
      }
    }
    setFrozenScore({ score, attempted, correct, wrong, total });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, dpp]);

  // ── Handlers ──

  function handleSelect(qId: string, key: string) {
    // Block if already submitted OR if this question's solution is revealed
    if (submitted || revealedIds.has(qId)) return;
    const next = { ...answers, [qId]: key };
    setAnswers(next);
    persist(next, revealedIds, submitted, teacherVerified);
  }

  function handleRevealOne(qId: string) {
    // Only allowed if teacher has verified
    if (!teacherVerified) return;
    const next = new Set([...revealedIds, qId]);
    setRevealedIds(next);
    persist(answers, next, submitted, teacherVerified);
  }

  function handleSubmit() {
    if (!dpp) return;
    setSubmitted(true);
    persist(answers, revealedIds, true, teacherVerified);
  }

  function handleUnlockAll() {
    if (!dpp || !teacherVerified) return;
    const allIds = dpp.subjects.flatMap((s) => s.questions.map((q) => q.id));
    const next = new Set(allIds);
    setRevealedIds(next);
    persist(answers, next, submitted, teacherVerified);
  }

  function handleTeacherVerify() {
    const next = !teacherVerified;
    setTeacherVerified(next);
    persist(answers, revealedIds, submitted, next);
  }

  function handleReset() {
    if (typeof window !== "undefined") window.localStorage.removeItem(LS_KEY);
    setAnswers({});
    setRevealedIds(new Set());
    setSubmitted(false);
    setTeacherVerified(false);
    setFrozenScore(null);
  }

  // ── Loading / error ──

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/50 text-sm">Loading DPP…</p>
        </div>
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

  const currentSubject = dpp.subjects[activeSubject];
  const colors = colorMap[currentSubject.color] ?? colorMap.cyan;

  // Live attempt count (for bottom bar + tabs) — not scored
  const liveAttempted = Object.keys(answers).length;
  const total = dpp.subjects.reduce((a, s) => a + s.questions.length, 0);

  const subjectAttempted = (subj: Subject) =>
    subj.questions.filter((q) => answers[q.id]).length;

  const allSolutionsRevealed =
    dpp.subjects.every((s) => s.questions.every((q) => revealedIds.has(q.id)));

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />

      {/* ── Demo controls bar — sits below fixed navbar ── */}
      <div className="h-14" />
      <div className="bg-white/[0.03] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Demo controls</span>

          {/* Teacher Verified toggle */}
          <button
            onClick={handleTeacherVerify}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              teacherVerified
                ? "border-green-500/50 bg-green-500/15 text-green-400"
                : "border-white/15 bg-white/5 text-white/50 hover:border-white/30 hover:text-white/70"
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                teacherVerified ? "border-green-400 bg-green-400" : "border-white/30"
              }`}
            >
              {teacherVerified && (
                <svg viewBox="0 0 8 8" className="w-2 h-2 text-black" fill="currentColor">
                  <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              )}
            </span>
            Teacher Verified
          </button>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
          >
            ↺ Reset
          </button>

          <span className="text-xs text-white/25 hidden sm:inline">
            {teacherVerified
              ? "Solutions can be unlocked per-question or all at once"
              : "Toggle Teacher Verified to allow solutions to be revealed"}
          </span>
        </div>
      </div>

      {/* ── Main top bar ── */}
      <header className="sticky top-14 z-30 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">{dpp.title}</h1>
            <p className="text-xs text-white/40">{dpp.target} · Class {dpp.class}</p>
          </div>

          {/* Score — only shown after submission */}
          {frozenScore && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-white/40 mb-0.5">Score</p>
              <span className={`font-bold tabular-nums text-sm ${
                frozenScore.score >= frozenScore.total * 2.4
                  ? "text-green-400"
                  : frozenScore.score >= 0
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}>
                {frozenScore.score > 0 ? `+${frozenScore.score}` : frozenScore.score}
                <span className="text-white/30 font-normal text-xs ml-1">
                  /{frozenScore.total * 4}
                </span>
              </span>
            </div>
          )}

          {/* Action button area */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={liveAttempted === 0}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold text-xs transition-colors"
            >
              Submit DPP
            </button>
          ) : !allSolutionsRevealed ? (
            <button
              onClick={handleUnlockAll}
              disabled={!teacherVerified}
              title={!teacherVerified ? "Enable Teacher Verified to unlock" : undefined}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              {teacherVerified ? "🔓" : "🔒"} Show All Solutions
            </button>
          ) : (
            <span className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-semibold">
              Solutions Unlocked
            </span>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── DPP info banner ── */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{dpp.title}</h2>
              <p className="text-white/50 text-sm mt-0.5">
                {dpp.subtitle} ·{" "}
                {new Date(dpp.date).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-3 text-center">
              <div>
                <p className="text-xs text-white/40">Questions</p>
                <p className="text-xl font-bold text-white">{total}</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-xs text-white/40">Attempted</p>
                <p className="text-xl font-bold text-cyan-400">
                  {frozenScore?.attempted ?? liveAttempted}
                </p>
              </div>
              {frozenScore && (
                <>
                  <div className="w-px bg-white/10" />
                  <div>
                    <p className="text-xs text-white/40">Correct</p>
                    <p className="text-xl font-bold text-green-400">{frozenScore.correct}</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div>
                    <p className="text-xs text-white/40">Wrong</p>
                    <p className="text-xl font-bold text-red-400">{frozenScore.wrong}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-white/40 border-t border-white/10 pt-3">
            {dpp.instructions}
          </p>
        </div>

        {/* ── Teacher lock banner (submitted, not all revealed) ── */}
        <AnimatePresence>
          {submitted && !allSolutionsRevealed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`rounded-xl border px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                teacherVerified
                  ? "border-purple-500/30 bg-purple-500/10"
                  : "border-yellow-500/30 bg-yellow-500/10"
              }`}
            >
              <div className="flex-1">
                <p className={`text-sm font-semibold ${teacherVerified ? "text-purple-400" : "text-yellow-400"}`}>
                  {teacherVerified
                    ? "Teacher has verified this DPP — solutions can now be unlocked"
                    : "DPP submitted — awaiting teacher verification"}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  {teacherVerified
                    ? `Click "Show All Solutions" above, or reveal per-question below.`
                    : "In production, your teacher reviews submissions and unlocks solutions from their dashboard."}
                </p>
              </div>
              {teacherVerified && (
                <button
                  onClick={handleUnlockAll}
                  className="flex-shrink-0 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  🔓 Show All Solutions
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Score card (after submit) ── */}
        <AnimatePresence>
          {frozenScore && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4"
            >
              <h3 className="text-sm font-semibold text-green-400 mb-3">DPP Submitted — Results</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {dpp.subjects.map((subj) => {
                  const sc = subj.questions.reduce((acc, q) => {
                    const ans = answers[q.id];
                    if (!ans) return acc;
                    return acc + (ans === q.correct ? 4 : -1);
                  }, 0);
                  const c = colorMap[subj.color] ?? colorMap.cyan;
                  return (
                    <div key={subj.name} className={`rounded-lg border ${c.border} ${c.bg} px-3 py-2 text-center`}>
                      <p className="text-xs text-white/50">{subj.icon} {subj.name}</p>
                      <p className={`text-lg font-bold mt-1 ${c.text}`}>
                        {sc > 0 ? `+${sc}` : sc}
                      </p>
                    </div>
                  );
                })}
                <div className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-center">
                  <p className="text-xs text-white/50">Total</p>
                  <p className={`text-lg font-bold mt-1 ${frozenScore.score >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {frozenScore.score > 0 ? `+${frozenScore.score}` : frozenScore.score}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Subject tabs ── */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {dpp.subjects.map((subj, i) => {
            const c = colorMap[subj.color] ?? colorMap.cyan;
            const isActive = i === activeSubject;
            const att = subjectAttempted(subj);
            return (
              <button
                key={subj.name}
                onClick={() => setActiveSubject(i)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? `${c.bg} ${c.text} border ${c.border}`
                    : "text-white/50 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <span className="hidden sm:inline">{subj.icon}</span>
                <span>{subj.name}</span>
                {att > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? `${c.badge} border` : "bg-white/10 text-white/40"
                    }`}
                  >
                    {att}/{subj.questions.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Questions list ── */}
        <div className="space-y-4">
          {currentSubject.questions.map((q, i) => {
            const isRevealed = revealedIds.has(q.id);
            // Answer is frozen once the solution is revealed, or once the whole DPP is submitted
            const isLocked = isRevealed || submitted;

            return (
              <div key={q.id}>
                <QuestionCard
                  q={q}
                  index={i}
                  selected={answers[q.id] ?? null}
                  revealed={isRevealed}
                  locked={isLocked}
                  onSelect={(key) => handleSelect(q.id, key)}
                  colors={colors}
                />

                {/* Per-question reveal — only if answered AND not yet revealed (works before and after submit) */}
                {answers[q.id] && !isRevealed && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => handleRevealOne(q.id)}
                      disabled={!teacherVerified}
                      title={!teacherVerified ? "Enable Teacher Verified first" : undefined}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                        teacherVerified
                          ? `${colors.border} ${colors.text} hover:${colors.bg}`
                          : "border-white/10 text-white/25 cursor-not-allowed"
                      }`}
                    >
                      {teacherVerified ? "🔓" : "🔒"} Show solution
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Bottom submit bar ── */}
        {!submitted && (
          <div className="sticky bottom-0 pb-4 pt-2">
            <div className="rounded-xl border border-white/10 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-4">
              <div className="text-sm text-white/50">
                <span className="text-white font-medium">{liveAttempted}</span> of{" "}
                <span className="text-white font-medium">{total}</span> attempted
              </div>
              <button
                onClick={handleSubmit}
                disabled={liveAttempted === 0}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors"
              >
                Submit DPP
              </button>
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
