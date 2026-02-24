#!/usr/bin/env bash
# =============================================================================
#  generate-pdf.sh
#
#  Compiles a LaTeX DPP source file and places the resulting PDF in
#  public/demo/pdfs/.
#
#  Usage:
#    ./scripts/generate-pdf.sh <file>
#
#  <file> can be:
#    - A bare filename:       physics_dpp.tex        → looks in public/latex/
#    - A relative/full path:  path/to/custom.tex     → used as-is
#
#  Examples:
#    ./scripts/generate-pdf.sh physics_dpp.tex
#    ./scripts/generate-pdf.sh public/latex/math_dpp.tex
#    ./scripts/generate-pdf.sh ~/Downloads/my_custom_dpp.tex
# =============================================================================

set -euo pipefail

# ── pdflatex PATH ─────────────────────────────────────────────────────────────
export PATH="/usr/local/texlive/2025basic/bin/universal-darwin:$PATH"

# ── Validate pdflatex ─────────────────────────────────────────────────────────
if ! command -v pdflatex &>/dev/null; then
  echo "ERROR: pdflatex not found."
  echo "       Install BasicTeX:  brew install --cask basictex"
  echo "       Then re-run:       eval \"\$(/usr/libexec/path_helper)\""
  exit 1
fi

# ── Argument check ────────────────────────────────────────────────────────────
if [[ $# -ne 1 ]]; then
  echo "Usage: ./scripts/generate-pdf.sh <file>"
  echo ""
  echo "  <file>  Bare filename (looked up in public/latex/) or any path to a .tex file."
  echo ""
  echo "Examples:"
  echo "  ./scripts/generate-pdf.sh physics_dpp.tex"
  echo "  ./scripts/generate-pdf.sh public/latex/math_dpp.tex"
  exit 1
fi

ARG="$1"

# ── Resolve the .tex file path ────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LATEX_DIR="$REPO_ROOT/public/latex"
PDF_OUT_DIR="$REPO_ROOT/public/demo/pdfs"

# If the argument has no directory component, look it up in public/latex/
if [[ "$ARG" != */* && "$ARG" != /* ]]; then
  TEX_FILE="$LATEX_DIR/$ARG"
else
  # Accept relative or absolute path
  if [[ "$ARG" = /* ]]; then
    TEX_FILE="$ARG"
  else
    TEX_FILE="$REPO_ROOT/$ARG"
  fi
fi

# Append .tex if the user omitted it
if [[ "$TEX_FILE" != *.tex ]]; then
  TEX_FILE="${TEX_FILE}.tex"
fi

if [[ ! -f "$TEX_FILE" ]]; then
  echo "ERROR: File not found: $TEX_FILE"
  exit 1
fi

# ── Derived names ─────────────────────────────────────────────────────────────
TEX_BASENAME="$(basename "$TEX_FILE" .tex)"
BUILD_DIR="$LATEX_DIR/build"
PDF_NAME="${TEX_BASENAME}.pdf"

mkdir -p "$BUILD_DIR"
mkdir -p "$PDF_OUT_DIR"

# ── Compile (two passes for correct page refs) ────────────────────────────────
echo ""
echo "  Source  : $TEX_FILE"
echo "  Output  : $PDF_OUT_DIR/$PDF_NAME"
echo ""
echo "  Compiling (pass 1)..."

if ! pdflatex \
      -interaction=nonstopmode \
      -halt-on-error \
      -output-directory="$BUILD_DIR" \
      "$TEX_FILE" > "$BUILD_DIR/${TEX_BASENAME}.out" 2>&1; then
  echo "  [FAIL] Pass 1 failed. Log:"
  echo "         $BUILD_DIR/${TEX_BASENAME}.log"
  echo ""
  grep "^!" "$BUILD_DIR/${TEX_BASENAME}.log" | head -5
  exit 1
fi

echo "  Compiling (pass 2 — resolving page refs)..."

if ! pdflatex \
      -interaction=nonstopmode \
      -halt-on-error \
      -output-directory="$BUILD_DIR" \
      "$TEX_FILE" >> "$BUILD_DIR/${TEX_BASENAME}.out" 2>&1; then
  echo "  [FAIL] Pass 2 failed. Log:"
  echo "         $BUILD_DIR/${TEX_BASENAME}.log"
  echo ""
  grep "^!" "$BUILD_DIR/${TEX_BASENAME}.log" | head -5
  exit 1
fi

# ── Copy PDF to output dir ────────────────────────────────────────────────────
cp "$BUILD_DIR/${PDF_NAME}" "$PDF_OUT_DIR/${PDF_NAME}"

SIZE=$(du -sh "$PDF_OUT_DIR/${PDF_NAME}" | cut -f1)
echo "  [OK] $PDF_NAME  ($SIZE)"
echo "       Saved to: public/demo/pdfs/$PDF_NAME"
echo ""
