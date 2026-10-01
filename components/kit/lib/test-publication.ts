import {schoolTrainingTargets} from '../data/school-training';
import {simulatorProblems} from './training-engine';
import {simulatorCareerIds} from './simulator-careers';
import {instrumentProblems} from './test-engine';
import catalog from '../data/design-careers.json';
const workspaceKey='rv360:local-workspace-v1',sourceKey='rv360:test-publication-source-v1';
const workspace=()=>JSON.parse(localStorage.getItem(workspaceKey)||'{}');
function source(){let id=localStorage.getItem(sourceKey);if(!id){id=crypto.randomUUID();localStorage.setItem(sourceKey,id);}return id;}
const trainingKey='rv360:local-training-v1';
const simulatorKeys=['educationLevel','id','version','revision','title','careerIds','instrument','purpose','modes','durationMinutes','practiceDurationMinutes','maxAttempts','gradePolicy','feedback','selection','quotas','areaWeights','questions','shuffleOptions','questionOrderFixedIds'];
const pickSimulator=(s:any)=>Object.fromEntries(simulatorKeys.filter(k=>s[k]!==undefined).map(k=>[k,s[k]]));
const keys=['educationLevel','id','stableId','schemaVersion','presentation','title','description','version','questions','options','dimensions','scoring','aggregation','source','purpose','careerLinks','ranges','minimumCoverage','availableFrom','due','durationMinutes','maxAttempts','resultPublication','releaseAt'];
export function exportTestPublication(){
 const tests=(workspace()['rv360:custom-tests']||[]).filter((t:any)=>t.status==='Publicado'&&t.audience!=='selected'&&!t.studentId&&!t.publicationSource).map((t:any)=>Object.fromEntries(keys.filter(k=>t[k]!==undefined).map(k=>[k,t[k]])));
 const training=JSON.parse(localStorage.getItem(trainingKey)||'{}');
 const simulators=(training.simulators||[]).filter((s:any)=>s.status==='published'&&!s.publicationSource&&!(training.simulators||[]).some((n:any)=>n.id===s.id&&n.status==='published'&&n.version>s.version)).map((s:any)=>pickSimulator({...s,careerIds:simulatorCareerIds(s,training.courses||[])}));
 return validateTestPublication({format:'rv360-test-publication',version:2,source:source(),createdAt:new Date().toISOString(),tests,simulators});
}
export function validateTestPublication(value:any){
 if(!value||value.format!=='rv360-test-publication'||![1,2].includes(value.version)||!/^[a-zA-Z0-9-]{1,80}$/.test(value.source)||!Number.isFinite(Date.parse(value.createdAt))||!Array.isArray(value.tests)||value.tests.length>200)throw Error('El archivo no es una publicación válida de tests.');
 const ids=new Set();for(const t of value.tests){if(!t||typeof t.id!=='string'||ids.has(t.id)||!Array.isArray(t.questions)||!Array.isArray(t.options))throw Error('La publicación contiene un test incompleto o repetido.');ids.add(t.id);const issues=instrumentProblems(t);if(issues.length)throw Error((t.title||'Test')+': '+issues[0].message);if(t.careerLinks?.some((l:any)=>!catalog.careers.some(c=>c.id===l.careerId)))throw Error('La publicación contiene una carrera no reconocida.');}
 if(value.version===2){
 if(!Array.isArray(value.simulators)||value.simulators.length>200)throw Error('La publicación contiene una lista de simuladores no válida.');
 const simulatorIds=new Set();
 for(const s of value.simulators){if(!s||typeof s.id!=='string'||simulatorIds.has(s.id)||!Number.isInteger(s.version)||s.version<1||!Array.isArray(s.questions)||!s.instrument||!Array.isArray(s.careerIds)||!s.careerIds.length||s.careerIds.some((id:string)=>![...catalog.careers,...schoolTrainingTargets].some(c=>c.id===id)))throw Error('El simulador o sus carreras no son válidos.');simulatorIds.add(s.id);const problems=simulatorProblems(s);if(problems.length)throw Error(s.title+': '+problems[0]);}
 }
 return value;
}
export function importTestPublication(input:any){
 const packet=validateTestPublication(input),w=workspace();
 if(packet.source===localStorage.getItem(sourceKey))throw Error('Estos tests ya pertenecen a este perfil. Abre la publicación en el perfil del estudiante.');
 if(w.publicationDates?.[packet.source]&&Date.parse(packet.createdAt)<Date.parse(w.publicationDates[packet.source]))throw Error('Ya cargaste una publicación más reciente de este origen.');
 const prefix='shared:'+packet.source+':';
 const imported=packet.tests.map((t:any)=>({...Object.fromEntries(keys.filter(k=>t[k]!==undefined).map(k=>[k,t[k]])),id:prefix+t.id,stableId:prefix+(t.stableId||t.id),status:'Publicado',audience:'all',group:'Todos los estudiantes',publicationSource:packet.source}));
 const beforeTraining=localStorage.getItem(trainingKey),data=JSON.parse(beforeTraining||'{}');
 if(packet.version===2){const simulators=packet.simulators.map((s:any)=>({...pickSimulator(s),id:prefix+s.id,status:'published',publicationSource:packet.source}));data.simulators=[...(data.simulators||[]).filter((s:any)=>!simulators.some((n:any)=>n.id===s.id&&n.version===s.version)).map((s:any)=>s.publicationSource===packet.source?{...s,status:'archived'}:s),...simulators];}
 const old=w['rv360:custom-tests']||[];w['rv360:custom-tests']=[...old.filter((t:any)=>!imported.some((n:any)=>n.id===t.id)).map((t:any)=>t.publicationSource===packet.source?{...t,status:'Archivado'}:t),...imported];
 w.publicationDates={...w.publicationDates,[packet.source]:packet.createdAt};// Commit the two catalogs together; restore training if the workspace write fails.
 if(packet.version===2)localStorage.setItem(trainingKey,JSON.stringify(data));
 try{localStorage.setItem(workspaceKey,JSON.stringify(w));}catch(error){if(packet.version===2){if(beforeTraining===null)localStorage.removeItem(trainingKey);else localStorage.setItem(trainingKey,beforeTraining);}throw error;}
 if(typeof window!=='undefined')window.dispatchEvent(new Event('rv360:publication'));
 return imported.length;
}
