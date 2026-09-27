import type {Instrument,Question} from '../types';
class TestError extends Error{status=400;}
export const ENGINE_VERSION='2.0.0';
export const QUESTION_TYPES={single:'Selección única',multiple:'Selección múltiple',yesno:'Sí / No',likert:'Escala',number:'Número',short:'Texto breve',open:'Texto largo',matrix:'Matriz',ranking:'Ordenar opciones',info:'Información'} as const;
export type AnswerMap=Record<string,unknown>;
export type Reviews=Record<string,Record<string,string>>;
export type Score={dimension:string;raw:number;value:number;min:number;max:number;normalized?:number;band?:string;answered:number;applicable:number};
export const absent=(v:unknown)=>v===undefined||v===null||v===''||Array.isArray(v)&&v.length===0;
const opts=(t:Instrument,q:Question)=>q.options||t.options;
export function visibleQuestions(t:Instrument,a:AnswerMap){
 const state=new Map<string,boolean>(),visiting=new Set<string>();
 const visible=(q:Question):boolean=>{if(state.has(q.id))return state.get(q.id)!;if(visiting.has(q.id))throw new TestError('Hay un ciclo en las condiciones de visibilidad.');visiting.add(q.id);const c=q.visibleWhen,ref=c&&t.questions.find(x=>x.id===c.questionId);const v=c?a[c.questionId]:undefined;const yes=!c||!!ref&&visible(ref)&&!absent(v)&&(c.operator==='equals'?v===c.value:c.operator==='notEquals'?v!==c.value:Array.isArray(v)&&v.includes(c.value));visiting.delete(q.id);state.set(q.id,yes);return yes;};
 return t.questions.filter(visible);
}
export function answerProblem(t:Instrument,q:Question,v:unknown,partial=false):string|undefined{
 if(q.type==='info')return;
 if(absent(v))return partial||q.required===false?undefined:'Responde esta pregunta.';
 const choices=opts(t,q),multi=(x:unknown)=>Array.isArray(x)&&x.length>=(partial?0:q.minSelections??1)&&x.length<=(q.maxSelections??choices.length)&&new Set(x).size===x.length&&x.every(n=>choices.some(o=>o.value===n))&&(!(q.exclusiveValue!==undefined&&x.includes(q.exclusiveValue))||x.length===1);
 if(q.type==='open'||q.type==='short')return typeof v==='string'&&v.trim().length>=(q.minLength??1)&&v.length<=(q.maxLength??10000)?undefined:'Revisa la longitud del texto.';
 if(q.type==='number')return typeof v==='number'&&Number.isFinite(v)&&v>=(q.min??-Infinity)&&v<=(q.max??Infinity)&&(!(q.step&&q.min!==undefined)||Math.abs((v-q.min)/q.step-Math.round((v-q.min)/q.step))<1e-8)?undefined:'Introduce un número dentro del intervalo y paso indicados.';
 if(q.type==='multiple')return multi(v)?undefined:'Revisa el mínimo, máximo y las opciones exclusivas de la selección.';
 if(q.type==='matrix'){if(typeof v!=='object'||Array.isArray(v)||v===null)return 'Responde las filas de la matriz.';const rows=q.rows||[],map=v as AnswerMap;if(Object.keys(map).some(id=>!rows.some(r=>r.id===id)))return 'La matriz contiene una fila desconocida.';return rows.every(r=>partial&&absent(map[r.id])||(q.matrixMultiple?multi(map[r.id]):choices.some(o=>o.value===map[r.id])))?undefined:'Responde cada fila de la matriz con opciones válidas.';}
 if(q.type==='ranking')return Array.isArray(v)&&(partial?v.length<=choices.length:v.length===choices.length)&&new Set(v).size===v.length&&v.every(n=>choices.some(o=>o.value===n))?undefined:'Ordena todas las opciones una sola vez.';
 return choices.some(o=>o.value===v)?undefined:'Selecciona una opción válida.';
}
export function instrumentProblems(t:Instrument){
 const errors:{questionId?:string;step:number;message:string}[]=[];
 const add=(message:string,step=2,questionId?:string)=>errors.push({message,step,questionId});
 if(!t.title?.trim())add('Escribe un nombre para el test.',0);
 if(t.audience==='selected'&&!t.studentIds?.length)add('Selecciona al menos un estudiante o cambia a todos los estudiantes.',3);
 if(!t.questions?.length||t.questions.length>500)add('Añade entre 1 y 500 preguntas.',1);
 if(!['manual','total','dimensions','objective','rubric','mixed',undefined].includes(t.scoring))add('Selecciona un método de evaluación admitido.');
 if(t.schemaVersion===2&&t.scoring&&t.scoring!=='manual'&&!t.source?.trim())add('Documenta la fuente y el método de evaluación.',0);
 if(t.schemaVersion===2&&t.scoring==='dimensions'&&!t.dimensions?.length)add('Añade las dimensiones que se van a medir.');
 const ids=new Set<string>();
 const dimensions=new Set(t.dimensions?.map(d=>d.id)||[]);
 if(t.dimensions?.some(d=>!d.id||!d.name.trim())||dimensions.size!==(t.dimensions?.length||0))add('Revisa los nombres e identificadores de las dimensiones.');
 for(const q of t.questions||[]){
  if(!q.id||ids.has(q.id))add('Identificador de pregunta repetido.',1,q.id);ids.add(q.id);
  if(!q.text?.trim())add('Escribe el enunciado.',1,q.id);
  if(!Object.keys(QUESTION_TYPES).includes(q.type||'likert'))add('Tipo de pregunta no admitido.',1,q.id);
  if(q.weight!==undefined&&(!Number.isFinite(q.weight)||q.weight<0))add('El peso debe ser finito y no negativo.',2,q.id);
  const choices=opts(t,q)||[];
  if(choices.length>100)add('Usa como máximo 100 opciones por pregunta.',1,q.id);
  if(q.exclusiveValue!==undefined&&!choices.some(o=>o.value===q.exclusiveValue))add('La opción exclusiva ya no existe.',1,q.id);
  if(q.exclusiveValue!==undefined&&(q.minSelections??1)>1)add('Una opción exclusiva requiere un mínimo de selección de uno.',1,q.id);
  if(!['info','open','short','number'].includes(q.type||'')){
   if(choices.length<2||choices.some(o=>!o.label?.trim()||!Number.isFinite(o.value))||new Set(choices.map(o=>o.value)).size!==choices.length)add('Define al menos dos opciones con identificadores únicos.',1,q.id);
   if(choices.some(o=>o.points!==undefined&&!Number.isFinite(o.points)||Object.values(o.contributions||{}).some(n=>!Number.isFinite(n))))add('Las puntuaciones deben ser números finitos.',2,q.id);
   if(choices.some(o=>Object.keys(o.contributions||{}).some(d=>!dimensions.has(d))))add('Una contribución apunta a una dimensión que ya no existe.',2,q.id);
  }
  if(['multiple','matrix'].includes(q.type||'')&&(q.minSelections!==undefined&&(!Number.isInteger(q.minSelections)||q.minSelections<1)||q.maxSelections!==undefined&&(!Number.isInteger(q.maxSelections)||q.maxSelections<(q.minSelections??1)||q.maxSelections>choices.length)))add('El mínimo y máximo de selecciones no son válidos.',1,q.id);
  if(q.type==='number'&&(!Number.isFinite(q.min)||!Number.isFinite(q.max)||q.min!>q.max!||q.step!==undefined&&(!Number.isFinite(q.step)||q.step<=0)))add('Define los límites numéricos y un paso positivo.',1,q.id);
  if(q.type==='matrix'&&(!q.rows?.length||q.rows.some(r=>!r.id||!r.label.trim())||new Set(q.rows.map(r=>r.id)).size!==q.rows.length))add('Define filas únicas y con nombre.',1,q.id);
  if(q.visibleWhen){const ref=t.questions.find(x=>x.id===q.visibleWhen!.questionId);if(!ref||ref.id===q.id||!['single','multiple','likert','yesno'].includes(ref.type||'likert')||!opts(t,ref).some(o=>o.value===q.visibleWhen!.value))add('Revisa la pregunta y opción de la condición.',1,q.id);}
  const policy=q.policy||t.scoring||'manual';
  if(q.policy&&!['none','total','dimensions','objective','rubric'].includes(q.policy))add('Selecciona una política de puntuación válida.',2,q.id);
  if(t.schemaVersion===2&&policy==='dimensions'&&choices.length&&choices.some(o=>!Object.keys(o.contributions||{}).length))add('Configura la contribución de cada opción; escribe cero cuando no aporte.',2,q.id);
  if(q.rubric&&(new Set(q.rubric.map(r=>r.id)).size!==q.rubric.length||q.rubric.some(r=>!r.id||new Set(r.levels.map(l=>l.id)).size!==r.levels.length||r.levels.some(l=>!l.id))))add('Los criterios y niveles necesitan identificadores únicos.',2,q.id);
  if(t.scoring==='mixed'&&!q.policy&&q.type!=='info')add('En un test mixto, indica cómo se evalúa cada pregunta.',2,q.id);
  if(q.inverse&&(q.type==='ranking'||choices.some(o=>Object.keys(o.contributions||{}).length)))add('No combines inversión automática con contribuciones manuales o posiciones.',2,q.id);
  if(q.type==='ranking'&&q.rankingPoints?.some(n=>!Number.isFinite(n)))add('Los multiplicadores de posición deben ser finitos.',2,q.id);
  if(q.minLength!==undefined&&(!Number.isInteger(q.minLength)||q.minLength<0)||q.maxLength!==undefined&&(!Number.isInteger(q.maxLength)||q.maxLength<(q.minLength??1)||q.maxLength>10000))add('Revisa los límites de longitud del texto.',1,q.id);
  if(policy==='objective'){
   if(['single','multiple','yesno'].includes(q.type||'')){if(!q.correctValues?.length||q.correctValues.some(v=>!choices.some(o=>o.value===v))||q.type!=='multiple'&&q.correctValues.length!==1)add('Selecciona la clave correcta.',2,q.id);}
   else if(q.type==='short'){if(!q.acceptedTexts?.some(v=>v.trim()))add('Define las respuestas de texto aceptadas.',2,q.id);}
   else if(q.type==='number'){if(!q.numericKey||!Number.isFinite(q.numericKey.min)||!Number.isFinite(q.numericKey.max)||q.numericKey.min>q.numericKey.max)add('Define el intervalo correcto.',2,q.id);}
   else if(q.type!=='info')add('Este formato no admite claves objetivas; selecciona otra política.',2,q.id);
   if(q.inverse)add('No combines inversión con clave objetiva.',2,q.id);
   if(q.type==='multiple'&&q.correctValues&&(q.correctValues.length<(q.minSelections??1)||q.correctValues.length>(q.maxSelections??choices.length)))add('La clave correcta debe respetar los límites de selección.',2,q.id);
   if(q.type==='number'&&q.numericKey&&(q.numericKey.min<q.min!||q.numericKey.max>q.max!))add('La clave numérica debe estar dentro del intervalo permitido.',2,q.id);
   if(q.partialCredit&&(!Number.isFinite(q.incorrectPenalty)||q.incorrectPenalty!<=0))add('El crédito parcial exige una penalización positiva por opción incorrecta.',2,q.id);
  }
  if(policy==='rubric'&&q.type!=='info'&&(!q.rubric?.length||q.rubric.some(r=>!r.label.trim()||!r.levels.length||r.levels.some(l=>!l.label.trim()||!Number.isFinite(l.points)))))add('Define criterios y niveles de la rúbrica.',2,q.id);
  if(['total','dimensions'].includes(policy)&&['open','short'].includes(q.type||''))add('El texto necesita una rúbrica o la política sin puntuación.',2,q.id);
  if(q.type==='ranking'&&['total','dimensions'].includes(policy)&&q.rankingPoints?.length!==choices.length)add('Define los multiplicadores de cada posición.',2,q.id);
 }
 try{visibleQuestions(t,{})}catch{add('Las condiciones forman un ciclo.',1);}
 // Detect cycles even if an unanswered ancestor would short-circuit evaluation.
 for(const q of t.questions||[]){const seen=new Set<string>();let x:Question|undefined=q;while(x?.visibleWhen){if(seen.has(x.id)){add('Las condiciones forman un ciclo.',1,q.id);break;}seen.add(x.id);x=t.questions.find(n=>n.id===x!.visibleWhen!.questionId);}}
 if(!['immediate','review','date',undefined].includes(t.resultPublication))add('Selecciona cuándo publicar los resultados.',3);
 if(t.availableFrom&&t.due&&t.availableFrom>t.due)add('La apertura debe ser anterior al cierre.',3);
 if(t.durationMinutes!==undefined&&(!Number.isInteger(t.durationMinutes)||t.durationMinutes<0||t.durationMinutes>480))add('La duración debe ser de 0 a 480 minutos.',3);
 if(t.resultPublication==='date'&&(!t.releaseAt||!Number.isFinite(Date.parse(t.releaseAt))))add('Define la fecha de publicación de resultados.',3);
 if(t.minimumCoverage!==undefined&&(!Number.isFinite(t.minimumCoverage)||t.minimumCoverage<0||t.minimumCoverage>100))add('La cobertura mínima debe estar entre 0 y 100.');
 for(const link of t.careerLinks||[]){if(!link.careerId||!link.reason.trim()||!link.source.trim()||!Number.isFinite(link.min)||!Number.isFinite(link.max)||link.min>link.max||link.dimensionId!=='General'&&!dimensions.has(link.dimensionId))add('Completa el criterio, intervalo, fuente y carrera de cada relación.');}
 for(const [i,r] of (t.ranges||[]).entries()){if(!r.label.trim()||!Number.isFinite(r.min)||!Number.isFinite(r.max)||r.min>r.max)add('Revisa los límites de interpretación.');if(t.ranges!.slice(i+1).some(x=>x.dimension===r.dimension&&x.min<=r.max&&x.max>=r.min))add('Los intervalos cerrados de interpretación se superponen.');}
 return errors;
}
function selectionBounds(values:number[],q:Question){
 const min=q.minSelections??1,max=q.maxSelections??values.length;const sorted=[...values].sort((a,b)=>a-b),sums=[] as number[];
 for(let n=min;n<=max;n++){sums.push(sorted.slice(0,n).reduce((a,b)=>a+b,0),sorted.slice(-n).reduce((a,b)=>a+b,0));}
 return [Math.min(...sums),Math.max(...sums)];
}
export function calculateTest(t:Instrument,answers:AnswerMap,reviews:Reviews={}){
 const problems=instrumentProblems(t);if(problems.length)throw new TestError(problems.map(p=>p.message).join(' '));
 const visible=visibleQuestions(t,answers),applicable=visible.filter(q=>q.type!=='info'),trace:any[]=[];let pending=0,responded=0;
 const bins=new Map<string,{raw:number;min:number;max:number;weight:number;count:number}>();
 for(const q of applicable){
  const v=answers[q.id],problem=answerProblem(t,q,v);if(problem)throw new TestError(q.text+': '+problem);if(absent(v)){trace.push({questionId:q.id,state:'omitted'});continue;}responded++;
  const policy=q.policy||t.scoring||'manual';if(['none','manual','mixed'].includes(policy)){trace.push({questionId:q.id,state:'descriptive'});continue;}
  const weight=q.weight??1,choices=opts(t,q),mapped=choices.flatMap(o=>Object.keys(o.contributions||{})),dims=policy==='dimensions'?[...new Set(mapped.length?mapped:[q.dimension||'General'])]:['General'];
  if(policy==='rubric'&&!q.rubric!.every(r=>r.levels.some(l=>l.id===reviews[q.id]?.[r.id]))){pending++;trace.push({questionId:q.id,state:'pending-review'});continue;}
  for(const dimension of dims){
   let raw=0,min=0,max=0;
   const point=(n:number)=>{const o=choices.find(o=>o.value===n)!;return policy==='dimensions'&&Object.keys(o.contributions||{}).length?o.contributions?.[dimension]||0:(policy!=='dimensions'||dimension===(q.dimension||'General'))?(o.points??o.value):0;};
   if(policy==='objective'){
    max=1;const normal=(s:string)=>q.normalizeText?s.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/\s+/g,' '):s;
    if(q.type==='short')raw=q.acceptedTexts!.some(s=>normal(s)===normal(v as string))?1:0;
    else if(q.type==='number')raw=(v as number)>=q.numericKey!.min&&(v as number)<=q.numericKey!.max?1:0;
    else {const selected=Array.isArray(v)?v:[v],correct=q.correctValues!;raw=q.partialCredit?Math.max(0,selected.filter(n=>correct.includes(n as number)).length/correct.length-selected.filter(n=>!correct.includes(n as number)).length*q.incorrectPenalty!):selected.length===correct.length&&selected.every(n=>correct.includes(n as number))?1:0;}
   }else if(policy==='rubric'){for(const r of q.rubric!){raw+=r.levels.find(l=>l.id===reviews[q.id][r.id])!.points;min+=Math.min(...r.levels.map(l=>l.points));max+=Math.max(...r.levels.map(l=>l.points));}}
   else if(q.type==='number'){raw=v as number;min=q.min!;max=q.max!;if(q.inverse)raw=min+max-raw;}
   else if(q.type==='ranking'){const multipliers=q.rankingPoints!;raw=(v as number[]).reduce((s,n,i)=>s+point(n)*multipliers[i],0);const ps=choices.map(o=>point(o.value)).sort((a,b)=>a-b),ms=[...multipliers].sort((a,b)=>a-b);max=ps.reduce((s,n,i)=>s+n*ms[i],0);min=ps.reduce((s,n,i)=>s+n*ms[ms.length-1-i],0);}
   else {
    const values=choices.map(o=>point(o.value));const single=(n:number)=>q.inverse?Math.min(...values)+Math.max(...values)-point(n):point(n);
    const score=(value:unknown,multiple:boolean)=>{if(multiple){const all=choices.filter(o=>o.value!==q.exclusiveValue).map(o=>single(o.value));const bounds=selectionBounds(all,{...q,maxSelections:Math.min(q.maxSelections??all.length,all.length)});if(q.exclusiveValue!==undefined){const exclusive=single(q.exclusiveValue);bounds[0]=Math.min(bounds[0],exclusive);bounds[1]=Math.max(bounds[1],exclusive);}return [(value as number[]).reduce((sum,n)=>sum+single(n),0),...bounds];}return [single(value as number),Math.min(...values),Math.max(...values)];};
    if(q.type==='matrix'){for(const row of q.rows!){const [r,lo,hi]=score((v as AnswerMap)[row.id],!!q.matrixMultiple);raw+=r;min+=lo;max+=hi;}}
    else [raw,min,max]=score(v,q.type==='multiple');
   }
   const b=bins.get(dimension)||{raw:0,min:0,max:0,weight:0,count:0};b.raw+=raw*weight;b.min+=min*weight;b.max+=max*weight;b.weight+=weight;b.count++;bins.set(dimension,b);
   trace.push({questionId:q.id,dimension,policy,contribution:raw,weight,subtotal:raw*weight,min:min*weight,max:max*weight});
  }
 }
 const coverage=applicable.length?responded/applicable.length*100:100;
 const expectsScore=applicable.some(q=>['total','dimensions','objective','rubric'].includes(q.policy||t.scoring||'manual'));
 const state=pending?'pending-review':coverage<(t.minimumCoverage??0)||expectsScore&&(bins.size===0||[...bins.values()].every(b=>b.weight===0))?'insufficient':'complete';
 const aggregation=t.aggregation||(t.schemaVersion===2?'sum':'mean');
 const scores:Score[]=[...bins].map(([dimension,b])=>{const divisor=aggregation==='mean'?b.weight:1;const value=divisor?b.raw/divisor:0,min=divisor?b.min/divisor:0,max=divisor?b.max/divisor:0;return {dimension,raw:b.raw,value,min,max,...(t.normalize&&max>min&&state==='complete'?{normalized:(value-min)/(max-min)*100}:{}),band:state==='complete'?t.ranges?.find(r=>(!r.dimension||r.dimension===dimension)&&value>=r.min&&value<=r.max)?.label:undefined,answered:b.count,applicable:applicable.length};});
 if(scores.some(s=>![s.raw,s.value,s.min,s.max].every(Number.isFinite)))throw new TestError('El cálculo excede los límites numéricos permitidos.');
 const careers=state==='complete'?(t.careerLinks||[]).filter(link=>scores.some(s=>s.dimension===link.dimensionId&&s.value>=link.min&&s.value<=link.max)).map(link=>({...link,evidence:scores.find(s=>s.dimension===link.dimensionId)!.value})):[];
 return {careers,aggregation,boundsBasis:'answered-visible-questions',missingPolicy:'exclude-omitted-and-hidden',engineVersion:ENGINE_VERSION,instrumentVersion:t.version,state,scores,coverage:{applicable:applicable.length,responded,omitted:applicable.length-responded,pending,percent:coverage},trace,normalizationNote:t.normalize&&scores.some(s=>s.min===s.max)?'No se normaliza una escala sin recorrido.':undefined};
}
