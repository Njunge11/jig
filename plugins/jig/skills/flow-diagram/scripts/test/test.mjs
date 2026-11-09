// Playwright tests for the flow-diagram template. Run through run.mjs, which builds the fixtures and starts the servers.
// node test.mjs [render|regress|random|frame|deps|narrow|nav|all]  (env: FLOW_TEST_DIR, HTTP_BASE, HTTP_CSP, HTTP_STRICT, ONLY)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const WORK = process.env.FLOW_TEST_DIR || path.join(os.tmpdir(), 'flow-diagram-test');
const FX = path.join(WORK, 'fx') + path.sep;
const SHOTS = path.join(WORK, 'shots') + path.sep;
fs.mkdirSync(SHOTS, { recursive: true });
const which = process.argv[2] || 'all';
const HTTP = process.env.HTTP_BASE || 'http://127.0.0.1:8765'; // serve.mjs, no CSP
const HTTP_CSP = process.env.HTTP_CSP || 'http://127.0.0.1:8766'; // serve.mjs, CSP that blocks third parties
const HTTP_STRICT = process.env.HTTP_STRICT || 'http://127.0.0.1:8767'; // serve.mjs, default-src 'self'
const results = [];
const rec = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };
const fileUrl = (f) => pathToFileURL(FX + f).href;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();

async function open(url, { dark = false, reduce = false, blockNet = false, viewport = { width: 1000, height: 2200 } } = {}) {
  const ctx = await browser.newContext({ colorScheme: dark ? 'dark' : 'light', reducedMotion: reduce ? 'reduce' : 'no-preference', viewport });
  const page = await ctx.newPage();
  const errors = [];
  const blocked = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  if (blockNet) await page.route(/^https?:\/\//, (r) => { blocked.push(r.request().url()); r.abort('internetdisconnected'); });
  await page.goto(url);
  await page.waitForFunction(() => typeof allN !== 'undefined' && typeof act !== 'undefined');
  await settle(page);
  return { page, ctx, errors, blocked };
}
async function settle(page) {
  await page.waitForFunction(() => act === null, null, { timeout: 8000 });
  await sleep(120);
}
const state = (page) => page.evaluate(() => ({ cur, max, done, keep, nom: NOM, reduce, shown: shown ? allN.indexOf(shown) : -1, open: shown ? shown.open : null, steps: L.length }));

const invariants = (page) => page.evaluate(() => {
  const E = [];
  const cs = (el) => getComputedStyle(el);
  const norm = (v) => { const e = document.createElement('div'); e.style.clipPath = v; return e.style.clipPath; };
  if (!shown) E.push('no shown card');
  else {
    const n = shown;
    if (cs(n.el).visibility !== 'visible') E.push('shown card visibility ' + cs(n.el).visibility);
    if (+cs(n.wr).opacity < 0.99) E.push('shown card opacity ' + cs(n.wr).opacity);
    const hasOpen = n.el.classList.contains('open'), hasXp = n.el.classList.contains('xp');
    if (n.open !== hasOpen || n.open !== hasXp) E.push(`open state mismatch: open=${n.open} class.open=${hasOpen} class.xp=${hasXp}`);
    const h = (n.open ? n.cd : n.ca).getBoundingClientRect().height;
    if (h < 40) E.push('card height ' + h);
    if (!n.open && +cs(n.ca).opacity < 0.99) E.push('closed card header opacity ' + cs(n.ca).opacity);
    if (n.cb && n.open && cs(n.cb).display === 'none') E.push('open card body display none');
    if (n.cb && !n.open && cs(n.cb).display !== 'none') E.push('closed card body display ' + cs(n.cb).display);
    if (!n.open && n.cd.style.clipPath !== norm(clipC(n))) E.push(`closed clip "${n.cd.style.clipPath}" != "${clipC(n)}"`);
    if (n.open && n.cd.style.clipPath !== norm(FULL)) E.push(`open clip "${n.cd.style.clipPath}" != "${norm(FULL)}"`);
    const tt = n.ca.querySelector('.tt').textContent, ds = n.ca.querySelector('.ds').textContent;
    if (!tt.trim() || tt === 'undefined' || !ds.trim() || ds === 'undefined') E.push(`card text missing: title "${tt}" summary "${ds}"`);
    if (n.cb) { const lis = [...n.cb.querySelectorAll('li')]; if (lis.some((li) => /undefined/.test(li.textContent))) E.push('an item reads undefined'); }
  }
  const b = boxes[cur];
  if (+cs(b.el).opacity < 0.99) E.push('current box opacity ' + cs(b.el).opacity);
  if (cs(b.el).visibility !== 'visible') E.push('current box hidden');
  if (!done) {
    if (+cs(b.rg).opacity < 0.99) E.push('ring opacity ' + cs(b.rg).opacity);
    if (cs(b.rg).visibility !== 'visible') E.push('ring hidden');
  }
  boxes.forEach((bb, i) => {
    if (i <= max) {
      const m = new DOMMatrix(cs(bb.el).transform);
      if (Math.abs(m.a - 1) > 0.02 || Math.abs(m.d - 1) > 0.02) E.push(`box ${i} scale ${m.a.toFixed(3)},${m.d.toFixed(3)}`);
      if (cs(bb.el).visibility !== 'visible') E.push(`box ${i} <= max but hidden`);
      if (i !== cur && !done && cs(bb.rg).visibility !== 'hidden') E.push(`ring ${i} not hidden`);
    } else if (cs(bb.el).visibility !== 'hidden' || +cs(bb.el).opacity > 0.01) E.push(`box ${i} past max is visible (vis ${cs(bb.el).visibility}, op ${cs(bb.el).opacity})`);
    const lb = bb.el.querySelector('.lb');
    if (lb.scrollWidth > lb.clientWidth + 1) E.push(`label ${i} overflows (${lb.scrollWidth} > ${lb.clientWidth})`);
  });
  allN.forEach((o, i) => { if (o !== shown && cs(o.el).visibility !== 'hidden') E.push(`card ${i} not hidden`); });
  arrows.forEach((o) => { if (!o.drawn) o.segs.concat(o.hd).forEach((e) => { if (cs(e).visibility !== 'hidden') E.push(`arrow ${o.k} undrawn but visible`); }); });
  const se = document.scrollingElement;
  if (se.scrollWidth > se.clientWidth + 1) E.push(`horizontal overflow ${se.scrollWidth} > ${se.clientWidth}`);
  return E;
});

async function rectOf(page, expr) {
  return page.evaluate((expr) => {
    const el = eval(expr);
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, pe: getComputedStyle(el).pointerEvents, vis: getComputedStyle(el).visibility };
  }, expr);
}
async function click(page, expr) {
  const r = await rectOf(page, expr);
  if (!r) return false;
  await page.mouse.click(r.x, r.y);
  return true;
}
// next: the current box; back: the box before it (the bar has no Back or Next button)
const EXPR = { next: 'boxes[cur].el', back: 'boxes[Math.max(0, cur - 1)].el', keep: "document.getElementById('kp')", replay: "document.getElementById('rp')", how: "shown && shown.el.querySelector(shown.open ? '.cb .mo' : '.ca .mo')", box: (i) => `boxes[${i}].el`, curBox: 'boxes[cur].el' };

async function shot(page, name) { await page.screenshot({ path: SHOTS + name + '.png', fullPage: true }); }

// ---------- A. render every fixture, light and dark ----------
async function render() {
  const fixtures = fs.readdirSync(FX).filter((f) => f.endsWith('.html') && !f.startsWith('bad-') && (!process.env.ONLY || f.startsWith(process.env.ONLY)));
  for (const f of fixtures) for (const dark of [false, true]) {
    const name = f.replace('.html', '') + (dark ? '-dark' : '-light');
    const { page, ctx, errors } = await open(fileUrl(f), { dark });
    const fails = [];
    const st = await state(page);
    fails.push(...(await invariants(page)).map((e) => 'init: ' + e));
    await shot(page, `${name}-0`);
    const midOpened = await page.evaluate(() => { let best = Math.max(1, Math.floor(L.length / 2)), n = -1; N.forEach((c, i) => { const k = c.s ? c.s.length : 0; if (k > n) { n = k; best = i + 1; } }); return best; });
    for (let i = 0; i < st.steps; i++) {
      await click(page, EXPR.curBox); // the active box advances
      await settle(page);
      const inv = await invariants(page);
      fails.push(...inv.map((e) => `after click ${i + 1}: ${e}`));
      const s = await state(page);
      if (i === midOpened && s.shown >= 0) {
        const has = await click(page, EXPR.how);
        if (has) { await settle(page); fails.push(...(await invariants(page)).map((e) => `open at ${i + 1}: ${e}`)); await shot(page, `${name}-open`); await click(page, EXPR.how); await settle(page); fails.push(...(await invariants(page)).map((e) => `close at ${i + 1}: ${e}`)); }
      }
      if (i === st.steps - 2 || i === 2) await shot(page, `${name}-${i + 1}`);
    }
    const end = await state(page);
    if (!end.done) fails.push(`not done after ${st.steps} clicks (cur ${end.cur})`);
    await shot(page, `${name}-done`);
    fails.push(...errors.map((e) => 'console: ' + e));
    rec(`render ${name}`, fails.length === 0, fails.slice(0, 4).join(' | '));
    await ctx.close();
  }
}

// ---------- B. regression tests for the four fixes ----------
async function regress() {
  // 1. clip race
  {
    const { page, ctx, errors } = await open(fileUrl('ref7.html'));
    await click(page, EXPR.curBox); await settle(page); // step 2: a card with items
    const fails = [];
    for (const gap of [40, 120, 200, 280]) {
      await click(page, EXPR.how); await sleep(gap); await click(page, EXPR.how); // interrupt the open with a close
      await settle(page);
      fails.push(...(await invariants(page)).map((e) => `open+close@${gap}ms: ${e}`));
    }
    // open, then Next during the open animation, then Back
    await click(page, EXPR.how); await sleep(90); await click(page, EXPR.next); await settle(page);
    fails.push(...(await invariants(page)).map((e) => `open+next: ${e}`));
    await click(page, EXPR.back); await settle(page);
    fails.push(...(await invariants(page)).map((e) => `open+next+back: ${e}`));
    // open fully, close, and compare the clip rect against the header rect in both layouts
    await click(page, EXPR.how); await settle(page); await click(page, EXPR.how); await settle(page);
    const geom = await page.evaluate(() => {
      const n = shown; const cd = n.cd.getBoundingClientRect(); const ca = n.ca.getBoundingClientRect();
      const m = n.cd.style.clipPath.match(/inset\(0px ([\d.]+)px calc\(100% - ([\d.]+)px\) ([\d.]+)px/);
      const right = +m[1], bottom = +m[2], left = +m[3];
      return { caLeft: ca.left - cd.left, caRight: cd.right - ca.right, caH: ca.height, left, right, visibleH: bottom, clip: n.cd.style.clipPath };
    });
    if (Math.abs(geom.caLeft - geom.left) > 0.6 || Math.abs(geom.caRight - geom.right) > 0.6 || Math.abs(geom.caH - geom.visibleH) > 0.6) fails.push(`closed clip does not frame the header: ${JSON.stringify(geom)}`);
    fails.push(...errors.map((e) => 'console: ' + e));
    rec('regress 1 clip race (one clip value for both layouts)', fails.length === 0, fails.slice(0, 3).join(' | ') || geom.clip);
    await ctx.close();
  }
  // 2. interrupted transform reads as zero
  {
    const { page, ctx, errors } = await open(fileUrl('ref7.html'));
    const fails = [];
    for (const gap of [30, 80, 150]) {
      await click(page, EXPR.next); await sleep(gap); await click(page, EXPR.next); await settle(page);
      fails.push(...(await invariants(page)).map((e) => `next+next@${gap}ms: ${e}`));
    }
    // back during a forward draw, and the row-break arrow (step 4 -> 5)
    await click(page, EXPR.next); await sleep(60); await click(page, EXPR.back); await settle(page);
    fails.push(...(await invariants(page)).map((e) => `next+back: ${e}`));
    // button press interrupted mid-animation
    for (const hold of [20, 60, 120]) {
      const r = await rectOf(page, EXPR.replay);
      await page.mouse.move(r.x, r.y); await page.mouse.down(); await sleep(hold); await page.mouse.up(); await sleep(350);
      const sc = await page.evaluate(() => { const t = getComputedStyle(document.getElementById('rp')).transform; return t === 'none' ? 1 : new DOMMatrix(t).a; });
      if (Math.abs(sc - 1) > 0.01) fails.push(`button scale after press held ${hold}ms: ${sc}`);
    }
    await settle(page);
    fails.push(...(await invariants(page)).map((e) => `after presses: ${e}`));
    fails.push(...errors.map((e) => 'console: ' + e));
    rec('regress 2 interrupted transform keeps scale 1', fails.length === 0, fails.slice(0, 3).join(' | '));
    await ctx.close();
  }
  // 3. font load must not cancel the pulse
  {
    const { page, ctx, errors } = await open(fileUrl('ref7.html'));
    const fails = [];
    const fontsOk = await page.evaluate(() => document.fonts.ready.then(() => document.fonts.check('500 14px Geist')));
    const a = await page.evaluate(() => ({ pul: !!pul, vis: getComputedStyle(boxes[cur].pl).visibility, op: +getComputedStyle(boxes[cur].pl).opacity }));
    await sleep(500);
    const b = await page.evaluate(() => ({ pul: !!pul, op: +getComputedStyle(boxes[cur].pl).opacity, anims: boxes[cur].pl.getAnimations().length }));
    if (!a.pul || !b.pul) fails.push('no pulse animation object after fonts.ready');
    if (a.vis !== 'visible') fails.push('pulse ring hidden');
    if (b.anims < 1) fails.push('pulse element has no running animation');
    if (Math.abs(a.op - b.op) < 0.01) fails.push(`pulse opacity static at ${a.op}`);
    fails.push(...errors.map((e) => 'console: ' + e));
    rec('regress 3 pulse runs after fonts.ready', fails.length === 0, fails.join(' | ') || `fonts loaded: ${fontsOk}, opacity ${a.op.toFixed(2)} -> ${b.op.toFixed(2)}`);
    await ctx.close();
  }
  // 4. hidden content is visibility:hidden / display:none (no overlap layers)
  {
    const { page, ctx, errors } = await open(fileUrl('ref7.html'));
    await click(page, EXPR.next); await settle(page); await click(page, EXPR.next); await settle(page);
    const fails = await page.evaluate(() => {
      const E = []; const cs = (el) => getComputedStyle(el);
      allN.forEach((o, i) => { if (o !== shown && cs(o.el).visibility !== 'hidden') E.push(`card ${i} visibility ${cs(o.el).visibility}`); });
      if (shown.cb && cs(shown.cb).display !== 'none') E.push('closed card body is display ' + cs(shown.cb).display);
      boxes.forEach((b, i) => { if (!b.on && cs(b.el).visibility !== 'hidden') E.push(`box ${i} off but visibility ${cs(b.el).visibility}`); if (i !== cur && (cs(b.rg).visibility !== 'hidden' || cs(b.pl).visibility !== 'hidden')) E.push(`ring/pulse ${i} visible`); });
      arrows.forEach((o) => { if (!o.drawn) o.segs.concat(o.hd).forEach((e) => { if (cs(e).visibility !== 'hidden') E.push(`arrow ${o.k} visible`); }); });
      return E;
    });
    fails.push(...errors.map((e) => 'console: ' + e));
    rec('regress 4 hidden content uses visibility:hidden / display:none', fails.length === 0, fails.slice(0, 3).join(' | '));
    await ctx.close();
  }
}

// ---------- C. random clicks with a fixed seed ----------
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
async function random(fixture = 'ref7.html', seed = 42, n = 300) {
  const { page, ctx, errors } = await open(fileUrl(fixture));
  const rnd = mulberry32(seed);
  const fails = [];
  const counts = {};
  let slow = 0;
  for (let i = 0; i < n; i++) {
    const r = rnd();
    const st = await state(page);
    let action;
    if (r < 0.3) action = 'next'; else if (r < 0.5) action = 'back'; else if (r < 0.58) action = 'keep'; else if (r < 0.63) action = 'replay'; else if (r < 0.8) action = 'how'; else action = 'box';
    counts[action] = (counts[action] || 0) + 1;
    if (action === 'box') { const idx = Math.floor(rnd() * (Math.min(st.max + 1, st.steps) + 1)); await click(page, EXPR.box(Math.min(idx, st.steps - 1))); }
    else await click(page, EXPR[action]);
    const isSlow = rnd() < 0.5;
    if (isSlow) {
      slow++;
      await settle(page);
      const inv = await invariants(page);
      if (inv.length) fails.push(`#${i} ${action} (cur ${st.cur} max ${st.max} done ${st.done} open ${st.open}): ${inv.join('; ')}`);
    } else await sleep(15 + Math.floor(rnd() * 60));
  }
  await settle(page);
  fails.push(...(await invariants(page)).map((e) => 'final: ' + e));
  fails.push(...errors.map((e) => 'console: ' + e));
  rec(`random ${n} actions seed ${seed} on ${fixture} (${slow} slow checks)`, fails.length === 0, fails.slice(0, 5).join(' | ') || JSON.stringify(counts));
  await shot(page, `random-${fixture.replace('.html', '')}-final`);
  await ctx.close();
}

// ---------- D. frame test: click the active box, sample every frame ----------
async function frame(fixture = 'ref7.html', stepIndex = 1) {
  const { page, ctx } = await open(fileUrl(fixture));
  for (let i = 0; i < stepIndex; i++) { await click(page, EXPR.curBox); await settle(page); }
  const r = await rectOf(page, EXPR.curBox);
  const sampling = page.evaluate(() => new Promise((res) => {
    const b = boxes[cur], nb = boxes[cur + 1], ar = arrows[cur], nn = notes[cur];
    const cs = getComputedStyle; const F = []; const t0 = performance.now();
    const tick = () => {
      const t = performance.now() - t0; const r = b.el.getBoundingClientRect(); const rr = b.rg.getBoundingClientRect();
      const m = new DOMMatrix(cs(ar.segs[0]).transform);
      F.push({ t: +t.toFixed(1), x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2), ring: +cs(b.rg).opacity, ringX: +rr.x.toFixed(2), ringY: +rr.y.toFixed(2), arrow: ar.same ? m.a : m.d, nextBox: +cs(nb.el).opacity, note: +cs(nn.wr).opacity, boxScale: new DOMMatrix(cs(b.el).transform).a });
      if (t < 1000) requestAnimationFrame(tick); else res({ same: ar.same, F });
    };
    requestAnimationFrame(tick);
  }));
  await sleep(80);
  await page.mouse.click(r.x, r.y);
  const { same, F } = await sampling;
  await ctx.close();
  const fails = [];
  const first = (k, th) => { const f = F.find((x) => x[k] > th); return f ? f.t : null; };
  const xs = F.map((f) => f.x), ys = F.map((f) => f.y), ws = F.map((f) => f.w), hs = F.map((f) => f.h), sc = F.map((f) => f.boxScale);
  const span = (a) => Math.max(...a) - Math.min(...a);
  if (span(xs) > 0.5 || span(ys) > 0.5) fails.push(`box moved: x span ${span(xs).toFixed(2)}, y span ${span(ys).toFixed(2)}`);
  if (span(ws) > 0.5 || span(hs) > 0.5 || span(sc) > 0.005) fails.push(`box scaled: w span ${span(ws).toFixed(2)}, h span ${span(hs).toFixed(2)}, scale span ${span(sc).toFixed(4)}`);
  const ringXs = F.map((f) => f.ringX), ringYs = F.map((f) => f.ringY);
  if (span(ringXs) > 0.5 || span(ringYs) > 0.5) fails.push('ring moved while fading');
  const ringSeq = F.map((f) => f.ring);
  if (ringSeq[0] < 0.99) fails.push(`ring not fully on at start (${ringSeq[0]})`);
  if (ringSeq[ringSeq.length - 1] > 0.01) fails.push(`ring not faded at end (${ringSeq[ringSeq.length - 1]})`);
  for (let i = 1; i < ringSeq.length; i++) if (ringSeq[i] > ringSeq[i - 1] + 0.02) { fails.push(`ring opacity rose at ${F[i].t}ms`); break; }
  const tArrow = first('arrow', 0.5), tBox = first('nextBox', 0.02), tNote = first('note', 0.02);
  if (tArrow == null || tBox == null || tNote == null) fails.push(`missing phase: arrow ${tArrow} box ${tBox} note ${tNote}`);
  else if (!(tArrow < tBox && tBox < tNote)) fails.push(`order wrong: arrow ${tArrow} box ${tBox} note ${tNote}`);
  const last = F[F.length - 1];
  if (last.nextBox < 0.99 || last.note < 0.99) fails.push(`end state: nextBox ${last.nextBox} note ${last.note}`);
  fs.writeFileSync(SHOTS + `frames-${fixture.replace('.html', '')}-${stepIndex}.json`, JSON.stringify(F, null, 0));
  rec(`frame test click active box (${same ? 'same row' : 'row break'}, ${F.length} frames)`, fails.length === 0, fails.join(' | ') || `arrow@${tArrow}ms → box@${tBox}ms → card@${tNote}ms; box rect fixed`);
}

// ---------- E. dependencies: file://, no network, CSP, no Motion, no fonts ----------
async function deps() {
  const walk = async (page) => { const fails = []; const st = await state(page); for (let i = 0; i < st.steps; i++) { await click(page, EXPR.curBox); await settle(page); fails.push(...(await invariants(page)).map((e) => `click ${i + 1}: ${e}`)); } await click(page, EXPR.back); await settle(page); const has = await click(page, EXPR.how); if (has) { await settle(page); fails.push(...(await invariants(page)).map((e) => `open: ${e}`)); } return fails; };
  const fontInfo = (page) => page.evaluate(() => document.fonts.ready.then(() => ({ geist: document.fonts.check('500 14px Geist'), family: getComputedStyle(boxes[0].el.querySelector('.lb')).fontFamily, overflow: boxes.map((b) => b.el.querySelector('.lb')).some((lb) => lb.scrollWidth > lb.clientWidth + 1) })));
  const cases = [
    ['inline motion, file://, network on', fileUrl('ref7.html'), {}, false],
    ['inline motion, file://, network off', fileUrl('ref7.html'), { blockNet: true }, false],
    ['CDN motion, file://, network on', fileUrl('ref7-cdn.html'), {}, false],
    ['CDN motion, file://, network off (NOM fallback)', fileUrl('ref7-cdn.html'), { blockNet: true }, true],
    ['no Motion tag at all (NOM fallback)', fileUrl('ref7-nomotion.html'), {}, true],
    ['inline motion, http, CSP blocks third parties', `${HTTP_CSP}/ref7.html`, {}, false],
    ['CDN motion, http, CSP blocks third parties (NOM fallback)', `${HTTP_CSP}/ref7-cdn.html`, {}, true],
  ];
  for (const [name, url, opts, expectNom] of cases) {
    let ctx;
    try {
      const o = await open(url, opts); ctx = o.ctx;
      const st = await state(o.page);
      const fails = await walk(o.page);
      const fi = await fontInfo(o.page);
      if (st.nom !== expectNom) fails.push(`NOM ${st.nom}, expected ${expectNom}`);
      if (fi.overflow) fails.push('a label overflows its box in the fallback font');
      const realErrors = o.errors.filter((e) => !/Failed to load resource|ERR_INTERNET_DISCONNECTED|Content Security Policy|Refused to load/.test(e));
      fails.push(...realErrors.map((e) => 'console: ' + e));
      await shot(o.page, 'deps-' + name.replace(/[^a-z0-9]+/gi, '-'));
      rec(`deps: ${name}`, fails.length === 0, fails.slice(0, 3).join(' | ') || `NOM=${st.nom}; Geist loaded=${fi.geist}; font=${fi.family.split(',')[0]}; blocked ${o.blocked.length} requests; ${o.errors.length} resource errors`);
    } catch (e) { rec(`deps: ${name}`, false, e.message.split('\n')[0]); }
    if (ctx) await ctx.close();
  }
  // strict CSP (default-src 'self', no inline): documents what happens
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage(); const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${HTTP_STRICT}/ref7.html`); await sleep(500);
    const ran = await page.evaluate(() => typeof window.boxes !== 'undefined' || document.querySelectorAll('.bx').length > 0);
    rec(`deps: strict CSP default-src 'self' (inline script blocked)`, true, `page script ran: ${ran}; ${errors.length} CSP errors; this is a documented limit, not a defect`);
    await ctx.close();
  }
}

// ---------- F. narrow viewport and reduced motion ----------
async function narrow() {
  const { page, ctx, errors } = await open(fileUrl('ref7.html'), { viewport: { width: 360, height: 800 } });
  const fails = [];
  const sc = await page.evaluate(() => ({ sc, transform: document.getElementById('stage').style.transform, fitW: document.getElementById('fit').clientWidth, scrollW: document.scrollingElement.scrollWidth, clientW: document.scrollingElement.clientWidth }));
  if (sc.sc >= 1 || Math.abs(sc.sc - sc.fitW / 680) > 0.01) fails.push(`scale ${sc.sc} for fit width ${sc.fitW}`);
  if (sc.scrollW > sc.clientW) fails.push(`horizontal scroll ${sc.scrollW} > ${sc.clientW}`);
  const st = await state(page);
  for (let i = 0; i < st.steps; i++) { await click(page, EXPR.curBox); await settle(page); fails.push(...(await invariants(page)).map((e) => `click ${i + 1}: ${e}`)); }
  await click(page, EXPR.back); await settle(page); await click(page, EXPR.how); await settle(page);
  fails.push(...(await invariants(page)).map((e) => `open: ${e}`));
  await shot(page, 'narrow-360-open');
  fails.push(...errors.map((e) => 'console: ' + e));
  rec('narrow viewport 360px', fails.length === 0, fails.slice(0, 3).join(' | ') || `stage scale ${sc.sc.toFixed(3)} (${sc.transform}), no horizontal scroll`);
  await ctx.close();
  for (const dark of [false, true]) {
    const o = await open(fileUrl('ref7.html'), { reduce: true, dark });
    const f = [];
    const s0 = await state(o.page);
    if (!s0.reduce) f.push('reduce flag not set');
    const pulse = await o.page.evaluate(() => ({ pul: !!pul, pl: getComputedStyle(boxes[0].pl).opacity }));
    if (pulse.pul) f.push('pulse runs under reduced motion');
    for (let i = 0; i < s0.steps; i++) { await click(o.page, EXPR.curBox); await settle(o.page); f.push(...(await invariants(o.page)).map((e) => `click ${i + 1}: ${e}`)); }
    await click(o.page, EXPR.back); await settle(o.page); await click(o.page, EXPR.how); await settle(o.page);
    f.push(...(await invariants(o.page)).map((e) => `open: ${e}`));
    await shot(o.page, `reduced-motion-${dark ? 'dark' : 'light'}`);
    f.push(...o.errors.map((e) => 'console: ' + e));
    rec(`prefers-reduced-motion: reduce (${dark ? 'dark' : 'light'})`, f.length === 0, f.slice(0, 3).join(' | '));
    await o.ctx.close();
  }
}

// ---------- G. navigation semantics: keep toggle, replay, open/close across steps ----------
async function nav() {
  const { page, ctx, errors } = await open(fileUrl('ref7.html'));
  const fails = [];
  const go = async (expr, label) => { await click(page, expr); await settle(page); const inv = await invariants(page); if (inv.length) fails.push(`${label}: ${inv.join('; ')}`); return state(page); };
  let s;
  for (let i = 0; i < 4; i++) s = await go(EXPR.next, `next ${i + 1}`);
  if (s.cur !== 4 || s.max !== 4) fails.push(`after 4 next: cur ${s.cur} max ${s.max}`);
  s = await go(EXPR.back, 'back with keep on');
  if (s.cur !== 3 || s.max !== 4) fails.push(`keep on: back should keep max 4, got cur ${s.cur} max ${s.max}`);
  s = await go(EXPR.keep, 'toggle keep off');
  if (s.keep !== false || s.max !== 3) fails.push(`keep off should retract to cur: cur ${s.cur} max ${s.max} keep ${s.keep}`);
  s = await go(EXPR.back, 'back with keep off');
  if (s.cur !== 2 || s.max !== 2) fails.push(`keep off: back should retract, got cur ${s.cur} max ${s.max}`);
  s = await go(EXPR.keep, 'toggle keep on');
  s = await go(EXPR.how, 'open how it works');
  if (!s.open) fails.push('card did not open');
  s = await go(EXPR.next, 'next while open');
  if (s.open) fails.push('new card should be closed');
  s = await go(EXPR.back, 'back to the card that was open');
  if (s.open) fails.push('returned card should be closed');
  s = await go(EXPR.replay, 'replay');
  if (s.cur !== 0 || s.max !== 0 || s.done || s.shown !== s.steps - 1) fails.push(`replay: cur ${s.cur} max ${s.max} done ${s.done} shown ${s.shown}`);
  for (let i = 0; i < s.steps; i++) s = await go(EXPR.curBox, `box ${i + 1}`);
  if (!s.done) fails.push('not done after clicking every box');
  s = await go(EXPR.box(2), 'box click when done');
  if (s.done || s.cur !== 2) fails.push(`box click when done: cur ${s.cur} done ${s.done}`);
  // 10 fast clicks in 1 second on the current box, the box before it, and a box
  for (const [expr, label] of [[EXPR.next, 'next'], [EXPR.back, 'back'], [EXPR.box(1), 'box 1']]) {
    for (let i = 0; i < 10; i++) { await click(page, expr); await sleep(85); }
    await settle(page);
    const inv = await invariants(page);
    if (inv.length) fails.push(`10 fast ${label}: ${inv.join('; ')}`);
  }
  fails.push(...errors.map((e) => 'console: ' + e));
  rec('navigation: keep toggle, replay, open/close across steps, fast clicks', fails.length === 0, fails.slice(0, 4).join(' | '));
  await ctx.close();
}

const run = { render, regress, random: () => random(), frame: async () => { await frame('ref7.html', 1); await frame('ref7.html', 3); await frame('s15.html', 7); }, deps, narrow, nav };
if (which === 'all') for (const k of Object.keys(run)) await run[k](); else await run[which]();
await browser.close();
fs.writeFileSync(SHOTS + `results-${which}.json`, JSON.stringify(results, null, 1));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
