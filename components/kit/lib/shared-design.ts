import {exportTestPublication,importTestPublication} from './test-publication';
import {migrateAdminSession} from './admin-session';
const endpoint='/__design/publications/';
let supported:boolean|undefined,inflight:Promise<any>|null=null;
let connection={configured:false,requiresPublishKey:false,error:''};
const local=()=>typeof window!=='undefined'&&['localhost','127.0.0.1','[::1]'].includes(window.location.hostname);
export const publicationConnection=()=>connection;
async function read(){
 if(typeof window==='undefined')return null;
 if(inflight)return inflight;
 inflight=(async()=>{try{
 const response=await fetch(local()?endpoint.slice(0,-1):'/api/design-publications',{cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(response.status===404&&local()){supported=false;return null;}
 if(!response.ok)throw Error('No se pudo consultar la publicación compartida.');
 const data=await response.json();if(data.format!=='rv360-shared-catalog')throw Error('El servicio de publicación no está disponible.');
 connection={configured:data.configured!==false,requiresPublishKey:!!data.requiresPublishKey,error:data.error||''};
 supported=connection.configured;return data;
 }finally{inflight=null;}})();
 return inflight;
}
export async function syncSharedDesign(){
 try{await migrateAdminSession();}catch(e){connection.error=(e as Error).message;}
 let data;try{data=await read();}catch(e){connection.error=(e as Error).message;return;}
 if(!data||data.configured===false)return;
 for(const packet of data.publications){
 if(packet.source===localStorage.getItem('rv360:test-publication-source-v1'))continue;
 const workspace=JSON.parse(localStorage.getItem('rv360:local-workspace-v1')||'{}');
 if(workspace.publicationDates?.[packet.source]===packet.createdAt)continue;
 importTestPublication(packet);
 }
}
export async function publishSharedDesign(){
 if(typeof window==='undefined')return false;
 await migrateAdminSession();
 const packet=exportTestPublication();
 const data=await read();if(!data)return false;
 const prior=data.publications.find((p:any)=>p.source===packet.source);
 if(!prior&&!packet.tests.length&&!packet.simulators.length)return true;
 if(prior&&JSON.stringify({...prior,createdAt:undefined})===JSON.stringify({...packet,createdAt:undefined}))return true;
 if(data.configured===false)throw Error(data.error||'Configura la publicación en Vercel antes de publicar.');
 const response=await fetch(local()?endpoint.slice(0,-1):'/api/design-publications/',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(packet),signal:AbortSignal.timeout(20000)});
 if(!response.ok){const data=await response.json().catch(()=>({}));throw Error(data.error||'No se pudo guardar la publicación compartida. Reintenta antes de salir.');}
 return true;
}
export const sharedDesignEnabled=()=>supported===true;
