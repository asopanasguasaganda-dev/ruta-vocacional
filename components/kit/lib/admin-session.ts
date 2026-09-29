export const cloudAdmin=()=>typeof window!=='undefined'&&!['localhost','127.0.0.1','[::1]'].includes(window.location.hostname);
async function call(method:string,body?:any,key?:string){
 const r=await fetch('/api/publisher-session/',{method,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json',...(key?{'X-Publish-Key':key}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
 const data=await r.json();if(!r.ok)throw Error(data.error||'No se pudo iniciar sesión.');return data;
}
let migration:Promise<void>|null=null;
export async function migrateAdminSession(){
 if(!cloudAdmin())return;
 const accounts=JSON.parse(localStorage.getItem('rv360:local-accounts-v1')||'[]');
 const account=accounts.find((a:any)=>a.user.id===sessionStorage.getItem('rv360:local-session-v1')&&a.user.role==='admin');
 const key=sessionStorage.getItem('rv360:publish-key');
 if(!account||!key)return;
 if(migration)return migration;
 migration=(async()=>{const current=await call('GET');if(!current.user)await call('POST',{action:'migrate',account:{user:account.user,salt:account.salt,verifier:account.verifier}},key);sessionStorage.removeItem('rv360:publish-key');})().finally(()=>{migration=null;});
 return migration;
}
export async function adminLogin(email:string,password:string){return (await call('POST',{email,password})).user;}
export async function adminPassword(body:any){return call('POST',{...body,action:'password'});}
export async function adminLogout(){if(cloudAdmin())await call('DELETE');}
