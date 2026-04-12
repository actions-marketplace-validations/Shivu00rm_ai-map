# .ai-map Claude Skill

Ship `.ai-map` as a first-class Claude Skill so any Claude session can invoke it by name.

## Install (user-level — available in every project)

**macOS / Linux:**
```bash
mkdir -p ~/.claude/skills
cp -r ai-map-init ~/.claude/skills/
```

**Windows:**
```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills"
Copy-Item -Recurse ai-map-init "$env:USERPROFILE\.claude\skills\"
```

## Install (project-level — scoped to one repo)

```bash
mkdir -p .claude/skills
cp -r ai-map-init .claude/skills/
```

## Use

In Claude Code:
```
/ai-map-init
```

Or describe the intent — Claude auto-selects the skill:
- "set up ai-map in this project"
- "refresh the map"
- "scan this repo and populate .ai-map"

The skill reads `.ai-map/INIT.md` + runs `.ai-map/_parser/scan.sh`, writes `graph.json`, fills every markdown file.

## Also works without the skill

The framework is self-describing. Any agent (Cursor, Copilot, Windsurf, Kilo, Antigravity) reads `AGENTS.md` / `.cursorrules` / `.windsurfrules` and follows the same flow — the skill is only a convenience wrapper for Claude.
