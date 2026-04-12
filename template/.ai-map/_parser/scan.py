#!/usr/bin/env python3
# .ai-map scanner — Python (stdlib only)
# Outputs .ai-map/_cache/graph.json

import ast, json, os, re, sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else os.getcwd()).resolve()
IGNORE = {"__pycache__", ".venv", "venv", "env", ".git", "dist", "build", ".tox", ".mypy_cache", ".pytest_cache", ".ai-map", "node_modules"}
MAX_FILES = 2000

files = []
for p in ROOT.rglob("*.py"):
    if any(part in IGNORE or part.startswith(".") for part in p.relative_to(ROOT).parts[:-1]):
        continue
    files.append(p)
    if len(files) > MAX_FILES:
        break

def detect_stack():
    stack = {"runtime": "python"}
    pyproject = ROOT / "pyproject.toml"
    req = ROOT / "requirements.txt"
    deps_text = ""
    if pyproject.exists():
        deps_text = pyproject.read_text(errors="ignore")
    if req.exists():
        deps_text += "\n" + req.read_text(errors="ignore")
    def has(pkg): return pkg.lower() in deps_text.lower()
    stack["framework"] = "fastapi" if has("fastapi") else "django" if has("django") else "flask" if has("flask") else None
    stack["orm"] = "sqlalchemy" if has("sqlalchemy") else "django-orm" if has("django") else "tortoise" if has("tortoise") else None
    stack["testRunner"] = "pytest" if has("pytest") else "unittest"
    return stack

def build_tree():
    tree = {}
    for entry in sorted(ROOT.iterdir()):
        if entry.name in IGNORE or entry.name.startswith("."): continue
        if entry.is_dir():
            try:
                tree[entry.name] = [c.name for c in entry.iterdir() if c.name not in IGNORE and not c.name.startswith(".")][:20]
            except PermissionError:
                tree[entry.name] = []
    return tree

graph = {
    "root": str(ROOT),
    "scannedAt": datetime.now(timezone.utc).isoformat(),
    "stack": detect_stack(),
    "tree": build_tree(),
    "modules": [],
    "routes": [],
    "todos": [],
    "stubs": [],
    "exports": {},
    "imports": {},
    "stats": {"files": len(files), "loc": 0},
}

todo_re = re.compile(r"#\s*(TODO|FIXME|HACK|XXX)[:\s]+(.{0,160})", re.I)
route_re = re.compile(r"@(?:app|router)\.(get|post|put|delete|patch)\(\s*['\"]([^'\"]+)['\"]", re.I)

for f in files:
    try:
        src = f.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        continue
    rel = str(f.relative_to(ROOT)).replace("\\", "/")
    lines = src.splitlines()
    graph["stats"]["loc"] += len(lines)

    for i, line in enumerate(lines, 1):
        m = todo_re.search(line)
        if m:
            graph["todos"].append({"file": rel, "line": i, "kind": m.group(1).upper(), "text": m.group(2).strip()})

    for m in route_re.finditer(src):
        graph["routes"].append({"method": m.group(1).upper(), "path": m.group(2), "file": rel, "framework": "fastapi-like"})

    try:
        tree = ast.parse(src)
    except SyntaxError:
        continue
    exports, imports = [], []
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            if not node.name.startswith("_"):
                exports.append(node.name)
            body = node.body
            if len(body) == 1 and isinstance(body[0], (ast.Pass, ast.Raise)):
                graph["stubs"].append(f"{rel}:{node.name}")
        elif isinstance(node, ast.Assign):
            for t in node.targets:
                if isinstance(t, ast.Name) and not t.id.startswith("_"):
                    exports.append(t.id)
        elif isinstance(node, ast.Import):
            for n in node.names: imports.append(n.name)
        elif isinstance(node, ast.ImportFrom):
            if node.module: imports.append(node.module)
    if exports: graph["exports"][rel] = exports
    if imports: graph["imports"][rel] = imports

graph["todos"] = graph["todos"][:50]
graph["modules"] = list(graph["tree"].keys())

cache = ROOT / ".ai-map" / "_cache"
cache.mkdir(parents=True, exist_ok=True)
(cache / "graph.json").write_text(json.dumps(graph, indent=2))

print(f"[.ai-map] scanned {graph['stats']['files']} files, {graph['stats']['loc']} LOC")
print(f"[.ai-map] stack: {graph['stack'].get('framework') or 'n/a'} orm={graph['stack'].get('orm')}")
print(f"[.ai-map] routes: {len(graph['routes'])}, todos: {len(graph['todos'])}, stubs: {len(graph['stubs'])}")
print(f"[.ai-map] graph → .ai-map/_cache/graph.json")
