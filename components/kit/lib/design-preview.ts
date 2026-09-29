import {instruments} from '../data/instruments';
import {calculateTest,instrumentProblems,answerProblem,visibleQuestions} from './test-engine';
// Local accounts for the design stage; no database or server authentication.
const key='rv360:local-accounts-v1',activeKey='rv360:local-session-v1';
export function localAccounts():any[]{try{return JSON.parse(localStorage.getItem(key)||'[]');}catch{return [];}}
function read(){return localAccounts().find(a=>a.user.id===sessionStorage.getItem(activeKey))||null;}
function write(account:any){const all=localAccounts(),i=all.findIndex(a=>a.user.id===account.user.id);if(i<0)all.push(account);else all[i]=account;localStorage.setItem(key,JSON.stringify(all));}
const workspaceKey='rv360:local-workspace-v1';
function workspace(){try{return JSON.parse(localStorage.getItem(workspaceKey)||'{}');}catch{return {};}}
function writeWorkspace(value:any){localStorage.setItem(workspaceKey,JSON.stringify(value));}
function currentValues(){return read()?.values||{};}
function writeValues(values:any){const account=read();if(!account)throw Error('Inicia sesión para continuar.');account.values=values;write(account);}
function published(){return (workspace()['rv360:custom-tests']||[]).filter((t:any)=>t.status==='Publicado');}
function testById(id:string){const t=[...instruments,...published()].find(t=>t.id===id);if(!t)throw Error('El test no está publicado.');return t;}
export function designLogout(){sessionStorage.removeItem(activeKey);}
export function designUser(){const account=read();if(!account)throw Error('Inicia sesión para continuar.');return account.user;}
export function designSave(key:string,value:unknown){const user=designUser();if(key.startsWith('rv360:admin-')||key==='rv360:custom-tests'){if(user.role!=='admin')throw Error('Acceso administrativo requerido.');}if(key==='rv360:custom-tests'){for(const t of value as any[]){if(t.status==='Publicado'){const issues=instrumentProblems(t);if(issues.length)throw Error(issues[0].message);}}const w=workspace();w[key]=value;writeWorkspace(w);}else writeValues({...currentValues(),[key]:value});}
async function verifier(password:string,salt:string){const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},material,256);return Array.from(new Uint8Array(bits),v=>v.toString(16).padStart(2,'0')).join('');}
// Isolated synthetic design context. No network, credentials or database.
export async function designRequest(path:string,options:RequestInit={}){
 const body=options.body?JSON.parse(String(options.body)):{};
 if(path==='auth/local-status')return {adminExists:localAccounts().some(a=>a.user.role==='admin')};
 if((path==='auth/register'||path==='auth/local-admin')&&options.method==='POST'){
  const admin=path==='auth/local-admin';
  if(admin&&localAccounts().some(a=>a.user.role==='admin'))throw Error('La cuenta administrativa ya está configurada.');
  if(!body.name?.trim()||!/^\S+@\S+\.\S+$/.test(body.email||'')||typeof body.password!=='string'||body.password.length<8||body.password.length>128)throw Error('Revisa nombre, correo y contraseña (8 a 128 caracteres).');
  if(localAccounts().some(a=>a.user.email===body.email.trim().toLowerCase()))throw Error('Este correo ya está registrado en este navegador.');
  const salt=crypto.randomUUID(),user={id:crypto.randomUUID(),name:body.name.trim(),email:body.email.trim().toLowerCase(),role:admin?'admin':'student',institutionId:'local',group:''};
  const {password,admin:ignored,...profile}=body;
  write({user,salt,verifier:await verifier(password,salt),values:{'rv360:profile':{...profile,name:user.name,email:user.email}}});sessionStorage.setItem(activeKey,user.id);return {user};
 }
 if(path==='auth/login'&&options.method==='POST'){
  const account=localAccounts().find(a=>a.user.email===String(body.email).trim().toLowerCase()&&a.user.role===(body.admin?'admin':'student'));
  if(!account||typeof body.password!=='string'||account.verifier!==await verifier(body.password,account.salt))throw Error('Correo o contraseña incorrectos. Usa una cuenta creada en este navegador.');
  sessionStorage.setItem(activeKey,account.user.id);return {user:account.user};
 }
 if(path==='auth/password-reset')throw Error('No hay envío de correos en esta etapa. El acceso utiliza la contraseña creada en este navegador.');
 if(path==='account/profile'&&options.method==='PUT'){
  const account=read();if(!account)throw Error('Inicia sesión para editar tus datos.');
  if(!body.firstName?.trim()||!body.lastName?.trim())throw Error('Completa nombres y apellidos.');
  account.user.name=body.firstName.trim()+' '+body.lastName.trim();account.values['rv360:profile']={...account.values['rv360:profile'],...body,name:account.user.name,email:account.user.email};write(account);return {ok:true};
 }

 if(path==='admin/tests/preview')return {...calculateTest(body.instrument,body.answers),persisted:false};
 if(path==='admin/tests/careers')return {careers:[]};
 if(path==='assessments/start'){
  const t=testById(body.instrumentId),values=currentValues(),attempts=values['rv360:attempts']||[];
  const previous=attempts.find((a:any)=>a.instrument_id===t.id&&a.state==='in_progress');if(previous)return previous;
  if(t.maxAttempts&&attempts.filter((a:any)=>a.stable_id===(t.stableId||t.id)).length>=t.maxAttempts)throw Error('Alcanzaste el máximo de intentos.');
  const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Guayaquil'});if(t.availableFrom&&today<t.availableFrom||t.due&&today>t.due)throw Error('El test no está disponible en esta fecha.');
  const attempt={id:crypto.randomUUID(),instrument_id:t.id,stable_id:t.stableId||t.id,state:'in_progress',started_at:new Date().toISOString()};values['rv360:attempts']=[...attempts,attempt];values['rv360:answers:'+t.id+':'+t.version]={};writeValues(values);return attempt;
 }
 if(path==='assessments/submit'){
  const t=testById(body.instrumentId),values=currentValues(),answers=values['rv360:answers:'+t.id+':'+t.version]||{},attempts=values['rv360:attempts']||[],attempt=attempts.find((a:any)=>a.instrument_id===t.id&&a.state==='in_progress');
  const previous=(values['rv360:submissions']||[]).find((s:any)=>s.instrument_id===t.id&&s.version===t.version);if(previous&&!attempt)return {id:previous.id};
  if(t.schemaVersion===2&&!attempt)throw Error('Confirma el inicio del intento.');
  if(attempt&&t.durationMinutes&&Date.now()>Date.parse(attempt.started_at)+t.durationMinutes*60000)throw Error('El tiempo del intento terminó.');
  for(const q of visibleQuestions(t,answers)){const problem=answerProblem(t,q,answers[q.id]);if(problem)throw Error(q.text+': '+problem);}
  const original=['intereses','valores','autoconocimiento'].includes(t.id),evalTest=original?{...t,scoring:'dimensions' as const,aggregation:'sum' as const}:t;
  const evaluation={...calculateTest(evalTest,answers),revision:1};const id=crypto.randomUUID();
  const released=evaluation.state!=='pending-review'&&t.resultRelease!=='review'&&!(t.resultRelease==='date'&&t.releaseAt&&Date.now()<Date.parse(t.releaseAt));
  const submission={id,user_id:read()?.user.id||'design-preview',instrument_id:t.id,version:t.version,snapshot:JSON.stringify(t),answers:JSON.stringify(answers),scores:JSON.stringify(evaluation.scores),created_at:new Date().toISOString(),resultReleased:released,...(released?{evaluation}:{})};
  values['rv360:submissions']=[submission,...(values['rv360:submissions']||[])];if(attempt){attempt.state='submitted';attempt.submission_id=id;}writeValues(values);return {id};
 }
 if(options.method&&options.method!=='GET')throw Error('Vista de diseño: esta operación se habilitará al conectar la base de datos. No se ha guardado ni enviado información.');
 if(path==='session'){
  const account=read(),admin=account?.user.role==='admin';
  const values={...currentValues(),'rv360:custom-tests':admin?(workspace()['rv360:custom-tests']||[]):published(),'rv360:admin-users':admin?localAccounts().filter(a=>a.user.role==='student').map(a=>({...a.user,...a.values['rv360:profile'],status:'Activo'})):[]};
  return {user:account?.user||null,values,revisions:{},mailConfigured:false,serviceAvailable:true};
 }
 if(path==='me/export')return {user:designUser(),values:currentValues()};
 if(path==='reports/guidance')return {items:[],configured:false};
 if(path==='admin/analytics')return {students:localAccounts().filter(a=>a.user.role==='student').length,active:localAccounts().filter(a=>a.user.role==='student').length,started:0,completed:0,reports:0,recent:[],studentProgress:[],groups:[],byTest:[],activity:[]};
 return {items:[]};
}
