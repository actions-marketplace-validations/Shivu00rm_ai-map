#!/usr/bin/env bash
# .ai-map scanner dispatcher
# Picks the right scanner based on detected project stack.
# Usage: bash .ai-map/_parser/scan.sh [project_root]

set -e
ROOT="${1:-$(pwd)}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$ROOT/package.json" ]; then
  if command -v node >/dev/null 2>&1; then
    node "$SCRIPT_DIR/scan.mjs" "$ROOT"
    exit 0
  else
    echo "[.ai-map] node not found, skipping JS/TS scan" >&2
  fi
fi

if [ -f "$ROOT/pyproject.toml" ] || [ -f "$ROOT/requirements.txt" ] || [ -f "$ROOT/setup.py" ]; then
  if command -v python3 >/dev/null 2>&1; then
    python3 "$SCRIPT_DIR/scan.py" "$ROOT"
    exit 0
  elif command -v python >/dev/null 2>&1; then
    python "$SCRIPT_DIR/scan.py" "$ROOT"
    exit 0
  else
    echo "[.ai-map] python not found, skipping Python scan" >&2
  fi
fi

echo "[.ai-map] no supported stack detected — agent should fall back to lite-mode scan (see INIT.md)"
exit 1
