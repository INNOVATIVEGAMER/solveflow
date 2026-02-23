"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  { icon: "📱", title: "Works everywhere", desc: "Phone, tablet, or laptop — any browser" },
  { icon: "🔐", title: "OTP login", desc: "Tied to registered mobile number" },
  { icon: "📚", title: "Organized by batch", desc: "Students only see their assigned content" },
  { icon: "⭐", title: "Bookmark hard questions", desc: "Mark for quick revision later" },
  { icon: "📖", title: "Full archive access", desc: "Every past paper, always available" },
  { icon: "📊", title: "Step-by-step detail", desc: "Diagrams, formulas, key concepts" },
];

// Simulated app content rows
const appRows = [
  { subject: "Physics", paper: "DPP #18 — Electrostatics", date: "Today", badge: "New", badgeColor: "#00d4ff" },
  { subject: "Chemistry", paper: "DPP #14 — Organic Reactions", date: "Yesterday", badge: null, badgeColor: "" },
  { subject: "Mathematics", paper: "Weekly Test #6", date: "Mon", badge: null, badgeColor: "" },
  { subject: "Physics", paper: "DPP #17 — Capacitors", date: "Sun", badge: null, badgeColor: "" },
];

export function StudentExperience() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <div ref={ref} className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">

      {/* ── Mock phone frame ── */}
      <motion.div
        className="relative shrink-0 w-[260px]"
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        {/* Glow behind phone */}
        <div
          className="absolute inset-0 -z-10 rounded-[2.5rem] blur-3xl"
          style={{ background: "radial-gradient(ellipse at center, rgba(0,212,255,0.12) 0%, rgba(121,40,202,0.08) 50%, transparent 70%)" }}
        />

        {/* Phone shell */}
        <div
          className="relative rounded-[2.2rem] border overflow-hidden"
          style={{
            background: "hsl(var(--card))",
            borderColor: "rgba(255,255,255,0.08)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Status bar */}
          <div className="flex justify-between items-center px-5 pt-4 pb-2">
            <span className="text-[10px] font-semibold text-muted-foreground/60">9:41</span>
            <div
              className="w-16 h-4 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <span className="text-[10px] font-semibold text-muted-foreground/60">●●●</span>
          </div>

          {/* App header */}
          <div className="px-4 pb-3 pt-1 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground/40 mb-0.5">
              Batch: JEE 2026 A
            </p>
            <p className="text-sm font-bold text-foreground">Solutions</p>
          </div>

          {/* Content rows */}
          <div className="divide-y divide-white/[0.04]">
            {appRows.map(({ subject, paper, date, badge, badgeColor }, i) => (
              <motion.div
                key={i}
                className="px-4 py-3 flex items-start gap-2.5"
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              >
                {/* Subject pill */}
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 mt-0.5"
                  style={{
                    background: subject === "Physics" ? "rgba(0,212,255,0.12)" :
                                subject === "Chemistry" ? "rgba(168,85,247,0.12)" : "rgba(34,197,94,0.12)",
                    color: subject === "Physics" ? "#00d4ff" :
                           subject === "Chemistry" ? "#a855f7" : "#22c55e",
                  }}
                >
                  {subject.slice(0, 3)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold leading-snug text-foreground/90 truncate">{paper}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">{date}</p>
                </div>
                {badge && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0"
                    style={{ background: `${badgeColor}18`, color: badgeColor }}
                  >
                    {badge}
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Bottom nav bar */}
          <div
            className="flex justify-around items-center px-4 py-3 border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {["📚", "⭐", "🔍", "👤"].map((icon, i) => (
              <span
                key={i}
                className="text-base opacity-40"
                style={{ opacity: i === 0 ? 0.9 : 0.3 }}
              >
                {icon}
              </span>
            ))}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-3">
            <div className="w-20 h-1 rounded-full bg-white/10" />
          </div>
        </div>
      </motion.div>

      {/* ── Feature callouts ── */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map(({ icon, title, desc }, i) => (
          <motion.div
            key={title}
            className="flex gap-3 items-start rounded-xl p-4 border border-border bg-card"
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.2 + i * 0.08 }}
          >
            <span className="text-xl shrink-0 mt-0.5">{icon}</span>
            <div>
              <p className="text-sm font-semibold leading-snug">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
