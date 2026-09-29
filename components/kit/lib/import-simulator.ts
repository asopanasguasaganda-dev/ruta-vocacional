import type {Simulator} from './training-types';
import {readApiResponse} from './api-response';
import {suggestSimulatorCareers} from './simulator-careers';
/** One import flow for the catalog button and the simulator editor. */
export async function importSimulatorDocument(file:File,s:Simulator,careers:{id:string;name:string}[]){
 let data;
 if (process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "true") {
   const { importDesignDocument } = await import("./design-import");
   data = await importDesignDocument(file);
 } else {
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
 const tests=data.tests||[];
 if(!tests.length)throw Error('No se identificaron preguntas. Revisa el documento.');
 const detected=suggestSimulatorCareers(file.name+' '+tests.map((t:any)=>t.title).join(' ')+' '+(data.text||'').slice(0,1200),careers,tests.flatMap((t:any)=>t.careerIds||[]));
 const simulator:Simulator={...s,
  title:s.title||tests[0].presentation?.title||tests[0].title,
  careerIds:[...new Set([...(s.careerIds||[]),...detected])],
  instrument:{...s.instrument,source:file.name,...(s.questions.length?{}:{description:tests[0].description,presentation:tests[0].presentation})},
  questions:[...s.questions,...tests.flatMap((t:any)=>t.questions.filter((q:any)=>q.type!=='info').map((q:any)=>({...q,id:crypto.randomUUID(),options:q.options||t.options,source:file.name,policy:'objective',reviewed:false})))],
 };
 const message=[detected.length?detected.length+' carreras preseleccionadas por el contenido. Confirma o ajusta su selección.':'Selecciona las carreras que recibirán este simulador.',...(data.warnings||[])].join(' ');
 return {simulator,message};
}
