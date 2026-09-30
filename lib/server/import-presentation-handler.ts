import type {IncomingMessage,ServerResponse} from 'node:http';
import {publisherAuth} from './publisher-auth';
import {suggestSimulatorFields} from './simulator-autofill';
import {summarizeInstrument} from './import-presentation';
const auth=publisherAuth();
export default async function handler(req:IncomingMessage&{body?:any},res:ServerResponse){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
 const send=(status:number,data:any)=>{res.statusCode=status;res.end(JSON.stringify(data));};
 if(req.method!=='POST')return send(405,{error:'Método no permitido.'});
 if(req.headers.origin&&req.headers.origin!==`https://${req.headers.host}`)return send(403,{error:'Origen no permitido.'});
 try{
  if(!await auth.authenticated(req.headers.cookie||''))return send(401,{error:'Inicia sesión como administrador.'});
  let body=req.body;
  if(typeof body==='string'){if(body.length>300000)return send(413,{error:'Texto demasiado extenso.'});body=JSON.parse(body);}
  if(body?.operation==='simulator'){
   if(JSON.stringify(body).length>300000||!Array.isArray(body.questions)||!body.questions.length||body.questions.length>20||!Array.isArray(body.careers)||body.careers.length>2500||typeof body.title!=='string'||body.title.length>500)return send(400,{error:'Contenido del simulador no válido.'});
   return send(200,{suggestions:await suggestSimulatorFields(body)});
  }
  if(!body||typeof body.title!=='string'||typeof body.description!=='string'||body.title.length>500||body.description.length>12000)return send(400,{error:'Contenido no válido.'});
  return send(200,{presentation:await summarizeInstrument({title:body.title,description:body.description})});
 }catch(e:any){const code=typeof e?.code==='string'&&e.code.startsWith('AI_')?e.code:e?.name==='TimeoutError'?'AI_TIMEOUT':'AI_RESPONSE';console.warn('import-ai-failure',code);return send(e?.status===429?429:503,{code,error:code==='AI_LIMIT'?'La IA alcanzó su límite temporal. Reintenta en unos minutos.':code==='AI_CONFIG'?'El servicio de IA necesita configuración.':'No se pudo completar este bloque. Puedes reintentar sin perder lo preparado.'});}
}
