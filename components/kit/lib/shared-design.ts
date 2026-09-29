import {exportTestPublication,importTestPublication} from './test-publication';
const endpoint='/__design/publications';
let supported:boolean|undefined,inflight:Promise<any>|null=null;
const canConnect=()=>typeof window!=='undefined'&&['localhost','127.0.0.1','[::1]'].includes(window.location.hostname);
async function read(){
 if(!canConnect()||supported===false)return null;
 if(inflight)return inflight;
 inflight=(async()=>{try{
 const response=await fetch(endpoint,{cache:'no-store',signal:AbortSignal.timeout(5000)});
 if(response.status===404){supported=false;return null;}
 if(!response.ok)throw Error('No se pudo consultar la publicación compartida.');
 const data=await response.json();if(data.format!=='rv360-shared-catalog')throw Error('Respuesta de publicación no válida.');
 supported=true;return data;
 }catch(error){if(supported)throw error;return null;}finally{inflight=null;}})();
 return inflight;
}
export async function syncSharedDesign(){
 const data=await read();if(!data)return;
 for(const packet of data.publications){
 if(packet.source===localStorage.getItem('rv360:test-publication-source-v1'))continue;
 const workspace=JSON.parse(localStorage.getItem('rv360:local-workspace-v1')||'{}');
 if(workspace.publicationDates?.[packet.source]===packet.createdAt)continue;
 importTestPublication(packet);
 }
}
export async function publishSharedDesign(){
 const data=await read();if(!data)return false;
 const packet=exportTestPublication();const prior=data.publications.find((p:any)=>p.source===packet.source);if(prior&&JSON.stringify({...prior,createdAt:undefined})===JSON.stringify({...packet,createdAt:undefined}))return true;
 const response=await fetch(endpoint,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(packet),signal:AbortSignal.timeout(10000)});
 if(!response.ok){const data=await response.json().catch(()=>({}));throw Error(data.error||'No se pudo guardar la publicación compartida. Reintenta antes de salir.');}
 return true;
}

export const sharedDesignEnabled=()=>supported===true;
