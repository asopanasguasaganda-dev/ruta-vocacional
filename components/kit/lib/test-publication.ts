import {instrumentProblems} from './test-engine';
import catalog from '../data/design-careers.json';
const workspaceKey='rv360:local-workspace-v1',sourceKey='rv360:test-publication-source-v1';
const workspace=()=>JSON.parse(localStorage.getItem(workspaceKey)||'{}');
function source(){let id=localStorage.getItem(sourceKey);if(!id){id=crypto.randomUUID();localStorage.setItem(sourceKey,id);}return id;}
const keys=['id','stableId','schemaVersion','title','description','version','questions','options','dimensions','scoring','aggregation','source','purpose','careerLinks','ranges','minimumCoverage','availableFrom','due','durationMinutes','maxAttempts','resultPublication','releaseAt'];
export function exportTestPublication(){
 const tests=(workspace()['rv360:custom-tests']||[]).filter((t:any)=>t.status==='Publicado'&&t.audience!=='selected'&&!t.studentId&&!t.publicationSource).map((t:any)=>Object.fromEntries(keys.filter(k=>t[k]!==undefined).map(k=>[k,t[k]])));
 return {format:'rv360-test-publication',version:1,source:source(),createdAt:new Date().toISOString(),tests};
}
export function validateTestPublication(value:any){
 if(!value||value.format!=='rv360-test-publication'||value.version!==1||!/^[a-zA-Z0-9-]{1,80}$/.test(value.source)||!Number.isFinite(Date.parse(value.createdAt))||!Array.isArray(value.tests)||value.tests.length>200)throw Error('El archivo no es una publicación válida de tests.');
 const ids=new Set();for(const t of value.tests){if(!t||typeof t.id!=='string'||ids.has(t.id)||!Array.isArray(t.questions)||!Array.isArray(t.options))throw Error('La publicación contiene un test incompleto o repetido.');ids.add(t.id);const issues=instrumentProblems(t);if(issues.length)throw Error((t.title||'Test')+': '+issues[0].message);if(t.careerLinks?.some((l:any)=>!catalog.careers.some(c=>c.id===l.careerId)))throw Error('La publicación contiene una carrera no reconocida.');}
 return value;
}
export function importTestPublication(input:any){
 const packet=validateTestPublication(input),w=workspace();
 if(packet.source===localStorage.getItem(sourceKey))throw Error('Estos tests ya pertenecen a este perfil. Abre la publicación en el perfil del estudiante.');
 if(w.publicationDates?.[packet.source]&&Date.parse(packet.createdAt)<Date.parse(w.publicationDates[packet.source]))throw Error('Ya cargaste una publicación más reciente de este origen.');
 const prefix='shared:'+packet.source+':';
 const imported=packet.tests.map((t:any)=>({...Object.fromEntries(keys.filter(k=>t[k]!==undefined).map(k=>[k,t[k]])),id:prefix+t.id,stableId:prefix+(t.stableId||t.id),status:'Publicado',audience:'all',group:'Todos los estudiantes',publicationSource:packet.source}));
 const old=w['rv360:custom-tests']||[];w['rv360:custom-tests']=[...old.filter((t:any)=>!imported.some((n:any)=>n.id===t.id)).map((t:any)=>t.publicationSource===packet.source?{...t,status:'Archivado'}:t),...imported];
 w.publicationDates={...w.publicationDates,[packet.source]:packet.createdAt};localStorage.setItem(workspaceKey,JSON.stringify(w));return imported.length;
}
