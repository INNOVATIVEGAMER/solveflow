"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import MathMarkdown from "@/components/shared/math-markdown";
import { FadeIn } from "@/components/shared/fade-in";

// ─── DPP metadata shared across all subjects ─────────────────────────────────

const DPP_META = {
  title: "SolveFlow Sample DPP",
  subtitle: "Physics · Chemistry · Mathematics · Biology",
  target: "JEE / NEET 2026",
  class: "12",
  date: new Date().toISOString().slice(0, 10),
  instructions:
    "Each question carries 4 marks for a correct answer. −1 mark for each incorrect answer. No deduction for unattempted questions.",
};

// ─── Hardcoded showcase questions ────────────────────────────────────────────
// One best-render question per subject (PCMB), chosen for LaTeX complexity.
// Each entry also carries the full subject questions array for PDF generation.

const SHOWCASE_QUESTIONS = [
  {
    subject: "Physics",
    subjectColor: "cyan",
    icon: "⚛",
    color: "#06b6d4",
    colorBg: "rgba(6,182,212,0.07)",
    colorBorder: "rgba(6,182,212,0.25)",
    colorBadge: "rgba(6,182,212,0.12)",
    topic: "Wave Optics — Young's Double Slit",
    question:
      "In Young's double slit experiment, the fringe width is $\\beta$. If the distance between the slits is **doubled** and the distance to the screen is **halved**, the new fringe width is:",
    options: [
      { key: "A", text: "$4\\beta$" },
      { key: "B", text: "$2\\beta$" },
      { key: "C", text: "$\\dfrac{\\beta}{2}$" },
      { key: "D", text: "$\\dfrac{\\beta}{4}$" },
    ],
    correct: "D",
    solution:
      "Fringe width in YDSE:\n$$\\beta = \\frac{\\lambda D}{d}$$\n\nwhere $D$ = distance to screen, $d$ = slit separation, $\\lambda$ = wavelength.\n\nNew values: $d' = 2d$, $D' = D/2$\n\n$$\\beta' = \\frac{\\lambda D'}{d'} = \\frac{\\lambda (D/2)}{2d} = \\frac{\\lambda D}{4d} = \\frac{\\beta}{4}$$\n\n$$\\boxed{\\beta' = \\frac{\\beta}{4}}$$",
    // Full subject data sent to /api/generate-pdf
    pdfSubject: {
      name: "Physics",
      color: "cyan",
      icon: "⚛",
      questions: [
        {
          id: "P1",
          topic: "Electrostatics",
          text: "Two point charges $+q$ and $-q$ are placed at a distance $d$ apart. The electric potential at the midpoint of the line joining them is:",
          options: [
            { key: "A", text: "$\\dfrac{2kq}{d}$" },
            { key: "B", text: "$\\dfrac{kq}{d}$" },
            { key: "C", text: "$0$" },
            { key: "D", text: "$-\\dfrac{2kq}{d}$" },
          ],
          correct: "C",
          marks: 4,
          solution:
            "The electric potential at a point is the algebraic sum of potentials due to all charges.\n\nLet the midpoint be at distance $\\dfrac{d}{2}$ from each charge.\n\n$$V_{+q} = \\frac{kq}{d/2} = \\frac{2kq}{d}$$\n\n$$V_{-q} = \\frac{k(-q)}{d/2} = -\\frac{2kq}{d}$$\n\n$$V_{\\text{total}} = V_{+q} + V_{-q} = \\frac{2kq}{d} - \\frac{2kq}{d} = \\boxed{0}$$\n\nNote: Electric field at midpoint is **not** zero — only the potential is.",
        },
        {
          id: "P2",
          topic: "Current Electricity",
          text: "A wire of resistance $R$ is stretched to double its length. Its new resistance will be:",
          options: [
            { key: "A", text: "$\\dfrac{R}{2}$" },
            { key: "B", text: "$R$" },
            { key: "C", text: "$2R$" },
            { key: "D", text: "$4R$" },
          ],
          correct: "D",
          marks: 4,
          solution:
            "Resistance is given by $R = \\rho \\dfrac{L}{A}$.\n\nWhen a wire is stretched, volume remains constant:\n$$V = A \\cdot L = \\text{const}$$\n\nIf length becomes $L' = 2L$, then:\n$$A' = \\frac{V}{L'} = \\frac{AL}{2L} = \\frac{A}{2}$$\n\nNew resistance:\n$$R' = \\rho \\frac{L'}{A'} = \\rho \\frac{2L}{A/2} = \\rho \\frac{4L}{A} = \\boxed{4R}$$",
        },
        {
          id: "P3",
          topic: "Magnetic Effects of Current",
          text: "A circular loop of radius $r$ carries current $I$. The magnetic field at its centre is $B$. If the radius is doubled and current is halved, the new magnetic field at the centre will be:",
          options: [
            { key: "A", text: "$4B$" },
            { key: "B", text: "$2B$" },
            { key: "C", text: "$\\dfrac{B}{4}$" },
            { key: "D", text: "$\\dfrac{B}{2}$" },
          ],
          correct: "C",
          marks: 4,
          solution:
            "Magnetic field at the centre of a circular loop:\n$$B = \\frac{\\mu_0 I}{2r}$$\n\nSo $B \\propto \\dfrac{I}{r}$.\n\nNew conditions: $I' = \\dfrac{I}{2}$, $r' = 2r$\n\n$$B' = \\frac{\\mu_0 I'}{2r'} = \\frac{\\mu_0 (I/2)}{2(2r)} = \\frac{\\mu_0 I}{8r} = \\frac{B}{4}$$\n\n$$\\boxed{B' = \\frac{B}{4}}$$",
        },
        {
          id: "P4",
          topic: "Optics — Wave Nature",
          text: "In Young's double slit experiment, the fringe width is $\\beta$. If the distance between the slits is doubled and the distance to the screen is halved, the new fringe width is:",
          options: [
            { key: "A", text: "$4\\beta$" },
            { key: "B", text: "$2\\beta$" },
            { key: "C", text: "$\\dfrac{\\beta}{2}$" },
            { key: "D", text: "$\\dfrac{\\beta}{4}$" },
          ],
          correct: "D",
          marks: 4,
          solution:
            "Fringe width in YDSE:\n$$\\beta = \\frac{\\lambda D}{d}$$\n\nwhere $D$ = distance to screen, $d$ = slit separation, $\\lambda$ = wavelength.\n\nNew values: $d' = 2d$, $D' = D/2$\n\n$$\\beta' = \\frac{\\lambda D'}{d'} = \\frac{\\lambda (D/2)}{2d} = \\frac{\\lambda D}{4d} = \\frac{\\beta}{4}$$\n\n$$\\boxed{\\beta' = \\frac{\\beta}{4}}$$",
        },
        {
          id: "P5",
          topic: "Modern Physics",
          text: "The de Broglie wavelength of an electron accelerated through a potential difference $V$ (in volts) is approximately:",
          options: [
            { key: "A", text: "$\\dfrac{1.227}{\\sqrt{V}}$ nm" },
            { key: "B", text: "$\\dfrac{12.27}{\\sqrt{V}}$ Å" },
            { key: "C", text: "$\\dfrac{0.1227}{\\sqrt{V}}$ nm" },
            { key: "D", text: "Both A and B are correct" },
          ],
          correct: "D",
          marks: 4,
          solution:
            "The de Broglie wavelength of an electron accelerated through $V$ volts:\n\n$$\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2meV}}$$\n\nSubstituting values ($h = 6.626 \\times 10^{-34}$ J·s, $m = 9.1 \\times 10^{-31}$ kg, $e = 1.6 \\times 10^{-19}$ C):\n\n$$\\lambda = \\frac{1.227}{\\sqrt{V}} \\text{ nm} = \\frac{12.27}{\\sqrt{V}} \\text{ Å}$$\n\nNote: $1 \\text{ nm} = 10 \\text{ Å}$, so both expressions are equivalent. **Both A and B are correct.**",
        },
      ],
    },
  },
  {
    subject: "Chemistry",
    subjectColor: "purple",
    icon: "🧪",
    color: "#a855f7",
    colorBg: "rgba(168,85,247,0.07)",
    colorBorder: "rgba(168,85,247,0.25)",
    colorBadge: "rgba(168,85,247,0.12)",
    topic: "Electrochemistry — Gibbs Free Energy",
    question:
      "The standard electrode potential $E^\\circ$ for a cell reaction is related to the standard Gibbs free energy $\\Delta G^\\circ$ by:",
    options: [
      { key: "A", text: "$\\Delta G^\\circ = nFE^\\circ$" },
      { key: "B", text: "$\\Delta G^\\circ = -nFE^\\circ$" },
      { key: "C", text: "$\\Delta G^\\circ = \\dfrac{nFE^\\circ}{RT}$" },
      { key: "D", text: "$\\Delta G^\\circ = -\\dfrac{RT}{nF}\\ln K$" },
    ],
    correct: "B",
    solution:
      "The fundamental relationship between standard Gibbs free energy and EMF:\n\n$$\\Delta G^\\circ = -nFE^\\circ$$\n\nwhere $n$ = number of electrons transferred, $F$ = Faraday's constant ($96485$ C mol$^{-1}$), and $E^\\circ$ = standard EMF of the cell.\n\nFor a **spontaneous** reaction, $\\Delta G^\\circ < 0$, which requires $E^\\circ > 0$.\n\n$$\\boxed{\\Delta G^\\circ = -nFE^\\circ}$$",
    pdfSubject: {
      name: "Chemistry",
      color: "purple",
      icon: "🧪",
      questions: [
        {
          id: "C1",
          topic: "Electrochemistry",
          text: "The standard electrode potential $E^\\circ$ for the cell reaction is related to the standard Gibbs free energy by:",
          options: [
            { key: "A", text: "$\\Delta G^\\circ = nFE^\\circ$" },
            { key: "B", text: "$\\Delta G^\\circ = -nFE^\\circ$" },
            { key: "C", text: "$\\Delta G^\\circ = \\dfrac{nFE^\\circ}{RT}$" },
            { key: "D", text: "$\\Delta G^\\circ = -\\dfrac{RT}{nF}\\ln K$" },
          ],
          correct: "B",
          marks: 4,
          solution:
            "The relationship between standard Gibbs free energy and EMF:\n\n$$\\Delta G^\\circ = -nFE^\\circ$$\n\nwhere:\n- $n$ = number of electrons transferred\n- $F$ = Faraday's constant ($96485$ C mol$^{-1}$)\n- $E^\\circ$ = standard EMF of the cell\n\nFor a **spontaneous** reaction, $\\Delta G^\\circ < 0$, which means $E^\\circ > 0$.",
        },
        {
          id: "C2",
          topic: "Chemical Kinetics",
          text: "For a first-order reaction, if the initial concentration is $[A]_0$ and rate constant is $k$, the time for 75% completion is:",
          options: [
            { key: "A", text: "$\\dfrac{\\ln 2}{k}$" },
            { key: "B", text: "$\\dfrac{2\\ln 2}{k}$" },
            { key: "C", text: "$\\dfrac{\\ln 4}{k}$" },
            { key: "D", text: "$\\dfrac{3\\ln 2}{k}$" },
          ],
          correct: "B",
          marks: 4,
          solution:
            "For a first-order reaction:\n$$t = \\frac{1}{k} \\ln\\frac{[A]_0}{[A]_t}$$\n\nAt 75% completion:\n$$[A]_t = 0.25[A]_0$$\n\n$$t_{75\\%} = \\frac{1}{k} \\ln\\frac{[A]_0}{0.25[A]_0} = \\frac{\\ln 4}{k} = \\frac{2\\ln 2}{k}$$\n\n$$\\boxed{t_{75\\%} = \\frac{2\\ln 2}{k} = 2 \\times t_{1/2}}$$",
        },
        {
          id: "C3",
          topic: "p-Block Elements",
          text: "Which of the following is the correct order of bond angles in $\\text{NH}_3$, $\\text{H}_2\\text{O}$, and $\\text{CH}_4$?",
          options: [
            { key: "A", text: "$\\text{CH}_4 > \\text{NH}_3 > \\text{H}_2\\text{O}$" },
            { key: "B", text: "$\\text{H}_2\\text{O} > \\text{NH}_3 > \\text{CH}_4$" },
            { key: "C", text: "$\\text{NH}_3 > \\text{CH}_4 > \\text{H}_2\\text{O}$" },
            { key: "D", text: "$\\text{CH}_4 > \\text{H}_2\\text{O} > \\text{NH}_3$" },
          ],
          correct: "A",
          marks: 4,
          solution:
            "All three molecules have $sp^3$ hybridised central atoms, but lone pairs compress bond angles:\n\n| Molecule | Bonding pairs | Lone pairs | Bond angle |\n|----------|--------------|------------|------------|\n| $\\text{CH}_4$ | 4 | 0 | $109.5°$ |\n| $\\text{NH}_3$ | 3 | 1 | $107°$ |\n| $\\text{H}_2\\text{O}$ | 2 | 2 | $104.5°$ |\n\nLone pair–lone pair repulsion > lone pair–bond pair repulsion > bond pair–bond pair repulsion.\n\n$$\\boxed{\\text{CH}_4\\,(109.5°) > \\text{NH}_3\\,(107°) > \\text{H}_2\\text{O}\\,(104.5°)}$$",
        },
        {
          id: "C4",
          topic: "Biomolecules",
          text: "Which of the following statements about DNA double helix is **incorrect**?",
          options: [
            { key: "A", text: "Adenine pairs with Thymine via 2 hydrogen bonds" },
            { key: "B", text: "Guanine pairs with Cytosine via 3 hydrogen bonds" },
            { key: "C", text: "The two strands are antiparallel" },
            { key: "D", text: "The sugar-phosphate backbone is on the inside of the helix" },
          ],
          correct: "D",
          marks: 4,
          solution:
            "In Watson-Crick model of DNA double helix:\n\n- **A–T**: 2 hydrogen bonds (correct)\n- **G–C**: 3 hydrogen bonds (correct)\n- **Antiparallel strands**: One strand runs 5'→3', the other 3'→5' (correct)\n- **Sugar-phosphate backbone**: It is on the **OUTSIDE** of the helix (INCORRECT)\n\nThe bases face inward and pair via hydrogen bonds. The hydrophilic backbone faces outward.\n\n**Answer: D is the incorrect statement.**",
        },
        {
          id: "C5",
          topic: "Solutions",
          text: "The van't Hoff factor $i$ for $\\text{K}_2\\text{SO}_4$ in dilute aqueous solution is:",
          options: [
            { key: "A", text: "$1$" },
            { key: "B", text: "$2$" },
            { key: "C", text: "$3$" },
            { key: "D", text: "$4$" },
          ],
          correct: "C",
          marks: 4,
          solution:
            "$\\text{K}_2\\text{SO}_4$ is a strong electrolyte that completely dissociates:\n\n$$\\text{K}_2\\text{SO}_4 \\to 2\\text{K}^+ + \\text{SO}_4^{2-}$$\n\nNumber of particles per formula unit = $2 + 1 = 3$\n\n$$i = \\frac{\\text{observed colligative property}}{\\text{theoretical (non-dissociated)}} = \\frac{3}{1} = \\boxed{3}$$",
        },
      ],
    },
  },
  {
    subject: "Mathematics",
    subjectColor: "blue",
    icon: "∫",
    color: "#3b82f6",
    colorBg: "rgba(59,130,246,0.07)",
    colorBorder: "rgba(59,130,246,0.25)",
    colorBadge: "rgba(59,130,246,0.12)",
    topic: "Definite Integration — King's Rule",
    question:
      "Evaluate the definite integral:\n\n$$I = \\int_0^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x}\\, dx$$",
    options: [
      { key: "A", text: "$0$" },
      { key: "B", text: "$\\dfrac{\\pi}{4}$" },
      { key: "C", text: "$\\dfrac{\\pi}{2}$" },
      { key: "D", text: "$1$" },
    ],
    correct: "B",
    solution:
      "**Method: King's Rule** — use $\\displaystyle\\int_0^a f(x)\\,dx = \\int_0^a f(a-x)\\,dx$.\n\nLet:\n$$I = \\int_0^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x}\\, dx \\quad \\cdots (1)$$\n\nApply $x \\to \\dfrac{\\pi}{2} - x$:\n$$I = \\int_0^{\\pi/2} \\frac{\\cos^3 x}{\\cos^3 x + \\sin^3 x}\\, dx \\quad \\cdots (2)$$\n\nAdding $(1)$ and $(2)$:\n$$2I = \\int_0^{\\pi/2} \\frac{\\sin^3 x + \\cos^3 x}{\\sin^3 x + \\cos^3 x}\\, dx = \\int_0^{\\pi/2} 1\\, dx = \\frac{\\pi}{2}$$\n\n$$\\boxed{I = \\frac{\\pi}{4}}$$\n\n**Key insight:** King's Rule exploits symmetry — the numerator and denominator swap under $x \\to \\frac{\\pi}{2}-x$, making the integrand sum to 1.",
    pdfSubject: {
      name: "Mathematics",
      color: "blue",
      icon: "∫",
      questions: [
        {
          id: "M1",
          topic: "Definite Integration",
          text: "Evaluate the definite integral:\n\n$$I = \\int_0^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x}\\, dx$$",
          options: [
            { key: "A", text: "$0$" },
            { key: "B", text: "$\\dfrac{\\pi}{4}$" },
            { key: "C", text: "$\\dfrac{\\pi}{2}$" },
            { key: "D", text: "$1$" },
          ],
          correct: "B",
          marks: 4,
          solution:
            "**Method: King's Rule** — use $\\displaystyle\\int_0^a f(x)\\,dx = \\int_0^a f(a-x)\\,dx$.\n\nLet:\n$$I = \\int_0^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x}\\, dx \\quad \\cdots (1)$$\n\nApply $x \\to \\dfrac{\\pi}{2} - x$:\n$$I = \\int_0^{\\pi/2} \\frac{\\cos^3 x}{\\cos^3 x + \\sin^3 x}\\, dx \\quad \\cdots (2)$$\n\nAdding $(1)$ and $(2)$:\n$$2I = \\int_0^{\\pi/2} \\frac{\\sin^3 x + \\cos^3 x}{\\sin^3 x + \\cos^3 x}\\, dx = \\int_0^{\\pi/2} 1\\, dx = \\frac{\\pi}{2}$$\n\n$$\\boxed{I = \\frac{\\pi}{4}}$$\n\n**Key insight:** King's Rule exploits symmetry — the numerator and denominator swap under $x \\to \\frac{\\pi}{2}-x$, making the integrand sum to 1.",
        },
        {
          id: "M2",
          topic: "Matrices & Determinants",
          text: "If $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$, find $\\det(A^2 - 5A)$.",
          options: [
            { key: "A", text: "$0$" },
            { key: "B", text: "$-2$" },
            { key: "C", text: "$2$" },
            { key: "D", text: "$4$" },
          ],
          correct: "D",
          marks: 4,
          solution:
            "By the **Cayley-Hamilton theorem**, $A$ satisfies its own characteristic polynomial.\n\n$$\\det(A - \\lambda I) = 0 \\implies \\lambda^2 - 5\\lambda - 2 = 0$$\n\nSo $A^2 - 5A = 2I$.\n\n**Verification:** $A^2 = \\begin{pmatrix}7&10\\\\15&22\\end{pmatrix}$, $5A = \\begin{pmatrix}5&10\\\\15&20\\end{pmatrix}$\n\n$$A^2 - 5A = \\begin{pmatrix}2&0\\\\0&2\\end{pmatrix} = 2I$$\n\n$$\\det(2I) = 2^2 = \\boxed{4}$$",
        },
        {
          id: "M3",
          topic: "Complex Numbers — De Moivre",
          text: "If $z = \\cos\\theta + i\\sin\\theta$, then $\\dfrac{z^n - z^{-n}}{2i}$ equals:",
          options: [
            { key: "A", text: "$\\cos n\\theta$" },
            { key: "B", text: "$\\sin n\\theta$" },
            { key: "C", text: "$i\\sin n\\theta$" },
            { key: "D", text: "$2i\\sin n\\theta$" },
          ],
          correct: "B",
          marks: 4,
          solution:
            "By **De Moivre's theorem**: $z^n = \\cos n\\theta + i\\sin n\\theta$ and $z^{-n} = \\cos n\\theta - i\\sin n\\theta$.\n\n$$z^n - z^{-n} = 2i\\sin n\\theta$$\n\n$$\\frac{z^n - z^{-n}}{2i} = \\frac{2i\\sin n\\theta}{2i} = \\boxed{\\sin n\\theta}$$\n\n**Analogously:** $\\dfrac{z^n + z^{-n}}{2} = \\cos n\\theta$.",
        },
        {
          id: "M4",
          topic: "Limits — Maclaurin Series",
          text: "Evaluate: $\\displaystyle\\lim_{x \\to 0} \\frac{e^x - 1 - x - \\dfrac{x^2}{2}}{x^3}$",
          options: [
            { key: "A", text: "$0$" },
            { key: "B", text: "$\\dfrac{1}{2}$" },
            { key: "C", text: "$\\dfrac{1}{6}$" },
            { key: "D", text: "$\\infty$" },
          ],
          correct: "C",
          marks: 4,
          solution:
            "Use the **Maclaurin series** for $e^x$:\n\n$$e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots$$\n\nNumerator:\n$$e^x - 1 - x - \\frac{x^2}{2} = \\frac{x^3}{6} + O(x^4)$$\n\n$$\\frac{e^x - 1 - x - \\frac{x^2}{2}}{x^3} \\to \\frac{1}{6} + O(x) \\xrightarrow{x\\to 0} \\boxed{\\frac{1}{6}}$$",
        },
        {
          id: "M5",
          topic: "Probability — Conditional",
          text: "A bag contains 4 red and 6 blue balls. Two balls are drawn without replacement. Given that the first ball is red, the probability the second ball is also red is:",
          options: [
            { key: "A", text: "$\\dfrac{4}{10}$" },
            { key: "B", text: "$\\dfrac{3}{9}$" },
            { key: "C", text: "$\\dfrac{1}{3}$" },
            { key: "D", text: "Both B and C are correct" },
          ],
          correct: "D",
          marks: 4,
          solution:
            "After removing 1 red ball: 3 red remain out of 9 total.\n\n$$P(\\text{2nd red} \\mid \\text{1st red}) = \\frac{3}{9} = \\frac{1}{3}$$\n\nBoth $\\dfrac{3}{9}$ and $\\dfrac{1}{3}$ are the same value, so **D** is correct.\n\n**Formal check:**\n$$P(\\text{both red}) = \\frac{4}{10} \\times \\frac{3}{9} = \\frac{12}{90} = \\frac{2}{15}$$\n$$P(B \\mid A) = \\frac{2/15}{4/10} = \\boxed{\\frac{1}{3}}$$",
        },
      ],
    },
  },
  {
    subject: "Biology",
    subjectColor: "green",
    icon: "🧬",
    color: "#22c55e",
    colorBg: "rgba(34,197,94,0.07)",
    colorBorder: "rgba(34,197,94,0.25)",
    colorBadge: "rgba(34,197,94,0.12)",
    topic: "Molecular Biology — DNA Replication",
    question:
      "The enzyme that **joins Okazaki fragments** during DNA replication is:",
    options: [
      { key: "A", text: "DNA Polymerase I" },
      { key: "B", text: "DNA Polymerase III" },
      { key: "C", text: "DNA Ligase" },
      { key: "D", text: "Primase" },
    ],
    correct: "C",
    solution:
      "The lagging strand is synthesised discontinuously as **Okazaki fragments**, each starting with an RNA primer.\n\n- **Primase** — synthesises RNA primers to initiate each fragment\n- **DNA Pol III** — main replicating enzyme; extends Okazaki fragments from the primer\n- **DNA Pol I** — removes RNA primers and fills the gaps with DNA\n- **DNA Ligase** — covalently **joins** the Okazaki fragments via phosphodiester bonds\n\n$$\\boxed{\\text{DNA Ligase}}$$",
    pdfSubject: {
      name: "Biology",
      color: "green",
      icon: "🧬",
      questions: [
        {
          id: "B1",
          topic: "Reproduction in Organisms",
          text: "Which of the following is an example of vegetative propagation that is **not** naturally occurring but is induced artificially?",
          options: [
            { key: "A", text: "Rhizome formation in ginger" },
            { key: "B", text: "Runner formation in strawberry" },
            { key: "C", text: "Tissue culture of orchids" },
            { key: "D", text: "Bulbil formation in Agave" },
          ],
          correct: "C",
          marks: 4,
          solution:
            "**Natural vegetative propagation:** Rhizome (ginger), Runner (strawberry), Bulbil (Agave).\n\n**Artificial:** Tissue culture — explants cultured on nutrient media under sterile conditions, based on **totipotency**.\n\n**Answer: C — Tissue culture**",
        },
        {
          id: "B2",
          topic: "Genetics — Mendelian",
          text: "In a dihybrid cross between RRYY and rryy, what fraction of the F₂ generation will show both recessive phenotypes (wrinkled, yellow)?",
          options: [
            { key: "A", text: "$\\dfrac{1}{16}$" },
            { key: "B", text: "$\\dfrac{3}{16}$" },
            { key: "C", text: "$\\dfrac{9}{16}$" },
            { key: "D", text: "$\\dfrac{1}{4}$" },
          ],
          correct: "A",
          marks: 4,
          solution:
            "F₂ follows the **9:3:3:1** ratio.\n\n| Phenotype | Genotypes | Fraction |\n|-----------|-----------|----------|\n| Round, Green | RRYY, RRYy, RrYY, RrYy | $9/16$ |\n| Round, Yellow | RRyy, Rryy | $3/16$ |\n| Wrinkled, Green | rrYY, rrYy | $3/16$ |\n| Wrinkled, Yellow | rryy | $1/16$ |\n\n$$P(rr) \\times P(yy) = \\frac{1}{4} \\times \\frac{1}{4} = \\boxed{\\dfrac{1}{16}}$$",
        },
        {
          id: "B3",
          topic: "Molecular Biology",
          text: "The enzyme that joins Okazaki fragments during DNA replication is:",
          options: [
            { key: "A", text: "DNA Polymerase I" },
            { key: "B", text: "DNA Polymerase III" },
            { key: "C", text: "DNA Ligase" },
            { key: "D", text: "Primase" },
          ],
          correct: "C",
          marks: 4,
          solution:
            "**Roles in replication:**\n- **Primase**: Synthesises RNA primers\n- **DNA Pol III**: Main replicating enzyme, synthesises Okazaki fragments\n- **DNA Pol I**: Removes RNA primers, fills gaps\n- **DNA Ligase**: Joins Okazaki fragments via phosphodiester bonds\n\n**Answer: C — DNA Ligase**",
        },
        {
          id: "B4",
          topic: "Human Physiology — Digestion",
          text: "Which enzyme converts caseinogen (milk protein) to casein in the stomach of infants?",
          options: [
            { key: "A", text: "Pepsin" },
            { key: "B", text: "Rennin (Chymosin)" },
            { key: "C", text: "Trypsin" },
            { key: "D", text: "Lipase" },
          ],
          correct: "B",
          marks: 4,
          solution:
            "**Rennin (Chymosin)** specifically converts caseinogen → casein (coagulates milk protein). Present in infants, absent in adults. Secreted as pro-rennin, activated by HCl.\n\n**Answer: B — Rennin**",
        },
        {
          id: "B5",
          topic: "Ecology",
          text: "Which of the following correctly describes the relationship in lichens (symbiotic association between algae and fungi)?",
          options: [
            { key: "A", text: "Mutualism — both partners benefit" },
            { key: "B", text: "Commensalism — algae benefit, fungi unaffected" },
            { key: "C", text: "Parasitism — fungi benefit at algae's expense" },
            { key: "D", text: "Amensalism — algae are harmed, fungi unaffected" },
          ],
          correct: "A",
          marks: 4,
          solution:
            "**Lichens** are a classic example of **mutualism**:\n\n| Partner | Contribution | Benefit |\n|---------|-------------|--------|\n| **Algae** (phycobiont) | Photosynthesis, food | Protection, minerals |\n| **Fungi** (mycobiont) | Structural support, water | Food from algae |\n\nBoth organisms benefit — the definition of **mutualism**.\n\n**Answer: A — Mutualism**",
        },
      ],
    },
  },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type ShowcaseQuestion = (typeof SHOWCASE_QUESTIONS)[number];

// ─── Per-button download state ────────────────────────────────────────────────

type DownloadState = "idle" | "loading" | "error";

// ─── PDF generation — same logic as teacher-review.tsx ───────────────────────

async function generateAndDownloadPDF(
  subject: ShowcaseQuestion["pdfSubject"],
  onStateChange: (s: DownloadState) => void
) {
  onStateChange("loading");
  try {
    const dpp = {
      ...DPP_META,
      title: `SolveFlow Sample — ${subject.name}`,
      subtitle: `${subject.name} · Sample DPP with Solutions`,
      subjects: [subject],
    };

    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dpp }),
    });

    if (!response.ok) {
      const err = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      throw new Error(err.error ?? `PDF generation failed (${response.status})`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solveflow_sample_${subject.name.toLowerCase()}_dpp.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    onStateChange("idle");
  } catch {
    onStateChange("error");
    // Reset error state after 3 s
    setTimeout(() => onStateChange("idle"), 3000);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function OptionBadge({
  optKey,
  isCorrect,
  revealed,
  color,
}: {
  optKey: string;
  isCorrect: boolean;
  revealed: boolean;
  color: string;
}) {
  const base =
    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-all";
  if (revealed && isCorrect) {
    return (
      <span
        className={base}
        style={{
          background: color + "30",
          color,
          border: `1.5px solid ${color}`,
        }}
      >
        {optKey}
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-white/5 text-white/40`}
      style={{ border: "1.5px solid rgba(255,255,255,0.1)" }}
    >
      {optKey}
    </span>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v9M4 7l4 4 4-4" />
      <path d="M2 13h12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-spin"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ─── Single question card ────────────────────────────────────────────────────

function QuestionCard({ q }: { q: ShowcaseQuestion }) {
  const [revealed, setRevealed] = useState(false);
  const [dlState, setDlState] = useState<DownloadState>("idle");

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        border: `1px solid ${q.colorBorder}`,
        background: q.colorBg,
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: q.colorBorder }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{q.icon}</span>
          <span className="text-sm font-bold" style={{ color: q.color }}>
            {q.subject}
          </span>
        </div>
        <span
          className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ background: q.colorBadge, color: q.color }}
        >
          {q.topic}
        </span>
      </div>

      {/* ── Body: question left, solution right on md+ ── */}
      <div className="flex flex-col md:flex-row md:divide-x divide-white/[0.06]">

        {/* Left — question + options */}
        <div className="px-5 pt-4 pb-4 md:w-1/2 flex flex-col gap-3">
          <div className="text-sm text-white/85 leading-relaxed">
            <MathMarkdown content={q.question} />
          </div>

          <div className="space-y-2">
            {q.options.map((opt) => {
              const isCorrect = opt.key === q.correct;
              return (
                <div
                  key={opt.key}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                  style={{
                    background:
                      revealed && isCorrect
                        ? q.color + "15"
                        : "rgba(255,255,255,0.03)",
                    border:
                      revealed && isCorrect
                        ? `1px solid ${q.color}40`
                        : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <OptionBadge
                    optKey={opt.key}
                    isCorrect={isCorrect}
                    revealed={revealed}
                    color={q.color}
                  />
                  <div className="text-sm text-white/75">
                    <MathMarkdown content={opt.text} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show solution button — only visible when not yet revealed */}
          {!revealed && (
            <button
              onClick={() => setRevealed(true)}
              className="w-full py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all hover:opacity-80 mt-auto"
              style={{
                background: q.colorBadge,
                color: q.color,
                border: `1px solid ${q.colorBorder}`,
              }}
            >
              Show Solution
            </button>
          )}
        </div>

        {/* Right — solution panel */}
        <div className="px-5 pt-4 pb-4 md:w-1/2 flex flex-col">
          {revealed ? (
            <div className="flex-1">
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ color: q.color }}
              >
                Solution
              </p>
              <div className="text-sm text-white/75 leading-relaxed">
                <MathMarkdown content={q.solution} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-white/20 text-center">
                Click &ldquo;Show Solution&rdquo; to reveal
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── PDF download footer ── */}
      <div
        className="px-5 py-3 border-t flex items-center justify-between gap-3"
        style={{ borderColor: q.colorBorder }}
      >
        <span className="text-xs text-white/35 leading-tight">
          Full DPP with all 5 questions + solutions
        </span>
        <button
          onClick={() => generateAndDownloadPDF(q.pdfSubject, setDlState)}
          disabled={dlState === "loading"}
          className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition-all hover:opacity-80 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            color: dlState === "error" ? "#f87171" : q.color,
            background:
              dlState === "error" ? "rgba(248,113,113,0.12)" : q.colorBadge,
            border: `1px solid ${dlState === "error" ? "rgba(248,113,113,0.3)" : q.colorBorder}`,
          }}
        >
          {dlState === "loading" ? (
            <>
              <SpinnerIcon />
              Generating…
            </>
          ) : dlState === "error" ? (
            <>
              <span>✕</span>
              Failed — retry
            </>
          ) : (
            <>
              <DownloadIcon />
              Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Section export ──────────────────────────────────────────────────────────

export function RenderingShowcase() {
  return (
    <section className="py-14 md:py-20 px-5 max-w-4xl mx-auto">
      <FadeIn>
        <Badge
          variant="outline"
          className="font-mono text-xs tracking-widest uppercase mb-5"
        >
          Rendering Quality
        </Badge>
      </FadeIn>
      <FadeIn delay={0.1}>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          LaTeX, rendered right.{" "}
          <span className="text-muted-foreground/40">Every subject.</span>
        </h2>
      </FadeIn>
      <FadeIn delay={0.15}>
        <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-xl">
          One sample question from each of Physics, Chemistry, Mathematics and
          Biology — with full step-by-step solutions. Click{" "}
          <strong className="text-foreground/80">Show Solution</strong> to see
          the rendered output, or{" "}
          <strong className="text-foreground/80">Download PDF</strong> to get
          the full 5-question DPP with solutions — generated live by our
          Typst engine.
        </p>
      </FadeIn>

      <div className="flex flex-col gap-5">
        {SHOWCASE_QUESTIONS.map((q, i) => (
          <FadeIn key={q.subject} delay={i * 0.07}>
            <QuestionCard q={q} />
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.35}>
        <p className="text-xs text-muted-foreground/40 text-center mt-6">
          PDFs are generated on-demand using the same Typst engine that powers
          every teacher export — the web render and the PDF are identical.
        </p>
      </FadeIn>
    </section>
  );
}
