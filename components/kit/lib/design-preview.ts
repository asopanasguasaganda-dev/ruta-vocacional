import {cloudAdmin,adminLogin,adminPassword} from './admin-session';
import nationalCatalog from '../data/design-careers.json';
import {localGuidance} from './local-guidance';
import {instruments} from '../data/instruments';
import {calculateTest,instrumentProblems,answerProblem,visibleQuestions} from './test-engine';
// Student data remains browser-local; cloud administrators authenticate on the server.
const key='rv360:local-accounts-v1',activeKey='rv360:local-session-v1';
export function localAccounts():any[]{try{return JSON.parse(localStorage.getItem(key)||'[]');}catch{return [];}}
function read(){return localAccounts().find(a=>a.user.id===sessionStorage.getItem(activeKey)&&(!a.user.status||a.user.status==='Activo')&&(a.authVersion||0)===Number(sessionStorage.getItem('rv360:local-auth-version')||0))||null;}
function write(account:any){const all=localAccounts(),i=all.findIndex(a=>a.user.id===account.user.id);if(i<0)all.push(account);else all[i]=account;localStorage.setItem(key,JSON.stringify(all));}
const workspaceKey='rv360:local-workspace-v1';
function workspace(){try{return JSON.parse(localStorage.getItem(workspaceKey)||'{}');}catch{return {};}}
function writeWorkspace(value:any){localStorage.setItem(workspaceKey,JSON.stringify(value));}
function currentValues(){return read()?.values||{};}
function writeValues(values:any){const account=read();if(!account)throw Error('Inicia sesión para continuar.');account.values=values;write(account);}
function published(user=read()?.user){const rows=(workspace()['rv360:custom-tests']||[]).filter((t:any)=>t.status==='Publicado'&&(user?.role==='admin'||(t.audience!=='selected'&&!t.studentId)||(t.studentIds||[t.studentId]).includes(user?.id)));return rows.filter((t:any)=>!rows.some((n:any)=>(n.stableId||n.id)===(t.stableId||t.id)&&(parseInt(n.version)||1)>(parseInt(t.version)||1)));}
function originalStatuses(){return workspace()['rv360:admin-original-status']||{};}
function availableOriginals(user=read()?.user){return instruments.filter(t=>!['Archivado','Eliminado'].includes(originalStatuses()[t.id])&&!published(user).some((c:any)=>(c.stableId||c.id)===t.id));}
export function localAssignedTestIds(user:any){return [...availableOriginals(user),...published(user)].map(t=>t.id);}
function studentTests(){const tests=published();for(const a of currentValues()['rv360:attempts']||[]){if(a.state==='in_progress'&&a.snapshot&&!tests.some((t:any)=>t.id===a.instrument_id))tests.push(JSON.parse(a.snapshot));}return tests;}
function evaluationWithCareers(r:any){return {...r,careers:r.careers.map((link:any)=>{const c=nationalCatalog.careers.find(c=>c.id===link.careerId);return {...link,careerName:c?.name,offers:c?.offers||[],sourceUrl:nationalCatalog.source.sourceUrl};})};}
function visibleSubmission(s:any,admin=false){const t=JSON.parse(s.snapshot);const released=s.resultReleased!==false||(t.resultPublication==='date'&&Date.now()>=Date.parse(t.releaseAt)&&s.evaluation?.state!=='pending-review');return admin?{...s,resultReleased:released}:released?{...s,resultReleased:true}:{...s,evaluation:undefined,scores:'[]',resultReleased:false};}
function testById(id:string){const active=(currentValues()['rv360:attempts']||[]).find((a:any)=>a.instrument_id===id&&a.state==='in_progress'&&a.snapshot);const t=active?JSON.parse(active.snapshot):[...availableOriginals(),...published()].find(t=>t.id===id);if(!t)throw Error('El test no está publicado.');return t;}
export function designLogout(){sessionStorage.removeItem(activeKey);sessionStorage.removeItem('rv360:return-admin');}
export function designUser(){const account=read();if(!account)throw Error('Inicia sesión para continuar.');return account.user;}
export function designSave(key:string,value:unknown){const user=designUser();if(key.startsWith('rv360:admin-')||key==='rv360:custom-tests'){if(user.role!=='admin')throw Error('Acceso administrativo requerido.');}if(key==='rv360:admin-settings'){writeWorkspace({...workspace(),[key]:value});return;}if(key==='rv360:admin-original-status'){if(!value||typeof value!=='object'||Array.isArray(value)||Object.entries(value).some(([id,status])=>!instruments.some(t=>t.id===id)||!['Original','Archivado','Eliminado'].includes(String(status))))throw Error('Estado de test inválido.');writeWorkspace({...workspace(),[key]:value});return;}if(key==='rv360:custom-tests'){
 const prior=workspace()[key]||[];const items=value as any[];
 const content=(t:any)=>JSON.stringify({...t,status:undefined});
 for(const old of prior){if(old.status==='Borrador')continue;const next=items.find(t=>t.id===old.id);if(!next)throw Error('Archiva las versiones publicadas; sus resultados deben conservarse.');if(next.status==='Borrador'||content(old)!==content(next))throw Error('Crea una nueva versión para modificar un test publicado.');}
 for(const t of items){if(t.status==='Publicado'){for(const link of t.careerLinks||[])if(!nationalCatalog.careers.some(c=>c.id===link.careerId))throw Error('Selecciona una carrera del catálogo antes de publicar.');const issues=instrumentProblems(t);if(issues.length)throw Error(issues[0].message);}}const w=workspace();w[key]=value;const states={...originalStatuses()};for(const t of items){if(t.status==='Publicado'&&t.stableId&&!prior.some((old:any)=>old.id===t.id&&old.status==='Publicado')&&instruments.some(i=>i.id===t.stableId))states[t.stableId]='Archivado';}w['rv360:admin-original-status']=states;writeWorkspace(w);}else writeValues({...currentValues(),[key]:value});}
async function verifier(password:string,salt:string){const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},material,256);return Array.from(new Uint8Array(bits),v=>v.toString(16).padStart(2,'0')).join('');}
// Browser persistence with server-backed administrative publication sessions.
export async function designRequest(path:string,options:RequestInit={}){
 const body=options.body?JSON.parse(String(options.body)):{};
 if(['admin/test-as-student','local/return-admin'].includes(path))throw Error('Esta operacion no esta disponible.');
 if(path==='auth/local-status')return {adminExists:cloudAdmin()||localAccounts().some(a=>a.user.role==='admin')};
 if((path==='auth/register'||path==='auth/local-admin')&&options.method==='POST'){
  sessionStorage.removeItem('rv360:return-admin');
  const admin=path==='auth/local-admin';if(admin&&cloudAdmin())throw Error('Inicia sesion con tu cuenta administrativa.');
  if(!admin&&workspace()['rv360:admin-settings']?.selfRegistration==='no')throw Error('Los registros están cerrados. Contacta con administración para crear tu cuenta.');
  if(admin&&localAccounts().some(a=>a.user.role==='admin'))throw Error('La cuenta administrativa ya está configurada.');
  if(!body.name?.trim()||!/^\S+@\S+\.\S+$/.test(body.email||'')||typeof body.password!=='string'||body.password.length<8||body.password.length>128)throw Error('Revisa nombre, correo y contraseña (8 a 128 caracteres).');
  if(localAccounts().some(a=>a.user.email===body.email.trim().toLowerCase()))throw Error('Este correo ya está registrado en este navegador.');
  const salt=crypto.randomUUID(),user={id:crypto.randomUUID(),name:body.name.trim(),email:body.email.trim().toLowerCase(),role:admin?'admin':'student',institutionId:'local',group:''};
  const {password,admin:ignored,...profile}=body;
  write({user,salt,verifier:await verifier(password,salt),values:{'rv360:profile':{...profile,name:user.name,email:user.email}}});sessionStorage.setItem(activeKey,user.id);sessionStorage.setItem('rv360:local-auth-version','0');return {user};
 }
 if(path==='auth/login'&&options.method==='POST'){
  if(body.admin&&cloudAdmin()){
   const user=await adminLogin(String(body.email).trim().toLowerCase(),body.password);
   const prior=localAccounts().find(a=>a.user.id===user.id||a.user.email===user.email);
   const salt=crypto.randomUUID();write({user,salt,verifier:await verifier(body.password,salt),values:prior?.values||{'rv360:profile':{name:user.name,email:user.email}}});
   sessionStorage.setItem(activeKey,user.id);sessionStorage.setItem('rv360:local-auth-version','0');return {user};
  }

  sessionStorage.removeItem('rv360:return-admin');
  const account=localAccounts().find(a=>a.user.email===String(body.email).trim().toLowerCase()&&(body.admin?a.user.role==='admin':['student','orientador'].includes(a.user.role)));
  if(!account||(account.user.status&&account.user.status!=='Activo')||typeof body.password!=='string'||account.verifier!==await verifier(body.password,account.salt))throw Error('Correo o contraseña incorrectos. Usa una cuenta creada en este navegador.');
  sessionStorage.setItem(activeKey,account.user.id);sessionStorage.setItem('rv360:local-auth-version',String(account.authVersion||0));return {user:account.user};
 }
 if(path==='admin/users'&&options.method==='POST'){
  if(designUser().role!=='admin')throw Error('Acceso administrativo requerido.');
  const all=localAccounts(),target=all.find(a=>a.user.id===body.id);
  if(body.action){
   if(!target||target.user.role==='admin')throw Error('Cuenta no disponible.');
   if(body.action==='delete'){const training=JSON.parse(localStorage.getItem('rv360:local-training-v1')||'{}');if(target.values['rv360:submissions']?.length||(training.attempts||[]).some((a:any)=>a.user_id===target.user.id))throw Error('Esta cuenta tiene entregas o intentos. Suspende el acceso para conservarlos.');localStorage.setItem(key,JSON.stringify(all.filter(a=>a!==target)));return {ok:true};}
   if(body.action==='reset-password'){if(typeof body.password!=='string'||body.password.length<8||body.password.length>128||body.password!==body.confirmPassword)throw Error('Revisa la contraseña y su confirmación.');target.salt=crypto.randomUUID();target.verifier=await verifier(body.password,target.salt);target.authVersion=(target.authVersion||0)+1;write(target);return {ok:true};}
   throw Error('Acción no válida.');
  }
  const u=body.user||{...body,id:body.id||crypto.randomUUID()};
  if(!u||typeof u.id!=='string'||!u.name?.trim()||!/^\S+@\S+\.\S+$/.test(u.email||'')||!['Estudiante','Orientador'].includes(u.role)||!['Activo','Suspendido'].includes(u.status))throw Error('Revisa los datos de la cuenta.');
  const accounts=localAccounts(),prior=accounts.find(a=>a.user.id===u.id),email=u.email.trim().toLowerCase();
  if(prior?.user.role==='admin')throw Error('Edita el administrador desde Mi cuenta.');
  if(accounts.some(a=>a.user.email===email&&a.user.id!==u.id))throw Error('Ya existe una cuenta con ese correo.');
  if(prior&&prior.user.email!==email)throw Error('El correo identifica la cuenta y no puede cambiarse.');
  if(!prior&&(typeof body.password!=='string'||body.password.length<8||body.password.length>128))throw Error('Define una contraseña inicial de 8 a 128 caracteres.');
  const user={id:u.id,name:u.name.trim(),email,group:String(u.group||'').trim(),status:u.status,role:u.role==='Orientador'?'orientador':'student',institutionId:'local'};
  const account=prior||{user,values:{},salt:crypto.randomUUID(),verifier:''};
  if(!prior)account.verifier=await verifier(body.password,account.salt);
  if(prior&&prior.user.role!==user.role)account.authVersion=(account.authVersion||0)+1;account.user=user;account.values['rv360:profile']={...account.values['rv360:profile'],name:user.name,email:user.email,group:user.group,stage:u.stage||'',institution:u.institution||''};write(account);return {ok:true};
 }
 if(path==='account/password'&&options.method==='POST'){
  const a=read();if(!a)throw Error('Inicia sesión para continuar.');if(typeof body.currentPassword!=='string'||await verifier(body.currentPassword,a.salt)!==a.verifier)throw Error('La contraseña actual es incorrecta.');if(typeof body.password!=='string'||body.password.length<8||body.password.length>128||body.password!==body.confirm)throw Error('Revisa la nueva contraseña y su confirmación.');if(a.user.role==='admin'&&cloudAdmin())await adminPassword(body);a.salt=crypto.randomUUID();a.verifier=await verifier(body.password,a.salt);a.authVersion=(a.authVersion||0)+1;write(a);sessionStorage.setItem('rv360:local-auth-version',String(a.authVersion));return {ok:true};
 }
 if(path==='account/photo'){
  designUser();if(options.method==='DELETE'){writeValues({...currentValues(),'rv360:profile':{...currentValues()['rv360:profile'],photo:''}});return {ok:true};}
  if(options.method==='POST'){if(typeof body.photo!=='string'||!/^data:image\/(png|jpeg|webp);base64,/.test(body.photo)||body.photo.length>500000)throw Error('La imagen no es válida o es demasiado grande.');writeValues({...currentValues(),'rv360:profile':{...currentValues()['rv360:profile'],photo:body.photo}});return {ok:true};}
 }
 if(path==='me/export'){const user=designUser(),values=Object.fromEntries(Object.entries(currentValues()).filter(([key])=>!key.startsWith('rv360:admin-')&&key!=='rv360:custom-tests'));const training=JSON.parse(localStorage.getItem('rv360:local-training-v1')||'{}');return {user,values,preparation:{attempts:(training.attempts||[]).filter((a:any)=>a.user_id===user.id),enrollments:(training.enrollments||[]).filter((a:any)=>a.user_id===user.id)}};}
 if(path==='auth/password-reset')throw Error('No hay envío de correos en esta etapa. El acceso utiliza la contraseña creada en este navegador.');
 if(path==='account/profile'&&options.method==='PUT'){
  const account=read();if(!account)throw Error('Inicia sesión para editar tus datos.');
  if(!body.firstName?.trim()||!body.lastName?.trim())throw Error('Completa nombres y apellidos.');
  account.user.name=body.firstName.trim()+' '+body.lastName.trim();account.values['rv360:profile']={...account.values['rv360:profile'],...body,name:account.user.name,email:account.user.email};write(account);return {ok:true};
 }

 if(path==='admin/tests/review'){
  if(designUser().role!=='admin')throw Error('Acceso administrativo requerido.');
  if(!body.reason?.trim())throw Error('Escribe el motivo de la revisión.');
  const account=localAccounts().find(a=>(a.values['rv360:submissions']||[]).some((s:any)=>s.id===body.id));
  const submission=account?.values['rv360:submissions'].find((s:any)=>s.id===body.id);if(!submission)throw Error('Entrega no encontrada.');
  const r=calculateTest(JSON.parse(submission.snapshot),JSON.parse(submission.answers),body.reviews);
  submission.evaluation={...evaluationWithCareers(r),revision:(submission.evaluation?.revision||0)+1};submission.scores=JSON.stringify(r.scores);write(account);return {ok:true};
 }
 if(path==='admin/results/release'){
  if(designUser().role!=='admin')throw Error('Acceso administrativo requerido.');
  const account=localAccounts().find(a=>(a.values['rv360:submissions']||[]).some((s:any)=>s.id===body.id));
  const submission=account?.values['rv360:submissions'].find((s:any)=>s.id===body.id);if(!submission)throw Error('Entrega no encontrada.');
  if(!submission.evaluation||submission.evaluation.state==='pending-review')throw Error('Completa la evaluación antes de publicar el resultado.');
  submission.resultReleased=true;write(account);return {ok:true};
 }
 if(path==='admin/tests/preview')return {...calculateTest(body.instrument,body.answers),persisted:false};
 if(path==='admin/tests/careers')return {careers:nationalCatalog.careers};
 if(path==='assessments/start'){
  const t=testById(body.instrumentId),values=currentValues(),attempts=values['rv360:attempts']||[];
  const previous=attempts.find((a:any)=>a.instrument_id===t.id&&a.state==='in_progress');if(previous)return previous;
  if(t.maxAttempts&&attempts.filter((a:any)=>a.stable_id===(t.stableId||t.id)).length>=t.maxAttempts)throw Error('Alcanzaste el máximo de intentos.');
  const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Guayaquil'});if(t.availableFrom&&today<t.availableFrom||t.due&&today>t.due)throw Error('El test no está disponible en esta fecha.');
  const attempt={id:crypto.randomUUID(),instrument_id:t.id,stable_id:t.stableId||t.id,state:'in_progress',snapshot:JSON.stringify(t),started_at:new Date().toISOString()};values['rv360:attempts']=[...attempts,attempt];values['rv360:answers:'+t.id+':'+t.version]={};writeValues(values);return attempt;
 }
 if(path==='assessments/submit'){
  const t=testById(body.instrumentId),values=currentValues(),answers=values['rv360:answers:'+t.id+':'+t.version]||{},attempts=values['rv360:attempts']||[],attempt=attempts.find((a:any)=>a.instrument_id===t.id&&a.state==='in_progress');
  const previous=(values['rv360:submissions']||[]).find((s:any)=>s.instrument_id===t.id&&s.version===t.version);if(previous&&!attempt)return {id:previous.id};
  if(t.schemaVersion===2&&!attempt)throw Error('Confirma el inicio del intento.');
  if(attempt&&t.durationMinutes&&Date.now()>Date.parse(attempt.started_at)+t.durationMinutes*60000)throw Error('El tiempo del intento terminó.');
  for(const q of visibleQuestions(t,answers)){const problem=answerProblem(t,q,answers[q.id]);if(problem)throw Error(q.text+': '+problem);}
  const original=['intereses','valores','autoconocimiento'].includes(t.id),evalTest=original?{...t,scoring:'dimensions' as const,aggregation:'sum' as const}:t;
  const calculated=calculateTest(evalTest,answers);const evaluation={...evaluationWithCareers(calculated),revision:1};const id=crypto.randomUUID();
  const released=evaluation.state!=='pending-review'&&t.resultPublication!=='review'&&!(t.resultPublication==='date'&&t.releaseAt&&Date.now()<Date.parse(t.releaseAt));
  const submission={id,user_id:read()?.user.id||'design-preview',instrument_id:t.id,version:t.version,snapshot:JSON.stringify(t),answers:JSON.stringify(answers),scores:JSON.stringify(evaluation.scores),created_at:new Date().toISOString(),resultReleased:released,evaluation};
  values['rv360:submissions']=[submission,...(values['rv360:submissions']||[])];if(attempt){attempt.state='submitted';attempt.submission_id=id;}writeValues(values);return {id};
 }
 if(path==='reports/guidance'){const user=designUser(),accounts=user.role==='admin'?localAccounts().filter(a=>a.user.role==='student'):[read()];const items=accounts.map(a=>localGuidance(a.user,(a.values['rv360:submissions']||[]).map((s:any)=>visibleSubmission(s)),localAssignedTestIds(a.user))).filter(Boolean);return options.method==='POST'?items[0]:{items,configured:true};}
 if(options.method&&options.method!=='GET')throw Error('Vista de diseño: esta operación se habilitará al conectar la base de datos. No se ha guardado ni enviado información.');
 if(path==='session'){
  const account=read(),admin=account?.user.role==='admin';
  let connection=null;
  if(account){let workspaceId=localStorage.getItem('rv360:workspace-id-v1');if(!workspaceId){workspaceId=crypto.randomUUID();localStorage.setItem('rv360:workspace-id-v1',workspaceId);}const tests=workspace()['rv360:custom-tests']||[];connection={workspaceId,published:tests.filter((t:any)=>t.status==='Publicado').length,drafts:tests.filter((t:any)=>t.status==='Borrador').length,assigned:published(account.user).length,originals:availableOriginals(account.user).length};}
  const values={...currentValues(),'rv360:local-connection':connection,'rv360:admin-settings':workspace()['rv360:admin-settings']||currentValues()['rv360:admin-settings'],'rv360:admin-original-status':originalStatuses(),'rv360:available-originals':availableOriginals().map(t=>t.id),...(admin?{'rv360:submissions':localAccounts().filter(a=>a.user.role==='student').flatMap(a=>a.values['rv360:submissions']||[])}:{}),'rv360:custom-tests':admin?(workspace()['rv360:custom-tests']||[]):studentTests(),'rv360:admin-users':admin?localAccounts().filter(a=>a.user.role!=='admin').map(a=>({...a.values['rv360:profile'],...a.user,role:a.user.role==='orientador'?'Orientador':'Estudiante',status:a.user.status||'Activo'})):[]};
  values['rv360:submissions']=(values['rv360:submissions']||[]).map((s:any)=>visibleSubmission(s,admin));
  return {user:account?.user||null,values,revisions:{},mailConfigured:false,serviceAvailable:true};
 }
 if(path==='me/export')return {user:designUser(),values:currentValues()};

 if(path==='admin/analytics')return {students:localAccounts().filter(a=>a.user.role==='student').length,active:localAccounts().filter(a=>a.user.role==='student').length,started:0,completed:0,reports:0,recent:[],studentProgress:[],groups:[],byTest:[],activity:[]};
 return {items:[]};
}
