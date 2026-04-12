#!/usr/bin/env node
// .ai-map scanner — JS/TS
// Zero-dep: uses regex-based extraction. Good enough for auto-fill, not full AST.
// Outputs .ai-map/_cache/graph.json

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.argv[2] || process.cwd();
const IGNORE = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.turbo', '.cache', 'out', '.vercel', '.ai-map']);
const CODE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const MAX_FILES = 2000;

const files = [];
function walk(dir, depth = 0) {
  if (depth > 8 || files.length > MAX_FILES) return;
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    if (IGNORE.has(name) || name.startsWith('.') && name !== '.github') continue;
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, depth + 1);
    else if (CODE_EXT.has(extname(name))) files.push(p);
  }
}
walk(ROOT);

const graph = {
  root: ROOT,
  scannedAt: new Date().toISOString(),
  stack: detectStack(),
  tree: buildTree(),
  modules: [],
  routes: [],
  todos: [],
  stubs: [],
  exports: {},
  imports: {},
  stats: { files: files.length, loc: 0 },
};

function detectStack() {
  const pkgPath = join(ROOT, 'package.json');
  if (!existsSync(pkgPath)) return { runtime: 'unknown' };
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const pick = (k) => k in deps ? deps[k] : null;
  return {
    name: pkg.name,
    description: pkg.description,
    runtime: 'node',
    framework: pick('next') ? 'next' : pick('react') ? 'react' : pick('express') ? 'express' : pick('fastify') ? 'fastify' : pick('vite') ? 'vite' : null,
    typescript: !!pick('typescript'),
    orm: pick('@prisma/client') ? 'prisma' : pick('drizzle-orm') ? 'drizzle' : pick('typeorm') ? 'typeorm' : pick('mongoose') ? 'mongoose' : null,
    auth: pick('next-auth') ? 'next-auth' : pick('@clerk/nextjs') ? 'clerk' : pick('@auth/core') ? 'auth.js' : null,
    testRunner: pick('vitest') ? 'vitest' : pick('jest') ? 'jest' : pick('mocha') ? 'mocha' : null,
    scripts: pkg.scripts || {},
    topDeps: Object.keys(pkg.dependencies || {}).slice(0, 15),
  };
}

function buildTree() {
  const tree = {};
  let topLevel;
  try { topLevel = readdirSync(ROOT).filter(n => !IGNORE.has(n) && !n.startsWith('.')); } catch { return tree; }
  for (const name of topLevel) {
    const p = join(ROOT, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (!st.isDirectory()) continue;
    tree[name] = [];
    try {
      tree[name] = readdirSync(p).filter(n => !IGNORE.has(n) && !n.startsWith('.')).slice(0, 20);
    } catch {}
  }
  return tree;
}

const reExport = /export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/g;
const reImport = /import\s+(?:[\w{},*\s]+\s+from\s+)?['"]([^'"]+)['"]/g;
const reTodo = /(?:\/\/|\/\*|\*|#)\s*(TODO|FIXME|HACK|XXX)[:\s]+(.{0,200})/g;
const reRouteNext = /(?:^|\/)(app|pages)\/.*(route|page|index)\.(t|j)sx?$/;
// Stub = file is tiny AND (contains explicit not-implemented throw OR is effectively empty).
// `return null` alone is NOT a stub signal — legitimate code returns null constantly.
const reStubThrow = /throw\s+new\s+Error\(['"`](?:not[\s_-]?implemented|unimplemented|TODO\b|stub\b)/i;
function isStub(src) {
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').trim();
  if (!code) return true;
  if (reStubThrow.test(src)) return true;
  // Tiny file with no real exports beyond re-exports
  const nonBlank = code.split('\n').filter(l => l.trim()).length;
  if (nonBlank <= 3 && /^\s*export\s*\{?\s*\}?\s*;?\s*$/m.test(code)) return true;
  return false;
}

for (const f of files) {
  let src;
  try { src = readFileSync(f, 'utf8'); } catch { continue; }
  const rel = relative(ROOT, f).replaceAll('\\', '/');
  const lines = src.split('\n');
  graph.stats.loc += lines.length;

  const exports = [];
  let m;
  reExport.lastIndex = 0;
  while ((m = reExport.exec(src))) exports.push(m[1]);
  if (exports.length) graph.exports[rel] = exports;

  const imports = [];
  reImport.lastIndex = 0;
  while ((m = reImport.exec(src))) imports.push(m[1]);
  if (imports.length) graph.imports[rel] = imports;

  reTodo.lastIndex = 0;
  lines.forEach((line, i) => {
    const tm = /(?:\/\/|#|\*)\s*(TODO|FIXME|HACK|XXX)[:\s]+(.{0,160})/i.exec(line);
    if (tm) graph.todos.push({ file: rel, line: i + 1, kind: tm[1].toUpperCase(), text: tm[2].trim() });
  });

  if (isStub(src)) graph.stubs.push(rel);

  if (reRouteNext.test(rel)) {
    const route = '/' + rel
      .replace(/^.*?(app|pages)\//, '')
      .replace(/\/(route|page|index)\.(t|j)sx?$/, '')
      .replace(/\([^)]+\)\//g, '')
      .replace(/\[([^\]]+)\]/g, ':$1');
    graph.routes.push({ path: route || '/', file: rel, framework: 'next' });
  }
  // Express-like detection: only in files that look like server routes.
  // Skip client components and non-server locations to avoid matching axios/fetch clients.
  const isClient = /^\s*['"]use client['"]/m.test(src);
  const looksLikeServer =
    /\b(express|fastify|hono|koa|router|Router)\b/.test(src) &&
    /\/(routes?|api|server|controllers?|handlers?)\//.test(rel);
  if (!isClient && looksLikeServer) {
    const rm = /\b(?:app|router|api)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    let r;
    while ((r = rm.exec(src))) graph.routes.push({ method: r[1].toUpperCase(), path: r[2], file: rel, framework: 'express-like' });
  }
}

graph.todos = graph.todos.slice(0, 50);
graph.modules = Object.keys(graph.tree);

const cacheDir = join(ROOT, '.ai-map', '_cache');
if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
writeFileSync(join(cacheDir, 'graph.json'), JSON.stringify(graph, null, 2));

console.log(`[.ai-map] scanned ${graph.stats.files} files, ${graph.stats.loc} LOC`);
console.log(`[.ai-map] stack: ${graph.stack.framework || 'n/a'}${graph.stack.typescript ? '+ts' : ''}${graph.stack.orm ? ' orm=' + graph.stack.orm : ''}`);
console.log(`[.ai-map] routes: ${graph.routes.length}, todos: ${graph.todos.length}, stubs: ${graph.stubs.length}`);
console.log(`[.ai-map] graph → .ai-map/_cache/graph.json`);
