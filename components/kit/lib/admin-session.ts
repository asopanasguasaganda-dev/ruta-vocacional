import {readApiResponse} from './api-response';
export type AdminReauthentication = {resolve:()=>void;reject:(error:Error)=>void};
let reauthentication:Promise<void>|null=null;
export function renewAdminSession(){
 if(reauthentication)return reauthentication;
 reauthentication=new Promise<void>((resolve,reject)=>{
  const event=new CustomEvent<AdminReauthentication>('rv360:admin-reauthenticate',{cancelable:true,detail:{resolve,reject}});
  window.dispatchEvent(event);
  if(!event.defaultPrevented)reject(Error('Inicia sesión como administrador para continuar.'));
 }).finally(()=>{reauthentication=null;});
 return reauthentication;
}
export async function adminLogin(email:string,password:string){
 const data=await readApiResponse(await fetch('/api/auth/login',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,admin:true}),signal:AbortSignal.timeout(15000)}));
 return data.user;
}
let refreshing:Promise<boolean>|null=null;
export function refreshAdminAccess(){
 if(refreshing)return refreshing;
 refreshing=fetch('/api/session',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)})
  .then(readApiResponse).then(data=>data.user?.role==='admin').finally(()=>{refreshing=null;});
 return refreshing;
}
export async function adminFetch(url:string,options:RequestInit={},timeout=25000){
 const send=()=>fetch(url,{...options,credentials:'same-origin',signal:AbortSignal.timeout(timeout)});
 const response=await send();
 if(response.status!==401)return response;
 await response.body?.cancel();
 if(await refreshAdminAccess())return send();
 await renewAdminSession();
 return send();
}
