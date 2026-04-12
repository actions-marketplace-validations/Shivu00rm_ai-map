# .ai-map Auto-Init SOP

**Read this when any `.ai-map/*.md` file contains the marker `<!-- AUTO-FILL: PENDING -->`.**

Your job: replace that marker with real content inferred from the project. Do NOT ask the user questions you can answer from the repo.

---

## Step 1 — Run the scanner (Deep Mode), or fall back to Lite Mode

### Deep Mode (preferred)

Run the bundled scanner:

- **macOS / Linux:** `bash .ai-map/_parser/scan.sh`
- **Windows:** `powershell -File .ai-map/_parser/scan.ps1`

Scanner picks the right parser for the stack (Node for JS/TS, Python stdlib for Python) and writes `.ai-map/_cache/graph.json` with:

- `stack` — framework, ORM, auth, test runner, top deps
- `tree` — top-2-level folder structure
- `routes` — all HTTP routes (path, method, file)
- `exports` / `imports` — per-file symbols + deps
- `todos` — TODO/FIXME/HACK/XXX with file:line
- `stubs` — functions that throw/pass (not implemented)
- `stats` — file count, LOC

**Read `graph.json` instead of grepping the repo.** One cheap file read replaces dozens of tool calls.

If the scanner fails or the stack isn't supported, continue to Lite Mode.

### Lite Mode (fallback)

Run these in parallel:

- `ls` project root (top level only)
- Read `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` / `composer.json` / `Gemfile` — whichever exist
- Read `README.md` if it exists at project root
- `git log --oneline -20` (if git repo)
- `ls src/ app/ lib/ pages/ routes/` — whichever exist (top level only, do NOT recurse)

**Greenfield** = no package manifest AND no source dirs AND no meaningful README.
**Existing project** = anything else.

---

## Step 2A — If existing project: auto-fill from `graph.json` (or Lite signals)

Never leave `<!-- AUTO-FILL: PENDING -->` behind. Pull data from `.ai-map/_cache/graph.json` when available; otherwise use the signals from Lite Mode.

### README.md
- **Project name** ← `graph.stack.name` or folder name
- **Purpose** ← `graph.stack.description` or root README intro
- **Tech stack** ← `graph.stack.framework`, `orm`, `auth`, `testRunner`, `topDeps`
- **Critical rules** ← `- (add project-specific rules as they emerge)`

### ARCHITECTURE.md
- **Directory tree** ← `graph.tree` (render as a tree block)
- **Entry points** ← `graph.stack.scripts.dev` / `start` / `build`
- **Key modules** ← each key of `graph.tree` with one-line purpose inferred from folder name + most common exports in `graph.exports`

### SOP.md
- **Language + framework** ← `graph.stack.framework`, `graph.stack.typescript`
- **Style signals** ← check for `.prettierrc`, `.eslintrc`, `tsconfig.json` strict mode, `.editorconfig`, ruff/black config
- **Test runner** ← `graph.stack.testRunner`
- **Conventions observed** ← scan first 10 entries of `graph.exports` — note if default-exports vs named-exports dominate, kebab vs camel file names, etc.

### FLOW_MAP.md
- **Routes** ← `graph.routes` grouped by method/prefix (e.g., all `/api/*` together)
- **Data layer** ← `graph.stack.orm` + grep `graph.exports` keys for `schema`/`models`/`migrations`
- If `graph.routes` is empty: `- (no routes detected — update when added)`

### GOAL_TRACKER.md
- **Built** ← major folders in `graph.tree` + route groups from `graph.routes`
- **In progress** ← `graph.stubs` list (functions not yet implemented) + last 10 git commits for WIP patterns
- **Not started** ← leave placeholder

### DECISIONS.md
- Seed only where README/commits reveal non-obvious choices. Otherwise: `- (decisions will be logged as they are made)`. Do NOT fabricate.

### KNOWN_ISSUES.md
- `graph.todos` — list as `file:line — KIND: text`, cap at 20
- Append `graph.stubs` under "Unimplemented"
- If both empty: `- (none known)`

### SESSION_LOG.md
- First entry: `YYYY-MM-DD — .ai-map initialized. Scanned <stats.files> files, detected <stack.framework>+<stack.orm>, <routes.length> routes, <todos.length> TODOs.`

---

## Step 2B — If greenfield: ask 4 questions, then fill

Ask the user in one message:

1. Project name + one-sentence purpose?
2. Target tech stack?
3. Primary user / use case?
4. Any hard constraints (deploy target, performance, compliance)?

Then fill README.md, ARCHITECTURE.md (skeleton), SOP.md (stack defaults). Leave FLOW_MAP / GOAL_TRACKER / KNOWN_ISSUES with `- (empty — will populate as code is built)`.

---

## Step 2C — Refresh trigger

Re-run the scanner (`bash .ai-map/_parser/scan.sh`) whenever:
- 10+ files changed since last scan
- New top-level folder added
- New route/endpoint added
- User explicitly asks to refresh the map

The scanner is idempotent and cheap. Prefer re-scanning over stale memory.

## Step 3 — Ongoing update triggers

After ANY file change, update the matching `.ai-map/` file(s):

| Change type | Update |
|---|---|
| Added/removed dependency | `README.md` tech stack, `SOP.md` if tooling |
| New top-level folder | `ARCHITECTURE.md` |
| New route / endpoint | `FLOW_MAP.md` |
| New schema / migration | `FLOW_MAP.md` data layer |
| Feature shipped | `GOAL_TRACKER.md` (built), `SESSION_LOG.md` |
| Architectural choice made | `DECISIONS.md` |
| Bug found / TODO added | `KNOWN_ISSUES.md` |
| Any non-trivial session | `SESSION_LOG.md` one-liner |

Rule: touch the map in the same turn as the code change. Never batch map updates for "later."

---

## Step 4 — Confirm with user

After auto-fill, post a short summary:

> Auto-filled `.ai-map/` from repo scan. Detected: `<stack>`, `<N>` routes, `<N>` known TODOs. Review `README.md` and `ARCHITECTURE.md` — flag anything wrong.

Do not dump the full contents into chat. The user will read the files.
