# DPP LaTeX Generation Prompt

Use this prompt with any capable AI model (Claude, GPT-4o, Gemini) to generate
a complete, ready-to-compile `.tex` file for a Daily Practice Paper.

**Workflow:**
1. Fill in your answers to the questions below
2. Paste the completed prompt into the AI chat
3. Save the `.tex` output to `public/latex/<filename>.tex`
4. Run `./scripts/generate-pdf.sh <filename>.tex`
5. PDF lands in `public/demo/pdfs/<filename>.pdf`

---

## Step 1 — Answer these questions first

Copy this block, fill in your answers, then paste it with the prompt below:

```
SUBJECTS:          [e.g. Physics / Chemistry, Biology / Physics, Chemistry, Mathematics]
QUESTIONS_PER_SUBJECT: [e.g. 10 — same for all, or "Physics:10, Chemistry:5, Biology:5"]
EXAM_TARGET:       [e.g. JEE Advanced 2026 / NEET 2026 / JEE Mains 2026]
CLASS:             [e.g. 11 / 12]
DPP_NUMBER:        [e.g. 1]
OUTPUT_FILENAME:   [e.g. physics_chemistry_dpp2  — no .tex extension]

TOPICS_PER_SUBJECT:
  Physics:     [e.g. Kinematics, Laws of Motion, Work-Energy Theorem]
  Chemistry:   [e.g. Chemical Bonding, Thermodynamics, Equilibrium]
  Mathematics: [e.g. Limits, Derivatives, Indefinite Integrals]
  Biology:     [e.g. Cell Biology, Respiration, Photosynthesis]

DIFFICULTY:    [Easy / Medium / Hard / Mixed]
MARKS_CORRECT: [default 4]
MARKS_WRONG:   [default -1]
TIME_MINUTES:  [default: questions_total × 3]
INCLUDE_SOLUTIONS: [Yes / No]
INCLUDE_DIAGRAMS:  [Yes — include TikZ diagrams where relevant / No]
ACCENT_COLOUR:
  Physics:     [HTML hex, e.g. #0277BD for blue / #00838F for cyan]
  Chemistry:   [e.g. #6A1B9A for purple]
  Mathematics: [e.g. #1565C0 for dark blue]
  Biology:     [e.g. #2E7D32 for green]
  (single subject papers: pick any accent colour)
```

---

## Step 2 — The Prompt (paste after your answers above)

---

You are an expert LaTeX typesetter specialising in Indian competitive exam (JEE/NEET)
question papers for Class 11/12 students.

Using the configuration I provided above, generate a **complete, self-contained `.tex` file**
for a Daily Practice Paper (DPP). Follow every rule below exactly.

---

### Packages — use exactly these, no others

```latex
\usepackage[a4paper, margin=2cm, top=2.5cm, bottom=2.5cm]{geometry}
\usepackage{xcolor}
\usepackage[most,breakable]{tcolorbox}
\usepackage{tikz}
\usepackage{amsmath,amssymb}
\usepackage{booktabs}
\usepackage{colortbl}
\usepackage{fancyhdr}
\usepackage{enumitem}
\usepackage{array}
\usepackage{multicol}
\usepackage{lastpage}
\tcbuselibrary{skins,breakable,theorems}
\usetikzlibrary{shapes.geometric,arrows.meta,positioning,calc,decorations.pathreplacing}
```

---

### Colour definitions

Define one `accentcolor` per subject using the hex values I provided.
For multi-subject papers, use the first subject's colour as the document accent,
and define named colours for each additional subject (e.g. `\definecolor{chemaccent}{HTML}{...}`).

Always define all of these regardless of subject count:

```latex
\definecolor{accentcolor}{HTML}{......}   % primary subject accent
\definecolor{questionbg}{HTML}{E8F4FD}    % very light tint of accentcolor
\definecolor{questionborder}{HTML}{......} % same as accentcolor
\definecolor{answerbg}{HTML}{E8F5E9}
\definecolor{answerborder}{HTML}{2E7D32}
\definecolor{notebg}{HTML}{FFF3E0}
\definecolor{noteborder}{HTML}{E65100}
\definecolor{coverdark}{HTML}{......}     % darker shade of accentcolor
\definecolor{rowA}{HTML}{F5F5F5}
\definecolor{rowB}{HTML}{FFFFFF}
\definecolor{darktext}{HTML}{212121}
\definecolor{mutedtext}{HTML}{757575}
```

---

### Three tcolorbox environments — define exactly these

**Question box** (coloured header with Q number, topic, marks, CO/BL):
```latex
\newtcolorbox{questionbox}[4]{
  enhanced, breakable,
  colback=questionbg, colframe=questionborder,
  boxrule=1pt, arc=4pt,
  title={\textbf{Q#1}\quad\textbar\quad\textit{#2}%
         \hfill Marks:\ \textbf{#3}\quad\textbar\quad CO/BL:\ #4},
  fonttitle=\small\bfseries\color{white},
  colbacktitle=accentcolor,
  attach boxed title to top left={yshift=-2mm,xshift=4mm},
  boxed title style={arc=3pt,colframe=accentcolor},
  top=6mm
}
```

**Answer box** (green, full solution):
```latex
\newtcolorbox{answerbox}[1]{
  enhanced, breakable,
  colback=answerbg, colframe=answerborder,
  boxrule=0.8pt, arc=4pt,
  title={\textbf{Solution}\enspace---\enspace Correct Answer:\ \textbf{(#1)}},
  fonttitle=\small\bfseries\color{white},
  colbacktitle=answerborder,
  attach boxed title to top left={yshift=-2mm,xshift=4mm},
  boxed title style={arc=3pt},
  top=6mm
}
```

**Note/Key-point box** (orange):
```latex
\newtcolorbox{notebox}{
  enhanced,
  colback=notebg, colframe=noteborder,
  boxrule=0.8pt, arc=4pt,
  title={\textbf{Key Point}},
  fonttitle=\small\bfseries\color{white},
  colbacktitle=noteborder,
  attach boxed title to top left={yshift=-2mm,xshift=4mm},
  boxed title style={arc=3pt},
  top=6mm
}
```

---

### Header and footer (fancyhdr, every page except cover)

- **Left header**: Subject(s) + DPP number
- **Centre header**: Exam target · Class
- **Right header**: SolveFlow
- **Left footer**: Topics covered (small, mutedtext colour)
- **Centre footer**: `Page \thepage\ of \pageref{LastPage}`
- **Right footer**: `Marks: +4 / $-$1`
- `\renewcommand{\headrulewidth}{0.6pt}` and `\renewcommand{\footrulewidth}{0.4pt}`

---

### Cover page (mandatory)

**Layout (in order):**

1. Full-width TikZ banner — two horizontal fills:
   - `coverdark` colour from top down to `yshift=-4.2cm`
   - `accentcolor` from there to `yshift=-4.7cm` (accent stripe)
   Use `remember picture, overlay` TikZ option.

2. Subject name in white, 28pt bold, 1cm left indent.
   DPP number + exam target + class on the next line, 14pt.
   "SolveFlow · Demo Paper" in 11pt below that.

3. **Summary table** (booktabs + colortbl, alternating rowA/rowB):

   | Field | Value |
   |---|---|
   | Subject(s) | ... |
   | Total Questions | N |
   | Total Marks | N×4 |
   | Negative Marking | −1 per wrong |
   | Time Suggested | T minutes |
   | Syllabus | Class X — topics |

4. **CO & Bloom's Level Mapping table** — one row per question:

   | Q No. | Topic | CO | Bloom's Level |
   |---|---|---|---|
   Header row background: `accentcolor`, white text.
   Assign CO numbers (CO1–CO5) and Bloom's levels (L1 Remember through L6 Create)
   based on the cognitive demand of each question.

5. **Instructions tcolorbox** (accentcolor border, accentlight background):
   - 4 marks correct, −1 wrong, 0 unattempted
   - No calculator
   - Any subject-specific note (e.g. NCERT-based for Biology)

6. End cover page with `\newpage`.

---

### Per-question layout (repeat for every question)

```latex
\begin{questionbox}{<n>}{<topic>}{4}{CO<n> / L<n>}
  <question text — inline math with $...$>

  \begin{enumerate}[label=(\Alph*), itemsep=4pt, topsep=6pt]
    \item <option A>
    \item <option B>
    \item <option C>
    \item <option D>
  \end{enumerate}
\end{questionbox}

\begin{answerbox}{<correct letter>}
  <explanation prose>
  \begin{align}
    <working steps — one per line>
  \end{align}
  \textbf{Final Answer:}\ $\boxed{<answer>}$
\end{answerbox}

\begin{notebox}
  <one concise key formula or insight — 1–3 lines>
\end{notebox}

\vspace{4pt}
```

---

### TikZ diagram rules

- Include at least **2 TikZ diagrams** across the paper, placed inside
  `\begin{center}...\end{center}` within the relevant `questionbox` or `answerbox`.
- Diagrams appropriate to subject:
  - Physics: circuit diagrams, ray diagrams, force/free-body diagrams, field lines
  - Chemistry: electrochemical cell, reaction mechanism flowchart, molecular geometry
  - Mathematics: coordinate geometry graphs, Venn diagrams, geometric figures
  - Biology: cell/organelle schematic, life cycle flowchart, ecological pyramid
- **Never use arithmetic expressions inside TikZ coordinates** (e.g. `(\i+1)*0.7`).
  Pre-compute all coordinate values as plain numbers.
- Colours: use defined colours (`accentcolor`, `answerborder`, etc.) — no raw colour names.

---

### Mathematics formatting rules

| Case | Syntax |
|---|---|
| Inline math | `$...$` |
| Display equations | `\begin{align}...\end{align}` |
| Boxed final answer | `$\boxed{...}$` |
| Display fractions | `\dfrac{}{}` |
| Inline fractions | `\tfrac{}{}` |
| Units | `10\,\text{m/s}` |
| Vectors | `\vec{F}`, `\hat{n}` |
| Chemical arrows | `\longrightarrow`, `\rightleftharpoons` (no mhchem) |

---

### Multi-subject papers

If the paper has more than one subject, group all questions by subject.
Before each subject's group, add a subject divider:

```latex
\vspace{8pt}
\begin{tcolorbox}[colback=<subjectaccent>!15,colframe=<subjectaccent>,
  arc=3pt,boxrule=0.8pt]
  \centering\bfseries\color{<subjectaccent>} <Subject Name>
  \quad\textbar\quad \textit{Questions <from>–<to>}
\end{tcolorbox}
\vspace{4pt}
```

---

### Output rules

1. Output the **complete `.tex` file only** — no prose, no markdown fences.
2. Must compile cleanly with `pdflatex` (two passes).
3. Use only the packages listed above.
4. Place `\label{LastPage}` as the very last line before `\end{document}`.
5. Do not force page breaks between a question and its solution.
6. Question IDs: prefix with subject initial + number (P1–P10, C1–C5, M1–M10, B1–B10, etc.).

---

## Step 3 — After you get the .tex output

```bash
# Save the output to:
public/latex/<output_filename>.tex

# Then compile:
./scripts/generate-pdf.sh <output_filename>.tex

# PDF will appear at:
public/demo/pdfs/<output_filename>.pdf
```
