// Tiny static server for the fixtures. node serve.mjs <dir> <port> [csp]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [dir, port, csp] = process.argv.slice(2);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
http.createServer((req, res) => {
  const f = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('404'); return; }
  const h = { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' };
  if (csp) h['Content-Security-Policy'] = csp;
  res.writeHead(200, h);
  fs.createReadStream(f).pipe(res);
}).listen(+port, '127.0.0.1', () => console.log(`serving ${dir} on http://127.0.0.1:${port}${csp ? ' with CSP ' + csp : ''}`));
