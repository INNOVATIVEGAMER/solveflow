"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// ─── Data ────────────────────────────────────────────────────────────────────

const accessData = [
  { day: "Mon", pct: 38 },
  { day: "Tue", pct: 55 },
  { day: "Wed", pct: 72 },
  { day: "Thu", pct: 61 },
  { day: "Fri", pct: 83 },
  { day: "Sat", pct: 91 },
  { day: "Sun", pct: 44 },
];

const topStudents = [
  { name: "Arjun S.", pct: 97 },
  { name: "Priya M.", pct: 91 },
  { name: "Ravi K.", pct: 88 },
  { name: "Sneha P.", pct: 82 },
  { name: "Karan D.", pct: 75 },
  { name: "Meera R.", pct: 68 },
];

const benchmarkData = [
  { subject: "Mechanics", dpp: 85, jee: 90 },
  { subject: "Optics", dpp: 60, jee: 80 },
  { subject: "Thermo", dpp: 75, jee: 70 },
  { subject: "Electro", dpp: 90, jee: 85 },
  { subject: "Organic", dpp: 70, jee: 75 },
  { subject: "Calculus", dpp: 80, jee: 88 },
];

const teacherStats = [
  { label: "Avg review time per paper", value: "8 min" },
  { label: "Papers pending review", value: "0" },
  { label: "Corrections flagged this week", value: "12" },
  { label: "Full audit trail", value: "Timestamped" },
];

// ─── Tooltip style ────────────────────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: "#0f0f0f",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  fontSize: 12,
  color: "#e5e7eb",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  delay,
  children,
}: {
  title: string;
  subtitle: string;
  delay: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 flex flex-col gap-4"
    >
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">

      {/* 1. Student Engagement — bar chart */}
      <ChartCard
        title="Student Engagement"
        subtitle="% of students who accessed solutions — last 7 days"
        delay={0}
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={accessData} barSize={20}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number | undefined) => [`${v ?? 0}%`, "Accessed"]}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar dataKey="pct" fill="#00d4ff" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground/60">
          Same-day access vs night-before cramming · time spent per paper
        </p>
      </ChartCard>

      {/* 2. Top Students — horizontal bar chart */}
      <ChartCard
        title="Who's Actually Reading"
        subtitle="Top students by DPP access rate — identify your most engaged learners"
        delay={0.1}
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={topStudents}
            layout="vertical"
            barSize={14}
            margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number | undefined) => [`${v ?? 0}%`, "Access rate"]}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar
              dataKey="pct"
              fill="#ec4899"
              radius={[0, 4, 4, 0]}
              fillOpacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground/60">
          Also flags students who never opened a single DPP
        </p>
      </ChartCard>

      {/* 3. DPP vs JEE/NEET Benchmark — radar chart */}
      <ChartCard
        title="DPP Benchmark Match"
        subtitle="Are your DPPs covering topics at JEE/NEET frequency? — by chapter"
        delay={0.2}
      >
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={benchmarkData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
            <PolarGrid stroke="rgba(255,255,255,0.07)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: "#6b7280" }}
              tickCount={3}
            />
            <Radar
              name="Your DPPs"
              dataKey="dpp"
              stroke="#7928ca"
              fill="#7928ca"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Radar
              name="JEE/NEET avg"
              dataKey="jee"
              stroke="#00d4ff"
              fill="#00d4ff"
              fillOpacity={0.12}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: "#7928ca" }} />
            Your DPPs
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: "#00d4ff" }} />
            JEE/NEET avg
          </span>
        </div>
      </ChartCard>

      {/* 4. Teacher Activity — stat tiles */}
      <ChartCard
        title="Teacher Activity"
        subtitle="Live review stats — updated with every submission"
        delay={0.3}
      >
        <div className="grid grid-cols-2 gap-3">
          {teacherStats.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 flex flex-col gap-1"
            >
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground leading-snug">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Full audit trail with timestamps per teacher per paper
        </p>
      </ChartCard>

    </div>
  );
}
