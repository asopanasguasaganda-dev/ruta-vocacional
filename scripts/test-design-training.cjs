const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}};
global.localStorage=storage();global.sessionStorage=storage();global.location={pathname:'/admin/cursos'};
const {designTraining:api}=require('../components/kit/lib/design-training.ts');
(async()=>{
let d=await api();assert.equal(d.courses.length,2);
const course={...structuredClone(d.courses[1]),id:'qa-course',title:'Curso QA',revision:undefined,version:undefined};
const created=await api('/entity',{kind:'course',entity:course},'POST');assert.equal(created.version,1);
global.location.pathname='/mi-ruta/cursos';d=await api();assert(d.courses.some(c=>c.id==='qa-course'));
const e=await api('/enroll',{courseId:'demo-course'},'POST');await api('/read',{enrollmentId:e.id,activityId:'demo-read'},'POST');
let a=await api('/start',{enrollmentId:e.id,activityId:'demo-quiz',mode:'practice'},'POST');
a=await api('/answers',{id:a.id,revision:a.revision,answers:{'demo-q1':2,'demo-q2':1},flags:[]},'POST');
a=await api('/finish',{id:a.id},'POST');assert.equal(a.result.percent,100);
d=await api();assert.equal(d.enrollments[0].progress.percent,100);
global.location.pathname='/admin/cursos';d=await api();assert.equal(d.attempts[0].result.percent,100);
assert.equal(d.enrollments[0].name,'Estudiante de muestra');
console.log('PASS prototype: publish > enroll > read > answer > grade > progress > admin tracking, without database.');
})().catch(e=>{console.error(e);process.exitCode=1});
