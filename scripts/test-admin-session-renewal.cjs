const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:9}}).outputText,f);
global.window=new EventTarget();window.location={hostname:'example.test'};
const {adminFetch}=require('../components/kit/lib/admin-session.ts');
(async()=>{let calls=0,prompts=0;const body=JSON.stringify({title:'Draft retained',questions:[{id:'q1',text:'Original'}]});let valid=true;
let renew=e=>{e.preventDefault();prompts++;setTimeout(()=>e.detail.resolve(),5)};window.addEventListener('rv360:admin-reauthenticate',renew);
const simulate=(handler)=>global.fetch=async(url,init)=>url.includes('/api/session')?Response.json({user:valid?{id:'admin',role:'admin'}:null}):handler(url,init);
simulate(async(url,init)=>{assert.equal(init.body,body);assert.equal(init.credentials,'same-origin');assert(!init.headers['X-Publish-Key']);calls++;return new Response('{}',{status:calls===1?401:200});});
assert.equal((await adminFetch('/api/admin/import',{method:'PUT',body,headers:{'Content-Type':'application/json'}})).status,200);assert.equal(calls,2);assert.equal(prompts,0);
valid=false;calls=0;assert.equal((await adminFetch('/api/admin/import',{method:'PUT',body,headers:{'Content-Type':'application/json'}})).status,200);assert.equal(calls,2);assert.equal(prompts,1);
calls=0;simulate(async()=>{calls++;return new Response('{}',{status:401});});assert.equal((await adminFetch('/api/import-presentation/')).status,401);assert.equal(calls,2);
window.removeEventListener('rv360:admin-reauthenticate',renew);renew=e=>{e.preventDefault();e.detail.reject(Error('Cancelled'));};window.addEventListener('rv360:admin-reauthenticate',renew);calls=0;await assert.rejects(adminFetch('/api/admin/import'),/Cancelled/);assert.equal(calls,1);

console.log('PASS: silent valid-session recovery, expired-session fallback, unchanged draft, no publication key, bounded retry, cancellation.');})().catch(e=>{console.error(e);process.exitCode=1});
