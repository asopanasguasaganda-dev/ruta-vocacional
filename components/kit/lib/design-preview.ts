import {instruments} from '../data/instruments';
import {calculateTest,instrumentProblems,answerProblem,visibleQuestions} from './test-engine';
// Browser-only rehearsal. No server account and no plaintext password storage.
const key='rv360:design-account',activeKey='rv360:design-active';
function read(){try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}}
function write(account:any){sessionStorage.setItem(key,JSON.stringify(account));}
const workspaceKey='rv360:design-workspace';
function workspace(){try{return JSON.parse(sessionStorage.getItem(workspaceKey)||'{}');}catch{return {};}}
function writeWorkspace(value:any){sessionStorage.setItem(workspaceKey,JSON.stringify(value));}
function currentValues(){return read()?.values||workspace().studentValues||{};}
function writeValues(values:any){const account=read();if(account){account.values=values;write(account);}else{const w=workspace();w.studentValues=values;writeWorkspace(w);}}
function published(){return (workspace()['rv360:custom-tests']||[]).filter((t:any)=>t.status==='Publicado');}
function testById(id:string){const t=[...instruments,...published()].find(t=>t.id===id);if(!t)throw Error('El test no está publicado en esta pestaña.');return t;}
export function designLogout(){sessionStorage.setItem(activeKey,'signed-out');}
export function enterDesignRole(role:'student'|'admin'){
 sessionStorage.setItem('rv360:design-role',role);
 sessionStorage.setItem(activeKey,'demo');
}
export function designUser(){
 const admin=location.pathname.startsWith('/mi-ruta')?false:location.pathname.startsWith('/admin')||sessionStorage.getItem('rv360:design-role')==='admin';
 const account=read();
 if(!admin&&account&&sessionStorage.getItem(activeKey)==='yes')return account.user;
 return {id:admin?'design-admin':'design-student',name:admin?'Administrador de muestra':'Estudiante de muestra',email:admin?'admin@example.test':'estudiante@example.test',role:admin?'admin':'student',institutionId:'design',group:'Diseño'};
}
export function designSave(key:string,value:unknown){if(key==='rv360:custom-tests'){for(const t of value as any[]){if(t.status==='Publicado'){const issues=instrumentProblems(t);if(issues.length)throw Error(issues[0].message);}}const w=workspace();w[key]=value;writeWorkspace(w);}else writeValues({...currentValues(),[key]:value});}
async function verifier(password:string,salt:string){const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},material,256);return Array.from(new Uint8Array(bits),v=>v.toString(16).padStart(2,'0')).join('');}
// Isolated synthetic design context. No network, credentials or database.
export async function designRequest(path:string,options:RequestInit={}){
 const body=options.body?JSON.parse(String(options.body)):{};
 if(path==='auth/register'&&options.method==='POST'){
  if(!body.name?.trim()||!/^\S+@\S+\.\S+$/.test(body.email||'')||typeof body.password!=='string'||body.password.length<8||body.password.length>128)throw Error('Revisa nombre, correo y contraseña (8 a 128 caracteres).');
  if(read())throw Error('Ya hay una cuenta de prueba en esta pestaña. Ingresa con ella o abre una pestaña nueva.');
  const salt=crypto.randomUUID(),user={id:'design-'+crypto.randomUUID(),name:body.name.trim(),email:body.email.trim().toLowerCase(),role:'student',institutionId:'design',group:''};
  const {password,admin,...profile}=body;
  write({user,salt,verifier:await verifier(password,salt),values:{'rv360:profile':{...profile,name:user.name,email:user.email}}});sessionStorage.setItem(activeKey,'yes');return {user};
 }
 if(path==='auth/login'&&options.method==='POST'){
  const account=read();if(body.admin||!account||account.user.email!==String(body.email).trim().toLowerCase()||typeof body.password!=='string'||account.verifier!==await verifier(body.password,account.salt))throw Error('No coincide con la cuenta de prueba de esta pestaña. Revisa tus datos o crea una cuenta de prueba.');
  sessionStorage.setItem(activeKey,'yes');return {user:account.user};
 }
 if(path==='account/profile'&&options.method==='PUT'){
  const account=read();if(!account||sessionStorage.getItem(activeKey)!=='yes')throw Error('Crea una cuenta de prueba para editar tus datos en esta pestaña.');
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
  const admin=location.pathname.startsWith('/admin'),account=read(),active=sessionStorage.getItem(activeKey);
  const values={...currentValues(),'rv360:custom-tests':admin?(workspace()['rv360:custom-tests']||[]):published(),'rv360:admin-users':[]};
  if(!admin&&account&&active==='yes')return {user:account.user,values,revisions:{},mailConfigured:false,serviceAvailable:true};
  const publicPage=['/','/ingresar','/registro','/recuperar','/admin/login','/restablecer'].includes(location.pathname.replace(/\/$/,'')||'/');
  const user=publicPage||active==='signed-out'?null:designUser();
  return {user,values:{...values,'rv360:admin-settings':{name:'Ruta Vocacional 360°'},'rv360:profile':admin?{name:'Administrador de muestra',email:'admin@example.test'}:values['rv360:profile']||{name:'Estudiante de muestra',email:'estudiante@example.test'}},revisions:{},mailConfigured:false,serviceAvailable:true};
 }
 if(path==='reports/guidance')return {items:[],configured:false};
 if(path==='admin/analytics')return {students:0,active:0,started:0,completed:0,reports:0,recent:[],studentProgress:[],groups:[],byTest:[],activity:[]};
 return {items:[]};
}
