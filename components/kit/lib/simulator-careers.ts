const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
/** Suggest only explicit catalog names or IDs; generic subject questions do not establish a career. */
export function suggestSimulatorCareers(text:string,careers:{id:string;name:string}[],explicitIds:string[]=[]){
 const content=' '+normalize(text)+' ';
 return careers.filter(c=>explicitIds.includes(c.id)||(normalize(c.name).length>=6&&content.includes(' '+normalize(c.name)+' '))).map(c=>c.id);
}
export function simulatorCareerIds(simulator:any,courses:any[]=[]):string[]{
 return [...new Set<string>(simulator.careerIds?.length?simulator.careerIds:courses.filter(c=>c.activities?.some((a:any)=>a.simulatorId===simulator.id&&a.simulatorVersion===simulator.version)).flatMap(c=>c.careerIds||[]))];
}
