# Universal Agent Instructions

## STEP 0: Auto-Init Check (First Session Only)

Before reading anything else, check `.ai-map/README.md` for the marker `AUTO-FILL: PENDING`.

- **If present** → read `.ai-map/INIT.md` and follow its SOP to auto-populate all `.ai-map/` files from the repo. Do NOT ask the user to fill files manually.
- **If absent** → proceed to Step 1.

## MANDATORY: Read .ai-map/ First

Before writing ANY code, read the `.ai-map/` directory:

1. `.ai-map/README.md` — Project overview, tech stack, critical rules
2. `.ai-map/SOP.md` — Coding standards
3. `.ai-map/ARCHITECTURE.md` — System design
4. `.ai-map/FLOW_MAP.md` — Data flows
5. `.ai-map/GOAL_TRACKER.md` — What's built vs what needs work
6. `.ai-map/KNOWN_ISSUES.md` — Bugs, tech debt, edge cases
7. `.ai-map/DECISIONS.md` — Why things are built the way they are
8. `.ai-map/SESSION_LOG.md` — Recent session history

## Critical Rules

1. **NEVER full-scan the codebase** if `.ai-map/` has what you need
2. **NEVER read** `node_modules/`, `.next/`, `dist/`, `build/`
3. **After ANY changes**, update relevant `.ai-map/` files (triggers in `INIT.md` Step 3)
4. **Don't auto-commit/push** unless explicitly asked
5. **Never leave `AUTO-FILL: PENDING` markers** in place — resolve them in the same session they're encountered

## Quick Reference

| Need | File |
|------|------|
| How to write code | `.ai-map/SOP.md` |
| Directory structure | `.ai-map/ARCHITECTURE.md` |
| Key workflows | `.ai-map/FLOW_MAP.md` |
| Known bugs | `.ai-map/KNOWN_ISSUES.md` |
| Why a decision was made | `.ai-map/DECISIONS.md` |
| What's done/not done | `.ai-map/GOAL_TRACKER.md` |
