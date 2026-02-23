import { useState, useEffect, useRef } from "react";

/* ─── scroll-triggered fade ─── */
const Section = ({ children, className = "", style = {} }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(32px)", transition: "opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)", ...style }}>
      {children}
    </div>
  );
};

const Stagger = ({ children, base = 0, gap = 0.1, className = "", style = {} }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } },
      { threshold: 0.06, rootMargin: "0px 0px -10px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={style}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div key={i} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${base + i * gap}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${base + i * gap}s`, minHeight: 0 }}>
              {child}
            </div>
          ))
        : children}
    </div>
  );
};

const Accent = ({ children }) => (
  <span style={{ background: "linear-gradient(135deg, #00d4ff 0%, #7928ca 50%, #ff0080 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{children}</span>
);
const Grad = ({ children }) => (
  <span style={{ background: "linear-gradient(135deg, #fff 0%, #888 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{children}</span>
);
const Badge = ({ children }) => (
  <span className="sf-badge">{children}</span>
);
const Divider = () => (
  <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
    <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)" }} />
  </div>
);

const muted = "rgba(255,255,255,0.45)";
const m2 = "rgba(255,255,255,0.3)";

/* ════════════════════════════════════════════ */

export default function SolveFlowPitch() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="sf-root">
      {/* ─── ALL RESPONSIVE CSS ─── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .sf-root {
          --mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace;
          --muted: rgba(255,255,255,0.45);
          --m2: rgba(255,255,255,0.3);
          background: #000; color: #fff;
          font-family: 'Geist', 'SF Pro Display', -apple-system, 'Segoe UI', Helvetica, sans-serif;
          min-height: 100vh; position: relative; overflow-x: hidden;
        }
        .sf-badge {
          display: inline-block; padding: 5px 14px; border-radius: 9999px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); font-family: var(--mono);
        }
        .sf-grid { background-image: linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px); background-size: 72px 72px; position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .sf-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(20px, 4vw, 48px); transition: background 0.3s, border-bottom 0.3s; }
        .sf-nav-links { display: flex; align-items: center; gap: 28px; }
        .sf-nav-link { font-size: 13px; color: rgba(255,255,255,0.4); text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .sf-nav-link:hover { color: rgba(255,255,255,0.8); }
        .sf-nav-cta { font-size: 12px; color: #000; background: #00d4ff; padding: 6px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; transition: opacity 0.2s; }
        .sf-nav-cta:hover { opacity: 0.85; }
        .sf-sec { padding: clamp(60px, 10vw, 120px) clamp(20px, 5vw, 64px); max-width: 960px; margin: 0 auto; width: 100%; }
        .sf-hero { padding-top: clamp(120px, 18vw, 200px) !important; padding-bottom: clamp(80px, 12vw, 160px) !important; text-align: center; position: relative; }
        .sf-hero h1 { font-size: clamp(36px, 10vw, 80px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.0; }
        .sf-hero-desc { font-size: clamp(14px, 2.4vw, 22px); color: var(--muted); max-width: 620px; line-height: 1.65; margin: 0 auto; }
        .sf-hero-stats { display: flex; gap: clamp(20px, 5vw, 56px); justify-content: center; flex-wrap: wrap; }
        .sf-hero-stat-val { font-size: clamp(18px, 4vw, 32px); font-weight: 700; color: #fff; font-family: var(--mono); letter-spacing: -0.03em; }
        .sf-hero-stat-label { font-size: 12px; color: var(--m2); margin-top: 4px; }
        .sf-hero-cta { display: inline-block; padding: 14px 40px; border-radius: 10px; background: linear-gradient(135deg, #00d4ff, #7928ca); color: #fff; font-weight: 700; font-size: 16px; text-decoration: none; letter-spacing: -0.01em; transition: opacity 0.2s, transform 0.2s; border: none; cursor: pointer; }
        .sf-hero-cta:hover { opacity: 0.9; transform: translateY(-1px); }
        .sf-h2 { font-size: clamp(22px, 5vw, 48px); font-weight: 700; letter-spacing: -0.035em; line-height: 1.1; }
        .sf-h2-sm { font-size: clamp(20px, 4.5vw, 42px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; }
        .sf-h2-lg { font-size: clamp(28px, 6vw, 56px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; }
        .sf-card { border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.015); height: 100%; }
        .sf-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .sf-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }

        /* ─── DAY TABLE (desktop) ─── */
        .sf-day-table { border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
        .sf-day-header { display: grid; grid-template-columns: 100px 1fr 1fr; background: rgba(255,255,255,0.04); }
        .sf-day-row { display: grid; grid-template-columns: 100px 1fr 1fr; border-top: 1px solid rgba(255,255,255,0.03); }
        .sf-day-mobile { display: none; }

        /* ─── PRICING ─── */
        .sf-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; text-align: left; }
        .sf-pricing-price { font-size: clamp(28px, 5vw, 40px); font-weight: 700; color: #fff; letter-spacing: -0.03em; }

        /* ─── SUMMARY STATS ─── */
        .sf-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 700px; margin: 40px auto 0; }
        .sf-summary-val { font-size: clamp(18px, 3vw, 28px); font-weight: 700; letter-spacing: -0.03em; background: linear-gradient(135deg, #00d4ff, #7928ca); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; }

        /* ─── CONFIDENCE BARS ─── */
        .sf-conf-row { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-radius: 10px; }
        .sf-conf-desc-inline { font-size: 13px; color: var(--muted); margin-left: 8px; }
        .sf-conf-desc-block { display: none; }

        /* ─── CHATGPT H2 line break ─── */
        .sf-br-desktop { display: inline; }

        /* ═══════════════════════════════════════ */
        /* ─── MOBILE ── max-width: 640px ─────── */
        /* ═══════════════════════════════════════ */
        @media (max-width: 640px) {
          .sf-grid { background-size: 48px 48px; }
          .sf-nav { height: 48px; padding: 0 16px; }
          .sf-nav-links { gap: 16px; }
          .sf-nav-link { display: none; }
          .sf-nav-cta { font-size: 11px; padding: 5px 12px; }
          .sf-sec { padding: 48px 18px; }
          .sf-hero { padding-top: 100px !important; padding-bottom: 56px !important; }
          .sf-hero h1 { font-size: 38px; }
          .sf-hero-desc { font-size: 15px; }
          .sf-hero-stat-val { font-size: 20px; }
          .sf-hero-cta { font-size: 15px; padding: 12px 32px; }
          .sf-h2 { font-size: clamp(22px, 6vw, 30px); }
          .sf-h2-sm { font-size: clamp(20px, 5.5vw, 26px); }
          .sf-h2-lg { font-size: clamp(26px, 7vw, 34px); }
          .sf-grid-2 { grid-template-columns: 1fr; gap: 10px; }
          .sf-grid-3 { grid-template-columns: 1fr; gap: 10px; }
          .sf-card { border-radius: 10px; }

          /* Day table → stacked cards on mobile */
          .sf-day-table { display: none; }
          .sf-day-mobile { display: flex; flex-direction: column; gap: 8px; }

          /* Pricing stacks */
          .sf-pricing-grid { grid-template-columns: 1fr; gap: 12px; }
          .sf-pricing-price { font-size: 32px; }

          /* Summary: 2x2 */
          .sf-summary-grid { grid-template-columns: repeat(2, 1fr); margin-top: 32px; }
          .sf-summary-val { font-size: 18px; }

          /* Confidence bars: stack desc below label */
          .sf-conf-row { gap: 12px; padding: 14px; flex-wrap: wrap; }
          .sf-conf-desc-inline { display: none; }
          .sf-conf-desc-block { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }

          /* No line break on mobile for chatgpt heading */
          .sf-br-desktop { display: none; }
        }
      `}</style>

      {/* bg grid */}
      <div className="sf-grid" />

      {/* ─── NAV ─── */}
      <nav className="sf-nav" style={{ background: scrollY > 40 ? "rgba(0,0,0,0.75)" : "transparent", backdropFilter: scrollY > 40 ? "blur(16px) saturate(180%)" : "none", WebkitBackdropFilter: scrollY > 40 ? "blur(16px) saturate(180%)" : "none", borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent" }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Solve<span style={{ color: "rgba(255,255,255,0.35)" }}>Flow</span>
        </div>
        <div className="sf-nav-links">
          <a href="#how-it-works" className="sf-nav-link">How It Works</a>
          <a href="#pricing" className="sf-nav-link">Pricing</a>
          <a href="#contact" className="sf-nav-cta">Contact Us</a>
        </div>
      </nav>


      {/* ════════ HERO ════════ */}
      <section className="sf-sec sf-hero">
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "min(800px, 100%)", height: 500, background: "radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, rgba(121,40,202,0.03) 40%, transparent 70%)", pointerEvents: "none" }} />
        <Section><Badge>For Coaching Centers</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h1>Solve<Accent>Flow</Accent></h1>
        </Section>
        <Section style={{ marginTop: 20 }}>
          <p className="sf-hero-desc">Detailed solutions for every DPP and exam paper. Generated in minutes, reviewed by your teachers, available to your students instantly.</p>
        </Section>
        <Section style={{ marginTop: 36 }}>
          <div className="sf-hero-stats">
            {[["15 min", "Solution generation"], ["10 min", "Teacher review"], ["Same day", "Student access"]].map(([v, l], i) => (
              <div key={i} style={{ textAlign: "center", minWidth: 80 }}>
                <div className="sf-hero-stat-val">{v}</div>
                <div className="sf-hero-stat-label">{l}</div>
              </div>
            ))}
          </div>
        </Section>
        <Section style={{ marginTop: 36 }}>
          <a href="#contact" className="sf-hero-cta">Contact Us — First Month Free</a>
        </Section>
      </section>

      <Divider />

      {/* ════════ PROBLEM 1 ════════ */}
      <section className="sf-sec">
        <Section><Badge>The Problem</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h2 className="sf-h2"><Grad>Your teachers are stretched thin.</Grad></h2>
        </Section>
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 18 }}>
          <Stagger base={0} gap={0.12}>
            {[
              ["1.5–2 hrs every evening", "writing detailed DPP solutions after teaching 4–6 batches daily"],
              ["3–4 hrs on weekends", "preparing solution sets for weekly tests before Monday's discussion class"],
              ["Repetitive, low-leverage work", "the teacher already knows the solution — writing it out step-by-step is pure overhead"],
            ].map(([bold, rest], i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", marginTop: 8, flexShrink: 0, boxShadow: "0 0 10px #00d4ff55" }} />
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: muted }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{bold}</span> — {rest}
                </p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ════════ PROBLEM 2 ════════ */}
      <section className="sf-sec">
        <Section>
          <h2 className="sf-h2"><Grad>Students don't get solutions fast enough.</Grad></h2>
        </Section>
        <Stagger base={0} gap={0.12} className="sf-grid-3" style={{ marginTop: 32 }}>
          {[
            ["Next day", "DPP solutions discussed in class the day after — learning momentum lost"],
            ["2–3 days later", "Weekly test solutions arrive days later, sometimes a full week"],
            ["Never", "Students absent on solution discussion day have no access at all"],
          ].map(([val, desc], i) => (
            <div key={i} className="sf-card" style={{ padding: 22 }}>
              <div style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: "#ef4444", fontFamily: "var(--mono)", marginBottom: 6 }}>{val}</div>
              <div style={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </Stagger>
        <Section style={{ marginTop: 28 }}>
          <p style={{ margin: 0, fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, borderLeft: "2px solid rgba(255,255,255,0.08)", paddingLeft: 18 }}>
            By the time solutions arrive, students have moved on. <span style={{ color: "#fff", fontWeight: 600 }}>The learning moment is lost.</span>
          </p>
        </Section>
      </section>

      <Divider />

      {/* ════════ HIDDEN COST ════════ */}
      <section className="sf-sec">
        <Section><Badge>The Hidden Cost</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h2 className="sf-h2-sm" style={{ color: "#fff" }}>
            You're paying teacher salaries <span style={{ color: "rgba(255,255,255,0.3)" }}>for work that doesn't need a teacher.</span>
          </h2>
        </Section>
        <Section style={{ marginTop: 14 }}>
          <p style={{ fontSize: 15, color: muted, lineHeight: 1.7 }}>Those 2 hours every evening could be spent on:</p>
        </Section>
        <Stagger base={0} gap={0.1} className="sf-grid-2" style={{ marginTop: 24 }}>
          {[
            ["💬", "Personalized doubt clearing", "for students who are struggling"],
            ["📝", "Better question design", "and smarter test strategies"],
            ["🎯", "Concept revision sessions", "before major exams"],
            ["🏆", "Mentoring top students", "for advanced problem-solving"],
          ].map(([icon, title, sub], i) => (
            <div key={i} className="sf-card" style={{ padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 12, color: m2, lineHeight: 1.5, marginTop: 3 }}>{sub}</div>
              </div>
            </div>
          ))}
        </Stagger>
      </section>

      <Divider />

      {/* ════════ SOLUTION INTRO ════════ */}
      <section className="sf-sec" style={{ textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "min(600px, 100%)", height: 400, background: "radial-gradient(ellipse, rgba(121,40,202,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Section><Badge>The Solution</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h2 className="sf-h2-lg">Solve<Accent>Flow</Accent></h2>
        </Section>
        <Section style={{ marginTop: 18 }}>
          <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: muted, lineHeight: 1.7, margin: "0 auto", maxWidth: 560 }}>
            A platform purpose-built for coaching centers that automates the creation, review, and distribution of detailed solutions for DPPs and exam papers.
          </p>
        </Section>
        <Section style={{ marginTop: 32 }}>
          <div className="sf-card" style={{ padding: "24px 24px", maxWidth: 520, margin: "0 auto", textAlign: "left" }}>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>
              "Think of us as a <span style={{ color: "#fff", fontWeight: 600 }}>printing press</span>, not a publisher. You write the content and control the quality. We handle the production and delivery."
            </p>
          </div>
        </Section>
        <Section style={{ marginTop: 24 }}>
          <div style={{ display: "flex", gap: "12px 24px", justifyContent: "center", flexWrap: "wrap" }}>
            {["Your questions", "Your teachers' review", "Your students only", "Your branding"].map((t, i) => (
              <div key={i} style={{ fontSize: 13, color: muted, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#00d4ff" }}>✓</span> {t}
              </div>
            ))}
          </div>
        </Section>
      </section>

      <Divider />

      {/* ════════ HOW IT WORKS ════════ */}
      <section id="how-it-works" className="sf-sec">
        <Section><Badge>How It Works</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h2 className="sf-h2-sm" style={{ color: "#fff" }}>Four steps. That's it.</h2>
        </Section>
        <Stagger base={0} gap={0.12} className="sf-grid-2" style={{ marginTop: 32 }}>
          {[
            ["01", "Upload the paper", "PDF, image, or typed input. Takes under 2 minutes."],
            ["02", "AI generates solutions", "Full step-by-step with diagrams, formulas, and alternative methods. Ready in 15–30 minutes."],
            ["03", "Teacher reviews", "Scroll through on phone. Error? Write correction on paper, snap a photo, upload. Done."],
            ["04", "Students access instantly", "Solutions go live on the platform. Organized by batch, subject, date, and chapter."],
          ].map(([num, title, desc], i) => (
            <div key={i} className="sf-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(121,40,202,0.12))", color: "#00d4ff", fontFamily: "var(--mono)", flexShrink: 0 }}>{num}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{title}</div>
              </div>
              <div style={{ fontSize: 13, color: muted, lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </Stagger>
        <Section style={{ marginTop: 24 }}>
          <div style={{ padding: "14px 18px", borderRadius: 10, background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
            <span style={{ color: "#00d4ff", fontWeight: 600 }}>Key insight:</span> Teachers keep working with pen and paper. The platform adapts to them — not the other way around.
          </div>
        </Section>
      </section>

      <Divider />

      {/* ════════ DAY IN THE LIFE ════════ */}
      <section className="sf-sec">
        <Section><Badge>A Day in the Life</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h2 className="sf-h2-sm" style={{ color: "#fff" }}>
            Before <span style={{ color: "rgba(255,255,255,0.3)" }}>&</span> After
          </h2>
        </Section>

        {/* DESKTOP table */}
        <div className="sf-day-table" style={{ marginTop: 32 }}>
          <div className="sf-day-header">
            <div style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: m2, borderRight: "1px solid rgba(255,255,255,0.04)" }}>Time</div>
            <div style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,68,68,0.55)", borderRight: "1px solid rgba(255,255,255,0.04)" }}>Without</div>
            <div style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(0,212,255,0.65)" }}>With SolveFlow</div>
          </div>
          <Stagger base={0} gap={0.06}>
            {[
              ["4:00 PM", "Class ends, DPP distributed", "DPP distributed + uploaded to SolveFlow"],
              ["4:30 PM", "Teacher starts writing solutions", "AI generates solutions. Teacher is free"],
              ["5:00 PM", "Teacher still writing solutions…", "Teacher reviews on phone (10–15 min)"],
              ["5:15 PM", "Teacher still writing solutions…", "Solutions go live for students ✓"],
              ["6:00 PM", "Finishes, sends PDF to WhatsApp", "Teacher spends time on doubt clearing"],
              ["Next day", "Class spent discussing solutions", "Class time used for new concepts"],
            ].map(([time, w, sf], i) => (
              <div key={i} className="sf-day-row">
                <div style={{ padding: "12px 16px", fontSize: 12, color: muted, fontFamily: "var(--mono)", fontWeight: 500, borderRight: "1px solid rgba(255,255,255,0.03)", background: "rgba(255,255,255,0.01)" }}>{time}</div>
                <div style={{ padding: "12px 16px", fontSize: 13, color: "rgba(255,255,255,0.35)", borderRight: "1px solid rgba(255,255,255,0.03)" }}>{w}</div>
                <div style={{ padding: "12px 16px", fontSize: 13, color: "rgba(255,255,255,0.75)", background: "rgba(0,212,255,0.02)" }}>{sf}</div>
              </div>
            ))}
          </Stagger>
        </div>

        {/* MOBILE stacked cards */}
        <Stagger base={0} gap={0.08} className="sf-day-mobile" style={{ marginTop: 28 }}>
          {[
            ["4:00 PM", "Class ends, DPP distributed", "DPP distributed + uploaded"],
            ["4:30 PM", "Teacher starts writing solutions", "AI generates. Teacher is free"],
            ["5:00 PM", "Teacher still writing…", "Reviews on phone (10–15 min)"],
            ["5:15 PM", "Teacher still writing…", "Solutions go live ✓"],
            ["6:00 PM", "Sends PDF to WhatsApp", "Doubt clearing instead"],
            ["Next day", "Class: discussing solutions", "Class: new concepts"],
          ].map(([time, w, sf], i) => (
            <div key={i} className="sf-card" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: m2, fontFamily: "var(--mono)", marginBottom: 8 }}>{time}</div>
              <div style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.5 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "rgba(239,68,68,0.5)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Without</div>
                  <div style={{ color: "rgba(255,255,255,0.35)" }}>{w}</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "rgba(0,212,255,0.6)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>With SolveFlow</div>
                  <div style={{ color: "rgba(255,255,255,0.8)" }}>{sf}</div>
                </div>
              </div>
            </div>
          ))}
        </Stagger>

        <Section style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, color: muted }}>
            For weekly exams: solutions live by <span style={{ color: "#00d4ff", fontWeight: 600 }}>Sunday afternoon</span> → Monday's class is entirely free for new teaching.
          </p>
        </Section>
      </section>

      <Divider />

      {/* ════════ WHY NOT CHATGPT ════════ */}
      <section className="sf-sec">
        <Section><Badge>Why Not ChatGPT?</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h2 className="sf-h2-sm" style={{ color: "#fff", lineHeight: 1.15 }}>
            Generating a solution is 10% of the problem.<span className="sf-br-desktop"><br /></span>{" "}
            <span style={{ color: "rgba(255,255,255,0.3)" }}>The other 90% is the workflow.</span>
          </h2>
        </Section>
        <Stagger base={0} gap={0.08} className="sf-grid-2" style={{ marginTop: 32 }}>
          {[
            ["Generation", "One question at a time, copy-paste ×30", "Upload entire paper once — all solutions generated"],
            ["Quality Control", "No review system, no confidence scoring", "Auto-scoring + mandatory sign-off on flagged solutions"],
            ["Corrections", "Type physics diagrams in a text chat?", "Write on paper → photo → upload. Done."],
            ["Distribution", "WhatsApp PDF chaos, formatting breaks", "Private platform, organized by batch & date"],
            ["Access Control", "Anyone can forward the PDF", "OTP-based login — enrolled students only"],
            ["Analytics", "Zero visibility into engagement", "Full tracking, review activity, monthly reports"],
          ].map(([title, bad, good], i) => (
            <div key={i} className="sf-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 12 }}>{title}</div>
              <div style={{ fontSize: 12, color: "rgba(239,68,68,0.5)", marginBottom: 6, lineHeight: 1.5, display: "flex", gap: 6 }}>
                <span style={{ flexShrink: 0 }}>✗</span> <span>{bad}</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(0,212,255,0.75)", lineHeight: 1.5, display: "flex", gap: 6 }}>
                <span style={{ flexShrink: 0 }}>✓</span> <span>{good}</span>
              </div>
            </div>
          ))}
        </Stagger>
        <Section style={{ marginTop: 28, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 15, color: muted }}>
            SolveFlow isn't an AI tool. It's a <span style={{ color: "#fff", fontWeight: 600 }}>complete solution delivery system</span>.
          </p>
        </Section>
      </section>

      <Divider />

      {/* ════════ REVIEW SYSTEM ════════ */}
      <section className="sf-sec">
        <Section><Badge>Teacher Review System</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h2 className="sf-h2-sm" style={{ color: "#fff" }}>
            Built for speed. <span style={{ color: "rgba(255,255,255,0.3)" }}>Built for trust.</span>
          </h2>
        </Section>
        <Section style={{ marginTop: 12 }}>
          <p style={{ margin: 0, fontSize: 15, color: muted, lineHeight: 1.7 }}>
            Every solution is pre-scored for confidence. Teachers focus where it matters most.
          </p>
        </Section>
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>
          <Stagger base={0} gap={0.12}>
            {[
              ["#22c55e", "High confidence", "75–85%", "Skip with a glance"],
              ["#eab308", "Moderate", "10–15%", "Read carefully"],
              ["#ef4444", "Low confidence", "~5%", "Verify step by step"],
            ].map(([color, label, pct, desc], i) => (
              <div key={i} className="sf-conf-row" style={{ border: `1px solid ${color}18`, background: `${color}06` }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 14px ${color}55`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{label}</span>
                  <span className="sf-conf-desc-inline">{desc}</span>
                  <div className="sf-conf-desc-block">{desc}</div>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "var(--mono)", flexShrink: 0 }}>{pct}</div>
              </div>
            ))}
          </Stagger>
        </div>
        <Section style={{ marginTop: 24 }}>
          <div className="sf-card" style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["🔒", "Yellow & red solutions are held back", "They cannot reach students without explicit teacher approval."],
              ["📸", "Corrections are pen & paper", "Write on paper, take a photo, upload. AI regenerates the solution."],
              ["📈", "Accuracy improves over time", "Every correction feeds back. By month 4, accuracy typically reaches 95%+."],
              ["📋", "Full audit trail", "Every review, correction, and approval is logged with timestamp."],
            ].map(([icon, bold, rest], i) => (
              <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                {icon} <strong style={{ color: "#fff" }}>{bold}</strong> — {rest}
              </div>
            ))}
          </div>
        </Section>
      </section>

      <Divider />

      {/* ════════ STUDENT EXPERIENCE ════════ */}
      <section className="sf-sec">
        <Section><Badge>Student Experience</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h2 className="sf-h2-sm" style={{ color: "#fff" }}>
            Your center. Your brand. <span style={{ color: "rgba(255,255,255,0.3)" }}>Invisible infrastructure.</span>
          </h2>
        </Section>
        <Stagger base={0} gap={0.08} className="sf-grid-2" style={{ marginTop: 32 }}>
          {[
            ["📱", "Works everywhere", "Phone, tablet, or laptop — any standard browser"],
            ["🔐", "OTP login", "Secure, simple, tied to registered mobile number"],
            ["📚", "Organized by batch", "Students only see content for their assigned batches"],
            ["⭐", "Bookmark hard questions", "Mark difficult questions for quick revision later"],
            ["📖", "Full archive access", "Every past paper & solution, searchable, always available"],
            ["📊", "Step-by-step detail", "Proper notation, diagrams, formulas, key concepts highlighted"],
          ].map(([icon, title, desc], i) => (
            <div key={i} className="sf-card" style={{ padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 12, color: muted, lineHeight: 1.5, marginTop: 4 }}>{desc}</div>
              </div>
            </div>
          ))}
        </Stagger>
        <Section style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: m2, margin: 0 }}>Admin manages everything — add/remove students, assign batches, revoke access — all self-serve.</p>
        </Section>
      </section>

      <Divider />

      {/* ════════ ANALYTICS ════════ */}
      <section className="sf-sec">
        <Section><Badge>Analytics Dashboard</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h2 className="sf-h2-sm" style={{ color: "#fff" }}>
            Data you've <span style={{ color: "rgba(255,255,255,0.3)" }}>never had before.</span>
          </h2>
        </Section>
        <Stagger base={0} gap={0.12} className="sf-grid-3" style={{ marginTop: 32 }}>
          {[
            ["Student Engagement", ["Who accessed solutions — and who didn't", "Same-day vs night-before cramming", "Time spent per paper per student", "Most bookmarked (difficult) questions"]],
            ["Content Quality", ["Correction rate by subject", "Accuracy improvement month over month", "Most corrected question types", "Chapter-wise difficulty patterns"]],
            ["Teacher Activity", ["Review time per paper", "Correction frequency by teacher", "Papers pending review alerts", "Full audit trail with timestamps"]],
          ].map(([title, items], i) => (
            <div key={i} className="sf-card" style={{ padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 14 }}>{title}</div>
              {items.map((item, j) => (
                <div key={j} style={{ fontSize: 13, color: muted, lineHeight: 1.45, padding: "6px 0", borderBottom: j < items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "rgba(0,212,255,0.45)", fontSize: 7, flexShrink: 0 }}>●</span> {item}
                </div>
              ))}
            </div>
          ))}
        </Stagger>
        <Section style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: m2, margin: 0 }}>Monthly summary reports delivered automatically to center admin.</p>
        </Section>
      </section>

      <Divider />

      {/* ════════ TEST SERIES ════════ */}
      <section className="sf-sec">
        <Section><Badge>Test Series Add-on</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h2 className="sf-h2-sm" style={{ color: "#fff" }}>
            Power your test series <span style={{ color: "rgba(255,255,255,0.3)" }}>at zero extra effort.</span>
          </h2>
        </Section>
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10 }}>
          <Stagger base={0} gap={0.1}>
            {[
              ["Competitive advantage", "\"Detailed step-by-step solutions\" is a selling point most competitors don't offer."],
              ["Scales effortlessly", "500 or 5,000 test series students — teachers review once, everyone gets access."],
              ["Complete separation", "Test series students see only test series content. No access to internal DPPs."],
              ["Instant delivery", "Solutions available right after the test window closes."],
            ].map(([title, desc], i) => (
              <div key={i} className="sf-card" style={{ padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#7928ca", marginTop: 8, flexShrink: 0, boxShadow: "0 0 10px #7928ca77" }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 13, color: muted, lineHeight: 1.65 }}>{desc}</div>
                </div>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      <Divider />

      {/* ════════ PRICING ════════ */}
      <section id="pricing" className="sf-sec" style={{ textAlign: "center" }}>
        <Section><Badge>Pricing</Badge></Section>
        <Section style={{ marginTop: 24 }}>
          <h2 className="sf-h2-sm" style={{ color: "#fff" }}>
            Simple. Transparent. <span style={{ color: "rgba(255,255,255,0.3)" }}>No lock-in.</span>
          </h2>
        </Section>
        <Stagger base={0} gap={0.12} className="sf-pricing-grid" style={{ marginTop: 36 }}>
          {[
            ["Up to 300 students", "120", "₹12K – ₹36K / month", false],
            ["301 – 800 students", "80", "₹24K – ₹64K / month", true],
            ["800+ students", "50", "₹40K+ / month", false],
          ].map(([tier, price, range, featured], i) => (
            <div key={i} style={{ padding: "28px 24px", borderRadius: 14, border: featured ? "1px solid rgba(0,212,255,0.25)" : "1px solid rgba(255,255,255,0.06)", background: featured ? "linear-gradient(180deg, rgba(0,212,255,0.05) 0%, rgba(121,40,202,0.03) 100%)" : "rgba(255,255,255,0.015)", position: "relative", overflow: "hidden", textAlign: "left" }}>
              {featured && <div style={{ position: "absolute", top: 12, right: 12, padding: "3px 10px", borderRadius: 9999, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", background: "linear-gradient(135deg, #00d4ff, #7928ca)", color: "#000" }}>Popular</div>}
              <div style={{ fontSize: 13, color: muted, fontWeight: 500, marginBottom: 4 }}>{tier}</div>
              <div className="sf-pricing-price">₹{price}<span style={{ fontSize: 14, color: m2, fontWeight: 400 }}>/student/mo</span></div>
              <div style={{ fontSize: 13, color: m2, marginTop: 4 }}>{range}</div>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#00d4ff", fontWeight: 600, fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>FIRST MONTH FREE</div>
            </div>
          ))}
        </Stagger>
        <Section style={{ marginTop: 28 }}>
          <div className="sf-card" style={{ padding: "20px 24px", textAlign: "left", maxWidth: 620, margin: "0 auto" }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.85 }}>
              A center with <strong style={{ color: "#fff" }}>500 students</strong> pays <strong style={{ color: "#fff" }}>₹40,000/mo</strong> — roughly <strong style={{ color: "#00d4ff" }}>₹2.60 per student per day</strong>. That's less than photocopying answer sheets.
              <br /><br />
              A single senior teacher's salary is ₹50K–₹1L+. SolveFlow saves <strong style={{ color: "#fff" }}>10–15 hours/week</strong> of teacher time across your faculty.
            </div>
          </div>
        </Section>
        <Section style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, color: m2, margin: 0, lineHeight: 1.7 }}>
            Unlimited uploads · All subjects (PCM / PCB) · Full analytics · Priority support · No contracts · No setup fees
          </p>
        </Section>
      </section>

      <Divider />

      {/* ════════ SUMMARY ════════ */}
      <section className="sf-sec" style={{ textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "min(700px, 100%)", height: 400, background: "radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Section>
          <h2 className="sf-h2" style={{ fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>
            Let your teachers teach.<br /><Accent>We'll handle the solutions.</Accent>
          </h2>
        </Section>
        <Section style={{ marginTop: 18 }}>
          <p style={{ fontSize: 16, color: muted, maxWidth: 500, lineHeight: 1.7, margin: "0 auto" }}>
            Setup takes less than a day. No technical integration needed. First month is completely free.
          </p>
        </Section>
        <Stagger base={0} gap={0.08} className="sf-summary-grid">
          {[
            ["10–15 hrs/wk", "Teacher time saved"],
            ["Same day", "Solution delivery"],
            ["100%", "Data isolation"],
            ["Zero", "Setup fees"],
          ].map(([val, label], i) => (
            <div key={i} className="sf-card" style={{ padding: "18px 14px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <div className="sf-summary-val">{val}</div>
              <div style={{ fontSize: 11, color: m2, marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </Stagger>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer id="contact" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "44px 20px", textAlign: "center", background: "rgba(255,255,255,0.01)" }}>
        <Section>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 20 }}>
            Solve<span style={{ color: "rgba(255,255,255,0.35)" }}>Flow</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", gap: "clamp(24px, 6vw, 48px)", justifyContent: "center", flexWrap: "wrap" }}>
              {[
                ["Prasad Patewar", "8668208147"],
                ["Mahesh Shendge", "7387308437"],
              ].map(([name, phone], i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{name}</div>
                  <a href={`https://wa.me/91${phone}`} style={{ fontSize: 15, fontWeight: 700, color: "#25D366", textDecoration: "none", fontFamily: "var(--mono)", letterSpacing: "0.02em", padding: "10px 24px", borderRadius: 10, border: "1px solid rgba(37,211,102,0.2)", background: "rgba(37,211,102,0.06)", display: "inline-flex", alignItems: "center", gap: 8, WebkitTapHighlightColor: "transparent" }}>
                    <span style={{ fontSize: 18 }}>💬</span> {phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 28 }}>
            © {new Date().getFullYear()} SolveFlow · Built for coaching centers
          </div>
        </Section>
      </footer>
    </div>
  );
}
