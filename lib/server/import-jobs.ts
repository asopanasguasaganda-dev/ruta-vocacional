import { fork,type ChildProcess } from 'node:child_process';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { document,put,fail } from './store';
const globalJobs=globalThis as unknown as {rutaJobs?:Map<string,ChildProcess>};
const jobs=globalJobs.rutaJobs||(globalJobs.rutaJobs=new Map());
const pending=new Map<string,symbol>();
export const importFolder=()=>resolve(/*turbopackIgnore: true*/ process.env.IMPORT_PATH||'storage/imports');
export function updateJob(owner:string,id:string,patch:any){put(owner,'rv360:imports',document(owner,'rv360:imports',[]).map((job:any)=>job.id===id?{...job,...patch}:job));}
export function cancelJob(owner:string,id:string){
 const record=document(owner,'rv360:imports',[]).find((r:any)=>r.id===id);
 if(!record)fail('Importación no encontrada.',404);
 if(record.status==='Completado')fail('El documento ya se extrajo. Revisa sus instrumentos.',409);
 pending.delete(id);const child=jobs.get(id);jobs.delete(id);child?.kill();
 updateJob(owner,id,{status:'Cancelado',error:'Importación cancelada. Puedes reintentar.',tests:undefined,text:undefined,warnings:undefined});
}
export async function startJob(owner:string,id:string){
 const record=document(owner,'rv360:imports',[]).find((r:any)=>r.id===id);
 if(!record)fail('Importación no encontrada.',404);
 if(record.status==='Completado')fail('El documento ya se extrajo. Revisa sus instrumentos.',409);
 if(jobs.has(id)||pending.has(id))return;
 if(jobs.size+pending.size>=2)fail('Hay dos documentos procesándose. Espera un momento y reintenta.',429);
 const token=Symbol(id);pending.set(id,token);
 let bytes:Buffer;try{bytes=await readFile(resolve(importFolder(),id));}catch(error){if(pending.get(id)===token)pending.delete(id);throw error;}
 if(pending.get(id)!==token)return;
 pending.delete(id);
 updateJob(owner,id,{status:'Procesando',progress:10,error:'',tests:undefined,text:undefined,warnings:undefined});
 const child=fork(resolve(/*turbopackIgnore: true*/ 'scripts/import-worker.mjs'),[],{stdio:['ignore','ignore','ignore','ipc'],execArgv:['--max-old-space-size=512'],env:{NODE_ENV:process.env.NODE_ENV||'production',PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,TEMP:process.env.TEMP,TMP:process.env.TMP},windowsHide:true});
 jobs.set(id,child);
 const active=()=>jobs.get(id)===child;
 const finish=(patch:any)=>{if(!active())return;updateJob(owner,id,patch);jobs.delete(id);clearTimeout(timeout);};
 const timeout=setTimeout(()=>{if(!active())return;finish({status:'Error',error:'Se agotó el tiempo de extracción (5 minutos). Divide el documento o reintenta.'});child.kill();},300000);
 child.on('message',(message:any)=>{
  if(!active())return;
  if(message.progress)updateJob(owner,id,{progress:message.progress});
  if(message.result)finish({status:'Completado',progress:100,...message.result});
  if(message.error)finish({status:'Error',error:message.error});
 });
 child.on('error',()=>finish({status:'Error',error:'No se pudo iniciar el proceso de extracción.'}));
 child.on('exit',()=>{clearTimeout(timeout);finish({status:'Error',error:'La extracción se interrumpió. Puedes reintentar.'});});
 child.send({data:bytes.toString('base64'),name:record.name});
}
