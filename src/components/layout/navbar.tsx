"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  variant?: "full" | "short";
}

export function Navbar({ variant = "full" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-5 md:px-12 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(0,0,0,0.80)" : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        borderBottom: scrolled
          ? "1px solid hsl(var(--border))"
          : "1px solid transparent",
      }}
    >
      {/* Logo */}
      <Link href="/" className="text-[15px] font-bold tracking-tight">
        Solve<span className="text-muted-foreground">Flow</span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-5">
        {variant === "full" ? (
          <>
            <a
              href="#how-it-works"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Pricing
            </a>
          </>
        ) : (
          <Link
            href="/"
            className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Full Details
          </Link>
        )}
        <Button asChild size="sm">
          <a href="#contact">Contact Us</a>
        </Button>
      </div>
    </nav>
  );
}
