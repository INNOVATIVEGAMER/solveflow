import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn, Stagger } from "@/components/shared/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RenderingShowcase } from "@/components/sections/rendering-showcase";

// ─── Data ────────────────────────────────────────────────────────────────────

const heroStats = [
  { value: "1 account", label: "Admin manages everything" },
  { value: "Any team size", label: "Add teachers as needed" },
  { value: "Shared pool", label: "One pack, all teachers draw" },
];

const forWhomItems = [
  {
    icon: "🏫",
    title: "Small & mid-size institutes",
    desc: "2–10 teachers. No student app needed.",
  },
  {
    icon: "📵",
    title: "Paper-first centers",
    desc: "Students study from printouts, not phones.",
  },
  {
    icon: "👨‍💼",
    title: "Admin buys, teachers use",
    desc: "One credit pack. No per-teacher billing.",
  },
  {
    icon: "📄",
    title: "PDF-first workflow",
    desc: "Download the solution PDF. Share however you want.",
  },
];

const tenantSteps = [
  {
    step: "01",
    actor: "Admin",
    title: "Create the institute account",
    desc: "One account for your center. You manage teachers and credits.",
    color: "#7928ca",
  },
  {
    step: "02",
    actor: "Admin",
    title: "Buy a credit pack",
    desc: "Credits go into a shared pool. All teachers draw from it.",
    color: "#7928ca",
  },
  {
    step: "03",
    actor: "Admin",
    title: "Add your teachers",
    desc: "Invite by phone or email. Access is instant.",
    color: "#00d4ff",
  },
  {
    step: "04",
    actor: "Teacher",
    title: "Upload a question paper",
    desc: "PDF upload. AI generates solutions for every question.",
    color: "#00d4ff",
  },
  {
    step: "05",
    actor: "Teacher",
    title: "Review and approve",
    desc: "Confidence-scored. ~10 min review. Photo upload for corrections.",
    color: "#00d4ff",
  },
  {
    step: "06",
    actor: "Teacher",
    title: "Export PDF",
    desc: "Download. Print, WhatsApp, email — your call.",
    color: "#00d4ff",
  },
];

const creditPacks = [
  {
    name: "Starter",
    questions: "1,000 questions",
    price: "₹5,000",
    perQ: "₹5 / question",
    savings: null,
    savingsTag: null,
    featured: false,
    desc: "1–2 teachers",
    teachers: "Up to 3 teachers",
  },
  {
    name: "Institute",
    questions: "5,000 questions",
    price: "₹20,000",
    perQ: "₹4 / question",
    savings: "₹1 cheaper per question",
    savingsTag: "Save 20%",
    featured: true,
    desc: "3–6 teachers",
    teachers: "Up to 10 teachers",
  },
  {
    name: "Department",
    questions: "15,000 questions",
    price: "₹45,000",
    perQ: "₹3 / question",
    savings: "₹2 cheaper per question",
    savingsTag: "Save 40%",
    featured: false,
    desc: "Large staff",
    teachers: "Unlimited teachers",
  },
];

const teamUsageExample = [
  {
    teacher: "Physics teacher",
    papers: "1 DPP/day × 26 days",
    questions: "~780 Q/month",
  },
  {
    teacher: "Chemistry teacher",
    papers: "1 DPP/day × 26 days",
    questions: "~780 Q/month",
  },
  {
    teacher: "Biology teacher",
    papers: "1 DPP/day × 26 days",
    questions: "~780 Q/month",
  },
  {
    teacher: "Maths teacher",
    papers: "1 DPP/day × 26 days",
    questions: "~780 Q/month",
  },
  {
    teacher: "Weekly exam (all subjects)",
    papers: "1 full mock/week × 4 weeks",
    questions: "~720 Q/month",
  },
];

const vsFullPlatform = [
  { feature: "Teacher upload & AI generation", lite: true, full: true },
  { feature: "Teacher review & approval flow", lite: true, full: true },
  { feature: "PDF export of solutions", lite: true, full: false },
  { feature: "Student mobile app", lite: false, full: true },
  { feature: "OTP-based student login", lite: false, full: true },
  { feature: "Student attempt tracking", lite: false, full: true },
  { feature: "Class analytics dashboard", lite: false, full: true },
  { feature: "Per-student performance data", lite: false, full: true },
  { feature: "Admin teacher management", lite: true, full: true },
  { feature: "Shared credit pool", lite: true, full: false },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LitePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="short" />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-5 text-center max-w-4xl mx-auto">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(121,40,202,0.08) 0%, rgba(0,212,255,0.03) 50%, transparent 70%)",
          }}
        />
        <FadeIn>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge
              variant="outline"
              className="font-mono text-xs tracking-widest uppercase"
            >
              SolveFlow Lite
            </Badge>
            <Badge
              className="font-mono text-xs tracking-widest uppercase text-white border-0"
              style={{
                background: "linear-gradient(135deg, #7928ca, #00d4ff)",
              }}
            >
              PDF Export
            </Badge>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight mb-5">
            One account.{" "}
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Your whole team.
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            Admin buys credits. Teachers upload papers, review AI solutions,
            export PDFs. No student app. No student logins.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="flex justify-center gap-8 md:gap-12 flex-wrap mb-10">
            {heroStats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl md:text-2xl font-bold font-mono tracking-tight">
                  {value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 text-white border-0 font-bold px-8"
            >
              <a href="#pricing">See Pricing</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/demo/teacher" target="_blank" rel="noopener noreferrer">
                See teacher demo ↗
              </a>
            </Button>
          </div>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── FOR WHOM ── */}
      <section className="py-14 md:py-20 px-5 max-w-3xl mx-auto">
        <FadeIn>
          <Badge
            variant="outline"
            className="font-mono text-xs tracking-widest uppercase mb-5"
          >
            Who is this for
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Solutions fast.{" "}
            <span className="text-muted-foreground/40">
              No student platform.
            </span>
          </h2>
        </FadeIn>
        <Stagger
          baseDelay={0}
          gap={0.1}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch"
        >
          {forWhomItems.map(({ icon, title, desc }) => (
            <Card key={title} className="h-full flex flex-col">
              <CardContent className="p-5 flex gap-3 items-start flex-1">
                <span className="text-xl mt-0.5 shrink-0">{icon}</span>
                <div>
                  <p className="text-base font-semibold leading-snug">
                    {title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </Stagger>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── HOW IT WORKS — TENANT FLOW ── */}
      <section className="py-14 md:py-20 px-5 max-w-3xl mx-auto">
        <FadeIn>
          <Badge
            variant="outline"
            className="font-mono text-xs tracking-widest uppercase mb-5"
          >
            How It Works
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">
            Admin sets up once.{" "}
            <span className="text-muted-foreground/40">
              Teachers just use it.
            </span>
          </h2>
        </FadeIn>

        <div className="flex flex-col gap-0">
          {tenantSteps.map(({ step, actor, title, desc, color }, i) => {
            const isAdminStep = actor === "Admin";
            return (
              <FadeIn key={step} delay={i * 0.08}>
                <div className="flex gap-5 pb-7 relative">
                  {/* Connector line */}
                  {i < tenantSteps.length - 1 && (
                    <div
                      className="absolute left-[19px] top-10 w-px"
                      style={{
                        height: "calc(100% - 8px)",
                        background: `linear-gradient(to bottom, ${color}40, transparent)`,
                      }}
                    />
                  )}
                  {/* Step circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 z-10"
                    style={{
                      border: `1px solid ${color}35`,
                      background: `${color}10`,
                      color,
                    }}
                  >
                    {step}
                  </div>
                  <div className="pt-1.5 pb-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-semibold">{title}</p>
                      <span
                        className="text-[10px] font-bold font-mono tracking-widest uppercase px-1.5 py-0.5 rounded"
                        style={{
                          color: isAdminStep ? "#7928ca" : "#00d4ff",
                          background: isAdminStep
                            ? "rgba(121,40,202,0.1)"
                            : "rgba(0,212,255,0.1)",
                          border: `1px solid ${isAdminStep ? "rgba(121,40,202,0.2)" : "rgba(0,212,255,0.2)"}`,
                        }}
                      >
                        {actor}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn>
          <p className="text-xs text-muted-foreground/50 text-center">
            Credits deducted per question processed, shared across all teachers.
          </p>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── RENDERING SHOWCASE ── */}
      <RenderingShowcase />

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── TEAM USAGE EXAMPLE ── */}
      <section className="py-14 md:py-20 px-5 max-w-3xl mx-auto">
        <FadeIn>
          <Badge
            variant="outline"
            className="font-mono text-xs tracking-widest uppercase mb-5"
          >
            Team Usage Example
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            4 teachers. How many credits?
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="rounded-xl border border-border overflow-hidden mb-6">
            <div className="grid grid-cols-[1fr_1fr_auto] bg-muted/40">
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 border-r border-border">
                Teacher
              </div>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 border-r border-border">
                Upload pattern
              </div>
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                Monthly use
              </div>
            </div>
            <div className="divide-y divide-border/30">
              {teamUsageExample.map(({ teacher, papers, questions }) => (
                <div key={teacher} className="grid grid-cols-[1fr_1fr_auto]">
                  <div className="px-4 py-3 text-sm font-medium border-r border-border/30">
                    {teacher}
                  </div>
                  <div className="px-4 py-3 text-sm text-muted-foreground border-r border-border/30">
                    {papers}
                  </div>
                  <div className="px-4 py-3 text-sm font-mono font-bold text-purple-400">
                    {questions}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_1fr_auto] bg-muted/20">
                <div className="px-4 py-3 text-sm font-bold border-r border-border/30">
                  Total
                </div>
                <div className="px-4 py-3 text-sm text-muted-foreground border-r border-border/30">
                  4 teachers + weekly exam
                </div>
                <div className="px-4 py-3 text-sm font-mono font-bold text-foreground">
                  ~3,840 Q/month
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <p className="text-sm text-muted-foreground text-center">
            The{" "}
            <strong className="text-foreground">
              Institute pack (5,000Q at ₹4/Q)
            </strong>{" "}
            covers a full month at ₹20,000 — vs ₹19,200 at base rate.
          </p>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── PRICING ── */}
      <section
        id="pricing"
        className="py-14 md:py-20 px-5 max-w-3xl mx-auto text-center"
      >
        <FadeIn>
          <Badge
            variant="outline"
            className="font-mono text-xs tracking-widest uppercase mb-5"
          >
            Pricing
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Buy credits.{" "}
            <span className="text-muted-foreground/40">
              No per-teacher seats.
            </span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-base text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
            One pack for the whole team. Valid 6 months.
          </p>
        </FadeIn>

        <Stagger
          baseDelay={0}
          gap={0.12}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left items-stretch"
        >
          {creditPacks.map(
            ({
              name,
              questions,
              price,
              perQ,
              savings,
              savingsTag,
              featured,
              desc,
              teachers,
            }) => (
              <div
                key={name}
                className="relative rounded-2xl p-6 overflow-hidden flex flex-col"
                style={{
                  border: featured
                    ? "1px solid rgba(121,40,202,0.35)"
                    : "1px solid hsl(var(--border))",
                  background: featured
                    ? "linear-gradient(180deg, rgba(121,40,202,0.06) 0%, rgba(0,212,255,0.03) 100%)"
                    : "hsl(var(--card))",
                }}
              >
                {featured && (
                  <div
                    className="absolute top-3 right-3 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
                    style={{
                      background: "linear-gradient(135deg, #7928ca, #00d4ff)",
                    }}
                  >
                    Popular
                  </div>
                )}
                {savingsTag && !featured && (
                  <div className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full text-green-400 border border-green-400/20 bg-green-400/5">
                    {savingsTag}
                  </div>
                )}
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  {name}
                </p>
                <div className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
                  {price}
                </div>
                <p className="text-sm text-muted-foreground font-mono mb-1">
                  {questions}
                </p>
                <p
                  className="text-xs font-semibold font-mono tracking-wider"
                  style={{
                    color: featured
                      ? "#a78bfa"
                      : "hsl(var(--muted-foreground))",
                  }}
                >
                  {perQ}
                </p>
                {savings && (
                  <p className="text-xs text-green-400/80 mt-0.5">{savings}</p>
                )}
                <Separator className="my-3 opacity-20" />
                <p className="text-xs text-muted-foreground mb-1">{desc}</p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#00d4ff88" }}
                >
                  {teachers}
                </p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  Valid 6 months
                </p>
              </div>
            ),
          )}
        </Stagger>

        <FadeIn>
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            No subscription · No per-seat fee · PCM / PCB · Credits valid 6
            months ·{" "}
            <span className="text-foreground font-semibold">
              First 100Q free
            </span>
          </p>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── LITE VS FULL PLATFORM ── */}
      <section className="py-14 md:py-20 px-5 max-w-3xl mx-auto">
        <FadeIn>
          <Badge
            variant="outline"
            className="font-mono text-xs tracking-widest uppercase mb-5"
          >
            Lite vs Full Platform
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Lite or full platform?
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="grid grid-cols-[1fr_80px_80px] mb-1 text-xs font-bold uppercase tracking-wider">
            <div className="px-4 pb-2 text-muted-foreground/40"></div>
            <div className="px-2 pb-2 text-center text-purple-400/70">Lite</div>
            <div className="px-2 pb-2 text-center text-cyan-400/70">Full</div>
          </div>
        </FadeIn>
        <Stagger
          baseDelay={0.15}
          gap={0.06}
          className="border border-border rounded-xl overflow-hidden mb-8"
        >
          {vsFullPlatform.map(({ feature, lite, full }, i) => (
            <div
              key={feature}
              className={`grid grid-cols-[1fr_80px_80px] ${i < vsFullPlatform.length - 1 ? "border-b border-border/30" : ""}`}
            >
              <div className="px-4 py-3 text-sm text-muted-foreground border-r border-border/30">
                {feature}
              </div>
              <div className="px-2 py-3 flex items-center justify-center border-r border-border/30">
                {lite ? (
                  <span className="text-purple-400 font-bold text-base">✓</span>
                ) : (
                  <span className="text-muted-foreground/20 text-base">—</span>
                )}
              </div>
              <div className="px-2 py-3 flex items-center justify-center">
                {full ? (
                  <span className="text-cyan-400 font-bold text-base">✓</span>
                ) : (
                  <span className="text-muted-foreground/20 text-base">—</span>
                )}
              </div>
            </div>
          ))}
        </Stagger>

        <FadeIn>
          <p className="text-sm text-muted-foreground text-center">
            You can upgrade to the full platform at any time — content and
            teacher history carry over.
          </p>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── CTA ── */}
      <section className="relative py-14 md:py-20 px-5 max-w-3xl mx-auto text-center">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(121,40,202,0.05) 0%, transparent 70%)",
          }}
        />
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-5 leading-tight">
            Up and running today.
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
              PDFs by tomorrow.
            </span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">
            First 100 questions free. No setup fee.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 text-white border-0 font-bold px-8"
            >
              <a href="#contact">Contact Us — First 100Q Free</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/demo/teacher" target="_blank" rel="noopener noreferrer">
                Try the teacher demo ↗
              </a>
            </Button>
          </div>
        </FadeIn>
        <FadeIn delay={0.25}>
          <p className="text-xs text-muted-foreground/50 mt-5">
            Want the full platform with student access and analytics?{" "}
            <a
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              See SolveFlow
            </a>
          </p>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}
