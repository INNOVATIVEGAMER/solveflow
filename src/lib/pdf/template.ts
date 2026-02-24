// ─── Typst DPP Template Builder ───────────────────────────────────────────────
// Converts a DPP JSON object into a Typst (.typ) source string.
// The Typst binary then compiles this to a real PDF.

interface Option { key: string; text: string; }
interface Question {
  id: string; topic: string; text: string;
  options: Option[]; correct: string; marks: number; solution: string;
}
interface Subject { name: string; color: string; icon: string; questions: Question[]; }
interface DppData {
  title: string; subtitle: string; target: string;
  class: string; date: string; instructions: string; subjects: Subject[];
}

// ── Colour palette per subject colour name ────────────────────────────────────

const COLOR_MAP: Record<string, { accent: string; light: string; dark: string }> = {
  cyan:   { accent: "0277BD", light: "E3F2FD", dark: "01579B" },
  purple: { accent: "7B1FA2", light: "F3E5F5", dark: "4A148C" },
  green:  { accent: "2E7D32", light: "E8F5E9", dark: "1B5E20" },
  blue:   { accent: "1565C0", light: "E3F2FD", dark: "0D47A1" },
  orange: { accent: "E65100", light: "FFF3E0", dark: "BF360C" },
  red:    { accent: "C62828", light: "FFEBEE", dark: "B71C1C" },
};

function getColors(color: string) {
  return COLOR_MAP[color] ?? COLOR_MAP.cyan;
}

// ── Escape special Typst characters in plain text ─────────────────────────────
// Typst uses # $ @ < > \ as special. In content mode, $ and # are the main ones.
// We only escape text that is NOT already math (i.e., not inside $...$).

function escapeTypst(text: string): string {
  // Replace backslash first (before other replacements create new backslashes)
  return text
    .replace(/\\/g, "\\\\")   // \ → \\  (but we handle math separately)
    .replace(/@/g, "\\@")
    .replace(/</g, "\\<")
    .replace(/>/g, "\\>")
    .replace(/\[/g, "\\[")    // [ → \[  (Typst content delimiter)
    .replace(/\]/g, "\\]");   // ] → \]  (Typst content delimiter)
}

// ── Convert LaTeX environments to Typst equivalents ──────────────────────────
// Must run BEFORE individual command replacements since \begin{...}...\end{...}
// patterns would otherwise be mangled by the catch-all regex cleanup.

function convertLatexEnvironments(latex: string): string {
  // ── Matrix environments → Typst mat() ──
  // pmatrix=(), bmatrix=[], Bmatrix={}, vmatrix=|x|, Vmatrix=||x||, matrix=none
  const matrixEnvs: [string, string][] = [
    ['pmatrix', ''],                    // parens (Typst default)
    ['bmatrix', 'delim: "[", '],        // square brackets
    ['Bmatrix', 'delim: "{", '],        // curly braces
    ['vmatrix', 'delim: "|", '],        // single vertical bars
    ['Vmatrix', 'delim: "||", '],       // double vertical bars
    ['matrix', 'delim: #none, '],       // no delimiters
    ['smallmatrix', 'delim: #none, '],  // no delimiters (small)
  ];

  for (const [env, delimArg] of matrixEnvs) {
    const re = new RegExp(
      `\\\\begin\\{${env}\\}([\\s\\S]*?)\\\\end\\{${env}\\}`,
      'g'
    );
    latex = latex.replace(re, (_: string, body: string) => {
      const rows = body
        .split(/\\\\/)
        .map((r: string) => r.trim())
        .filter((r: string) => r.length > 0)
        .map((r: string) =>
          r.split('&').map((c: string) => c.trim()).join(', ')
        );
      return `mat(${delimArg}${rows.join('; ')})`;
    });
  }

  // ── array environment → Typst mat() (strip column spec like {cc}) ──
  latex = latex.replace(
    /\\begin\{array\}\{[^}]*\}([\s\S]*?)\\end\{array\}/g,
    (_: string, body: string) => {
      const rows = body
        .split(/\\\\/)
        .map((r: string) => r.trim())
        .filter((r: string) => r.length > 0)
        .map((r: string) =>
          r.split('&').map((c: string) => c.trim()).join(', ')
        );
      return `mat(delim: #none, ${rows.join('; ')})`;
    }
  );

  // ── cases → Typst cases() ──
  latex = latex.replace(
    /\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g,
    (_: string, body: string) => {
      const entries = body
        .split(/\\\\/)
        .map((r: string) => r.trim())
        .filter((r: string) => r.length > 0)
        .map((r: string) => r.replace(/&/g, ' ').trim());
      return `cases(${entries.join(', ')})`;
    }
  );

  // ── aligned / align / align* / gathered / gather → join with Typst line breaks ──
  latex = latex.replace(
    /\\begin\{(aligned?|align\*|gather(?:ed)?)\}([\s\S]*?)\\end\{\1\}/g,
    (_: string, _env: string, body: string) => {
      return body
        .split(/\\\\/)
        .map((line: string) => line.replace(/&/g, ' ').trim())
        .filter((line: string) => line.length > 0)
        .join(' \\ ');
    }
  );

  // ── equation / equation* → just the inner content ──
  latex = latex.replace(
    /\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g,
    '$1'
  );

  return latex;
}

// ── Convert markdown+LaTeX math text to Typst markup ─────────────────────────
// The DPP JSON uses:
//   - $...$ for inline math (LaTeX)
//   - $$...$$ for display math (LaTeX)
//   - **bold** for bold
//   - \n for newlines / paragraphs
// Typst uses $...$ for inline math and $ ... $ (with spaces or newline) for display.
// LaTeX math commands need translating to Typst math syntax.

// Regex fragment: content inside braces allowing one level of nesting
const NB = '(?:[^{}]|\\{[^{}]*\\})*';

function latexMathToTypst(latex: string): string {
  // ── Phase 1: Convert \begin{...}...\end{...} environments ──
  latex = convertLatexEnvironments(latex);

  // ── Phase 2: Iteratively convert \frac / \binom (handles nesting) ──
  const fracRe = new RegExp(`\\\\d?frac\\{(${NB})\\}\\{(${NB})\\}`, 'g');
  const binomRe = new RegExp(`\\\\d?binom\\{(${NB})\\}\\{(${NB})\\}`, 'g');
  let prev: string;
  do {
    prev = latex;
    latex = latex
      .replace(fracRe, "frac($1, $2)")
      .replace(binomRe, "binom($1, $2)");
  } while (latex !== prev);

  // ── Phase 3: All other command-level replacements ──
  return latex
    // Text in math
    .replace(/\\text\{([^{}]*)\}/g, "\"$1\"")
    .replace(/\\textbf\{([^{}]*)\}/g, "bold(\"$1\")")
    // Greek letters
    .replace(/\\alpha/g, "alpha").replace(/\\beta/g, "beta")
    .replace(/\\gamma/g, "gamma").replace(/\\delta/g, "delta")
    .replace(/\\epsilon/g, "epsilon").replace(/\\varepsilon/g, "epsilon.alt")
    .replace(/\\zeta/g, "zeta").replace(/\\eta/g, "eta")
    .replace(/\\theta/g, "theta").replace(/\\vartheta/g, "theta.alt")
    .replace(/\\iota/g, "iota").replace(/\\kappa/g, "kappa")
    .replace(/\\lambda/g, "lambda").replace(/\\mu/g, "mu")
    .replace(/\\nu/g, "nu").replace(/\\xi/g, "xi")
    .replace(/\\pi/g, "pi").replace(/\\varpi/g, "pi.alt")
    .replace(/\\rho/g, "rho").replace(/\\sigma/g, "sigma")
    .replace(/\\tau/g, "tau").replace(/\\upsilon/g, "upsilon")
    .replace(/\\phi/g, "phi").replace(/\\varphi/g, "phi.alt")
    .replace(/\\chi/g, "chi").replace(/\\psi/g, "psi")
    .replace(/\\omega/g, "omega")
    // Capital Greek
    .replace(/\\Gamma/g, "Gamma").replace(/\\Delta/g, "Delta")
    .replace(/\\Theta/g, "Theta").replace(/\\Lambda/g, "Lambda")
    .replace(/\\Xi/g, "Xi").replace(/\\Pi/g, "Pi")
    .replace(/\\Sigma/g, "Sigma").replace(/\\Upsilon/g, "Upsilon")
    .replace(/\\Phi/g, "Phi").replace(/\\Psi/g, "Psi")
    .replace(/\\Omega/g, "Omega")
    // Operators & symbols
    .replace(/\\times/g, "times").replace(/\\cdot/g, "dot.op")
    .replace(/\\pm/g, "plus.minus").replace(/\\mp/g, "minus.plus")
    .replace(/\\leq/g, "<=").replace(/\\geq/g, ">=")
    .replace(/\\le(?![a-zA-Z])/g, "<=").replace(/\\ge(?![a-zA-Z])/g, ">=")
    .replace(/\\neq/g, "!=").replace(/\\ne(?![a-zA-Z])/g, "!=")
    .replace(/\\approx/g, "approx")
    .replace(/\\equiv/g, "equiv")
    .replace(/\\sim(?![a-zA-Z])/g, "tilde.op")
    .replace(/\\cong/g, "tilde.equiv")
    .replace(/\\ll/g, "lt.double").replace(/\\gg/g, "gt.double")
    .replace(/\\infty/g, "infinity")
    .replace(/\\propto/g, "prop")
    .replace(/\\therefore/g, "therefore")
    .replace(/\\because/g, "because")
    .replace(/\\forall/g, "forall")
    .replace(/\\exists/g, "exists")
    .replace(/\\in(?![a-zA-Z])/g, "in")
    .replace(/\\notin/g, "in.not")
    .replace(/\\subset/g, "subset").replace(/\\supset/g, "supset")
    .replace(/\\subseteq/g, "subset.eq").replace(/\\supseteq/g, "supset.eq")
    .replace(/\\cup/g, "union")
    .replace(/\\cap/g, "sect")
    .replace(/\\emptyset/g, "nothing")
    .replace(/\\oplus/g, "plus.circle").replace(/\\otimes/g, "times.circle")
    .replace(/\\perp/g, "perp")
    .replace(/\\parallel/g, "parallel")
    .replace(/\\angle/g, "angle")
    .replace(/\\triangle/g, "triangle.t")
    // Dots
    .replace(/\\ldots/g, "dots").replace(/\\cdots/g, "dots.c")
    .replace(/\\vdots/g, "dots.v").replace(/\\ddots/g, "dots.down")
    // Trig & log functions — Typst math has these natively without backslash
    .replace(/\\det/g, "det")
    .replace(/\\sin/g, "sin").replace(/\\cos/g, "cos").replace(/\\tan/g, "tan")
    .replace(/\\cot/g, "cot").replace(/\\sec/g, "sec").replace(/\\csc/g, "csc")
    .replace(/\\arcsin/g, "arcsin").replace(/\\arccos/g, "arccos").replace(/\\arctan/g, "arctan")
    .replace(/\\ln/g, "ln").replace(/\\log/g, "log").replace(/\\exp/g, "exp")
    .replace(/\\max/g, "max").replace(/\\min/g, "min")
    .replace(/\\lim/g, "lim").replace(/\\sup(?![a-zA-Z])/g, "sup").replace(/\\inf(?![a-zA-Z])/g, "inf")
    .replace(/\\gcd/g, "gcd").replace(/\\dim/g, "dim")
    .replace(/\\ker/g, "ker").replace(/\\hom/g, "hom").replace(/\\deg/g, "deg")
    .replace(new RegExp(`\\\\sqrt\\[([^\\]]*)\\]\\{(${NB})\\}`, 'g'), "root($1, $2)")
    .replace(new RegExp(`\\\\sqrt\\{(${NB})\\}`, 'g'), "sqrt($1)")
    .replace(/\\sum/g, "sum").replace(/\\prod/g, "product")
    .replace(/\\int(?![a-zA-Z])/g, "integral").replace(/\\oint/g, "integral.cont")
    .replace(/\\iint/g, "integral.double").replace(/\\iiint/g, "integral.triple")
    .replace(/\\partial/g, "diff").replace(/\\nabla/g, "nabla")
    .replace(new RegExp(`\\\\vec\\{(${NB})\\}`, 'g'), "arrow($1)")
    .replace(new RegExp(`\\\\hat\\{(${NB})\\}`, 'g'), "hat($1)")
    .replace(new RegExp(`\\\\bar\\{(${NB})\\}`, 'g'), "overline($1)")
    .replace(new RegExp(`\\\\tilde\\{(${NB})\\}`, 'g'), "tilde($1)")
    .replace(new RegExp(`\\\\dot\\{(${NB})\\}`, 'g'), "dot($1)")
    .replace(new RegExp(`\\\\ddot\\{(${NB})\\}`, 'g'), "dot.double($1)")
    .replace(new RegExp(`\\\\underline\\{(${NB})\\}`, 'g'), "underline($1)")
    .replace(new RegExp(`\\\\overline\\{(${NB})\\}`, 'g'), "overline($1)")
    // Font styles in math
    .replace(/\\mathbb\{([^{}]*)\}/g, "bb($1)")
    .replace(/\\mathcal\{([^{}]*)\}/g, "cal($1)")
    .replace(/\\mathrm\{([^{}]*)\}/g, "upright($1)")
    .replace(/\\mathbf\{([^{}]*)\}/g, "bold($1)")
    .replace(/\\operatorname\{([^{}]*)\}/g, "\"$1\"")
    // Arrows
    .replace(/\\iff/g, "<==>")
    .replace(/\\implies/g, "==>").replace(/\\impliedby/g, "<==")
    .replace(/\\rightarrow/g, "->").replace(/\\leftarrow/g, "<-")
    .replace(/\\leftrightarrow/g, "<->")
    .replace(/\\Rightarrow/g, "=>").replace(/\\Leftarrow/g, "<=")
    .replace(/\\longrightarrow/g, "-->")
    .replace(/\\rightleftharpoons/g, "harpoons.rltb")
    .replace(/\\to(?![a-zA-Z])/g, "->")
    .replace(/\\mapsto/g, "|->")
    // Spacing
    .replace(/\\quad/g, "quad").replace(/\\qquad/g, "wide")
    .replace(/\\,/g, "thin").replace(/\\;/g, "med")
    .replace(/\\ /g, "space")
    // Boxes — Typst doesn't have boxed() in math; use a styled block
    .replace(new RegExp(`\\\\boxed\\{(${NB})\\}`, 'g'), "underline(overline($1))")
    // Superscript / subscript — Typst math accepts ^{...} and _{...} natively
    // No conversion needed; leave as-is
    // Chemical/bio specific — \circ used for degrees/standard state
    .replace(/\\circ/g, "degree")
    .replace(/\\degree/g, "degree")
    // Left/right delimiter sizing — strip the command, keep the delimiter
    .replace(/\\left\s*/g, "").replace(/\\right\s*/g, "")
    // Literal braces: \{ and \} → Typst math braces
    .replace(/\\\{/g, "{").replace(/\\\}/g, "}")
    // Remove remaining unknown LaTeX commands gracefully
    .replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "");
}

// ── Add spaces between consecutive letters in Typst math ─────────────────────
// Typst treats "kq" as a 2-char identifier; "k q" as k times q.
// We insert spaces between letters that aren't part of known function names.
// This runs AFTER latexMathToTypst on the whole inline/display math string.
function spacifyMathIdents(math: string): string {
  // Known multi-char Typst math identifiers to leave alone
  const knownIdents = new Set([
    "frac","sqrt","root","sum","product","integral","integral.cont",
    "integral.double","integral.triple",
    "times","approx","infinity","alpha","beta","gamma","delta","epsilon",
    "epsilon.alt","zeta","eta","theta","theta.alt","iota","kappa","lambda",
    "mu","nu","xi","pi","pi.alt","rho","sigma","tau","upsilon","phi",
    "phi.alt","chi","psi","omega","Gamma","Delta","Theta","Lambda","Xi",
    "Pi","Sigma","Upsilon","Phi","Psi","Omega","dot.op","plus.minus",
    "minus.plus","prop","therefore","because","forall","exists","in",
    "in.not","subset","supset","subset.eq","supset.eq","union","sect",
    "nothing","plus.circle","times.circle",
    "perp","parallel","angle","triangle.t",
    "dots","dots.c","dots.v","dots.down",
    "sin","cos","tan","cot","sec","csc",
    "arcsin","arccos","arctan","ln","log","exp","max","min",
    "lim","sup","inf","det","gcd","dim","ker","hom","deg",
    "harpoons.rltb","diff","nabla","bold","arrow","hat",
    "overline","underline","tilde","tilde.op","tilde.equiv",
    "dot","dot.double","degree","boxed","wide","quad",
    "thin","med","space","zws","attach","quad","wide","forall",
    "equiv","lt.double","gt.double",
    // Typst mat/cases/binom + named args from environment conversion
    "mat","delim","cases","binom","bb","cal","upright","lr","none",
  ]);

  // Tokenize: split on word boundaries, operators, numbers, parens
  // Add a space between two consecutive [a-zA-Z] chars that aren't in a known ident
  // Strategy: find runs of letters not preceded by \ and not part of a known word
  // We process char by char looking for bare letter sequences
  let result = "";
  let i = 0;
  while (i < math.length) {
    const ch = math[i];
    // Skip quoted strings (Typst text in math: "hello") — don't space these
    if (ch === '"') {
      let quoted = '"';
      let j = i + 1;
      while (j < math.length && math[j] !== '"') {
        quoted += math[j];
        j++;
      }
      quoted += '"';
      result += quoted;
      i = j + 1;
      continue;
    }
    // Collect a run of letters (and dots, for things like "dot.op", "in.not")
    if (/[a-zA-Z]/.test(ch)) {
      let word = ch;
      let j = i + 1;
      while (j < math.length && /[a-zA-Z.]/.test(math[j])) {
        word += math[j];
        j++;
      }
      // Is it a known identifier?
      if (knownIdents.has(word)) {
        result += word;
      } else if (word.length === 1) {
        // Single letter — fine as-is
        result += word;
      } else {
        // Multi-char unknown — insert spaces between each letter
        // But don't space numeric suffixes or known suffixes
        result += word.split("").join(" ");
      }
      i = j;
    } else {
      result += ch;
      i++;
    }
  }
  return result;
}

// ── Convert a mixed text+math string to Typst content ────────────────────────
// Splits on $...$ and $$...$$ boundaries, converts math segments.

function toTypstContent(text: string): string {
  const parts: string[] = [];
  // Split on $$...$$ first (display math), then $...$ (inline math)
  const segments = text.split(/(\\?\$\$[\s\S]*?\\?\$\$|\$[^$\n]+?\$)/g);

  for (const seg of segments) {
    if (seg.startsWith("$$") && seg.endsWith("$$")) {
      // Display math block
      const inner = spacifyMathIdents(latexMathToTypst(seg.slice(2, -2).trim()));
      parts.push(`$ ${inner} $`);
    } else if (seg.startsWith("$") && seg.endsWith("$") && seg.length > 2) {
      // Inline math
      let inner = spacifyMathIdents(latexMathToTypst(seg.slice(1, -1)));
      // If math starts with ^ or _ (no base), prefix with a zero-width placeholder
      if (/^[\^_]/.test(inner)) inner = `zws${inner}`;
      parts.push(`$${inner}$`);
    } else {
      // Plain text — handle markdown bold, newlines
      let plain = seg
        .replace(/\*\*([^*]+)\*\*/g, "*$1*")   // **bold** → *bold* (typst bold)
        .replace(/\*([^*]+)\*/g, "_$1_");        // *italic* → _italic_
      // Escape Typst specials in plain segments
      plain = plain
        .replace(/#/g, "\\#")
        .replace(/@/g, "\\@")
        .replace(/\[/g, "\\[")   // [ → \[  (Typst content delimiter)
        .replace(/\]/g, "\\]");  // ] → \]  (Typst content delimiter)
      parts.push(plain);
    }
  }

  return parts.join("");
}

// ── Subject header color block ────────────────────────────────────────────────

function subjectSection(subj: Subject, colors: { accent: string; light: string; dark: string }): string {
  const total = subj.questions.length;
  const marks = subj.questions.reduce((s, q) => s + q.marks, 0);

  return `
// ── ${subj.name} ─────────────────────────────────────────────────────────────
#pagebreak(weak: true)
#block(
  width: 100%,
  fill: rgb("#${colors.light}"),
  stroke: (left: 4pt + rgb("#${colors.accent}")),
  inset: (left: 12pt, top: 10pt, bottom: 10pt, right: 12pt),
  radius: (right: 4pt),
)[
  #grid(columns: (1fr, auto), gutter: 0pt)[
    #text(weight: "bold", size: 14pt, fill: rgb("#${colors.dark}"))[${subj.icon}  ${subj.name}]
    #linebreak()
    #text(size: 9pt, fill: rgb("#${colors.accent}"))[${total} questions · ${marks} marks total]
  ][
    #align(right)[
      #text(size: 9pt, fill: rgb("#${colors.accent}"), weight: "bold")[${subj.name.toUpperCase()}]
    ]
  ]
]
#v(8pt)
`;
}

// ── Single question card ──────────────────────────────────────────────────────

function questionCard(q: Question, index: number, colors: { accent: string; light: string; dark: string }): string {
  const questionContent = toTypstContent(q.text);
  const solutionContent = toTypstContent(q.solution);

  // MCQ options
  const optionsBlock = q.options.length > 0 ? `
  #v(6pt)
  #grid(columns: (1fr, 1fr), gutter: 6pt)[
    ${q.options.slice(0, 2).map(opt => optionBox(opt, q.correct, colors)).join("\n    ")}
  ][
    ${q.options.slice(2, 4).map(opt => optionBox(opt, q.correct, colors)).join("\n    ")}
  ]` : "";

  return `
// Q${index + 1}
#block(
  width: 100%,
  stroke: (
    left: 2pt + rgb("#${colors.accent}"),
    top: 0.5pt + rgb("#${colors.accent}").lighten(60%),
    right: 0.5pt + rgb("#${colors.accent}").lighten(60%),
    bottom: 0.5pt + rgb("#${colors.accent}").lighten(60%),
  ),
  inset: 0pt,
  radius: 4pt,
  clip: true,
)[
  // Question header bar
  #block(
    width: 100%,
    fill: rgb("#${colors.accent}"),
    inset: (x: 10pt, y: 6pt),
  )[
    #grid(columns: (auto, 1fr, auto), gutter: 6pt, align: horizon)[
      #text(weight: "bold", size: 9pt, fill: white)[Q${index + 1}]
    ][
      #text(size: 8pt, fill: white.lighten(20%))[${escapeTypst(q.topic)}]
    ][
      #text(size: 8pt, fill: white.lighten(20%))[${q.marks} marks]
    ]
  ]
  // Question body
  #block(
    width: 100%,
    fill: rgb("#${colors.light}").lighten(40%),
    inset: (x: 10pt, y: 8pt),
  )[
    #text(size: 10pt)[${questionContent}]
    ${optionsBlock}
  ]
  // Solution area
  #block(
    width: 100%,
    fill: rgb("#E8F5E9"),
    stroke: (top: 0.5pt + rgb("#2E7D32").lighten(50%)),
    inset: (x: 10pt, y: 8pt),
  )[
    #grid(columns: (auto, 1fr), gutter: 8pt, align: top)[
      #block(
        fill: rgb("#2E7D32"),
        inset: (x: 6pt, y: 3pt),
        radius: 3pt,
      )[
        #text(size: 8pt, weight: "bold", fill: white)[SOLUTION]
      ]
    ][
      #text(size: 9pt, fill: rgb("#1B5E20"))[${solutionContent}]
    ]
  ]
]
#v(10pt)
`;
}

// ── Option box ────────────────────────────────────────────────────────────────

function optionBox(opt: { key: string; text: string }, correct: string, colors: { accent: string; light: string; dark: string }): string {
  const isCorrect = opt.key === correct;
  const fill = isCorrect ? "E8F5E9" : "FAFAFA";
  const stroke = isCorrect ? `rgb("#2E7D32")` : `rgb("#BDBDBD")`;
  const keyColor = isCorrect ? "2E7D32" : colors.accent;
  const content = toTypstContent(opt.text);

  return `#block(
      fill: rgb("#${fill}"),
      stroke: 0.5pt + ${stroke},
      inset: (x: 8pt, y: 5pt),
      radius: 3pt,
      width: 100%,
    )[
      #grid(columns: (auto, 1fr), gutter: 6pt, align: top)[
        #text(weight: "bold", size: 9pt, fill: rgb("#${keyColor}"))[(${opt.key})]
      ][
        #text(size: 9pt)[${content}]
      ]
    ]`;
}

// ── Cover page ────────────────────────────────────────────────────────────────

function coverPage(dpp: DppData): string {
  const totalQ = dpp.subjects.reduce((s, subj) => s + subj.questions.length, 0);
  const totalMarks = dpp.subjects.reduce((s, subj) => s + subj.questions.reduce((ms, q) => ms + q.marks, 0), 0);

  // Subject summary rows
  const subjectRows = dpp.subjects.map(subj => {
    const c = getColors(subj.color);
    const subjMarks = subj.questions.reduce((s, q) => s + q.marks, 0);
    return `  table.cell(fill: rgb("#${c.light}"))[#text(fill: rgb("#${c.dark}"), weight: "bold")[${subj.icon} ${subj.name}]],
  [${subj.questions.length}],
  [${subjMarks}],`;
  }).join("\n");

  return `
// ── Cover Page ────────────────────────────────────────────────────────────────
#set page(margin: (x: 2.5cm, y: 2.5cm))

#align(center)[
  #v(1cm)
  #block(
    fill: rgb("#0277BD"),
    inset: (x: 24pt, y: 16pt),
    radius: 8pt,
    width: 80%,
  )[
    #text(size: 11pt, weight: "bold", fill: white.lighten(40%), tracking: 3pt)[SOLVEFLOW]
    #linebreak()
    #text(size: 9pt, fill: white.lighten(60%))[AI-Powered Solutions]
  ]
  #v(1.5cm)
  #text(size: 22pt, weight: "black")[${escapeTypst(dpp.title)}]
  #linebreak()
  #v(4pt)
  #text(size: 14pt, fill: rgb("#616161"))[${escapeTypst(dpp.subtitle)}]
  #v(1cm)

  // Meta info grid
  #grid(columns: (1fr, 1fr, 1fr), gutter: 12pt)[
    #block(fill: rgb("#F5F5F5"), stroke: 0.5pt + rgb("#E0E0E0"), inset: (x: 12pt, y: 10pt), radius: 6pt, width: 100%)[
      #text(size: 8pt, fill: rgb("#9E9E9E"), weight: "bold")[TARGET]
      #linebreak()
      #v(2pt)
      #text(size: 11pt, weight: "bold")[${escapeTypst(dpp.target)}]
    ]
  ][
    #block(fill: rgb("#F5F5F5"), stroke: 0.5pt + rgb("#E0E0E0"), inset: (x: 12pt, y: 10pt), radius: 6pt, width: 100%)[
      #text(size: 8pt, fill: rgb("#9E9E9E"), weight: "bold")[CLASS]
      #linebreak()
      #v(2pt)
      #text(size: 11pt, weight: "bold")[Class ${escapeTypst(dpp.class)}]
    ]
  ][
    #block(fill: rgb("#F5F5F5"), stroke: 0.5pt + rgb("#E0E0E0"), inset: (x: 12pt, y: 10pt), radius: 6pt, width: 100%)[
      #text(size: 8pt, fill: rgb("#9E9E9E"), weight: "bold")[DATE]
      #linebreak()
      #v(2pt)
      #text(size: 11pt, weight: "bold")[${escapeTypst(dpp.date)}]
    ]
  ]
  #v(1cm)

  // Subject table
  #table(
    columns: (1fr, auto, auto),
    stroke: 0.5pt + rgb("#E0E0E0"),
    inset: (x: 12pt, y: 8pt),
    fill: (_, row) => if row == 0 { rgb("#F5F5F5") } else { white },
    table.header(
      [*Subject*], [*Questions*], [*Marks*]
    ),
${subjectRows}
    table.hline(stroke: 1pt + rgb("#0277BD")),
    [*Total*], [*${totalQ}*], [*${totalMarks}*],
  )
  #v(1cm)

  // Instructions box
  #block(
    fill: rgb("#FFF8E1"),
    stroke: (left: 3pt + rgb("#F9A825")),
    inset: (x: 14pt, y: 10pt),
    radius: (right: 4pt),
    width: 100%,
  )[
    #align(left)[
      #text(weight: "bold", size: 9pt, fill: rgb("#F57F17"))[INSTRUCTIONS]
      #linebreak()
      #v(4pt)
      #text(size: 9pt, fill: rgb("#5D4037"))[${escapeTypst(dpp.instructions)}]
    ]
  ]
]
#pagebreak()
`;
}

// ── Main template builder ─────────────────────────────────────────────────────

export function buildTypstDocument(dpp: DppData): string {
  const parts: string[] = [];

  // Document-level settings
  parts.push(`
#set document(title: "${escapeTypst(dpp.title)}", author: "SolveFlow")
#set page(
  paper: "a4",
  margin: (x: 1.8cm, y: 2.2cm),
  header: context [
    #set text(size: 8pt, fill: rgb("#9E9E9E"))
    #grid(columns: (1fr, auto))[
      ${escapeTypst(dpp.title)} · ${escapeTypst(dpp.target)}
    ][
      SolveFlow · Page #counter(page).display("1 of 1", both: true)
    ]
    #line(length: 100%, stroke: 0.5pt + rgb("#E0E0E0"))
  ],
  footer: context [
    #line(length: 100%, stroke: 0.5pt + rgb("#E0E0E0"))
    #set text(size: 7pt, fill: rgb("#BDBDBD"))
    #grid(columns: (1fr, auto))[
      Generated by SolveFlow AI · All solutions verified by teacher
    ][
      ${escapeTypst(dpp.date)}
    ]
  ],
)
#set text(size: 10pt, lang: "en")
#set par(justify: true, leading: 0.65em)
#show heading: it => [
  #v(4pt)
  #it
  #v(2pt)
]
`);

  // Cover page
  parts.push(coverPage(dpp));

  // Subject sections + questions
  for (const subj of dpp.subjects) {
    const colors = getColors(subj.color);
    parts.push(subjectSection(subj, colors));
    subj.questions.forEach((q, i) => {
      parts.push(questionCard(q, i, colors));
    });
  }

  return parts.join("\n");
}
