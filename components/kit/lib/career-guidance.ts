import type { Career } from '../types';
export const GUIDANCE_VERSION='ruta-intereses-contexto-1';
export const environmentRules:Record<string,string[]>={
 'Laboratorio / investigación':['I'],'Trabajo con personas':['S'],'Trabajo al aire libre':['R'],
 'Tecnología':['I','R'],'Creatividad y diseño':['A'],'Organización y administración':['E','C'],
};
export function careerGuidance(catalog:Career[],scores:{dimension:string;value:number}[],preferences:Record<string,string>={}){
 const ordered=[...scores].sort((a,b)=>b.value-a.value),threshold=ordered[1]?.value??ordered[0]?.value??0;
 const top=ordered.filter(score=>score.value>=threshold).map(score=>score.dimension);
 const candidates=catalog.map(career=>({career,matches:career.interests.filter(code=>top.includes(code)),environment:career.interests.filter(code=>(environmentRules[preferences.ambiente]||[]).includes(code))}))
  .filter(candidate=>candidate.matches.length)
  .sort((a,b)=>b.matches.length-a.matches.length||b.environment.length-a.environment.length);
 return {version:GUIDANCE_VERSION,top,candidates};
}
