import {scienceOptions,technicalOptions,isChoosingBaccalaureate} from './baccalaureate';
export type EducationLevel='bachillerato'|'universidad';
export const schoolTarget=(id:unknown):id is string=>typeof id==='string'&&id.startsWith('bachillerato:');
export const preparationLevel=(ids:string[]=[],explicit?:string)=>ids.length?(ids.some(schoolTarget)?'bachillerato':'universidad'):explicit==='bachillerato'?'bachillerato':'universidad';
export const schoolTrainingTargets=[
 {id:'bachillerato:ciencias',name:'Bachillerato en Ciencias',area:'Ciencias · formación general',description:'Compara asignaturas y actividades del tronco común.',educationLevel:'bachillerato',offers:[]},
 {id:'bachillerato:tecnico',name:'Bachillerato Técnico',area:'Técnico · formación general',description:'Explora proyectos, talleres y figuras profesionales.',educationLevel:'bachillerato',offers:[]},
 ...scienceOptions.map(o=>({id:'bachillerato:'+o.id,name:o.name,area:'Ciencias · áreas de exploración',description:o.subjects,educationLevel:'bachillerato',offers:[]})),
 ...technicalOptions.map(o=>({id:'bachillerato:'+o.id,name:o.name,area:'Técnico · '+(o.family||'figuras profesionales'),description:o.subjects,educationLevel:'bachillerato',offers:[]})),
];
export function schoolPreparationRecommendations(report:any){
 const p=report?.analysis?.pathway;
 return schoolTrainingTargets.map(t=>({careerId:t.id,educationLevel:'bachillerato',reason:
  [...(p?.science||[]),...(p?.technical||[])].find(o=>'bachillerato:'+o.id===t.id)?.reason||
  'Opción para conocer y comparar antes de elegir. Practicar sus contenidos no determina tu aptitud ni te obliga a escogerla.',
  suggested:!![...(p?.science||[]),...(p?.technical||[])].some(o=>'bachillerato:'+o.id===t.id)}));
}
export const defaultPreparationLevel=(profile:any):EducationLevel=>isChoosingBaccalaureate(profile?.stage)?'bachillerato':'universidad';
