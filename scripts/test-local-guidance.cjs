const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {localGuidance}=require('../components/kit/lib/local-guidance.ts'),{instruments}=require('../components/kit/data/instruments.ts'),{calculateTest}=require('../components/kit/lib/test-engine.ts');
const catalog=require('../components/kit/data/design-careers.json');
const t=instruments.find(t=>t.id==='intereses');
const user={id:'qa-report',name:'Estudiante QA',email:'qa@report.test',role:'student'};
function submission(fn){const answers=Object.fromEntries(t.questions.map(q=>[q.id,fn(q)])),evaluation=calculateTest({...t,scoring:'dimensions',aggregation:'sum'},answers);return {id:'qa-submission',instrument_id:t.id,version:t.version,created_at:'2026-09-29T12:00:00Z',snapshot:JSON.stringify(t),answers:JSON.stringify(answers),scores:JSON.stringify(evaluation.scores),evaluation};}
const differentiated=submission(q=>q.dimension==='I'?5:q.dimension==='R'?4:2);const report=localGuidance(user,[differentiated]);assert(report.analysis.recommendations.length>0);assert.equal(report.catalog.length,983);assert.equal(Object.values(report.offers).flat().length,5821);assert.equal(report.contentSource,'gemini');for(const r of report.analysis.recommendations){assert(catalog.careers.some(c=>c.id===r.careerId));assert(report.offers[r.careerId].length>0);}
assert.equal(localGuidance(user,[submission(()=>3)]).analysis.recommendations.length,0);assert.equal(localGuidance(user,[submission(()=>1)]).analysis.recommendations.length,0);assert.equal(localGuidance(user,[{...differentiated,resultReleased:false}]),null);assert.equal(localGuidance(user,[]),null);
console.log('PASS guidance: actual catalog, saved scores, Gemini provenance, linked offers, ties, low interests, withheld and empty results.');
if(process.argv.includes('--fixture'))fs.writeFileSync('.qa-tools/guidance-fixture.json',JSON.stringify({user,report,submission:differentiated,instrument:t}));

const custom={...differentiated,id:'custom-result',instrument_id:'custom-test',snapshot:JSON.stringify({...t,id:'custom-test'})};
assert.deepEqual(localGuidance(user,[custom],['custom-test']).progress,{submitted:1,total:1});
assert.equal(localGuidance(user,[custom],['custom-test']).partial,false);
assert.deepEqual(localGuidance(user,[custom],['custom-test','pending-test']).progress,{submitted:1,total:2});
assert.deepEqual(localGuidance(user,[custom,custom],['custom-test']).progress,{submitted:1,total:1});
console.log('PASS custom tests count toward report progress, pending assignments and duplicate submissions.');
