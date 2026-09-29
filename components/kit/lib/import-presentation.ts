import {migrateAdminSession} from './admin-session';
export async function prepareImportedPresentation<T extends {tests:any[];warnings:string[]}>(result:T,force=false):Promise<T>{
 if(typeof window==='undefined'||['localhost','127.0.0.1'].includes(window.location.hostname))return result;
 try{await migrateAdminSession();}catch{result.warnings.push('No se pudo preparar el resumen con IA. Puedes editar la introducción antes de publicar.');return result;}
 let completed=0,failed=0;
 for(const test of result.tests){
  if(!force&&test.description.length<=280&&test.title.length<=100)continue;
  try{
   const response=await fetch('/api/import-presentation/',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:test.title.slice(0,500),description:test.description.slice(0,12000)}),signal:AbortSignal.timeout(25000)});
   if(!response.ok)throw Error('IA no disponible');
   const data=await response.json();
   if(typeof data.presentation?.title!=='string'||typeof data.presentation?.summary!=='string')throw Error('Resumen no válido');
   test.presentation=data.presentation;completed++;
  }catch{failed++;break;}
 }
 if(completed)result.warnings.push('Título y resumen preparados con IA. Revísalos antes de publicar; las preguntas y las reglas se conservan.');
 if(failed)result.warnings.push('No se pudo completar el resumen con IA. La importación conserva el contenido original y puedes editar su presentación.');
 return result;
}
