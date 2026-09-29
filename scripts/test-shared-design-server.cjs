const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {createDesignServer}=require('./serve-design.cjs');
(async()=>{const folder=await fs.mkdtemp(path.join(os.tmpdir(),'rv360-json-')),file=path.join(folder,'publications.json');let server;
async function start(){server=createDesignServer({file});await new Promise(r=>server.listen(0,'127.0.0.1',r));return 'http://127.0.0.1:'+server.address().port;}
let base=await start();
try{
const packet={format:'rv360-test-publication',version:2,source:'qa-admin',createdAt:new Date().toISOString(),tests:[{id:'q-test',schemaVersion:2,version:'1',title:'Compartido',source:'QA',scoring:'objective',options:[],questions:[{id:'q1',text:'Dos mas dos',type:'single',options:[{label:'Tres',value:1},{label:'Cuatro',value:2}],correctValues:[2]}]}],simulators:[]};
const send=(data,origin=base)=>fetch(base+'/__design/publications',{method:'PUT',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
assert.equal((await send(packet,'https://external.example')).status,403);
assert.equal((await send({...packet,tests:[{...packet.tests[0],questions:[]}]})).status,400);
assert.equal((await send(packet)).status,200);let saved=await (await fetch(base+'/__design/publications')).json();assert.equal(saved.publications[0].tests.length,1);
assert.equal((await send({...packet,createdAt:'2020-01-01T00:00:00Z'})).status,400);
await new Promise(r=>server.close(r));base=await start();saved=await (await fetch(base+'/__design/publications')).json();assert.equal(saved.publications[0].tests[0].id,'q-test');
assert.equal((await send({...packet,tests:[],createdAt:new Date(Date.parse(packet.createdAt)+1000).toISOString()})).status,200);saved=JSON.parse(await fs.readFile(file,'utf8'));assert.equal(saved.publications.length,1);assert.equal(saved.publications[0].tests.length,0);
console.log('PASS shared JSON: validated publication, origin restriction, rollback rejection, restart persistence and withdrawal without a database');
}finally{await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1});
