import { careerFields } from './content-fields';
import { careers } from '../data/careers';
import { resources } from '../data/resources';
const originalCareers=structuredClone(careers),originalResources=structuredClone(resources);
export function configureCatalog(rows:{content:string}[]=[]){
 careers.splice(0,careers.length,...structuredClone(originalCareers));
 resources.splice(0,resources.length,...structuredClone(originalResources));
 for(const row of rows){const item=JSON.parse(row.content);
  if(item.kind==='Carrera'){const existing=careers.find(c=>c.id===item.id);const next=careerFields(item,existing);if(existing)Object.assign(existing,next);else careers.push(next);}
  else if(item.kind==='Recurso'){const existing=resources.find(r=>r.id===item.id);const next={id:item.id,title:item.title,category:item.category,intro:item.description,steps:item.steps??existing?.steps??[],minutes:item.minutes??existing?.minutes??0,sourceUrl:item.sourceUrl,sourceDate:item.sourceDate};if(existing)Object.assign(existing,next);else resources.push(next);}
 }
}
