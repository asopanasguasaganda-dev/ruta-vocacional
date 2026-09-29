const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { DatabaseSync } = require('node:sqlite');
const { randomUUID, randomBytes } = require('node:crypto');
const { mkdirSync, readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');

(async () => {
  const { trustedMutationOrigin } = await import('../lib/server/request-origin.ts');
  const prior = process.env.APP_URL;
  process.env.APP_URL = 'https://frontend.example';
  const req = (origin, site = 'same-origin') => new Request('https://backend.example/api/training', { headers: { origin, 'sec-fetch-site': site } });
  assert(trustedMutationOrigin(req('https://frontend.example')));
  assert(trustedMutationOrigin(req('https://backend.example')));
  assert(!trustedMutationOrigin(req('https://attacker.example')));
  assert(!trustedMutationOrigin(req('https://frontend.example', 'cross-site')));
  assert(!trustedMutationOrigin(new Request('https://backend.example/api/account/photo'), true));
  if (prior === undefined) delete process.env.APP_URL; else process.env.APP_URL = prior;

  const checkConfig = env => spawnSync(process.execPath, ['--input-type=module', '-e', "const {default:config}=await import('./next.config.mjs'); console.log(JSON.stringify(await config.rewrites()));"], { env: { ...process.env, ...env }, encoding: 'utf8' });
  const disconnected = checkConfig({ VERCEL: '1', API_ORIGIN: '' });
  assert.equal(disconnected.status, 0, 'El diseño debe poder desplegarse sin backend');
  assert.deepEqual(JSON.parse(disconnected.stdout.trim()).beforeFiles, []);
  assert.notEqual(checkConfig({ VERCEL: '1', API_ORIGIN: 'http://backend.example' }).status, 0);
  const proxy = checkConfig({ VERCEL: '1', API_ORIGIN: 'https://backend.example' });
  assert.equal(proxy.status, 0);
  assert.deepEqual(JSON.parse(proxy.stdout.trim()).beforeFiles, [{ source: '/api/:path*', destination: 'https://backend.example/api/:path*' }]);

  const moduleExports = {};
  const testEnv = { VERCEL: '1' };
  const compiled = ts.transpileModule(readFileSync('proxy.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(compiled, { exports: moduleExports, require, process: { env: testEnv } });
  const { NextRequest } = require('next/server');
  const session = moduleExports.proxy(new NextRequest('https://frontend.example/api/session'));
  assert.equal(session.status, 200);
  assert.equal((await session.json()).serviceAvailable, false);
  for (const path of ['auth/login', 'auth/register', 'training/entity', 'health']) {
    const response = moduleExports.proxy(new NextRequest(`https://frontend.example/api/${path}`, { method: path === 'health' ? 'GET' : 'POST' }));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal((await response.json()).code, 'SERVICE_UNAVAILABLE');
  }
  testEnv.API_ORIGIN = 'https://backend.example';
  assert.equal(moduleExports.proxy(new NextRequest('https://frontend.example/api/session')).headers.get('x-middleware-next'), '1');

  mkdirSync('.qa-tools', { recursive: true });
  const path = `.qa-tools/bootstrap-${randomUUID()}.sqlite`;
  const db = new DatabaseSync(path);
  db.exec("CREATE TABLE institutions(id TEXT PRIMARY KEY,name TEXT,code TEXT UNIQUE); CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT,email TEXT UNIQUE,password TEXT,role TEXT,institutionId TEXT,groupName TEXT,status TEXT); CREATE TABLE documents(owner TEXT,key TEXT,value TEXT,revision INTEGER DEFAULT 1,PRIMARY KEY(owner,key));");
  const env = { ...process.env, DATABASE_PATH: path, ADMIN_EMAIL: 'qa-bootstrap@example.test', ADMIN_PASSWORD: randomBytes(24).toString('hex'), ADMIN_NAME: 'QA Bootstrap', INSTITUTION_NAME: 'QA Platform', INSTITUTION_CODE: 'QA' };
  assert.equal(spawnSync(process.execPath, ['scripts/create-admin.mjs'], { env, encoding: 'utf8' }).status, 0);
  const platform = JSON.parse(db.prepare("SELECT value FROM documents WHERE owner='system' AND key='rv360:platform'").get().value);
  assert.equal(platform.institutionId, db.prepare('SELECT institutionId FROM users').get().institutionId);
  assert.notEqual(spawnSync(process.execPath, ['scripts/create-admin.mjs'], { env, encoding: 'utf8' }).status, 0);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM users').get().n, 1);
  db.close();
  console.log('Origen público autorizado, CSRF rechazado, proxy configurado, build Vercel sin backend permitido e inicialización de administrador/registro: OK');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
