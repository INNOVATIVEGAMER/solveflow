import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn, Stagger } from "@/components/shared/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HowItWorksTimeline } from "@/components/sections/how-it-works-timeline";
import { StudentExperience } from "@/components/sections/student-experience";
import { AnalyticsDashboard } from "@/components/sections/analytics-dashboard";

// ─── Data ────────────────────────────────────────────────────────────────────

const heroStats = [
  { value: "15 min", label: "Solution generation" },
  { value: "10 min", label: "Teacher review" },
  { value: "Same day", label: "Student access" },
];

const problemOneItems = [
  {
    bold: "1.5–2 hrs every evening",
    rest: "writing detailed DPP solutions after teaching 4–6 batches daily",
  },
  {
    bold: "3–4 hrs on weekends",
    rest: "preparing solution sets for weekly tests before Monday's discussion class",
  },
  {
    bold: "Repetitive, low-leverage work",
    rest: "the teacher already knows the solution — writing it out step-by-step is pure overhead",
  },
];

const problemTwoCards = [
  {
    value: "Next day",
    desc: "DPP solutions discussed in class the day after — learning momentum lost",
    color: "text-destructive",
  },
  {
    value: "2–3 days later",
    desc: "Weekly test solutions arrive days later, sometimes a full week",
    color: "text-destructive",
  },
  {
    value: "Never",
    desc: "Students absent on solution discussion day have no access at all",
    color: "text-destructive",
  },
];

const hiddenCostItems = [
  { icon: "💬", title: "Personalized doubt clearing", sub: "for students who are struggling" },
  { icon: "📝", title: "Better question design", sub: "and smarter test strategies" },
  { icon: "🎯", title: "Concept revision sessions", sub: "before major exams" },
  { icon: "🏆", title: "Mentoring top students", sub: "for advanced problem-solving" },
];

const solutionChecks = [
  "Your questions",
  "Your teachers' review",
  "Your students only",
  "Your branding",
];



const dayRows = [
  { time: "4:00 PM", without: "Class ends, DPP distributed", with: "DPP distributed + uploaded to SolveFlow" },
  { time: "4:30 PM", without: "Teacher starts writing solutions", with: "AI generates solutions. Teacher is free" },
  { time: "5:00 PM", without: "Teacher still writing solutions…", with: "Teacher reviews on phone (10–15 min)" },
  { time: "5:15 PM", without: "Teacher still writing solutions…", with: "Solutions go live for students ✓" },
  { time: "6:00 PM", without: "Finishes, sends PDF to WhatsApp", with: "Teacher spends time on doubt clearing" },
  { time: "Next day", without: "Class spent discussing solutions", with: "Class time used for new concepts" },
];

const chatgptItems = [
  { title: "Generation", bad: "One question at a time, copy-paste ×30", good: "Upload entire paper once — all solutions generated" },
  { title: "Quality Control", bad: "No review system, no confidence scoring", good: "Auto-scoring + mandatory sign-off on flagged solutions" },
  { title: "Corrections", bad: "Type physics diagrams in a text chat?", good: "Write on paper → photo → upload. Done." },
  { title: "Distribution", bad: "WhatsApp PDF chaos, formatting breaks", good: "Private platform, organized by batch & date" },
  { title: "Access Control", bad: "Anyone can forward the PDF", good: "OTP-based login — enrolled students only" },
  { title: "Analytics", bad: "Zero visibility into engagement", good: "Full tracking, review activity, monthly reports" },
];

const confidenceLevels = [
  { color: "#22c55e", label: "High confidence", pct: "75–85%", desc: "Skip with a glance" },
  { color: "#eab308", label: "Moderate", pct: "10–15%", desc: "Read carefully" },
  { color: "#ef4444", label: "Low confidence", pct: "~5%", desc: "Verify step by step" },
];

const reviewDetails = [
  { icon: "🔒", bold: "Yellow & red solutions are held back", rest: "They cannot reach students without explicit teacher approval." },
  { icon: "📸", bold: "Corrections are pen & paper", rest: "Write on paper, take a photo, upload. AI regenerates the solution." },
  { icon: "📈", bold: "Accuracy improves over time", rest: "Every correction feeds back. By month 4, accuracy typically reaches 95%+." },
  { icon: "📋", bold: "Full audit trail", rest: "Every review, correction, and approval is logged with timestamp." },
];

const studentFeatures = [
  { icon: "📱", title: "Works everywhere", desc: "Phone, tablet, or laptop — any standard browser" },
  { icon: "🔐", title: "OTP login", desc: "Secure, simple, tied to registered mobile number" },
  { icon: "📚", title: "Organized by batch", desc: "Students only see content for their assigned batches" },
  { icon: "⭐", title: "Bookmark hard questions", desc: "Mark difficult questions for quick revision later" },
  { icon: "📖", title: "Full archive access", desc: "Every past paper & solution, searchable, always available" },
  { icon: "📊", title: "Step-by-step detail", desc: "Proper notation, diagrams, formulas, key concepts highlighted" },
];

const testSeriesItems = [
  { title: "Competitive advantage", desc: '"Detailed step-by-step solutions" is a selling point most competitors don\'t offer.' },
  { title: "Scales effortlessly", desc: "500 or 5,000 test series students — teachers review once, everyone gets access." },
  { title: "Complete separation", desc: "Test series students see only test series content. No access to internal DPPs." },
  { title: "Instant delivery", desc: "Solutions available right after the test window closes." },
];

const pricingTiers = [
  { tier: "Up to 300 students", price: "120", range: "₹12K – ₹36K / month", featured: false },
  { tier: "301 – 800 students", price: "80", range: "₹24K – ₹64K / month", featured: true },
  { tier: "800+ students", price: "50", range: "₹40K+ / month", featured: false },
];

const summaryStats = [
  { val: "10–15 hrs/wk", label: "Teacher time saved" },
  { val: "Same day", label: "Solution delivery" },
  { val: "100%", label: "Data isolation" },
  { val: "Zero", label: "Setup fees" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="full" />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-5 text-center max-w-4xl mx-auto">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,212,255,0.06) 0%, rgba(121,40,202,0.03) 40%, transparent 70%)",
          }}
        />
        <FadeIn>
          <Badge variant="outline" className="mb-6 font-mono text-xs tracking-widest uppercase">
            For Coaching Centers
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none mb-5">
            Solve<span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Flow</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            Detailed solutions for every DPP and exam paper. Generated in minutes, reviewed by your teachers, available to your students instantly.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="flex justify-center gap-10 flex-wrap mb-10">
            {heroStats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold font-mono tracking-tight">{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={0.4}>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-white border-0 font-bold px-8"
          >
            <a href="#contact">Contact Us — First Month Free</a>
          </Button>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── PROBLEM 1 ── */}
      <section className="py-14 md:py-20 px-5 max-w-3xl mx-auto">
        <FadeIn>
          <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
            The Problem
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Your teachers are stretched thin.
          </h2>
        </FadeIn>
        <Stagger baseDelay={0} gap={0.12} className="flex flex-col gap-5">
          {problemOneItems.map(({ bold, rest }) => (
            <div key={bold} className="flex gap-3 items-start">
              <span
                className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"
                style={{ boxShadow: "0 0 8px rgba(0,212,255,0.5)" }}
              />
              <p className="text-base text-muted-foreground leading-relaxed">
                <span className="text-foreground font-semibold">{bold}</span> — {rest}
              </p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* ── PROBLEM 2 ── */}
      <section className="py-14 md:py-20 px-5 max-w-3xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Students don&apos;t get solutions fast enough.
          </h2>
        </FadeIn>
        <Stagger baseDelay={0} gap={0.12} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 items-stretch">
          {problemTwoCards.map(({ value, desc }) => (
            <Card key={value} className="h-full flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="text-2xl font-bold font-mono text-destructive mb-2">{value}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </Stagger>
        <FadeIn>
          <blockquote className="border-l-2 border-border pl-4 text-base text-muted-foreground leading-relaxed">
            By the time solutions arrive, students have moved on.{" "}
            <span className="text-foreground font-semibold">The learning moment is lost.</span>
          </blockquote>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── HIDDEN COST ── */}
      <section className="py-14 md:py-20 px-5 max-w-3xl mx-auto">
        <FadeIn>
          <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
            The Hidden Cost
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            You&apos;re paying teacher salaries{" "}
            <span className="text-muted-foreground/40">for work that doesn&apos;t need a teacher.</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-base text-muted-foreground mb-6">Those 2 hours every evening could be spent on:</p>
        </FadeIn>
        <Stagger baseDelay={0} gap={0.1} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
          {hiddenCostItems.map(({ icon, title, sub }) => (
            <Card key={title} className="h-full flex flex-col">
              <CardContent className="p-5 flex gap-3 items-start flex-1">
                <span className="text-xl mt-0.5 shrink-0">{icon}</span>
                <div>
                  <p className="text-base font-semibold leading-snug">{title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </Stagger>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── SOLUTION INTRO ── */}
      <section className="relative py-14 md:py-20 px-5 max-w-3xl mx-auto text-center">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(121,40,202,0.05) 0%, transparent 70%)",
          }}
        />
        <FadeIn>
          <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
            The Solution
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-5">
            Solve<span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Flow</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed mb-8">
            A platform purpose-built for coaching centers that automates the creation, review, and distribution of detailed solutions for DPPs and exam papers.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <Card className="max-w-md mx-auto mb-8 text-left">
            <CardContent className="p-6">
              <p className="text-base text-muted-foreground leading-relaxed italic">
                &ldquo;Think of us as a{" "}
                <span className="text-foreground font-semibold">printing press</span>, not a
                publisher. You write the content and control the quality. We handle the production
                and delivery.&rdquo;
              </p>
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.25}>
          <div className="flex flex-wrap justify-center gap-4">
            {solutionChecks.map((t) => (
              <span key={t} className="text-base text-muted-foreground flex items-center gap-1.5">
                <span className="text-cyan-400">✓</span> {t}
              </span>
            ))}
          </div>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-14 md:py-20 px-5 max-w-3xl mx-auto">
        <FadeIn>
          <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
            How It Works
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Four steps. That&apos;s it.
          </h2>
        </FadeIn>
        <FadeIn>
          <HowItWorksTimeline />
        </FadeIn>
        <FadeIn>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-muted-foreground leading-relaxed mt-6">
            <span className="text-cyan-400 font-semibold">Key insight:</span> Teachers keep working
            with pen and paper. The platform adapts to them — not the other way around.
          </div>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── DAY IN THE LIFE ── */}
      <section className="py-14 md:py-20 px-5 max-w-3xl mx-auto">
        <FadeIn>
          <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
            A Day in the Life
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Before <span className="text-muted-foreground/40">&</span> After
          </h2>
        </FadeIn>

        {/* Desktop table */}
        <div className="hidden sm:block rounded-xl border border-border overflow-hidden mb-6">
          <div className="grid grid-cols-[110px_1fr_1fr] bg-muted/40">
            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 border-r border-border">Time</div>
            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-destructive/60 border-r border-border">Without</div>
            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-cyan-400/70">With SolveFlow</div>
          </div>
          <Stagger baseDelay={0} gap={0.06} className="divide-y divide-border/30">
            {dayRows.map(({ time, without, with: withSF }) => (
              <div key={time} className="grid grid-cols-[110px_1fr_1fr]">
                <div className="px-4 py-3 text-sm font-mono text-muted-foreground/60 border-r border-border/30 bg-muted/10">{time}</div>
                <div className="px-4 py-3 text-sm text-muted-foreground/60 border-r border-border/30">{without}</div>
                <div className="px-4 py-3 text-sm text-foreground/90 bg-cyan-500/[0.02]">{withSF}</div>
              </div>
            ))}
          </Stagger>
        </div>

        {/* Mobile stacked */}
        <Stagger baseDelay={0} gap={0.08} className="sm:hidden flex flex-col gap-2 mb-6">
          {dayRows.map(({ time, without, with: withSF }) => (
            <Card key={time}>
              <CardContent className="p-4">
                <p className="text-sm font-mono text-muted-foreground/60 font-semibold mb-2">{time}</p>
                <div className="grid grid-cols-2 gap-3 leading-snug">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-destructive/70 mb-1">Without</p>
                    <p className="text-sm text-muted-foreground/70">{without}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400/80 mb-1">With SolveFlow</p>
                    <p className="text-sm text-foreground/90">{withSF}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </Stagger>

        <FadeIn>
          <p className="text-center text-sm text-muted-foreground">
            For weekly exams: solutions live by{" "}
            <span className="text-cyan-400 font-semibold">Sunday afternoon</span> → Monday&apos;s class is entirely free for new teaching.
          </p>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── WHY NOT CHATGPT ── */}
      <section className="py-14 md:py-20 px-5 max-w-3xl mx-auto">
        <FadeIn>
          <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
            Why Not ChatGPT?
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 leading-snug">
            Generating a solution is 10% of the problem.{" "}
            <span className="text-muted-foreground/40">The other 90% is the workflow.</span>
          </h2>
        </FadeIn>
        {/* Column headers */}
        <FadeIn delay={0.15}>
          <div className="grid grid-cols-[120px_1fr_1fr] mb-1">
            <div />
            <div className="px-4 pb-2 text-xs font-bold text-destructive/50 uppercase tracking-wider">
              ChatGPT
            </div>
            <div className="px-4 pb-2 text-xs font-bold text-cyan-400/60 uppercase tracking-wider">
              SolveFlow
            </div>
          </div>
        </FadeIn>
        <Stagger baseDelay={0.2} gap={0.08} className="border border-border rounded-xl overflow-hidden mb-8">
          {chatgptItems.map(({ title, bad, good }, i) => (
            <div
              key={title}
              className={`grid grid-cols-[120px_1fr_1fr] ${i < chatgptItems.length - 1 ? "border-b border-border/30" : ""}`}
            >
              <div className="px-4 py-3.5 text-sm font-semibold text-muted-foreground/60 border-r border-border/30">
                {title}
              </div>
              <div className="px-4 py-3.5 text-sm text-destructive/50 border-r border-border/30 leading-relaxed">
                {bad}
              </div>
              <div className="px-4 py-3.5 text-sm text-cyan-400/80 leading-relaxed">
                {good}
              </div>
            </div>
          ))}
        </Stagger>
        <FadeIn>
          <p className="text-center text-sm text-muted-foreground">
            SolveFlow isn&apos;t an AI tool. It&apos;s a{" "}
            <span className="text-foreground font-semibold">complete solution delivery system</span>.
          </p>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── REVIEW SYSTEM ── */}
      <section className="py-14 md:py-20 px-5 max-w-3xl mx-auto">
        <FadeIn>
          <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
            Teacher Review System
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Built for speed.{" "}
            <span className="text-muted-foreground/40">Built for trust.</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            Every solution is pre-scored for confidence. Teachers focus where it matters most.
          </p>
        </FadeIn>
        <Stagger baseDelay={0} gap={0.12} className="flex flex-col gap-2 mb-6">
          {confidenceLevels.map(({ color, label, pct, desc }) => (
            <div
              key={label}
              className="flex items-center gap-4 px-5 py-4 rounded-xl"
              style={{
                border: `1px solid ${color}18`,
                background: `${color}06`,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: color, boxShadow: `0 0 12px ${color}55` }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-base font-semibold">{label}</span>
                <span className="text-sm text-muted-foreground ml-2 hidden sm:inline">{desc}</span>
                <p className="text-sm text-muted-foreground sm:hidden mt-0.5">{desc}</p>
              </div>
              <span
                className="text-lg font-bold font-mono shrink-0"
                style={{ color }}
              >
                {pct}
              </span>
            </div>
          ))}
        </Stagger>
        <FadeIn>
          <Card>
            <CardContent className="p-5 flex flex-col gap-3">
              {reviewDetails.map(({ icon, bold, rest }) => (
                <p key={bold} className="text-sm text-muted-foreground leading-relaxed">
                  {icon} <strong className="text-foreground">{bold}</strong> — {rest}
                </p>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── STUDENT EXPERIENCE ── */}
      <section className="py-14 md:py-20 px-5 max-w-5xl mx-auto">
        <div className="max-w-3xl mb-8">
          <FadeIn>
            <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
              Student Experience
            </Badge>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Your center. Your brand.{" "}
              <span className="text-muted-foreground/40">Invisible infrastructure.</span>
            </h2>
          </FadeIn>
        </div>
        <StudentExperience />
        <FadeIn>
          <p className="text-center text-sm text-muted-foreground/70 mt-8">
            Admin manages everything — add/remove students, assign batches, revoke access — all self-serve.
          </p>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── ANALYTICS ── */}
      <section className="py-14 md:py-20 px-5 max-w-4xl mx-auto">
        <FadeIn>
          <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
            Analytics Dashboard
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Data you&apos;ve{" "}
            <span className="text-muted-foreground/40">never had before.</span>
          </h2>
        </FadeIn>
        <AnalyticsDashboard />
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── TEST SERIES ── */}
      <section className="py-14 md:py-20 px-5 max-w-4xl mx-auto">
        <FadeIn>
          <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
            Test Series Add-on
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
            Power your test series{" "}
            <span className="text-muted-foreground/40">at zero extra effort.</span>
          </h2>
        </FadeIn>
        <Stagger baseDelay={0} gap={0.1} className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&>div]:h-full">
          {testSeriesItems.map(({ title, desc }) => (
            <div
              key={title}
              className="h-full min-h-[160px] rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col gap-3 hover:border-purple-500/30 transition-colors duration-300"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: "#7928ca", boxShadow: "0 0 12px #7928ca88" }}
              />
              <p className="text-base font-semibold leading-snug">{title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </Stagger>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── PRICING ── */}
      <section id="pricing" className="py-14 md:py-20 px-5 max-w-3xl mx-auto text-center">
        <FadeIn>
          <Badge variant="outline" className="font-mono text-xs tracking-widest uppercase mb-5">
            Pricing
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">
            Simple. Transparent.{" "}
            <span className="text-muted-foreground/40">No lock-in.</span>
          </h2>
        </FadeIn>
        <Stagger baseDelay={0} gap={0.12} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left items-stretch">
          {pricingTiers.map(({ tier, price, range, featured }) => (
            <div
              key={tier}
              className="relative rounded-2xl p-6 overflow-hidden flex flex-col"
              style={{
                border: featured ? "1px solid rgba(0,212,255,0.25)" : "1px solid hsl(var(--border))",
                background: featured
                  ? "linear-gradient(180deg, rgba(0,212,255,0.05) 0%, rgba(121,40,202,0.03) 100%)"
                  : "hsl(var(--card))",
              }}
            >
              {featured && (
                <div
                  className="absolute top-3 right-3 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-black"
                  style={{ background: "linear-gradient(135deg, #00d4ff, #7928ca)" }}
                >
                  Popular
                </div>
              )}
              <p className="text-sm text-muted-foreground font-medium mb-2">{tier}</p>
              <div className="text-3xl md:text-4xl font-bold tracking-tight">
                ₹{price}
                <span className="text-sm font-normal text-muted-foreground/60">/student/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{range}</p>
              <Separator className="my-4 opacity-20" />
              <p className="text-xs font-semibold font-mono tracking-wider text-cyan-400">FIRST MONTH FREE</p>
            </div>
          ))}
        </Stagger>
        <FadeIn>
          <Card className="max-w-lg mx-auto mb-5 text-left">
            <CardContent className="p-5 text-sm text-muted-foreground leading-relaxed">
              A center with <strong className="text-foreground">500 students</strong> pays{" "}
              <strong className="text-foreground">₹40,000/mo</strong> — roughly{" "}
              <strong className="text-cyan-400">₹2.60 per student per day</strong>. That&apos;s less than photocopying answer sheets.
              <br />
              <br />
              A single senior teacher&apos;s salary is ₹50K–₹1L+. SolveFlow saves{" "}
              <strong className="text-foreground">10–15 hours/week</strong> of teacher time across your faculty.
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn>
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            Unlimited uploads · All subjects (PCM / PCB) · Full analytics · Priority support · No contracts · No setup fees
          </p>
        </FadeIn>
      </section>

      <Separator className="max-w-3xl mx-auto opacity-20" />

      {/* ── SUMMARY ── */}
      <section className="relative py-14 md:py-20 px-5 max-w-4xl mx-auto text-center">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,212,255,0.04) 0%, transparent 70%)",
          }}
        />
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-5 leading-tight">
            Let your teachers teach.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              We&apos;ll handle the solutions.
            </span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-10">
            Setup takes less than a day. No technical integration needed. First month is completely free.
          </p>
        </FadeIn>
        <Stagger baseDelay={0} gap={0.1} className="grid grid-cols-2 gap-4 max-w-xl mx-auto items-stretch">
          {summaryStats.map(({ val, label }) => (
            <div
              key={val}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {val}
              </div>
              <div className="text-sm text-muted-foreground leading-snug">{label}</div>
            </div>
          ))}
        </Stagger>
      </section>

      <Footer />
    </div>
  );
}
