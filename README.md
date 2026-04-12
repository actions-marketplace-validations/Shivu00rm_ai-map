# .ai-map

**Persistent, self-updating project memory for any AI coding agent.**

Your AI agent walks into every new conversation with amnesia. It re-scans your codebase, burns thousands of tokens, still misses the *why* behind your architecture, and repeats this every session.

`.ai-map` is a folder you drop into your repo that gives any agent — Claude, Cursor, Copilot, Windsurf, Kilo, Antigravity — instant context in a single read. A bundled scanner auto-populates it on first run. You don't write markdown by hand.

---

## Who this is for

- **Solo devs** building projects that span weeks or months — tired of re-explaining the codebase to Claude every morning.
- **Small teams** who want every agent (and every new dev) onboarded in seconds.
- **Anyone switching between AI tools** — write your project context once, every agent reads it.
- **Vibe coders** shipping fast — you stop losing the plot across sessions.

Not for: 100k+ LOC monorepos with 50-person eng orgs. Use a dedicated code graph service for that. (You can still layer `.ai-map` on top for the *intent* layer it doesn't cover.)

---

## Why it's better than re-scanning every session

| | Without `.ai-map` | With `.ai-map` |
|---|---|---|
| **First 10 min of a new chat** | Agent greps 50 files, guesses at architecture | Agent reads 8 markdown files, knows everything |
| **Tokens per session** | 5k–20k wasted on orientation | ~1k to read the map |
| **Memory across sessions** | Zero — amnesia every time | `SESSION_LOG.md` + `DECISIONS.md` carry forward |
| **"Why did we do X?"** | Agent guesses | `DECISIONS.md` has the actual reason |
| **Known bugs / TODOs** | Agent re-discovers each session | `KNOWN_ISSUES.md` is the single source |
| **Switching from Claude to Cursor** | Re-train from scratch | Same `.ai-map/` — every agent reads it |

---

## Why it's different from Graphify and other code-graph tools

Code graph tools (Graphify, Sourcegraph, etc.) give agents a **precise structural graph** of your codebase. That's valuable — but it's only half the picture.

|  | Code graph tools | `.ai-map` |
|---|---|---|
| **What they capture** | Symbols, call graphs, dependency edges | Structure **+ decisions, known issues, goals, session history** |
| **Install** | External service, CLI, or hosted platform | Drop a folder in your repo, done |
| **Cost** | SaaS pricing or infra to host | Free. It's markdown + a tiny scanner. |
| **Agents supported** | One integration per tool | Every agent reads the same markdown |
| **Survives context resets** | Rebuilt from source each time | `SESSION_LOG.md` preserves continuity |
| **Human-readable in PRs** | No — it's a graph DB | Yes — diff it like any other file |
| **Captures *why*** | No | Yes, in `DECISIONS.md` |

**Short version:** Graphify tells the agent the *skeleton*. `.ai-map` tells it the *skeleton, the intent, and the history*. You can use both — they complement each other — but for solo devs and small teams, `.ai-map` alone is usually enough.

---

## How it works in 30 seconds

1. Copy `template/` into your project. You now have `.ai-map/` with 8 markdown files (all containing `AUTO-FILL: PENDING` markers) plus a bundled scanner.
2. Start a chat with any AI agent. It detects the markers, runs `.ai-map/_parser/scan.sh`, and writes `.ai-map/_cache/graph.json` — a structured snapshot of your stack, routes, exports, imports, TODOs, and stubs.
3. The agent reads `graph.json` and fills every markdown file with real content from your repo.
4. You review. Done — permanent project memory.
5. From now on, any change the agent makes updates the matching map file in the same turn. No drift.

## How It Works

```
your-project/
├── .ai-map/
│   ├── README.md          # What is this project? Tech stack. Critical rules.
│   ├── ARCHITECTURE.md    # System design. Directory structure. Data models.
│   ├── SOP.md             # How to write code here. Patterns. Conventions.
│   ├── FLOW_MAP.md        # How data flows. Request lifecycle. Key workflows.
│   ├── GOAL_TRACKER.md    # What's built. What's not. Current status.
│   ├── DECISIONS.md       # Why things are built this way. Tradeoffs.
│   ├── KNOWN_ISSUES.md    # Bugs. Tech debt. Edge cases.
│   ├── SESSION_LOG.md     # Recent session history for continuity.
│   └── INIT.md            # Auto-fill SOP — agents read this on first run to populate the files above.
├── CLAUDE.md              # Points Claude to .ai-map/
├── .cursorrules           # Points Cursor to .ai-map/
├── .windsurfrules         # Points Windsurf to .ai-map/
└── src/...
```

## Quick Start

### 1. Install — one command

```bash
npx @misty001/aimap init
```

That's it. Copies `.ai-map/`, the bundled scanner, and rules files for every major agent (Claude, Cursor, Copilot, Windsurf) into the current directory.

<details>
<summary>Alternatives (no npm)</summary>

```bash
# Unix / macOS
git clone https://github.com/Shivu00rm/ai-map.git
bash ai-map/setup.sh /path/to/your/project
```

```powershell
# Windows
git clone https://github.com/Shivu00rm/ai-map.git
.\ai-map\setup.ps1 -Target C:\path\to\your\project
```

</details>

### 2. Open your AI agent — it does the rest

Start a conversation. The agent detects `AUTO-FILL: PENDING`, runs the bundled scanner, reads the resulting `graph.json`, and fills every map file from real repo data.

**Scanner coverage:**
- **JS / TS** — Next.js, React, Express, Vite; detects Prisma / Drizzle / TypeORM, next-auth / Clerk, vitest / jest
- **Python** — FastAPI, Django, Flask; detects SQLAlchemy, pytest; parses via stdlib `ast`
- **Other stacks** — agent falls back to Lite Mode (grep + manifest read)

Re-run anytime: `bash .ai-map/_parser/scan.sh`

### 3. (Optional) Keep it fresh automatically — GitHub Action

Drop this into `.github/workflows/ai-map.yml`:

```yaml
name: ai-map
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
permissions:
  contents: write
  pull-requests: write
jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: Shivu00rm/ai-map@v0
        with: { mode: auto }
```

What it does:
- On push → runs scanner, auto-commits refreshed `graph.json` if anything changed
- On PR → posts a comment with the delta (new routes / TODOs / stubs)

Fixes the #1 failure mode of every docs-in-repo system: **drift**.

### 4. (Optional) Install as a Claude Skill

```bash
cp -r skill/ai-map-init ~/.claude/skills/
```

Then in any project: `/ai-map-init`. See `skill/README.md`. Non-Claude agents don't need this — the bundled rules files already point them at `.ai-map/`.

### 5. Enforce the Rules

The two critical rules that make `.ai-map` work:

1. **Agent reads `.ai-map/` FIRST** — before touching any code
2. **Agent updates `.ai-map/` AFTER every change** — not batched, not deferred

Without rule #2, the files go stale and agents ignore them. This is the discipline that makes the system work.

## File Reference

### README.md
**What**: Project overview for any agent walking in cold.
**Contains**: Project name, purpose, tech stack table, critical rules summary, file index.
**Update when**: Tech stack changes, new critical rules added.

### ARCHITECTURE.md
**What**: System design document.
**Contains**: Directory tree, data models, auth flow, RBAC roles, event system, database schema summary.
**Update when**: New modules added, directory structure changes, new models created.

### SOP.md
**What**: Coding standards and patterns.
**Contains**: How to write API routes, error handling pattern, validation pattern, permission checking, import rules, component patterns.
**Update when**: New patterns established, conventions change.

### FLOW_MAP.md
**What**: How data moves through the system.
**Contains**: Request lifecycle, key business workflows (checkout, sync, billing), integration flows.
**Update when**: New workflows added, existing flows modified.

### GOAL_TRACKER.md
**What**: Project completion status.
**Contains**: Module status table (done/in-progress/planned), polish items, long-term vision.
**Update when**: Features completed, new features planned.

### DECISIONS.md
**What**: Architectural Decision Records (ADRs), lightweight.
**Contains**: Each decision with: what was decided, why, and the tradeoff accepted.
**Update when**: Any non-obvious architectural choice is made.

### KNOWN_ISSUES.md
**What**: Bugs, tech debt, and edge cases the agent should know about.
**Contains**: Active issues with severity, resolved issues (historical), tech debt backlog.
**Update when**: Bugs found, issues fixed, new tech debt identified.

### SESSION_LOG.md
**What**: Recent session summaries for cross-session continuity.
**Contains**: Date, what was done, what changed, current status.
**Update when**: End of every work session (or after every change, even better).

## Token Savings

Real-world measurements from a 135+ API route / 30+ page Next.js project:

| Without .ai-map | With .ai-map |
|-----------------|-------------|
| ~50K tokens to orient | ~8K tokens to orient |
| Agent re-reads files every session | Agent reads 7 small files once |
| Misses decisions & known bugs | Full context from message 1 |
| Makes wrong assumptions | Follows documented patterns |

**~6x reduction in orientation tokens per session.**

## Best Practices

1. **Keep files concise** — .ai-map is an index, not a novel. If a file exceeds 300 lines, you're over-documenting.
2. **Use tables for status** — Goal tracker should be a scannable table, not paragraphs.
3. **Log decisions as you make them** — Don't batch. The moment you choose a pattern, write it down.
4. **Include the "why"** — Decisions without reasoning are useless. Always include the tradeoff.
5. **Prune session log** — Keep last 5-7 sessions. Move older entries to "see git history."
6. **Don't duplicate code** — .ai-map describes structure and patterns, not implementations. Point to files, don't paste code.
7. **Add to .gitignore selectively** — Most teams WANT .ai-map in the repo. It helps every developer's AI agent.

## Agent Compatibility

`.ai-map` is plain markdown. It works with:

- **Claude Code** (via CLAUDE.md)
- **Cursor** (via .cursorrules)
- **Windsurf** (via .windsurfrules)
- **GitHub Copilot** (via .github/copilot-instructions.md)
- **Kilo Code** (via kilo.json or AGENTS.md)
- **Antigravity IDE** (via .antigravity/)
- **Any agent that can read files**

No vendor lock-in. No special formats. Just markdown.

## License

MIT — use it however you want.
