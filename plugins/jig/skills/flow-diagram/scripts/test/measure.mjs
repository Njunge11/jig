// Measures Geist 500 14px glyph advances (and the fallback font) with the real web font loaded. Needs the network.
// The source of ../geist-500-14px.json: node measure.mjs > out.json, then copy the `widths.geist` map into `advances`.
import { chromium } from 'playwright';
import fs from 'node:fs';
const html = `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>body{margin:0}.bx{position:absolute;width:132px;height:64px}.lb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;letter-spacing:-.01em;font-family:'Geist',system-ui,sans-serif}</style>
</head><body><div class="bx"><span class="lb" id="lb"></span></div></body></html>`;
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent(html, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.load('500 14px Geist'));
await p.evaluate(() => document.fonts.ready);
const res = await p.evaluate(() => {
  const c = document.createElement('canvas').getContext('2d');
  const widths = {};
  const chars = [];
  for (let i = 32; i < 127; i++) chars.push(String.fromCharCode(i));
  for (const ch of ['→', '—', '–', '’', '‘', '“', '”', '…', '×', '·']) chars.push(ch);
  const measure = (font) => {
    c.font = font;
    const w = {};
    for (const ch of chars) w[ch] = c.measureText(ch).width;
    return w;
  };
  const geistLoaded = document.fonts.check('500 14px Geist');
  widths.geist = measure("500 14px 'Geist'");
  widths.fallback = measure('500 14px system-ui');
  // reference labels and kerning check
  const refs = ['You type a URL', 'DNS lookup', 'Handshake', 'HTTP request', 'Server responds', 'Browser parses', 'Page painted'];
  const check = refs.map((s) => {
    c.font = "500 14px 'Geist'";
    const real = c.measureText(s).width;
    const sum = [...s].reduce((a, ch) => a + (widths.geist[ch] || 0), 0);
    return { s, real, sum, ls: real - 0.14 * s.length };
  });
  // how the real box wraps: count line boxes for a few strings
  const lb = document.getElementById('lb');
  const wrap = (s) => {
    lb.textContent = s;
    const r = document.createRange();
    r.selectNodeContents(lb);
    const rects = [...r.getClientRects()];
    const lines = new Set(rects.map((x) => Math.round(x.top))).size;
    return { s, lines, overflow: lb.scrollWidth > lb.clientWidth + 0.5, scrollWidth: lb.scrollWidth, textWidth: Math.max(...rects.map((x) => x.width)), lineHeightPx: rects[0]?.height };
  };
  const wraps = ['Server responds', 'Authorize the request', 'Write the order row and release the stock', 'Supercalifragilisticexpialidocious', 'Validate input', 'Send confirmation email'].map(wrap);
  return { geistLoaded, widths, check, wraps };
});
console.log(JSON.stringify({ geistLoaded: res.geistLoaded, check: res.check, wraps: res.wraps }, null, 1));
console.log(JSON.stringify(res.widths));
await b.close();
