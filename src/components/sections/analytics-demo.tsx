"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: string; topic: string; text: string;
  options: { key: string; text: string }[];
  correct: string; marks: number; solution: string;
}
interface Subject { name: string; color: string; icon: string; questions: Question[]; }
interface DppData {
  title: string; subtitle: string; target: string;
  class: string; date: string; subjects: Subject[];
}
interface AnalyticsDemoProps { initialData: DppData | null; }

// ─── Colours ─────────────────────────────────────────────────────────────────

const SUBJECT_COLORS: Record<string, string> = {
  Physics: "#00d4ff",
  Chemistry: "#7928ca",
  Biology: "#22c55e",
};

const NEON = { cyan: "#00d4ff", purple: "#7928ca", pink: "#ec4899", green: "#22c55e", yellow: "#eab308" };

// ─── Seed-based PRNG (reproducible "random" class data) ──────────────────────

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Simulate 30 students answering the DPP ──────────────────────────────────

interface StudentResult {
  name: string;
  score: number;
  answers: Record<string, string>; // qId -> chosen option
}

function simulateClass(dpp: DppData): StudentResult[] {
  const rand = seededRand(42);
  const names = [
    "Aarav S.", "Priya M.", "Rohan K.", "Sneha P.", "Vikram T.",
    "Ananya R.", "Arjun B.", "Kavya N.", "Harsh G.", "Meera J.",
    "Dev C.", "Pooja L.", "Rahul V.", "Shruti D.", "Kiran A.",
    "Neha W.", "Amit F.", "Tanya H.", "Siddharth I.", "Riya O.",
    "Gaurav U.", "Divya Y.", "Nikhil E.", "Sakshi Q.", "Manish Z.",
    "Aditi X.", "Vijay 2.", "Preeti 3.", "Suresh 4.", "Lakshmi 5.",
  ];
  const allQs = dpp.subjects.flatMap((s) => s.questions);

  return names.map((name) => {
    const answers: Record<string, string> = {};
    let score = 0;
    // each student has a "ability" level 0-1
    const ability = 0.3 + rand() * 0.7;

    for (const q of allQs) {
      const p = rand();
      if (p < 0.12) continue; // ~12% chance to skip
      if (rand() < ability) {
        // correct
        answers[q.id] = q.correct;
        score += 4;
      } else {
        // wrong — pick a random wrong option
        const wrong = q.options.filter((o) => o.key !== q.correct);
        answers[q.id] = wrong[Math.floor(rand() * wrong.length)]?.key ?? q.correct;
        score -= 1;
      }
    }
    return { name, score, answers };
  });
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function DarkTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name?: string; color?: string }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f0f0f] border border-white/15 rounded-lg px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-white/50 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? "#fff" }} className="font-semibold">
          {p.name ? `${p.name}: ` : ""}{typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          {p.name?.includes("Accuracy") || p.name?.includes("Coverage") ? "%" : ""}
        </p>
      ))}
    </div>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-white/10 bg-white/[0.025] px-5 py-5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AnalyticsDemo({ initialData }: AnalyticsDemoProps) {
  const [dpp, setDpp] = useState<DppData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (!dpp) {
      fetch("/demo/dpp.json")
        .then((r) => r.json())
        .then((d) => { setDpp(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [dpp]);

  const classData = useMemo(() => (dpp ? simulateClass(dpp) : []), [dpp]);

  // ── Derived analytics ──

  const scoreDistribution = useMemo(() => {
    if (!classData.length) return [];
    const bands = [
      { label: "< 0", min: -Infinity, max: 0 },
      { label: "0–12", min: 0, max: 12 },
      { label: "13–24", min: 13, max: 24 },
      { label: "25–36", min: 25, max: 36 },
      { label: "37–48", min: 37, max: 48 },
      { label: "49–60", min: 49, max: 60 },
    ];
    return bands.map((b) => ({
      range: b.label,
      students: classData.filter((s) => s.score >= b.min && s.score <= b.max).length,
    }));
  }, [classData]);

  const subjectComparison = useMemo(() => {
    if (!dpp || !classData.length) return [];
    return dpp.subjects.map((subj) => {
      const maxPossible = subj.questions.length * 4;
      const avgScore = classData.reduce((sum, student) => {
        const subScore = subj.questions.reduce((s, q) => {
          const ans = student.answers[q.id];
          if (!ans) return s;
          return s + (ans === q.correct ? 4 : -1);
        }, 0);
        return sum + subScore;
      }, 0) / classData.length;
      const pct = Math.round(((avgScore + subj.questions.length) / (maxPossible + subj.questions.length)) * 100);
      return {
        subject: subj.name,
        "Avg Score": Math.round(avgScore * 10) / 10,
        "Max Score": maxPossible,
        accuracy: Math.max(0, Math.min(100, pct)),
        color: SUBJECT_COLORS[subj.name] ?? NEON.cyan,
        icon: subj.icon,
      };
    });
  }, [dpp, classData]);

  const topicAccuracy = useMemo(() => {
    if (!dpp || !classData.length) return [];
    return dpp.subjects.flatMap((subj) =>
      subj.questions.map((q) => {
        const attempts = classData.filter((s) => s.answers[q.id]).length;
        const correct = classData.filter((s) => s.answers[q.id] === q.correct).length;
        const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
        return {
          id: q.id,
          topic: q.topic.length > 22 ? q.topic.slice(0, 20) + "…" : q.topic,
          fullTopic: q.topic,
          accuracy,
          attempts,
          subject: subj.name,
          color: SUBJECT_COLORS[subj.name] ?? NEON.cyan,
        };
      })
    );
  }, [dpp, classData]);

  const leaderboard = useMemo(() =>
    [...classData].sort((a, b) => b.score - a.score).slice(0, 10),
  [classData]);

  const bottomStudents = useMemo(() =>
    [...classData].sort((a, b) => a.score - b.score).slice(0, 5),
  [classData]);

  // Teacher time saved — fake but plausible
  const teacherTimeSaved = [
    { dpp: "DPP #1", withoutSF: 95, withSF: 12 },
    { dpp: "DPP #2", withoutSF: 110, withSF: 8 },
    { dpp: "DPP #3", withoutSF: 85, withSF: 15 },
    { dpp: "DPP #4", withoutSF: 120, withSF: 10 },
    { dpp: "DPP #5", withoutSF: 100, withSF: 7 },
  ];

  // NEET syllabus coverage spider — fake data
  const neetCoverage = [
    { topic: "Electrostatics", coverage: 80, neetWeight: 6 },
    { topic: "Optics", coverage: 75, neetWeight: 5 },
    { topic: "Modern Physics", coverage: 60, neetWeight: 7 },
    { topic: "Organic Chem", coverage: 40, neetWeight: 8 },
    { topic: "Genetics", coverage: 85, neetWeight: 9 },
    { topic: "Human Physiology", coverage: 70, neetWeight: 10 },
    { topic: "Ecology", coverage: 50, neetWeight: 5 },
    { topic: "Electrochemistry", coverage: 65, neetWeight: 4 },
  ];

  // ─── Loading ──

  if (loading || !dpp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalStudents = classData.length;
  const classAvg = Math.round(classData.reduce((s, c) => s + c.score, 0) / totalStudents);
  const maxScore = (dpp.subjects.flatMap((s) => s.questions).length) * 4;
  const topScore = Math.max(...classData.map((s) => s.score));
  const passCount = classData.filter((s) => s.score >= maxScore * 0.4).length;

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />

      {/* ── Sub-header ── */}
      <div className="h-14" />
      <header className="sticky top-14 z-30 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate">Analytics — {dpp.title}</h1>
            <p className="text-xs text-white/40">{dpp.target} · Class {dpp.class} · {totalStudents} students</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── Stat tiles ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Students" value={`${totalStudents}`} sub="submitted DPP" color={NEON.cyan} />
          <StatTile label="Class Average" value={`${classAvg > 0 ? "+" : ""}${classAvg}`} sub={`out of ${maxScore}`} color={classAvg >= 0 ? NEON.green : "#ef4444"} />
          <StatTile label="Top Score" value={`+${topScore}`} sub="highest in class" color={NEON.yellow} />
          <StatTile label="Pass Rate" value={`${Math.round((passCount / totalStudents) * 100)}%`} sub={`${passCount} of ${totalStudents} ≥ 40%`} color={NEON.purple} />
        </div>

        {/* ── Row 1: Score distribution + Subject comparison ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Score distribution */}
          <Section title="Score Distribution" subtitle="Number of students per score band">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreDistribution} barSize={28}>
                <XAxis dataKey="range" tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="students" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((_, i) => (
                    <Cell key={i} fill={i <= 1 ? "#ef444480" : i <= 3 ? NEON.yellow : NEON.green} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-white/40 justify-center">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400/80 inline-block"/>Negative</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: NEON.yellow }}/>Average</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: NEON.green }}/>Good</span>
            </div>
          </Section>

          {/* Subject comparison */}
          <Section title="Subject-wise Accuracy" subtitle="Class average correct % per subject">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectComparison} barSize={40} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="subject" tick={{ fill: "#ffffff70", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="accuracy" name="Accuracy" radius={[0, 4, 4, 0]}>
                  {subjectComparison.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {subjectComparison.map((s) => (
                <div key={s.subject} className="text-center">
                  <p className="text-xs text-white/40">{s.icon} {s.subject}</p>
                  <p className="text-lg font-bold" style={{ color: s.color }}>{s.accuracy}%</p>
                  <p className="text-xs text-white/30">avg {s["Avg Score"] > 0 ? "+" : ""}{s["Avg Score"]}/{s["Max Score"]}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Topic accuracy heatmap ── */}
        <Section title="Question-wise Accuracy" subtitle="% of students who answered each question correctly — lower = needs more teaching attention">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {topicAccuracy.map((t) => {
              const barColor = t.accuracy >= 70 ? NEON.green : t.accuracy >= 45 ? NEON.yellow : "#ef4444";
              return (
                <div key={t.id} className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded border text-white/60 border-white/15 flex-shrink-0">{t.id}</span>
                      <span className="text-xs text-white/50 truncate">{t.topic}</span>
                    </div>
                    <span className="text-xs font-bold flex-shrink-0 ml-2" style={{ color: barColor }}>{t.accuracy}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${t.accuracy}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: barColor }}
                    />
                  </div>
                  <p className="text-xs text-white/25 mt-1">{t.attempts}/{totalStudents} attempted · {t.subject}</p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-white/40 justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>Below 45% — revisit in class</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: NEON.yellow }}/>45–70% — moderate</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: NEON.green }}/>Above 70% — strong</span>
          </div>
        </Section>

        {/* ── Row 2: Leaderboard + Teacher time saved ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Leaderboard */}
          <Section title="Student Leaderboard" subtitle="Top 10 performers this DPP">
            <div className="space-y-1.5">
              {leaderboard.map((s, i) => {
                const pct = Math.max(0, Math.round(((s.score + 15) / (maxScore + 15)) * 100));
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                return (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="w-6 text-xs text-white/30 text-right flex-shrink-0">
                      {medal ?? `${i + 1}`}
                    </span>
                    <span className="text-sm text-white/80 flex-1 truncate">{s.name}</span>
                    <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: i < 3 ? NEON.cyan : "#ffffff40" }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-10 text-right flex-shrink-0 ${s.score >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {s.score > 0 ? "+" : ""}{s.score}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-white/30 mb-1.5">Needs attention</p>
              {bottomStudents.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-white/50">{s.name}</span>
                  <span className={`font-semibold ${s.score < 0 ? "text-red-400" : "text-yellow-400"}`}>
                    {s.score > 0 ? "+" : ""}{s.score}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Teacher time saved */}
          <Section title="Teacher Review Time" subtitle="Minutes spent per DPP — with vs without SolveFlow">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={teacherTimeSaved} barSize={14} barGap={4}>
                <XAxis dataKey="dpp" tick={{ fill: "#ffffff50", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} width={28} unit="m" />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#ffffff60" }} />
                <Bar dataKey="withoutSF" name="Without SolveFlow" fill="#ef444460" radius={[3, 3, 0, 0]} />
                <Bar dataKey="withSF" name="With SolveFlow" fill={NEON.cyan} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-white/40">Avg without</p>
                <p className="text-lg font-bold text-red-400">102m</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Avg with SF</p>
                <p className="text-lg font-bold text-cyan-400">10m</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Time saved</p>
                <p className="text-lg font-bold text-green-400">90%</p>
              </div>
            </div>
          </Section>
        </div>

        {/* ── NEET syllabus coverage spider ── */}
        <Section
          title="NEET Syllabus Coverage"
          subtitle="How much of the high-weightage NEET topics this DPP covers (based on past 5-year frequency analysis)"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={neetCoverage} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#ffffff15" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: "#ffffff60", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#ffffff30", fontSize: 10 }} tickCount={4} />
                <Radar
                  name="DPP Coverage"
                  dataKey="coverage"
                  stroke={NEON.cyan}
                  fill={NEON.cyan}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="NEET Weight"
                  dataKey="neetWeight"
                  stroke={NEON.purple}
                  fill={NEON.purple}
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#ffffff60" }} />
                <Tooltip content={<DarkTooltip />} />
              </RadarChart>
            </ResponsiveContainer>

            <div className="md:w-56 flex-shrink-0 space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Topic breakdown</p>
              {neetCoverage.map((t) => (
                <div key={t.topic}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-white/60">{t.topic}</span>
                    <span className="font-semibold" style={{ color: t.coverage >= 70 ? NEON.green : t.coverage >= 50 ? NEON.yellow : "#ef4444" }}>
                      {t.coverage}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${t.coverage}%`,
                        background: t.coverage >= 70 ? NEON.green : t.coverage >= 50 ? NEON.yellow : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-white/25 pt-2">NEET weight = avg questions from past 5 years</p>
            </div>
          </div>
        </Section>

        <div className="h-4" />
      </div>
    </div>
  );
}
