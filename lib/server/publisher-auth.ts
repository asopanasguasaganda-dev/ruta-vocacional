import {createHmac,createHash,timingSafeEqual,pbkdf2Sync,randomUUID} from 'node:crypto';
import {get,put} from '@vercel/blob';
const path='rv360/publisher-account.json';
const digest=(s:string)=>createHash('sha256').update(s).digest();
const equal=(a:string,b:string)=>timingSafeEqual(digest(a),digest(b));
const derive=(password:string,salt:string)=>pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex');
const version=(a:any)=>createHash('sha256').update(a.verifier).digest('hex');
export const publisherStore={
 async read(){const r=await get(path,{access:'private',useCache:false});if(!r)return null;if(r.statusCode!==200)throw Error('Account unavailable');return {data:JSON.parse(await new Response(r.stream).text()),etag:r.blob.etag.replace(/^W\//,'')};},
 async write(data:any,etag?:string){await put(path,JSON.stringify(data),{access:'private',addRandomSuffix:false,contentType:'application/json',...(etag?{ifMatch:etag}:{allowOverwrite:false})});}
};
export function publisherAuth(store=publisherStore,secret=process.env.DESIGN_PUBLISH_KEY||''){
 const sign=(payload:string)=>createHmac('sha256',secret).update(payload).digest('base64url');
 const issue=(a:any)=>{const value=Buffer.from(JSON.stringify({sub:a.user.id,version:version(a),exp:Date.now()+86400000})).toString('base64url');return value+'.'+sign(value);};
 async function authenticated(cookie:string){try{if(secret.length<32)return null;const token=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('rv360_publisher='))?.slice(16)||'';const [payload,signature]=token.split('.');if(!payload||!signature||!equal(sign(payload),signature))return null;const decoded=JSON.parse(Buffer.from(payload,'base64url').toString());if(decoded.exp<Date.now())return null;const record=await store.read();return record&&decoded.sub===record.data.user.id&&decoded.version===version(record.data)?record:null;}catch{return null;}}
 return {authenticated,async handle(method:string,body:any,cookie:string,legacyKey:string){
 const result=(status:number,body:any,token?:string)=>({status,body,token});
 if(secret.length<32)return result(503,{error:'El acceso administrativo no está disponible.'});
 if(method==='DELETE')return result(200,{ok:true},'');
 if(method==='GET'){const a=await authenticated(cookie);return result(200,{user:a?.data.user||null});}
 if(method!=='POST')return result(405,{error:'Método no admitido.'});
 try{
 if(body?.action==='migrate'){
 if(!legacyKey||!equal(legacyKey,secret))return result(401,{error:'Inicia sesión como administrador.'});
 const a=body.account;
 if(!a?.user?.id||a.user.role!=='admin'||!/^\S+@\S+\.\S+$/.test(a.user.email)||typeof a.salt!=='string'||a.salt.length>100||!/^[a-f0-9]{64}$/.test(a.verifier))return result(400,{error:'Cuenta administrativa incompleta.'});
 const prior=await store.read();
 if(prior&&prior.data.user.email!==a.user.email)return result(409,{error:'Utiliza la cuenta administrativa configurada.'});
 // Repeated migration must never roll back a password changed on the server.
 if(prior&&!equal(prior.data.verifier,a.verifier))return result(401,{error:'Inicia sesión con tu contraseña actual.'});
 const clean={user:{id:a.user.id,email:a.user.email,name:a.user.name,role:'admin',institutionId:'shared',group:''},salt:a.salt,verifier:a.verifier,failures:0,lockedUntil:0};
 if(!prior)await store.write(clean);
 const account=prior?.data||clean;return result(200,{user:account.user},issue(account));
 }
 if(body?.action==='password'){
 const record=await authenticated(cookie);if(!record)return result(401,{error:'Inicia sesión como administrador.'});
 if(typeof body.currentPassword!=='string'||!equal(derive(body.currentPassword,record.data.salt),record.data.verifier)||typeof body.password!=='string'||body.password.length<8||body.password.length>128)return result(400,{error:'Revisa la contraseña actual y la nueva contraseña.'});
 const salt=randomUUID(),next={...record.data,salt,verifier:derive(body.password,salt)};await store.write(next,record.etag);return result(200,{user:next.user},issue(next));
 }
 const record=await store.read();
 if(!record||typeof body?.password!=='string'||body.password.length>128||String(body.email).trim().toLowerCase()!==record.data.user.email)return result(401,{error:'Correo o contraseña incorrectos.'});
 if(record.data.lockedUntil>Date.now())return result(429,{error:'Espera unos minutos antes de volver a ingresar.'});
 if(!equal(derive(body.password,record.data.salt),record.data.verifier)){
 const failures=(record.data.failures||0)+1;await store.write({...record.data,failures,lockedUntil:failures>=5?Date.now()+300000:0},record.etag);return result(401,{error:'Correo o contraseña incorrectos.'});
 }
 if(record.data.failures)await store.write({...record.data,failures:0,lockedUntil:0},record.etag);
 return result(200,{user:record.data.user},issue(record.data));
 }catch{return result(503,{error:'No se pudo completar el acceso. Vuelve a intentar.'});}
 }};
}
