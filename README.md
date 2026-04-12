# .ai-map Framework

**Stop burning tokens. Give your AI agent instant project context.**

`.ai-map` is a lightweight, agent-agnostic documentation framework that sits inside your project. Instead of letting AI agents scan your entire codebase every conversation (expensive, slow, error-prone), you maintain a small set of markdown files that give any agent full context in seconds.

## The Problem

Every time you start a new conversation with an AI coding agent (Claude, Cursor, Copilot, Windsurf, etc.), it:

1. Has zero memory of your project
2. Scans hundreds of files to understand the codebase
3. Burns thousands of tokens just to get oriented
4. Still misses architectural decisions, known bugs, and conventions
5. Repeats this waste every single session

**`.ai-map` fixes this.** One directory. Seven files. Instant context.

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
│   └── SESSION_LOG.md     # Recent session history for continuity.
├── CLAUDE.md              # Points Claude to .ai-map/
├── .cursorrules           # Points Cursor to .ai-map/
├── .windsurfrules         # Points Windsurf to .ai-map/
└── src/...
```

## Quick Start

### 1. Install

Copy the `.ai-map/` template directory into your project root:

```bash
# Clone the framework
git clone https://github.com/YOUR_USERNAME/ai-map-framework.git

# Copy template into your project
cp -r ai-map-framework/template/.ai-map your-project/.ai-map
cp ai-map-framework/template/AGENTS.md your-project/AGENTS.md
```

Or manually create the directory:

```bash
mkdir .ai-map
```

### 2. Fill In Your Project Context

Edit each file in `.ai-map/` with your project's details. Start with:

1. **README.md** — Project name, tech stack, critical rules
2. **ARCHITECTURE.md** — Directory structure, key models, auth flow
3. **SOP.md** — Your coding patterns (how to write routes, components, etc.)

The other files can be built up over time as you work with your AI agent.

### 3. Point Your Agent

Create an entry point file so your AI agent knows to read `.ai-map/`:

**For Claude Code** — create `CLAUDE.md`:
```markdown
# Read .ai-map/ directory before any codebase work.
# Start with .ai-map/README.md for project overview.
# After ANY file changes, update relevant .ai-map/ files.
```

**For Cursor** — create `.cursorrules`:
```
Read .ai-map/ directory before writing any code.
Start with .ai-map/README.md for project overview.
After ANY file changes, update relevant .ai-map/ files.
```

**For Windsurf** — create `.windsurfrules`:
```
Read .ai-map/ directory before writing any code.
Start with .ai-map/README.md for project overview.
After ANY file changes, update relevant .ai-map/ files.
```

**For GitHub Copilot** — create `.github/copilot-instructions.md`:
```markdown
Read .ai-map/ directory before writing any code.
Start with .ai-map/README.md for project overview.
After ANY file changes, update relevant .ai-map/ files.
```

### 4. Enforce the Rules

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
