import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';

const root = fileURLToPath(new URL('../', import.meta.url));
const backend = path.join(root, 'backend');
const frontend = path.join(root, 'frontend');
const require = createRequire(path.join(backend, 'package.json'));
const dotenv = require('dotenv');
const config = dotenv.parse(fs.readFileSync(path.join(backend, '.env')));
const frontConfig = dotenv.parse(fs.readFileSync(path.join(frontend, '.env')));
const logs = path.join(os.tmpdir(), 'rfitness-local');
const container = 'node-js-final-2026-postgres-1';

async function healthy(url) {
  try { return (await fetch(url, { signal: AbortSignal.timeout(1500) })).ok; }
  catch { return false; }
}
function occupied(port) {
  return new Promise(resolve => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.setTimeout(1500);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
  });
}
function launch(name, cwd, args, extraEnv = {}) {
  fs.mkdirSync(logs, { recursive: true });
  const out = fs.openSync(path.join(logs, `${name}.out.log`), 'a');
  const err = fs.openSync(path.join(logs, `${name}.err.log`), 'a');
  const child = spawn(process.execPath, args, {
    cwd, env: { ...process.env, ...extraEnv }, detached: true,
    windowsHide: true, stdio: ['ignore', out, err],
  });
  child.on('error', error => { console.error(`${name}: ${error.message}`); process.exitCode = 1; });
  child.unref();
  fs.closeSync(out); fs.closeSync(err);
  console.log(`${name} started (PID ${child.pid}).`);
}
async function waitUntil(check, label) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`${label} did not become ready. See logs: ${logs}`);
}
async function main() {
  if (!['localhost', '127.0.0.1'].includes(config.DB_HOST) || config.DB_PORT !== '5433' || config.DB_DATABASE !== 'fitness' || config.PORT !== '8080') {
    throw new Error('This launcher expects the existing localhost:5433/fitness database and API port 8080. No configuration was changed.');
  }
  if (frontConfig.VITE_API_BASE_URL !== 'http://127.0.0.1:8080/api/') throw new Error('Frontend API URL does not match the local backend.');
  const inspect = JSON.parse(execFileSync('docker', ['inspect', container], { encoding: 'utf8', windowsHide: true }))[0];
  if (!inspect.Mounts.some(m => m.Name === 'node-js-final-2026_pgData')) throw new Error('Expected database volume missing.');
  if (!inspect.State.Running) execFileSync('docker', ['start', container], { stdio: 'inherit', windowsHide: true });
  await waitUntil(async () => {
    try { execFileSync('docker', ['exec', container, 'pg_isready'], { stdio: 'ignore', windowsHide: true }); return true; }
    catch { return false; }
  }, 'PostgreSQL');
  const healthUrl = 'http://127.0.0.1:8080/healthcheck';
  if (!await healthy(healthUrl)) {
    if (await occupied(8080)) throw new Error('Port 8080 is occupied but its database health check fails; existing process left untouched.');
    launch('backend', backend, [path.join(backend, 'bin/www.js')], { DB_SYNCHRONIZE: 'false' });
    await waitUntil(() => healthy(healthUrl), 'Backend');
  }
  const siteUrl = 'http://127.0.0.1:5174/';
  if (!await healthy(siteUrl)) {
    if (await occupied(5174)) throw new Error('Port 5174 is occupied; existing process left untouched.');
    launch('frontend', frontend, [path.join(frontend, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5174', '--strictPort']);
    await waitUntil(() => healthy(siteUrl), 'Frontend');
  }
  console.log(`Ready: ${siteUrl}\nAPI: ${healthUrl}\nLogs: ${logs}\nNo database reset, seed, or schema synchronization was performed.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
