import {answerProblem} from '@/components/kit/lib/test-engine';
import {randomUUID} from 'node:crypto';
import {instruments,answerKey} from '@/components/kit/data/instruments';
import {db,document,put,assigned,studentInstrument,fail} from './store';
export function battery(user:any,freeze=false){
 if(user.role!=='student')return null;
 let run=document(user.id,'rv360:battery');
 if(!run){const custom=document('institution:'+user.institutionId,'rv360:custom-tests',[]).filter((t:any)=>assigned(t,user));run={id:randomUUID(),createdAt:new Date().toISOString(),frozen:freeze,instruments:[...instruments,...custom]};if(freeze)put(user.id,'rv360:battery',run);}
 return run;
}
export function batteryForClient(user:any){const run=battery(user);return run?{...run,instruments:run.instruments.map((t:any)=>studentInstrument(t))}:null;}
export function batterySubmissions(user:any){const run=battery(user);if(!run)fail('Esta operación corresponde al estudiante.',403);const rows=run.instruments.map((t:any)=>db.prepare('SELECT * FROM submissions WHERE user_id=? AND instrument_id=? AND version=? ORDER BY created_at DESC LIMIT 1').get(user.id,t.id,t.version));return {run,rows,complete:rows.every(Boolean)};}
export function instrumentFor(user:any,id:string){const open=db.prepare("SELECT snapshot FROM assessment_attempts WHERE user_id=? AND instrument_id=? AND state='in_progress'").get(user.id,id) as any;if(open)return JSON.parse(open.snapshot);return battery(user)?.instruments.find((t:any)=>t.id===id)||document('institution:'+user.institutionId,'rv360:custom-tests',[]).find((t:any)=>t.id===id&&assigned(t,user));}
export function validateDraft(user:any,key:string,value:any){const run=battery(user,true);const t=run?.instruments.find((t:any)=>answerKey(t)===key)||document('institution:'+user.institutionId,'rv360:custom-tests',[]).find((t:any)=>assigned(t,user)&&answerKey(t)===key);if(!t||!value||typeof value!=='object'||Array.isArray(value))fail('Borrador no válido para esta asignación.');if(t.schemaVersion===2&&!db.prepare("SELECT id FROM assessment_attempts WHERE user_id=? AND instrument_id=? AND state='in_progress'").get(user.id,t.id))fail('Inicia un intento antes de guardar respuestas.',409);for(const [id,answer] of Object.entries(value)){const q=t.questions.find((q:any)=>q.id===id);if(!q)fail('Pregunta no válida.');const problem=answerProblem(t,q,answer,true);if(problem)fail(problem);}}
