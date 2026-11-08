// Runs the whole test suite of the flow-diagram template: fixtures, three static servers, the Playwright suites.
// node run.mjs [suite]   suite: render | regress | random | frame | deps | narrow | nav | all (default)
// Needs: npm install in this folder (playwright, dev only), then npx playwright install chromium.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';

const here = new URL('./', import.meta.url).pathname;
const WORK = process.env.FLOW_TEST_DIR || path.join(os.tmpdir(), 'flow-diagram-test');
fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(path.join(WORK, 'fx'), { recursive: true });
const env = { ...process.env, FLOW_TEST_DIR: WORK };

const fx = spawnSync('node', [here + 'fixtures.mjs'], { env, stdio: 'inherit' });
if (fx.status !== 0) process.exit(fx.status ?? 1);

const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:";
const STRICT = "default-src 'self'";
const servers = [];
const serve = async (csp) => {
  const port = await freePort();
  const args = [here + 'serve.mjs', path.join(WORK, 'fx'), String(port)];
  if (csp) args.push(csp);
  const child = spawn('node', args, { stdio: ['ignore', 'pipe', 'inherit'] });
  servers.push(child);
  await new Promise((res) => child.stdout.once('data', res));
  return `http://127.0.0.1:${port}`;
};
env.HTTP_BASE = await serve();
env.HTTP_CSP = await serve(CSP);
env.HTTP_STRICT = await serve(STRICT);

const t = spawnSync('node', [here + 'test.mjs', process.argv[2] || 'all'], { env, stdio: 'inherit' });
for (const s of servers) s.kill();
console.log(`screenshots and results: ${path.join(WORK, 'shots')}`);
process.exit(t.status ?? 1);
