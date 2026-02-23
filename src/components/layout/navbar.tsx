"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  variant?: "full" | "short";
}

const DEMO_LINKS = [
  { href: "/demo/student",   icon: "🎓", label: "Student View",  desc: "Attempt a NEET DPP" },
  { href: "/demo/teacher",   icon: "✏️",  label: "Teacher View",  desc: "Review & publish solutions" },
  { href: "/demo/analytics", icon: "📊", label: "Analytics",     desc: "Class performance insights" },
];

export function Navbar({ variant = "full" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDemoOpen(false);
      }
    }
    if (demoOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [demoOpen]);

  // Close mobile menu on route change / scroll
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-5 md:px-12 transition-all duration-300"
        style={{
          background: scrolled || mobileOpen ? "rgba(0,0,0,0.90)" : "transparent",
          backdropFilter: scrolled || mobileOpen ? "blur(16px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled || mobileOpen ? "blur(16px) saturate(180%)" : "none",
          borderBottom: scrolled || mobileOpen
            ? "1px solid hsl(var(--border))"
            : "1px solid transparent",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-[15px] font-bold tracking-tight flex-shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          Solve<span className="text-muted-foreground">Flow</span>
        </Link>

        {/* Centre links — desktop only */}
        <div className="hidden sm:flex items-center gap-1">
          {variant === "full" && (
            <>
              <a
                href="#how-it-works"
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Pricing
              </a>
            </>
          )}

          {/* Overview link */}
          <Link
            href="/overview"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Overview
          </Link>

          {/* Demo dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDemoOpen((o) => !o)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
                demoOpen
                  ? "text-foreground bg-white/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              Demo
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${demoOpen ? "rotate-180" : ""}`}
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dropdown panel */}
            {demoOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-white/12 bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="px-3 pt-3 pb-1">
                  <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Demo pages</p>
                </div>
                {DEMO_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDemoOpen(false)}
                    className="flex items-start gap-3 px-3 py-2.5 hover:bg-white/6 transition-colors"
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white/90">{item.label}</p>
                      <p className="text-xs text-white/40">{item.desc}</p>
                    </div>
                  </Link>
                ))}
                <div className="h-2" />
              </div>
            )}
          </div>
        </div>

        {/* Right — Contact Us (desktop) + Hamburger (mobile) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#contact">Contact Us</a>
          </Button>

          {/* Hamburger button — mobile only */}
          <button
            className="sm:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md hover:bg-white/8 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`block w-5 h-0.5 bg-white/80 rounded-full transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-white/80 rounded-full transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-white/80 rounded-full transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-14 flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
        >
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
            {variant === "full" && (
              <>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-base text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium"
                >
                  How It Works
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-3 rounded-lg text-base text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium"
                >
                  Pricing
                </a>
              </>
            )}

            <Link
              href="/overview"
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-3 rounded-lg text-base text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium"
            >
              Overview
            </Link>

            {/* Demo section */}
            <div className="pt-2 pb-1">
              <p className="text-xs text-white/30 uppercase tracking-wider font-medium px-3 pb-2">Demo pages</p>
              {DEMO_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-base font-medium text-white/90">{item.label}</p>
                    <p className="text-sm text-white/40">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Contact */}
            <div className="pt-4">
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-lg bg-white text-black font-semibold text-base transition-colors hover:bg-white/90"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
