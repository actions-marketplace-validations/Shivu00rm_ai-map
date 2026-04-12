#!/usr/bin/env node
// ai-map CLI
// Commands:
//   ai-map init       — install .ai-map/ + agent rules into current project
//   ai-map scan       — run the scanner, refresh .ai-map/_cache/graph.json
//   ai-map refresh    — scan (alias)
//   ai-map version    — print version

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = __dirname;
const TEMPLATE = join(PKG_ROOT, 'template');
const pkg = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'));

const cmd = process.argv[2] || 'help';
const target = resolve(process.argv[3] || process.cwd());

const log = (msg) => console.log(`[ai-map] ${msg}`);
const err = (msg) => { console.error(`[ai-map] ${msg}`); process.exit(1); };

function mergeCopy(src, dest) {
  let installed = 0, skipped = 0;
  const st = statSync(src);
  if (st.isDirectory()) {
    mkdirSync(dest, { recursive: true });
    for (const name of readdirSync(src)) {
      const r = mergeCopy(join(src, name), join(dest, name));
      installed += r.installed;
      skipped += r.skipped;
    }
  } else {
    if (existsSync(dest)) return { installed: 0, skipped: 1 };
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest);
    installed = 1;
  }
  return { installed, skipped };
}

function init() {
  if (!existsSync(target)) err(`target does not exist: ${target}`);
  log(`installing into ${target}`);

  const files = [
    ['template/.ai-map', '.ai-map'],
    ['template/AGENTS.md', 'AGENTS.md'],
    ['template/CLAUDE.md', 'CLAUDE.md'],
    ['template/.cursorrules', '.cursorrules'],
    ['template/.windsurfrules', '.windsurfrules'],
    ['template/.github/copilot-instructions.md', '.github/copilot-instructions.md'],
  ];

  let installed = 0, skipped = 0;
  for (const [src, dest] of files) {
    const srcPath = join(PKG_ROOT, src);
    const destPath = join(target, dest);
    if (!existsSync(srcPath)) continue;
    const r = mergeCopy(srcPath, destPath);
    installed += r.installed;
    skipped += r.skipped;
  }

  log(`installed ${installed} file(s), skipped ${skipped} existing`);
  log(`next: open your AI agent in this project — it will auto-fill .ai-map/`);
  log(`or run: npx ai-map scan  (populates graph.json now)`);
}

function scan() {
  const scannerMjs = join(target, '.ai-map', '_parser', 'scan.mjs');
  const scannerPy = join(target, '.ai-map', '_parser', 'scan.py');

  if (!existsSync(scannerMjs) && !existsSync(scannerPy)) {
    err(`no scanner found. run: npx ai-map init`);
  }

  const hasPkg = existsSync(join(target, 'package.json'));
  const hasPy = ['pyproject.toml', 'requirements.txt', 'setup.py'].some(f => existsSync(join(target, f)));

  if (hasPkg && existsSync(scannerMjs)) {
    const r = spawnSync(process.execPath, [scannerMjs, target], { stdio: 'inherit' });
    process.exit(r.status || 0);
  }
  if (hasPy && existsSync(scannerPy)) {
    const py = process.platform === 'win32' ? 'python' : 'python3';
    const r = spawnSync(py, [scannerPy, target], { stdio: 'inherit' });
    process.exit(r.status || 0);
  }

  err(`no supported stack detected (no package.json / pyproject.toml / requirements.txt)`);
}

function help() {
  console.log(`ai-map v${pkg.version}

Persistent project memory for any AI coding agent.

Commands:
  ai-map init [path]      Install framework into project (default: cwd)
  ai-map scan [path]      Run scanner, refresh graph.json
  ai-map refresh [path]   Alias for scan
  ai-map version          Print version
  ai-map help             Show this message

Docs: https://github.com/Shivu00rm/ai-map
`);
}

switch (cmd) {
  case 'init': init(); break;
  case 'scan': case 'refresh': scan(); break;
  case 'version': case '--version': case '-v': console.log(pkg.version); break;
  case 'help': case '--help': case '-h': default: help();
}
