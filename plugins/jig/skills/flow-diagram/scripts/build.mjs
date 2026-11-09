#!/usr/bin/env node
// Builds a flow diagram page from a data file.
//   node build.mjs <flow.json> [--out <file.html>] [--force] [--open] [--check] [--motion cdn|inline]
// Validates the data (schema, mode system|spec|code, label fit, STE sentence length, no file names in a card, the code-mode proof), then
// injects it into assets/template.html and writes the HTML beside the data file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = path.join(HERE, '..', 'assets', 'template.html');
const MOTION_INLINE = path.join(HERE, '..', 'assets', 'motion-14.10.1.min.js');
const MOTION_CDN = 'https://cdn.jsdelivr.net/npm/motion@14.10.1/dist/motion.js';
const GLYPHS = JSON.parse(fs.readFileSync(path.join(HERE, 'geist-500-14px.json'), 'utf8'));

// Layout limits, measured in Chromium with the Geist web font loaded (see geist-500-14px.json).
const BOX_W = 132; // the box width: the browser wraps the label at this width
const LINE_MAX = 120; // the widest line that keeps a 6 px margin on each side
const LINES_MAX = 2; // 18 px per line; 3 lines leave 5 px above and below in a 64 px box
const KERN = 0.98; // measured: canvas width of the 7 reference labels / sum of their glyph advances = 0.975-0.991
const MAX_STEPS = 40;
// ASD-STE100 Issue 9: Rule 5.1 (procedure: 20 words), Rule 6.3 (description: 25 words).
const WORDS_PROCEDURE = 20;
const WORDS_DESCRIPTION = 25;
// A "code" entry is one file:line (or file:line-line) the builder read. It is the builder's proof and never reaches the page.
const CITE = /^(?:[\w.-]+\/)*[\w.-]+\.[a-z]{1,5}:\d+(?:-\d+)?$/;
// A card tells what happens and which function does it. A file name or a path in a card is a build error: the reader
// follows the story, not the tree. A path has a slash and a lowercase letter, a file name has a source extension.
// "Node.js" is a product, "HTTP/2" a protocol and "and/or" a word: none is a file.
const PRODUCTS = /\b(?:Node|Next|Nest|Nuxt|Vue|Three|D3|React|Alpine|Ember|Express)\.js\b|\b(?:and\/or|w\/o|I\/O|[A-Z0-9.-]+\/[A-Z0-9.-]+)\b/g;
const PATHISH = /(?:[\w.@-]+\/)+[\w.-]*[a-z][\w.-]*|\b[\w-]+\.(?:tsx?|jsx?|mjs|cjs|json|mdx?|sql|css|html?|ya?ml|toml|py|rb|go|rs|java|kt|php|sh|prisma)\b/;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const dataPath = args.find((a, i) => !a.startsWith('--') && !(i > 0 && ['--out', '--motion'].includes(args[i - 1])));
if (!dataPath) fail(['usage: node build.mjs <flow.json> [--out <file.html>] [--force] [--open] [--check] [--motion cdn|inline]']);

const raw = fs.readFileSync(dataPath, 'utf8');
let data;
try { data = JSON.parse(raw); } catch (e) { fail([`${dataPath}: not valid JSON: ${e.message}`]); }

const errors = validate(data);
if (errors.length) fail(errors.map((e) => `${dataPath}: ${e}`));

if (flag('--check')) { console.log(`ok: ${dataPath} is valid (${data.steps.length} steps, mode ${data.mode})`); process.exit(0); }

const out = opt('--out') || path.join(path.dirname(dataPath), path.basename(dataPath).replace(/\.json$/i, '') + '.html');
if (fs.existsSync(out) && !flag('--force')) fail([`${out} exists. Pass --force to replace it, or give the data file a new name.`]);

const motionMode = opt('--motion') || 'inline';
let motionTag;
if (motionMode === 'cdn') motionTag = `<script src="${MOTION_CDN}"><\/script>`;
else if (motionMode === 'inline') motionTag = `<script>${fs.readFileSync(MOTION_INLINE, 'utf8')}<\/script>`;
else if (motionMode === 'none') motionTag = '';
else fail([`--motion must be cdn or inline, got ${motionMode}`]);

const html = fs.readFileSync(TEMPLATE, 'utf8')
  .replace(/__TITLE__/g, escHtml(data.title))
  .replace(/__INTRO__/g, escHtml(data.intro))
  .replace('__DATA__', safeJson(withoutCode(data)))
  .replace('__MOTION__', () => motionTag);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
const url = pathToFileURL(path.resolve(out)).href;
console.log(`wrote ${out} (${data.steps.length} steps, mode ${data.mode}, motion ${motionMode})`);
console.log(`open ${url}`);
if (flag('--open')) openInBrowser(path.resolve(out));

// ---------- validation ----------
function validate(d) {
  const E = [];
  const isStr = (v) => typeof v === 'string';
  const nonEmpty = (v) => isStr(v) && v.trim().length > 0;
  if (!d || typeof d !== 'object' || Array.isArray(d)) return ['the root must be an object'];
  if (!nonEmpty(d.title)) E.push('title: required, a non-empty string');
  else if (d.title.length > 80) E.push(`title: ${d.title.length} characters, maximum 80`);
  else E.push(...noFiles('title', d.title));
  if (!['system', 'spec', 'code'].includes(d.mode)) E.push(`mode: must be "system", "spec" or "code", got ${JSON.stringify(d.mode)}`);
  if (!nonEmpty(d.intro)) E.push('intro: required, one instruction sentence');
  else E.push(...sentences('intro', d.intro, WORDS_PROCEDURE), ...noFiles('intro', d.intro));
  for (const k of ['start', 'end']) {
    const c = d[k];
    if (!c || typeof c !== 'object') { E.push(`${k}: required, an object {title, summary}`); continue; }
    if (!nonEmpty(c.title)) E.push(`${k}.title: required`); else if (c.title.length > 60) E.push(`${k}.title: ${c.title.length} characters, maximum 60`); else E.push(...noFiles(`${k}.title`, c.title));
    if (!nonEmpty(c.summary)) E.push(`${k}.summary: required`); else E.push(...sentences(`${k}.summary`, c.summary, WORDS_DESCRIPTION), ...noFiles(`${k}.summary`, c.summary));
    const allowed = k === 'start' && d.mode === 'code' ? ['title', 'summary', 'code'] : ['title', 'summary'];
    for (const extra of Object.keys(c)) if (!allowed.includes(extra)) E.push(`${k}.${extra}: ${extra === 'code' ? (d.mode === 'code' ? 'the end card has no code: nothing runs there' : 'only code mode has a code field: a design or a spec has no file to cite') : 'unknown field'}`);
    if (k === 'start' && d.mode === 'code') E.push(...proof('start', c.code, 'the entry point'));
  }
  if (!Array.isArray(d.steps) || d.steps.length < 1) { E.push('steps: required, an array of at least 1 step'); return E; }
  if (d.steps.length > MAX_STEPS) E.push(`steps: ${d.steps.length} steps, maximum ${MAX_STEPS}`);
  d.steps.forEach((s, i) => {
    const p = `steps[${i}]`;
    if (!s || typeof s !== 'object') { E.push(`${p}: must be an object`); return; }
    if (!nonEmpty(s.label)) E.push(`${p}.label: required`);
    else E.push(...labelFit(p, s.label));
    const allowed = i === 0 ? ['label'] : ['label', 'title', 'summary', 'items', 'example', ...(d.mode === 'code' ? ['code'] : [])];
    for (const k of Object.keys(s)) if (!allowed.includes(k)) E.push(`${p}.${k}: ${i === 0 ? 'the first step has a label only; its card is "start"' : k === 'code' ? 'only code mode has a code field: a design or a spec has no file to cite' : 'unknown field'}`);
    E.push(...noFiles(`${p}.label`, s.label));
    if (i === 0) return;
    if (!nonEmpty(s.title)) E.push(`${p}.title: required`); else if (s.title.length > 60) E.push(`${p}.title: ${s.title.length} characters, maximum 60`); else E.push(...noFiles(`${p}.title`, s.title));
    if (!nonEmpty(s.summary)) E.push(`${p}.summary: required`); else E.push(...sentences(`${p}.summary`, s.summary, WORDS_DESCRIPTION), ...noFiles(`${p}.summary`, s.summary));
    if (s.items !== undefined) {
      if (!Array.isArray(s.items)) E.push(`${p}.items: must be an array of {heading, text}`);
      else s.items.forEach((it, j) => {
        const q = `${p}.items[${j}]`;
        if (!it || typeof it !== 'object') { E.push(`${q}: must be an object {heading, text}`); return; }
        if (!nonEmpty(it.heading)) E.push(`${q}.heading: required`); else if (it.heading.length > 80) E.push(`${q}.heading: ${it.heading.length} characters, maximum 80`); else E.push(...noFiles(`${q}.heading`, it.heading));
        if (!nonEmpty(it.text)) E.push(`${q}.text: required`); else E.push(...sentences(`${q}.text`, it.text, WORDS_DESCRIPTION), ...noFiles(`${q}.text`, it.text));
        for (const k of Object.keys(it)) if (!['heading', 'text'].includes(k)) E.push(`${q}.${k}: unknown field`);
      });
    }
    if (s.example !== undefined && !isStr(s.example)) E.push(`${p}.example: must be a string`);
    if (d.mode === 'code') E.push(...proof(p, s.code, 'each call the card describes'));
  });
  return E;
}

// Code mode: a card's "code" lists the file:line of what the builder read. Missing or malformed, the card is unproven.
function proof(field, code, what) {
  if (!Array.isArray(code) || code.length === 0) return [`${field}.code: code mode needs the file:line of ${what}, as an array of strings`];
  return code.flatMap((c, j) => (typeof c === 'string' && CITE.test(c.trim()) ? [] : [`${field}.code[${j}]: ${JSON.stringify(c)} is not a file:line`]));
}
// A card never names a file or a path: it says what happens and which function does it. The proof goes in "code".
function noFiles(field, text) {
  const m = text.replace(PRODUCTS, ' ').match(PATHISH);
  return m ? [`${field}: "${m[0]}" is a file name or a path. Say what happens and which function does it, and put the file:line in "code"`] : [];
}
// The page carries the story only. The proof stays in the data file.
function withoutCode(d) {
  const { code: _c, ...start } = d.start;
  return { ...d, start, steps: d.steps.map(({ code: _k, ...s }) => s) };
}

// Rule 8.1: no semicolon. Rules 8.4-8.7: how to count words. Rule 5.1 / 6.3: the limits.
function sentences(field, text, max) {
  const E = [];
  if (text.includes(';')) E.push(`${field}: a semicolon (ASD-STE100 Rule 8.1 does not permit it)`);
  const parts = text.replace(/\s+/g, ' ').trim().split(/(?<=[.?!:])\s+(?=[^\s])/);
  for (const sent of parts) {
    const n = countWords(sent);
    if (n > max) E.push(`${field}: "${sent.slice(0, 60)}${sent.length > 60 ? '…' : ''}" has ${n} words, maximum ${max} (ASD-STE100 Rule ${max === 20 ? '5.1' : '6.3'})`);
  }
  return E;
}
function countWords(s) {
  let t = s
    .replace(/\([^)]*\)/g, ' W ') // Rule 8.5: text in parentheses is one word
    .replace(/"[^"]*"|“[^”]*”|`[^`]*`/g, ' W ') // Rule 8.6: quoted text is one word
    .replace(/(\d[\d.,]*)\s+(?:[a-zA-Z%°]{1,4})(?=\s|$|[.,)])/g, '$1') // Rule 8.6: a number with its unit is one word
    .trim();
  return t ? t.split(/\s+/).length : 0;
}

function labelFit(field, label) {
  const E = [];
  const adv = (ch) => (GLYPHS.advances[ch] ?? 10) + GLYPHS.letterSpacingPx;
  const width = (s) => KERN * [...s].reduce((a, ch) => a + adv(ch), 0);
  if (/\n/.test(label)) E.push(`${field}: no line break in a label`);
  if (/(?:^|\s)or(?:\s|$)/i.test(label)) E.push(`${field}: "${label}" names two paths. A box is one step: name it for the decision, and make each outcome a "How it works" item (Content rule 1)`);
  const words = label.trim().split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (width(w) > BOX_W) E.push(`${field}: the word "${w}" is ${Math.round(width(w))} px wide, wider than the ${BOX_W} px box`);
    const next = cur ? cur + ' ' + w : w;
    if (cur && width(next) > BOX_W) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  if (lines.length > LINES_MAX) E.push(`${field}: "${label}" needs ${lines.length} lines in the ${BOX_W} px box, maximum ${LINES_MAX}`);
  for (const l of lines) if (width(l) > LINE_MAX && width(l) <= BOX_W) E.push(`${field}: the line "${l}" is ${Math.round(width(l))} px wide, maximum ${LINE_MAX} px (Geist 500 14px)`);
  return E;
}

function safeJson(d) { return JSON.stringify(d).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, (c) => '\\u' + c.charCodeAt(0).toString(16)); }
function escHtml(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function fail(lines) { for (const l of lines) console.error(`error: ${l}`); process.exit(1); }
function openInBrowser(file) {
  const cmd = process.platform === 'darwin' ? ['open', [file]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', file]] : ['xdg-open', [file]];
  const noBrowser = (e) => console.error(`could not open a browser (${e.message}). Open the URL above by hand.`);
  // A sandbox can throw from spawn itself (EPERM); a missing opener emits 'error' later. The page is already written, so neither is a failure.
  try {
    const child = spawn(cmd[0], cmd[1], { stdio: 'ignore', detached: true });
    child.on('error', noBrowser);
    child.unref();
  } catch (e) { noBrowser(e); }
}
