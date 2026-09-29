import catalog from '../data/design-careers.json';
import { designUser, localAccounts } from './design-preview';
import { academicInstrument, academicResult, courseProgress, principalGrade, selectQuestions, simulatorProblems } from './training-engine';
import { matchesCourseProfile } from './course-links';

// Prototype data only. Shared between the two sample roles in this browser.
const KEY = 'rv360:local-training-v1';
const copy = <T,>(value:T):T => structuredClone(value);
const now = () => new Date().toISOString();
function seed():any {return {courses:[],simulators:[],profiles:[],enrollments:[],attempts:[],goals:{},users:[],catalog:copy(catalog),pendingCatalog:null};}
function read() {
  const value=localStorage.getItem(KEY);
  if(value){try{return JSON.parse(value);}catch{/* Recover only this prototype's invalid data. */}}
  const data=seed();save(data);return data;
}
function save(data:any){localStorage.setItem(KEY,JSON.stringify(data));}
function finish(a:any, reviews:any={},annulled:string[]=[]) {
  const s={...a.simulator,questions:a.simulator.questions.filter((q:any)=>!annulled.includes(q.id))};
  if(!s.questions.length)throw Error('Conserva al menos una pregunta para calcular esta actividad.');
  const answers={...a.answers,...a.confirmed};
  const result=academicResult(s,answers,reviews);
  a.result={...result,answers,reviews,annulled,revision:(a.result?.revision||0)+1};
  a.state=result.state==='pending-review'?'pending-review':'graded';
  a.finished_at=now();
  a.resultHistory=[...(a.resultHistory||[]),{revision:a.result.revision,created_at:now(),reason:'Revisión en el diseño interactivo'}];
}
function attemptView(a:any){return {...a,serverTime:now(),privateQuestions:a.simulator.questions,explanations:a.simulator.questions.map((q:any)=>({id:q.id,text:q.explanation||''}))};}
function progress(data:any,e:any){
  const attempts=data.attempts.filter((a:any)=>a.enrollment_id===e.id);
  const completed=e.snapshot.activities.filter((activity:any)=>activity.kind!=='simulator'?e.read.includes(activity.id):attempts.some((a:any)=>a.activity_id===activity.id&&a.result&&(activity.completion==='score'?(a.result.percent??-1)>=(activity.target||0):true))).map((a:any)=>a.id);
  const grades=e.snapshot.activities.flatMap((activity:any)=>['practice','exam'].flatMap(mode=>{
    const rows=attempts.filter((a:any)=>a.activity_id===activity.id&&a.mode===mode&&a.result?.percent!=null);
    return rows.length?[{activityId:activity.id,mode,version:rows[0].instrument.version,count:rows.length,percent:principalGrade(rows.map((a:any)=>a.result.percent),rows[0].simulator.gradePolicy)}]:[];
  }));
  const last=attempts.filter((a:any)=>a.result).at(-1);
  return {...e,completed,grades,progress:courseProgress(e.snapshot.activities,completed),next:e.snapshot.activities.find((a:any)=>!completed.includes(a.id)),latestResult:last?{...last.result,mode:last.mode}:null};
}
function requireAdmin(user:any){if(user.role!=='admin')throw Error('Abre la vista de administración para editar contenido.');}
export async function designTraining(path='',body?:any,method='GET'):Promise<any>{
  const data=read(),user=designUser(),b=body||{},route=path.split('?')[0];
  data.users=localAccounts().filter(a=>a.user.role==='student').map(a=>a.user);
  if(!data.users.some((u:any)=>u.id===user.id)&&user.role==='student')data.users.push(user);
  for(const a of data.attempts)if(a.state==='in_progress'&&a.expires_at&&Date.parse(a.expires_at)<=Date.now())finish(a);
  const goal=data.goals[user.id]||{careerIds:[],fields:[]};
  const getAttempt=()=>{const a=data.attempts.find((x:any)=>x.id===(b.id||new URLSearchParams(path.split('?')[1]).get('id')));if(!a||(user.role!=='admin'&&a.user_id!==user.id))throw Error('Intento no disponible en esta vista.');return a;};
  if(!route&&method==='GET'){
    const all=user.role==='admin';
    const courses=data.courses.filter((c:any)=>all||c.status==='published'&&(c.access!=='selected'||c.studentIds.includes(user.id))&&!data.courses.some((next:any)=>next.id===c.id&&next.status==='published'&&next.version>c.version));
    const selected=goal.careerIds.length?goal.careerIds:data.courses[0]?.careerIds||[];
    save(data);
    return {...data.catalog,users:data.users,profiles:data.profiles,simulators:data.simulators.map((s:any)=>({...s,questionCount:s.questions.length})),goal,recommendations:selected.map((careerId:string)=>({careerId,reason:goal.careerIds.length?'Carrera elegida para explorar.':'Sugerencia de actividad para recorrer el diseño.'})),courses:courses.map((c:any)=>({...c,recommended:matchesCourseProfile(c,goal)&&c.careerIds.some((id:string)=>selected.includes(id)),reasons:['Contenido de actividad para tu preparación.']})),enrollments:data.enrollments.filter((e:any)=>all||e.user_id===user.id).map((e:any)=>progress(data,e)),attempts:data.attempts.filter((a:any)=>all||a.user_id===user.id).map(attemptView)};
  }
  let result:any={ok:true};
  if(route==='/entity'){
    requireAdmin(user);
    const list=data[b.kind==='course'?'courses':b.kind==='simulator'?'simulators':'profiles'];
    const e=copy<any>(b.entity);
    if(!e.title?.trim())throw Error('Escribe un nombre para continuar.');
    if(e.status==='published'){
      if(b.kind==='simulator'){const errors=simulatorProblems(e);if(errors.length)throw Error(errors.join(' '));}
      if(b.kind==='course'){
        if(!e.description?.trim()||!e.careerIds.length||!e.activities.length)throw Error('Añade una descripción, una carrera y al menos una actividad.');
        for(const a of e.activities){if(!a.title.trim())throw Error('Completa los títulos de las actividades.');if(a.kind==='simulator'&&!data.simulators.some((s:any)=>s.id===a.simulatorId&&s.version===a.simulatorVersion&&s.status==='published'))throw Error('Selecciona un simulador publicado.');}
      }
    }
    e.id ||= crypto.randomUUID();
    const prior=list.find((x:any)=>x.id===e.id&&x.version===e.version);
    if(prior&&prior.revision!==e.revision)throw Error('El contenido cambió. Cierra el editor y vuelve a abrirlo.');
    e.version ||= Math.max(0,...list.filter((x:any)=>x.id===e.id).map((x:any)=>x.version))+1;
    e.revision=(prior?.revision||0)+1;
    const index=list.findIndex((x:any)=>x.id===e.id&&x.version===e.version);
    if(index>=0)list[index]=e;else list.push(e);
    result=e;
  }else if(route==='/archive'||route==='/delete-draft'){
    requireAdmin(user);const key=b.kind==='course'?'courses':b.kind==='simulator'?'simulators':'profiles';
    const e=data[key].find((x:any)=>x.id===b.id&&x.version===b.version);if(!e)throw Error('Contenido no encontrado.');
    if(route==='/archive')e.status='archived';else {if(e.status!=='draft')throw Error('Solo se descartan borradores.');data[key]=data[key].filter((x:any)=>x!==e);}
  }else if(route==='/goal')data.goals[user.id]=copy(b);
  else if(route==='/enroll'){
    if(b.studentId)requireAdmin(user);
    const who=b.studentId||user.id;
    const prior=data.enrollments.find((e:any)=>e.user_id===who&&e.course_id===b.courseId);
    const c=data.courses.filter((c:any)=>c.id===b.courseId&&c.status==='published').sort((a:any,b:any)=>b.version-a.version)[0];
    if(!c)throw Error('Publica el curso antes de probar la inscripción.');
    const e=prior||{id:crypto.randomUUID(),user_id:who,name:data.users.find((u:any)=>u.id===who)?.name||user.name,course_id:c.id,course_version:c.version,snapshot:copy(c),read:[],created_at:now(),origin:{local:true}};
    if(!prior)data.enrollments.push(e);result=progress(data,e);
  }else if(route==='/read'||route==='/start'){
    const e=data.enrollments.find((x:any)=>x.id===b.enrollmentId&&x.user_id===user.id);
    if(!e)throw Error('Primero inscríbete en el curso.');
    const activity=e.snapshot.activities.find((a:any)=>a.id===b.activityId);
    if(!activity)throw Error('Actividad no encontrada.');
    if(route==='/read'){if(!e.read.includes(activity.id))e.read.push(activity.id);result=progress(data,e);}
    else {
      const s=data.simulators.find((s:any)=>s.id===activity.simulatorId&&s.version===activity.simulatorVersion);
      if(!s||!s.modes.includes(b.mode))throw Error('Selecciona un simulador y una modalidad disponibles.');
      const prior=data.attempts.filter((a:any)=>a.enrollment_id===e.id&&a.activity_id===activity.id&&a.mode===b.mode);
      const open=prior.find((a:any)=>a.state==='in_progress');
      if(open)result=attemptView(open);else{
        if(prior.length>=s.maxAttempts)throw Error('Alcanzaste los intentos de esta actividad. ');
        const selected={...copy(s),questions:selectQuestions(s)},duration=b.mode==='exam'?s.durationMinutes:s.practiceDurationMinutes;
        const a={id:crypto.randomUUID(),user_id:user.id,name:user.name,enrollment_id:e.id,activity_id:activity.id,mode:b.mode,simulator:selected,instrument:academicInstrument(selected),feedback:s.feedback,answers:{},confirmed:{},flags:[],revision:0,state:'in_progress',started_at:now(),expires_at:duration?new Date(Date.now()+duration*60000).toISOString():null};
        data.attempts.push(a);result=attemptView(a);
      }
    }
  }else if(route==='/answers'){
    const a=getAttempt();if(a.state!=='in_progress')throw Error('Este intento ya terminó.');if(a.revision!==b.revision)throw Error('Recupera la versión guardada antes de continuar.');
    a.answers=copy(b.answers);a.flags=copy(b.flags);a.revision++;result=attemptView(a);
  }else if(route==='/finish'){const a=getAttempt();if(!a.result)finish(a);result=attemptView(a);}
  else if(route==='/attempt')result=attemptView(getAttempt());
  else if(route==='/feedback'){
    const a=getAttempt();if(a.mode!=='practice')throw Error('Las explicaciones aparecen al finalizar el examen.');
    const q=a.simulator.questions.find((q:any)=>q.id===b.questionId);if(!q)throw Error('Pregunta no encontrada.');
    if(!(q.id in a.confirmed))a.confirmed[q.id]=a.answers[q.id]??null;
    result={explanation:q.explanation||'Revisa el material del curso.',note:'Primera respuesta conservada en esta actividad.'};
  }else if(route==='/review'){
    requireAdmin(user);const a=getAttempt();if(!b.reason?.trim())throw Error('Escribe el motivo de la revisión.');finish(a,b.reviews,b.annulled);a.resultHistory.at(-1).reason=b.reason;result=attemptView(a);
  }else if(route==='/preview/select'){
    const errors=simulatorProblems(b.simulator);if(errors.length)throw Error(errors.join(' '));result={...b.simulator,questions:selectQuestions(b.simulator)};
  }else if(route==='/preview')result=academicResult(b.simulator,b.answers);
  else if(route==='/catalog/preview'){
    requireAdmin(user);if(!Array.isArray(b.input?.careers)||b.input.careers.some((c:any)=>!c.id||!c.name||!Array.isArray(c.offers)))throw Error('Revisa el formato del catálogo.');
    result={id:crypto.randomUUID(),added:b.input.careers.filter((c:any)=>!data.catalog.careers.some((x:any)=>x.id===c.id)),changed:b.input.careers.filter((c:any)=>data.catalog.careers.some((x:any)=>x.id===c.id)),absent:[],missingOffers:[],note:'El lote solo modificará esta configuración local en tu navegador.'};data.pendingCatalog={...result,input:b.input};
  }else if(route==='/catalog/apply'){
    requireAdmin(user);if(data.pendingCatalog?.id!==b.id)throw Error('Primero revisa el lote.');
    const items=data.pendingCatalog.input.careers;data.catalog.careers=[...data.catalog.careers.filter((c:any)=>!items.some((x:any)=>x.id===c.id)),...items];data.catalog.institutions=[...new Set(data.catalog.careers.flatMap((c:any)=>c.offers.map((o:any)=>o.institution)))];data.pendingCatalog=null;
  }else throw Error('Esta acción no está disponible en la configuración local.');
  save(data);return copy(result);
}

export function resetDesignTraining(){localStorage.removeItem(KEY);}
