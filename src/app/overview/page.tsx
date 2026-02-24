"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useEffect } from "react";
import { AnalyticsDashboard } from "@/components/sections/analytics-dashboard";

// ─── Animation helpers ────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  return { ref, inView };
}

/** Animated numeric counter */
function Counter({
  target,
  suffix = "",
  prefix = "",
  duration = 1.6,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px 0px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) mv.set(target);
  }, [inView, mv, target]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

/** Animated horizontal bar */
function Bar({
  pct,
  color,
  delay = 0,
}: {
  pct: number;
  color: string;
  delay?: number;
}) {
  const { ref, inView } = useReveal();
  return (
    <div ref={ref} className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: inView ? `${pct}%` : 0 }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const problems = [
  {
    icon: "📝",
    stat: "2",
    statSuffix: " hrs",
    label: "wasted every evening",
    sub: "Teachers manually write DPP and weekly exam solutions after teaching all day",
  },
  {
    icon: "⏳",
    stat: "18",
    statSuffix: " hrs",
    label: "until students see solutions",
    sub: "Next day at best — sometimes never",
  },
  {
    icon: "💸",
    stat: "0",
    statSuffix: "%",
    label: "of this needs a teacher",
    sub: "Repetitive writing that AI can handle in minutes",
  },
];

const timelineSteps = [
  {
    icon: "📄",
    time: "2 min",
    title: "Upload the paper",
    desc: "DPP, weekly exam, or any question paper — PDF or image",
    color: "#00d4ff",
  },
  {
    icon: "⚡",
    time: "15 min",
    title: "AI generates solutions",
    desc: "Step-by-step, with diagrams",
    color: "#7928ca",
  },
  {
    icon: "👨‍🏫",
    time: "10 min",
    title: "Teacher reviews",
    desc: "On phone — pen corrections + photo upload",
    color: "#a855f7",
  },
  {
    icon: "✅",
    time: "Live",
    title: "Students access instantly",
    desc: "Organized by batch, subject, date",
    color: "#22c55e",
  },
];

const hiddenCostItems = [
  { icon: "💬", title: "Personalized doubt clearing", sub: "Students who are stuck get real attention, not a WhatsApp PDF" },
  { icon: "📝", title: "Better question design", sub: "Smarter DPPs and test strategies built from actual gaps" },
  { icon: "🎯", title: "Concept revision sessions", sub: "Targeted revision before major exams, not solution dictation" },
  { icon: "🏆", title: "Mentoring top students", sub: "Advanced problem-solving guidance for students who are ready for it" },
];

const confidenceLevels = [
  { color: "#22c55e", pct: 80, label: "High confidence", action: "Glance & approve", display: "75–85%" },
  { color: "#eab308", pct: 13, label: "Moderate", action: "Read carefully", display: "10–15%" },
  { color: "#ef4444", pct: 5, label: "Low confidence", action: "Verify step by step", display: "~5%" },
];

const comparisonRows = [
  { label: "Generation", bad: "Copy-paste one by one", good: "Upload entire paper once" },
  { label: "Review", bad: "No quality control", good: "Confidence scoring + teacher sign-off" },
  { label: "Corrections", bad: "Type corrections in chat", good: "Write on paper, photo, done" },
  { label: "Distribution", bad: "WhatsApp PDF chaos", good: "Organized private platform" },
  { label: "Access", bad: "Anyone can forward", good: "OTP login, enrolled only" },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-12 md:py-16 ${className}`}>
      {children}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShortPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="short" />

      <div className="max-w-2xl md:max-w-4xl mx-auto px-5">

        {/* ══ SLIDE 1: THE PROBLEM ══════════════════════════════════════════ */}
        <Section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-6">
              The Problem
            </Badge>
          </motion.div>

          <motion.h1
            className="text-3xl md:text-5xl font-bold tracking-tight mb-8 leading-tight"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Every coaching center has{" "}
            <span className="text-muted-foreground/30">the same bottleneck.</span>
          </motion.h1>

          <div className="flex flex-col gap-8">
            {problems.map(({ icon, stat, statSuffix, label, sub }, i) => (
              <motion.div
                key={label}
                className="flex gap-5 items-start"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono tracking-tight bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent leading-tight">
                    <Counter target={parseInt(stat)} suffix={statSuffix} duration={1.4} />
                  </p>
                  <p className="text-sm font-semibold text-foreground/80 mt-0.5">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        <Separator className="opacity-20" />

        {/* ══ SLIDE 2: THE FIX ════════════════════════════════════════════ */}
        <Section>
          <SlideTwo />
        </Section>

        <Separator className="opacity-20" />

        {/* ══ SLIDE 3: BEFORE / AFTER ═════════════════════════════════════ */}
        <SlideThree />

        <Separator className="opacity-20" />

        {/* ══ SLIDE 4: QUALITY ════════════════════════════════════════════ */}
        <Section className="text-center">
          <SlideFour />
        </Section>

        <Separator className="opacity-20" />

        {/* ══ SLIDE 5: NOT CHATGPT ════════════════════════════════════════ */}
        <Section>
          <SlideFive />
        </Section>

        <Separator className="opacity-20" />

        {/* ══ SLIDE 6: ANALYTICS ══════════════════════════════════════════ */}
        <Section>
          <SlideAnalytics />
        </Section>

        <Separator className="opacity-20" />

        {/* ══ SLIDE 7: RESULTS + CTA ══════════════════════════════════════ */}
        <Section className="text-center">
          <SlideSix />
        </Section>

      </div>

      <Footer />
    </div>
  );
}

// ─── Slide 2: The Fix (animated timeline) ────────────────────────────────────

function SlideTwo() {
  const { ref, inView } = useReveal();

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-6">
          The Fix
        </Badge>
      </motion.div>

      <motion.h2
        className="text-3xl md:text-5xl font-bold tracking-tight mb-3 leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        Upload the paper.{" "}
        <br />
        <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          We deliver solutions.
        </span>
      </motion.h2>

      <motion.p
        className="text-base text-muted-foreground mb-8"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Works for DPPs, weekly exams, and practice sets — AI generates, teacher reviews, students get same-day access.
      </motion.p>

      {/* Animated timeline */}
      <div className="flex flex-col">
        {timelineSteps.map(({ icon, time, title, desc, color }, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-5 py-5"
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.18 }}
          >
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-card border relative z-10"
              style={{ borderColor: `${color}30` }}
            >
              {icon}
            </div>
            {/* Content */}
            <div>
              <p className="text-xs font-mono font-bold mb-0.5" style={{ color: `${color}99` }}>
                {time}
              </p>
              <p className="text-base font-semibold leading-snug">{title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 3: The Hidden Cost ─────────────────────────────────────────────────

function SlideThree() {
  const { ref, inView } = useReveal();

  return (
    <section className="py-12 md:py-16" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
          The Hidden Cost
        </Badge>
      </motion.div>

      <motion.h2
        className="text-3xl md:text-4xl font-bold tracking-tight mb-3 leading-tight"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.08 }}
      >
        2 hours. 30 students.{" "}
        <span className="text-muted-foreground/30">One repeated doubt.</span>
      </motion.h2>

      <motion.p
        className="text-base text-muted-foreground mb-8"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        Every evening, teachers field the same DPP doubts from 30 different students. That time could go toward:
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hiddenCostItems.map(({ icon, title, sub }, i) => (
          <motion.div
            key={title}
            className="flex gap-4 items-start rounded-2xl border border-border bg-card p-5"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.2 + i * 0.1 }}
          >
            <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
            <div>
              <p className="text-sm font-semibold leading-snug">{title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Slide 4: Quality (animated bars) ────────────────────────────────────────

function SlideFour() {
  const { ref, inView } = useReveal();

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
          Quality
        </Badge>
      </motion.div>

      <motion.h2
        className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
        initial={{ opacity: 0, y: 18 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay: 0.1 }}
      >
        Teacher stays in control.
      </motion.h2>

      <motion.p
        className="text-sm text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Every solution is confidence-scored. Teachers review only what needs attention.
      </motion.p>

      <div className="flex flex-col gap-5 text-left max-w-md mx-auto">
        {confidenceLevels.map(({ color, pct, label, action, display }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.3 + i * 0.12 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background: color,
                    boxShadow: `0 0 8px ${color}66`,
                  }}
                />
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs text-muted-foreground">{action}</span>
              </div>
              <span className="text-sm font-bold font-mono" style={{ color }}>
                {display}
              </span>
            </div>
            <Bar pct={pct} color={color} delay={0.4 + i * 0.12} />
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-xs text-muted-foreground/40 mt-8"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        Flagged solutions are held back until teacher approves. No shortcuts.
      </motion.p>
    </div>
  );
}

// ─── Slide 5: Not ChatGPT (comparison table) ─────────────────────────────────

function SlideFive() {
  const { ref, inView } = useReveal();

  return (
    <div ref={ref}>
      <motion.h2
        className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        Why not just use ChatGPT?
      </motion.h2>

      <motion.p
        className="text-base text-muted-foreground mb-8"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Generating a solution is 10% of the problem.
      </motion.p>

      {/* Column headers */}
      <motion.div
        className="grid grid-cols-[90px_1fr_1fr] mb-1"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div />
        <div className="px-3 pb-2 text-xs font-bold text-destructive/50 uppercase tracking-wider">
          ChatGPT
        </div>
        <div className="px-3 pb-2 text-xs font-bold text-cyan-400/60 uppercase tracking-wider">
          SolveFlow
        </div>
      </motion.div>

      <div className="border border-border rounded-xl overflow-hidden">
        {comparisonRows.map(({ label, bad, good }, i) => (
          <motion.div
            key={label}
            className={`grid grid-cols-[90px_1fr_1fr] ${
              i < comparisonRows.length - 1 ? "border-b border-border/30" : ""
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
          >
            <div className="px-3 py-3.5 text-xs font-semibold text-muted-foreground/60">
              {label}
            </div>
            <div className="px-3 py-3.5 text-xs text-destructive/50 border-l border-border/30 leading-relaxed">
              {bad}
            </div>
            <div className="px-3 py-3.5 text-xs text-cyan-400/80 border-l border-border/30 leading-relaxed">
              {good}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 6: Analytics ───────────────────────────────────────────────────────

function SlideAnalytics() {
  const { ref, inView } = useReveal();

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
          Analytics Dashboard
        </Badge>
      </motion.div>
      <motion.h2
        className="text-3xl md:text-4xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Data you&apos;ve{" "}
        <span className="text-muted-foreground/40">never had before.</span>
      </motion.h2>
      <AnalyticsDashboard />
    </div>
  );
}

// ─── Slide 7: Results + CTA ───────────────────────────────────────────────────

function SlideSix() {
  const { ref, inView } = useReveal();

  return (
    <div ref={ref}>
      <motion.h2
        className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        Let teachers teach.
        <br />
        <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          We handle the rest.
        </span>
      </motion.h2>

      {/* Stat cards — features only, no pricing */}
      <div className="grid grid-cols-2 gap-3 mb-10 mt-8">
        {[
          { counter: <Counter target={15} suffix="+ hrs" duration={1.8} />, label: "saved per week", sub: "per teacher" },
          { counter: <span>Same day</span>, label: "solution delivery", sub: "guaranteed" },
          { counter: <span>100<span className="text-xl">%</span></span>, label: "teacher reviewed", sub: "no unverified solutions" },
          { counter: <span>OTP</span>, label: "secured access", sub: "enrolled students only" },
        ].map(({ counter, label, sub }, i) => (
          <motion.div
            key={label}
            className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-5 text-center"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1, type: "spring", bounce: 0.2 }}
          >
            <div className="text-2xl font-bold font-mono tracking-tight bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-1">
              {counter}
            </div>
            <div className="text-xs font-semibold text-foreground/70 leading-snug">{label}</div>
            <div className="text-xs text-muted-foreground/40 mt-0.5">{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── See it live ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-10 mb-4"
      >
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/40 mb-4">
          See it live
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              href: "/demo/student",
              icon: "🎓",
              label: "Student View",
              desc: "Attempt a NEET DPP, check solutions",
              color: "hover:border-cyan-500/40 hover:bg-cyan-500/5",
            },
            {
              href: "/demo/teacher",
              icon: "✏️",
              label: "Teacher Review",
              desc: "Upload, review answers, publish",
              color: "hover:border-purple-500/40 hover:bg-purple-500/5",
            },
            {
              href: "/demo/analytics",
              icon: "📊",
              label: "Analytics",
              desc: "Class performance & insights",
              color: "hover:border-green-500/40 hover:bg-green-500/5",
            },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 transition-all duration-200 ${item.color}`}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/90 flex items-center gap-1">
                  {item.label}
                  <span className="text-xs text-white/25">↗</span>
                </p>
                <p className="text-xs text-white/40 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <Link
          href="/"
          className="text-sm text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          Read the full details →
        </Link>
      </motion.div>
    </div>
  );
}
