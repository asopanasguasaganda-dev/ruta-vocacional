import {autofillSimulator} from './simulator-autofill';
import type {Simulator} from './training-types';
import {readApiResponse} from './api-response';
import {suggestSimulatorCareers} from './simulator-careers';
/** One import flow for the catalog button and the simulator editor. */
export async function importSimulatorDocument(file:File,s:Simulator,careers:{id:string;name:string}[]){
 let data;
 {
   const form = new FormData();
   form.append("file", file);
   const job = await readApiResponse(await fetch("/api/admin/import", { method: "POST", body: form }));
   for (let n = 0; n < 180; n++) {
     data = await readApiResponse(await fetch("/api/admin/import?id=" + job.id + "&status=1"));
     if (data.status === "Error") throw Error(data.error);
     if (data.status === "Completado") break;
     await new Promise((r) => setTimeout(r, 1000));
   }
   if (data?.status !== "Completado") throw Error("La extracción sigue en proceso. Consúltala en Evaluaciones.");
 }
 const parsed=simulatorFromDocument(data,file.name,s,careers);
 const result=await autofillSimulator(parsed.simulator,careers,!s.questions.length&&!data.tests?.[0]?.durationMinutes);
 return {simulator:result.simulator,message:parsed.message+' '+result.message};
}
export function simulatorFromDocument(data:any,filename:string,s:Simulator,careers:{id:string;name:string}[]){
 const tests=data.tests||[];
 if(!tests.length)throw Error('No se identificaron preguntas. Revisa el documento.');
 const detected=suggestSimulatorCareers(filename+' '+tests.map((t:any)=>t.title).join(' ')+' '+(data.text||'').slice(0,1200),careers,tests.flatMap((t:any)=>[...(t.careerIds||[]),...(t.careerLinks||[]).map((link:any)=>link.careerId)]));
 const metadata=tests.length===1&&!s.questions.length?tests[0]:{};
 const time=Number.isInteger(metadata.durationMinutes)&&metadata.durationMinutes>0&&metadata.durationMinutes<=480?metadata.durationMinutes:s.durationMinutes;
 const attempts=Number.isInteger(metadata.maxAttempts)&&metadata.maxAttempts>0&&metadata.maxAttempts<=100?metadata.maxAttempts:s.maxAttempts;
 const simulator:Simulator={...s,durationMinutes:time,maxAttempts:attempts,
  title:s.title||tests[0].presentation?.title||tests[0].title,
  careerIds:[...new Set([...(s.careerIds||[]),...detected])],
  instrument:{...s.instrument,source:filename,...(s.questions.length?{}:{description:tests[0].description,presentation:tests[0].presentation})},
  questions:[...s.questions,...tests.flatMap((t:any)=>t.questions.filter((q:any)=>q.type!=='info').map((q:any)=>({...q,id:crypto.randomUUID(),options:q.options||t.options,source:filename,type:q.type==='likert'&&q.correctValues?.length?'single':q.type,weight:q.weight??1,policy:'objective',reviewed:false})))],
 };
 const message=[detected.length?detected.length+' carreras preseleccionadas por el contenido. Confirma o ajusta su selección.':'Selecciona las carreras que recibirán este simulador.',...(data.warnings||[])].join(' ');
 return {simulator,message};
}
