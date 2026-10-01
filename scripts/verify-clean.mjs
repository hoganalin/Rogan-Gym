import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

// Copy current sources (including uncommitted work), never local secrets or installed dependencies.
const root = fileURLToPath(new URL('../', import.meta.url));
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'rfitness-clean-'));
const app = path.join(workspace, 'app');
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Run this script via npm run verify:clean.');
const container = `rfitness-regression-${Date.now()}`;
const report = { startedAt: new Date().toISOString(), node: process.version, workspace, stages: [] };
let backend;
let containerCreated = false;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
async function run(label, command, args, cwd = app, env = {}) {
  console.log(`\n[${label}]`);
  const logPath = path.join(workspace, `${label}.log`);
  const log = fs.openSync(logPath, 'a');
  const start = Date.now();
  try {
    const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, windowsHide: true, stdio: ['ignore', log, log] });
    const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve); });
    report.stages.push({ label, code, seconds: (Date.now() - start) / 1000, logPath });
    console.log(fs.readFileSync(logPath, 'utf8').slice(-1400));
    if (code !== 0) throw new Error(`${label} failed (${code}). Full log: ${logPath}`);
  } finally { fs.closeSync(log); }
}
const npm = (label, args, cwd = app, env = {}) => run(label, process.execPath, [npmCli, ...args], cwd, env);
async function waitFor(check, label) {
  for (let i = 0; i < 60; i++) {
    if (await check()) return;
    await delay(500);
  }
  throw new Error(`${label} did not become ready.`);
}
try {
  console.log(`Clean verification workspace: ${workspace}`);
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const inventory = {};
  for (const relative of new Set(files)) {
    if (!/^(backend\/|frontend\/|test\/|\.github\/|package(?:-lock)?\.json$)/.test(relative)) continue;
    if (relative.split('/').some(p => ['node_modules', 'dist', 'test-results', 'playwright-report'].includes(p))) continue;
    if (path.basename(relative).startsWith('.env') && !relative.endsWith('.env.example')) continue;
    const source = path.join(root, relative);
    if (!fs.existsSync(source) || !fs.statSync(source).isFile()) continue;
    const target = path.join(app, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
    inventory[relative] = createHash('sha256').update(fs.readFileSync(source)).digest('hex');
  }
  report.sourceFiles = Object.keys(inventory).length;
  fs.writeFileSync(path.join(workspace, 'source-hashes.json'), JSON.stringify(inventory, null, 2));
  // No node_modules is copied; each lockfile must install independently.
  for (const [label, dir] of [['root', app], ['backend', path.join(app, 'backend')], ['frontend', path.join(app, 'frontend')]]) {
    await npm(`install-${label}`, ['ci', '--no-fund', '--no-audit'], dir);
  }
  execFileSync('docker', ['run', '--detach', '--rm', '--name', container, '--mount', 'type=tmpfs,destination=/var/lib/postgresql/data', '-p', '127.0.0.1::5432', '-e', 'POSTGRES_USER=rfitness_test', '-e', 'POSTGRES_PASSWORD=isolated-test-only', '-e', 'POSTGRES_DB=fitness_test', 'postgres:16.4-alpine3.20'], { windowsHide: true, stdio: 'pipe' });
  containerCreated = true;
  const inspect = JSON.parse(execFileSync('docker', ['inspect', container], { encoding: 'utf8', windowsHide: true }))[0];
  const dbPort = inspect.NetworkSettings.Ports['5432/tcp'][0].HostPort;
  await waitFor(async () => {
    try { execFileSync('docker', ['exec', container, 'pg_isready', '-U', 'rfitness_test', '-d', 'fitness_test'], { windowsHide: true, stdio: 'ignore' }); return true; }
    catch { return false; }
  }, 'Isolated PostgreSQL');
  const apiPort = await freePort();
  const e2ePort = await freePort();
  const env = {
    PORT: String(apiPort), DB_HOST: '127.0.0.1', DB_PORT: dbPort,
    DB_USERNAME: 'rfitness_test', DB_PASSWORD: 'isolated-test-only', DB_DATABASE: 'fitness_test',
    DB_SYNCHRONIZE: 'true', DB_ENABLE_SSL: 'false', JWT_SECRET: 'isolated-regression-only', JWT_EXPIRES_DAY: '1d',
    API_BASE_URL: `http://127.0.0.1:${apiPort}`, VITE_API_BASE_URL: `http://127.0.0.1:${apiPort}/api/`,
    E2E_PORT: String(e2ePort), E2E_PREVIEW: 'false', CI: 'true', TZ: 'Asia/Taipei',
  };
  report.ports = { database: dbPort, api: apiPort, frontend: e2ePort };
  function startBackend() {
    const backendLog = fs.openSync(path.join(workspace, 'backend.log'), 'a');
    backend = spawn(process.execPath, ['bin/www.js'], { cwd: path.join(app, 'backend'), env: { ...process.env, ...env }, windowsHide: true, stdio: ['ignore', backendLog, backendLog] });
    fs.closeSync(backendLog);
  }
  const backendReady = () => waitFor(async () => {
    try { return (await fetch(`${env.API_BASE_URL}/healthcheck`, { signal: AbortSignal.timeout(1000) })).ok; }
    catch { return false; }
  }, 'Clean backend');
  startBackend();
  await backendReady();
  await run('database-clock', process.execPath, ['-e', `
    const assert = require('node:assert/strict');
    const { dataSource } = require('./backend/db/data-source');
    (async () => {
      await dataSource.initialize();
      try {
        const [row] = await dataSource.query("SELECT current_setting('TimeZone') AS zone, ('2026-09-30 16:30:00+00'::timestamptz)::timestamp AS month_edge, ('2026-12-31 16:30:00+00'::timestamptz)::timestamp AS year_edge");
        assert.equal(row.zone, 'Asia/Taipei');
        assert.equal(row.month_edge.toISOString(), '2026-09-30T16:30:00.000Z');
        assert.equal(row.year_edge.toISOString(), '2026-12-31T16:30:00.000Z');
        console.log('Database/Node timestamp round-trip passes at Taipei month and year boundaries.');
      } finally { await dataSource.destroy(); }
    })().catch(e => { console.error(e); process.exitCode = 1; });
  `], app, { ...env, DB_SYNCHRONIZE: 'false' });
  await npm('backend-contracts', ['test', '--', '--json', `--outputFile=${path.join(workspace, 'jest-result.json')}`], app, env);
  const credentials = { name: '持久化驗證', email: `restart-${Date.now()}@example.com`, password: 'Persist1234' };
  const signup = await fetch(`${env.API_BASE_URL}/api/users/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
  if (!signup.ok) throw new Error('Persistence fixture signup failed.');
  const exited = new Promise(resolve => backend.once('exit', resolve));
  backend.kill();
  await exited;
  env.DB_SYNCHRONIZE = 'false';
  startBackend();
  await backendReady();
  const login = await fetch(`${env.API_BASE_URL}/api/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
  if (!login.ok || !(await login.json()).data?.token) throw new Error('Data did not survive backend restart.');
  report.stages.push({ label: 'backend-restart-persistence', code: 0 });
  const front = path.join(app, 'frontend');
  await npm('e2e-types', ['run', 'test:e2e:types'], front, env);
  await npm('build', ['run', 'build'], front, env);
  const assets = fs.readdirSync(path.join(front, 'dist/assets')).filter(f => f.endsWith('.js'));
  report.bundles = assets.map(name => {
    const bytes = fs.readFileSync(path.join(front, 'dist/assets', name));
    return { name, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
  });
  if (report.bundles.some(b => b.bytes > 500000)) throw new Error('A JS chunk exceeds the 500 kB budget.');
  await npm('browser-install', ['exec', '--', 'playwright', 'install', 'chromium'], front, env);
  await npm('e2e-development', ['run', 'test:e2e', '--', '--retries=0'], front, env);
  await npm('e2e-production', ['run', 'test:e2e', '--', '--retries=0'], front, { ...env, E2E_PREVIEW: 'true' });
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.error = error.message;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (backend && backend.exitCode === null) {
    const stopped = new Promise(resolve => backend.once('exit', resolve));
    backend.kill();
    await stopped;
  }
  if (containerCreated) {
    execFileSync('docker', ['stop', container], { windowsHide: true, stdio: 'ignore' });
  }
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(workspace, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`Report: ${path.join(workspace, 'report.json')}\nTest container stopped; demonstration services were not used.`);
}
