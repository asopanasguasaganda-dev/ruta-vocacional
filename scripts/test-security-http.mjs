import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import mysql from 'mysql2/promise';

const base=process.env.APP_URL;
if(!base || !['localhost','127.0.0.1'].includes(new URL(base).hostname) || !/_test$/.test(process.env.DB_NAME || ''))
  throw Error('Solo una instalación local con base aislada _test.');
const db=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT),database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASSWORD});
const hash=s=>createHash('sha256').update(s).digest('hex');
const password=randomBytes(24).toString('base64url'),email='security-'+Date.now()+'@example.test';
let id;
async function call(path,body,cookie='',extra={}) {
  return fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{Origin:base,'Content-Type':'application/json',Cookie:cookie,...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
}
const cookie=r=>r.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ');
try {
  for(const path of ['admin/analytics','training','me/export'])assert.equal((await call(path)).status,401,path);
  const noOrigin=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  assert.equal(noOrigin.status,403);
  assert.equal((await call('auth/login',{},'',{Origin:'https://evil.example'})).status,403);
  assert.equal((await call('auth/login',{},'',{'Content-Type':'text/plain'})).status,415);
  for(const data of ['null','[]','{invalid'])assert.equal((await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:data})).status,400);
  const oversized=new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('x'.repeat(2_000_001)));c.close();}});
  assert.equal((await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:oversized,duplex:'half'})).status,413);
  assert.equal((await call('auth/register',{name:'Security Test',email,password:'short123'})).status,400);
  const registered=await call('auth/register',{name:'Security Test',email,password,role:'admin'});
  assert.equal(registered.status,200);
  const result=await registered.json();id=result.user.id;
  assert.equal(result.user.role,'student');assert(!('password' in result.user));
  const first=cookie(registered);assert.match(registered.headers.get('set-cookie'),/HttpOnly/i);
  const [rows]=await db.execute('SELECT token FROM sessions WHERE userId=?',[id]);
  assert.equal(rows[0].token,hash(first.split('=')[1]));
  for(const path of ['admin/analytics','admin/audit'])assert.equal((await call(path,undefined,first)).status,403);
  assert.equal((await call('admin/users',{action:'reset-password',id:'other',password},first)).status,403);
  assert.equal((await call('state',{key:'rv360:admin-settings',value:{}},first)).status,404); // POST is not a state mutation.
  const write=await fetch(base+'/api/state',{method:'PUT',headers:{Origin:base,'Content-Type':'application/json',Cookie:first},body:JSON.stringify({key:'rv360:admin-settings',value:{}})});
  assert.equal(write.status,403);
  const login=await call('auth/login',{email,password},first);assert.equal(login.status,200);
  assert.equal((await (await call('session',undefined,first)).json()).user,null);
  const second=cookie(login);
  const token=randomBytes(32).toString('hex');
  await db.execute('INSERT INTO resets VALUES(?,?,?)',[hash(token),id,Date.now()+60000]);
  await db.execute("UPDATE users SET status='Suspendido' WHERE id=?",[id]);
  const nextPassword=randomBytes(24).toString('base64url');
  const attempts=await Promise.all([call('auth/reset-confirm',{token,password:nextPassword}),call('auth/reset-confirm',{token,password:nextPassword})]);
  assert.deepEqual(attempts.map(r=>r.status).sort(),[200,400]);
  const [[user]]=await db.execute('SELECT status FROM users WHERE id=?',[id]);assert.equal(user.status,'Suspendido');
  assert.equal((await (await call('session',undefined,second)).json()).user,null);
  assert.equal((await call('auth/login',{email,password:nextPassword})).status,401);
  const absent='absent-'+Date.now()+'@example.test';
  for(let n=0;n<12;n++)assert.equal((await call('auth/login',{email:absent,password})).status,401);
  assert.equal((await call('auth/login',{email:absent,password})).status,429);
  const page=await fetch(base+'/admin/login');
  assert.equal(page.headers.get('x-frame-options'),'DENY');
  assert.equal(page.headers.get('x-content-type-options'),'nosniff');
  assert.equal(page.headers.get('referrer-policy'),'no-referrer');
  assert.equal(page.headers.get('x-powered-by'),null);
  const csp=page.headers.get('content-security-policy');assert.match(csp,/nonce-/);assert(!csp.includes('unsafe-eval'));
  assert.notEqual(csp,(await fetch(base+'/admin/login')).headers.get('content-security-policy'));
  for(const path of ['/.env.local','/.local/hostinger-admin.env','/database/mysql.sql','/storage/ruta.sqlite'])
    assert.equal((await fetch(base+path)).status,404,path);
  console.log('PASS HTTP security: roles, CSRF, payload limits, weak-password rejection, session hashing/rotation, one-use reset concurrency, suspended-account protection, throttling, private paths and nonce headers.');
} finally {
  if(id){
    for(const table of ['sessions','resets'])await db.execute('DELETE FROM '+table+' WHERE userId=?',[id]);
    await db.execute('DELETE FROM documents WHERE owner=?',[id]);await db.execute('DELETE FROM users WHERE id=?',[id]);
  }
  await db.end();
}
