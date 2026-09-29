import catalog from '../data/design-careers.json';
import content from '../data/academic-guidance.json';
import { dimensions } from '../data/instruments';

/** The same saved answers drive the screen, PDF and course recommendations. */
export function localGuidance(user:any,submissions:any[],assignedIds:string[]=['intereses','valores','autoconocimiento']){
 const released=[...submissions].filter(s=>s.resultReleased!==false).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
 const rows=released.filter((s,i)=>released.findIndex(x=>x.instrument_id===s.instrument_id)===i);
 if(!rows.length)return null;
 const instruments=rows.map(s=>({id:s.id,instrumentId:s.instrument_id,version:s.version,createdAt:s.created_at,instrument:JSON.parse(s.snapshot),answers:JSON.parse(s.answers),scores:JSON.parse(s.scores).map((v:any)=>{
   const questions=JSON.parse(s.snapshot).questions.filter((q:any)=>q.dimension===v.dimension),count=questions.filter((q:any)=>JSON.parse(s.answers)[q.id]!=null).length;
   return {...v,...(s.instrument_id==='autoconocimiento'&&count?{percent:20*v.raw/count}:{} )};
 })}));
 // Give each completed instrument equal weight, independent of its scale and item count.
 const codes=['R','I','A','S','E','C'];
 const interests=instruments.filter(s=>rows.find(r=>r.id===s.id)?.evaluation?.state==='complete'&&s.scores.length===6&&new Set(s.scores.map((v:any)=>v.dimension)).size===6&&s.scores.every((v:any)=>codes.includes(v.dimension)&&Number.isFinite(v.value)&&Number.isFinite(v.min)&&Number.isFinite(v.max)&&v.max>v.min&&v.value>=v.min&&v.value<=v.max));
 const interest=interests[0];
 const scores=interest?codes.map(dimension=>({dimension,raw:5+20*interests.reduce((sum,s)=>{const v=s.scores.find((v:any)=>v.dimension===dimension);return sum+(v.value-v.min)/(v.max-v.min);},0)/interests.length})):[];
 const ordered=[...scores].sort((a,b)=>b.raw-a.raw),max=ordered[0]?.raw||0,min=ordered.at(-1)?.raw||0;
 const valid=!!interest&&scores.length===6&&scores.every((v:any)=>Number.isFinite(v.raw))&&rows.find(r=>r.id===interest.id)?.evaluation?.state==='complete';
 const differentiated=valid&&max>min&&max>=15;
 const cutoff=ordered[1]?.raw??max,top=differentiated?ordered.filter(s=>s.raw>=cutoff).map(s=>s.dimension):[];
 const labels=(codes:string[])=>codes.map(c=>dimensions.find(d=>d.code===c)?.name||c).join(', ');
 const candidates=catalog.careers.map(c=>({...c,weight:c.interests.reduce((n,d)=>n+(scores.find((s:any)=>s.dimension===d)?.raw||0),0)/(c.interests.length||1)})).filter(c=>c.offers.some(o=>o.level==='Grado universitario')&&c.interests.some(d=>top.includes(d))).sort((a,b)=>b.weight-a.weight||a.name.localeCompare(b.name,'es'));
 const selected:typeof candidates=[];
 for(const c of candidates){if(selected.filter(x=>x.areaId===c.areaId).length>=2)continue;selected.push(c);if(selected.length===8)break;}
 const recommendations=selected.map(c=>{const area=content.areas.find(a=>a.id===c.areaId)!,academic=content.categories.find(a=>a.id===c.areaId)!;const support=c.interests.filter(d=>top.includes(d));return {careerId:c.id,areaId:c.areaId,reason:`Tus áreas de mayor interés incluyen ${labels(support)}. Esta carrera se relaciona con ${area.name.toLowerCase()} según la regla de orientación por áreas. No es una predicción de rendimiento.`,evidence:interests.flatMap(t=>support.map(d=>t.instrumentId+':dimension:'+d)),comparison:area.contrast,explore:academic.explanation+' '+academic.questions.join(' ')};});
 // Explicit relations from administrator-authored tests remain available too.
 const explicitIds=new Set<string>();
 for(const row of rows.filter(r=>r.evaluation?.state==='complete'))for(const rec of row.evaluation?.careers||[]){
  const c=catalog.careers.find(c=>c.id===(rec.careerId||rec.id));if(!c)continue;
  explicitIds.add(c.id);
  const reason=rec.reason+' Puntuación guardada: '+rec.evidence+'. Criterio del test: '+rec.min+' a '+rec.max+'.';
  const evidence=row.instrument_id+':dimension:'+rec.dimensionId;
  const existing=recommendations.find(r=>r.careerId===c.id);
  if(existing){existing.reason+=' '+reason;if(!existing.evidence.includes(evidence))existing.evidence.push(evidence);}
  else recommendations.push({careerId:c.id,areaId:c.areaId,reason,evidence:[evidence],comparison:c.investigate,explore:content.categories.find(a=>a.id===c.areaId)?.explanation||c.activities});
 }
 recommendations.sort((a,b)=>Number(explicitIds.has(b.careerId))-Number(explicitIds.has(a.careerId)));
 const completedIds=new Set(instruments.map(i=>i.instrumentId));
 const progress={submitted:completedIds.size,total:new Set([...assignedIds,...completedIds]).size};
 return {id:'local-'+rows.map(s=>s.id).join('-'),createdAt:rows[0].created_at,student:{id:user.id,name:user.name},version:submissions.length,status:'available',attempts:0,rulesVersion:'local-guidance-3',mappingVersion:'exploration-rules-1',contentId:content.id,contentSource:content.source,provider:content.source,model:content.model,partial:progress.submitted<progress.total,progress,instruments,catalog:catalog.careers,catalogSource:catalog.source,offers:Object.fromEntries(catalog.careers.map(c=>[c.id,c.offers])),analysis:{
 summary:!interest?(recommendations.length?'Estas opciones cumplen los criterios de relación guardados en tus instrumentos. Revisa la evidencia de cada carrera y contrástala con experiencias.':'Este instrumento conserva tus respuestas. Para sugerir carreras necesita dimensiones de intereses o relaciones con carreras configuradas y revisadas por el administrador.'):!differentiated?'Tus intereses están equilibrados, son poco diferenciados o aún falta información. Explora el catálogo y compara experiencias sin priorizar una carrera por ahora.':`Tus respuestas destacan ${labels(top)}. Te proponemos alternativas para comparar sus asignaturas, actividades y contextos de trabajo.`,
 highlightedDimensions:top,recommendations,selfReported:instruments.filter(s=>s.instrumentId==='valores').flatMap(s=>s.instrument.questions.map((q:any)=>({text:q.text+': '+(q.options||s.instrument.options||[]).filter((o:any)=>o.value===s.answers[q.id]).map((o:any)=>o.label).join(', '),evidence:[s.instrumentId+':'+q.id]}))),
 nextSteps:['Selecciona dos carreras y compara qué asignaturas te interesan y cuáles necesitas reforzar.','Filtra las universidades por provincia y modalidad; verifica la oferta y admisión con la institución.','Abre Autopreparación en una carrera recomendada y practica con los simuladores publicados por administración.','Prueba una actividad introductoria y conversa con estudiantes o profesionales antes de decidir.'],
 limitations:[`El perfil integra ${interests.length} instrumentos con las seis dimensiones de intereses. Los cuestionarios descriptivos conservan sus respuestas, pero no modifican las carreras sin criterios de relación definidos.`, 'Los indicadores describen tus respuestas; no son porcentajes de aptitud ni probabilidades de éxito.','Las relaciones carrera–interés son reglas internas de exploración, sin baremos ecuatorianos acreditados. Se muestran hasta dos ejemplos por área, con igual peso por instrumento de intereses completo y escalas normalizadas; los empates se ordenan alfabéticamente, no por aptitud.','La IA generó explicaciones académicas generales; no recibe tus respuestas ni decide por ti.','La oferta corresponde a una consulta fechada del CES. Confirma nivel, sede, malla, costos y admisión directamente.']}};
}
