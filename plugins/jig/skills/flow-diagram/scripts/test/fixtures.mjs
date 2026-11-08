// Writes the edge-case fixtures (JSON) into $FLOW_TEST_DIR/fx and builds each valid one to HTML. node fixtures.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import os from 'node:os';
const WORK = process.env.FLOW_TEST_DIR || path.join(os.tmpdir(), 'flow-diagram-test');
const FX = path.join(WORK, 'fx') + path.sep;
fs.mkdirSync(FX, { recursive: true });
const BUILD = new URL('../build.mjs', import.meta.url).pathname;
// ref7 is the reference page's content (the seven steps of a page load) as a data file
const ref = JSON.parse(fs.readFileSync(new URL('./fixtures/ref7.json', import.meta.url), 'utf8'));

const card = (i, extra = {}) => ({
  label: `Step ${i}`,
  title: `Title of step ${i}`,
  summary: `This card explains step ${i} of the process in one short sentence.`,
  items: [
    { heading: 'What happens', text: `The system does the work of step ${i}.` },
    { heading: 'Why', text: 'The next step needs this result.' },
  ],
  ...extra,
});
const base = (title, n, mode = 'system') => ({
  title,
  mode,
  intro: 'Click the outlined box to go to the next step. Open "How it works" for the detail.',
  start: { title: 'Start here', summary: 'Click the outlined box to follow the process.' },
  end: { title: 'Done', summary: `${n} steps. Click any box to see it again.` },
  steps: [{ label: 'Entry point' }, ...Array.from({ length: n - 1 }, (_, k) => card(k + 2))],
});

const F = {};
F.s1 = base('One step', 1);
F.s2 = base('Two steps', 2);
F.s4 = base('Four steps', 4);
F.s5 = base('Five steps', 5);
F.s8 = base('Eight steps', 8);
F.s15 = base('Fifteen steps', 15);
F.s17 = base('Seventeen steps', 17);
F.noitems = base('No items', 3);
delete F.noitems.steps[1].items; // omitted
F.noitems.steps[2].items = []; // empty
F.items12 = base('Many items', 3);
F.items12.steps[1].items = Array.from({ length: 13 }, (_, k) => ({ heading: `Detail ${k + 1}`, text: `Detail ${k + 1} of this step is stated here in one sentence.` }));
F.longtext = base('Long text', 3);
F.longtext.steps[1].summary = Array.from({ length: 4 }, (_, k) => `Sentence ${k + 1} of the summary has enough words to reach the limit of the rule but not more than that, so it passes.`).join(' ');
F.longtext.steps[1].items[0].text = Array.from({ length: 12 }, (_, k) => `Sentence ${k + 1} of this item gives one fact about the step and stays under the limit of the rule.`).join(' ');
F.longtext.steps[2].items[0].heading = 'A heading that is long enough to wrap onto a second line inside the card body';
F.special = base('Special <chars> & "quotes"', 3);
F.special.steps[1].label = 'Tags <b>&</b>';
F.special.steps[1].title = 'Title with <script> & "quotes" \'single\' — dash → arrow';
F.special.steps[1].summary = 'Non-ASCII text: café, naïve, 日本語, emoji 🚀, and an ampersand & a <tag>.';
F.special.steps[1].items[0].heading = 'Heading with </script> inside';
F.special.steps[1].items[0].text = 'Text with <b>bold</b>, & entities, "quotes", \'apostrophes\' and </script>.';
F.special.steps[1].example = '</script><script>alert(1)</script>\n<!-- comment -->\nif (a < b && c > d) { return "ok"; }\nconst s = \'single\' + `backtick`;\n日本語 → ✓ € £ ¥   line-sep';
F.longline = base('Long code line', 2);
F.longline.steps[1].example = 'SELECT ' + Array.from({ length: 40 }, (_, k) => `column_${k}`).join(', ') + ' FROM a_very_long_table_name WHERE id = 1;';
F.code = base('How an order is cancelled', 4, 'code');
F.code.start.summary = 'The procedure orders.cancel starts the path (features/orders/api/orders.router.ts:12).';
F.code.steps[1] = card(2, { label: 'Load the order', title: 'The service reads the order row', summary: 'cancelOrder reads the order by id (features/orders/api/orders.service.ts:18).', items: [{ heading: 'Read', text: 'ordersRepo.byId runs one SELECT (features/orders/db/orders.repo.ts:9).' }] });
F.code.steps[2] = card(3, { label: 'Delete the row', title: 'The service deletes the order', summary: 'The service deletes the order row with no confirmation step (features/orders/api/orders.service.ts:24).', items: [{ heading: 'Irreversible delete', text: 'ordersRepo.remove runs DELETE with no soft-delete flag and no undo (features/orders/db/orders.repo.ts:21). The row is gone for good.' }] });
F.code.steps[3] = card(4, { label: 'Send the email', title: 'The service emails the customer', summary: 'email.send goes to an external provider (lib/email.ts:7).', items: [{ heading: 'No retry', text: 'A failed send throws and the procedure returns an error after the delete (features/orders/api/orders.service.ts:30).' }] });

// invalid fixtures: each must fail validation
const BAD = {};
BAD.labellong = base('Label too long', 2); BAD.labellong.steps[1].label = 'Supercalifragilisticexpialidocious';
BAD.label3lines = base('Label three lines', 2); BAD.label3lines.steps[1].label = 'Write the order row and release the stock';
BAD.labelwide = base('Label wide line', 2); BAD.labelwide.steps[1].label = 'Acknowledgements processed'; // two words, each line wide
BAD.ste30 = base('STE 30 words', 2); BAD.ste30.steps[1].summary = 'This summary sentence goes on and on with many words so that it passes the limit of twenty five words that the rule gives for a descriptive sentence and fails.';
BAD.semicolon = base('Semicolon', 2); BAD.semicolon.steps[1].summary = 'First part; second part.';
BAD.intro21 = base('Intro 21', 2); BAD.intro21.intro = 'Click the outlined box to go to the next step and then open the How it works panel to read every detail of it.';
BAD.nocite = base('No cite', 2, 'code'); BAD.nocite.start.summary = 'The procedure starts here (features/orders/api/orders.router.ts:12).';
BAD.firstcard = base('First has card', 2); BAD.firstcard.steps[0].title = 'Not allowed';
BAD.nosteps = base('No steps', 1); BAD.nosteps.steps = [];
BAD.badmode = base('Bad mode', 2); BAD.badmode.mode = 'flow';
// label at the limit: should pass
F.labelmax = base('Label at the limit', 2); F.labelmax.steps[1].label = 'Send confirmation email';

const report = [];
F.ref7 = ref;
for (const [k, v] of Object.entries(F)) {
  fs.writeFileSync(`${FX}${k}.json`, JSON.stringify(v, null, 1));
  try {
    const out = execFileSync('node', [BUILD, `${FX}${k}.json`, '--force'], { encoding: 'utf8' });
    report.push(`${k}: built`);
  } catch (e) { report.push(`${k}: BUILD FAILED\n${e.stderr}`); }
}
for (const [k, v] of Object.entries(BAD)) {
  fs.writeFileSync(`${FX}bad-${k}.json`, JSON.stringify(v, null, 1));
  try {
    execFileSync('node', [BUILD, `${FX}bad-${k}.json`, '--check'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    report.push(`bad-${k}: UNEXPECTED PASS`);
  } catch (e) { report.push(`bad-${k}: rejected -> ${e.stderr.trim().split('\n')[0]}`); }
}
// --open when the browser cannot be spawned (the eval sandbox threw EPERM from spawn): the page is written and the exit code is 0
{
  const r = spawnSync('node', ['-r', new URL('./no-spawn.cjs', import.meta.url).pathname, BUILD, `${FX}s2.json`, '--force', '--open'], { encoding: 'utf8' });
  const ok = r.status === 0 && /^wrote /m.test(r.stdout) && /could not open a browser/.test(r.stderr);
  report.push(`open-no-browser: ${ok ? 'exit 0, wrote, warned' : 'FAILED status ' + r.status + ' ' + r.stderr.slice(0, 200)}`);
  if (!ok) process.exitCode = 1;
}
// variants of ref7 for the dependency tests
execFileSync('node', [BUILD, `${FX}ref7.json`, '--force', '--motion', 'cdn', '--out', `${FX}ref7-cdn.html`]);
execFileSync('node', [BUILD, `${FX}ref7.json`, '--force', '--motion', 'none', '--out', `${FX}ref7-nomotion.html`]);
report.push('ref7-cdn, ref7-nomotion: built');
console.log(report.join('\n'));
