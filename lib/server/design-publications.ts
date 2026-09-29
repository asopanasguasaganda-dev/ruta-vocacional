import {createHash,timingSafeEqual} from 'node:crypto';
import {get,put,BlobPreconditionFailedError} from '@vercel/blob';
import {validateTestPublication} from '../../components/kit/lib/test-publication';

const pathname='rv360/design-publications.json';
const empty=()=>({format:'rv360-shared-catalog',publications:[] as any[]});
// Blob's compressed GET adds W/ to the origin ETag. If-Match requires the
// original strong validator (the same hash returned by Blob head/put).
export const blobWriteEtag=(etag:string)=>etag.replace(/^W\//,'');
export const blobCatalog={
 async read(){const result=await get(pathname,{access:'private',useCache:false});if(!result)return {data:empty(),etag:undefined};if(result.statusCode!==200)throw Error('Unexpected Blob response');return {data:JSON.parse(await new Response(result.stream).text()),etag:blobWriteEtag(result.blob.etag)};},
 async write(data:any,etag?:string){await put(pathname,JSON.stringify(data),{access:'private',addRandomSuffix:false,contentType:'application/json',...(etag?{ifMatch:etag}:{allowOverwrite:false})});},
};
export function createPublicationService(storage=blobCatalog,env:NodeJS.ProcessEnv=process.env){
 return async(method:string,body:any,key:string)=>{
 const configured=!!(env.BLOB_READ_WRITE_TOKEN||(env.BLOB_STORE_ID&&env.VERCEL_OIDC_TOKEN))&&!!env.DESIGN_PUBLISH_KEY&&env.DESIGN_PUBLISH_KEY.length>=32;
 const metadata={format:'rv360-shared-catalog',configured,requiresPublishKey:true};
 if(!['GET','PUT'].includes(method))return {status:405,body:{error:'Método no admitido.'}};
 if(!configured)return {status:method==='GET'?200:503,body:{...metadata,publications:[],error:'Falta configurar el almacén privado Vercel Blob y DESIGN_PUBLISH_KEY en Vercel.'}};
 if(method==='PUT'){
 const hash=(s:string)=>createHash('sha256').update(s).digest();
 if(!key||!timingSafeEqual(hash(key),hash(env.DESIGN_PUBLISH_KEY!)))return {status:401,body:{error:'Introduce la clave de publicación del administrador.'}};
 if(Buffer.byteLength(JSON.stringify(body)??'')>4*1024*1024)return {status:413,body:{error:'La publicación supera 4 MB.'}};
 try{validateTestPublication(body);}catch(e){return {status:400,body:{error:(e as Error).message}};}
 }
 try{
 for(let attempt=0;attempt<4;attempt++){
 const {data,etag}=await storage.read();
 if(data.format!=='rv360-shared-catalog'||!Array.isArray(data.publications))throw Error('Invalid catalog');
 if(method==='GET')return {status:200,body:{...data,...metadata}};
 const prior=data.publications.find((p:any)=>p.source===body.source);
 if(prior&&Date.parse(prior.createdAt)>Date.parse(body.createdAt))return {status:409,body:{error:'Existe una publicación más reciente. Actualiza antes de publicar.'}};
 const packet={format:body.format,version:body.version,source:body.source,createdAt:body.createdAt,tests:body.tests,...(body.version===2?{simulators:body.simulators}:{})};
 const next={...empty(),publications:[...data.publications.filter((p:any)=>p.source!==body.source),packet]};
 if(Buffer.byteLength(JSON.stringify(next))>4*1024*1024)return {status:413,body:{error:'El catálogo de pruebas supera 4 MB.'}};
 try{await storage.write(next,etag);return {status:200,body:{ok:true}};}catch(e){
 // Retry an ETag conflict or an initial-create race, but never overwrite blindly.
 if(attempt===3||(!(e instanceof BlobPreconditionFailedError)&&etag))throw e;
 }
 }
 }catch{return {status:503,body:{error:'No se pudo acceder al catálogo compartido. Comprueba Vercel Blob y vuelve a intentar.'}};}
 return {status:409,body:{error:'El catálogo cambió. Vuelve a intentar.'}};
 };
}
