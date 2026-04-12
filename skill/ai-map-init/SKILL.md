---
name: ai-map-init
description: Initialize or refresh the .ai-map/ context framework in any project. Use when the user asks to "set up ai-map", "init ai-map", "refresh the map", or when opening a project where .ai-map/README.md contains the marker "AUTO-FILL: PENDING". Scans the repo via bundled parser (.ai-map/_parser/scan.sh), writes graph.json, then auto-populates all .ai-map markdown files from that graph.
---

# ai-map-init

Initializes the `.ai-map/` framework in the current project, or refreshes it after major changes. Works on any stack with fallbacks for unsupported languages.

## When to invoke

1. **On project open** — if `.ai-map/README.md` contains `AUTO-FILL: PENDING`, run init.
2. **On explicit request** — user says "init ai-map", "set up ai-map", "refresh the map", "rescan".
3. **After major changes** — 10+ files changed, new top-level folder, new route set, user confirms rescan.

## Steps

### 1. Check or install framework

If `.ai-map/` does not exist:
- Ask user: "No `.ai-map/` found. Install the framework here? (y/n)"
- If yes, run the setup script:
  - Unix: `bash setup.sh` (from framework repo) or `curl -fsSL https://raw.githubusercontent.com/<org>/ai-map-framework/main/setup.sh | bash`
  - Windows: `powershell -File setup.ps1`
- If framework is already checked out locally, copy `template/.ai-map/` into project root.

### 2. Run the scanner (Deep Mode)

```
bash .ai-map/_parser/scan.sh      # Unix
powershell -File .ai-map/_parser/scan.ps1   # Windows
```

Outputs `.ai-map/_cache/graph.json` with stack, tree, routes, exports, imports, todos, stubs, stats.

If scanner exits non-zero (unsupported stack, missing runtime), fall through to Lite Mode in `.ai-map/INIT.md`.

### 3. Read `graph.json`, populate map files

Follow `.ai-map/INIT.md` Step 2A exactly. Replace every `AUTO-FILL: PENDING` block with real content pulled from graph data:

- `README.md` ← stack, description, top deps
- `ARCHITECTURE.md` ← tree, entry points, modules
- `SOP.md` ← framework, TS, test runner, observed conventions
- `FLOW_MAP.md` ← routes grouped by prefix, ORM + schema location
- `GOAL_TRACKER.md` ← built (folders + routes), in-progress (stubs + WIP commits)
- `KNOWN_ISSUES.md` ← todos + stubs
- `DECISIONS.md` ← only seed if commits/README reveal non-obvious choices; never fabricate
- `SESSION_LOG.md` ← first-entry init line with stats

### 4. Confirm with user

Post one short summary:

> Auto-filled `.ai-map/` from repo scan. Detected `<framework>+<orm>`, `<N>` routes, `<N>` TODOs, `<N>` stubs across `<N>` files. Review `README.md` and `ARCHITECTURE.md` — flag anything wrong.

Do not dump file contents into chat.

## Refresh mode

If `.ai-map/` already populated (no AUTO-FILL markers) and user asks to refresh:

1. Re-run scanner.
2. Diff new `graph.json` against existing map files.
3. Update only what changed (new routes, new TODOs, new modules, dropped files).
4. Append a SESSION_LOG.md entry with the delta summary.

Do NOT overwrite DECISIONS.md or human-written sections of README.md on refresh.

## Ongoing update triggers

After this skill completes, respect the triggers in `.ai-map/INIT.md` Step 3: any code change should update the matching map file in the same turn.

## Constraints

- Never leave `AUTO-FILL: PENDING` markers in place.
- Never scan `node_modules/`, `.next/`, `dist/`, `build/`, `.git/`, `venv/`, `target/`, `vendor/`.
- Never fabricate decisions or rationale — only record what the repo actually shows.
- Scanner writes to `.ai-map/_cache/graph.json` which is gitignored. Don't commit it.
