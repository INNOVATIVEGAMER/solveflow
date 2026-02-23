"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    title: "Upload the paper",
    desc: "PDF, image, or typed input. Takes under 2 minutes.",
    color: "#00d4ff",
    time: "2 min",
  },
  {
    num: "02",
    title: "AI generates solutions",
    desc: "Full step-by-step with diagrams, formulas, and alternative methods.",
    color: "#7928ca",
    time: "15 min",
  },
  {
    num: "03",
    title: "Teacher reviews",
    desc: "Scroll through on phone. Error? Write on paper, snap a photo, upload.",
    color: "#a855f7",
    time: "10 min",
  },
  {
    num: "04",
    title: "Students access instantly",
    desc: "Solutions go live — organized by batch, subject, date, and chapter.",
    color: "#22c55e",
    time: "Live",
  },
];

export function HowItWorksTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <div ref={ref} className="flex flex-col">
      {steps.map(({ num, title, desc, color, time }, i) => (
        <motion.div
          key={num}
          className="flex items-center gap-5 py-4"
          initial={{ opacity: 0, x: -16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
        >
          <motion.div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold font-mono shrink-0"
            style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.35, delay: 0.15 + i * 0.15, ease: "backOut" }}
          >
            {num}
          </motion.div>
          <div>
            <p className="text-xs font-mono font-bold mb-0.5 text-white/30">{time}</p>
            <p className="text-base font-semibold leading-snug">{title}</p>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
