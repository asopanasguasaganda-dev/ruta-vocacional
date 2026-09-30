const fs=require('fs'),ts=require('typescript'),assert=require('node:assert/strict');require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:9,esModuleInterop:true}}).outputText,f);
const {applySimulatorSuggestions}=require('../components/kit/lib/simulator-autofill.ts');
const base={title:'Original',durationMinutes:30,instrument:{description:'Original instructions',options:[]},careerIds:[],questions:[{id:'a',type:'single',text:'2+2',options:[{value:10,label:'4'},{value:20,label:'5'}],source:'document.pdf',weight:3},{id:'b',type:'single',correctValues:[20],explanation:'Source explanation',reviewed:true,options:[{value:20,label:'Yes'}]}]};
const suggestion={title:'Brief',summary:'Summary',durationMinutes:45,careerIds:['software','fake'],questions:[{id:'a',correctValues:[10],explanation:'Two plus two is four',topic:'Math',difficulty:'introductory'},{id:'b',correctValues:[999],explanation:'Replace me'}]};
const result=applySimulatorSuggestions(base,suggestion,[{id:'software',name:'Software'}]);
assert.deepEqual(result.careerIds,['software']);assert.equal(result.durationMinutes,30);assert.equal(result.questions[0].weight,3);assert.equal(result.questions[0].source,'document.pdf');assert.deepEqual(result.questions[0].correctValues,[10]);assert.equal(result.questions[0].reviewed,false);assert.equal(result.questions[0].aiSuggested,true);assert.deepEqual(result.questions[1],base.questions[1]);assert.equal(base.questions[0].correctValues,undefined);assert.equal(result.instrument.description,'Original instructions');
assert.equal(applySimulatorSuggestions(base,suggestion,[],true).durationMinutes,45);
for(const q of [{id:'a',correctValues:[999]},{id:'a',correctValues:[10,20]},{id:'a',correctValues:[10],issue:'Ambiguous'}])assert.equal(applySimulatorSuggestions(base,{questions:[q]},[]).questions[0].correctValues,undefined);
assert.deepEqual(applySimulatorSuggestions(base,{questions:[]},[]).questions,base.questions);
console.log('PASS AI merge: preserves source/keys/weights, validates options and careers, retains review, handles uncertainty.');

(async()=>{
 const {autofillSimulator}=require('../components/kit/lib/simulator-autofill.ts');const original=global.fetch;let calls=0;const progress=[];
 try{
  global.fetch=async()=>{calls++;if(calls===1)return new Response(JSON.stringify({error:'Temporary'}),{status:503});return new Response(JSON.stringify({suggestions:suggestion}),{status:200});};
  const done=await autofillSimulator(base,[],false,m=>progress.push(m));assert.equal(calls,2);assert.deepEqual(done.simulator.questions[0].correctValues,[10]);assert(progress.some(p=>p.includes('Reintentando')));
  calls=0;global.fetch=async()=>{calls++;return new Response('{}',{status:401});};const expired=await autofillSimulator(base,[]);assert.equal(calls,1);assert(expired.message.includes('sesión'));assert.deepEqual(expired.simulator,base);
  calls=0;global.fetch=async()=>{calls++;throw Error('Should not request');};const ready=await autofillSimulator({...done.simulator,careerIds:['software']},[]);assert.equal(calls,0);
  console.log('PASS transient retry, progress, expired session and no regeneration of complete questions.');
 }finally{global.fetch=original;}
})().catch(e=>{console.error(e);process.exitCode=1});
